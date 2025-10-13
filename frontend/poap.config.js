// 前端配置：把这里改成你的 Worker 地址（结尾不要带斜杠）
// 例：'http://localhost:8787' 或 'https://poap-checkin-worker.yourname.workers.dev'
window.POAP_CONFIG = {
  WORKER_BASE_URL: "https://poap-checkin-worker.petterbrand03.workers.dev"
};
// 前端配置：把这里改成你的 Worker 地址（结尾不要带斜杠）
window.POAP_CONFIG = {
  WORKER_BASE_URL: "https://poap-checkin-worker.petterbrand03.workers.dev",
  // 可选：如果你想支持 WalletConnect，请到 https://cloud.walletconnect.com 申请 projectId
  WALLETCONNECT_PROJECT_ID: ""   // 例如 "abc123..."，留空则不显示“WalletConnect (QR)”
};
