#!/usr/bin/env node

/**
 * 完善主页的多语言集成
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 完善主页多语言集成...\n');

const indexPath = path.join(__dirname, 'frontend/index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 需要替换的内容
const replacements = [
  // 导航栏
  { old: '>平台</a>', new: ' data-i18n="homepage.nav.platform">平台</a>' },
  { old: '>通证</a>', new: ' data-i18n="homepage.nav.token">通证</a>' },
  { old: '>生态系统</a>', new: ' data-i18n="homepage.nav.ecosystem">生态系统</a>' },
  { old: '>治理</a>', new: ' data-i18n="homepage.nav.governance">治理</a>' },
  { old: '<i class="fas fa-user-shield mr-2"></i>管理员', new: '<i class="fas fa-user-shield mr-2"></i><span data-i18n="homepage.nav.admin">管理员</span>' },
  { old: '>进入平台', new: ' data-i18n="homepage.nav.enter">进入平台' },
];

let updated = 0;
replacements.forEach(({ old, new: newStr }) => {
  if (content.includes(old)) {
    content = content.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
    updated++;
  }
});

fs.writeFileSync(indexPath, content);

console.log(`✅ 主页已更新 (${updated} 处替换)`);
console.log('\n📝 需要在语言包中添加的键：');
console.log('  - homepage.nav.platform');
console.log('  - homepage.nav.token');
console.log('  - homepage.nav.ecosystem');
console.log('  - homepage.nav.governance');
console.log('  - homepage.nav.admin');
console.log('  - homepage.nav.enter');

