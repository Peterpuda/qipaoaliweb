# CORS 故障排查指南

## 当前状态

### ✅ 后端 CORS 配置正确
测试结果（2025-11-02）：
```bash
curl -X OPTIONS https://songbrocade-api.petterbrand03.workers.dev/auth/challenge \
  -H "Origin: https://10break.com"
```

**响应头**：
- ✅ `access-control-allow-origin: https://10break.com`
- ✅ `access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS`
- ✅ `access-control-allow-headers: Authorization, Content-Type, X-Requested-With`
- ✅ `access-control-max-age: 86400`

### ❌ 浏览器仍报错
**错误信息**：
```
Access to fetch at 'https://songbrocade-api.petterbrand03.workers.dev/auth/challenge' 
from origin 'https://10break.com' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 可能的原因

### 1. 浏览器缓存问题 ⭐ 最可能
**症状**：
- curl 测试通过
- 浏览器报错

**解决方案**：
```javascript
// 方案 A：强制刷新（推荐）
// Mac: Cmd + Shift + R
// Windows: Ctrl + Shift + R

// 方案 B：清除浏览器缓存
// Chrome: 开发者工具 → Network → 勾选 "Disable cache"

// 方案 C：无痕模式测试
// Chrome: Cmd + Shift + N (Mac) / Ctrl + Shift + N (Windows)
```

---

### 2. Cloudflare 缓存问题
**症状**：
- 第一次请求失败
- 后续请求成功

**解决方案**：
```bash
# 清除 Cloudflare 缓存
# 方法 1：Cloudflare Dashboard → Caching → Purge Everything

# 方法 2：使用 API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

### 3. 前端请求头问题
**症状**：
- OPTIONS 请求成功
- POST 请求失败

**检查点**：
```javascript
// ❌ 错误：使用了不在白名单中的自定义头
fetch('/auth/challenge', {
  headers: {
    'X-Custom-Header': 'value',  // 不在 Access-Control-Allow-Headers 中
    'Content-Type': 'application/json'
  }
});

// ✅ 正确：仅使用白名单头
fetch('/auth/challenge', {
  headers: {
    'Content-Type': 'application/json'  // 在白名单中
  }
});
```

**当前白名单**：
- `Authorization`
- `Content-Type`
- `X-Requested-With`

---

### 4. 域名不在白名单
**检查**：
```bash
# 查看当前白名单
grep -A 20 "allowedOrigins" worker-api/index.js
```

**当前白名单包含**：
- ✅ `https://10break.com`
- ✅ `http://10break.com`
- ✅ 所有 `*.poap-checkin-frontend.pages.dev`

---

### 5. 请求方法不匹配
**症状**：
- GET 请求成功
- POST 请求失败

**检查**：
```javascript
// 后端路由
if ((req.method === 'POST' || req.method === 'GET') && path === '/auth/challenge') {
  // ✅ 支持 POST 和 GET
}

// 前端调用
fetch('/auth/challenge', {
  method: 'POST',  // ✅ 匹配
  // ...
});
```

---

## 调试步骤

### 步骤 1：检查 OPTIONS 预检请求
打开浏览器开发者工具 → Network：

1. 刷新页面
2. 找到 `/auth/challenge` 请求
3. 查看是否有 OPTIONS 请求
4. 检查 OPTIONS 响应头：
   - ✅ `access-control-allow-origin: https://10break.com`
   - ✅ `access-control-allow-methods: ...POST...`
   - ✅ Status: 204

**如果 OPTIONS 失败**：
- 后端 OPTIONS 处理有问题
- 检查 `worker-api/index.js` 第 491-497 行

**如果 OPTIONS 成功但 POST 失败**：
- 继续步骤 2

---

### 步骤 2：检查 POST 请求响应头
1. 找到 POST `/auth/challenge` 请求
2. 查看 Response Headers：
   - ✅ `access-control-allow-origin: https://10break.com`
   - ✅ Status: 200

**如果没有 `access-control-allow-origin` 头**：
- 后端 `withCors` 函数没有被调用
- 检查路由是否正确匹配

---

### 步骤 3：检查请求头
1. 查看 Request Headers
2. 确认：
   - ✅ `Origin: https://10break.com`
   - ✅ `Content-Type: application/json`
   - ❌ 没有不在白名单中的自定义头

---

### 步骤 4：查看 Worker 日志
```bash
cd worker-api
npx wrangler tail --format pretty
```

**查找日志**：
```
OPTIONS request from origin: https://10break.com allowed: https://10break.com
Auth challenge request, method: POST origin: https://10break.com
Returning challenge with origin: https://10break.com
```

**如果日志显示正确的 origin**：
- 后端配置正确
- 问题在浏览器缓存或 Cloudflare 缓存

**如果日志显示错误的 origin**：
- `pickAllowedOrigin` 函数有问题

---

## 快速修复清单

### 用户端（立即尝试）
- [ ] 强制刷新页面（Cmd/Ctrl + Shift + R）
- [ ] 清除浏览器缓存
- [ ] 使用无痕模式测试
- [ ] 尝试不同浏览器（Chrome, Firefox, Safari）

### 开发端（如果用户端无效）
- [ ] 清除 Cloudflare 缓存
- [ ] 重新部署 Worker
- [ ] 检查 Worker 日志
- [ ] 验证白名单包含当前域名

---

## 临时解决方案（不推荐）

### 方案 A：允许所有来源（仅用于测试）
```javascript
// worker-api/index.js
function withCors(resp, origin) {
  const newHeaders = new Headers(resp.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");  // 允许所有来源
  // ...
}
```

**⚠️ 警告**：
- 仅用于测试
- 生产环境必须使用白名单

---

### 方案 B：添加更多调试信息
```javascript
// frontend/admin/common/admin-common.js
async function adminLogin() {
  try {
    console.log('Fetching challenge from:', `${ADMIN_CONFIG.API_BASE}/auth/challenge`);
    console.log('Current origin:', window.location.origin);
    
    const challengeResponse = await fetch(`${ADMIN_CONFIG.API_BASE}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: currentWallet })
    });
    
    console.log('Challenge response status:', challengeResponse.status);
    console.log('Challenge response headers:', [...challengeResponse.headers.entries()]);
    
    // ...
  } catch (error) {
    console.error('Fetch error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}
```

---

## 验证 CORS 配置

### 命令行测试
```bash
# 测试 OPTIONS
curl -X OPTIONS https://songbrocade-api.petterbrand03.workers.dev/auth/challenge \
  -H "Origin: https://10break.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | grep -i "access-control"

# 测试 POST
curl -X POST https://songbrocade-api.petterbrand03.workers.dev/auth/challenge \
  -H "Origin: https://10break.com" \
  -H "Content-Type: application/json" \
  -d '{"address":"0x123"}' \
  -v 2>&1 | grep -i "access-control"
```

**预期结果**：
```
< access-control-allow-origin: https://10break.com
< access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
< access-control-allow-headers: Authorization, Content-Type, X-Requested-With
< access-control-max-age: 86400
```

---

## 联系信息

**问题报告**：
- 提供浏览器控制台完整日志
- 提供 Network 标签截图（包括 Headers）
- 提供 Worker 日志（`wrangler tail`）

**最后更新**：2025-11-02
**Worker 版本**：456ffbce-29be-4180-a9c8-8017627f0219

