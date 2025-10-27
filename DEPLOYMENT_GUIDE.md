# 🚀 旗袍会投票空投系统 - 完整部署指南

## 📋 部署前准备

### 1. 环境要求
- Node.js 16+ 
- npm 或 yarn
- Cloudflare 账户
- Git（可选）

### 2. 登录 Cloudflare
```bash
npx wrangler login
```

## 🔧 快速部署

### 方法一：使用自动化脚本（推荐）

```bash
# 1. 检查环境
./check-env.sh

# 2. 部署后端
./deploy.sh

# 3. 部署前端
./deploy-frontend.sh
```

### 方法二：手动部署

#### 步骤 1: 部署后端 Worker

```bash
cd worker-api

# 安装依赖
npm install

# 创建 D1 数据库（如果还没有）
npx wrangler d1 create poap-db
# 记录返回的 database_id，更新 wrangler.toml

# 设置环境变量
echo "0xEf85456652ada05f12708b9bDcF215780E780D18" | npx wrangler secret put ADMIN_WALLETS_SECRET
echo "https://sepolia.base.org" | npx wrangler secret put RPC_URL

# 初始化数据库
npx wrangler d1 execute poap-db --file=migrations/004_badges_issues.sql

# 部署 Worker
npx wrangler deploy
```

#### 步骤 2: 部署前端

```bash
cd frontend

# 部署到 Cloudflare Pages
npx wrangler pages deploy . --project-name=poap-frontend
```

## 🔐 环境变量配置

### 必需的 Secrets

1. **ADMIN_WALLETS_SECRET**: 管理员钱包地址
   ```bash
   echo "0xEf85456652ada05f12708b9bDcF215780E780D18" | npx wrangler secret put ADMIN_WALLETS_SECRET
   ```

2. **RPC_URL**: 区块链 RPC 地址
   ```bash
   echo "https://sepolia.base.org" | npx wrangler secret put RPC_URL
   ```

### 可选 Secrets

3. **BROCADE_ADDR**: 合约地址
   ```bash
   echo "0xYOUR_CONTRACT_ADDRESS" | npx wrangler secret put BROCADE_ADDR
   ```

4. **RDA_REG_ADDR**: 注册合约地址
   ```bash
   echo "0xYOUR_REGISTRY_ADDRESS" | npx wrangler secret put RDA_REG_ADDR
   ```

## 🗄️ 数据库配置

### D1 数据库设置

1. **创建数据库**:
   ```bash
   npx wrangler d1 create poap-db
   ```

2. **更新配置**: 将返回的 `database_id` 更新到 `worker-api/wrangler.toml`

3. **初始化 Schema**: 数据库会在首次请求时自动初始化

### R2 存储配置

1. **创建存储桶**: 在 Cloudflare Dashboard 中创建名为 `poap-images` 的 R2 存储桶

2. **配置绑定**: 在 `wrangler.toml` 中已配置 R2 绑定

## 🌐 前端配置

### API 地址配置

部署完成后，需要更新前端的 API 地址：

1. **更新 `frontend/poap.config.js`**:
   ```javascript
   WORKER_BASE_URL: "https://songbrocade-api.YOUR-ACCOUNT.workers.dev"
   ```

2. **更新 `frontend/common/api.js`**:
   ```javascript
   const API_BASE = 'https://songbrocade-api.YOUR-ACCOUNT.workers.dev';
   ```

3. **更新 `common.js`**:
   ```javascript
   export const API_BASE = 'https://songbrocade-api.YOUR-ACCOUNT.workers.dev';
   ```

## 🧪 测试部署

### 后端测试

```bash
# 测试健康检查
curl https://songbrocade-api.YOUR-ACCOUNT.workers.dev/health

# 测试管理员认证
curl -X GET https://songbrocade-api.YOUR-ACCOUNT.workers.dev/api/auth/challenge
```

### 前端测试

1. 访问前端页面
2. 测试管理员登录
3. 测试事件创建
4. 测试签到功能

## 🔧 管理命令

### 查看日志
```bash
npx wrangler tail songbrocade-api
```

### 查看环境变量
```bash
npx wrangler secret list --name songbrocade-api
```

### 更新管理员地址
```bash
cd worker-api
node manage-admin.js set 0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222
```

### 数据库操作
```bash
# 执行 SQL
npx wrangler d1 execute poap-db --command="SELECT * FROM events LIMIT 5"

# 执行文件
npx wrangler d1 execute poap-db --file=migrations/004_badges_issues.sql
```

## 🐛 故障排除

### 常见问题

1. **Worker 部署失败**
   - 检查 `wrangler.toml` 配置
   - 确认已登录 Cloudflare
   - 检查依赖是否正确安装

2. **数据库连接失败**
   - 确认 D1 数据库已创建
   - 检查 `database_id` 是否正确
   - 确认数据库绑定配置

3. **管理员认证失败**
   - 检查 `ADMIN_WALLETS_SECRET` 是否设置
   - 确认钱包地址格式正确
   - 检查地址是否在白名单中

4. **CORS 错误**
   - 检查前端域名是否在允许列表中
   - 确认 API 地址配置正确

### 调试技巧

1. **查看 Worker 日志**:
   ```bash
   npx wrangler tail songbrocade-api --format=pretty
   ```

2. **本地测试**:
   ```bash
   cd worker-api
   npx wrangler dev
   ```

3. **检查数据库**:
   ```bash
   npx wrangler d1 execute poap-db --command="PRAGMA table_info(events)"
   ```

## 📚 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [D1 数据库文档](https://developers.cloudflare.com/d1/)
- [R2 存储文档](https://developers.cloudflare.com/r2/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)

## 🎯 部署后检查清单

- [ ] Worker 部署成功
- [ ] D1 数据库连接正常
- [ ] R2 存储桶可用
- [ ] 环境变量设置正确
- [ ] 前端部署成功
- [ ] API 地址配置正确
- [ ] 管理员认证正常
- [ ] 事件创建功能正常
- [ ] 签到功能正常
- [ ] 图片上传功能正常

## 📞 支持

如果遇到问题，请检查：
1. Cloudflare Dashboard 中的 Worker 日志
2. 浏览器开发者工具中的网络请求
3. 数据库中的数据是否正确

---

**注意**: 这是一个完整的旗袍会投票空投系统，包含事件管理、签到、商品管理、积分系统等功能。部署前请确保已了解所有功能和安全要求。
