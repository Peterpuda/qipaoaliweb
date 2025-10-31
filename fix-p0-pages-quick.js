#!/usr/bin/env node
/**
 * 快速修复 P0 页面的购物车和个人中心
 * 批量添加 data-i18n 属性和翻译键
 */

const fs = require('fs');
const path = require('path');

// 购物车页面的修复
const cartFixes = [
  {
    file: 'frontend/mall/cart.html',
    fixes: [
      {
        old: /购物车 \(<span id="cartCount">0<\/span>\)/,
        new: (match) => match.replace('购物车', `<span data-i18n="cart.title">购物车</span>`)
      },
      {
        old: /优惠券/,
        new: (match, line) => {
          if (line.includes('class="coupon-value"')) {
            return match.replace('选择优惠券', `<span data-i18n="cart.selectCoupon">选择优惠券</span>`);
          }
          return match.replace('优惠券', `<span data-i18n="cart.coupon">优惠券</span>`);
        }
      },
      {
        old: /为你推荐/,
        new: (match) => match.replace('为你推荐', `<span data-i18n="cart.recommended">为你推荐</span>`)
      },
      {
        old: /已选 <span id="selectedCount">0<\/span> 件/,
        new: (match) => match.replace('已选', `<span data-i18n="cart.selected">已选</span>`).replace('件', `<span data-i18n="cart.items">件</span>`)
      },
      {
        old: /购物车空空如也/,
        new: (match) => match.replace('购物车空空如也', `<span data-i18n="cart.empty">购物车空空如也</span>`)
      },
      {
        old: /去逛逛/,
        new: (match) => match.replace('去逛逛', `<span data-i18n="cart.goShopping">去逛逛</span>`)
      },
      {
        old: /默认规格/,
        new: (match) => match.replace('默认规格', `\${tSafe('cart.defaultSpec') || '默认规格'}`)
      },
      {
        old: /确定要清空购物车吗\？/,
        new: (match) => match.replace('确定要清空购物车吗？', `tSafe('cart.confirmClear')`)
      },
      {
        old: /优惠券功能开发中/,
        new: (match) => match.replace('优惠券功能开发中...', `tSafe('cart.couponInDevelopment')`)
      }
    ]
  },
  
  // 个人中心页面的修复
  {
    file: 'frontend/mall/profile.html',
    fixes: [
      {
        old: /未连接钱包/,
        new: (match) => match.replace('未连接钱包', `<span data-i18n="wallet.notConnected">未连接钱包</span>`)
      },
      {
        old: /点击右侧按钮连接钱包/,
        new: (match) => match.replace('点击右侧按钮连接钱包', `<span data-i18n="wallet.clickToConnect">点击右侧按钮连接钱包</span>`)
      },
      {
        old: /连接<\/i>/,
        new: (match) => match.replace('连接', `<span data-i18n="wallet.connect">连接</span>`)
      }
    ]
  }
];

console.log('🔧 快速修复 P0 页面...\n');

cartFixes.forEach(({ file, fixes }) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let modified = false;
  
  lines.forEach((line, index) => {
    fixes.forEach(({ old, new: replaceFn }) => {
      if (old.test(line)) {
        const newLine = typeof replaceFn === 'function' ? replaceFn(line.match(old)[0], line) : replaceFn;
        lines[index] = newLine;
        modified = true;
      }
    });
  });
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`✅ ${file} 已修复`);
  } else {
    console.log(`ℹ️  ${file} 无需修复或修复模式不匹配`);
  }
});

console.log('\n✅ P0 页面快速修复完成！\n');
console.log('⚠️  注意：此脚本只处理了简单的文本替换。');
console.log('复杂的情况需要手动检查。\n');

process.exit(0);

