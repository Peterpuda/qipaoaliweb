# 空投领取功能指南

## ✅ 已完成

1. **签到功能** ✅
   - 用户可以在 `/checkin/?event=airdrop-2025&code=airdrop-2025` 成功签到
   - 签到后自动获得空投资格（1000 枚代币）
   - 数据记录在 `airdrop_eligible` 表中

2. **API 修复** ✅ (刚刚完成)
   - 修复了 `/rewards/v2/eligibility/{slug}/{wallet}` API
   - 现在支持使用 `slug` 查询（会自动转换为数字 `event_id`）
   - 已部署到生产环境

## 🔄 当前状态

用户签到后点击"领取代币"按钮，会看到以下两种情况之一：

### 情况 1：Merkle Tree 未生成

```json
{
  "ok": true,
  "eligible": true,
  "ready": false,
  "message": "Merkle proof not generated yet, contact admin"
}
```

前端会显示：
```
管理员尚未生成Merkle证明，请稍后再试
```

### 情况 2：Merkle Tree 已生成

```json
{
  "ok": true,
  "eligible": true,
  "ready": true,
  "index": 0,
  "amount": "1000000000000000000000",
  "proof": ["0xabc...", "0xdef..."],
  "batch": "24"
}
```

前端会自动调用合约领取代币。

## 📋 管理员操作：生成 Merkle Tree

要让用户能够领取代币，管理员需要完成以下步骤：

### 步骤 1：访问管理后台

访问：https://songbrocade-frontend.pages.dev/admin/

### 步骤 2：连接钱包并登录

使用管理员钱包地址登录（在 `wrangler.toml` 中配置的 `ADMIN_WALLETS`）

### 步骤 3：生成 Merkle Tree

方式 A：通过管理后台页面（如果有 UI）

方式 B：通过 API 调用

```bash
# 获取管理员 token
curl -X POST https://songbrocade-api.petterbrand03.workers.dev/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address":"0xYourAdminAddress"}'

# 使用 MetaMask 签名后
curl -X POST https://songbrocade-api.petterbrand03.workers.dev/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "address":"0xYourAdminAddress",
    "signature":"0x...",
    "message":"..."
  }'

# 生成 Merkle Tree
curl -X POST https://songbrocade-api.petterbrand03.workers.dev/admin/generate-merkle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_id":"airdrop-2025"}'
```

### 步骤 4：查看生成结果

API 返回：
```json
{
  "ok": true,
  "event_id": "24",
  "merkle_root": "0xabc123...",
  "total_addresses": 5,
  "total_amount": "5000000000000000000000"
}
```

记录 `merkle_root`，用于部署合约。

### 步骤 5：部署 MerkleDistributor 合约

```bash
cd contracts

# 配置环境变量
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC=https://sepolia.base.org
TOKEN_ADDRESS=0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa
MERKLE_ROOT=0xabc123...  # 从步骤4获取
EOF

# 部署合约
node scripts/deploy-erc20-distributor.js
```

记录合约地址，例如：`0xDEF456...`

### 步骤 6：配置前端合约地址

编辑 `frontend/poap.config.js`：

```javascript
window.POAP_CONFIG = {
  WORKER_BASE_URL: "https://songbrocade-api.petterbrand03.workers.dev",
  CHAIN_ID_HEX: "0x14A34",
  RPC_URL: "https://sepolia.base.org",
  EXPLORER: "https://sepolia.basescan.org",
  
  // 填入部署的 Merkle Distributor 合约地址
  DISTRIBUTOR_CONTRACT: "0xDEF456...",
};
```

### 步骤 7：转入代币到合约

将足够的测试代币转到 MerkleDistributor 合约地址：

```
目标地址：0xDEF456...（你部署的合约地址）
代币：0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa
数量：至少等于 total_amount（例如 5000 枚代币）
```

## 🎯 用户完整流程

完成以上管理员操作后，用户体验流程如下：

```
1. 访问首页
   https://songbrocade-frontend.pages.dev
   
2. 点击"领取通证"按钮
   ↓
   自动跳转到签到页面
   https://songbrocade-frontend.pages.dev/checkin/?event=airdrop-2025&code=airdrop-2025
   
3. 连接钱包
   ↓
   
4. 点击"铭刻我的到场"
   ↓
   签到成功，显示"🎁 领取 1000 枚代币"按钮
   
5. 点击"🎁 领取 1000 枚代币"
   ↓
   自动查询资格 → 调用合约 → 代币到账
   
6. 显示成功信息
   "🎉 领取成功！✅ 已到账 1000 枚代币"
```

## 🔍 问题排查

### 问题 1：点击领取后显示"管理员尚未生成Merkle证明"

**原因**：Merkle Tree 还没有生成

**解决**：按照上面的步骤生成 Merkle Tree

### 问题 2：点击领取后显示"错误：未配置合约地址"

**原因**：前端配置中没有设置 `DISTRIBUTOR_CONTRACT`

**解决**：
1. 先部署 MerkleDistributor 合约
2. 在 `frontend/poap.config.js` 中配置合约地址
3. 重新部署前端

### 问题 3：领取交易失败

**可能原因**：
1. 合约中没有足够的代币
2. Merkle Root 不匹配
3. 用户已经领取过

**解决**：
1. 检查合约代币余额
2. 确认部署合约时使用的 Merkle Root 与生成的一致
3. 检查数据库中 `claimed` 字段是否为 1

### 问题 4：查询资格返回 404

**原因**：活动不存在或 slug 错误

**解决**：
1. 访问 `/api/events/get?slug=airdrop-2025` 确认活动存在
2. 如果不存在，在管理后台创建活动

## 📊 数据库检查

### 查看签到记录

```sql
-- 查看所有签到用户
SELECT * FROM checkins WHERE event_id = '24';

-- 查看空投资格
SELECT * FROM airdrop_eligible WHERE event_id = '24';
```

### 查看 Merkle Tree 生成状态

```sql
-- 查看是否已生成
SELECT * FROM airdrop_eligible WHERE event_id = '24' AND item_index IS NOT NULL;

-- 查看批次信息
SELECT * FROM merkle_batches WHERE batch_id = '24';
```

## 🚀 快速测试

完成所有配置后，你可以这样测试：

1. 用新钱包访问签到页面
2. 完成签到
3. 点击领取代币
4. 检查钱包是否收到 1000 枚代币

---

**最后更新**：2025-10-27  
**API 版本**：已修复 slug 查询支持  
**部署状态**：已部署到生产环境

