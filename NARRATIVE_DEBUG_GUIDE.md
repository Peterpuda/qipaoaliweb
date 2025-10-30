# 文化叙事页面商品加载调试指南

**日期**: 2025-10-28  
**问题**: 商品列表依然无法加载  
**状态**: 🔍 需要调试

---

## 🔍 代码审查结果

我已经检查了修改后的代码，从代码层面看**没有发现明显错误**：

### ✅ 确认正确的部分

1. **API 路径**：`apiJSON('/products')` ✅
2. **字段名**：`data.products` ✅
3. **函数定义**：`apiJSON` 在 `admin-common.js` 中正确定义 ✅
4. **文件引用**：`<script src="./common/admin-common.js"></script>` ✅
5. **文件结构**：`/admin/common/admin-common.js` 存在 ✅
6. **后端路由**：`GET /products` 存在 ✅
7. **CORS 配置**：新部署 ID `a4c0dab5` 已添加 ✅

---

## 🐛 可能的问题

### 问题 1: JavaScript 加载失败

**可能原因**：
- ❌ `admin-common.js` 文件未能成功加载
- ❌ 文件路径错误（虽然代码中看起来正确）
- ❌ MIME 类型错误

**检查方法**：
```
打开浏览器控制台 → Network 标签 → 刷新页面
查找：admin-common.js
状态应该：200 OK
```

---

### 问题 2: 全局变量未定义

**可能原因**：
- ❌ `ADMIN_CONFIG` 未正确定义
- ❌ `apiJSON` 函数未定义
- ❌ JavaScript 执行顺序问题

**检查方法**：
```javascript
// 在浏览器控制台运行：
console.log(typeof ADMIN_CONFIG);  // 应该是 'object'
console.log(typeof apiJSON);       // 应该是 'function'
console.log(ADMIN_CONFIG.API_BASE); // 应该是 'https://songbrocade-api.petterbrand03.workers.dev'
```

---

### 问题 3: API 调用失败

**可能原因**：
- ❌ 网络请求被阻止
- ❌ CORS 错误
- ❌ API 返回错误
- ❌ 认证失败

**检查方法**：
```
1. 打开浏览器控制台 → Network 标签
2. 刷新页面
3. 查找请求：products
4. 检查：
   - 请求 URL：应该是 https://songbrocade-api.petterbrand03.workers.dev/products
   - 状态码：应该是 200
   - 响应数据：应该是 { ok: true, products: [...] }
```

---

### 问题 4: 缓存问题

**可能原因**：
- ❌ 浏览器缓存了旧版本的代码
- ❌ Cloudflare Pages 缓存未刷新

**解决方法**：
```
1. 硬刷新：Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)
2. 清除浏览器缓存
3. 或使用隐身模式测试
```

---

### 问题 5: 认证失败

**可能原因**：
- ❌ 未登录管理员账户
- ❌ Token 过期或无效

**检查方法**：
```javascript
// 在浏览器控制台运行：
console.log(sessionStorage.getItem('qipao.admin.token'));
console.log(localStorage.getItem('qipao.admin.token'));
// 应该有 token 值，不应该是 null
```

---

## 🧪 调试步骤

### 步骤 1: 检查控制台错误

1. 打开浏览器开发者工具 (F12)
2. 切换到 **Console** 标签
3. 刷新页面
4. 查看是否有**红色错误消息**

**可能看到的错误**：

#### 错误 A: `Uncaught ReferenceError: apiJSON is not defined`
```
原因：admin-common.js 未加载
解决：检查文件路径，确保文件存在
```

#### 错误 B: `Uncaught ReferenceError: ADMIN_CONFIG is not defined`
```
原因：admin-common.js 未正确执行
解决：检查 JavaScript 语法错误
```

#### 错误 C: `No products data: {ok: false, error: "..."}`
```
原因：API 返回错误
解决：检查后端日志，查看具体错误
```

#### 错误 D: `Load products failed: Error: NOT_FOUND` 或 `404`
```
原因：API 路由不存在或路径错误
解决：检查后端路由配置
```

#### 错误 E: `Access to fetch... has been blocked by CORS policy`
```
原因：CORS 配置错误
解决：确认新的部署 ID 在 CORS 白名单中
```

---

### 步骤 2: 检查 Network 请求

1. 打开开发者工具 → **Network** 标签
2. 刷新页面
3. 查找请求名称：`products` 或 `admin-common.js`

**检查 admin-common.js 加载**：

| 检查项 | 预期值 | 如果不符合预期 |
|--------|--------|--------------|
| Status | 200 OK | 检查文件路径是否正确 |
| Type | script | 检查 MIME 类型配置 |
| Size | ~10KB | 确认文件内容完整 |

**检查 products API 调用**：

| 检查项 | 预期值 | 如果不符合预期 |
|--------|--------|--------------|
| Request URL | `https://songbrocade-api...workers.dev/products` | 检查 API_BASE 配置 |
| Request Method | GET | - |
| Status Code | 200 | 检查后端是否正常运行 |
| Response Headers | 包含 `Access-Control-Allow-Origin` | 检查 CORS 配置 |

**点击 `products` 请求，查看响应**：

```json
{
  "ok": true,
  "products": [
    {
      "id": 1,
      "title_zh": "苏绣旗袍",
      "desc_md": "...",
      "image_key": "...",
      ...
    }
  ]
}
```

如果没有看到 `products` 请求：
- ❌ JavaScript 错误阻止了 API 调用
- ❌ `loadProductsList()` 函数未被调用

---

### 步骤 3: 手动测试 API

在浏览器控制台运行以下代码：

```javascript
// 测试 1: 检查全局变量
console.log('ADMIN_CONFIG:', ADMIN_CONFIG);
console.log('apiJSON:', typeof apiJSON);

// 测试 2: 手动调用 API
apiJSON('/products')
  .then(data => {
    console.log('✅ API 调用成功:', data);
    console.log('商品数量:', data.products?.length);
  })
  .catch(error => {
    console.error('❌ API 调用失败:', error);
  });

// 测试 3: 检查 DOM 元素
console.log('下拉框元素:', document.getElementById('productSelect'));

// 测试 4: 检查缓存
console.log('allProducts:', allProducts);
```

---

### 步骤 4: 检查认证状态

```javascript
// 在浏览器控制台运行：
async function testAuth() {
  try {
    const data = await apiJSON('/admin/whoami');
    console.log('✅ 认证成功:', data);
  } catch (error) {
    console.error('❌ 认证失败:', error);
    console.log('请先登录管理员账户');
  }
}
testAuth();
```

---

## 📊 诊断流程图

```
页面加载
   │
   ├─→ admin-common.js 加载？
   │    ├─ ✅ 是 → ADMIN_CONFIG 定义？
   │    │         ├─ ✅ 是 → apiJSON 定义？
   │    │         │         ├─ ✅ 是 → loadProductsList() 调用？
   │    │         │         │         ├─ ✅ 是 → API 请求发送？
   │    │         │         │         │         ├─ ✅ 是 → 状态码 200？
   │    │         │         │         │         │         ├─ ✅ 是 → data.ok = true？
   │    │         │         │         │         │         │         ├─ ✅ 是 → data.products 存在？
   │    │         │         │         │         │         │         │         ├─ ✅ 是 → 商品列表应该显示
   │    │         │         │         │         │         │         │         └─ ❌ 否 → 后端返回空数组
   │    │         │         │         │         │         │         └─ ❌ 否 → 后端返回错误
   │    │         │         │         │         │         └─ ❌ 否 → 检查后端日志
   │    │         │         │         │         └─ ❌ 否 → 网络错误 / CORS 错误
   │    │         │         │         └─ ❌ 否 → JavaScript 错误阻止执行
   │    │         │         └─ ❌ 否 → admin-common.js 未正确加载
   │    │         └─ ❌ 否 → admin-common.js 执行错误
   │    └─ ❌ 否 → 文件路径错误 / 404
   │
   └─→ 查看控制台错误消息
```

---

## 🔧 快速修复尝试

### 方案 1: 清除缓存并硬刷新

```
Mac: Cmd + Shift + R
Windows/Linux: Ctrl + Shift + R
```

### 方案 2: 使用直接 URL

访问完整 URL（包括 `.html`）：
```
https://poap-checkin-frontend.pages.dev/admin/narrative-generator.html
```

### 方案 3: 使用隐身模式

打开浏览器隐身模式，避免缓存干扰

### 方案 4: 检查数据库

可能数据库中没有商品数据：

```sql
SELECT COUNT(*) FROM products_new;
```

如果返回 0，说明数据库是空的，需要先添加商品。

---

## 📝 需要收集的调试信息

请在浏览器控制台运行以下命令，并将输出发给我：

```javascript
// 调试信息收集脚本
const debugInfo = {
  // 1. 全局变量检查
  hasAdminConfig: typeof ADMIN_CONFIG !== 'undefined',
  adminConfigValue: typeof ADMIN_CONFIG !== 'undefined' ? ADMIN_CONFIG : null,
  hasApiJSON: typeof apiJSON !== 'undefined',
  hasAllProducts: typeof allProducts !== 'undefined',
  allProductsValue: typeof allProducts !== 'undefined' ? allProducts : null,
  
  // 2. DOM 元素检查
  hasProductSelect: !!document.getElementById('productSelect'),
  productSelectOptions: document.getElementById('productSelect')?.options.length,
  
  // 3. 认证检查
  hasToken: !!sessionStorage.getItem('qipao.admin.token') || !!localStorage.getItem('qipao.admin.token'),
  
  // 4. 页面信息
  currentURL: location.href,
  origin: location.origin,
};

console.log('🔍 调试信息:', JSON.stringify(debugInfo, null, 2));

// 5. 测试 API 调用
if (typeof apiJSON !== 'undefined') {
  apiJSON('/products')
    .then(data => {
      console.log('✅ API 测试成功:', {
        ok: data.ok,
        productsCount: data.products?.length,
        firstProduct: data.products?.[0]
      });
    })
    .catch(error => {
      console.error('❌ API 测试失败:', error.message);
    });
} else {
  console.error('❌ apiJSON 函数未定义');
}
```

---

## 🎯 下一步行动

根据上述调试结果，我们可以确定具体的问题原因，然后制定相应的修复方案。

**请执行以下操作**：

1. ✅ 打开浏览器控制台（F12）
2. ✅ 切换到 Console 标签
3. ✅ **截图**控制台的所有红色错误
4. ✅ 切换到 Network 标签
5. ✅ 刷新页面
6. ✅ **截图** Network 标签（显示所有请求）
7. ✅ 查找 `products` 请求，点击查看详情
8. ✅ **截图**该请求的 Headers 和 Response
9. ✅ 运行上面的调试信息收集脚本
10. ✅ **复制**输出结果

**将这些信息发给我，我可以精确定位问题并提供修复方案。** 🔍

---

**调试者**: AI Assistant  
**日期**: 2025-10-28

