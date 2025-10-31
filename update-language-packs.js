#!/usr/bin/env node

/**
 * 批量更新所有语言包
 * 添加缺失的翻译键
 */

const fs = require('fs');
const path = require('path');

// 需要添加的新键
const updates = {
  ja: {
    'common.customerService': 'カスタマーサービス',
    'product.title': '商品詳細 - 伝統文化チェーン',
    'product.buyNow': '今すぐ購入'
  },
  fr: {
    'common.customerService': 'Service Client',
    'product.title': 'Détails du Produit - Patrimoine sur Chaîne',
    'product.buyNow': 'Acheter Maintenant'
  },
  es: {
    'common.customerService': 'Servicio al Cliente',
    'product.title': 'Detalles del Producto - Patrimonio en Cadena',
    'product.buyNow': 'Comprar Ahora'
  },
  ru: {
    'common.customerService': 'Служба Поддержки',
    'product.title': 'Детали Продукта - Наследие в Цепи',
    'product.buyNow': 'Купить Сейчас'
  },
  ms: {
    'common.customerService': 'Perkhidmatan Pelanggan',
    'product.title': 'Butiran Produk - Warisan di Rantai',
    'product.buyNow': 'Beli Sekarang'
  }
};

console.log('🔄 批量更新语言包...\n');

Object.keys(updates).forEach(lang => {
  const filePath = path.join(__dirname, `frontend/i18n/locales/${lang}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${lang}.json 不存在，跳过`);
    return;
  }
  
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updated = false;
    
    Object.keys(updates[lang]).forEach(key => {
      const [section, subkey] = key.split('.');
      
      if (!content[section]) {
        content[section] = {};
      }
      
      if (!content[section][subkey]) {
        content[section][subkey] = updates[lang][key];
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
      console.log(`✅ ${lang}.json 已更新`);
    } else {
      console.log(`⏭️  ${lang}.json 无需更新`);
    }
  } catch (error) {
    console.error(`❌ 更新 ${lang}.json 失败:`, error.message);
  }
});

console.log('\n🎉 语言包更新完成！');

