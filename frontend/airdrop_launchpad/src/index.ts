import { ethers } from "ethers";
import { Console } from "node:console";
import { env } from "node:process";
import Dummy from "..//artifacts/contracts/Dummy.sol/Dummy.json";

const Contract_Address = process.env.CONTRACT_ADDRESS || "0xab525E70C62563312aa53b9A6550542325a855b4";

function getEth() {
  // @ts-ignore
  const eth = window.ethereum;
  return eth;
}

async function hasAccounts() {
  const eth = getEth();
  const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
  return accounts && accounts.length;
}

async function requestAccounts() {
  const eth = getEth();
  const accounts = (await eth.request({
    method: "eth_requestAccounts",
  })) as string[];
  return accounts && accounts.length;
}
function appendToBody(message: string) {
  const p = document.createElement("p");
  p.textContent = message;
  document.body.appendChild(p);
}

async function ensureSepolia() {
  // @ts-ignore
  const eth = window.ethereum;
  const sepoliaChainId = "0xaa36a7";
  const currentChainId = await eth.request({ method: "eth_chainId" });

  if (currentChainId !== sepoliaChainId) {
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: sepoliaChainId }],
      });
    } catch (err: any) {
      throw new Error("❌ Please switch MetaMask to Sepolia Testnet.");
    }
  }
}
async function run() {
  if (!(await hasAccounts()) && !(await requestAccounts())) {
    throw new Error("No metamask accounts found!");
  }
  await ensureSepolia();
  const provider = new ethers.BrowserProvider(getEth());
  const signer = await provider.getSigner();
  const Hello = new ethers.Contract(Contract_Address, Dummy.abi, signer);
  console.log("Contract Address: ", Contract_Address);
  const network = await provider.getNetwork();
  if ((await provider.getNetwork()).chainId !== 11155111n) {
    throw new Error("Please switch MetaMask to Sepolia testnet.");
  }
  const el = document.createElement("div");
  //@ts-ignore
  async function setCounter(count?) {
    const GetCount = await Hello.getCount();
    el.innerHTML = count || GetCount.toString();
  }
  setCounter();
  const button = document.createElement("button");
  button.innerText = "Add Count";
  button.addEventListener("click", async () => {
    const tx = await Hello.addCount();
    await tx.wait();
    setCounter();
  });

  Hello.on(Hello.filters.Inc(), (caller: string, newCount: bigint) => {
    setCounter(newCount.toString());
  });
  document.body.appendChild(el);
  document.body.appendChild(button);
}
run();
