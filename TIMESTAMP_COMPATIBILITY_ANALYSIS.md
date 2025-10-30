# 时间戳字段兼容性分析和实施计划

**分析时间**: 2025-10-28  
**目标**: 将 events 页面的时间输入从 `type="number"` 改为 `type="datetime-local"`，同时确保所有相关代码兼容  

---

## 🔍 当前系统架构分析

### 数据库结构（D1）

**events 表** (`worker-api/utils/db.js` 第 7-19 行):
```sql
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_at TEXT,           -- 文本格式的开始时间
  end_at TEXT,             -- 文本格式的结束时间
  start_ts INTEGER,        -- Unix 时间戳（秒）
  end_ts INTEGER,          -- Unix 时间戳（秒）
  location TEXT,
  poap_contract TEXT,
  chain_id INTEGER,
  created_by TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
)
```

**关键发现**:
- ✅ 数据库同时支持 `start_at/end_at` (TEXT) 和 `start_ts/end_ts` (INTEGER)
- ✅ `start_ts` 和 `end_ts` 是 INTEGER 类型，存储 Unix 时间戳（秒）
- ✅ 字段允许 NULL 值

---

## 📊 所有引用点分析

### 1. 前端 - events.html

**当前实现** (第 69-75 行):
```html
<input id="evStart" name="start_ts" type="number" placeholder="留空=now"/>
<input id="evEnd" name="end_ts" type="number" placeholder="留空=+1天"/>
```

**JavaScript 处理** (第 201-202 行):
```javascript
start_ts: formData.start_ts ? Number(formData.start_ts) : null,
end_ts: formData.end_ts ? Number(formData.end_ts) : null
```

**发送到后端的数据格式**:
```json
{
  "slug": "qipao-20251208",
  "title": "旗袍活动",
  "start_ts": 1730188800,  // Unix 时间戳（秒）
  "end_ts": 1730275200     // Unix 时间戳（秒）
}
```

---

### 2. 后端 API - worker-api/index.js

#### 2.1 `/admin/event-upsert` 接口 (第 1445-1540 行)

**接收数据**:
```javascript
const body = await readJson(req);
// 前端传：slug, title, start_ts?, end_ts?
```

**当前处理逻辑**:
```javascript
// 第 1465-1473 行：只使用 start_ts 生成显示字符串
let startTimeStr = "即刻起";
if (body.start_ts) {
  const tsNum = Number(body.start_ts);
  if (!isNaN(tsNum)) {
    const d = new Date(tsNum * 1000);  // ⚠️ 注意：这里乘以 1000
    startTimeStr = d.toLocaleString("zh-CN", { hour12: false });
  }
}

// 第 1487-1498 行：UPDATE 时只更新 name 和 start_time（文本）
UPDATE events
SET name = ?,
    start_time = ?,  -- 存储格式化后的字符串
    created_at = COALESCE(created_at, ?)
WHERE id = ?

// 第 1514-1540 行：INSERT 时也只使用 start_time（文本）
INSERT INTO events (
  slug, name, start_time, location, poap_contract, chain_id, created_by, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
```

**⚠️ 关键发现**:
- 当前 `/admin/event-upsert` 接口**不保存** `start_ts` 和 `end_ts` 到数据库
- 只将 `start_ts` 转换为字符串后保存到 `start_time` 字段
- `end_ts` 完全被忽略

---

#### 2.2 `/poap/events` 接口 (第 2211-2230 行)

**这是另一个创建活动的接口**:
```javascript
// 第 2221-2227 行：这个接口会保存 start_ts 和 end_ts
INSERT INTO events (
  id, name, start_at, end_at, start_ts, end_ts, 
  location, poap_contract, chain_id, created_by, created_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s','now'))
```

**参数**:
```javascript
[
  id, 
  body.name, 
  body.start_at || null,    // 文本格式
  body.end_at || null,      // 文本格式
  body.start_ts || null,    // 时间戳
  body.end_ts || null,      // 时间戳
  body.location || null,
  body.poap_contract || null, 
  body.chain_id || null, 
  addr
]
```

---

#### 2.3 `GET /poap/events` 接口 (第 2188-2207 行)

**返回数据**:
```javascript
// 第 2196-2204 行：构造返回数据
const mapped = rows.map(r => {
  const fakeStartTs = r.created_at || 0; // ⚠️ 用 created_at 近似 start_ts
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    created_at: r.created_at,
    start_ts: fakeStartTs  // ⚠️ 这里返回的是 created_at，不是真实的 start_ts
  };
});
```

**⚠️ 关键发现**:
- 当前实现**没有读取**数据库中的 `start_ts` 和 `end_ts` 字段
- 而是用 `created_at` 伪造了 `start_ts`
- 前端 `displayEvents()` 函数依赖这个 `start_ts` 来判断活动状态

---

### 3. 前端 - events.html displayEvents() 函数

**当前实现** (第 303-306 行):
```javascript
const isActive = event.start_ts && event.start_ts > Date.now() / 1000;
const statusClass = isActive ? 'pill-ok' : 'pill-warning';
const statusText = isActive ? '进行中' : '已结束';
```

**⚠️ 问题**:
- 依赖 `start_ts` 判断活动状态
- 但后端返回的 `start_ts` 实际是 `created_at`
- 逻辑错误：`start_ts > Date.now() / 1000` 应该是 `<` 才对（开始时间小于当前时间才是进行中）

---

## 🎯 兼容性问题总结

### 问题 1: 数据不一致
- `/admin/event-upsert` 不保存 `start_ts` 和 `end_ts`
- `/poap/events` 保存 `start_ts` 和 `end_ts`
- 两个接口行为不一致

### 问题 2: 数据丢失
- 前端发送了 `start_ts` 和 `end_ts`
- 但 `/admin/event-upsert` 只保存了转换后的文本到 `start_time`
- 时间戳数据丢失

### 问题 3: 读取错误
- `GET /poap/events` 不读取真实的 `start_ts`
- 而是用 `created_at` 伪造
- 导致前端无法正确判断活动状态

### 问题 4: 逻辑错误
- 前端判断活动状态的逻辑错误
- `start_ts > now` 应该是 `start_ts < now && end_ts > now`

---

## ✅ 完整解决方案

### 方案概述

1. **前端改进**: 使用 `datetime-local` 输入，JavaScript 转换为时间戳
2. **后端修复**: 同时保存 `start_ts` 和 `end_ts` 到数据库
3. **读取修复**: 返回真实的 `start_ts` 和 `end_ts`
4. **逻辑修复**: 正确判断活动状态（未开始/进行中/已结束）

### 实施步骤

#### 步骤 1: 修改前端 events.html

**HTML 表单**:
```html
<div class="field">
  <label>开始时间</label>
  <input 
    id="evStart" 
    name="start_time" 
    type="datetime-local" 
    placeholder="选择开始时间"
  />
  <small>留空则使用当前时间</small>
</div>
<div class="field">
  <label>结束时间</label>
  <input 
    id="evEnd" 
    name="end_time" 
    type="datetime-local" 
    placeholder="选择结束时间"
  />
  <small>留空则为开始时间 + 1 天</small>
</div>
```

**JavaScript 工具函数**:
```javascript
// 将 datetime-local 值转换为 Unix 时间戳（秒）
function datetimeToTimestamp(datetimeStr) {
  if (!datetimeStr) return null;
  return Math.floor(new Date(datetimeStr).getTime() / 1000);
}

// 将 Unix 时间戳（秒）转换为 datetime-local 值
function timestampToDatetime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toISOString().slice(0, 16);
}
```

**保存逻辑**:
```javascript
async function handleSaveEvent() {
  if (!ensureAuth()) return;
  
  const formData = getFormData('eventForm');
  const errors = validateForm(formData, ['slug', 'title']);
  
  if (errors.length > 0) {
    toast(errors.join(', '), 'error');
    return;
  }
  
  // 转换时间为时间戳
  const startTs = datetimeToTimestamp(formData.start_time);
  const endTs = datetimeToTimestamp(formData.end_time);
  
  // 验证时间逻辑
  if (startTs && endTs && startTs >= endTs) {
    toast('结束时间必须晚于开始时间', 'error');
    return;
  }
  
  const payload = {
    slug: formData.slug.trim(),
    title: formData.title.trim(),
    start_ts: startTs,  // ✅ 发送时间戳（秒）
    end_ts: endTs       // ✅ 发送时间戳（秒）
  };
  
  // ... 发送到后端
}
```

**显示逻辑**:
```javascript
function displayEvents(events) {
  const container = $('#eventsList');
  
  if (!events || events.length === 0) {
    container.innerHTML = '<div class="list-item text-center">暂无活动</div>';
    return;
  }
  
  container.innerHTML = events.map(event => {
    const now = Date.now() / 1000;
    
    // ✅ 正确的状态判断逻辑
    let statusClass = 'pill-warning';
    let statusText = '未知';
    
    if (event.start_ts && event.end_ts) {
      if (now < event.start_ts) {
        statusClass = 'pill-info';
        statusText = '未开始';
      } else if (now >= event.start_ts && now <= event.end_ts) {
        statusClass = 'pill-ok';
        statusText = '进行中';
      } else {
        statusClass = 'pill-error';
        statusText = '已结束';
      }
    } else if (event.start_ts) {
      statusClass = now >= event.start_ts ? 'pill-ok' : 'pill-info';
      statusText = now >= event.start_ts ? '进行中' : '未开始';
    }
    
    return `
      <div class="list-item">
        <div style="flex: 1;">
          <div style="font-weight: 600;">${event.name || '未命名活动'}</div>
          <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">
            Slug: ${event.slug || 'N/A'}
          </div>
          <div style="font-size: 11px; color: var(--muted); margin-top: 2px;">
            开始: ${event.start_ts ? new Date(event.start_ts * 1000).toLocaleString('zh-CN') : '未设置'}<br>
            结束: ${event.end_ts ? new Date(event.end_ts * 1000).toLocaleString('zh-CN') : '未设置'}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
          <span class="pill ${statusClass}">${statusText}</span>
          <button 
            class="btn btn-sm btn-secondary" 
            onclick="editEvent('${event.slug}')"
            style="font-size: 11px; padding: 4px 8px;"
          >
            编辑
          </button>
        </div>
      </div>
    `;
  }).join('');
}
```

---

#### 步骤 2: 修改后端 `/admin/event-upsert` 接口

**修改 `worker-api/index.js` 第 1487-1540 行**:

```javascript
// UPDATE 逻辑
if (existingRows && existingRows.length > 0) {
  const existingId = existingRows[0].id;

  // ✅ 同时更新 start_time（文本）和 start_ts/end_ts（时间戳）
  await run(env, `
    UPDATE events
    SET name = ?,
        start_time = ?,
        start_ts = ?,
        end_ts = ?,
        created_at = COALESCE(created_at, ?)
    WHERE id = ?
  `, [
    eventTitle,
    startTimeStr,           // 格式化的字符串
    body.start_ts || null,  // ✅ 保存时间戳
    body.end_ts || null,    // ✅ 保存时间戳
    nowSec,
    existingId
  ]);

  return withCors(
    jsonResponse({
      ok: true,
      id: existingId,
      slug: eventSlug,
      static_code: eventSlug
    }),
    pickAllowedOrigin(req)
  );
}

// INSERT 逻辑
else {
  const defaultContract = "0xBBEd6739c0250F9C4e0e48D5BAAa68B4b1F94222";

  await run(env, `
    INSERT INTO events (
      slug,
      name,
      start_time,
      start_ts,
      end_ts,
      location,
      poap_contract,
      chain_id,
      created_by,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    eventSlug,
    eventTitle,
    startTimeStr,           // 格式化的字符串
    body.start_ts || null,  // ✅ 保存时间戳
    body.end_ts || null,    // ✅ 保存时间戳
    body.location || "",
    defaultContract,
    84532,
    adminCheck.wallet || "system",
    nowSec
  ]);

  // ... 返回响应
}
```

---

#### 步骤 3: 修改后端 `GET /poap/events` 接口

**修改 `worker-api/index.js` 第 2188-2207 行**:

```javascript
// GET /poap/events
if (path === 'poap/events' && req.method === 'GET') {
  // ✅ 查询时包含 start_ts 和 end_ts
  const rows = await query(env, `
    SELECT id, slug, name, start_ts, end_ts, created_at
    FROM events
    ORDER BY created_at DESC
    LIMIT 200
  `);

  // ✅ 返回真实的 start_ts 和 end_ts
  const mapped = rows.map(r => {
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      created_at: r.created_at,
      start_ts: r.start_ts || null,  // ✅ 返回真实值
      end_ts: r.end_ts || null        // ✅ 返回真实值
    };
  });

  return json(env, { ok: true, events: mapped });
}
```

---

## 🧪 测试计划

### 测试用例 1: 创建新活动（完整时间）

**操作**:
1. 填写 slug: `test-2025-10-30`
2. 填写标题: `测试活动`
3. 选择开始时间: `2025-10-30 14:00`
4. 选择结束时间: `2025-10-30 18:00`
5. 点击保存

**预期结果**:
- ✅ 前端发送: `{ start_ts: 1730268000, end_ts: 1730282400 }`
- ✅ 后端保存: `start_ts=1730268000, end_ts=1730282400`
- ✅ 活动列表显示: 开始时间和结束时间正确
- ✅ 状态显示: 根据当前时间正确显示（未开始/进行中/已结束）

---

### 测试用例 2: 创建新活动（仅开始时间）

**操作**:
1. 填写 slug: `test-2025-10-31`
2. 填写标题: `测试活动2`
3. 选择开始时间: `2025-10-31 10:00`
4. 结束时间留空
5. 点击保存

**预期结果**:
- ✅ 前端发送: `{ start_ts: 1730343600, end_ts: null }`
- ✅ 后端保存: `start_ts=1730343600, end_ts=NULL`
- ✅ 活动列表显示: 开始时间正确，结束时间显示"未设置"
- ✅ 状态显示: 根据开始时间判断（未开始/进行中）

---

### 测试用例 3: 编辑已有活动

**操作**:
1. 点击活动列表中的"编辑"按钮
2. 表单自动填充现有数据
3. 修改结束时间
4. 点击保存

**预期结果**:
- ✅ 表单正确显示现有的开始和结束时间
- ✅ 修改后正确保存
- ✅ 活动列表立即更新

---

### 测试用例 4: 时间验证

**操作**:
1. 选择开始时间: `2025-10-30 18:00`
2. 选择结束时间: `2025-10-30 14:00` (早于开始时间)
3. 点击保存

**预期结果**:
- ✅ 显示错误提示: "结束时间必须晚于开始时间"
- ✅ 不发送请求到后端

---

### 测试用例 5: 向后兼容（已有数据）

**操作**:
1. 查看已有的活动（没有 start_ts/end_ts 的）
2. 编辑这些活动
3. 添加时间后保存

**预期结果**:
- ✅ 已有活动正常显示（即使没有时间戳）
- ✅ 可以正常编辑和添加时间
- ✅ 保存后时间戳正确写入数据库

---

## 📋 部署检查清单

### 前端部署
- [ ] 修改 `frontend/admin/events.html`
- [ ] 添加时间转换工具函数
- [ ] 更新 `handleSaveEvent()` 函数
- [ ] 更新 `displayEvents()` 函数
- [ ] 添加 `editEvent()` 和 `loadEventToForm()` 函数
- [ ] 部署到 Cloudflare Pages

### 后端部署
- [ ] 修改 `worker-api/index.js` `/admin/event-upsert` 接口
- [ ] 修改 `worker-api/index.js` `GET /poap/events` 接口
- [ ] 部署到 Cloudflare Workers

### 测试验证
- [ ] 测试创建新活动（完整时间）
- [ ] 测试创建新活动（部分时间）
- [ ] 测试编辑已有活动
- [ ] 测试时间验证
- [ ] 测试活动状态显示
- [ ] 测试移动端日期选择器
- [ ] 测试向后兼容性

---

## 🎯 兼容性保证

### 数据库层面
✅ **完全兼容** - 字段已存在，只是之前未使用

### API 层面
✅ **完全兼容** - 接口签名不变，只是增强了数据保存

### 前端层面
✅ **完全兼容** - 只改变输入方式，数据格式不变

### 已有数据
✅ **完全兼容** - 旧数据的 start_ts/end_ts 为 NULL，前端正确处理

---

## 📝 总结

### 改进点
1. ✅ 用户体验：从输入数字改为日期选择器
2. ✅ 数据完整性：正确保存和读取时间戳
3. ✅ 逻辑正确性：修复活动状态判断逻辑
4. ✅ 功能增强：支持编辑已有活动
5. ✅ 向后兼容：不影响已有数据和功能

### 风险评估
- 🟢 **低风险** - 所有改动都是增强，不破坏现有功能
- 🟢 **可回滚** - 如有问题可立即回滚前端代码
- 🟢 **数据安全** - 不删除或修改已有数据

### 实施建议
1. 先部署后端（增强数据保存）
2. 再部署前端（改进用户界面）
3. 逐步测试各个功能
4. 监控错误日志

---

**文档生成时间**: 2025-10-28  
**审查状态**: ✅ 已完成  
**实施状态**: ⏳ 待执行  
**预计工作量**: 30-45 分钟

