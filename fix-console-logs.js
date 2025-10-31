#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修复控制台日志语言...\n');

const indexPath = path.join(__dirname, 'frontend/index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const replacements = [
  { old: "console.log('视频可以播放');", new: "console.log('Video can play');" },
  { old: "console.log('视频自动播放成功');", new: "console.log('Video autoplay succeeded');" },
  { old: "console.log('视频自动播放失败，可能需要用户交互:', error);", new: "console.log('Video autoplay failed, user interaction may be required:', error);" },
  { old: "console.log(`尝试重新加载视频 (${retryCount}/${maxRetries})...`);", new: "console.log(`Retrying video load (${retryCount}/${maxRetries})...`);" },
  { old: "console.error('视频加载失败:', e);", new: "console.error('Video load failed:', e);" },
  { old: "console.error('视频加载失败，已达到最大重试次数');", new: "console.error('Video load failed, max retries reached');" },
  { old: "console.warn('视频加载停滞，可能是网络问题');", new: "console.warn('Video loading stalled, possible network issue');" },
  { old: "console.log('视频缓冲中...');", new: "console.log('Video buffering...');" },
  { old: "video.play().catch(e => console.log('恢复播放失败:', e));", new: "video.play().catch(e => console.log('Resume playback failed:', e));" },
  { old: "console.log('视频背景控制初始化完成');", new: "console.log('Video background controls initialized');" },
  { old: "console.log('主页多语言初始化完成，默认语言：英文');", new: "console.log('Homepage i18n initialized, default language: English');" }
];

let updated = 0;
replacements.forEach(({ old, new: newStr }) => {
  if (content.includes(old)) {
    content = content.replace(old, newStr);
    updated++;
  }
});

fs.writeFileSync(indexPath, content);

console.log(`✅ 已修复 ${updated} 个控制台日志`);
console.log('\n🎉 完成！所有控制台日志已统一为英文');

