import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";

async function deploy() {
  const DummyContract = ethers.getContractFactory("Dummy");
  const deployed = (await DummyContract).deploy();
  return deployed;
}

//@ts-ignore
async function sayHello(deployed) {
  console.log("say Hello:", await deployed.hello());
}

deploy().then(sayHello);
