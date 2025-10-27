// 部署 ERC20 Merkle Distributor 合约
const { ethers } = require("hardhat");

async function main() {
  // 配置参数
  const TOKEN_ADDRESS = "0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa"; // 您的代币合约地址
  const MERKLE_ROOT = process.env.MERKLE_ROOT || "0x0000000000000000000000000000000000000000000000000000000000000000";
  
  console.log("🚀 开始部署 ERC20MerkleDistributor 合约...");
  console.log("代币合约地址:", TOKEN_ADDRESS);
  console.log("Merkle Root:", MERKLE_ROOT);
  
  if (MERKLE_ROOT === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    console.warn("⚠️  警告：使用默认 Merkle Root，请先生成真实的 Merkle Tree！");
  }
  
  // 获取部署者
  const [deployer] = await ethers.getSigners();
  console.log("部署者地址:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("部署者余额:", ethers.formatEther(balance), "ETH");
  
  // 部署合约
  const ERC20MerkleDistributor = await ethers.getContractFactory("ERC20MerkleDistributor");
  const distributor = await ERC20MerkleDistributor.deploy(TOKEN_ADDRESS, MERKLE_ROOT);
  
  await distributor.waitForDeployment();
  const distributorAddress = await distributor.getAddress();
  
  console.log("\n✅ 部署成功！");
  console.log("合约地址:", distributorAddress);
  console.log("代币地址:", TOKEN_ADDRESS);
  console.log("Merkle Root:", MERKLE_ROOT);
  
  console.log("\n📋 下一步操作：");
  console.log("1. 向合约地址转入足够的代币:");
  console.log(`   代币数量 = 签到人数 × 1000 × 10^decimals`);
  console.log(`   合约地址: ${distributorAddress}`);
  console.log("");
  console.log("2. 在 Base Sepolia 区块链浏览器验证合约:");
  console.log(`   https://sepolia.basescan.org/address/${distributorAddress}#code`);
  console.log("");
  console.log("3. 告知用户合约地址，用户即可领取代币");
  
  // 保存部署信息
  const deployInfo = {
    network: "base-sepolia",
    distributor: distributorAddress,
    token: TOKEN_ADDRESS,
    merkleRoot: MERKLE_ROOT,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deployInfo, null, 2)
  );
  
  console.log("\n💾 部署信息已保存到 deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

