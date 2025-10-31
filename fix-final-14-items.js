#!/usr/bin/env node
/**
 * 修复最后 14 处未翻译内容
 */

const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'frontend/index.html');
let htmlContent = fs.readFileSync(htmlFile, 'utf-8');

console.log('🔄 正在修复最后 14 处未翻译内容...\n');

// 使用正则表达式替换所有匹配项
const replacements = [
  // Token 统计卡片（第二组）
  {
    pattern: /<div class="text-gray-400 text-xs sm:text-sm mb-1">总供应量<\/div>/g,
    replace: '<div class="text-gray-400 text-xs sm:text-sm mb-1" data-i18n="homepage.token.stat1Label">总供应量</div>',
    name: '总供应量'
  },
  {
    pattern: /<div class="text-gray-400 text-xs sm:text-sm mb-1">流通量<\/div>/g,
    replace: '<div class="text-gray-400 text-xs sm:text-sm mb-1" data-i18n="homepage.token.stat2Label">流通量</div>',
    name: '流通量'
  },
  {
    pattern: /<div class="text-gray-400 text-xs sm:text-sm mb-1">持有人<\/div>/g,
    replace: '<div class="text-gray-400 text-xs sm:text-sm mb-1" data-i18n="homepage.token.stat3Label">持有人</div>',
    name: '持有人'
  },
  {
    pattern: /<div class="text-gray-400 text-xs sm:text-sm mb-1">链上网络<\/div>/g,
    replace: '<div class="text-gray-400 text-xs sm:text-sm mb-1" data-i18n="homepage.token.stat4Label">链上网络</div>',
    name: '链上网络'
  },
  
  // Ecosystem 区域
  {
    pattern: /文化永续的未来/g,
    replace: '<span data-i18n="homepage.ecosystem.subtitle">文化永续的未来</span>',
    name: '文化永续的未来'
  },
  {
    pattern: /每次参与都有链上记录。/g,
    replace: '<span data-i18n="homepage.ecosystem.feature3Desc">每次参与都有链上记录。</span>',
    name: '每次参与都有链上记录'
  },
  {
    pattern: /文化的未来，由全球决定。/g,
    replace: '<span data-i18n="homepage.ecosystem.feature4Desc">文化的未来，由全球决定。</span>',
    name: '文化的未来，由全球决定'
  },
  
  // Governance 统计
  {
    pattern: /<div class="text-gray-400 text-xs sm:text-sm">链上运行<\/div>/g,
    replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.governance.stat1Desc">链上运行</div>',
    name: '链上运行'
  },
  {
    pattern: /<div class="text-gray-400 text-xs sm:text-sm">开源透明<\/div>/g,
    replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.governance.stat2Desc">开源透明</div>',
    name: '开源透明'
  },
  {
    pattern: /<div class="text-gray-400 text-xs sm:text-sm">永久存储<\/div>/g,
    replace: '<div class="text-gray-400 text-xs sm:text-sm" data-i18n="homepage.governance.stat3Desc">永久存储</div>',
    name: '永久存储'
  }
];

let totalCount = 0;

replacements.forEach(({ pattern, replace, name }, index) => {
  const matches = htmlContent.match(pattern);
  const count = matches ? matches.length : 0;
  
  if (count > 0) {
    htmlContent = htmlContent.replace(pattern, replace);
    totalCount += count;
    console.log(`✅ [${index + 1}/${replacements.length}] "${name}" - 替换了 ${count} 处`);
  } else {
    console.log(`⚠️  [${index + 1}/${replacements.length}] "${name}" - 未找到`);
  }
});

// 写回文件
fs.writeFileSync(htmlFile, htmlContent, 'utf-8');

console.log(`\n✅ 总共替换了 ${totalCount} 处\n`);
console.log('✅ 最终修复完成！\n');

process.exit(0);

