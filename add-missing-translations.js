#!/usr/bin/env node
/**
 * 添加缺失的翻译键
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    common: {
      unmute: "开启声音",
      mute: "关闭声音",
      play: "播放",
      pause: "暂停"
    },
    homepage: {
      dao: {
        keyPhrase: "参与未来传承的钥匙"
      }
    }
  },
  en: {
    common: {
      unmute: "Unmute",
      mute: "Mute",
      play: "Play",
      pause: "Pause"
    },
    homepage: {
      dao: {
        keyPhrase: "the key to participating in future heritage"
      }
    }
  },
  ja: {
    common: {
      unmute: "音量をオン",
      mute: "音量をオフ",
      play: "再生",
      pause: "一時停止"
    },
    homepage: {
      dao: {
        keyPhrase: "未来の遺産への参加の鍵"
      }
    }
  },
  fr: {
    common: {
      unmute: "Activer le son",
      mute: "Désactiver le son",
      play: "Lire",
      pause: "Pause"
    },
    homepage: {
      dao: {
        keyPhrase: "la clé pour participer au patrimoine futur"
      }
    }
  },
  es: {
    common: {
      unmute: "Activar sonido",
      mute: "Silenciar",
      play: "Reproducir",
      pause: "Pausar"
    },
    homepage: {
      dao: {
        keyPhrase: "la clave para participar en el patrimonio futuro"
      }
    }
  },
  ru: {
    common: {
      unmute: "Включить звук",
      mute: "Выключить звук",
      play: "Воспроизвести",
      pause: "Пауза"
    },
    homepage: {
      dao: {
        keyPhrase: "ключ к участию в будущем наследии"
      }
    }
  },
  ms: {
    common: {
      unmute: "Hidupkan bunyi",
      mute: "Matikan bunyi",
      play: "Main",
      pause: "Jeda"
    },
    homepage: {
      dao: {
        keyPhrase: "kunci untuk mengambil bahagian dalam warisan masa depan"
      }
    }
  }
};

console.log('🔄 添加缺失的翻译键...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并 common 翻译
  if (!data.common) data.common = {};
  Object.assign(data.common, translations[locale].common);
  
  // 合并 homepage.dao 翻译
  if (!data.homepage) data.homepage = {};
  if (!data.homepage.dao) data.homepage.dao = {};
  Object.assign(data.homepage.dao, translations[locale].homepage.dao);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 所有翻译键已添加！\n');
console.log('📊 添加的翻译键：');
console.log('  - common.unmute, common.mute, common.play, common.pause (4个)');
console.log('  - homepage.dao.keyPhrase (1个)');
console.log('\n  总计: 5个键 × 7种语言 = 35条翻译\n');

process.exit(0);
