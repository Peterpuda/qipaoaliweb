# 🚀 Cloudflare 完整部署指南

## 📋 部署清单

### 需要部署的组件
1. ✅ Worker API (后端 API)
2. ✅ Cloudflare Pages (前端静态站点)
3. ✅ R2 存储桶 (图片和视频)
4. ✅ D1 数据库 (已存在)

---

## 🔐 第一步：登录 Cloudflare

### 方法 1: 交互式登录（推荐）
```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/worker-api
wrangler login
```
这会打开浏览器让你授权 wrangler 访问你的 Cloudflare 账户。

### 方法 2: 使用 API Token
如果无法使用浏览器登录，可以创建 API Token：

1. 访问：https://dash.cloudflare.com/profile/api-tokens
2. 点击 "Create Token"
3. 使用 "Edit Cloudflare Workers" 模板
4. 设置权限：
   - Account: Workers Scripts: Edit
   - Account: D1: Edit
   - Account: R2: Edit
   - Zone: Workers Routes: Edit
5. 创建后复制 token
6. 设置环境变量：
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

---

## 📦 第二步：部署 Worker API

### 1. 进入 worker-api 目录
```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/worker-api
```

### 2. 部署 Worker
```bash
wrangler deploy
```

**预期输出**:
```
✨ Compiled Worker successfully
✨ Uploading...
✨ Uploaded songbrocade-api (XX.XX sec)
✨ Published songbrocade-api (X.XX sec)
   https://songbrocade-api.your-subdomain.workers.dev
```

### 3. 验证部署
访问返回的 URL，应该看到 API 响应。

测试健康检查：
```bash
curl https://songbrocade-api.your-subdomain.workers.dev/health
```

---

## 🌐 第三步：部署前端到 Cloudflare Pages

### 方法 1: 使用 Wrangler Pages（推荐）

#### 1. 进入前端目录
```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/frontend
```

#### 2. 创建 Pages 项目（首次部署）
```bash
npx wrangler pages project create poap-checkin-frontend
```

选择：
- Project name: `poap-checkin-frontend`
- Production branch: `main`

#### 3. 部署前端文件
```bash
npx wrangler pages deploy . --project-name=poap-checkin-frontend
```

**预期输出**:
```
✨ Success! Uploaded XX files (X.XX sec)
✨ Deployment complete! Take a peek over at https://xxxxx.poap-checkin-frontend.pages.dev
```

#### 4. 设置生产域名（可选）
```bash
npx wrangler pages deployment tail
```

---

### 方法 2: 使用 Cloudflare Dashboard（可视化）

#### 1. 访问 Cloudflare Dashboard
https://dash.cloudflare.com/

#### 2. 进入 Pages
点击左侧菜单 "Workers & Pages" → "Create application" → "Pages"

#### 3. 上传文件
- 选择 "Direct Upload"
- 拖拽或选择 `frontend` 文件夹
- 点击 "Deploy site"

#### 4. 配置项目
- Project name: `poap-checkin-frontend`
- Production branch: `main`

---

## 🔧 第四步：配置环境变量

### Worker API 环境变量

#### 1. 设置 Secrets（敏感信息）
```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/worker-api

# HeyGen API Key
wrangler secret put HEYGEN_API_KEY
# 输入: sk_V2_hgu_kM6HDevMmxh_VpduEZGAyRQOYM2lD8MzRH8mFKPbkm2T

# RPC URL（如果需要）
wrangler secret put RPC_URL
# 输入你的 RPC URL

# 合约地址（如果需要）
wrangler secret put BROCADE_ADDR
# 输入你的合约地址

wrangler secret put RDA_REG_ADDR
# 输入你的注册合约地址
```

#### 2. 验证 Secrets
```bash
wrangler secret list
```

### Pages 环境变量（如果需要）
```bash
npx wrangler pages secret put API_BASE --project-name=poap-checkin-frontend
# 输入: https://songbrocade-api.your-subdomain.workers.dev
```

---

## 📊 第五步：验证部署

### 1. 测试 Worker API

#### 健康检查
```bash
curl https://songbrocade-api.your-subdomain.workers.dev/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T13:00:00.000Z"
}
```

#### 测试产品 API
```bash
curl https://songbrocade-api.your-subdomain.workers.dev/products
```

#### 测试 R2 文件访问
```bash
curl -I https://songbrocade-api.your-subdomain.workers.dev/r2/videos/hero-background-optimized.mp4
```

### 2. 测试前端页面

访问 Pages URL：
```
https://xxxxx.poap-checkin-frontend.pages.dev
```

检查：
- ✅ 首页加载正常
- ✅ 视频背景播放正常
- ✅ 导航正常
- ✅ 商品列表加载正常
- ✅ 签到功能正常

---

## 🔄 第六步：配置自定义域名（可选）

### 为 Worker 配置域名

#### 1. 添加路由
```bash
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/worker-api
wrangler routes list
```

#### 2. 在 wrangler.toml 中添加路由
```toml
[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

#### 3. 重新部署
```bash
wrangler deploy
```

### 为 Pages 配置域名

#### 1. 在 Cloudflare Dashboard 中
- 进入 Pages 项目
- 点击 "Custom domains"
- 添加你的域名
- 配置 DNS（Cloudflare 会自动处理）

---

## 📝 部署后的 URL

部署完成后，你会得到以下 URL：

### Worker API
```
https://songbrocade-api.your-subdomain.workers.dev
```

### Frontend Pages
```
https://xxxxx.poap-checkin-frontend.pages.dev
```
或自定义域名：
```
https://yourdomain.com
```

### R2 文件访问
通过 Worker API 访问：
```
https://songbrocade-api.your-subdomain.workers.dev/r2/videos/hero-background-optimized.mp4
https://songbrocade-api.your-subdomain.workers.dev/r2/videos/hero-background-mobile.mp4
```

---

## 🔍 常见问题排查

### 问题 1: Worker 部署失败
```bash
# 检查 wrangler 版本
wrangler --version

# 更新 wrangler
npm install -g wrangler@latest

# 重新登录
wrangler logout
wrangler login
```

### 问题 2: D1 数据库连接失败
```bash
# 检查 D1 绑定
wrangler d1 list

# 验证数据库 ID
wrangler d1 info poap-db
```

### 问题 3: R2 访问失败
```bash
# 检查 R2 存储桶
wrangler r2 bucket list

# 测试文件上传
wrangler r2 object put poap-images/test.txt --file=test.txt
wrangler r2 object get poap-images/test.txt
```

### 问题 4: Pages 部署失败
```bash
# 检查项目列表
npx wrangler pages project list

# 查看部署日志
npx wrangler pages deployment list --project-name=poap-checkin-frontend
```

### 问题 5: CORS 错误
确保 Worker API 返回正确的 CORS 头：
```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
```

---

## 📊 部署检查清单

### Worker API
- [ ] Worker 部署成功
- [ ] 健康检查 API 正常
- [ ] D1 数据库连接正常
- [ ] R2 存储桶访问正常
- [ ] Secrets 配置完成
- [ ] API 端点测试通过

### Frontend Pages
- [ ] Pages 部署成功
- [ ] 首页加载正常
- [ ] 视频背景播放正常
- [ ] API 调用正常
- [ ] 所有页面导航正常
- [ ] 移动端响应式正常

### 视频优化
- [ ] 桌面端视频 (15MB) 上传到 R2
- [ ] 移动端视频 (4.1MB) 上传到 R2
- [ ] 视频智能加载正常
- [ ] 延迟加载功能正常

---

## 🚀 快速部署命令总结

### 一键部署脚本
创建一个部署脚本：

```bash
#!/bin/bash
# deploy.sh

echo "🚀 开始部署到 Cloudflare..."

# 1. 部署 Worker API
echo "📦 部署 Worker API..."
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/worker-api
wrangler deploy

# 2. 部署 Frontend Pages
echo "🌐 部署前端页面..."
cd /Users/petterbrand/Downloads/旗袍会投票空投系统10.26/frontend
npx wrangler pages deploy . --project-name=poap-checkin-frontend

echo "✅ 部署完成！"
echo ""
echo "🔗 请访问以下 URL 验证部署："
echo "   Worker API: https://songbrocade-api.your-subdomain.workers.dev"
echo "   Frontend: https://xxxxx.poap-checkin-frontend.pages.dev"
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📚 相关文档

- Cloudflare Workers 文档: https://developers.cloudflare.com/workers/
- Cloudflare Pages 文档: https://developers.cloudflare.com/pages/
- Wrangler CLI 文档: https://developers.cloudflare.com/workers/wrangler/
- D1 数据库文档: https://developers.cloudflare.com/d1/
- R2 存储文档: https://developers.cloudflare.com/r2/

---

## 💡 下一步

部署完成后：

1. 🔒 **安全检查**
   - 确保所有 Secrets 已设置
   - 检查 CORS 配置
   - 验证管理员权限

2. 📊 **性能监控**
   - 设置 Cloudflare Analytics
   - 监控 Worker 执行时间
   - 检查 R2 流量

3. 🎯 **功能测试**
   - 测试所有用户流程
   - 测试签到功能
   - 测试空投功能
   - 测试商品购买流程

4. 🔄 **持续部署**
   - 设置 GitHub Actions（可选）
   - 配置自动部署
   - 设置预览环境

---

**准备好了吗？让我们开始部署！** 🚀
