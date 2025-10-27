# 📋 合约部署信息

## ✅ Merkle Tree 生成成功

- **活动 ID**: 25
- **Merkle Root**: `0x23dd5b29cc5e5026b11a9ba706e6c6e8ca810245fa285ac17e2960d1ba4d03ff`
- **总地址数**: 300 人
- **总代币量**: 3000000000000000000000 wei (3000 个代币)
- **每人领取**: 1000 个代币

## 🚀 部署合约步骤

### 步骤 1：配置环境变量

已创建 `contracts/.env` 文件，包含：

```env
MERKLE_ROOT=0x23dd5b29cc5e5026b11a9ba706e6c6e8ca810245fa285ac17e2960d1ba4d03ff
TOKEN_ADDRESS=0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa
```

⚠️ **重要**：你需要手动编辑这个文件，填入：
1. `PRIVATE_KEY` - 你的钱包私钥（用于部署合约）
2. `BASESCAN_API_KEY` - （可选）用于验证合约

### 步骤 2：准备部署

确保你的钱包有足够的 Base Sepolia 测试 ETH：

```bash
# 检查余额
cd contracts
npx hardhat run scripts/deploy-erc20-distributor.js --network base-sepolia --dry-run
```

如果没有测试 ETH，可以从水龙头获取：
- Base Sepolia Faucet: https://www.alchemy.com/faucets/base-sepolia

### 步骤 3：部署合约

```bash
cd contracts

# 安装依赖（如果还没安装）
npm install

# 部署合约
npx hardhat run scripts/deploy-erc20-distributor.js --network base-sepolia
```

### 步骤 4：转入代币

部署成功后，你会看到合约地址，例如：`0xABC123...`

然后需要将 **3000 个代币**（或更多）转入合约地址：

```
目标地址: 0xABC123...（部署的 Distributor 合约地址）
代币合约: 0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa
数量: 3000000000000000000000 wei (3000 tokens)
```

使用 MetaMask 或其他钱包转账即可。

### 步骤 5：配置前端

编辑 `frontend/poap.config.js`：

```javascript
window.POAP_CONFIG = {
  WORKER_BASE_URL: "https://songbrocade-api.petterbrand03.workers.dev",
  CHAIN_ID_HEX: "0x14A34",
  RPC_URL: "https://sepolia.base.org",
  EXPLORER: "https://sepolia.basescan.org",
  
  // ⭐ 填入部署的合约地址
  DISTRIBUTOR_CONTRACT: "0xABC123...", // 替换为实际地址
};
```

### 步骤 6：重新部署前端

```bash
cd frontend
npx wrangler pages deploy . --project-name=songbrocade-frontend --branch prod
```

或等待 Cloudflare Pages 自动部署（如果连接了 GitHub）。

### 步骤 7：测试

1. 访问签到页面：https://songbrocade-frontend.pages.dev/checkin/?event=airdrop-2025&code=airdrop-2025
2. 连接钱包
3. 点击"铭刻我的到场"完成签到
4. 点击"🎁 领取 1000 枚代币"
5. 确认交易
6. 检查钱包是否收到代币

## 📊 合约信息

### 合约功能

- **领取代币**: 用户提供 Merkle Proof 即可领取
- **防重复领取**: 使用 bitmap 记录已领取状态
- **提取剩余**: 活动结束后 owner 可提取剩余代币

### 合约 ABI（供前端调用）

```json
[
  {
    "inputs": [
      {"internalType": "address", "name": "token_", "type": "address"},
      {"internalType": "bytes32", "name": "merkleRoot_", "type": "bytes32"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "merkleRoot",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "isClaimed",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "index", "type": "uint256"},
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "bytes32[]", "name": "merkleProof", "type": "bytes32[]"}
    ],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

## 🔍 验证合约（可选）

部署完成后，可以在 Basescan 上验证合约：

```bash
cd contracts
npx hardhat verify --network base-sepolia <合约地址> "0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa" "0x23dd5b29cc5e5026b11a9ba706e6c6e8ca810245fa285ac17e2960d1ba4d03ff"
```

或使用脚本：

```bash
npx hardhat run scripts/verify-erc20-distributor.js --network base-sepolia
```

## 📝 重要提示

1. **私钥安全**: 永远不要提交 `.env` 文件到 Git
2. **代币余额**: 确保合约有足够代币（至少 3000 个）
3. **测试网**: 这是 Base Sepolia 测试网，代币无实际价值
4. **Gas 费用**: 用户领取时需要支付少量 Gas（测试 ETH）

## 🎯 完整流程回顾

```
✅ 1. 生成 Merkle Tree (已完成)
   └─ Merkle Root: 0x23dd5b29...

⏳ 2. 配置 .env 文件
   └─ 填入私钥和 Merkle Root

⏳ 3. 部署合约
   └─ npx hardhat run scripts/deploy-erc20-distributor.js

⏳ 4. 转入 3000 个代币到合约

⏳ 5. 配置前端合约地址

⏳ 6. 用户可以领取代币
```

---

**生成时间**: 2025-10-27  
**活动**: airdrop-2025 (ID: 25)  
**代币**: Base Sepolia 测试代币

