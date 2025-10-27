const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const root = process.env.MERKLE_ROOT || "0x" + "00".repeat(32);
  const Distributor = await hre.ethers.getContractFactory("Sha256MerkleDistributor");
  // 预存少量原生币用于演示（领取时合约支付）
  const c = await Distributor.deploy(root, { value: hre.ethers.parseEther("0.05") });
  await c.waitForDeployment();
  console.log("Distributor:", await c.getAddress());
  console.log("Root:", root);
}

main().catch((e)=>{ console.error(e); process.exit(1); });