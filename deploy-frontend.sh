#!/bin/bash

# 前端部署脚本 - 部署到 Cloudflare Pages
# 使用方法: ./deploy-frontend.sh

set -e

echo "🎨 开始部署前端到 Cloudflare Pages..."

# 检查是否在正确的目录
if [ ! -d "frontend" ]; then
    echo "❌ 未找到 frontend 目录"
    exit 1
fi

# 进入前端目录
cd frontend

# 检查 wrangler 登录状态
echo "📋 检查 Cloudflare 登录状态..."
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo "❌ 未登录 Cloudflare，请先运行: npx wrangler login"
    exit 1
fi
echo "✅ Cloudflare 登录状态正常"

# 部署到 Cloudflare Pages
echo "🚀 部署前端..."
npx wrangler pages deploy . --project-name=poap-checkin-frontend --branch prod --commit-dirty=true

echo "✅ 前端部署完成！"
echo ""
echo "📋 后续步骤："
echo "1. 在 Cloudflare Dashboard 中配置自定义域名（可选）"
echo "2. 更新前端配置中的 API 地址"
echo "3. 测试前端功能"
echo ""
