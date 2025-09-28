import { ethers } from "hardhat";

async function main() {
  const NAME = process.env.TOKEN_NAME || "DropRewards";
  const SYMBOL = process.env.TOKEN_SYMBOL || "DROP";
  const SUPPLY = parseInt(process.env.TOTAL_SUPPLY || "1000000", 10);
  const PRICE = BigInt(process.env.TOKEN_PRICE || "1000000000000000");

  const TokenFactory = await ethers.getContractFactory("AirdropToken");
  const token = await TokenFactory.deploy(NAME, SYMBOL, SUPPLY, PRICE);
  await token.waitForDeployment();

  console.log("AirdropToken deployed at:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
