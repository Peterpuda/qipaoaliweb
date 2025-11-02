#!/bin/bash
# Cloudflare 完整部署脚本
# 一键部署前端和后端

set -e

echo "=========================================="
echo "🚀 Cloudflare 完整部署"
echo "=========================================="
echo ""
echo "将依次部署："
echo "  1. 后端 API (songbrocade-api)"
echo "  2. 前端 Pages (poap-checkin-frontend)"
echo ""
read -p "按 Enter 继续，或 Ctrl+C 取消..."
echo ""

# 部署后端
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "步骤 1/2: 部署后端"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./deploy-backend-cloudflare.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "步骤 2/2: 部署前端"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./deploy-frontend-cloudflare.sh

echo ""
echo "=========================================="
echo "🎉 完整部署成功！"
echo "=========================================="
echo ""
echo "📍 访问地址:"
echo "   前端: https://poap-checkin-frontend.pages.dev"
echo "   后端: https://songbrocade-api.<your-subdomain>.workers.dev"
echo ""
echo "🔗 Cloudflare 控制台:"
echo "   Pages: https://dash.cloudflare.com/pages"
echo "   Workers: https://dash.cloudflare.com/workers"
echo ""

