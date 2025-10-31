#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌐 为主页 HTML 添加 data-i18n 属性...\n');

const indexPath = path.join(__dirname, 'frontend/index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 需要替换的内容（更精确的匹配）
const replacements = [
  // AI 匠人分身
  {
    old: '<span class="gradient-text">AI 匠人分身</span>',
    new: '<span class="gradient-text" data-i18n="homepage.platform.ai.title">AI 匠人分身</span>'
  },
  {
    old: '与匠人 AI 对话，了解一针一线的故事。<br/>',
    new: '<span data-i18n="homepage.platform.ai.desc1">与匠人 AI 对话，了解一针一线的故事。</span><br/>'
  },
  {
    old: '<span class="text-white">传承不再是档案，而是有温度的交流</span>',
    new: '<span class="text-white" data-i18n="homepage.platform.ai.desc2">传承不再是档案，而是有温度的交流</span>'
  },
  {
    old: '与匠人对话 <i class="fas fa-arrow-right ml-2"></i>',
    new: '<span data-i18n="homepage.platform.ai.cta">与匠人对话</span> <i class="fas fa-arrow-right ml-2"></i>'
  },
  
  // 永久链上存储
  {
    old: '<span class="gradient-text">永久链上存储</span>',
    new: '<span class="gradient-text" data-i18n="homepage.platform.blockchain.title">永久链上存储</span>'
  },
  {
    old: '工艺纹样、匠人档案、传世作品上链合约。<br/>',
    new: '<span data-i18n="homepage.platform.blockchain.desc1">工艺纹样、匠人档案、传世作品上链合约。</span><br/>'
  },
  {
    old: '<span class="text-white">只要链在，价值就永续</span>',
    new: '<span class="text-white" data-i18n="homepage.platform.blockchain.desc2">只要链在，价值就永续</span>'
  },
  {
    old: '了解技术 <i class="fas fa-arrow-right ml-2"></i>',
    new: '<span data-i18n="homepage.platform.blockchain.cta">了解技术</span> <i class="fas fa-arrow-right ml-2"></i>'
  },
  
  // NFT 真品凭证
  {
    old: '<span class="gradient-text">NFT 真品凭证</span>',
    new: '<span class="gradient-text" data-i18n="homepage.platform.nft.title">NFT 真品凭证</span>'
  },
  {
    old: '每件作品都有唯一链上凭证。<br/>',
    new: '<span data-i18n="homepage.platform.nft.desc1">每件作品都有唯一链上凭证。</span><br/>'
  },
  {
    old: '<span class="text-white">假冒不可能，价值可信任</span>',
    new: '<span class="text-white" data-i18n="homepage.platform.nft.desc2">假冒不可能，价值可信任</span>'
  },
  {
    old: '查看凭证 <i class="fas fa-arrow-right ml-2"></i>',
    new: '<span data-i18n="homepage.platform.nft.cta">查看凭证</span> <i class="fas fa-arrow-right ml-2"></i>'
  },
  
  // 视频加载提示
  {
    old: '<span>加载视频中...</span>',
    new: '<span data-i18n="homepage.hero.videoLoading">加载视频中...</span>'
  },
  
  // Title 和 description
  {
    old: '<title data-i18n="page.title">AI驱动的文化出海平台</title>',
    new: '<title data-i18n="homepage.title">AI驱动的文化出海平台</title>'
  },
  {
    old: '<meta name="description" content="融合AI智能与Web3技术，保护全球非遗文化，解锁·共创·流转 — 文旅不止于故事" />',
    new: '<meta name="description" data-i18n-content="homepage.description" content="融合AI智能与Web3技术，保护全球非遗文化，解锁·共创·流转 — 文旅不止于故事" />'
  }
];

let updated = 0;
replacements.forEach(({ old, new: newStr }) => {
  if (content.includes(old)) {
    content = content.replace(old, newStr);
    updated++;
  }
});

fs.writeFileSync(indexPath, content);

console.log(`✅ 主页已更新 (${updated} 处替换)`);
console.log('\n🎉 完成！主页现在支持多语言');

