#!/usr/bin/env node

/**
 * 自动化 i18n 集成脚本
 * 快速为所有页面添加 i18n 支持
 */

const fs = require('fs');
const path = require('path');

// 需要集成的页面列表
const pages = [
  {
    path: 'frontend/product.html',
    name: '商品详情页',
    replacements: [
      // 底部导航栏
      { old: '<span>首页</span>', new: '<span data-i18n="common.home">首页</span>' },
      { old: '<span>客服</span>', new: '<span data-i18n="common.customerService">客服</span>' },
      { old: '<span>购物车</span>', new: '<span data-i18n="common.cart">购物车</span>' },
      { old: '<i class="fas fa-shopping-bag" style="margin-right: 8px;"></i>立即购买', new: '<i class="fas fa-shopping-bag" style="margin-right: 8px;"></i><span data-i18n="product.buyNow">立即购买</span>' },
      // 文化故事按钮
      { old: '<span>了解文化故事</span>', new: '<span data-i18n="product.culturalStory">了解文化故事</span>' },
      // 商品详情文本
      { old: '<p class="text-xs text-secondary">商品详情</p>', new: '<p class="text-xs text-secondary" data-i18n="product.details">商品详情</p>' },
    ]
  },
  {
    path: 'frontend/mall/cart.html',
    name: '购物车页面',
    replacements: [
      // 标题和按钮
      { old: '<i class="fas fa-trash-alt"></i> 清空', new: '<i class="fas fa-trash-alt"></i> <span data-i18n="cart.clear">清空</span>' },
      { old: '<span style="font-size: 14px; color: #333;">全选</span>', new: '<span style="font-size: 14px; color: #333;" data-i18n="cart.selectAll">全选</span>' },
      { old: '去结算', new: '<span data-i18n="cart.checkout">去结算</span>' },
      // 底部导航
      { old: '<span>购物车</span>', new: '<span data-i18n="common.cart">购物车</span>' },
      { old: '<span>首页</span>', new: '<span data-i18n="common.home">首页</span>' },
      { old: '<span>互动</span>', new: '<span data-i18n="common.community">互动</span>' },
      { old: '<span>我的</span>', new: '<span data-i18n="common.profile">我的</span>' },
    ]
  },
  {
    path: 'frontend/mall/profile.html',
    name: '我的页面',
    replacements: [
      // 底部导航
      { old: '<span>首页</span>', new: '<span data-i18n="common.home">首页</span>' },
      { old: '<span>互动</span>', new: '<span data-i18n="common.community">互动</span>' },
      { old: '<span>购物车</span>', new: '<span data-i18n="common.cart">购物车</span>' },
      { old: '<span>我的</span>', new: '<span data-i18n="common.profile">我的</span>' },
    ]
  },
  {
    path: 'frontend/mall/community.html',
    name: '互动中心',
    replacements: [
      // 底部导航
      { old: '<span>首页</span>', new: '<span data-i18n="common.home">首页</span>' },
      { old: '<span>互动</span>', new: '<span data-i18n="common.community">互动</span>' },
      { old: '<span>购物车</span>', new: '<span data-i18n="common.cart">购物车</span>' },
      { old: '<span>我的</span>', new: '<span data-i18n="common.profile">我的</span>' },
    ]
  },
  {
    path: 'frontend/index.html',
    name: '主页',
    replacements: [
      // 导航链接
      { old: '<a href="./about.html" class="hover:text-primary transition">关于我们</a>', new: '<a href="./about.html" class="hover:text-primary transition" data-i18n="nav.about">关于我们</a>' },
      { old: '<a href="./artisans/" class="hover:text-primary transition">匠人</a>', new: '<a href="./artisans/" class="hover:text-primary transition" data-i18n="nav.artisans">匠人</a>' },
      { old: '<a href="./mall/" class="hover:text-primary transition">商城</a>', new: '<a href="./mall/" class="hover:text-primary transition" data-i18n="nav.mall">商城</a>' },
      { old: '<a href="./dao/" class="hover:text-primary transition">DAO</a>', new: '<a href="./dao/" class="hover:text-primary transition" data-i18n="nav.dao">DAO</a>' },
    ]
  }
];

// i18n 脚本模板
const i18nScripts = `  <!-- i18n -->
  <script src="/i18n/index.js"></script>
  <script src="/common/i18n-helper.js"></script>`;

// i18n 初始化代码
const i18nInit = `
  // 初始化 i18n
  await initI18n({
    autoDetect: true,
    translateOnInit: true,
    createSwitcher: true,
    switcherContainerId: 'languageSwitcher'
  });
`;

console.log('🚀 开始自动化 i18n 集成...\n');

let totalUpdated = 0;
let totalReplacements = 0;

pages.forEach(page => {
  const filePath = path.join(__dirname, page.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${page.name} 文件不存在: ${page.path}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  let replacements = 0;
  
  // 1. 添加 i18n 脚本（如果还没有）
  if (!content.includes('/i18n/index.js')) {
    // 在 </head> 之前添加
    content = content.replace('</head>', `${i18nScripts}\n</head>`);
    updated = true;
    console.log(`  ✅ 添加 i18n 脚本`);
  }
  
  // 2. 添加 title 的 data-i18n 属性
  if (content.includes('<title>') && !content.includes('<title data-i18n=')) {
    content = content.replace(/<title>([^<]+)<\/title>/, '<title data-i18n="page.title">$1</title>');
    updated = true;
    replacements++;
  }
  
  // 3. 执行页面特定的替换
  page.replacements.forEach(replacement => {
    if (content.includes(replacement.old)) {
      content = content.replace(replacement.old, replacement.new);
      updated = true;
      replacements++;
    }
  });
  
  // 4. 添加 i18n 初始化（如果还没有）
  if (!content.includes('initI18n')) {
    // 查找 DOMContentLoaded 事件监听器
    if (content.includes("window.addEventListener('DOMContentLoaded',")) {
      // 将函数改为 async
      content = content.replace(
        /window\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*{/g,
        "window.addEventListener('DOMContentLoaded', async () => {"
      );
      
      // 在第一个函数调用之前添加 i18n 初始化
      content = content.replace(
        /window\.addEventListener\('DOMContentLoaded',\s*async\s*\(\)\s*=>\s*{/,
        `window.addEventListener('DOMContentLoaded', async () => {${i18nInit}`
      );
      
      updated = true;
      console.log(`  ✅ 添加 i18n 初始化`);
    }
  }
  
  // 5. 保存文件
  if (updated) {
    fs.writeFileSync(filePath, content);
    totalUpdated++;
    totalReplacements += replacements;
    console.log(`✅ ${page.name} 已更新 (${replacements} 处替换)\n`);
  } else {
    console.log(`⏭️  ${page.name} 无需更新\n`);
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🎉 完成！共更新 ${totalUpdated} 个文件，${totalReplacements} 处替换`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 下一步：');
console.log('1. 检查更新的文件');
console.log('2. 测试多语言功能');
console.log('3. 部署到 Cloudflare\n');

