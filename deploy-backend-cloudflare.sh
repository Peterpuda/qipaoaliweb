#!/bin/bash
# Cloudflare Workers 后端部署脚本
# 项目名称: songbrocade-api

set -e

echo "=========================================="
echo "🚀 部署后端到 Cloudflare Workers"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -d "worker-api" ]; then
    echo "❌ 错误: 未找到 worker-api 目录"
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
echo "📦 准备部署后端..."
echo "   项目名称: songbrocade-api"
echo "   目录: worker-api/"
echo ""

# 进入后端目录
cd worker-api

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 部署 Worker
echo "🚀 开始部署..."
wrangler deploy

echo ""
echo "=========================================="
echo "✅ 后端部署完成！"
echo "=========================================="
echo ""
echo "📍 API 地址:"
echo "   https://songbrocade-api.<your-subdomain>.workers.dev"
echo ""
echo "🔗 管理面板:"
echo "   https://dash.cloudflare.com/workers"
echo ""
echo "⚙️  配置 Secrets（如果还没有）:"
echo "   cd worker-api"
echo "   npx wrangler secret put RPC_URL"
echo "   npx wrangler secret put BROCADE_ADDR"
echo "   npx wrangler secret put RDA_REG_ADDR"
echo "   npx wrangler secret put OPENAI_API_KEY"
echo "   npx wrangler secret put REPLICATE_API_KEY"
echo ""

