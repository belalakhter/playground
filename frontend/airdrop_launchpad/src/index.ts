import { ethers } from "ethers";
import TokenJson from "../artifacts/contracts/Token.sol/AirdropToken.json";

const countdownEl = document.getElementById("countdown")!;
const connectWalletBtn = document.getElementById("connectWallet")!;
const buyBtn = document.getElementById("buyBtn")!;
const buyAmountInput = document.getElementById("buyAmount") as HTMLInputElement;
const bannerImage = document.getElementById("bannerImage") as HTMLImageElement | null;
const remainingEl = document.getElementById("remainingTokens");
const userBalanceEl = document.getElementById("userBalance");

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
let tokenContract: ethers.Contract | null = null;
let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;


if (bannerImage) {
  bannerImage.src = process.env.IMAGE_URL || "https://placehold.co/1200x300";
}


const endTime = parseInt(process.env.END_TIME || "0", 10) || Date.now() + 2 * 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  const diff = endTime - now;

  if (diff <= 0) {
    countdownEl.textContent = "Airdrop Ended";
    return;
  }

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  countdownEl.textContent = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}, 1000);


connectWalletBtn.addEventListener("click", async () => {
  try {
    if (!(window as any).ethereum) return alert("MetaMask not found!");

    const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];

    provider = new ethers.BrowserProvider((window as any).ethereum);
    signer = await provider.getSigner();

    tokenContract = new ethers.Contract(CONTRACT_ADDRESS, TokenJson.abi, signer);

    await updateTokenMetrics(account);

    alert("Wallet connected: " + account);
  } catch (err: any) {
    console.error("Wallet connection error:", err);
    alert("Failed to connect wallet: " + err.message);
  }
});



buyBtn.addEventListener("click", async () => {
  if (!signer || !tokenContract) return alert("Please connect wallet first.");

  const amount = BigInt(buyAmountInput.value);
  if (amount <= 0n) return alert("Enter a valid amount");

  try {
    const pricePerToken = await tokenContract.tokenPrice();
    const totalCost = pricePerToken * amount;

    const tx = await tokenContract.buyTokens(amount, { value: totalCost });
    await tx.wait();

    const userAddress = await signer.getAddress();
    await updateTokenMetrics(userAddress);

    alert(`Successfully bought ${amount} tokens!`);
  } catch (err) {
    console.error(err);
    alert("Failed to buy tokens");
  }
});


const readProvider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
const tokenContractReadOnly = new ethers.Contract(CONTRACT_ADDRESS, TokenJson.abi, readProvider);


async function updateTokenMetrics(userAddress?: string) {
  if (!tokenContractReadOnly) return;


  const remaining = await tokenContractReadOnly.remainingTokens();
  if (remainingEl) remainingEl.innerHTML = `Remaining Tokens: <span class="font-mono">${remaining}</span>`;


  if (userAddress && userBalanceEl) {
    const balance = await tokenContractReadOnly.balanceOf(userAddress);
    userBalanceEl.innerHTML = `Your Balance: <span class="font-mono">${balance}</span>`;
  }
}


updateTokenMetrics();
