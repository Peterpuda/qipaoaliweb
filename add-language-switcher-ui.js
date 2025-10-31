#!/usr/bin/env node

/**
 * 为所有页面添加语言切换器 UI 容器
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 添加语言切换器 UI 容器...\n');

// 为我的页面添加
const profilePath = path.join(__dirname, 'frontend/mall/profile.html');
let profileContent = fs.readFileSync(profilePath, 'utf8');

// 在用户卡片前添加顶部栏
if (!profileContent.includes('languageSwitcher')) {
  profileContent = profileContent.replace(
    '<body>',
    `<body>
  <!-- 顶部栏 -->
  <div style="position: sticky; top: 0; z-index: 100; background: white; border-bottom: 1px solid #e0e0e0; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
    <div style="font-size: 18px; font-weight: bold; color: #333;">
      <i class="fas fa-user" style="color: #9E2A2B; margin-right: 8px;"></i>我的
    </div>
    <div id="languageSwitcher"></div>
  </div>
`
  );
  fs.writeFileSync(profilePath, profileContent);
  console.log('✅ profile.html - 已添加语言切换器');
} else {
  console.log('⏭️  profile.html - 已存在');
}

// 为互动中心添加
const communityPath = path.join(__dirname, 'frontend/mall/community.html');
let communityContent = fs.readFileSync(communityPath, 'utf8');

if (!communityContent.includes('languageSwitcher')) {
  communityContent = communityContent.replace(
    '<body>',
    `<body>
  <!-- 顶部栏 -->
  <div style="position: sticky; top: 0; z-index: 100; background: white; border-bottom: 1px solid #e0e0e0; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
    <div style="font-size: 18px; font-weight: bold; color: #333;">
      <i class="fas fa-comments" style="color: #9E2A2B; margin-right: 8px;"></i>互动中心
    </div>
    <div id="languageSwitcher"></div>
  </div>
`
  );
  fs.writeFileSync(communityPath, communityContent);
  console.log('✅ community.html - 已添加语言切换器');
} else {
  console.log('⏭️  community.html - 已存在');
}

// 为主页添加（在导航栏中）
const indexPath = path.join(__dirname, 'frontend/index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

if (!indexContent.includes('languageSwitcher')) {
  // 在连接钱包按钮前添加语言切换器
  indexContent = indexContent.replace(
    /<button id="connectWallet"[^>]*>/,
    `<!-- 语言切换器 -->
        <div id="languageSwitcher"></div>
        $&`
  );
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ index.html - 已添加语言切换器');
} else {
  console.log('⏭️  index.html - 已存在');
}

console.log('\n🎉 完成！所有页面都已添加语言切换器容器');
console.log('\n📍 语言切换器位置：');
console.log('  - 商城首页: 搜索框右侧');
console.log('  - 商品详情: 顶部导航栏右侧（连接钱包按钮旁）');
console.log('  - 购物车: 顶部栏右侧（清空按钮旁）');
console.log('  - 我的页面: 顶部栏右侧');
console.log('  - 互动中心: 顶部栏右侧');
console.log('  - 主页: 顶部导航栏右侧');

