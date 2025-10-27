const hre = require("hardhat");
require('dotenv').config();

async function main() {
  const addr = process.env.CONTRACT_ADDR;
  const root = process.env.MERKLE_ROOT || "0x" + "00".repeat(32);
  if (!addr) throw new Error("Please set CONTRACT_ADDR in env");
  await hre.run("verify:verify", {
    address: addr,
    constructorArguments: [root]
  });
  console.log("Verify submitted for:", addr);
}
main().catch((e)=>{ console.error(e); process.exit(1); });