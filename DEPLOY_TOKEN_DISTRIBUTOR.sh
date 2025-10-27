#!/bin/bash

# ERC20 代币分发合约部署脚本
# 代币地址: 0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa
# 每次签到: 1000 枚代币

set -e

echo "🎯 ERC20 代币分发系统部署脚本"
echo "================================"
echo ""

# 检查是否在 contracts 目录
if [ ! -f "hardhat.config.js" ]; then
    echo "❌ 错误：请在 contracts 目录下运行此脚本"
    echo "   cd contracts"
    exit 1
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件"
    echo "   正在从 .env.example 创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo "   请编辑 .env 文件，填入："
    echo "   - PRIVATE_KEY (有 ETH 的钱包私钥)"
    echo "   - MERKLE_ROOT (从管理后台生成)"
    echo ""
    echo "   然后重新运行此脚本"
    exit 1
fi

# 加载环境变量
source .env

# 检查必需的环境变量
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ 错误：未设置 PRIVATE_KEY"
    echo "   请在 .env 文件中设置"
    exit 1
fi

if [ -z "$MERKLE_ROOT" ] || [ "$MERKLE_ROOT" == "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo "⚠️  警告：MERKLE_ROOT 未设置或为默认值"
    echo "   请先生成 Merkle Tree："
    echo "   1. 访问: https://songbrocade-frontend.pages.dev/admin/merkle.html"
    echo "   2. 输入活动 ID 并生成"
    echo "   3. 将生成的 Merkle Root 填入 .env 文件"
    echo ""
    read -p "是否继续使用默认 Merkle Root？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 配置信息："
echo "   代币地址: 0x9Fc8A071c5a6897AD90c8614de5B26e4e75a57Aa"
echo "   Merkle Root: ${MERKLE_ROOT}"
echo "   网络: Base Sepolia"
echo ""

read -p "确认部署？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消"
    exit 0
fi

echo ""
echo "📦 步骤 1/3: 安装依赖..."
npm install --silent

echo ""
echo "🔨 步骤 2/3: 编译合约..."
npx hardhat compile

echo ""
echo "🚀 步骤 3/3: 部署合约..."
npx hardhat run scripts/deploy-erc20-distributor.js --network baseSepolia

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 下一步操作："
echo "   1. 查看 deployment-info.json 获取合约地址"
echo "   2. 向合约转入代币（签到人数 × 1000 枚）"
echo "   3. 告知用户合约地址和批次号"
echo ""
echo "🔍 验证合约（可选）："
echo "   npx hardhat run scripts/verify-erc20-distributor.js --network baseSepolia"
echo ""

