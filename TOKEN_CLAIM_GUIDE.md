# 代币领取完整流程指南

## 📋 系统架构

### 领取代币的完整流程

```
用户签到 → 获得空投资格 → 管理员生成Merkle Tree → 部署Distributor合约 → 用户领取代币
```

## 🔄 详细流程说明

### 1️⃣ 用户签到（已完成 ✅）

用户完成签到后，系统自动：
- 在 `checkins` 表中记录签到
- 在 `airdrop_eligible` 表中创建空投资格记录
- 默认状态：`claimed=0`, `item_index=NULL`, `proof=NULL`

**数据示例**：
```sql
-- airdrop_eligible 表
wallet: 0x8888888888888888888888888888888888888888
event_id: 24
amount: 1000000000000000000  (1 token, 18 decimals)
claimed: 0
item_index: NULL  ← 需要管理员生成
proof: NULL       ← 需要管理员生成
```

### 2️⃣ 管理员生成 Merkle Tree（必须操作 ⚠️）

**为什么需要这一步？**
- Merkle Tree 是一种加密证明机制
- 可以让用户在链上自证有领取资格
- 节省 gas（不需要在合约中存储所有地址）

**操作方法**：

#### A. 通过 API 调用（推荐）

```bash
# 1. 先获取管理员 token（钱包签名登录）
# 访问管理后台：https://songbrocade-frontend.pages.dev/admin/

# 2. 调用生成 Merkle Tree API
curl -X POST "https://songbrocade-api.petterbrand03.workers.dev/admin/generate-merkle" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"event_id": "24"}'
```

**API 返回示例**：
```json
{
  "ok": true,
  "event_id": "24",
  "merkle_root": "0xabc123...",
  "total_addresses": 5,
  "total_amount": "5000000000000000000"
}
```

#### B. 通过管理后台页面

1. 访问：https://songbrocade-frontend.pages.dev/admin/events.html
2. 找到对应的活动（qipao-2025）
3. 点击「生成 Merkle Tree」按钮
4. 等待生成完成

**生成后的数据**：
```sql
-- airdrop_eligible 表更新为：
wallet: 0x8888888888888888888888888888888888888888
event_id: 24
amount: 1000000000000000000
item_index: 0                    ← 已生成
proof: ["0xabc...", "0xdef..."]  ← 已生成
merkle_batch: 24
```

### 3️⃣ 部署 Merkle Distributor 合约

**合约地址获取**：
- 使用项目中的合约：`contracts/contracts/Sha256MerkleDistributor.sol`
- 或使用已部署的合约地址

**部署步骤**：

```bash
cd contracts
npm install

# 设置环境变量
cp .env.example .env
# 编辑 .env 填入：
# - PRIVATE_KEY（部署者私钥）
# - BASE_SEPOLIA_RPC_URL
# - MERKLE_ROOT（从步骤2获取）

# 部署合约
npx hardhat run scripts/deploy.js --network base-sepolia
```

**部署后记录**：
- 合约地址：`0x...`
- Merkle Root：`0xabc123...`（与步骤2一致）

### 4️⃣ 用户领取代币

#### A. 通过前端页面（推荐）

1. 访问：https://songbrocade-frontend.pages.dev/claim/
2. 填写信息：
   - **批次号**：活动ID（如：`24`）
   - **合约地址**：Distributor 合约地址
   - **钱包地址**：自动获取或手动填写
3. 点击「🔗 连接钱包」
4. 点击「🔎 查询资格」
5. 点击「🪙 领取」

#### B. 查询资格 API

```bash
curl "https://songbrocade-api.petterbrand03.workers.dev/rewards/v2/eligibility/24/0x8888888888888888888888888888888888888888"
```

**返回示例（已生成 Merkle）**：
```json
{
  "ok": true,
  "eligible": true,
  "ready": true,
  "index": 0,
  "amount": "1000000000000000000",
  "proof": ["0xabc...", "0xdef..."],
  "batch": "24"
}
```

**返回示例（未生成 Merkle）**：
```json
{
  "ok": true,
  "eligible": true,
  "ready": false,
  "message": "Merkle proof not generated yet, contact admin"
}
```

### 5️⃣ 链上领取

前端自动执行：
```javascript
// 调用合约的 claim 方法
const tx = await distributorContract.claim(
  index,    // 用户索引：0
  wallet,   // 用户地址：0x8888...
  amount,   // 代币数量：1000000000000000000
  proof     // Merkle proof：["0xabc...", "0xdef..."]
);
```

**交易确认后**：
- 用户钱包收到代币
- 数据库标记为已领取：`claimed=1`, `token_tx_hash=0x...`

## 🔧 当前需要的操作

### 立即修复

1. **修复前端错误** ✅ 
   - 删除不存在的 `common.js` 引用

2. **生成 Merkle Tree** ⚠️ （必须）
   ```bash
   # 使用管理员账户调用
   POST /admin/generate-merkle
   Body: {"event_id": "24"}
   ```

3. **部署 Distributor 合约** ⚠️ （必须）
   ```bash
   cd contracts
   npm install
   # 配置 .env
   npx hardhat run scripts/deploy.js --network base-sepolia
   ```

4. **更新前端配置** 
   - 在 claim 页面添加默认合约地址
   - 添加默认批次号（event_id）

## 📊 数据库表结构

### airdrop_eligible 表
```sql
CREATE TABLE airdrop_eligible (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet TEXT NOT NULL,              -- 用户钱包地址
  event_id TEXT NOT NULL,            -- 活动ID/批次号
  amount TEXT NOT NULL,              -- 代币数量（wei）
  item_index INTEGER,                -- Merkle Tree 索引（需要生成）
  proof TEXT,                        -- Merkle proof JSON（需要生成）
  claimed INTEGER DEFAULT 0,         -- 是否已领取
  merkle_batch TEXT,                 -- 批次标识
  token_tx_hash TEXT,                -- 领取交易哈希
  created_at INTEGER,
  UNIQUE(wallet, event_id)
);
```

### merkle_batches 表
```sql
CREATE TABLE merkle_batches (
  batch_id TEXT PRIMARY KEY,         -- 批次ID（通常=event_id）
  merkle_root TEXT NOT NULL,         -- Merkle Root（用于合约部署）
  distributor_address TEXT NOT NULL, -- 合约地址
  total_amount TEXT NOT NULL,        -- 总代币数量
  claim_count INTEGER DEFAULT 0,     -- 已领取人数
  created_by TEXT,                   -- 创建者
  created_at INTEGER
);
```

## 🎯 快速开始

### 对于管理员

1. 登录管理后台获取 token
2. 调用生成 Merkle Tree API
3. 记录 Merkle Root
4. 部署合约（使用 Merkle Root）
5. 告知用户合约地址

### 对于用户

1. 完成签到（获得积分和空投资格）
2. 等待管理员生成 Merkle Tree
3. 访问 claim 页面
4. 输入批次号和合约地址
5. 连接钱包并领取

## 🔒 安全性

- ✅ Merkle proof 确保只有合格用户能领取
- ✅ 链上验证，不可篡改
- ✅ 每个地址只能领取一次
- ✅ 管理员无法修改已部署的合约

## 📝 API 端点总结

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/poap/checkin` | POST | 用户签到 | 公开 |
| `/admin/generate-merkle` | POST | 生成 Merkle Tree | 管理员 |
| `/rewards/v2/eligibility/{batch}/{wallet}` | GET | 查询领取资格 | 公开 |

## 🎉 预期结果

完成所有步骤后：
1. 用户签到获得积分（10分）✅
2. 用户获得空投资格 ✅
3. 管理员生成 Merkle proof ⏳
4. 用户在链上领取代币 ⏳
5. 代币到达用户钱包 ⏳

---

**当前状态**：✅ 签到成功，⏳ 等待生成 Merkle Tree 和部署合约

