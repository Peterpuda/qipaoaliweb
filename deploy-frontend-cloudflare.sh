#!/bin/bash
# Cloudflare Pages 前端部署脚本
# 项目名称: poap-checkin-frontend
# 分支: prod

set -e

echo "=========================================="
echo "🚀 部署前端到 Cloudflare Pages"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -d "frontend" ]; then
    echo "❌ 错误: 未找到 frontend 目录"
    echo "请在项目根目录运行此脚本"
    exit 1
fi

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ 错误: wrangler 未安装"
    echo "请运行: npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
echo "📋 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "🔐 需要登录 Cloudflare..."
    wrangler login
else
    echo "✅ 已登录 Cloudflare"
fi

echo ""
echo "📦 准备部署前端..."
echo "   项目名称: poap-checkin-frontend"
echo "   分支: prod"
echo "   目录: frontend/"
echo ""

# 进入前端目录
cd frontend

# 部署到 Cloudflare Pages
echo "🚀 开始部署..."
wrangler pages deploy . \
    --project-name=poap-checkin-frontend \
    --branch=prod \
    --commit-dirty=true

echo ""
echo "=========================================="
echo "✅ 前端部署完成！"
echo "=========================================="
echo ""
echo "📍 访问地址:"
echo "   生产环境: https://poap-checkin-frontend.pages.dev"
echo "   或自定义域名（如已配置）"
echo ""
echo "🔗 管理面板:"
echo "   https://dash.cloudflare.com/pages"
echo ""

