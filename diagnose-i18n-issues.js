#!/usr/bin/env node
/**
 * 诊断主页 i18n 问题
 * 找出所有包含中文但没有 data-i18n 属性的元素
 */

const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'frontend/index.html');
const htmlContent = fs.readFileSync(htmlFile, 'utf-8');

console.log('🔍 诊断主页 i18n 问题...\n');

// 正则表达式：匹配包含中文的 HTML 标签内容
const chineseRegex = />([^<]*[\u4e00-\u9fa5]+[^<]*)</g;
const dataI18nRegex = /data-i18n="[^"]+"/g;

let match;
let issues = [];
let lineNumber = 1;
let lines = htmlContent.split('\n');

lines.forEach((line, index) => {
  lineNumber = index + 1;
  
  // 跳过注释、script、style 标签
  if (line.includes('<!--') || 
      line.includes('console.log') || 
      line.includes('<script') ||
      line.includes('<style') ||
      line.includes('// ') ||
      line.includes('* ')) {
    return;
  }
  
  // 检查是否包含中文
  const hasChinese = /[\u4e00-\u9fa5]/.test(line);
  if (!hasChinese) return;
  
  // 检查是否在 HTML 标签内容中（不是属性值）
  const contentMatch = line.match(/>([^<]*[\u4e00-\u9fa5]+[^<]*)</);
  if (!contentMatch) return;
  
  const chineseContent = contentMatch[1].trim();
  if (!chineseContent) return;
  
  // 检查是否有 data-i18n 属性
  const hasDataI18n = /data-i18n="[^"]+"/.test(line);
  
  if (!hasDataI18n) {
    issues.push({
      line: lineNumber,
      content: chineseContent,
      fullLine: line.trim()
    });
  }
});

console.log(`❌ 发现 ${issues.length} 处未翻译的中文内容：\n`);

// 按区域分类
const sections = {
  token: [],
  ecosystem: [],
  tech: [],
  governance: [],
  footer: [],
  other: []
};

issues.forEach(issue => {
  const line = issue.line;
  if (line >= 500 && line <= 650) {
    sections.token.push(issue);
  } else if (line >= 650 && line <= 750) {
    sections.ecosystem.push(issue);
  } else if (line >= 750 && line <= 850) {
    sections.tech.push(issue);
  } else if (line >= 850 && line <= 950) {
    sections.governance.push(issue);
  } else if (line >= 950) {
    sections.footer.push(issue);
  } else {
    sections.other.push(issue);
  }
});

Object.keys(sections).forEach(section => {
  if (sections[section].length > 0) {
    console.log(`\n📍 ${section.toUpperCase()} 区域 (${sections[section].length} 处):`);
    sections[section].forEach(issue => {
      console.log(`  Line ${issue.line}: "${issue.content}"`);
    });
  }
});

console.log('\n\n✅ 诊断完成！');
console.log('\n💡 解决方案：');
console.log('1. 为每个元素添加 data-i18n 属性');
console.log('2. 在语言包中添加对应的翻译键');
console.log('3. 重新加载页面测试\n');

// 生成建议的翻译键
console.log('\n📝 建议的翻译键结构：\n');
Object.keys(sections).forEach(section => {
  if (sections[section].length > 0 && section !== 'other') {
    console.log(`homepage.${section}:`);
    sections[section].slice(0, 3).forEach((issue, i) => {
      const key = issue.content
        .replace(/[\s\n]+/g, '_')
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9_]/g, '')
        .substring(0, 30);
      console.log(`  ${key}: "${issue.content}"`);
    });
    if (sections[section].length > 3) {
      console.log(`  ... 还有 ${sections[section].length - 3} 个`);
    }
    console.log('');
  }
});

process.exit(0);

