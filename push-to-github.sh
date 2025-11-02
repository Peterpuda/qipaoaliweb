#!/bin/bash

echo "=========================================="
echo "🚀 推送代码到GitHub"
echo "=========================================="
echo ""

cd /Users/petterbrand/Downloads/阿里云

echo "📋 当前仓库信息："
echo "  - 仓库: https://github.com/Peterpuda/qipaoaliweb"
echo "  - 分支: main"
echo "  - 待推送: 59 commits"
echo ""

echo "🔐 需要GitHub认证"
echo ""
echo "方式1: 使用GitHub CLI（推荐）"
echo "  1. 安装: brew install gh"
echo "  2. 登录: gh auth login"
echo "  3. 推送: git push origin main"
echo ""
echo "方式2: 使用Personal Access Token"
echo "  1. 访问: https://github.com/settings/tokens"
echo "  2. 点击 'Generate new token (classic)'"
echo "  3. 勾选 'repo' 权限"
echo "  4. 生成并复制token"
echo "  5. 推送时输入token作为密码"
echo ""
echo "方式3: 使用GitHub Desktop"
echo "  1. 下载: https://desktop.github.com/"
echo "  2. 登录GitHub账号"
echo "  3. 添加本地仓库"
echo "  4. 点击Push推送"
echo ""

read -p "选择方式 (1/2/3): " choice

case $choice in
  1)
    echo ""
    echo "📦 检查GitHub CLI..."
    if ! command -v gh &> /dev/null; then
      echo "⚠️ 未安装GitHub CLI"
      echo "正在安装..."
      brew install gh
    fi
    
    echo "🔐 登录GitHub..."
    gh auth login
    
    echo "🚀 推送代码..."
    git push origin main
    
    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ 推送成功！"
      echo "🌐 访问: https://github.com/Peterpuda/qipaoaliweb"
    else
      echo "❌ 推送失败"
    fi
    ;;
    
  2)
    echo ""
    echo "📝 请按照以下步骤操作："
    echo ""
    echo "1. 访问: https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token (classic)'"
    echo "3. 勾选 'repo' 权限"
    echo "4. 点击 'Generate token'"
    echo "5. 复制生成的token（格式: ghp_xxxx...）"
    echo ""
    read -p "已生成token？按回车继续..."
    echo ""
    echo "🚀 推送代码..."
    echo "⚠️ 用户名输入: Peterpuda"
    echo "⚠️ 密码输入: 粘贴您的token"
    echo ""
    git push origin main
    ;;
    
  3)
    echo ""
    echo "📝 请按照以下步骤操作："
    echo ""
    echo "1. 下载GitHub Desktop: https://desktop.github.com/"
    echo "2. 安装并打开GitHub Desktop"
    echo "3. 登录您的GitHub账号"
    echo "4. 点击 'File' → 'Add Local Repository'"
    echo "5. 选择目录: /Users/petterbrand/Downloads/阿里云"
    echo "6. 点击右上角 'Push origin' 按钮"
    echo ""
    echo "✅ 完成后，访问查看: https://github.com/Peterpuda/qipaoaliweb"
    ;;
    
  *)
    echo "❌ 无效选择"
    exit 1
    ;;
esac

echo ""
echo "=========================================="
echo "📚 下一步："
echo "1. 配置GitHub Secrets"
echo "   访问: https://github.com/Peterpuda/qipaoaliweb/settings/secrets/actions"
echo "   参考: setup-github-secrets.md"
echo ""
echo "2. 查看部署进度"
echo "   访问: https://github.com/Peterpuda/qipaoaliweb/actions"
echo "=========================================="

