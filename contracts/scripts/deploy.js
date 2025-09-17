require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ProReviewerBadge to Base Sepolia…");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Factory = await ethers.getContractFactory("ProReviewerBadge");

  const badgeContract = await Factory.deploy(deployer.address);
  await badgeContract.waitForDeployment();

  const address = await badgeContract.getAddress();
  console.log("✅ ProReviewerBadge deployed at:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
