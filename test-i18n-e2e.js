#!/usr/bin/env node
/**
 * i18n 端到端测试
 * 验证所有语言版本的翻译完整性
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 开始 i18n 端到端测试...\n');

const LOCALES = ['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'];
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const LOCALES_DIR = path.join(FRONTEND_DIR, 'i18n/locales');

// 测试用例
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// 测试 1: 所有语言包文件存在
test('All language pack files exist', () => {
  LOCALES.forEach(locale => {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    assert(fs.existsSync(filePath), `Language pack ${locale}.json not found`);
  });
});

// 测试 2: 所有语言包可以正确解析
test('All language packs are valid JSON', () => {
  LOCALES.forEach(locale => {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      JSON.parse(content);
    } catch (error) {
      throw new Error(`${locale}.json is not valid JSON: ${error.message}`);
    }
  });
});

// 测试 3: 所有语言包有相同的键结构
test('All language packs have the same key structure', () => {
  const enPath = path.join(LOCALES_DIR, 'en.json');
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const enKeys = getAllKeys(enData);
  
  LOCALES.forEach(locale => {
    if (locale === 'en') return;
    
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const keys = getAllKeys(data);
    
    const missingKeys = enKeys.filter(k => !keys.includes(k));
    const extraKeys = keys.filter(k => !enKeys.includes(k));
    
    assert(
      missingKeys.length === 0 && extraKeys.length === 0,
      `${locale}.json has different keys: missing ${missingKeys.length}, extra ${extraKeys.length}`
    );
  });
});

// 测试 4: 没有空翻译
test('No empty translations', () => {
  LOCALES.forEach(locale => {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const allKeys = getAllKeys(data);
    
    allKeys.forEach(key => {
      const value = getValueByPath(data, key);
      assert(
        value && value.trim().length > 0,
        `${locale}.json has empty translation for key: ${key}`
      );
    });
  });
});

// 测试 5: 非中文语言包不包含中文字符（除了特殊情况）
test('Non-Chinese language packs do not contain Chinese characters', () => {
  const CHINESE_REGEX = /[\u4e00-\u9fa5]/;
  
  LOCALES.forEach(locale => {
    if (locale === 'zh') return; // 跳过中文
    
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // 检查所有值
    const allKeys = getAllKeys(data);
    const keysWithChinese = [];
    
    allKeys.forEach(key => {
      const value = getValueByPath(data, key);
      if (typeof value === 'string' && CHINESE_REGEX.test(value)) {
        keysWithChinese.push(key);
      }
    });
    
    assert(
      keysWithChinese.length === 0,
      `${locale}.json contains Chinese characters in keys: ${keysWithChinese.join(', ')}`
    );
  });
});

// 测试 6: 主页包含 i18n 脚本
test('Homepage includes i18n scripts', () => {
  const indexPath = path.join(FRONTEND_DIR, 'index.html');
  const content = fs.readFileSync(indexPath, 'utf-8');
  
  assert(
    content.includes('/i18n/index.js'),
    'Homepage does not include /i18n/index.js'
  );
  
  assert(
    content.includes('/common/i18n-helper.js'),
    'Homepage does not include /common/i18n-helper.js'
  );
});

// 测试 7: 主页包含语言切换器容器
test('Homepage includes language switcher container', () => {
  const indexPath = path.join(FRONTEND_DIR, 'index.html');
  const content = fs.readFileSync(indexPath, 'utf-8');
  
  assert(
    content.includes('id="languageSwitcher"') || content.includes("id='languageSwitcher'"),
    'Homepage does not include language switcher container'
  );
});

// 辅助函数
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

function getValueByPath(obj, path) {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

// 运行所有测试
async function runTests() {
  console.log(`Running ${tests.length} tests...\n`);
  
  for (const test of tests) {
    try {
      await test.fn();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results:`);
  console.log(`   Passed: ${passed}/${tests.length}`);
  console.log(`   Failed: ${failed}/${tests.length}`);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed!\n');
    process.exit(1);
  }
}

runTests();

