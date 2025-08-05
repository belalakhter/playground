import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";

async function deploy() {
  const DummyFactory = await ethers.getContractFactory("Dummy");
    const dummy = await DummyFactory.deploy();
    await dummy.waitForDeployment();
    console.log("Dummy contract deployed at:", await dummy.getAddress());
    return dummy;
}

//@ts-ignore
async function getCount(contract) {
  try {
    const count = await contract.getCount();
    console.log("Count:", count.toString());
  } catch (err) {
    console.error("Failed to call getCount():", err);
  }
}

deploy().then(getCount).catch(console.error);
