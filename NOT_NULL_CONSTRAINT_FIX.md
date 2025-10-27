# 🐛 NOT NULL 约束错误修复报告

## 修复时间
2025-10-27

---

## 🔍 问题描述

### 错误信息
```
POST /admin/event-upsert 500 (Internal Server Error)
Error: INTERNAL_ERROR
D1_ERROR: NOT NULL constraint failed: events.poap_contract: SQLITE_CONSTRAINT
```

### 根本原因

数据库表 `events` 中的 `poap_contract` 字段有 `NOT NULL` 约束，但代码在创建活动时传入了 `null` 值。

**数据库表结构**:
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  start_time TEXT,
  poap_contract TEXT NOT NULL,  -- ❌ NOT NULL 约束
  chain_id INTEGER,
  created_by TEXT,
  created_at TEXT
);
```

**错误代码** (第556行):
```javascript
await run(env, `
  INSERT INTO events (
    slug, name, start_time, location,
    poap_contract,  -- 字段要求NOT NULL
    chain_id, created_by, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`, [
  eventSlug,
  eventTitle,
  startTimeStr,
  body.location || null,
  body.poap_contract || null,  // ❌ 传入null违反约束
  body.chain_id || null,
  adminCheck.wallet || null,
  nowSec
]);
```

---

## 🔧 修复方案

### 提供默认POAP合约地址

**文件**: `worker-api/index.js`

**位置**: 第538-563行

**修改后**:
```javascript
} else {
  // 不存在：插入新活动（id是自增的INTEGER，不需要手动指定）
  // 注意：poap_contract字段有NOT NULL约束，必须提供默认值
  const defaultContract = "0xBBEd6739c0250F9C4e0e48D5BAAa68B4b1F94222"; // Base Sepolia测试合约

  await run(env, `
    INSERT INTO events (
      slug,
      name,
      start_time,
      location,
      poap_contract,
      chain_id,
      created_by,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    eventSlug,
    eventTitle,
    startTimeStr,
    body.location || null,
    body.poap_contract || defaultContract,  // ✅ 提供默认值
    body.chain_id || null,
    adminCheck.wallet || null,
    nowSec
  ]);

  // 获取新插入的ID
  const newRows = await query(env, `SELECT id FROM events WHERE slug = ? LIMIT 1`, [eventSlug]);
  const newId = newRows && newRows[0] ? newRows[0].id : null;

  return withCors(
    jsonResponse({
      ok: true,
      id: newId,
      slug: eventSlug,
      static_code: eventSlug
    }),
    pickAllowedOrigin(req)
  );
}
```

**关键变化**:
- ✅ 定义了默认POAP合约地址：`0xBBEd6739c0250F9C4e0e48D5BAAa68B4b1F94222`
- ✅ 使用 `body.poap_contract || defaultContract` 确保始终有值
- ✅ 满足数据库的NOT NULL约束

---

## 📦 部署

```bash
cd worker-api
npx wrangler deploy
```

**部署结果**:
- ✅ Version ID: a680b218-31b9-4dd2-b764-365cdaf63d3c
- ✅ Startup Time: 18ms
- ✅ URL: https://songbrocade-api.petterbrand03.workers.dev

---

## ✅ 验证测试

### 测试1: 创建新活动（不提供合约地址）

**请求**:
```bash
curl -X POST https://songbrocade-api.petterbrand03.workers.dev/admin/event-upsert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "slug": "test-event-202510",
    "title": "测试活动2025",
    "start_ts": 1735113600,
    "location": "上海"
  }'
```

**响应**: ✅ 成功
```json
{
  "ok": true,
  "id": 23,
  "slug": "test-event-202510",
  "static_code": "test-event-202510"
}
```

### 测试2: 验证活动已插入数据库

**请求**:
```bash
curl https://songbrocade-api.petterbrand03.workers.dev/poap/events
```

**响应**: ✅ 成功
```json
{
  "ok": true,
  "events": [
    {
      "id": 23,
      "slug": "test-event-202510",
      "name": "测试活动2025",
      "location": "上海",
      "start_time": "2024/12/25 08:00:00",
      "poap_contract": "0xBBEd6739c0250F9C4e0e48D5BAAa68B4b1F94222",
      "created_at": "1761555800.0"
    }
  ]
}
```

### 测试3: 前端活动管理页面

**操作流程**:
1. ✅ 访问 https://songbrocade-frontend.pages.dev/admin/events.html
2. ✅ 填写活动信息（slug、标题、时间）
3. ✅ 点击"保存/更新活动"
4. ✅ 提示"活动已保存"
5. ✅ 活动列表更新显示新活动
6. ✅ 可以获取签到码
7. ✅ 二维码正常生成

---

## 📊 修复效果

### 修复前
- ❌ POST /admin/event-upsert → 500错误
- ❌ 错误信息: "NOT NULL constraint failed: events.poap_contract"
- ❌ 无法创建活动
- ❌ 活动管理功能不可用

### 修复后
- ✅ POST /admin/event-upsert → 200成功
- ✅ 活动成功插入数据库
- ✅ 自动使用默认POAP合约地址
- ✅ 活动管理功能完全可用
- ✅ 前端界面正常工作

---

## 🎯 技术要点

### 1. 数据库NOT NULL约束处理

**错误做法** ❌:
```javascript
// 如果body中没有提供，就传null
body.poap_contract || null  // 违反NOT NULL约束
```

**正确做法** ✅:
```javascript
// 提供合理的默认值
const defaultContract = "0xBBEd6739c0250F9C4e0e48D5BAAa68B4b1F94222";
body.poap_contract || defaultContract  // 始终有值
```

### 2. 默认值选择

对于POAP合约地址，我们使用：
```
0xBBEd6739c0250F9C4e0e48D5BAAa68B4b1F94222
```

这是一个在 Base Sepolia 测试网上部署的POAP合约，所有已有活动都使用这个地址。

### 3. 字段约束最佳实践

在设计数据库时：
- ✅ 必填字段才使用 NOT NULL
- ✅ 提供合理的默认值
- ✅ 在应用层和数据库层同时验证
- ✅ 为用户提供清晰的错误提示

---

## 📝 相关字段

### events 表必填字段

| 字段 | 类型 | 约束 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INTEGER | PRIMARY KEY | 自增 | 活动ID |
| slug | TEXT | NOT NULL | - | 活动唯一标识 |
| name | TEXT | NOT NULL | - | 活动名称 |
| poap_contract | TEXT | NOT NULL | 0xBBEd6739... | POAP合约地址 |

### events 表可选字段

| 字段 | 类型 | 约束 | 默认值 | 说明 |
|------|------|------|--------|------|
| location | TEXT | NULL | null | 活动地点 |
| start_time | TEXT | NULL | null | 开始时间 |
| chain_id | INTEGER | NULL | null | 区块链ID |
| created_by | TEXT | NULL | null | 创建者钱包地址 |
| created_at | TEXT | NULL | null | 创建时间 |

---

## 💡 使用指南

### 创建活动（前端）

1. **最小化信息**（只填必填字段）:
   ```javascript
   {
     "slug": "my-event-2025",
     "title": "我的活动"
   }
   ```
   系统会自动填充：
   - poap_contract: 默认测试合约
   - start_time: "即刻起"
   - created_at: 当前时间戳

2. **完整信息**:
   ```javascript
   {
     "slug": "complete-event-2025",
     "title": "完整活动信息",
     "start_ts": 1735113600,
     "location": "上海",
     "poap_contract": "0x自定义合约地址"
   }
   ```

### 更新活动

如果活动已存在（相同slug），系统会更新而不是创建新记录：
```javascript
{
  "slug": "existing-event",  // 已存在的slug
  "title": "更新后的标题"
}
```

---

## 🔄 完整修复历史

### 第一次修复 (bd57fcc3)
- ✅ 添加 `/poap/events` 端点
- ✅ 修复ID类型匹配问题（INTEGER vs STRING）

### 第二次修复 (a680b218) - 本次
- ✅ 修复NOT NULL约束错误
- ✅ 提供默认POAP合约地址
- ✅ 活动创建功能完全可用

---

## 🎉 修复状态

| 问题 | 状态 | 修复版本 |
|------|------|----------|
| /poap/events 404 | ✅ 已修复 | bd57fcc3 |
| ID类型不匹配 | ✅ 已修复 | bd57fcc3 |
| NOT NULL约束失败 | ✅ 已修复 | a680b218 |
| 活动创建成功 | ✅ 验证通过 | a680b218 |
| 活动列表显示 | ✅ 正常 | a680b218 |
| 签到码生成 | ✅ 可用 | a680b218 |

---

## 🌐 测试活动

已成功创建测试活动：
```json
{
  "id": 23,
  "slug": "test-event-202510",
  "name": "测试活动2025",
  "location": "上海",
  "start_time": "2024/12/25 08:00:00",
  "poap_contract": "0xBBEd6739c0250F9C4e0e48D5BAAa68B4b1F94222",
  "created_at": "1761555800.0"
}
```

---

**修复完成时间**: 2025-10-27
**修复人**: Automated Fix
**验证状态**: ✅ 完全通过

## 🎯 现在可以正常创建活动了！

请刷新页面并尝试创建新活动：
1. 填写 slug（如：my-event-2025）
2. 填写标题（如：我的活动）
3. 可选：填写时间和地点
4. 点击"保存/更新活动"
5. 成功后可以获取签到码和二维码

所有功能现在都应该正常工作了！🎉
