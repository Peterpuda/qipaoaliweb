# 🚀 旗袍会投票空投系统 - 快速部署参考

## 📍 当前部署地址

### 后端 API
- **URL**: https://songbrocade-api.petterbrand03.workers.dev
- **健康检查**: https://songbrocade-api.petterbrand03.workers.dev/health
- **状态**: ✅ 正常运行

### 前端应用
- **生产域名**: https://7e2ada77.poap-checkin-frontend.pages.dev
- **项目名称**: poap-checkin-frontend
- **分支**: prod
- **状态**: ✅ 正常运行

## 🔧 常用部署命令

### 部署后端 Worker
```bash
cd worker-api
npx wrangler deploy
```

### 部署前端 Pages
```bash
cd frontend
npx wrangler pages deploy . --project-name poap-checkin-frontend --branch prod --commit-dirty=true
```

### 查看日志
```bash
# Worker 日志
npx wrangler tail songbrocade-api

# Pages 日志
npx wrangler pages deployment tail poap-checkin-frontend
```

### 数据库操作
```bash
# 查看事件
npx wrangler d1 execute poap-db --command="SELECT * FROM events LIMIT 5"

# 查看签到记录
npx wrangler d1 execute poap-db --command="SELECT * FROM checkins LIMIT 5"

# 执行 SQL 文件
npx wrangler d1 execute poap-db --file=migrations/004_badges_issues.sql
```

## 🔐 环境变量管理

### 查看所有 Secrets
```bash
npx wrangler secret list --name songbrocade-api
```

### 设置管理员地址
```bash
cd worker-api
node manage-admin.js set 0x新地址1,0x新地址2
```

### 设置 RPC URL
```bash
echo "https://sepolia.base.org" | npx wrangler secret put RPC_URL --name songbrocade-api
```

## 📊 测试 API

### 健康检查
```bash
curl https://songbrocade-api.petterbrand03.workers.dev/health
```

### 获取认证挑战
```bash
curl https://songbrocade-api.petterbrand03.workers.dev/auth/challenge
```

### 测试管理员认证
```bash
curl -X GET https://songbrocade-api.petterbrand03.workers.dev/admin/whoami \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛠️ 故障排除

### Worker 部署失败
```bash
# 检查配置
cd worker-api
npx wrangler deploy --dry-run

# 查看错误日志
npx wrangler tail songbrocade-api --format=pretty
```

### Pages 部署失败
```bash
# 检查项目是否存在
npx wrangler pages project list

# 查看部署历史
npx wrangler pages deployment list poap-checkin-frontend
```

### 数据库问题
```bash
# 检查数据库绑定
npx wrangler d1 list

# 查看数据库信息
npx wrangler d1 info poap-db
```

## 📝 项目结构

```
旗袍会投票空投系统10.26/
├── worker-api/          # 后端 Worker
│   ├── index.js        # 主入口
│   ├── wrangler.toml   # Worker 配置
│   └── utils/          # 工具函数
├── frontend/           # 前端应用
│   ├── index.html      # 主页面
│   ├── admin/          # 管理后台
│   └── common/          # 公共资源
├── contracts/          # 智能合约
├── deploy.sh           # 后端部署脚本
├── deploy-frontend.sh  # 前端部署脚本
└── check-env.sh        # 环境检查脚本
```

## 🎯 快速开始

1. **测试后端**:
   ```bash
   curl https://songbrocade-api.petterbrand03.workers.dev/health
   ```

2. **访问前端**:
   打开 https://7e2ada77.poap-checkin-frontend.pages.dev

3. **管理员登录**:
   - 使用钱包地址: `0xEf85456652ada05f12708b9bDcF215780E780D18`
   - 签名认证后即可管理

## 🔄 更新部署

### 更新后端
```bash
cd worker-api
# 修改代码后
npx wrangler deploy
```

### 更新前端
```bash
cd frontend
# 修改代码后
npx wrangler pages deploy . --project-name poap-checkin-frontend --branch prod --commit-dirty=true
```

## 📞 技术支持

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Worker 管理**: https://dash.cloudflare.com > Workers & Pages
- **Pages 管理**: https://dash.cloudflare.com > Workers & Pages > poap-checkin-frontend
- **数据库管理**: https://dash.cloudflare.com > Workers & Pages > D1

---

**最后更新**: 2025年10月26日
