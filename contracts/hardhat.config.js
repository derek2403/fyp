require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");  // includes hardhat-ethers for Ethers v6

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
