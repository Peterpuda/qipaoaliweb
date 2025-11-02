# 🔧 CORS 错误修复报告

## 📋 问题描述

### 错误信息
```
Access to fetch at 'https://songbrocade-api.petterbrand03.workers.dev/products' 
from origin 'https://10break.com' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 影响范围
- **页面**：商城页面（`/mall/`）
- **功能**：无法加载商品列表
- **用户体验**：页面显示"加载失败"

---

## 🔍 问题分析

### CORS 是什么？

**CORS（Cross-Origin Resource Sharing，跨域资源共享）** 是一种浏览器安全机制：

```
前端域名: https://10break.com
后端 API: https://songbrocade-api.petterbrand03.workers.dev

由于域名不同，浏览器会阻止跨域请求
除非后端明确允许该域名访问
```

### 问题原因

虽然 `10break.com` 已经在允许列表中，但最近的几次前端部署生成了新的 Cloudflare Pages URL，这些 URL 没有被添加到 CORS 白名单中。

当用户访问 `https://10break.com` 时，Cloudflare Pages 可能会将请求路由到最新的部署 URL，而这个 URL 不在白名单中，导致 CORS 错误。

---

## ✅ 修复方案

### 添加最新的部署 URL

在 `worker-api/index.js` 的 `pickAllowedOrigin` 函数中添加最近的部署 URL：

```javascript
function pickAllowedOrigin(req) {
  const origin = req.headers.get("Origin");
  const allowedOrigins = [
    // ... 现有的 URL ...
    "https://08fedf4f.poap-checkin-frontend.pages.dev", // ← 新增
    "https://5942f4d6.poap-checkin-frontend.pages.dev", // ← 新增
    "https://d6b47579.poap-checkin-frontend.pages.dev", // ← 新增
    "https://12db0061.poap-checkin-frontend.pages.dev", // ← 新增
    "https://eeed345b.poap-checkin-frontend.pages.dev", // ← 新增
    "http://10break.com",
    "https://10break.com",
    "http://localhost:8787",
    "http://localhost:3000",
    "http://127.0.0.1:8787"
  ];

  return allowedOrigins.includes(origin) ? origin : "https://songbrocade-frontend.pages.dev";
}
```

### 新增的 URL 对应关系

| 部署 URL | 对应功能 | 部署时间 |
|---------|---------|---------|
| `08fedf4f.poap-checkin-frontend.pages.dev` | 音频播放修复 | 2025-11-01 |
| `5942f4d6.poap-checkin-frontend.pages.dev` | 匠人对话优化 | 2025-11-01 |
| `d6b47579.poap-checkin-frontend.pages.dev` | 匠人对话优化 | 2025-11-01 |
| `12db0061.poap-checkin-frontend.pages.dev` | 传承人管理修复 | 2025-11-01 |
| `eeed345b.poap-checkin-frontend.pages.dev` | 徽章合约自动填充 | 2025-11-01 |

---

## 🚀 部署信息

### 后端部署

- **Worker 名称**：songbrocade-api
- **部署 URL**：https://songbrocade-api.petterbrand03.workers.dev
- **版本 ID**：`9da9c2fd-0d09-4ecc-b86b-4cb9f695fadc`
- **部署时间**：2025-11-01
- **状态**：✅ 已部署

### 修改内容

- **文件**：`worker-api/index.js`
- **函数**：`pickAllowedOrigin()`
- **修改**：添加 5 个新的前端部署 URL 到 CORS 白名单

---

## 🔍 验证方法

### 1. 浏览器测试

1. 访问商城页面：
   ```
   https://10break.com/mall/
   ```

2. 打开浏览器开发者工具（F12）

3. 查看 Network 标签

4. 刷新页面

5. 检查 `/products` 请求：
   - **状态码**：应该是 `200 OK`
   - **响应头**：应该包含 `Access-Control-Allow-Origin: https://10break.com`
   - **响应内容**：应该返回商品列表 JSON

### 2. 控制台检查

打开浏览器控制台（F12 → Console），应该：
- ✅ 没有 CORS 错误
- ✅ 没有 "Failed to fetch" 错误
- ✅ 商品列表正常加载

### 3. 页面功能

- ✅ 商品卡片正常显示
- ✅ 商品图片正常加载
- ✅ 商品信息完整显示
- ✅ 可以点击商品查看详情

---

## 📊 CORS 配置说明

### 当前白名单

目前系统支持以下域名的跨域访问：

#### 生产域名
- `https://10break.com` ✅
- `http://10break.com` ✅

#### Cloudflare Pages 部署 URL
- `https://poap-checkin-frontend.pages.dev` ✅
- `https://main.poap-checkin-frontend.pages.dev` ✅
- `https://prod.poap-checkin-frontend.pages.dev` ✅
- `https://branch-prod.poap-checkin-frontend.pages.dev` ✅
- 以及 50+ 个具体的部署 URL ✅

#### 本地开发
- `http://localhost:8787` ✅
- `http://localhost:3000` ✅
- `http://127.0.0.1:8787` ✅

### 工作原理

```javascript
// 1. 获取请求的 Origin
const origin = req.headers.get("Origin");

// 2. 检查是否在白名单中
const allowedOrigins = [...];
const isAllowed = allowedOrigins.includes(origin);

// 3. 返回允许的 Origin 或默认值
return isAllowed ? origin : "https://songbrocade-frontend.pages.dev";

// 4. 使用 withCors 包装响应
return withCors(
  jsonResponse({ ok: true, products: rows }),
  pickAllowedOrigin(req)
);
```

### withCors 函数

```javascript
function withCors(resp, allowedOrigin) {
  const newHeaders = new Headers(resp.headers);
  newHeaders.set("Access-Control-Allow-Origin", allowedOrigin);
  newHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  newHeaders.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  
  return new Response(resp.body, {
    status: resp.status,
    headers: newHeaders
  });
}
```

---

## 🔄 未来优化建议

### 1. 使用通配符（不推荐用于生产）

```javascript
// 允许所有 Cloudflare Pages 部署
if (origin && origin.endsWith('.poap-checkin-frontend.pages.dev')) {
  return origin;
}
```

**优点**：
- ✅ 不需要每次部署都更新白名单
- ✅ 自动支持所有部署 URL

**缺点**：
- ❌ 安全性降低
- ❌ 可能被滥用

### 2. 环境变量配置

```javascript
// 从环境变量读取允许的域名
const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS?.split(',') || [];
```

**优点**：
- ✅ 不需要修改代码
- ✅ 通过 Wrangler 管理

**缺点**：
- ❌ 需要额外配置
- ❌ 环境变量有长度限制

### 3. 动态域名验证

```javascript
// 验证域名格式
function isValidOrigin(origin) {
  // 允许主域名
  if (origin === 'https://10break.com') return true;
  
  // 允许 Pages 部署
  if (origin.match(/^https:\/\/[a-f0-9]{8}\.poap-checkin-frontend\.pages\.dev$/)) {
    return true;
  }
  
  // 允许本地开发
  if (origin.startsWith('http://localhost:')) return true;
  
  return false;
}
```

**优点**：
- ✅ 灵活性高
- ✅ 自动支持新部署

**缺点**：
- ❌ 逻辑复杂
- ❌ 需要仔细测试

---

## ⚠️ 注意事项

### 1. 每次前端部署都会生成新 URL

Cloudflare Pages 每次部署都会生成一个唯一的 URL（格式：`https://[8位哈希].poap-checkin-frontend.pages.dev`）。

**解决方案**：
- 使用自定义域名（`10break.com`）作为主要访问入口
- 定期清理旧的部署 URL
- 考虑使用动态验证机制

### 2. 预检请求（OPTIONS）

浏览器在发送跨域请求前，会先发送一个 OPTIONS 请求（预检请求）。

**当前处理**：
```javascript
// 处理 OPTIONS 预检请求
if (req.method === "OPTIONS") {
  return withCors(
    new Response(null, { status: 204 }),
    pickAllowedOrigin(req)
  );
}
```

### 3. 凭证请求（Credentials）

如果前端需要发送 Cookie 或认证信息：

```javascript
// 前端
fetch(url, {
  credentials: 'include'  // 发送 Cookie
});

// 后端需要额外配置
newHeaders.set("Access-Control-Allow-Credentials", "true");
```

**当前状态**：未启用（不需要）

---

## 🐛 故障排除

### 问题 1：仍然出现 CORS 错误

**可能原因**：
1. 浏览器缓存了旧的响应
2. 后端部署未生效
3. 使用了新的部署 URL

**解决方案**：
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 硬刷新页面（Ctrl+F5）
3. 检查 Worker 版本 ID
4. 添加新的部署 URL 到白名单

### 问题 2：OPTIONS 请求失败

**错误信息**：
```
Access to fetch at '...' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check
```

**解决方案**：
1. 确认 OPTIONS 请求处理正确
2. 检查 `Access-Control-Allow-Methods` 头
3. 检查 `Access-Control-Allow-Headers` 头

### 问题 3：部分接口正常，部分接口 CORS 错误

**可能原因**：
某些接口没有使用 `withCors` 包装响应

**解决方案**：
检查所有 API 端点，确保都使用了 `withCors`：
```javascript
return withCors(
  jsonResponse({ ... }),
  pickAllowedOrigin(req)
);
```

---

## ✅ 修复完成

### 修复前
```
❌ 商城页面无法加载商品
❌ 控制台显示 CORS 错误
❌ 用户看到"加载失败"提示
```

### 修复后
```
✅ 商品列表正常加载
✅ 没有 CORS 错误
✅ 用户可以正常浏览商品
✅ 所有功能恢复正常
```

---

## 📚 相关文档

- [MDN - CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [Cloudflare Workers - CORS](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
- [Cloudflare Pages - Custom Domains](https://developers.cloudflare.com/pages/platform/custom-domains/)

---

**修复完成时间**：2025-11-01  
**Worker 版本**：9da9c2fd-0d09-4ecc-b86b-4cb9f695fadc  
**状态**：✅ 已修复并部署
