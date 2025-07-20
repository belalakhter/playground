import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("dummy test", function () {
  it("should print something", async function () {
    const Dummy = await ethers.getContractFactory("Dummy");
    const dummy = await Dummy.deploy();
    expect(await dummy.hello()).to.equal("Hello");
  });
});
