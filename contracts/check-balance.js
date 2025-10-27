const { ethers } = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = "0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa";
  const DISTRIBUTOR_ADDRESS = "0xb763A90039cc09CcbDcfF3feb28378fFF07B9c6C";
  
  console.log("🔍 检查合约代币余额...\n");
  
  // 获取 ERC20 代币合约
  const token = await ethers.getContractAt(
    "IERC20",
    TOKEN_ADDRESS
  );
  
  // 查询余额
  const balance = await token.balanceOf(DISTRIBUTOR_ADDRESS);
  const formattedBalance = ethers.formatUnits(balance, 18);
  
  console.log("✅ 查询结果：");
  console.log("合约地址:", DISTRIBUTOR_ADDRESS);
  console.log("代币余额:", formattedBalance, "tokens");
  console.log("Wei 数量:", balance.toString());
  
  const requiredTokens = 300000;
  if (parseFloat(formattedBalance) >= requiredTokens) {
    console.log("\n🎉 余额充足！可以开始领取代币！");
    console.log(`需要: ${requiredTokens} tokens`);
    console.log(`实际: ${formattedBalance} tokens`);
  } else {
    console.log("\n⚠️ 余额不足！");
    console.log(`需要: ${requiredTokens} tokens`);
    console.log(`实际: ${formattedBalance} tokens`);
    console.log(`还需: ${requiredTokens - parseFloat(formattedBalance)} tokens`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
