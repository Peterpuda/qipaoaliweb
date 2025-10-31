#!/usr/bin/env node
/**
 * 系统性扫描所有 HTML 和 JS 文件中的硬编码中文
 * 检测未使用 data-i18n 属性或 t() 函数的中文文本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHINESE_REGEX = /[\u4e00-\u9fa5]+/g;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

console.log('🔍 开始扫描硬编码中文...\n');

// 1. 扫描 HTML 文件中的硬编码中文
console.log('📄 扫描 HTML 文件...\n');

try {
  // 使用 grep 查找包含中文的行
  const htmlFiles = execSync(
    `find "${FRONTEND_DIR}" -name "*.html" -type f | grep -v node_modules`,
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(Boolean);

  const htmlIssues = [];

  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const matches = line.match(CHINESE_REGEX);
      if (!matches) return;
      
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      // 跳过注释
      if (trimmedLine.startsWith('<!--') || trimmedLine.startsWith('//')) {
        return;
      }
      
      // 跳过已有 data-i18n 属性的行
      if (line.includes('data-i18n')) {
        return;
      }
      
      // 跳过 script 标签中的 console.log
      if (line.includes('console.log') || line.includes('console.error')) {
        return;
      }
      
      // 跳过 URL 和路径
      if (line.includes('href=') || line.includes('src=')) {
        return;
      }
      
      // 记录问题
      htmlIssues.push({
        file: file.replace(FRONTEND_DIR + '/', ''),
        line: lineNum,
        content: trimmedLine.substring(0, 100),
        matches: matches
      });
    });
  });

  if (htmlIssues.length > 0) {
    console.log(`❌ 发现 ${htmlIssues.length} 处 HTML 硬编码中文：\n`);
    
    // 按文件分组
    const grouped = {};
    htmlIssues.forEach(issue => {
      if (!grouped[issue.file]) grouped[issue.file] = [];
      grouped[issue.file].push(issue);
    });
    
    Object.keys(grouped).sort().forEach(file => {
      console.log(`📄 ${file}:`);
      grouped[file].forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.matches.join(', ')}`);
        console.log(`   ${issue.content}`);
        console.log('');
      });
    });
  } else {
    console.log('✅ HTML 文件中没有发现硬编码中文\n');
  }

} catch (error) {
  console.error('扫描 HTML 文件时出错:', error.message);
}

// 2. 扫描 JS 文件中的硬编码中文
console.log('\n📜 扫描 JavaScript 文件...\n');

try {
  const jsFiles = execSync(
    `find "${FRONTEND_DIR}" -name "*.js" -type f | grep -v node_modules | grep -v i18n/locales`,
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(Boolean);

  const jsIssues = [];

  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const matches = line.match(CHINESE_REGEX);
      if (!matches) return;
      
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      // 跳过注释
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
        return;
      }
      
      // 跳过 console.log（通常用于调试）
      if (line.includes('console.log') || line.includes('console.error') || line.includes('console.warn')) {
        return;
      }
      
      // 跳过已使用 t() 函数的行
      if (line.includes("t('") || line.includes('t("')) {
        return;
      }
      
      // 跳过 data-i18n 相关
      if (line.includes('data-i18n')) {
        return;
      }
      
      // 记录问题
      jsIssues.push({
        file: file.replace(FRONTEND_DIR + '/', ''),
        line: lineNum,
        content: trimmedLine.substring(0, 100),
        matches: matches
      });
    });
  });

  if (jsIssues.length > 0) {
    console.log(`❌ 发现 ${jsIssues.length} 处 JavaScript 硬编码中文：\n`);
    
    // 按文件分组
    const grouped = {};
    jsIssues.forEach(issue => {
      if (!grouped[issue.file]) grouped[issue.file] = [];
      grouped[issue.file].push(issue);
    });
    
    Object.keys(grouped).sort().forEach(file => {
      console.log(`📜 ${file}:`);
      grouped[file].forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.matches.join(', ')}`);
        console.log(`   ${issue.content}`);
        console.log('');
      });
    });
  } else {
    console.log('✅ JavaScript 文件中没有发现硬编码中文\n');
  }

} catch (error) {
  console.error('扫描 JavaScript 文件时出错:', error.message);
}

// 3. 生成修复建议
console.log('\n📋 修复建议：\n');

const totalIssues = (htmlIssues?.length || 0) + (jsIssues?.length || 0);

if (totalIssues > 0) {
  console.log(`发现 ${totalIssues} 处需要修复的硬编码中文\n`);
  
  console.log('修复步骤：');
  console.log('1. 为 HTML 中的中文文本添加 data-i18n 属性');
  console.log('2. 为 JavaScript 中的中文字符串使用 t() 函数');
  console.log('3. 在所有语言包中添加对应的翻译键');
  console.log('4. 运行 node check-i18n-completeness.js 验证完整性');
  console.log('5. 部署并测试所有语言版本\n');
  
  process.exit(1);
} else {
  console.log('✅ 没有发现硬编码中文！\n');
  console.log('所有文本都已正确使用 i18n 系统！\n');
  process.exit(0);
}

