const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Poap = await hre.ethers.getContractFactory("Poap1155WithSig");
  const poap = await Poap.deploy();
  await poap.waitForDeployment();
  console.log("Poap1155WithSig:", await poap.getAddress());

  // 示例：设置活动ID=20251208 的元数据 URI
  const tx = await poap.setURI(20251208, "ipfs://your-poap-metadata-cid");
  await tx.wait();
  console.log("URI set for event 20251208");
}

main().catch((e)=>{ console.error(e); process.exit(1); });
