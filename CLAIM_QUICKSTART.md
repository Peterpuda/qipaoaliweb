# 🚀 代币领取快速指南

## 📌 问题解答

### Q: 用户签到后为什么不能立即领取代币？
**A**: 需要管理员先生成 Merkle Tree 和部署合约。这是为了安全和节省 gas 费用。

### Q: claim 页面的错误是什么？
**A**: ✅ 已修复
- 删除了不存在的 `common.js` 引用
- Merkle proof 需要管理员生成

### Q: 表单数据从哪里来？
**A**: 数据流程如下：
```
用户签到 
  ↓
数据库记录空投资格（airdrop_eligible表）
  ↓
管理员生成 Merkle Tree
  ↓
数据库更新 proof 和 index
  ↓
用户查询 API 获取 proof
  ↓
用户调用合约领取代币
```

## ⚡ 立即操作（3步）

### 管理员操作

#### 步骤 1：生成 Merkle Tree

**方法 A：使用管理页面**（推荐）
1. 访问：https://songbrocade-frontend.pages.dev/admin/merkle.html
2. 输入活动 ID：`24`
3. 点击「生成 Merkle Tree」
4. 记录 Merkle Root

**方法 B：使用 API**
```bash
curl -X POST "https://songbrocade-api.petterbrand03.workers.dev/admin/generate-merkle" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"event_id": "24"}'
```

#### 步骤 2：部署合约

```bash
cd contracts
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入：
# PRIVATE_KEY=你的私钥
# BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
# MERKLE_ROOT=步骤1获取的root

# 部署
npx hardhat run scripts/deploy.js --network base-sepolia
```

记录合约地址：`0x...`

#### 步骤 3：告知用户

将合约地址和批次号告知用户：
- 批次号（event_id）：`24`
- 合约地址：`0x...`（步骤2部署的）

### 用户操作

1. 访问：https://songbrocade-frontend.pages.dev/claim/
2. 填写：
   - 批次号：`24`
   - 合约地址：（管理员提供）
3. 点击「🔗 连接钱包」
4. 点击「🔎 查询资格」
5. 点击「🪙 领取」

## 🔍 验证状态

### 检查用户是否有资格

```bash
# 替换 event_id 和 wallet_address
curl "https://songbrocade-api.petterbrand03.workers.dev/rewards/v2/eligibility/24/0x8888888888888888888888888888888888888888"
```

**返回示例（已准备好）**：
```json
{
  "ok": true,
  "eligible": true,
  "ready": true,
  "index": 0,
  "amount": "1000000000000000000",
  "proof": ["0xabc...", "0xdef..."]
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

## 📋 数据库查询

### 查看签到用户

```sql
-- 查看活动24的所有签到用户
SELECT wallet, created_at 
FROM checkins 
WHERE event_id = '24'
ORDER BY created_at;
```

### 查看空投资格

```sql
-- 查看哪些用户已生成 proof
SELECT wallet, item_index, claimed,
       CASE 
         WHEN proof IS NULL THEN '未生成'
         ELSE '已生成'
       END as proof_status
FROM airdrop_eligible
WHERE event_id = '24';
```

### 查看 Merkle 批次

```sql
-- 查看批次信息
SELECT batch_id, merkle_root, distributor_address, total_amount
FROM merkle_batches
WHERE batch_id = '24';
```

## 🛠️ 故障排除

### 问题 1：Merkle proof not generated
**解决**：管理员需要先生成 Merkle Tree（见步骤1）

### 问题 2：合约调用失败
**原因**：
- Merkle Root 不匹配
- proof 不正确
- 用户已领取过

**检查**：
```bash
# 在区块链浏览器查看合约
# Base Sepolia: https://sepolia.basescan.org/address/合约地址

# 确认 Merkle Root 是否正确
# 确认用户是否已领取（isClaimed）
```

### 问题 3：页面加载错误
**解决**：
- ✅ 已修复 common.js 错误
- 清除浏览器缓存
- 重新部署前端

## 🎯 完整流程图

```
┌─────────────┐
│  用户签到    │ ✅ 已完成
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ 数据库记录资格   │ ✅ 已完成
└──────┬──────────┘
       │
       ↓
┌──────────────────┐
│ 管理员生成Merkle │ ⏳ 待操作
└──────┬───────────┘
       │
       ↓
┌──────────────┐
│ 部署合约      │ ⏳ 待操作
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ 用户领取代币  │ ⏳ 待操作
└──────────────┘
```

## 📞 相关链接

- **前端主页**: https://songbrocade-frontend.pages.dev
- **Merkle 生成页面**: https://songbrocade-frontend.pages.dev/admin/merkle.html
- **代币领取页面**: https://songbrocade-frontend.pages.dev/claim/
- **API 文档**: TOKEN_CLAIM_GUIDE.md
- **GitHub**: https://github.com/Peterpuda/qipao

## 💡 提示

1. **每个活动只需生成一次 Merkle Tree**
2. **合约部署后无法修改 Merkle Root**
3. **每个地址只能领取一次**
4. **建议在测试网先测试完整流程**

---

**当前状态**：用户已签到 ✅，等待管理员生成 Merkle Tree ⏳

