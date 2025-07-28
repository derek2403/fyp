require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ReviewContract to Base Sepolia…");

  // 1. Compile & get your factory
  const Factory = await ethers.getContractFactory("ReviewContract");

  // 2. Deploy (sends the tx)
  const reviewContract = await Factory.deploy();

  // 3. Wait for it to be mined
  await reviewContract.waitForDeployment();

  // 4. Fetch the on-chain address
  const address = await reviewContract.getAddress();
  console.log("✅ Deployed at address:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});