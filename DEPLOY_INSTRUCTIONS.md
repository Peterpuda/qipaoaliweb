# 部署说明

## 问题说明
Cursor 被视为非交互式环境，wrangler 无法直接部署。需要在您的终端中手动执行部署命令。

## 部署步骤

### 方法 1：使用一键部署脚本

在您的终端中执行：

```bash
cd "/Users/petterbrand/Downloads/旗袍会投票空投系统10.26"
bash deploy-all.sh
```

### 方法 2：分步部署

#### 1. 部署后端 API

```bash
cd "/Users/petterbrand/Downloads/旗袍会投票空投系统10.26/worker-api"
npx wrangler deploy index.js --name songbrocade-api
```

#### 2. 部署前端

```bash
cd "/Users/petterbrand/Downloads/旗袍会投票空投系统10.26/frontend"
npx wrangler pages deploy . --project-name=songbrocade-frontend --branch=main --commit-dirty=true
```

## 部署后的访问地址

- **前端**: https://songbrocade-frontend.pages.dev
- **API**: https://songbrocade-api.petterbrand03.workers.dev

## 验证部署

部署完成后，可以测试签到功能：

```bash
# 测试 API 健康检查
curl https://songbrocade-api.petterbrand03.workers.dev/health

# 测试事件查询
curl "https://songbrocade-api.petterbrand03.workers.dev/api/events/get?slug=qipao-2025"
```

## 最新修复

✅ 已修复签到 API 数据库错误（移除不存在的 token_id、sig、tx_hash 列）
✅ 已添加事件查询 API (/api/events/get?slug=xxx)
✅ 已支持 slug 参数进行签到

## 注意事项

1. 确保使用 Node.js v20.0.0 或更高版本
2. 如果使用 nvm，先切换到正确的 Node 版本：`nvm use 22`
3. 确保已登录 Cloudflare：`npx wrangler login`

