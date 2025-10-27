# ⚡ 快速部署指南 - 1000枚代币空投

## 🎯 目标

用户签到后可以领取 **1000 枚**您的测试代币（0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa）

## 📝 3步部署

### 步骤 1：生成 Merkle Tree

访问管理后台生成 Merkle Tree：

```
https://songbrocade-frontend.pages.dev/admin/merkle.html
```

操作：
1. 输入活动 ID：`24`（或您的活动 ID）
2. 点击「生成 Merkle Tree」
3. **记录返回的 Merkle Root**（例如：`0xabc123...`）

### 步骤 2：部署合约

```bash
cd contracts

# 配置环境变量
echo "PRIVATE_KEY=你的私钥" > .env
echo "MERKLE_ROOT=步骤1获取的root" >> .env
echo "TOKEN_ADDRESS=0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa" >> .env
echo "RPC_URL=https://sepolia.base.org" >> .env

# 一键部署
bash ../DEPLOY_TOKEN_DISTRIBUTOR.sh
```

或手动执行：

```bash
npm install
npx hardhat compile
npx hardhat run scripts/deploy-erc20-distributor.js --network baseSepolia
```

**记录合约地址**（显示在终端输出中）

### 步骤 3：转入代币

向合约转入代币：

```
数量 = 签到人数 × 1000

例如：5人签到 = 5000 枚代币
```

**转账方式**：
- 使用 MetaMask 连接 Base Sepolia
- 发送代币到合约地址
- 或使用脚本转账

## ✅ 完成

现在用户可以：
1. 访问：https://songbrocade-frontend.pages.dev/claim/
2. 输入批次号（活动ID）和合约地址
3. 连接钱包
4. 领取 1000 枚代币 🎉

## 📊 已修改的代码

### 后端 API（已修改 ✅）
```javascript
// worker-api/index.js
const AIRDROP_AMOUNT = "1000000000000000000000"; // 1000 tokens
```

### 智能合约（已创建 ✅）
```solidity
// contracts/contracts/ERC20MerkleDistributor.sol
- 使用 Merkle Tree 验证
- 分发 ERC20 代币
- 防重复领取
```

### 前端页面（已更新 ✅）
```javascript
// frontend/claim/index.html
- 支持 ERC20 代币领取
- 显示领取数量
```

### 部署脚本（已创建 ✅）
```bash
# contracts/scripts/deploy-erc20-distributor.js
# DEPLOY_TOKEN_DISTRIBUTOR.sh
```

## 🔍 验证

### 检查签到记录
```bash
curl "https://songbrocade-api.petterbrand03.workers.dev/api/events/get?slug=qipao-2025"
```

### 检查领取资格
```bash
curl "https://songbrocade-api.petterbrand03.workers.dev/rewards/v2/eligibility/24/0x用户地址"
```

应返回：
```json
{
  "ok": true,
  "eligible": true,
  "ready": true,
  "amount": "1000000000000000000000"  ← 1000 tokens
}
```

### 检查合约余额
```bash
# 在 Base Sepolia 浏览器查看
https://sepolia.basescan.org/token/0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa?a=合约地址
```

## 💡 提示

1. **Merkle Root 必须正确**
   - 部署前务必生成真实的 Merkle Tree
   - 不要使用默认的全 0 root

2. **代币数量要足够**
   - 至少需要：签到人数 × 1000 枚
   - 建议多转一些以防万一

3. **Gas 费**
   - 部署需要约 0.001 ETH
   - 用户领取需要约 0.0005 ETH

4. **测试建议**
   - 先用 1-2 个地址测试完整流程
   - 确认无误后再大规模使用

## 📞 常见问题

**Q: 如果忘记记录合约地址怎么办？**
A: 查看 `deployment-info.json` 文件

**Q: 用户说无法领取？**
A: 检查：
1. 合约是否有足够代币
2. Merkle proof 是否已生成
3. 用户是否已领取过

**Q: 如何添加新的签到用户？**
A: 需要重新生成 Merkle Tree 并部署新合约

---

**所有代码已准备就绪** ✅
**立即执行步骤 1-3 即可使用** 🚀

