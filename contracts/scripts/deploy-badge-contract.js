// 部署 Poap1155WithSig 徽章合约
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 开始部署 Poap1155WithSig 徽章合约...\n");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  
  // 检查余额
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("\n❌ 错误: 账户余额为 0，无法部署合约");
    console.log("💡 请先获取测试 ETH: https://www.alchemy.com/faucets/base-sepolia");
    process.exit(1);
  }

  // 部署合约
  console.log("\n⏳ 正在部署合约...");
  const Poap1155WithSig = await hre.ethers.getContractFactory("Poap1155WithSig");
  const badge = await Poap1155WithSig.deploy();
  
  await badge.waitForDeployment();
  const contractAddress = await badge.getAddress();
  
  console.log("\n✅ 合约部署成功！");
  console.log("📍 合约地址:", contractAddress);
  console.log("👤 合约 Owner:", deployer.address);
  console.log("🔗 区块链浏览器:", `https://sepolia.basescan.org/address/${contractAddress}`);

  // 保存部署信息
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    contractName: "Poap1155WithSig",
    ownerAddress: deployer.address,
    deployedAt: new Date().toISOString(),
    explorerUrl: `https://sepolia.basescan.org/address/${contractAddress}`
  };

  const deploymentPath = path.join(__dirname, "../deployment-badge-contract.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 部署信息已保存到:", deploymentPath);

  // 生成配置说明
  console.log("\n" + "=".repeat(70));
  console.log("📋 下一步操作：");
  console.log("=".repeat(70));
  console.log("\n1️⃣  更新前端配置文件：");
  console.log("   编辑 frontend/poap.config.js");
  console.log("   将 BADGE_CONTRACT 设置为:");
  console.log(`   BADGE_CONTRACT: "${contractAddress}"`);
  
  console.log("\n2️⃣  在商品管理页面使用：");
  console.log("   访问: /admin/products.html");
  console.log("   点击「自动填充默认合约」按钮");
  console.log("   或手动填入合约地址");
  
  console.log("\n3️⃣  配置后端签名密钥（如果还没配置）：");
  console.log("   cd worker-api");
  console.log("   npx wrangler secret put ADMIN_PRIVATE_KEY");
  console.log("   输入部署账户的私钥（用于签名徽章）");
  
  console.log("\n4️⃣  测试徽章功能：");
  console.log("   - 创建一个商品并填入徽章合约地址");
  console.log("   - 完成一次购买");
  console.log("   - 在订单页面领取徽章");
  
  console.log("\n" + "=".repeat(70));
  console.log("✨ 部署完成！");
  console.log("=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ 部署失败:", error);
    process.exit(1);
  });

