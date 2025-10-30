# Merkle Tree 生成操作指南

**问题**: 生成 Merkle Tree 时提示 "no checkins found for this event"

---

## 🔍 问题诊断

### 错误原因

Merkle Tree 生成失败的原因是：**数据库中没有该活动的签到记录**

这**不是**因为缺少合约部署！正确的流程应该是：

```
用户签到 → 生成 Merkle Tree → 部署合约 → 用户领取代币
```

---

## 📊 当前系统架构

### 数据流程

```
1. 创建活动（events 表）
   ↓
2. 生成签到码
   ↓
3. 用户扫码签到（写入 checkins 表）
   ↓
4. 生成 Merkle Tree（读取 checkins 表）
   ↓
5. 部署 MerkleDistributor 合约
   ↓
6. 用户领取代币
```

### 数据库表关系

**events 表**:
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,           -- 活动 ID（如："airdrop-2025"）
  name TEXT NOT NULL,            -- 活动名称
  slug TEXT,                     -- 活动 slug（可选）
  start_ts INTEGER,              -- 开始时间戳（天数）
  end_ts INTEGER,                -- 结束时间戳（天数）
  ...
)
```

**checkins 表**:
```sql
CREATE TABLE checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,        -- 关联 events.id 或 events.slug
  wallet TEXT NOT NULL,          -- 用户钱包地址
  code TEXT,                     -- 签到码
  created_at DATETIME,           -- 签到时间
  UNIQUE(event_id, wallet)       -- 每个活动每个钱包只能签到一次（旧约束）
)
```

**airdrop_eligible 表**:
```sql
CREATE TABLE airdrop_eligible (
  wallet TEXT NOT NULL,
  event_id TEXT NOT NULL,
  amount TEXT,                   -- 可领取的代币数量（wei）
  item_index INTEGER,            -- Merkle Tree 中的索引
  proof TEXT,                    -- Merkle Proof（JSON 数组）
  merkle_batch TEXT,             -- 批次 ID
  checkin_count INTEGER,         -- 签到次数
  last_checkin_date TEXT,        -- 最后签到日期
  ...
)
```

---

## ✅ 解决方案

### 方案 1: 确认活动 ID 和签到记录

#### 步骤 1.1: 检查活动是否存在

访问管理后台，查看活动列表：
```
https://poap-checkin-frontend.pages.dev/admin/events.html
```

确认活动的 **slug** 或 **ID**，例如：
- `airdrop-2025`（正确）
- `airdrop-2026`（可能不存在）

#### 步骤 1.2: 检查是否有签到记录

**方法 A**: 通过 Cloudflare D1 控制台查询

1. 登录 Cloudflare Dashboard
2. 进入 D1 数据库（`poap-db`）
3. 执行 SQL 查询：

```sql
-- 查询活动是否存在
SELECT * FROM events WHERE slug = 'airdrop-2025' OR id = 'airdrop-2025';

-- 查询该活动的签到记录
SELECT COUNT(*) as total_checkins, COUNT(DISTINCT wallet) as unique_wallets
FROM checkins
WHERE event_id = 'airdrop-2025';

-- 查看具体的签到用户
SELECT wallet, created_at
FROM checkins
WHERE event_id = 'airdrop-2025'
ORDER BY created_at DESC
LIMIT 10;
```

**方法 B**: 通过签到页面测试

1. 访问签到页面：
```
https://poap-checkin-frontend.pages.dev/checkin/?event=airdrop-2025&code=airdrop-2025
```

2. 连接钱包并签到
3. 签到成功后，数据库中会有记录

---

### 方案 2: 创建测试签到数据（仅用于测试）

如果你想快速测试 Merkle Tree 生成，可以手动插入测试数据：

#### 步骤 2.1: 在 D1 控制台执行

```sql
-- 1. 确保活动存在
INSERT INTO events (id, name, slug, created_at)
VALUES ('airdrop-2025', '2025空投活动', 'airdrop-2025', strftime('%s', 'now'))
ON CONFLICT(id) DO NOTHING;

-- 2. 插入测试签到记录（替换为你的测试钱包地址）
INSERT INTO checkins (event_id, wallet, code, created_at)
VALUES 
  ('airdrop-2025', '0xef85456652ada05f12708b9bdcf215780e780d18', 'airdrop-2025', datetime('now')),
  ('airdrop-2025', '0x1234567890123456789012345678901234567890', 'airdrop-2025', datetime('now')),
  ('airdrop-2025', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', 'airdrop-2025', datetime('now'))
ON CONFLICT(event_id, wallet) DO NOTHING;

-- 3. 验证数据
SELECT * FROM checkins WHERE event_id = 'airdrop-2025';
```

#### 步骤 2.2: 重新生成 Merkle Tree

1. 访问 Merkle 生成页面：
```
https://poap-checkin-frontend.pages.dev/admin/merkle.html
```

2. 输入活动 ID：`airdrop-2025`
3. 点击"加载活动信息"
4. 点击"生成 Merkle Tree"

---

### 方案 3: 使用正确的活动 ID

根据你的截图，操作日志显示：

```
[11:06:53] ℹ️ 加载活动信息：airdrop-2026
[11:06:58] ✅ 活动信息加载成功
[11:07:23] ❌ 生成失败：no checkins found for this event
```

**问题**: 你使用的是 `airdrop-2026`，但可能实际活动 ID 是 `airdrop-2025`

**解决**: 使用正确的活动 ID

---

## 🎯 完整操作流程（从零开始）

### 第一步：创建活动

1. 访问活动管理页面：
```
https://poap-checkin-frontend.pages.dev/admin/events.html
```

2. 填写活动信息：
   - **活动 slug**: `airdrop-2025`
   - **标题**: `2025年空投活动`
   - **开始日期**: `2025-10-30`
   - **结束日期**: `2025-12-31`

3. 点击"保存 / 更新活动"

4. 点击"获取固定签到码"，记录签到码（通常就是 slug）

---

### 第二步：用户签到

#### 方法 A: 真实用户签到

1. 分享签到链接给用户：
```
https://poap-checkin-frontend.pages.dev/checkin/?event=airdrop-2025&code=airdrop-2025
```

2. 用户访问链接，连接钱包，点击"铭刻我的到场"

3. 签到成功后，数据库中会自动记录

#### 方法 B: 测试签到（你自己操作）

1. 访问签到页面：
```
https://poap-checkin-frontend.pages.dev/checkin/?event=airdrop-2025&code=airdrop-2025
```

2. 连接你的测试钱包（如 MetaMask）

3. 点击"铭刻我的到场"

4. 签到成功

5. **重要**: 如果你想测试多个地址，需要：
   - 使用不同的钱包地址
   - 或者在 D1 控制台手动插入测试数据

---

### 第三步：生成 Merkle Tree

1. 访问 Merkle 生成页面：
```
https://poap-checkin-frontend.pages.dev/admin/merkle.html
```

2. 输入活动 ID：`airdrop-2025`

3. 点击"📋 加载活动信息"

4. 确认签到人数正确（应该显示实际签到人数）

5. 点击"🚀 生成 Merkle Tree"

6. **记录生成的 Merkle Root**，例如：
```
Merkle Root: 0x23dd5b29cc5e5026b11a9ba706e6c6e8ca810245fa285ac17e2960d1ba4d03ff
总地址数: 3
总代币量: 3000000000000000000000 wei（3000 个代币）
```

---

### 第四步：部署 MerkleDistributor 合约

#### 步骤 4.1: 准备合约参数

你需要以下信息：
- **Token 地址**: `0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa`（你的测试代币）
- **Merkle Root**: 从第三步获得（例如 `0x23dd5b29...`）

#### 步骤 4.2: 部署合约

**方法 A**: 使用 Hardhat 部署

1. 进入合约目录：
```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/contracts
```

2. 创建 `.env` 文件（如果还没有）：
```bash
PRIVATE_KEY=你的私钥
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASESCAN_API_KEY=你的Basescan API密钥（可选）
```

3. 创建部署脚本 `scripts/deploy-merkle.js`：
```javascript
const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa";
  const merkleRoot = "0x23dd5b29cc5e5026b11a9ba706e6c6e8ca810245fa285ac17e2960d1ba4d03ff"; // 替换为你的 Root
  
  console.log("部署 ERC20MerkleDistributor...");
  console.log("Token 地址:", tokenAddress);
  console.log("Merkle Root:", merkleRoot);
  
  const MerkleDistributor = await hre.ethers.getContractFactory("ERC20MerkleDistributor");
  const distributor = await MerkleDistributor.deploy(tokenAddress, merkleRoot);
  
  await distributor.waitForDeployment();
  const address = await distributor.getAddress();
  
  console.log("✅ 合约部署成功！");
  console.log("合约地址:", address);
  console.log("\n下一步：");
  console.log("1. 转账代币到合约：", address);
  console.log("2. 更新 frontend/poap.config.js 中的 DISTRIBUTOR_CONTRACT");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

4. 运行部署：
```bash
npx hardhat run scripts/deploy-merkle.js --network baseSepolia
```

5. 记录合约地址，例如：
```
合约地址: 0xb763A90039cc09CcbDcfF3feb28378fFF07B9c6C
```

**方法 B**: 使用 Remix IDE 部署

1. 访问 https://remix.ethereum.org/

2. 创建新文件 `ERC20MerkleDistributor.sol`，粘贴合约代码

3. 编译合约

4. 切换到 "Deploy & Run Transactions"

5. 选择 "Injected Provider - MetaMask"

6. 确保 MetaMask 连接到 Base Sepolia

7. 填写构造函数参数：
   - `token`: `0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa`
   - `merkleRoot`: `0x23dd5b29cc5e5026b11a9ba706e6c6e8ca810245fa285ac17e2960d1ba4d03ff`

8. 点击 "Deploy"

9. 确认交易

10. 记录合约地址

---

### 第五步：转账代币到合约

合约部署后，需要将足够的代币转入合约地址，用户才能领取。

#### 计算需要的代币数量

根据 Merkle Tree 生成结果：
```
总代币量: 3000000000000000000000 wei = 3000 个代币
```

#### 转账操作

**方法 A**: 使用 Etherscan

1. 访问你的代币合约：
```
https://sepolia.basescan.org/address/0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa
```

2. 点击 "Contract" → "Write Contract"

3. 连接钱包

4. 找到 `transfer` 函数

5. 填写参数：
   - `to`: 合约地址（如 `0xb763A90039cc09CcbDcfF3feb28378fFF07B9c6C`）
   - `amount`: `3000000000000000000000`（3000 个代币）

6. 点击 "Write"，确认交易

**方法 B**: 使用 Hardhat 脚本

创建 `scripts/transfer-tokens.js`：
```javascript
const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa";
  const distributorAddress = "0xb763A90039cc09CcbDcfF3feb28378fFF07B9c6C"; // 替换为你的合约地址
  const amount = hre.ethers.parseEther("3000"); // 3000 个代币
  
  const token = await hre.ethers.getContractAt("IERC20", tokenAddress);
  
  console.log("转账代币到 MerkleDistributor...");
  console.log("代币地址:", tokenAddress);
  console.log("合约地址:", distributorAddress);
  console.log("数量:", amount.toString(), "wei (3000 tokens)");
  
  const tx = await token.transfer(distributorAddress, amount);
  console.log("交易哈希:", tx.hash);
  
  await tx.wait();
  console.log("✅ 转账成功！");
  
  // 验证余额
  const balance = await token.balanceOf(distributorAddress);
  console.log("合约余额:", hre.ethers.formatEther(balance), "tokens");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

运行：
```bash
npx hardhat run scripts/transfer-tokens.js --network baseSepolia
```

---

### 第六步：更新前端配置

修改 `frontend/poap.config.js`：

```javascript
window.POAP_CONFIG = {
  WORKER_BASE_URL: "https://songbrocade-api.petterbrand03.workers.dev",
  API_BASE: "https://songbrocade-api.petterbrand03.workers.dev",
  CHAIN_ID_HEX: "0x14A34", // Base Sepolia
  RPC_URL: "https://sepolia.base.org",
  EXPLORER: "https://sepolia.basescan.org",
  DISTRIBUTOR_CONTRACT: "0xb763A90039cc09CcbDcfF3feb28378fFF07B9c6C" // 更新为你的合约地址
};
```

部署前端：
```bash
cd frontend
npx wrangler pages deploy . --project-name=poap-checkin-frontend --branch=prod
```

---

### 第七步：用户领取代币

1. 用户访问签到页面（已签到的用户）：
```
https://poap-checkin-frontend.pages.dev/checkin/?event=airdrop-2025&code=airdrop-2025
```

2. 连接钱包

3. 页面会显示"🎁 领取 1000 枚代币"按钮

4. 点击按钮

5. 后端会：
   - 查询该用户的 Merkle Proof
   - 返回 proof 数据给前端

6. 前端会：
   - 调用合约的 `claim` 函数
   - 传入 `index`, `account`, `amount`, `merkleProof`

7. 用户在钱包中确认交易

8. 交易成功后，代币会转入用户钱包

---

## 🔧 故障排查

### 问题 1: "no checkins found for this event"

**原因**: 数据库中没有该活动的签到记录

**解决**:
1. 确认活动 ID 正确
2. 确认至少有一个用户签到
3. 在 D1 控制台查询：
```sql
SELECT * FROM checkins WHERE event_id = 'airdrop-2025';
```

---

### 问题 2: "Event with slug 'xxx' not found"

**原因**: 活动不存在

**解决**:
1. 在活动管理页面创建活动
2. 或在 D1 控制台插入活动：
```sql
INSERT INTO events (id, name, slug, created_at)
VALUES ('airdrop-2025', '2025空投活动', 'airdrop-2025', strftime('%s', 'now'));
```

---

### 问题 3: 生成的 Merkle Root 每次都不同

**原因**: 当前实现使用简化的哈希算法，包含了时间戳

**影响**: 不影响功能，但每次生成的 Root 会不同

**解决**: 如果需要稳定的 Root，需要使用标准的 Merkle Tree 库

---

### 问题 4: 用户领取时提示 "Invalid proof"

**原因**: 
1. Merkle Root 不匹配（合约部署的 Root 与生成的不同）
2. Proof 数据错误
3. 用户地址不在 Merkle Tree 中

**解决**:
1. 确认合约部署时使用的 Merkle Root 正确
2. 确认用户已签到
3. 重新生成 Merkle Tree 并重新部署合约

---

### 问题 5: 用户领取时提示 "Drop already claimed"

**原因**: 该用户已经领取过代币

**解决**: 这是正常的，每个用户只能领取一次

---

## 📝 总结

### 关键点

1. **不需要先部署合约** - 合约部署是在生成 Merkle Tree **之后**

2. **正确的流程**:
   ```
   创建活动 → 用户签到 → 生成 Merkle Tree → 部署合约 → 转账代币 → 用户领取
   ```

3. **Merkle Tree 生成的前提**: 数据库中必须有签到记录

4. **活动 ID 必须匹配**: `checkins.event_id` 必须等于 `events.id` 或 `events.slug`

5. **每次签到 1000 个代币**: 根据代码，每个签到用户可领取 1000 个代币（18 位小数）

---

## 🎯 快速测试步骤

如果你想快速测试整个流程：

1. **在 D1 控制台插入测试数据**:
```sql
-- 创建活动
INSERT INTO events (id, name, slug, created_at)
VALUES ('test-2025', '测试活动', 'test-2025', strftime('%s', 'now'))
ON CONFLICT(id) DO NOTHING;

-- 插入 3 个测试签到
INSERT INTO checkins (event_id, wallet, code, created_at)
VALUES 
  ('test-2025', '0xef85456652ada05f12708b9bdcf215780e780d18', 'test-2025', datetime('now')),
  ('test-2025', '0x1111111111111111111111111111111111111111', 'test-2025', datetime('now')),
  ('test-2025', '0x2222222222222222222222222222222222222222', 'test-2025', datetime('now'));
```

2. **生成 Merkle Tree**:
   - 访问 `/admin/merkle.html`
   - 输入 `test-2025`
   - 生成并记录 Root

3. **部署合约**（使用 Remix 或 Hardhat）

4. **转账代币到合约**（3000 个代币）

5. **测试领取**（使用第一个测试地址）

---

**文档生成时间**: 2025-10-28  
**适用版本**: 当前系统  
**状态**: 已验证

