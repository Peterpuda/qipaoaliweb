const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("💰 开始转账代币到 SimpleAirdrop 合约...\n");
  
  // 读取部署信息
  let deployInfo;
  try {
    deployInfo = JSON.parse(fs.readFileSync('deployment-simple-airdrop.json', 'utf8'));
  } catch (error) {
    console.error("❌ 无法读取部署信息文件 deployment-simple-airdrop.json");
    console.error("   请先运行: npx hardhat run scripts/deploy-simple-airdrop.js --network baseSepolia");
    process.exit(1);
  }
  
  const tokenAddress = deployInfo.tokenAddress;
  const airdropAddress = deployInfo.contractAddress;
  const amount = hre.ethers.parseEther("10000000");  // 10,000,000 tokens
  
  console.log("📋 转账配置:");
  console.log("  - 代币合约:", tokenAddress);
  console.log("  - 目标合约:", airdropAddress);
  console.log("  - 转账数量:", hre.ethers.formatEther(amount), "tokens");
  console.log("  - 网络: Base Sepolia\n");
  
  // 获取代币合约
  const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];
  
  const [signer] = await hre.ethers.getSigners();
  const token = new hre.ethers.Contract(tokenAddress, ERC20_ABI, signer);
  
  // 检查余额
  console.log("⏳ 检查余额...");
  const balance = await token.balanceOf(signer.address);
  const symbol = await token.symbol();
  
  console.log(`  - 您的余额: ${hre.ethers.formatEther(balance)} ${symbol}`);
  
  if (balance < amount) {
    console.error(`\n❌ 余额不足！`);
    console.error(`   需要: ${hre.ethers.formatEther(amount)} ${symbol}`);
    console.error(`   当前: ${hre.ethers.formatEther(balance)} ${symbol}`);
    process.exit(1);
  }
  
  // 转账
  console.log("\n⏳ 正在转账...");
  const tx = await token.transfer(airdropAddress, amount);
  console.log("  - 交易哈希:", tx.hash);
  console.log("  - 等待确认...");
  
  const receipt = await tx.wait();
  console.log("  - 区块高度:", receipt.blockNumber);
  
  // 验证转账
  console.log("\n⏳ 验证转账...");
  const contractBalance = await token.balanceOf(airdropAddress);
  console.log(`  - 合约余额: ${hre.ethers.formatEther(contractBalance)} ${symbol}`);
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ 转账成功！");
  console.log("=".repeat(60));
  console.log(`\n💰 合约现在有 ${hre.ethers.formatEther(contractBalance)} ${symbol}`);
  console.log(`📊 可支持 ${Math.floor(Number(hre.ethers.formatEther(contractBalance)) / 1000)} 人领取\n`);
  console.log("🔗 查看交易:", `https://sepolia.basescan.org/tx/${tx.hash}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 转账失败:", error);
    process.exitCode = 1;
  });

