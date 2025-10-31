#!/usr/bin/env node
/**
 * 修复剩余的 26+ 处未翻译内容
 * 包括长段落、混合中英文等复杂情况
 */

const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'frontend/index.html');
let htmlContent = fs.readFileSync(htmlFile, 'utf-8');

console.log('🔄 正在修复剩余的未翻译内容...\n');

// 定义所有需要替换的内容
const replacements = [
  // Token 区域 - 长段落
  {
    find: '<span class="text-white font-semibold">$QI</span> 不是炒币的筹码，\n            而是 <strong class="text-[#D4AF37]">参与文化守护的身份证明</strong>。\n            基于 <strong class="text-white">Base Chain</strong> 发行，持有 $QI 意味着你成为了：',
    replace: '<span class="text-white font-semibold">$QI</span> <span data-i18n="homepage.token.introText1">不是炒币的筹码，而是</span> <strong class="text-[#D4AF37]" data-i18n="homepage.token.proofText">参与文化守护的身份证明</strong><span data-i18n="homepage.token.introText2">。基于</span> <strong class="text-white">Base Chain</strong> <span data-i18n="homepage.token.introText3">发行，持有 $QI 意味着你成为了：</span>'
  },
  
  // Token 区域 - 文化决策者
  {
    find: '<h4 class="font-bold text-lg mb-1 text-white">文化决策者</h4>',
    replace: '<h4 class="font-bold text-lg mb-1 text-white" data-i18n="homepage.token.role1Title">文化决策者</h4>'
  },
  {
    find: '                <p class="text-gray-400 text-sm sm:text-base leading-relaxed">\n                  对哪些非遗项目值得上链、资金如何分配、未来如何发展 — \n                  <span class="text-[#D4AF37]">你的一票决定文化的走向</span>。\n                  这不是形式，而是真正的话语权\n                </p>',
    replace: '                <p class="text-gray-400 text-sm sm:text-base leading-relaxed" data-i18n="homepage.token.role1DescFull">\n                  对哪些非遗项目值得上链、资金如何分配、未来如何发展 — 你的一票决定文化的走向。这不是形式，而是真正的话语权\n                </p>'
  },
  
  // Token 区域 - 传承贡献者
  {
    find: '<h4 class="font-bold text-lg mb-1 text-white">传承贡献者</h4>',
    replace: '<h4 class="font-bold text-lg mb-1 text-white" data-i18n="homepage.token.role2Title">传承贡献者</h4>'
  },
  {
    find: '                <p class="text-gray-400 text-sm sm:text-base leading-relaxed">\n                  <span class="text-[#D4AF37]">每日签到、分享故事、创作内容</span> — \n                  每一次参与都会获得通证奖励。守护文化的过程，也是价值累积的过程\n                </p>',
    replace: '                <p class="text-gray-400 text-sm sm:text-base leading-relaxed" data-i18n="homepage.token.role2DescFull">\n                  每日签到、分享故事、创作内容 — 每一次参与都会获得通证奖励。守护文化的过程，也是价值累积的过程\n                </p>'
  },
  
  // Token 区域 - 文化收藏家
  {
    find: '<h4 class="font-bold text-lg mb-1 text-white">文化收藏家</h4>',
    replace: '<h4 class="font-bold text-lg mb-1 text-white" data-i18n="homepage.token.role3Title">文化收藏家</h4>'
  },
  {
    find: '                <p class="text-gray-400 text-sm sm:text-base leading-relaxed">\n                  <span data-i18n="homepage.token.role3Desc">优先购买限量 NFT 真品、你的钱包，就是博物馆</span>\n                  参加线下非遗体验、与 AI 匠人深度对话 — \n                  <span class="text-white">你的钱包，就是博物馆</span>\n                </p>',
    replace: '                <p class="text-gray-400 text-sm sm:text-base leading-relaxed" data-i18n="homepage.token.role3DescFull">\n                  优先购买限量 NFT 真品、参加线下非遗体验、与 AI 匠人深度对话 — 你的钱包，就是博物馆\n                </p>'
  },
  
  // Token 区域 - 合规声明
  {
    find: '              <strong class="text-white">合规声明：</strong>$QI 为社区功能凭证，非证券且不具备投资功能，\n              不支持二级市场交易或转让。仅用于生态治理和权益访问。',
    replace: '              <strong class="text-white" data-i18n="homepage.token.complianceLabel">合规声明：</strong><span data-i18n="homepage.token.complianceText">$QI 为社区功能凭证，非证券且不具备投资功能，不支持二级市场交易或转让。仅用于生态治理和权益访问。</span>'
  },
  
  // Token 区域 - 统计标签
  {
    find: '<div class="text-xl sm:text-2xl font-bold text-white">总供应量</div>',
    replace: '<div class="text-xl sm:text-2xl font-bold text-white" data-i18n="homepage.token.stat1Label">总供应量</div>'
  },
  {
    find: '<div class="text-xl sm:text-2xl font-bold text-white">流通量</div>',
    replace: '<div class="text-xl sm:text-2xl font-bold text-white" data-i18n="homepage.token.stat2Label">流通量</div>'
  },
  {
    find: '<div class="text-xl sm:text-2xl font-bold text-white">持有人</div>',
    replace: '<div class="text-xl sm:text-2xl font-bold text-white" data-i18n="homepage.token.stat3Label">持有人</div>'
  },
  {
    find: '<div class="text-xl sm:text-2xl font-bold text-white">链上网络</div>',
    replace: '<div class="text-xl sm:text-2xl font-bold text-white" data-i18n="homepage.token.stat4Label">链上网络</div>'
  },
  
  // Ecosystem 区域
  {
    find: '<span class="gradient-text">文化永续的未来</span>',
    replace: '<span class="gradient-text" data-i18n="homepage.ecosystem.subtitle">文化永续的未来</span>'
  },
  {
    find: '每次参与都有链上记录。',
    replace: '<span data-i18n="homepage.ecosystem.feature3Desc">每次参与都有链上记录。</span>'
  },
  {
    find: '文化的未来，由全球决定。',
    replace: '<span data-i18n="homepage.ecosystem.feature4Desc">文化的未来，由全球决定。</span>'
  },
  {
    find: '<span class="text-[#D4AF37] font-semibold">区块链</span>',
    replace: '<span class="text-[#D4AF37] font-semibold" data-i18n="homepage.ecosystem.techLabel1">区块链</span>'
  },
  {
    find: '<span class="text-[#D4AF37] font-semibold">去中心化存储</span>',
    replace: '<span class="text-[#D4AF37] font-semibold" data-i18n="homepage.ecosystem.techLabel2">去中心化存储</span>'
  },
  
  // Governance 区域
  {
    find: '<strong class="text-white">热爱传统的文化守护者</strong>',
    replace: '<strong class="text-white" data-i18n="homepage.governance.audience1">热爱传统的文化守护者</strong>'
  },
  {
    find: '<strong class="text-white">手握技艺的传承匠人</strong>',
    replace: '<strong class="text-white" data-i18n="homepage.governance.audience2">手握技艺的传承匠人</strong>'
  },
  {
    find: '<div class="text-gray-400 text-xs sm:text-sm">链上运行</div>',
    replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.governance.stat1Desc">链上运行</div>'
  },
  {
    find: '<div class="text-gray-400 text-xs sm:text-sm">开源透明</div>',
    replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.governance.stat2Desc">开源透明</div>'
  },
  {
    find: '<div class="text-gray-400 text-xs sm:text-sm">永久存储</div>',
    replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.governance.stat3Desc">永久存储</div>'
  },
  
  // Footer 区域
  {
    find: '<div class="text-2xl font-bold mb-2">非遗上链</div>',
    replace: '<div class="text-2xl font-bold mb-2" data-i18n="homepage.footer.brandName">非遗上链</div>'
  },
  {
    find: '<h3 class="text-lg font-bold mb-4">快速链接</h3>',
    replace: '<h3 class="text-lg font-bold mb-4" data-i18n="homepage.footer.quickLinksTitle">快速链接</h3>'
  },
  {
    find: '<h3 class="text-lg font-bold mb-4">资源文档</h3>',
    replace: '<h3 class="text-lg font-bold mb-4" data-i18n="homepage.footer.resourcesTitle">资源文档</h3>'
  }
];

let count = 0;
let notFound = [];

replacements.forEach(({ find, replace }, index) => {
  if (htmlContent.includes(find)) {
    htmlContent = htmlContent.replace(find, replace);
    count++;
    console.log(`✅ [${index + 1}/${replacements.length}] 已替换`);
  } else {
    notFound.push(index + 1);
    console.log(`⚠️  [${index + 1}/${replacements.length}] 未找到（可能已修改）`);
  }
});

// 写回文件
fs.writeFileSync(htmlFile, htmlContent, 'utf-8');

console.log(`\n✅ 成功替换 ${count}/${replacements.length} 处\n`);

if (notFound.length > 0) {
  console.log(`⚠️  以下 ${notFound.length} 处未找到（可能已修改或不存在）：`);
  console.log(`   ${notFound.join(', ')}\n`);
}

console.log('📊 修复统计：');
console.log('  - Token 区域: 13 处');
console.log('  - Ecosystem 区域: 5 处');
console.log('  - Governance 区域: 5 处');
console.log('  - Footer 区域: 3 处\n');
console.log('✅ HTML 修复完成！\n');

process.exit(0);

