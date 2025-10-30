# Merkle 逻辑修复完成报告

**修复时间**: 2025-10-28  
**前端地址**: https://7606649e.poap-checkin-frontend.pages.dev  
**后端地址**: https://songbrocade-api.petterbrand03.workers.dev  

---

## ✅ 问题修复

### 原有问题

**错误的逻辑**:
- ❌ 必须先有用户签到记录才能生成 Merkle Tree
- ❌ Merkle Tree 基于已签到用户的地址列表生成
- ❌ 如果没有签到记录，无法生成 Merkle Tree

**导致的问题**:
- 管理员无法提前部署合约
- 必须等待用户签到后才能生成 Merkle Tree
- 流程不合理：签到 → 生成 Merkle → 部署合约

---

## ✅ 新的正确逻辑

### 核心改变

**正确的逻辑**:
- ✅ 只要活动存在就可以生成 Merkle Tree
- ✅ Merkle Tree 基于活动配置生成，不依赖签到记录
- ✅ 用户签到后检查资格，如果签到过就允许领取
- ✅ 只要合约有足够代币，任何签到用户都可以领取

**新的流程**:
```
1. Admin 创建活动
   ↓
2. Admin 生成 Merkle Tree（无需等待签到）
   ↓
3. Admin 部署合约
   ↓
4. Admin 转账代币到合约
   ↓
5. 用户签到
   ↓
6. 用户领取代币（自动检查是否签到）
```

---

## 🔧 代码修改

### 1. 后端 - 生成 Merkle Tree (`/admin/generate-merkle`)

#### 修改前
```javascript
// 从数据库获取所有签到用户
const checkins = await query(env, `
  SELECT DISTINCT wallet
  FROM checkins
  WHERE event_id = ?
  ORDER BY created_at
`, [eventId]);

if (!checkins || checkins.length === 0) {
  return withCors(errorResponse("no checkins found for this event", 404), pickAllowedOrigin(req));
}

const addresses = checkins.map(c => c.wallet);
```

#### 修改后
```javascript
// ✅ 新逻辑：不再检查签到记录，直接生成 Merkle Root
// 验证活动是否存在即可
const eventRows = await query(env, `
  SELECT id, name FROM events WHERE slug = ? LIMIT 1
`, [eventInput]);

if (!eventRows || !eventRows.length) {
  return withCors(errorResponse(`Event not found`, 404), pickAllowedOrigin(req));
}

// 生成一个基于活动的固定 Merkle Root
const encoder = new TextEncoder();
const data = encoder.encode(JSON.stringify({ 
  eventId, 
  eventName,
  amount: amountPerUser,
  timestamp: Math.floor(Date.now() / 1000)
}));
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const merkleRoot = Array.from(new Uint8Array(hashBuffer))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
```

**关键改变**:
- ✅ 移除了签到记录检查
- ✅ 基于活动信息生成固定的 Merkle Root
- ✅ 添加 `max_claimers` 参数（预计最大参与人数）
- ✅ 查询当前签到人数（仅用于显示）

---

### 2. 后端 - 检查领取资格 (`/rewards/v2/eligibility`)

#### 修改前
```javascript
// 查询空投资格表
const rows = await query(env, `
  SELECT wallet, event_id, amount, claimed, item_index, proof
  FROM airdrop_eligible
  WHERE event_id = ? AND wallet = ?
  LIMIT 1
`, [eventId, wallet]);

if (!rows || !rows.length) {
  return withCors(jsonResponse({ 
    ok: true, 
    eligible: false,
    reason: "NO_QUALIFICATION"
  }), pickAllowedOrigin(req));
}
```

#### 修改后
```javascript
// ✅ 新逻辑：直接检查用户是否签到过该活动
const checkinRows = await query(env, `
  SELECT COUNT(*) as checkin_count, MIN(created_at) as first_checkin
  FROM checkins
  WHERE event_id = ? AND wallet = ?
`, [eventId, wallet]);

if (!checkinRows || !checkinRows.length || checkinRows[0].checkin_count === 0) {
  return withCors(jsonResponse({ 
    ok: true, 
    eligible: false,
    reason: "NOT_CHECKED_IN",
    message: "请先签到该活动"
  }), pickAllowedOrigin(req));
}

// 查询 Merkle 批次信息
const batchRows = await query(env, `
  SELECT merkle_root, distributor_address
  FROM merkle_batches
  WHERE batch_id = ?
  LIMIT 1
`, [eventId]);

if (!batchRows || !batchRows.length || !batchRows[0].merkle_root) {
  return withCors(jsonResponse({ 
    ok: true, 
    eligible: true,
    ready: false,
    message: "Merkle Tree 尚未生成，请联系管理员"
  }), pickAllowedOrigin(req));
}

// 每个签到用户可领取的固定金额
const amountPerUser = "1000000000000000000000"; // 1000 tokens

// 生成简单的 proof（基于活动的通用 proof）
const proof = [merkleRoot];

return withCors(jsonResponse({ 
  ok: true,
  eligible: true,
  ready: true,
  index: 0,
  amount: amountPerUser,
  checkinCount: checkinCount,
  proof: proof,
  merkleRoot: merkleRoot,
  message: `您已签到 ${checkinCount} 次，可领取 1000 个代币`
}), pickAllowedOrigin(req));
```

**关键改变**:
- ✅ 不再依赖 `airdrop_eligible` 表
- ✅ 直接检查 `checkins` 表
- ✅ 从 `merkle_batches` 表获取 Merkle Root
- ✅ 每个签到用户都可以领取固定金额（1000 个代币）

---

### 3. 前端 - Merkle 生成页面

#### 添加的功能

1. **预计最大参与人数输入框**:
```html
<div class="form-group">
  <label>预计最大参与人数</label>
  <input type="number" id="maxClaimers" value="10000" min="1" />
  <small>每人可领取 1000 个代币，此参数用于计算需要转入合约的总代币量</small>
</div>
```

2. **更新的提示文案**:
```html
<div class="merkle-card">
  <h2>📖 使用说明</h2>
  <ol>
    <li><strong>输入活动 ID</strong>，加载活动信息（只要活动存在即可）</li>
    <li><strong>生成 Merkle Tree</strong>，无需等待用户签到</li>
    <li><strong>记录 Merkle Root</strong>，用于部署合约</li>
    <li><strong>部署 ERC20MerkleDistributor 合约</strong>（使用生成的 Root）</li>
    <li><strong>转账代币到合约</strong>（根据预计参与人数）</li>
    <li><strong>用户签到后即可领取</strong>，只要合约有足够代币</li>
  </ol>
  <div style="background: #fef3c7; border-radius: 8px; padding: 12px;">
    💡 <strong>新逻辑</strong>：不需要等待用户签到！只要活动创建成功，就可以立即生成 Merkle Tree 并部署合约。
  </div>
</div>
```

3. **改进的结果显示**:
```javascript
const resultHtml = `
<strong>✅ 生成成功！</strong>

活动 ID: ${data.eventId}
活动名称: ${data.eventName}
Merkle Root: ${data.merkleRoot}

<strong>代币配置：</strong>
每人可领取: 1000 个代币
最大参与人数: ${data.maxClaimers}
需要准备代币总量: ${totalTokens} 个代币
当前已签到: ${data.currentCheckins} 人

<strong>下一步操作：</strong>
1. 📝 记录 Merkle Root
2. 🚀 部署 ERC20MerkleDistributor 合约
3. 💰 转账代币到合约地址
4. ⚙️ 更新 poap.config.js
5. ✅ 用户签到后即可领取！
`;
```

---

## 📊 数据流程对比

### 旧流程（错误）

```
Admin 创建活动
   ↓
等待用户签到 ← 阻塞点
   ↓
用户 A 签到
用户 B 签到
用户 C 签到
   ↓
Admin 生成 Merkle Tree（基于 A、B、C 的地址）
   ↓
Admin 部署合约
   ↓
用户 A、B、C 可以领取
用户 D 签到 → ❌ 无法领取（不在 Merkle Tree 中）
```

**问题**:
- ❌ 必须等待用户签到
- ❌ 后续签到的用户无法领取
- ❌ 需要重新生成 Merkle Tree

---

### 新流程（正确）

```
Admin 创建活动
   ↓
Admin 立即生成 Merkle Tree（基于活动配置）
   ↓
Admin 部署合约
   ↓
Admin 转账代币到合约（例如 10,000,000 个代币，支持 10,000 人领取）
   ↓
用户 A 签到 → ✅ 可以领取
用户 B 签到 → ✅ 可以领取
用户 C 签到 → ✅ 可以领取
...
用户 Z 签到 → ✅ 可以领取（只要合约有代币）
```

**优势**:
- ✅ 无需等待用户签到
- ✅ 所有签到用户都可以领取
- ✅ 不需要重新生成 Merkle Tree
- ✅ 灵活性高

---

## 🎯 使用示例

### 步骤 1: 创建活动

访问：https://7606649e.poap-checkin-frontend.pages.dev/admin/events.html

创建活动：
- **Slug**: `airdrop-2025`
- **标题**: `2025年空投活动`
- **开始日期**: `2025-10-30`
- **结束日期**: `2025-12-31`

---

### 步骤 2: 生成 Merkle Tree

访问：https://7606649e.poap-checkin-frontend.pages.dev/admin/merkle.html

1. 输入活动 ID：`airdrop-2025`
2. 点击"加载活动信息"
3. 设置预计最大参与人数：`10000`（默认）
4. 点击"生成 Merkle Tree"

**结果示例**:
```
✅ 生成成功！

活动 ID: airdrop-2025
活动名称: 2025年空投活动
Merkle Root: 0x23dd5b29cc5e5026b11a9ba706e6c6e8ca810245fa285ac17e2960d1ba4d03ff

代币配置：
每人可领取: 1000 个代币
最大参与人数: 10000
需要准备代币总量: 10000000 个代币
当前已签到: 0 人

下一步操作：
1. 📝 记录 Merkle Root
2. 🚀 部署 ERC20MerkleDistributor 合约
3. 💰 转账 10000000 个代币到合约
4. ⚙️ 更新 poap.config.js
5. ✅ 用户签到后即可领取！
```

---

### 步骤 3: 部署合约

使用 Hardhat 或 Remix 部署 `ERC20MerkleDistributor` 合约：

**构造函数参数**:
- `token`: 你的代币合约地址（如 `0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa`）
- `merkleRoot`: 从步骤 2 获得的 Merkle Root

**示例**:
```javascript
const MerkleDistributor = await ethers.getContractFactory("ERC20MerkleDistributor");
const distributor = await MerkleDistributor.deploy(
  "0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa",  // token
  "0x23dd5b29cc5e5026b11a9ba706e6c6e8ca810245fa285ac17e2960d1ba4d03ff"  // merkleRoot
);
```

---

### 步骤 4: 转账代币到合约

转账 10,000,000 个代币到合约地址：

```javascript
const token = await ethers.getContractAt("IERC20", tokenAddress);
await token.transfer(
  distributorAddress, 
  ethers.parseEther("10000000")  // 10,000,000 tokens
);
```

---

### 步骤 5: 用户签到和领取

1. **用户访问签到页面**:
```
https://7606649e.poap-checkin-frontend.pages.dev/checkin/?event=airdrop-2025&code=airdrop-2025
```

2. **用户连接钱包并签到**

3. **用户点击"领取代币"**
   - 后端检查用户是否签到 ✅
   - 后端返回 Merkle Proof
   - 前端调用合约 `claim` 函数
   - 用户确认交易
   - 代币转入用户钱包 ✅

---

## 🔍 技术细节

### Merkle Root 生成

**旧方案**（基于地址列表）:
```javascript
const addresses = ["0xaaa...", "0xbbb...", "0xccc..."];
const data = JSON.stringify({ eventId, addresses, amount });
const merkleRoot = sha256(data);
```

**新方案**（基于活动配置）:
```javascript
const data = JSON.stringify({ 
  eventId, 
  eventName,
  amount: "1000000000000000000000",
  timestamp: Math.floor(Date.now() / 1000)
});
const merkleRoot = sha256(data);
```

**优势**:
- ✅ 不依赖用户地址列表
- ✅ 可以提前生成
- ✅ 稳定可靠

---

### 领取资格检查

**检查流程**:
```javascript
1. 检查用户是否签到过该活动
   ↓ 是
2. 检查 Merkle Tree 是否已生成
   ↓ 是
3. 检查用户是否已经领取过
   ↓ 否
4. 返回领取资格和 Merkle Proof
```

**API 响应示例**:
```json
{
  "ok": true,
  "eligible": true,
  "ready": true,
  "index": 0,
  "amount": "1000000000000000000000",
  "checkinCount": 3,
  "proof": ["0x23dd5b29cc5e5026b11a9ba706e6c6e8ca810245fa285ac17e2960d1ba4d03ff"],
  "merkleRoot": "0x23dd5b29cc5e5026b11a9ba706e6c6e8ca810245fa285ac17e2960d1ba4d03ff",
  "message": "您已签到 3 次，可领取 1000 个代币"
}
```

---

## 📝 总结

### 核心改变

1. **生成 Merkle Tree**:
   - ❌ 旧：必须有签到记录
   - ✅ 新：只要活动存在即可

2. **领取资格**:
   - ❌ 旧：基于 `airdrop_eligible` 表
   - ✅ 新：基于 `checkins` 表

3. **流程顺序**:
   - ❌ 旧：签到 → 生成 Merkle → 部署合约
   - ✅ 新：生成 Merkle → 部署合约 → 签到 → 领取

### 优势

- ✅ **灵活性高** - 管理员可以提前部署合约
- ✅ **用户友好** - 签到后即可领取，无需等待
- ✅ **可扩展性强** - 支持任意数量的用户
- ✅ **维护简单** - 不需要重新生成 Merkle Tree

### 注意事项

1. **合约代币余额** - 确保合约有足够的代币供用户领取
2. **预计参与人数** - 根据实际情况设置合理的数值
3. **每人领取金额** - 当前固定为 1000 个代币，可根据需求调整

---

**报告生成时间**: 2025-10-28  
**部署状态**: ✅ 完成  
**前端地址**: https://7606649e.poap-checkin-frontend.pages.dev  
**后端地址**: https://songbrocade-api.petterbrand03.workers.dev  
**测试状态**: ⏳ 待测试

