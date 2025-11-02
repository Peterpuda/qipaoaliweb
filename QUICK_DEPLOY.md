# ⚡ 快速部署到 Cloudflare

## 🎯 部署目标

- **前端**: `poap-checkin-frontend` (Cloudflare Pages, 分支: prod)
- **后端**: `songbrocade-api` (Cloudflare Workers)

---

## 🚀 一键部署

```bash
# 在项目根目录执行
./deploy-all-cloudflare.sh
```

---

## 📝 分步部署

### 1️⃣ 部署后端 API

```bash
./deploy-backend-cloudflare.sh
```

或手动执行：

```bash
cd worker-api
wrangler deploy
```

**部署后地址**: `https://songbrocade-api.petterbrand03.workers.dev`

### 2️⃣ 部署前端

```bash
./deploy-frontend-cloudflare.sh
```

或手动执行：

```bash
cd frontend
wrangler pages deploy . \
    --project-name=poap-checkin-frontend \
    --branch=prod
```

**部署后地址**: `https://poap-checkin-frontend.pages.dev`

---

## ✅ 当前配置状态

### 后端配置 ✅
- ✅ 项目名称: `songbrocade-api`
- ✅ D1 数据库: `poap-db`
- ✅ R2 存储: `poap-images`
- ✅ 管理员钱包已配置

### 前端配置 ✅
- ✅ API 地址: `https://songbrocade-api.petterbrand03.workers.dev`
- ✅ 区块链配置: Base Sepolia
- ✅ 合约地址已配置

---

## ⚙️ 需要配置的 Secrets

部署后端后，需要配置以下环境变量：

```bash
cd worker-api

# 必需配置
npx wrangler secret put RPC_URL
# 输入: https://sepolia.base.org

npx wrangler secret put BROCADE_ADDR
# 输入: 您的 Brocade721 合约地址

npx wrangler secret put RDA_REG_ADDR
# 输入: 您的 RDA Registry 合约地址

# 可选配置（AI 功能）
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put REPLICATE_API_KEY
npx wrangler secret put R2_PUBLIC_URL
```

---

## 🔍 验证部署

### 测试后端 API

```bash
# 健康检查
curl https://songbrocade-api.petterbrand03.workers.dev/health

# 获取签到记录
curl https://songbrocade-api.petterbrand03.workers.dev/api/checkins
```

### 测试前端

访问: `https://poap-checkin-frontend.pages.dev`

检查：
- ✅ 页面正常加载
- ✅ 钱包连接功能
- ✅ 签到功能
- ✅ 管理后台

---

## 📊 部署后访问地址

### 生产环境

| 服务 | 地址 |
|------|------|
| 前端 | https://poap-checkin-frontend.pages.dev |
| 后端 API | https://songbrocade-api.petterbrand03.workers.dev |
| 管理后台 | https://poap-checkin-frontend.pages.dev/admin |

### Cloudflare 控制台

| 服务 | 控制台 |
|------|--------|
| Pages | https://dash.cloudflare.com/pages/poap-checkin-frontend |
| Workers | https://dash.cloudflare.com/workers/songbrocade-api |
| D1 数据库 | https://dash.cloudflare.com/d1 |
| R2 存储 | https://dash.cloudflare.com/r2 |

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

## 🐛 常见问题

### Q: 部署时提示未登录？

```bash
wrangler login
```

### Q: 前端无法连接后端？

检查 `frontend/poap.config.js` 中的 API 地址是否正确。

### Q: 如何查看日志？

```bash
# 后端日志
cd worker-api
wrangler tail

# 前端日志
访问 Cloudflare Dashboard → Pages → Deployments
```

### Q: 如何回滚部署？

在 Cloudflare Dashboard 中选择之前的部署版本，点击 "Rollback"。

---

## 📚 更多信息

详细部署指南请查看: [CLOUDFLARE_DEPLOYMENT_GUIDE.md](./CLOUDFLARE_DEPLOYMENT_GUIDE.md)

---

**准备好了吗？开始部署！** 🚀

```bash
./deploy-all-cloudflare.sh
```

