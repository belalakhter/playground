import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("dummy test", function () {
  it("should print something", async function () {
    const Dummy = await ethers.getContractFactory("Dummy");
    const dummy = await Dummy.deploy();
    const tx = await dummy.getCount();
    expect(tx == BigInt(0)).to.be.true;
  });
});
