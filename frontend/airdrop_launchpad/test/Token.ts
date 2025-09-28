import { expect } from "chai";
import { ethers } from "hardhat";

describe("AirdropToken", function () {
  const NAME = "DropRewards";
  const SYMBOL = "DROP";
  const SUPPLY = 1000n;
  const PRICE = ethers.parseEther("0.001");

  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("AirdropToken");
    const token = await Token.deploy(NAME, SYMBOL, SUPPLY, PRICE);
    await token.waitForDeployment();
    return token;
  }

  it("should deploy with correct name and symbol", async function () {
    const token = await deployTokenFixture();
    expect(await token.name()).to.equal(NAME);
    expect(await token.symbol()).to.equal(SYMBOL);
  });

  it("should mint total supply to contract itself", async function () {
    const token = await deployTokenFixture();
    const totalSupply = await token.totalSupply();
    const contractBalance = await token.balanceOf(await token.getAddress());
    expect(contractBalance).to.equal(totalSupply);
  });

  it("should let user buy tokens", async function () {
    const [owner, user] = await ethers.getSigners();
    const token = await deployTokenFixture();

    const amount = 10n;
    const cost = amount * PRICE;

    await token.connect(user).buyTokens(amount, { value: cost });

    const userBalance = await token.balanceOf(user.address);
    expect(userBalance).to.equal(amount);

    const remaining = await token.remainingTokens();
    expect(remaining).to.equal(SUPPLY - amount);
  });

  it("should fail if user sends insufficient ETH", async function () {
    const [owner, user] = await ethers.getSigners();
    const token = await deployTokenFixture();

    const amount = 5n;
    const cost = amount * PRICE;

    await expect(
      token.connect(user).buyTokens(amount, { value: cost - 1n })
    ).to.be.revertedWith("Insufficient ETH sent");
  });

  it("should allow owner to withdraw ETH", async function () {
    const [owner, user] = await ethers.getSigners();
    const token = await deployTokenFixture();

    const amount = 20n;
    const cost = amount * PRICE;

    await token.connect(user).buyTokens(amount, { value: cost });

    const balanceBefore = await ethers.provider.getBalance(owner.address);
    const tx = await token.connect(owner).withdrawETH();
    await tx.wait();

    const balanceAfter = await ethers.provider.getBalance(owner.address);
    expect(balanceAfter).to.be.greaterThan(balanceBefore);
  });
});
