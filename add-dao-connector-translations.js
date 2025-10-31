#!/usr/bin/env node
/**
 * 添加DAO卡片连接词的缺失翻译键
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    homepage: {
      dao: {
        connector1: "采用",
        connector2: "模式，",
        connector3: "持有",
        connector4: "就是"
      }
    }
  },
  en: {
    homepage: {
      dao: {
        connector1: "Adopting",
        connector2: "mode,",
        connector3: "holding",
        connector4: "is"
      }
    }
  },
  ja: {
    homepage: {
      dao: {
        connector1: "採用",
        connector2: "モード、",
        connector3: "保有",
        connector4: "は"
      }
    }
  },
  fr: {
    homepage: {
      dao: {
        connector1: "Adoptant",
        connector2: "mode,",
        connector3: "détenir",
        connector4: "est"
      }
    }
  },
  es: {
    homepage: {
      dao: {
        connector1: "Adoptando",
        connector2: "modo,",
        connector3: "poseer",
        connector4: "es"
      }
    }
  },
  ru: {
    homepage: {
      dao: {
        connector1: "Принимая",
        connector2: "режим,",
        connector3: "держа",
        connector4: "есть"
      }
    }
  },
  ms: {
    homepage: {
      dao: {
        connector1: "Mengguna pakai",
        connector2: "mod,",
        connector3: "memegang",
        connector4: "adalah"
      }
    }
  }
};

console.log('🔄 添加DAO卡片连接词的缺失翻译键...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并 homepage.dao 翻译
  if (!data.homepage) data.homepage = {};
  if (!data.homepage.dao) data.homepage.dao = {};
  Object.assign(data.homepage.dao, translations[locale].homepage.dao);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 所有翻译键已添加！\n');
console.log('📊 添加的翻译键：');
console.log('  - homepage.dao.connector1 (采用)');
console.log('  - homepage.dao.connector2 (模式，)');
console.log('  - homepage.dao.connector3 (持有)');
console.log('  - homepage.dao.connector4 (就是)');
console.log('\n  总计: 4个键 × 7种语言 = 28条翻译\n');

process.exit(0);

