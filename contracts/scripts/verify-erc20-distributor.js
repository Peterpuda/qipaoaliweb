// 验证 ERC20 Merkle Distributor 合约
const { run } = require("hardhat");

async function main() {
  // 从部署信息文件读取
  const fs = require('fs');
  const deployInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  
  console.log("🔍 开始验证合约...");
  console.log("合约地址:", deployInfo.distributor);
  
  try {
    await run("verify:verify", {
      address: deployInfo.distributor,
      constructorArguments: [
        deployInfo.token,
        deployInfo.merkleRoot
      ]
    });
    
    console.log("✅ 合约验证成功！");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ 合约已验证");
    } else {
      console.error("❌ 验证失败:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

