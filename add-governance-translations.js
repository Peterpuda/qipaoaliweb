#!/usr/bin/env node
/**
 * 添加 governance 区域的缺失翻译键
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    homepage: {
      governance: {
        badge: "文化守护运动 · 全球召集",
        connector1: "无论你是",
        connector2: "还是",
        button1: "探索匠人世界",
        button2: "成为文化守护者"
      }
    }
  },
  en: {
    homepage: {
      governance: {
        badge: "Cultural Preservation Movement · Global Call",
        connector1: "Whether you are",
        connector2: "or",
        button1: "Explore Artisan World",
        button2: "Become a Cultural Guardian"
      }
    }
  },
  ja: {
    homepage: {
      governance: {
        badge: "文化保存運動 · グローバル募集",
        connector1: "あなたが",
        connector2: "または",
        button1: "職人の世界を探索",
        button2: "文化の守護者になる"
      }
    }
  },
  fr: {
    homepage: {
      governance: {
        badge: "Mouvement de Préservation Culturelle · Appel Mondial",
        connector1: "Que vous soyez",
        connector2: "ou",
        button1: "Explorer le Monde Artisanal",
        button2: "Devenir un Gardien Culturel"
      }
    }
  },
  es: {
    homepage: {
      governance: {
        badge: "Movimiento de Preservación Cultural · Llamado Global",
        connector1: "Ya seas",
        connector2: "o",
        button1: "Explorar el Mundo Artesanal",
        button2: "Convertirse en Guardián Cultural"
      }
    }
  },
  ru: {
    homepage: {
      governance: {
        badge: "Движение за Сохранение Культуры · Глобальный Призыв",
        connector1: "Будь вы",
        connector2: "или",
        button1: "Исследовать Мир Мастеров",
        button2: "Стать Культурным Стражем"
      }
    }
  },
  ms: {
    homepage: {
      governance: {
        badge: "Gerakan Pemeliharaan Budaya · Seruan Global",
        connector1: "Sama ada anda",
        connector2: "atau",
        button1: "Terokai Dunia Tukang",
        button2: "Menjadi Penjaga Budaya"
      }
    }
  }
};

console.log('🔄 添加 governance 区域的缺失翻译键...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并 homepage.governance 翻译
  if (!data.homepage) data.homepage = {};
  if (!data.homepage.governance) data.homepage.governance = {};
  Object.assign(data.homepage.governance, translations[locale].homepage.governance);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 所有翻译键已添加！\n');
console.log('📊 添加的翻译键：');
console.log('  - homepage.governance.badge (1个)');
console.log('  - homepage.governance.connector1, connector2 (2个)');
console.log('  - homepage.governance.button1, button2 (2个)');
console.log('\n  总计: 5个键 × 7种语言 = 35条翻译\n');

process.exit(0);

