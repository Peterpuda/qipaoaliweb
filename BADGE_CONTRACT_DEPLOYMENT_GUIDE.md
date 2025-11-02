# 🎖️ 徽章合约部署指南

## 📋 概述

本指南将帮助您部署 **Poap1155WithSig** 徽章合约，并配置商品管理系统的自动填充功能。

---

## 🎯 功能说明

### 徽章合约的作用

- **正品认证**：用户购买商品后自动获得 NFT 徽章
- **链上证明**：徽章永久存储在区块链，不可篡改
- **权益凭证**：可用于会员权益、社区治理等
- **防伪溯源**：完整记录商品购买和流转历史

### 工作流程

```
用户购买商品
    ↓
订单完成（status = completed）
    ↓
后端自动生成徽章签名
    ↓
用户在订单页面点击"领取徽章"
    ↓
NFT 铸造到用户钱包
```

---

## 🚀 部署步骤

### 前置条件

1. **安装依赖**
   ```bash
   cd contracts
   npm install
   ```

2. **配置环境变量**
   ```bash
   # 创建 .env 文件
   cp .env.example .env
   
   # 编辑 .env，填入以下内容：
   # PK=你的钱包私钥（用于部署合约）
   # RPC_URL=https://sepolia.base.org
   # BASESCAN_KEY=你的 Basescan API Key（可选）
   ```

3. **获取测试 ETH**
   - 访问水龙头：https://www.alchemy.com/faucets/base-sepolia
   - 输入你的钱包地址
   - 领取测试 ETH（用于支付 Gas 费）

---

### 步骤 1：编译合约

```bash
cd contracts
npx hardhat compile
```

**预期输出**：
```
✓ Compiled 1 Solidity file successfully
```

---

### 步骤 2：部署合约

```bash
npx hardhat run scripts/deploy-badge-contract.js --network baseSepolia
```

**预期输出**：
```
🚀 开始部署 Poap1155WithSig 徽章合约...

📝 部署账户: 0x88E73089789F4902428fcc5BA3033464A4d223Ef
💰 账户余额: 0.1 ETH

⏳ 正在部署合约...

✅ 合约部署成功！
📍 合约地址: 0xABC123...DEF456
👤 合约 Owner: 0x88E73089789F4902428fcc5BA3033464A4d223Ef
🔗 区块链浏览器: https://sepolia.basescan.org/address/0xABC123...DEF456

💾 部署信息已保存到: deployment-badge-contract.json
```

**重要**：记录合约地址（例如：`0xABC123...DEF456`）

---

### 步骤 3：更新前端配置

编辑 `frontend/poap.config.js`：

```javascript
window.POAP_CONFIG = {
  // ... 其他配置 ...
  
  // 🎖️ POAP 徽章合约地址（Poap1155WithSig）
  BADGE_CONTRACT: "0xABC123...DEF456" // ← 填入刚才部署的合约地址
};
```

---

### 步骤 4：配置后端签名密钥

后端需要使用管理员私钥来签名徽章：

```bash
cd worker-api
npx wrangler secret put ADMIN_PRIVATE_KEY
```

**输入提示**：
```
Enter a secret value: 
```

**输入内容**：部署合约的钱包私钥（与 contracts/.env 中的 PK 相同）

**注意**：
- 这个私钥必须与合约的 Owner 地址一致
- 私钥用于离线签名，不会上链
- 请妥善保管私钥，不要泄露

---

### 步骤 5：部署前端

```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26
npx wrangler pages deploy frontend --project-name=poap-checkin-frontend --branch=prod --commit-message="Add badge contract auto-fill feature" --commit-dirty=true
```

---

## 🎯 使用指南

### 在商品管理页面使用

1. **访问商品管理页面**
   ```
   https://10break.com/admin/products.html
   ```

2. **创建或编辑商品**
   - 填写基本信息（传承人、标题、价格等）
   - 找到"徽章合约地址"字段

3. **自动填充合约地址**
   - 点击"自动填充默认合约"按钮
   - 系统自动填入配置的合约地址
   - 或者手动输入合约地址

4. **保存商品**
   - 点击"保存 / 更新 商品"
   - 商品现在支持徽章功能了！

---

## 🔍 验证部署

### 1. 检查合约状态

访问区块链浏览器：
```
https://sepolia.basescan.org/address/你的合约地址
```

确认：
- ✅ 合约已部署
- ✅ Owner 地址正确
- ✅ 合约代码已验证（可选）

### 2. 测试完整流程

#### 步骤 A：创建测试商品
```
标题：测试商品 - 徽章功能
价格：0.001 ETH
徽章合约地址：[点击自动填充]
```

#### 步骤 B：模拟购买
```
1. 访问商城页面
2. 购买测试商品
3. 完成支付
4. 订单状态变为 "completed"
```

#### 步骤 C：领取徽章
```
1. 访问订单页面
2. 找到已完成的订单
3. 点击"领取正品认证徽章"
4. 钱包弹出签名请求
5. 确认交易
6. 等待交易确认
7. ✅ NFT 徽章到账！
```

#### 步骤 D：查看徽章
```
1. 在 OpenSea 测试网查看：
   https://testnets.opensea.io/account
2. 或在钱包中查看 NFT 资产
```

---

## 📊 部署信息

### 当前已部署的合约

| 合约名称 | 地址 | 用途 |
|---------|------|------|
| ERC20MerkleDistributor | `0xb763A90039cc09CcbDcfF3feb28378fFF07B9c6C` | 代币空投 |
| SimpleAirdrop | `0x7b610A0F58e3DEc873FEe2F1c95912C5435A7491` | 简单空投 V1 |
| SimpleAirdropV2 | `0xb21e9bA27D42c30eCbC155Ed3FFbE575A449f6a2` | 简单空投 V2 |
| **Poap1155WithSig** | **待部署** | **NFT 徽章** |

### 网络信息

- **网络**：Base Sepolia
- **Chain ID**：84532
- **RPC URL**：https://sepolia.base.org
- **浏览器**：https://sepolia.basescan.org
- **水龙头**：https://www.alchemy.com/faucets/base-sepolia

---

## 🔧 技术细节

### 合约接口

```solidity
// Poap1155WithSig.sol
contract Poap1155WithSig is ERC1155, Ownable, EIP712 {
    // 铸造徽章（需要管理员签名）
    function mintWithSig(
        address to,           // 领取者地址
        uint256 eventId,      // tokenId（商品ID）
        uint256 amount,       // 数量（通常为1）
        uint256 deadline,     // 签名有效期
        uint8 v, bytes32 r, bytes32 s  // 签名参数
    ) external;
    
    // 设置 tokenURI（管理员）
    function setURI(uint256 eventId, string calldata newuri) external onlyOwner;
    
    // 查询 URI
    function uri(uint256 id) public view returns (string memory);
}
```

### 后端签名生成

```javascript
// worker-api/index.js
async function ensureBadgeIssueForOrder(env, orderNo) {
  // 1. 查询订单和商品信息
  const order = await query(env, `
    SELECT o.*, p.badge_contract
    FROM orders o
    LEFT JOIN products_new p ON o.product_id = p.id
    WHERE o.order_no = ?
  `, [orderNo]);
  
  // 2. 检查是否有徽章合约
  if (!order.badge_contract) {
    return { ok: false, reason: "NO_BADGE_CONTRACT" };
  }
  
  // 3. 生成签名数据（使用 EIP-712）
  const sigPayload = await buildBadgeSignaturePayload(env, {
    badgeContract: order.badge_contract,
    tokenId: order.product_id,
    toWallet: order.buyer_wallet,
    nonce: badgeId,
    deadline: nowSec + 7*24*3600  // 7天有效
  });
  
  // 4. 存入数据库
  await run(env, `
    INSERT INTO badges_issues (...)
    VALUES (?, ?, ?, ?, ?, ?, ...)
  `, [...]);
}
```

### 前端领取流程

```javascript
// frontend/orders/index.html
async function claimBadge(orderId) {
  // 1. 获取签名数据
  const ticket = await fetch(`${API_BASE}/badge/claim-ticket?order_id=${orderId}`);
  const { badge } = await ticket.json();
  
  // 2. 调用合约
  const contract = new ethers.Contract(
    badge.payload.contract,
    BADGE_ABI,
    signer
  );
  
  // 3. 铸造 NFT
  const tx = await contract.mintWithSig(
    badge.payload.wallet,
    badge.payload.tokenId,
    1,
    badge.payload.deadline,
    badge.payload.v,
    badge.payload.r,
    badge.payload.s
  );
  
  await tx.wait();
  alert("徽章领取成功！");
}
```

---

## ⚠️ 注意事项

### 1. 安全性

- ✅ 私钥使用环境变量安全存储
- ✅ 签名有 7 天有效期，过期自动失效
- ✅ 每个用户每个商品只能领取一次
- ✅ 合约 Owner 权限严格控制

### 2. Gas 费用

- 部署合约：约 0.001 - 0.002 ETH
- 铸造 NFT：约 0.0001 - 0.0003 ETH（用户支付）
- 建议准备：0.01 ETH 测试费用

### 3. 合约升级

- ERC-1155 合约部署后不可修改
- 如需更新功能，需部署新合约
- 可以更新商品配置指向新合约

### 4. 多商品支持

- ✅ 一个合约支持无限个商品
- ✅ 通过 tokenId 区分不同商品
- ✅ 同一商品可以发放多个徽章

---

## 🐛 故障排除

### 问题 1：部署失败 - 余额不足

**错误信息**：
```
Error: insufficient funds for gas
```

**解决方案**：
1. 访问水龙头领取测试 ETH
2. 确认钱包地址正确
3. 等待几分钟后重试

### 问题 2：自动填充按钮无效

**错误信息**：
```
⚠️ 徽章合约尚未配置
```

**解决方案**：
1. 确认已部署合约
2. 检查 `frontend/poap.config.js` 中的 `BADGE_CONTRACT` 配置
3. 确认配置不为空字符串
4. 重新部署前端

### 问题 3：用户无法领取徽章

**可能原因**：
- 后端签名密钥未配置
- 签名密钥与合约 Owner 不一致
- 订单状态不是 "completed"
- 商品未配置徽章合约地址

**解决方案**：
1. 检查 Worker 环境变量：`ADMIN_PRIVATE_KEY`
2. 确认私钥对应的地址是合约 Owner
3. 检查订单状态
4. 检查商品的 `badge_contract` 字段

### 问题 4：签名验证失败

**错误信息**：
```
Error: invalid signer
```

**解决方案**：
1. 确认后端使用的私钥正确
2. 检查签名格式（v, r, s）
3. 确认 EIP-712 domain 配置正确
4. 检查合约 Owner 地址

---

## 📚 相关文档

- [ERC-1155 标准](https://eips.ethereum.org/EIPS/eip-1155)
- [EIP-712 签名标准](https://eips.ethereum.org/EIPS/eip-712)
- [Base Sepolia 测试网](https://docs.base.org/network-information/)
- [Hardhat 文档](https://hardhat.org/docs)

---

## ✅ 检查清单

部署前：
- [ ] 已安装 Node.js 和 npm
- [ ] 已安装合约依赖（`npm install`）
- [ ] 已配置 `.env` 文件
- [ ] 钱包有足够的测试 ETH

部署后：
- [ ] 合约地址已记录
- [ ] 前端配置已更新（`poap.config.js`）
- [ ] 后端签名密钥已配置（`ADMIN_PRIVATE_KEY`）
- [ ] 前端已重新部署
- [ ] 已测试完整流程

---

**部署完成时间**：待部署  
**当前状态**：⏳ 等待部署  
**预计用时**：5-10 分钟

