const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署 SimpleAirdrop 合约到 Base Sepolia...\n");
  
  // 配置参数
  const tokenAddress = "0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa";  // 你的测试代币地址
  const amountPerClaim = hre.ethers.parseEther("1000");  // 每次领取 1000 个代币
  const eventId = hre.ethers.id("airdrop-2026");  // 活动 ID 的哈希
  
  // 获取部署者地址作为签名者
  const [deployer] = await hre.ethers.getSigners();
  const signerAddress = deployer.address;
  
  console.log("📋 部署配置:");
  console.log("  - 代币合约:", tokenAddress);
  console.log("  - 每次领取:", hre.ethers.formatEther(amountPerClaim), "tokens");
  console.log("  - 活动 ID:", eventId);
  console.log("  - 签名者地址:", signerAddress);
  console.log("  - 部署者地址:", deployer.address);
  console.log("  - 网络: Base Sepolia (Chain ID: 84532)\n");
  
  // 部署合约
  console.log("⏳ 正在部署合约...");
  const SimpleAirdrop = await hre.ethers.getContractFactory("SimpleAirdrop");
  const airdrop = await SimpleAirdrop.deploy(
    tokenAddress,
    amountPerClaim,
    eventId,
    signerAddress
  );
  
  await airdrop.waitForDeployment();
  const address = await airdrop.getAddress();
  
  console.log("✅ 合约部署成功！\n");
  console.log("📍 合约地址:", address);
  console.log("🔗 区块浏览器:", `https://sepolia.basescan.org/address/${address}`);
  
  console.log("\n" + "=".repeat(60));
  console.log("📝 下一步操作:");
  console.log("=".repeat(60));
  
  console.log("\n1️⃣  转账代币到合约");
  console.log("   合约地址:", address);
  console.log("   建议数量: 10,000,000 个代币 (支持 10,000 人领取)");
  console.log("   命令示例:");
  console.log(`   npx hardhat run scripts/transfer-tokens.js --network baseSepolia`);
  
  console.log("\n2️⃣  配置后端环境变量");
  console.log("   在 Cloudflare Workers 中添加:");
  console.log("   - AIRDROP_CONTRACT:", address);
  console.log("   - SIGNER_PRIVATE_KEY:", "你的私钥（用于签名）");
  
  console.log("\n3️⃣  更新前端配置");
  console.log("   修改 frontend/poap.config.js:");
  console.log("   DISTRIBUTOR_CONTRACT:", `"${address}"`);
  
  console.log("\n4️⃣  验证合约（可选）");
  console.log("   命令:");
  console.log(`   npx hardhat verify --network baseSepolia ${address} "${tokenAddress}" "${amountPerClaim}" "${eventId}" "${signerAddress}"`);
  
  console.log("\n" + "=".repeat(60));
  console.log("✨ 部署完成！");
  console.log("=".repeat(60) + "\n");
  
  // 保存部署信息到文件
  const fs = require('fs');
  const deployInfo = {
    network: "Base Sepolia",
    chainId: 84532,
    contractAddress: address,
    tokenAddress: tokenAddress,
    amountPerClaim: amountPerClaim.toString(),
    eventId: eventId,
    signerAddress: signerAddress,
    deployedAt: new Date().toISOString(),
    explorerUrl: `https://sepolia.basescan.org/address/${address}`
  };
  
  fs.writeFileSync(
    'deployment-simple-airdrop.json',
    JSON.stringify(deployInfo, null, 2)
  );
  console.log("💾 部署信息已保存到: deployment-simple-airdrop.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exitCode = 1;
  });

