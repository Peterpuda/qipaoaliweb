require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const { RPC_URL, PK } = process.env;

module.exports = {
  solidity: {
    // 同时支持 0.8.24 和 0.8.20
    compilers: [
      { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
      { version: "0.8.20", settings: { optimizer: { enabled: true, runs: 200 } } }
    ],
    // 指定每个文件使用哪个编译器（可选但更稳）
    overrides: {
      "contracts/Poap1155WithSig.sol": {
        version: "0.8.24",
        settings: { optimizer: { enabled: true, runs: 200 } }
      },
      "contracts/Sha256MerkleDistributor.sol": {
        version: "0.8.20",
        settings: { optimizer: { enabled: true, runs: 200 } }
      },
      "contracts/ERC20MerkleDistributor.sol": {
        version: "0.8.20",
        settings: { optimizer: { enabled: true, runs: 200 } }
      }
    }
  },
  networks: {
    baseSepolia: {
      url: RPC_URL || "https://sepolia.base.org",
      accounts: PK ? [PK] : [],
      chainId: 84532
    }
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_KEY || ""
    }
  }
};