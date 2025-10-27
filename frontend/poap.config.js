// frontend/poap.config.js
// 注意：这是前端读取后端 Worker 的“唯一配置文件”，必须能从站点根路径加载：/poap.config.js

window.POAP_CONFIG = {
  // 后端 API 根地址（你的 Cloudflare Worker 域名，HTTPS，末尾不要带 /）
  WORKER_BASE_URL: "https://songbrocade-api.petterbrand03.workers.dev",

  // 链路配置（Base Sepolia）
  CHAIN_ID_HEX: "0x14A34",
  RPC_URL: "https://sepolia.base.org",
  EXPLORER: "https://sepolia.basescan.org",

  // 可选的前端预填（不写也行）
  DEFAULT_EVENT_ID: "",
  DEFAULT_POAP_CONTRACT: "",
  
  // ERC20 Merkle Distributor 合约地址（管理员部署后填入）
  DISTRIBUTOR_CONTRACT: "", // 例如: "0x..."
};