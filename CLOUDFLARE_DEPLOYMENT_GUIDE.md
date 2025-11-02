# 🚀 Cloudflare 部署指南

## 📋 项目配置

### 前端 (Cloudflare Pages)
- **项目名称**: `poap-checkin-frontend`
- **分支**: `prod`
- **目录**: `frontend/`
- **访问地址**: `https://poap-checkin-frontend.pages.dev`

### 后端 (Cloudflare Workers)
- **项目名称**: `songbrocade-api`
- **配置文件**: `worker-api/wrangler.toml`
- **D1 数据库**: `poap-db`
- **R2 存储**: `poap-images`

---

## 🎯 快速部署

### 方式1: 一键部署（推荐）

```bash
# 在项目根目录执行
./deploy-all-cloudflare.sh
```

这将依次部署：
1. 后端 API (songbrocade-api)
2. 前端 Pages (poap-checkin-frontend)

### 方式2: 分别部署

#### 部署后端
```bash
./deploy-backend-cloudflare.sh
```

#### 部署前端
```bash
./deploy-frontend-cloudflare.sh
```

---

## 📝 详细步骤

### 步骤1: 安装 Wrangler CLI

如果还没有安装 Wrangler：

```bash
npm install -g wrangler
```

验证安装：
```bash
wrangler --version
```

### 步骤2: 登录 Cloudflare

```bash
wrangler login
```

这将打开浏览器，让您授权 Wrangler 访问您的 Cloudflare 账户。

### 步骤3: 配置后端 Secrets

后端需要配置以下 Secrets（敏感信息）：

```bash
cd worker-api

# 区块链配置
npx wrangler secret put RPC_URL
# 输入: https://sepolia.base.org (或您的RPC地址)

npx wrangler secret put BROCADE_ADDR
# 输入: 您的合约地址

npx wrangler secret put RDA_REG_ADDR
# 输入: 您的注册合约地址

# AI 服务配置（可选）
npx wrangler secret put OPENAI_API_KEY
# 输入: 您的 OpenAI API Key

npx wrangler secret put REPLICATE_API_KEY
# 输入: 您的 Replicate API Token

# R2 公开域名（可选）
npx wrangler secret put R2_PUBLIC_URL
# 输入: https://your-r2-domain.com
```

### 步骤4: 部署后端

```bash
cd worker-api
wrangler deploy
```

部署成功后，您会看到：
```
✨ Deployment complete!
🌎 https://songbrocade-api.<your-subdomain>.workers.dev
```

### 步骤5: 更新前端 API 配置

编辑 `frontend/poap.config.js`，更新 API 地址：

```javascript
const config = {
  // 更新为您的 Worker 地址
  apiBase: 'https://songbrocade-api.<your-subdomain>.workers.dev',
  
  // 其他配置...
};
```

### 步骤6: 部署前端

```bash
cd frontend
wrangler pages deploy . \
    --project-name=poap-checkin-frontend \
    --branch=prod
```

部署成功后，您会看到：
```
✨ Deployment complete!
🌎 https://poap-checkin-frontend.pages.dev
```

---

## ⚙️ 环境变量配置

### 后端环境变量 (wrangler.toml)

已配置的变量：

```toml
[vars]
ADMIN_WALLETS = "0xEf85456652ada05f12708b9bDcF215780E780D18,..."
SHIPPING_KEY = "ir9I4xwi1Umc9W2jSv6NUB9LCjzhufhixOpMvPUR02U="
```

### D1 数据库绑定

```toml
[[d1_databases]]
binding = "DB"
database_name = "poap-db"
database_id = "ba24fce5-6b11-4c24-828d-336787011ffd"
```

### R2 存储绑定

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "poap-images"
```

---

## 🔄 更新部署

### 更新后端

```bash
cd worker-api
wrangler deploy
```

### 更新前端

```bash
cd frontend
wrangler pages deploy . --project-name=poap-checkin-frontend --branch=prod
```

---

## 🗄️ 数据库管理

### 查看 D1 数据库

```bash
cd worker-api
wrangler d1 list
```

### 执行 SQL 查询

```bash
# 查看表
wrangler d1 execute poap-db --command "SELECT name FROM sqlite_master WHERE type='table'"

# 查看签到记录
wrangler d1 execute poap-db --command "SELECT * FROM checkins LIMIT 10"
```

### 运行迁移

```bash
# 执行迁移文件
wrangler d1 execute poap-db --file=./migrations/001_init.sql
```

---

## 📦 R2 存储管理

### 查看 R2 存储桶

```bash
wrangler r2 bucket list
```

### 上传文件到 R2

```bash
wrangler r2 object put poap-images/test.jpg --file=./test.jpg
```

### 列出 R2 文件

```bash
wrangler r2 object list poap-images
```

---

## 🔍 日志查看

### 实时查看 Worker 日志

```bash
cd worker-api
wrangler tail
```

### 查看 Pages 部署日志

访问 Cloudflare Dashboard:
```
https://dash.cloudflare.com/pages/poap-checkin-frontend
```

---

## 🌐 自定义域名

### 为 Pages 添加自定义域名

1. 访问 Pages 项目设置
2. 进入 "Custom domains"
3. 添加您的域名
4. 按照提示配置 DNS

### 为 Worker 添加自定义域名

1. 访问 Workers 项目设置
2. 进入 "Triggers" → "Custom Domains"
3. 添加您的域名
4. 按照提示配置 DNS

---

## 🔐 安全配置

### CORS 配置

后端已配置 CORS，允许前端访问。如需修改，编辑 `worker-api/index.js`：

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### 管理员白名单

在 `wrangler.toml` 中配置：

```toml
[vars]
ADMIN_WALLETS = "0xAddress1,0xAddress2,0xAddress3"
```

---

## 📊 监控和分析

### Cloudflare Analytics

- **Workers**: https://dash.cloudflare.com/workers/analytics
- **Pages**: https://dash.cloudflare.com/pages/poap-checkin-frontend/analytics

### 性能监控

- 请求数量
- 响应时间
- 错误率
- 带宽使用

---

## 🐛 故障排查

### 问题1: 部署失败

**症状**: `wrangler deploy` 失败

**解决方案**:
```bash
# 检查登录状态
wrangler whoami

# 重新登录
wrangler login

# 检查配置
wrangler deploy --dry-run
```

### 问题2: API 无法访问

**症状**: 前端无法连接后端

**解决方案**:
1. 检查 Worker 是否部署成功
2. 检查 `frontend/poap.config.js` 中的 API 地址
3. 检查 CORS 配置
4. 查看 Worker 日志: `wrangler tail`

### 问题3: D1 数据库错误

**症状**: 数据库查询失败

**解决方案**:
```bash
# 检查数据库绑定
wrangler d1 list

# 测试连接
wrangler d1 execute poap-db --command "SELECT 1"

# 查看表结构
wrangler d1 execute poap-db --command "SELECT sql FROM sqlite_master WHERE type='table'"
```

### 问题4: R2 文件无法访问

**症状**: 图片或文件无法加载

**解决方案**:
1. 检查 R2 绑定配置
2. 确认文件已上传: `wrangler r2 object list poap-images`
3. 配置 R2 公开域名
4. 检查文件路径

---

## 📚 有用的命令

### Wrangler 常用命令

```bash
# 查看帮助
wrangler --help

# 查看账户信息
wrangler whoami

# 列出所有 Workers
wrangler list

# 删除 Worker
wrangler delete songbrocade-api

# 查看 Worker 配置
wrangler config

# 本地开发
wrangler dev
```

### Pages 常用命令

```bash
# 列出所有 Pages 项目
wrangler pages project list

# 查看部署历史
wrangler pages deployment list --project-name=poap-checkin-frontend

# 回滚到之前的部署
wrangler pages deployment tail --project-name=poap-checkin-frontend
```

---

## 🚀 持续集成/部署 (CI/CD)

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches:
      - main

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Deploy Worker
        run: |
          cd worker-api
          npm install
          npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Pages
        run: |
          cd frontend
          npx wrangler pages deploy . \
            --project-name=poap-checkin-frontend \
            --branch=prod
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## 💰 成本估算

### Cloudflare 免费套餐

- **Workers**: 100,000 请求/天
- **Pages**: 无限请求
- **D1**: 5GB 存储，500万行读取/天
- **R2**: 10GB 存储，100万次 Class A 操作/月

### 付费套餐

如果超出免费额度：
- **Workers Paid**: $5/月 + $0.50/百万请求
- **R2**: $0.015/GB/月存储

---

## 📞 获取帮助

### 官方文档

- **Workers**: https://developers.cloudflare.com/workers/
- **Pages**: https://developers.cloudflare.com/pages/
- **D1**: https://developers.cloudflare.com/d1/
- **R2**: https://developers.cloudflare.com/r2/

### 社区支持

- **Discord**: https://discord.gg/cloudflaredev
- **论坛**: https://community.cloudflare.com/

---

## ✅ 部署检查清单

部署前确认：

- [ ] 已安装 Wrangler CLI
- [ ] 已登录 Cloudflare 账户
- [ ] 后端 Secrets 已配置
- [ ] D1 数据库已创建并迁移
- [ ] R2 存储桶已创建
- [ ] 前端 API 地址已更新
- [ ] 测试本地开发环境
- [ ] 准备好自定义域名（可选）

部署后验证：

- [ ] 后端 API 可访问
- [ ] 前端页面正常加载
- [ ] 钱包连接功能正常
- [ ] 签到功能正常
- [ ] 管理后台可访问
- [ ] 图片和文件正常加载
- [ ] 查看部署日志无错误

---

**准备好了吗？开始部署吧！** 🚀

```bash
./deploy-all-cloudflare.sh
```

