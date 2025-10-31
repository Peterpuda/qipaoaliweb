#!/usr/bin/env node
/**
 * 添加Hero按钮的翻译键
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    homepage: {
      hero: {
        ctaButton: "立即加入"
      }
    }
  },
  en: {
    homepage: {
      hero: {
        ctaButton: "Explore the Flow"
      }
    }
  },
  ja: {
    homepage: {
      hero: {
        ctaButton: "今すぐ参加"
      }
    }
  },
  fr: {
    homepage: {
      hero: {
        ctaButton: "Rejoindre Maintenant"
      }
    }
  },
  es: {
    homepage: {
      hero: {
        ctaButton: "Explorar el Flujo"
      }
    }
  },
  ru: {
    homepage: {
      hero: {
        ctaButton: "Исследовать Поток"
      }
    }
  },
  ms: {
    homepage: {
      hero: {
        ctaButton: "Terokai Aliran"
      }
    }
  }
};

console.log('🔄 添加Hero按钮的翻译键...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并 homepage.hero 翻译
  if (!data.homepage) data.homepage = {};
  if (!data.homepage.hero) data.homepage.hero = {};
  Object.assign(data.homepage.hero, translations[locale].homepage.hero);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 所有翻译键已添加！\n');
console.log('📊 添加的翻译键：');
console.log('  - homepage.hero.ctaButton (1个)');
console.log('\n  总计: 1个键 × 7种语言 = 7条翻译\n');

process.exit(0);

