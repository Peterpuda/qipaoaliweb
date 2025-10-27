#!/bin/bash

# 旗袍会投票空投系统 - Cloudflare 部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署旗袍会投票空投系统到 Cloudflare..."

# 检查是否已登录 Cloudflare
echo "📋 检查 Cloudflare 登录状态..."
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo "❌ 未登录 Cloudflare，请先运行: npx wrangler login"
    exit 1
fi
echo "✅ Cloudflare 登录状态正常"

# 进入 worker-api 目录
cd worker-api

# 检查依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "📥 安装依赖..."
    npm install
fi
echo "✅ 依赖检查完成"

# 检查 D1 数据库
echo "🗄️  检查 D1 数据库..."
DB_ID=$(grep "database_id" wrangler.toml | cut -d'"' -f2)
if [ -z "$DB_ID" ]; then
    echo "❌ 未找到 database_id，请检查 wrangler.toml"
    exit 1
fi

# 检查数据库是否存在
if ! npx wrangler d1 list | grep -q "$DB_ID"; then
    echo "⚠️  数据库不存在，正在创建..."
    npx wrangler d1 create poap-db
    echo "✅ 数据库创建完成，请更新 wrangler.toml 中的 database_id"
    exit 1
fi
echo "✅ D1 数据库检查完成"

# 初始化数据库 schema
echo "🔧 初始化数据库 schema..."
if [ -f "migrations/004_badges_issues.sql" ]; then
    npx wrangler d1 execute poap-db --file=migrations/004_badges_issues.sql
    echo "✅ 数据库迁移完成"
fi

# 检查必要的 secrets
echo "🔐 检查环境变量和 secrets..."

# 检查管理员地址 secret
if ! npx wrangler secret list | grep -q "ADMIN_WALLETS_SECRET"; then
    echo "⚠️  未设置管理员地址 secret，正在设置..."
    echo "0xEf85456652ada05f12708b9bDcF215780E780D18" | npx wrangler secret put ADMIN_WALLETS_SECRET
    echo "✅ 管理员地址 secret 设置完成"
fi

# 检查 RPC URL secret（可选）
if ! npx wrangler secret list | grep -q "RPC_URL"; then
    echo "⚠️  未设置 RPC URL secret，正在设置..."
    echo "https://sepolia.base.org" | npx wrangler secret put RPC_URL
    echo "✅ RPC URL secret 设置完成"
fi

echo "✅ 环境变量检查完成"

# 部署 Worker
echo "🚀 部署 Worker..."
npx wrangler deploy
echo "✅ Worker 部署完成"

# 获取 Worker URL
WORKER_URL=$(npx wrangler deployments list | head -n 2 | tail -n 1 | awk '{print $2}')
echo "🌐 Worker URL: $WORKER_URL"

# 测试部署
echo "🧪 测试部署..."
if curl -s "$WORKER_URL/health" | grep -q "ok"; then
    echo "✅ 部署测试成功"
else
    echo "⚠️  部署测试失败，请检查 Worker 日志"
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 后续步骤："
echo "1. 更新前端配置中的 API 地址: $WORKER_URL"
echo "2. 部署前端到 Cloudflare Pages"
echo "3. 测试所有功能"
echo ""
echo "🔧 管理命令："
echo "- 查看日志: npx wrangler tail"
echo "- 查看 secrets: npx wrangler secret list"
echo "- 更新管理员: node manage-admin.js set <addresses>"
echo ""
