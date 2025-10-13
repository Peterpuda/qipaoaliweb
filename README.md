# POAP / 签到 一键打包（前后端）

本包提供：
- ERC-1155 合约（EIP-712 离线签名授权）：`Poap1155WithSig.sol`
- Hardhat 部署脚本：`scripts/deploy.js`
- 前端签到页：`frontend/index.html`（输入签到码 → 后端校验 → 返回签名 → 前端 mint）
- Cloudflare Worker（Hono）后端：动态签到码生成与校验、签名下发
- D1 SQL：事件表、动态码、签到记录、审计日志

## 快速开始

### 1) 合约部署（Base Sepolia）
```bash
npm i
npx hardhat compile
cp .env.example .env   # 填 PRIVATE_KEY
npm run deploy
# 记录合约地址，填回 .env 的 POAP_CONTRACT
```

### 2) Worker 本地调试 / 部署
```bash
# 填 .env 的 ADMIN_PRIVATE_KEY（用于离线签名）
# 启动本地：
npx wrangler dev worker/index.ts

# 部署：
npx wrangler deploy worker/index.ts
```

### 3) 前端签到
- 打开 `frontend/index.html`
- 选择活动（示例ID：20251208）、输入签到码、连接钱包 → 点击「领取POAP」
- 正常情况下 3~5 秒完成

## 安全说明
- 生产环境请将签名服务隔离，增加频控/风控（同 IP 次数限制、黑名单、阈值报警）
- 建议把 `ADMIN_PRIVATE_KEY` 设为**仅能签发 POAP**的钱包（热钱包小额），财库使用 Safe 多签

