import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";

async function deploy() {
  const DummyContract = ethers.getContractFactory("Dummy");
  const deployed = (await DummyContract).deploy();
  return deployed;
}

//@ts-ignore
async function getCount(deployed) {
  console.log("Count: ", await deployed.getCount());
}

deploy().then(getCount);
