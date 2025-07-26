import { ethers } from "ethers";
import { Console } from "node:console";
import { env } from "node:process";
import Dummy from "..//artifacts/contracts/Dummy.sol/Dummy.json";

const Contract_Address = process.env.CONTRACT_ADDRESS || "";

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

async function run() {
  if (!(await hasAccounts()) && !(await requestAccounts())) {
    throw new Error("No metamask accounts found!");
  }

  const provider = new ethers.BrowserProvider(getEth());
  const signer = await provider.getSigner();
  const Hello = new ethers.Contract(Contract_Address, Dummy.abi, signer);
  console.log("Contract Address: ", Contract_Address);
  const network = await provider.getNetwork();
  console.log("Network:", network);
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
  });

  Hello.on(Hello.filters.Inc(), (caller: string, newCount: bigint) => {
    setCounter(newCount.toString());
  });
  document.body.appendChild(el);
  document.body.appendChild(button);
}
run();
