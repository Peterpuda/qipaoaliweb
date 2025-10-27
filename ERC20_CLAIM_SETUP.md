# 🎯 ERC20 代币领取完整设置指南

## 📋 概览

您的代币合约：`0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa`
每次签到奖励：**1000 枚代币**
网络：Base Sepolia

## 🚀 完整部署流程

### 第一步：生成 Merkle Tree

#### 方法 A：通过管理后台（推荐）

1. 访问：https://songbrocade-frontend.pages.dev/admin/merkle.html
2. 输入活动 ID：`24`（或您的活动 ID）
3. 点击「生成 Merkle Tree」
4. **记录返回的 Merkle Root**

#### 方法 B：使用 API

```bash
# 先在管理后台登录获取 token
curl -X POST "https://songbrocade-api.petterbrand03.workers.dev/admin/generate-merkle" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"event_id": "24"}'
```

**返回示例**：
```json
{
  "ok": true,
  "event_id": "24",
  "merkle_root": "0xabc123...",  ← 记录这个
  "total_addresses": 5,
  "total_amount": "5000000000000000000000"
}
```

### 第二步：部署 Distributor 合约

```bash
cd contracts

# 1. 安装依赖（如果还没安装）
npm install

# 2. 配置环境变量
cp .env.example .env

# 编辑 .env 文件，填入：
# PRIVATE_KEY=你的私钥（有 Base Sepolia ETH 的钱包）
# BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
# MERKLE_ROOT=步骤1获取的 merkle root
# TOKEN_ADDRESS=0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa
# BASESCAN_API_KEY=你的 Basescan API Key（用于验证合约）

# 3. 部署合约
npx hardhat run scripts/deploy-erc20-distributor.js --network base-sepolia
```

**部署后会显示**：
```
✅ 部署成功！
合约地址: 0x... ← 记录这个地址
代币地址: 0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa
Merkle Root: 0xabc123...
```

### 第三步：向 Distributor 合约转入代币

**重要**：合约需要足够的代币才能分发给用户！

```bash
# 计算需要的代币数量
# 代币数量 = 签到人数 × 1000

# 例如：如果有 5 个人签到
# 需要转入: 5 × 1000 = 5000 枚代币
```

**转账方式**：

1. 使用 MetaMask 或其他钱包
2. 连接到 Base Sepolia 网络
3. 发送代币到 Distributor 合约地址
4. 数量：签到人数 × 1000 枚

**或使用脚本**：
```javascript
// 使用 ethers.js
const token = new ethers.Contract(
  "0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa",
  ["function transfer(address to, uint256 amount) returns (bool)"],
  signer
);

const amount = ethers.parseUnits("5000", 18); // 5000 tokens
await token.transfer(distributorAddress, amount);
```

### 第四步：验证合约（可选但推荐）

```bash
npx hardhat run scripts/verify-erc20-distributor.js --network base-sepolia
```

验证后用户可以在区块链浏览器查看合约代码：
https://sepolia.basescan.org/address/合约地址#code

### 第五步：告知用户

用户需要知道：
1. **批次号**（活动 ID）：`24`
2. **合约地址**：步骤2部署的 Distributor 合约地址

用户访问：https://songbrocade-frontend.pages.dev/claim/
输入信息后即可领取

## 📝 合约代码说明

### ERC20MerkleDistributor.sol

**功能**：
- 使用 Merkle Tree 验证用户资格
- 分发 ERC20 代币
- 防止重复领取
- 使用 bitmap 节省 gas

**关键方法**：
```solidity
function claim(
    uint256 index,      // 用户索引
    address account,    // 用户地址
    uint256 amount,     // 代币数量 (1000 * 10^18)
    bytes32[] calldata merkleProof  // Merkle 证明
) external
```

## 🧪 测试流程

### 1. 测试签到

```bash
curl -X POST "https://songbrocade-api.petterbrand03.workers.dev/api/poap/checkin" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "qipao-2025",
    "code": "QIPAO-2025",
    "address": "0x你的测试地址"
  }'
```

**预期返回**：
```json
{
  "ok": true,
  "points": 10,
  "eligible": true  ← 获得空投资格
}
```

### 2. 查询资格

```bash
curl "https://songbrocade-api.petterbrand03.workers.dev/rewards/v2/eligibility/24/0x你的测试地址"
```

**预期返回（生成 Merkle 后）**：
```json
{
  "ok": true,
  "eligible": true,
  "ready": true,
  "index": 0,
  "amount": "1000000000000000000000",  ← 1000 tokens
  "proof": ["0x...", "0x..."]
}
```

### 3. 领取代币

访问 claim 页面，连接钱包，点击领取。

### 4. 验证结果

在区块链浏览器查看：
```
https://sepolia.basescan.org/token/0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa?a=用户地址
```

应该能看到余额增加了 1000 枚代币。

## 🔧 已修改的代码

### 1. worker-api/index.js
```javascript
// 签到时记录的代币数量
const AIRDROP_AMOUNT = "1000000000000000000000"; // 1000 tokens (18 decimals)

// Merkle 生成时使用的数量
const amount = "1000000000000000000000"; // 1000 tokens
```

### 2. 新增合约
- `contracts/contracts/ERC20MerkleDistributor.sol` - 主合约
- `contracts/scripts/deploy-erc20-distributor.js` - 部署脚本
- `contracts/scripts/verify-erc20-distributor.js` - 验证脚本
- `contracts/scripts/generate-merkle-standalone.js` - Merkle 生成工具

### 3. 配置文件
- `contracts/.env.example` - 环境变量模板
- `contracts/hardhat.config.js` - 已更新支持合约验证

## 📊 数据流图

```
用户签到
  ↓
数据库记录: amount = "1000000000000000000000" (1000 tokens)
  ↓
管理员生成 Merkle Tree
  ↓
更新数据库: proof + index
  ↓
部署 Distributor 合约 (merkle_root)
  ↓
向合约转入代币 (签到人数 × 1000)
  ↓
用户查询资格 (获取 index, amount, proof)
  ↓
用户调用合约 claim()
  ↓
合约验证 Merkle proof ✓
  ↓
合约转账 1000 代币到用户钱包 ✅
```

## ⚠️ 重要注意事项

1. **Merkle Root 不可更改**
   - 部署合约后，Merkle Root 就固定了
   - 如需添加新用户，需重新生成 Merkle 并部署新合约

2. **代币数量必须足够**
   - 合约里的代币要 ≥ 签到人数 × 1000
   - 否则后面的用户无法领取

3. **每个地址只能领取一次**
   - 使用 bitmap 记录，无法重复领取

4. **Gas 费用**
   - 部署合约需要 Base Sepolia ETH
   - 用户领取时也需要少量 ETH 支付 gas

5. **测试建议**
   - 先用少量地址测试完整流程
   - 确认无误后再大规模部署

## 🎁 用户体验流程

1. 用户参加活动并签到 ✅
2. 获得积分提示：`获得 10 积分 + 空投资格`
3. 等待管理员生成 Merkle Tree
4. 访问 claim 页面
5. 输入批次号和合约地址
6. 连接钱包
7. 点击「领取」
8. 确认交易
9. **1000 枚代币到账** 🎉

## 📞 支持

如有问题，检查：
1. Merkle Root 是否正确
2. 合约是否有足够代币
3. 用户的 proof 是否有效
4. 网络是否为 Base Sepolia

---

**当前状态**：所有代码已准备就绪 ✅
**下一步**：生成 Merkle Tree → 部署合约 → 转入代币 → 告知用户

