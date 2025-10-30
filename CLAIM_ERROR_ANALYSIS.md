# 代币领取失败问题分析

**错误时间**: 2025-10-28  
**错误类型**: `CALL_EXCEPTION - missing revert data`  
**合约地址**: `0xb763A90039cc09CcbDcfF3feb28378fFF07B9c6C`  

---

## 🔍 错误分析

### 错误信息

```
Error: missing revert data 
action="estimateGas"
transaction={
  "data": "0x2e7ba6ef...",
  "from": "0xEf85456652ada05f12708b9bDcF215780E780D18",
  "to": "0xb763A90039cc09CcbDcfF3feb28378fFF07B9c6C"
}
```

### 交易数据解码

```
Function: claim(uint256 index, address account, uint256 amount, bytes32[] proof)

参数:
- index: 0
- account: 0xE7c5A43821Acb99f01e216B44e994f665d1e4998
- amount: 1000000000000000000000 (1000 tokens)
- proof: [0xa29707e61774a4eaea5e633f0bce720a256ce909ac1987add3f81fc379b522fe]
```

---

## ❌ 根本原因

### 问题 1: Merkle Proof 格式错误

**当前生成的 Proof**:
```javascript
const proof = [merkleRoot];  // ❌ 错误：直接使用 merkleRoot 作为 proof
```

**正确的 Merkle Proof 应该是**:
- Merkle Tree 中从叶子节点到根节点路径上的**兄弟节点**哈希
- 不是根节点本身
- 空数组 `[]` 表示只有一个叶子节点（特殊情况）

**示例**:
```
Merkle Tree 结构：
        Root
       /    \
      H1     H2
     / \    / \
    L1 L2  L3 L4

L1 的 proof: [L2, H2]  // 兄弟节点和叔叔节点
L2 的 proof: [L1, H2]
L3 的 proof: [L4, H1]
L4 的 proof: [L3, H1]
```

---

### 问题 2: 业务逻辑与合约不匹配

**当前业务逻辑**:
- Admin 创建活动后立即生成 Merkle Tree
- 不需要预先知道签到用户列表
- 用户签到后即可领取

**ERC20MerkleDistributor 合约的设计**:
- 需要预先知道所有可领取用户的地址列表
- 基于地址列表生成 Merkle Tree
- 每个地址都有固定的 index 和 proof
- **不支持动态添加用户**

**结论**: **ERC20MerkleDistributor 合约不适合当前的业务场景！**

---

## ✅ 解决方案

### 方案 1: 使用简化的空投合约（推荐）

我已经创建了一个新的合约 `SimpleAirdrop.sol`，它：
- ✅ 不使用复杂的 Merkle Tree
- ✅ 使用后端签名验证用户资格
- ✅ 支持动态添加用户（签到后即可领取）
- ✅ 更简单、更灵活

**工作流程**:
```
1. Admin 部署 SimpleAirdrop 合约
   ↓
2. Admin 转账代币到合约
   ↓
3. 用户签到
   ↓
4. 后端生成签名（证明用户已签到）
   ↓
5. 用户调用 claim(signature)
   ↓
6. 合约验证签名，转账代币 ✅
```

---

### 方案 2: 修改为传统 Merkle Tree 模式（不推荐）

如果坚持使用 MerkleDistributor，需要改回原来的逻辑：
- ❌ 必须等待用户签到
- ❌ 收集所有签到用户地址
- ❌ 生成标准的 Merkle Tree
- ❌ 后续签到的用户无法领取

**这违背了你的业务需求！**

---

### 方案 3: 使用白名单合约（折中方案）

创建一个白名单合约：
- Admin 可以动态添加地址到白名单
- 白名单中的地址可以领取
- 每个地址只能领取一次

---

## 🚀 推荐实施方案 1

### 步骤 1: 部署新合约

#### 合约文件

已创建：`contracts/contracts/SimpleAirdrop.sol`

#### 部署脚本

创建 `contracts/scripts/deploy-simple-airdrop.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa";  // 你的代币
  const amountPerClaim = hre.ethers.parseEther("1000");  // 每次领取 1000 个代币
  const eventId = hre.ethers.id("airdrop-2026");  // 活动 ID 的哈希
  const signerAddress = "0xEf85456652ada05f12708b9bDcF215780E780D18";  // 后端签名者地址
  
  console.log("部署 SimpleAirdrop...");
  console.log("Token:", tokenAddress);
  console.log("Amount per claim:", hre.ethers.formatEther(amountPerClaim), "tokens");
  console.log("Event ID:", eventId);
  console.log("Signer:", signerAddress);
  
  const SimpleAirdrop = await hre.ethers.getContractFactory("SimpleAirdrop");
  const airdrop = await SimpleAirdrop.deploy(
    tokenAddress,
    amountPerClaim,
    eventId,
    signerAddress
  );
  
  await airdrop.waitForDeployment();
  const address = await airdrop.getAddress();
  
  console.log("✅ 合约部署成功！");
  console.log("合约地址:", address);
  console.log("\n下一步：");
  console.log("1. 转账代币到合约：", address);
  console.log("2. 更新后端配置（AIRDROP_CONTRACT）");
  console.log("3. 更新前端配置（poap.config.js）");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### 部署命令

```bash
cd contracts
npx hardhat run scripts/deploy-simple-airdrop.js --network baseSepolia
```

---

### 步骤 2: 修改后端签名逻辑

修改 `worker-api/index.js` 中的领取资格接口，添加签名生成：

```javascript
// GET /rewards/v2/eligibility/:batch_id/:wallet
if (pathname.startsWith("/rewards/v2/eligibility/")) {
  // ... 现有的检查逻辑 ...
  
  // 生成签名
  const message = ethers.solidityPackedKeccak256(
    ['bytes32', 'address', 'uint256'],
    [eventId, wallet, amountPerUser]
  );
  
  // 使用后端私钥签名
  const signature = await signMessage(message, env.SIGNER_PRIVATE_KEY);
  
  return withCors(jsonResponse({ 
    ok: true,
    eligible: true,
    ready: true,
    amount: amountPerUser,
    signature: signature,  // ✅ 返回签名
    message: `您已签到 ${checkinCount} 次，可领取 1000 个代币`
  }), pickAllowedOrigin(req));
}
```

---

### 步骤 3: 修改前端调用逻辑

修改 `frontend/checkin/index.html` 中的 `claimTokens` 函数：

```javascript
// 新的 ABI（SimpleAirdrop）
const SIMPLE_AIRDROP_ABI = [
  {
    "inputs": [{"internalType": "bytes", "name": "signature", "type": "bytes"}],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "isClaimed",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function claimTokens() {
  // ... 现有的检查逻辑 ...
  
  // 获取签名
  const signature = eligData.signature;
  if (!signature) {
    setClaimLog('错误：未获取到签名');
    return;
  }
  
  // 连接合约并领取
  const ethersProvider = new ethers.BrowserProvider(window.ethereum);
  const signer = await ethersProvider.getSigner();
  const contract = new ethers.Contract(
    distributorContract, 
    SIMPLE_AIRDROP_ABI,  // ✅ 使用新的 ABI
    signer
  );
  
  // 调用 claim(signature)
  const tx = await contract.claim(signature);
  setClaimLog(`交易已提交：${tx.hash}\n等待确认...`);
  
  const receipt = await tx.wait();
  setClaimLog(`🎉 领取成功！\n✅ 已到账 1000 枚代币\n📦 区块：${receipt.blockNumber}`);
}
```

---

## 📊 方案对比

| 特性 | MerkleDistributor | SimpleAirdrop |
|------|------------------|---------------|
| **复杂度** | 高 | 低 |
| **Gas 成本** | 中等 | 低 |
| **动态添加用户** | ❌ 不支持 | ✅ 支持 |
| **预先知道用户** | ✅ 需要 | ❌ 不需要 |
| **适合签到场景** | ❌ 不适合 | ✅ 适合 |
| **安全性** | 高（链上验证） | 高（签名验证） |
| **灵活性** | 低 | 高 |

---

## 🎯 快速修复（临时方案）

如果你想快速测试，可以先修改后端返回空的 proof：

```javascript
// 返回空 proof（仅适用于只有一个用户的情况）
const proof = [];

return withCors(jsonResponse({ 
  ok: true,
  eligible: true,
  ready: true,
  index: 0,
  amount: amountPerUser,
  proof: proof,  // ✅ 空数组
  message: `您已签到 ${checkinCount} 次，可领取 1000 个代币`
}), pickAllowedOrigin(req));
```

**但这只在 Merkle Tree 中只有一个叶子节点时才有效！**

---

## 📝 总结

### 当前问题

❌ **ERC20MerkleDistributor 合约不适合当前的业务逻辑**
- 需要预先知道所有用户地址
- 不支持动态添加用户
- 必须生成标准的 Merkle Tree

### 推荐解决方案

✅ **使用 SimpleAirdrop 合约**
- 支持动态添加用户（签到后即可领取）
- 使用后端签名验证
- 更简单、更灵活
- 完全符合你的业务需求

### 下一步

1. **部署 SimpleAirdrop 合约**
2. **修改后端添加签名生成**
3. **修改前端使用新的 ABI**
4. **测试领取功能**

---

**文档生成时间**: 2025-10-28  
**问题状态**: 已分析  
**推荐方案**: SimpleAirdrop 合约  
**预计工作量**: 1-2 小时

