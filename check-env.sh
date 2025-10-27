#!/bin/bash

# 环境检查脚本
# 检查部署前的所有必要条件

echo "🔍 检查部署环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi
echo "✅ npm: $(npm --version)"

# 检查 wrangler
if ! command -v npx &> /dev/null; then
    echo "❌ npx 未安装"
    exit 1
fi
echo "✅ npx 可用"

# 检查 Cloudflare 登录
echo "📋 检查 Cloudflare 登录状态..."
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo "❌ 未登录 Cloudflare"
    echo "请运行: npx wrangler login"
    exit 1
fi
echo "✅ Cloudflare 已登录"

# 检查项目结构
echo "📁 检查项目结构..."
required_dirs=("worker-api" "frontend" "contracts")
for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ 缺少目录: $dir"
        exit 1
    fi
done
echo "✅ 项目结构完整"

# 检查配置文件
echo "📄 检查配置文件..."
if [ ! -f "worker-api/wrangler.toml" ]; then
    echo "❌ 缺少 worker-api/wrangler.toml"
    exit 1
fi
echo "✅ 配置文件存在"

# 检查依赖
echo "📦 检查依赖..."
cd worker-api
if [ ! -d "node_modules" ]; then
    echo "⚠️  worker-api 依赖未安装，正在安装..."
    npm install
fi
echo "✅ worker-api 依赖完整"

cd ../frontend
if [ ! -f "package.json" ]; then
    echo "⚠️  前端没有 package.json，跳过依赖检查"
else
    if [ ! -d "node_modules" ]; then
        echo "⚠️  前端依赖未安装，正在安装..."
        npm install
    fi
    echo "✅ 前端依赖完整"
fi

cd ..

echo ""
echo "🎉 环境检查完成！可以开始部署了。"
echo ""
echo "📋 部署命令："
echo "1. 部署后端: ./deploy.sh"
echo "2. 部署前端: ./deploy-frontend.sh"
echo ""
