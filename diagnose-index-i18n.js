#!/usr/bin/env node
/**
 * 诊断 index.html 页面中未翻译的中文文本
 * 找出所有没有 data-i18n 属性的中文文本
 */

const fs = require('fs');
const path = require('path');

const CHINESE_REGEX = /[\u4e00-\u9fa5]+/g;

console.log('🔍 诊断 index.html 页面中的未翻译中文...\n');

const indexPath = path.join(__dirname, 'frontend/index.html');
const content = fs.readFileSync(indexPath, 'utf-8');
const lines = content.split('\n');

const issues = [];

lines.forEach((line, index) => {
  const lineNum = index + 1;
  
  // 跳过注释
  if (line.trim().startsWith('<!--') || line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
    return;
  }
  
  // 跳过CSS中的字体名称等
  if (line.includes('font-family') || line.includes('Noto Serif SC')) {
    return;
  }
  
  // 查找中文字符
  const matches = line.match(CHINESE_REGEX);
  if (!matches) return;
  
  // 检查是否已有 data-i18n 属性
  const hasDataI18n = line.includes('data-i18n') || 
                       line.includes('data-i18n-html') || 
                       line.includes('data-i18n-placeholder') ||
                       line.includes('data-i18n-title') ||
                       line.includes('data-i18n-content');
  
  // 如果已有 data-i18n 属性，跳过
  if (hasDataI18n) {
    return;
  }
  
  // 跳过 meta description 的 content 属性（因为使用了 data-i18n-content）
  if (line.includes('data-i18n-content')) {
    return;
  }
  
  // 检查是否是纯标签、属性名等
  if (line.match(/^\s*<\/?[a-z]/i) && !line.match(/>[\u4e00-\u9fa5]/)) {
    // 可能是属性值或标签名，继续检查
  }
  
  // 查找实际显示的中文文本（在标签之间）
  const textMatch = line.match(/>([^<]*[\u4e00-\u9fa5][^<]*)</);
  if (textMatch) {
    const chineseText = textMatch[1].trim();
    if (chineseText.length > 0) {
      issues.push({
        line: lineNum,
        content: line.trim(),
        text: chineseText,
        matches: matches
      });
    }
  }
  
  // 查找 title 属性中的中文
  const titleMatch = line.match(/title=["']([^"']*[\u4e00-\u9fa5][^"']*)["']/);
  if (titleMatch && !hasDataI18n) {
    issues.push({
      line: lineNum,
      content: line.trim(),
      text: titleMatch[1],
      matches: matches,
      type: 'title attribute'
    });
  }
  
  // 查找按钮或链接中的硬编码文本
  if (line.includes('<button') || line.includes('<a ') || line.includes('<span')) {
    const buttonText = line.match(/>([^<]*[\u4e00-\u9fa5][^<]*)</);
    if (buttonText && !hasDataI18n) {
      const text = buttonText[1].trim();
      if (text.length > 0 && !text.startsWith('<!--')) {
        issues.push({
          line: lineNum,
          content: line.trim(),
          text: text,
          matches: matches,
          type: 'button/link text'
        });
      }
    }
  }
});

// 输出报告
if (issues.length > 0) {
  console.log(`❌ 发现 ${issues.length} 处未翻译的中文文本：\n`);
  
  // 按行号排序
  issues.sort((a, b) => a.line - b.line);
  
  // 按类型分组
  const grouped = {};
  issues.forEach(issue => {
    const category = issue.type || 'content';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(issue);
  });
  
  // 显示所有问题
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. Line ${issue.line}:`);
    console.log(`   文本: "${issue.text}"`);
    console.log(`   匹配的中文: ${issue.matches.join(', ')}`);
    if (issue.type) {
      console.log(`   类型: ${issue.type}`);
    }
    console.log(`   完整行: ${issue.content.substring(0, 100)}${issue.content.length > 100 ? '...' : ''}`);
    console.log('');
  });
  
  console.log('\n📊 统计：');
  console.log(`   总计: ${issues.length} 处`);
  console.log(`   内容文本: ${issues.filter(i => !i.type).length} 处`);
  console.log(`   Title 属性: ${issues.filter(i => i.type === 'title attribute').length} 处`);
  console.log(`   按钮/链接: ${issues.filter(i => i.type === 'button/link text').length} 处`);
  console.log('');
  
  console.log('💡 修复建议：');
  console.log('   1. 为所有中文文本添加 data-i18n 属性');
  console.log('   2. 为 title 属性添加 data-i18n-title 属性');
  console.log('   3. 在所有语言包中添加对应的翻译键');
  console.log('   4. 确保 JavaScript 动态生成的内容也使用翻译函数\n');
  
  process.exit(1);
} else {
  console.log('✅ 没有发现未翻译的中文文本！\n');
  console.log('所有中文文本都有 data-i18n 属性或位于注释中。\n');
  process.exit(0);
}

