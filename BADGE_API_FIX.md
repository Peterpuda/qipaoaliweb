# 徽章 API 修复报告

## 🐛 问题描述

**错误信息**：
```
GET https://songbrocade-api.petterbrand03.workers.dev/badge/claim-ticket?product_id=id_19a28fd0a18_47a42e7525ca5&wallet=0xef85456652ada05f12708b9bdcf215780e780d18 
400 (Bad Request)
```

**根本原因**：
- 前端调用：`/badge/claim-ticket?product_id=...&wallet=...`
- 后端期望：`/badge/claim-ticket?order_id=...`
- **参数不匹配**：前端传递 `product_id` 和 `wallet`，后端只接受 `order_id`

---

## ✅ 修复内容

### 修改后端 API（`worker-api/index.js` Line 2228-2340）

**修复前**：
```javascript
// GET /badge/claim-ticket
if (pathname === "/badge/claim-ticket" && req.method === "GET") {
  const userCheck = await requireUser(req, env);
  if (!userCheck.ok) {
    return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
  }

  const orderId = searchParams.get("order_id");
  if (!orderId) {
    return withCors(errorResponse("missing order_id", 400), pickAllowedOrigin(req));
  }

  const rows = await query(env, `
    SELECT ... FROM badges_issues b
    LEFT JOIN orders o ON b.order_id = o.order_no
    WHERE b.order_id = ?
    LIMIT 1
  `, [orderId]);
  
  // ...
}
```

**修复后**：
```javascript
// GET /badge/claim-ticket
// 支持两种查询方式：
// 1. 通过 order_id 查询（用于订单页面）
// 2. 通过 product_id + wallet 查询（用于商品详情页）
if (pathname === "/badge/claim-ticket" && req.method === "GET") {
  const userCheck = await requireUser(req, env);
  if (!userCheck.ok) {
    return withCors(errorResponse("not allowed", 403), pickAllowedOrigin(req));
  }

  const orderId = searchParams.get("order_id");
  const productId = searchParams.get("product_id");
  const wallet = searchParams.get("wallet");

  let rows;

  if (orderId) {
    // ✅ 方式 1：通过 order_id 查询（用于订单页面）
    rows = await query(env, `
      SELECT ... FROM badges_issues b
      LEFT JOIN orders o ON b.order_id = o.order_no
      WHERE b.order_id = ?
      LIMIT 1
    `, [orderId]);
  } else if (productId && wallet) {
    // ✅ 方式 2：通过 product_id + wallet 查询（用于商品详情页）
    // 查找该用户购买该商品的最新订单
    rows = await query(env, `
      SELECT
        b.order_id,
        b.buyer_wallet,
        b.token_id,
        b.contract_addr,
        b.sig_payload,
        b.claimed,
        o.status AS order_status
      FROM badges_issues b
      LEFT JOIN orders o ON b.order_id = o.order_no
      WHERE o.product_id = ? 
        AND LOWER(o.wallet) = LOWER(?)
        AND o.status = 'completed'
      ORDER BY b.created_at DESC
      LIMIT 1
    `, [productId, wallet]);
    
    console.log(`🎖️ [Badge Check] product_id: ${productId}, wallet: ${wallet}, found: ${rows?.length > 0}`);
  } else {
    return withCors(
      errorResponse("missing order_id or (product_id + wallet)", 400),
      pickAllowedOrigin(req)
    );
  }

  if (!rows || !rows.length) {
    console.log(`⚠️ [Badge Check] No badge found`);
    // ✅ 返回友好的响应，而不是 404 错误
    return withCors(
      jsonResponse({ 
        ok: true, 
        claimable: false, 
        reason: 'no_purchase_or_badge_not_ready' 
      }),
      pickAllowedOrigin(req)
    );
  }

  const row = rows[0];
  
  // 验证钱包地址
  if (row.buyer_wallet.toLowerCase() !== userCheck.wallet.toLowerCase()) {
    return withCors(errorResponse("not your order", 403), pickAllowedOrigin(req));
  }
  
  // ... 返回徽章信息
}
```

---

## 📊 API 使用场景

### 场景 1：商品详情页检查徽章状态
**调用方式**：
```javascript
// frontend/product.html
const data = await auth.apiFetch(
  `/badge/claim-ticket?product_id=${product.id}&wallet=${getWalletAddress()}`
);
```

**后端逻辑**：
1. 查询该用户购买该商品的最新已完成订单
2. 查询该订单对应的徽章发放记录
3. 返回徽章信息（如果存在）

**响应示例**：
```json
{
  "ok": true,
  "claimable": false,
  "reason": "no_purchase_or_badge_not_ready"
}
```

或

```json
{
  "ok": true,
  "badge": {
    "order_id": "ORD_xxx",
    "token_id": 1,
    "contract_addr": "0x...",
    "sig_payload": "...",
    "claimed": false
  }
}
```

---

### 场景 2：订单页面查询徽章
**调用方式**：
```javascript
// frontend/orders/index.html
const data = await auth.apiFetch(`/badge/claim-ticket?order_id=${orderId}`);
```

**后端逻辑**：
1. 直接通过 `order_id` 查询徽章发放记录
2. 验证订单所有者
3. 返回徽章信息

---

## 🎯 修复效果

### 修复前 ❌
```
前端调用：/badge/claim-ticket?product_id=xxx&wallet=0x...
后端响应：400 Bad Request - missing order_id
```

### 修复后 ✅
```
前端调用：/badge/claim-ticket?product_id=xxx&wallet=0x...
后端逻辑：
  1. 检测到 product_id 和 wallet 参数
  2. 查询该用户购买该商品的订单
  3. 查询订单对应的徽章
  4. 返回徽章状态
后端响应：200 OK - { ok: true, claimable: false, reason: '...' }
```

---

## 🔍 调试日志

### 后端日志（Worker）
```bash
# 查看 Worker 日志
cd worker-api
npx wrangler tail --format pretty
```

**预期日志**：
```
🎖️ [Badge Check] product_id: id_19a28fd0a18_47a42e7525ca5, wallet: 0xef85456652ada05f12708b9bdcf215780e780d18, found: true
```

或

```
⚠️ [Badge Check] No badge found
```

---

## 📋 数据库查询

### 检查徽章发放记录
```sql
-- 检查特定商品的徽章发放记录
SELECT 
  b.order_id,
  b.buyer_wallet,
  b.token_id,
  b.claimed,
  o.product_id,
  o.status AS order_status,
  o.created_at
FROM badges_issues b
LEFT JOIN orders o ON b.order_id = o.order_no
WHERE o.product_id = 'id_19a28fd0a18_47a42e7525ca5'
ORDER BY b.created_at DESC;

-- 检查特定用户的徽章
SELECT 
  b.order_id,
  b.buyer_wallet,
  b.token_id,
  b.claimed,
  o.product_id,
  p.name_zh AS product_name
FROM badges_issues b
LEFT JOIN orders o ON b.order_id = o.order_no
LEFT JOIN products_new p ON o.product_id = p.id
WHERE LOWER(b.buyer_wallet) = LOWER('0xef85456652ada05f12708b9bdcf215780e780d18')
ORDER BY b.created_at DESC;
```

---

## 🚀 部署状态

- **Worker 版本**：5c28ab2a-551b-437d-b86b-2a5fecce1997
- **部署时间**：2025-11-02
- **修复内容**：
  - ✅ 支持通过 `product_id` + `wallet` 查询徽章
  - ✅ 保持向后兼容（仍支持 `order_id` 查询）
  - ✅ 添加详细的日志追踪
  - ✅ 改进错误处理（返回友好的响应）

---

## 🎉 验证步骤

1. **刷新商品详情页**
2. **打开浏览器开发者工具（F12）**
3. **切换到 Network 标签**
4. **查看 `/badge/claim-ticket` 请求**
5. **检查响应状态码**：
   - ✅ 应该是 200 OK（而不是 400 Bad Request）
6. **查看响应内容**：
   ```json
   {
     "ok": true,
     "claimable": false,
     "reason": "no_purchase_or_badge_not_ready"
   }
   ```

---

## 📚 相关文档

- **徽章合约部署指南**：`BADGE_CONTRACT_DEPLOYMENT_GUIDE.md`
- **文化故事调试指南**：`CULTURAL_NARRATIVES_DEBUG.md`
- **AI 数据隔离修复**：`AI_DATA_ISOLATION_FIX_COMPLETE.md`

---

**修复日期**：2025-11-02  
**修复人**：AI Assistant  
**状态**：✅ 已完成并部署

