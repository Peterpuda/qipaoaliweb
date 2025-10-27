#!/bin/bash

# 完整部署脚本 - 部署前端和后端到 Cloudflare
# 使用方法: ./deploy-all.sh

set -e

echo "🚀 开始部署旗袍会投票空投系统..."
echo ""

# 部署后端 API
echo "📦 步骤 1/2: 部署后端 API 到 Cloudflare Workers..."
cd worker-api
npx wrangler deploy index.js --name songbrocade-api
echo "✅ 后端 API 部署完成！"
echo ""

# 部署前端
echo "🎨 步骤 2/2: 部署前端到 Cloudflare Pages..."
cd ../frontend
npx wrangler pages deploy . --project-name=songbrocade-frontend --branch=main --commit-dirty=true
echo "✅ 前端部署完成！"
echo ""

echo "🎉 所有部署完成！"
echo ""
echo "📋 访问地址："
echo "  - 前端: https://songbrocade-frontend.pages.dev"
echo "  - API: https://songbrocade-api.petterbrand03.workers.dev"
echo ""

