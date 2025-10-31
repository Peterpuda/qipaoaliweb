#!/usr/bin/env node
/**
 * 深度检查 index.html 页面中的所有中文文本
 * 包括HTML静态内容和JavaScript动态内容
 */

const fs = require('fs');
const path = require('path');

const CHINESE_REGEX = /[\u4e00-\u9fa5]+/g;

console.log('🔍 深度检查 index.html 页面中的所有中文文本...\n');

const indexPath = path.join(__dirname, 'frontend/index.html');
const content = fs.readFileSync(indexPath, 'utf-8');
const lines = content.split('\n');

const issues = [];
const allChineseTexts = new Set();

lines.forEach((line, index) => {
  const lineNum = index + 1;
  
  // 跳过注释
  if (line.trim().startsWith('<!--') || 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*')) {
    return;
  }
  
  // 跳过CSS中的字体名称
  if (line.includes('font-family') && line.includes('Noto Serif SC')) {
    return;
  }
  
  // 跳过URL和路径
  if (line.includes('href=') || line.includes('src=') || line.includes('url(')) {
    return;
  }
  
  // 查找中文字符
  const matches = line.match(CHINESE_REGEX);
  if (!matches) return;
  
  // 检查是否已有 data-i18n 相关属性
  const hasI18n = line.includes('data-i18n') || 
                   line.includes('data-i18n-html') || 
                   line.includes('data-i18n-placeholder') ||
                   line.includes('data-i18n-title') ||
                   line.includes('data-i18n-content');
  
  // 如果已有 data-i18n 属性，检查翻译键是否存在
  if (hasI18n) {
    // 提取翻译键
    const keyMatch = line.match(/data-i18n(?:-title|-content|-placeholder|-html)?=["']([^"']+)["']/);
    if (keyMatch) {
      const key = keyMatch[1];
      
      // 检查翻译键是否在所有语言包中存在
      const localesDir = path.join(__dirname, 'frontend/i18n/locales');
      const locales = ['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'];
      const missingLocales = [];
      
      locales.forEach(locale => {
        const filePath = path.join(localesDir, `${locale}.json`);
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const keys = key.split('.');
          let value = data;
          
          for (const k of keys) {
            if (value && typeof value === 'object') {
              value = value[k];
            } else {
              value = undefined;
              break;
            }
          }
          
          if (value === undefined || value === null || value === '') {
            missingLocales.push(locale);
          }
        }
      });
      
      if (missingLocales.length > 0) {
        issues.push({
          line: lineNum,
          type: 'missing_translation',
          key: key,
          missingLocales: missingLocales,
          content: line.trim().substring(0, 120),
          chineseText: matches.join(', ')
        });
      }
    }
    return; // 有data-i18n属性，跳过
  }
  
  // 查找实际显示的中文文本（在标签之间或作为属性值）
  
  // 1. 标签之间的文本
  const textMatch = line.match(/>([^<]*[\u4e00-\u9fa5][^<]*)</);
  if (textMatch) {
    const chineseText = textMatch[1].trim();
    if (chineseText.length > 0 && !chineseText.startsWith('<!--')) {
      issues.push({
        line: lineNum,
        type: 'hardcoded_text',
        content: line.trim().substring(0, 120),
        chineseText: chineseText,
        matches: matches
      });
      matches.forEach(m => allChineseTexts.add(m));
      return;
    }
  }
  
  // 2. title 属性中的中文
  const titleMatch = line.match(/title=["']([^"']*[\u4e00-\u9fa5][^"']*)["']/);
  if (titleMatch && !hasI18n) {
    issues.push({
      line: lineNum,
      type: 'title_attribute',
      content: line.trim().substring(0, 120),
      chineseText: titleMatch[1],
      matches: matches
    });
    matches.forEach(m => allChineseTexts.add(m));
    return;
  }
  
  // 3. placeholder 属性中的中文
  const placeholderMatch = line.match(/placeholder=["']([^"']*[\u4e00-\u9fa5][^"']*)["']/);
  if (placeholderMatch && !hasI18n) {
    issues.push({
      line: lineNum,
      type: 'placeholder_attribute',
      content: line.trim().substring(0, 120),
      chineseText: placeholderMatch[1],
      matches: matches
    });
    matches.forEach(m => allChineseTexts.add(m));
    return;
  }
  
  // 4. JavaScript 字符串中的中文
  if (line.includes('textContent') || 
      line.includes('innerHTML') || 
      line.includes('innerText') ||
      line.match(/["'].*[\u4e00-\u9fa5].*["']/)) {
    const jsStringMatch = line.match(/(["'])([^"']*[\u4e00-\u9fa5][^"']*)\1/);
    if (jsStringMatch && !hasI18n) {
      // 跳过 console.log
      if (line.includes('console.log') || line.includes('console.error')) {
        return;
      }
      
      issues.push({
        line: lineNum,
        type: 'javascript_string',
        content: line.trim().substring(0, 120),
        chineseText: jsStringMatch[2],
        matches: matches
      });
      matches.forEach(m => allChineseTexts.add(m));
      return;
    }
  }
  
  // 5. 模板字符串中的中文
  const templateMatch = line.match(/`([^`]*[\u4e00-\u9fa5][^`]*)`/);
  if (templateMatch && !hasI18n) {
    // 跳过注释和 console.log
    if (line.includes('console.log') || line.includes('console.error')) {
      return;
    }
    
    issues.push({
      line: lineNum,
      type: 'template_string',
      content: line.trim().substring(0, 120),
      chineseText: templateMatch[1],
      matches: matches
    });
    matches.forEach(m => allChineseTexts.add(m));
  }
});

// 输出报告
console.log(`📊 检查结果：\n`);

if (issues.length === 0) {
  console.log('✅ 没有发现未翻译的中文文本！\n');
  console.log('所有中文文本都有 data-i18n 属性或位于注释中。\n');
  process.exit(0);
}

console.log(`❌ 发现 ${issues.length} 处问题：\n`);

// 按类型分组
const grouped = {};
issues.forEach(issue => {
  if (!grouped[issue.type]) grouped[issue.type] = [];
  grouped[issue.type].push(issue);
});

// 输出详细信息
Object.keys(grouped).sort().forEach(type => {
  const typeNames = {
    'hardcoded_text': '硬编码文本',
    'title_attribute': 'Title 属性',
    'placeholder_attribute': 'Placeholder 属性',
    'javascript_string': 'JavaScript 字符串',
    'template_string': '模板字符串',
    'missing_translation': '翻译键缺失'
  };
  
  console.log(`\n📋 ${typeNames[type] || type} (${grouped[type].length} 处)：`);
  console.log('─'.repeat(60));
  
  grouped[type].forEach((issue, index) => {
    console.log(`\n${index + 1}. Line ${issue.line}:`);
    console.log(`   中文文本: "${issue.chineseText || issue.matches.join(', ')}"`);
    if (issue.key) {
      console.log(`   翻译键: ${issue.key}`);
      console.log(`   缺失语言: ${issue.missingLocales.join(', ')}`);
    }
    console.log(`   完整行: ${issue.content}${issue.content.length >= 120 ? '...' : ''}`);
  });
});

console.log(`\n\n📊 统计：`);
console.log(`   总问题数: ${issues.length}`);
console.log(`   硬编码文本: ${grouped.hardcoded_text?.length || 0}`);
console.log(`   Title 属性: ${grouped.title_attribute?.length || 0}`);
console.log(`   Placeholder: ${grouped.placeholder_attribute?.length || 0}`);
console.log(`   JavaScript 字符串: ${grouped.javascript_string?.length || 0}`);
console.log(`   模板字符串: ${grouped.template_string?.length || 0}`);
console.log(`   翻译键缺失: ${grouped.missing_translation?.length || 0}`);
console.log(`\n   唯一中文文本: ${allChineseTexts.size} 个\n`);

console.log('💡 修复建议：');
console.log('   1. 为所有硬编码文本添加 data-i18n 属性');
console.log('   2. 为 Title/Placeholder 属性添加 data-i18n-title/data-i18n-placeholder');
console.log('   3. 将 JavaScript 中的中文字符串改为使用 t() 函数');
console.log('   4. 为缺失的翻译键添加到所有语言包\n');

process.exit(1);

