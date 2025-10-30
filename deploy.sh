#!/bin/bash

# 🚀 Cloudflare 自动部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/Users/petterbrand/Downloads/旗袍会投票空投系统10.26"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}║       🚀 Cloudflare 部署工具                             ║${NC}"
echo -e "${BLUE}║       非遗上链 - 文化传承平台                             ║${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# 检查登录状态
echo -e "${YELLOW}📋 检查 Cloudflare 登录状态...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}❌ 未登录 Cloudflare${NC}"
    echo -e "${YELLOW}请先运行: wrangler login${NC}"
    echo ""
    echo -e "${BLUE}如果无法使用浏览器登录，请：${NC}"
    echo "1. 访问: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. 创建 API Token"
    echo "3. 设置环境变量: export CLOUDFLARE_API_TOKEN='your-token'"
    exit 1
fi

echo -e "${GREEN}✅ 已登录 Cloudflare${NC}"
wrangler whoami
echo ""

# 询问要部署什么
echo -e "${YELLOW}请选择要部署的组件:${NC}"
echo "1) Worker API (后端)"
echo "2) Frontend Pages (前端)"
echo "3) 全部部署"
echo "4) 仅上传视频到 R2"
echo "5) 退出"
echo ""
read -p "请输入选项 [1-5]: " choice

case $choice in
    1)
        echo -e "${BLUE}═════════════════════════════════════${NC}"
        echo -e "${BLUE}  📦 部署 Worker API${NC}"
        echo -e "${BLUE}═════════════════════════════════════${NC}"
        
        cd "$PROJECT_ROOT/worker-api"
        
        echo -e "${YELLOW}📝 当前配置:${NC}"
        cat wrangler.toml
        echo ""
        
        echo -e "${YELLOW}🚀 开始部署...${NC}"
        wrangler deploy
        
        echo ""
        echo -e "${GREEN}✅ Worker API 部署完成！${NC}"
        echo ""
        echo -e "${BLUE}📊 测试 API:${NC}"
        echo "curl https://songbrocade-api.petterbrand03.workers.dev/health"
        ;;
        
    2)
        echo -e "${BLUE}═════════════════════════════════════${NC}"
        echo -e "${BLUE}  🌐 部署 Frontend Pages${NC}"
        echo -e "${BLUE}═════════════════════════════════════${NC}"
        
        cd "$PROJECT_ROOT/frontend"
        
        echo -e "${YELLOW}📝 检查项目是否存在...${NC}"
        if ! npx wrangler pages project list 2>/dev/null | grep -q "poap-checkin-frontend"; then
            echo -e "${YELLOW}📦 首次部署，创建项目...${NC}"
            npx wrangler pages project create poap-checkin-frontend --production-branch=main
        fi
        
        echo -e "${YELLOW}🚀 开始部署前端...${NC}"
        npx wrangler pages deploy . --project-name=poap-checkin-frontend
        
        echo ""
        echo -e "${GREEN}✅ Frontend Pages 部署完成！${NC}"
        ;;
        
    3)
        echo -e "${BLUE}═════════════════════════════════════${NC}"
        echo -e "${BLUE}  🚀 全部部署${NC}"
        echo -e "${BLUE}═════════════════════════════════════${NC}"
        
        # 部署 Worker API
        echo ""
        echo -e "${YELLOW}[1/2] 📦 部署 Worker API...${NC}"
        cd "$PROJECT_ROOT/worker-api"
        wrangler deploy
        echo -e "${GREEN}✅ Worker API 部署完成${NC}"
        
        # 部署 Frontend
        echo ""
        echo -e "${YELLOW}[2/2] 🌐 部署 Frontend Pages...${NC}"
        cd "$PROJECT_ROOT/frontend"
        
        if ! npx wrangler pages project list 2>/dev/null | grep -q "poap-checkin-frontend"; then
            echo -e "${YELLOW}📦 首次部署，创建项目...${NC}"
            npx wrangler pages project create poap-checkin-frontend --production-branch=main
        fi
        
        npx wrangler pages deploy . --project-name=poap-checkin-frontend
        echo -e "${GREEN}✅ Frontend Pages 部署完成${NC}"
        
        echo ""
        echo -e "${GREEN}🎉 全部部署完成！${NC}"
        echo ""
        echo -e "${BLUE}📊 部署摘要:${NC}"
        echo "   Worker API: https://songbrocade-api.petterbrand03.workers.dev"
        echo "   Frontend: 查看上方输出的 Pages URL"
        ;;
        
    4)
        echo -e "${BLUE}═════════════════════════════════════${NC}"
        echo -e "${BLUE}  📹 上传视频到 R2${NC}"
        echo -e "${BLUE}═════════════════════════════════════${NC}"
        
        cd "$PROJECT_ROOT/worker-api"
        
        echo -e "${YELLOW}📦 上传桌面端视频 (15MB)...${NC}"
        wrangler r2 object put poap-images/videos/hero-background-optimized.mp4 \
            --file=../videos/hero-background-optimized.mp4
        echo -e "${GREEN}✅ 桌面端视频上传完成${NC}"
        
        echo -e "${YELLOW}📦 上传移动端视频 (4.1MB)...${NC}"
        wrangler r2 object put poap-images/videos/hero-background-mobile.mp4 \
            --file=../videos/hero-background-mobile.mp4
        echo -e "${GREEN}✅ 移动端视频上传完成${NC}"
        
        echo ""
        echo -e "${GREEN}🎉 视频上传完成！${NC}"
        echo ""
        echo -e "${BLUE}📊 访问 URL:${NC}"
        echo "   桌面端: https://songbrocade-api.petterbrand03.workers.dev/r2/videos/hero-background-optimized.mp4"
        echo "   移动端: https://songbrocade-api.petterbrand03.workers.dev/r2/videos/hero-background-mobile.mp4"
        ;;
        
    5)
        echo -e "${YELLOW}👋 退出部署${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ 无效选项${NC}"
        exit 1
        ;;
esac

# 部署后检查
echo ""
echo -e "${BLUE}═════════════════════════════════════${NC}"
echo -e "${BLUE}  🔍 部署验证${NC}"
echo -e "${BLUE}═════════════════════════════════════${NC}"

if [ "$choice" = "1" ] || [ "$choice" = "3" ]; then
    echo -e "${YELLOW}测试 Worker API...${NC}"
    if curl -s https://songbrocade-api.petterbrand03.workers.dev/health | grep -q "ok"; then
        echo -e "${GREEN}✅ Worker API 健康检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️  Worker API 响应异常，请手动检查${NC}"
    fi
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}║       ✅ 部署完成！                                       ║${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📚 查看完整部署文档:${NC}"
echo "   cat $PROJECT_ROOT/DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${BLUE}🔧 管理 Secrets:${NC}"
echo "   wrangler secret put HEYGEN_API_KEY"
echo "   wrangler secret list"
echo ""
echo -e "${BLUE}📊 查看日志:${NC}"
echo "   wrangler tail"
echo "   npx wrangler pages deployment tail"
echo ""
