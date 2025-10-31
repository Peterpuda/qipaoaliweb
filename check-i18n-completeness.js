#!/usr/bin/env node
/**
 * 检查所有语言包的完整性
 * 对比所有语言包的键结构是否一致
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');
const locales = ['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'];

console.log('🔍 检查语言包完整性...\n');

// 读取所有语言包
const languagePacks = {};
locales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  try {
    languagePacks[locale] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`❌ 无法读取 ${locale}.json:`, error.message);
    languagePacks[locale] = {};
  }
});

// 获取所有键的路径
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// 获取每个语言的所有键
const allKeysPerLanguage = {};
locales.forEach(locale => {
  allKeysPerLanguage[locale] = getAllKeys(languagePacks[locale]);
});

// 找出所有语言的并集（应该有的所有键）
const allPossibleKeys = new Set();
Object.values(allKeysPerLanguage).forEach(keys => {
  keys.forEach(key => allPossibleKeys.add(key));
});

console.log(`📊 统计信息：`);
console.log(`  总键数（并集）: ${allPossibleKeys.size}`);
console.log('');

// 检查每个语言的完整性
const issues = {};
locales.forEach(locale => {
  const keys = new Set(allKeysPerLanguage[locale]);
  const missing = [...allPossibleKeys].filter(key => !keys.has(key));
  const extra = [...keys].filter(key => !allPossibleKeys.has(key));
  
  issues[locale] = { missing, extra };
  
  console.log(`${locale}.json:`);
  console.log(`  键数: ${keys.size}`);
  console.log(`  缺失: ${missing.length} 个`);
  console.log(`  多余: ${extra.length} 个`);
  
  if (missing.length === 0 && extra.length === 0) {
    console.log(`  ✅ 完整`);
  } else {
    console.log(`  ❌ 不完整`);
  }
  console.log('');
});

// 显示详细的缺失键
console.log('\n📋 详细问题：\n');

let hasIssues = false;

locales.forEach(locale => {
  const { missing, extra } = issues[locale];
  
  if (missing.length > 0) {
    hasIssues = true;
    console.log(`❌ ${locale}.json 缺失 ${missing.length} 个键：`);
    
    // 按顶层键分组
    const grouped = {};
    missing.forEach(key => {
      const topLevel = key.split('.')[0];
      if (!grouped[topLevel]) grouped[topLevel] = [];
      grouped[topLevel].push(key);
    });
    
    Object.keys(grouped).sort().forEach(topLevel => {
      console.log(`  ${topLevel}: ${grouped[topLevel].length} 个键`);
      if (grouped[topLevel].length <= 10) {
        grouped[topLevel].forEach(key => {
          console.log(`    - ${key}`);
        });
      } else {
        grouped[topLevel].slice(0, 5).forEach(key => {
          console.log(`    - ${key}`);
        });
        console.log(`    ... 还有 ${grouped[topLevel].length - 5} 个`);
      }
    });
    console.log('');
  }
  
  if (extra.length > 0) {
    hasIssues = true;
    console.log(`⚠️  ${locale}.json 有 ${extra.length} 个多余的键：`);
    extra.slice(0, 10).forEach(key => {
      console.log(`    - ${key}`);
    });
    if (extra.length > 10) {
      console.log(`    ... 还有 ${extra.length - 10} 个`);
    }
    console.log('');
  }
});

if (!hasIssues) {
  console.log('✅ 所有语言包都完整！\n');
} else {
  console.log('❌ 发现语言包不完整，需要修复！\n');
}

// 检查顶层键的一致性
console.log('📦 顶层键对比：\n');

const topLevelKeys = {};
locales.forEach(locale => {
  topLevelKeys[locale] = Object.keys(languagePacks[locale]).sort();
});

const referenceKeys = topLevelKeys['en'];
console.log(`参考（英文）: ${referenceKeys.join(', ')}\n`);

locales.forEach(locale => {
  if (locale === 'en') return;
  
  const keys = topLevelKeys[locale];
  const missing = referenceKeys.filter(k => !keys.includes(k));
  const extra = keys.filter(k => !referenceKeys.includes(k));
  
  if (missing.length > 0 || extra.length > 0) {
    console.log(`${locale}:`);
    if (missing.length > 0) {
      console.log(`  ❌ 缺失: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      console.log(`  ⚠️  多余: ${extra.join(', ')}`);
    }
  } else {
    console.log(`${locale}: ✅ 一致`);
  }
});

console.log('\n---\n');

if (hasIssues) {
  console.log('💡 建议：运行 sync-language-packs.js 来同步语言包\n');
  process.exit(1);
} else {
  console.log('✅ 检查完成，所有语言包都完整！\n');
  process.exit(0);
}

