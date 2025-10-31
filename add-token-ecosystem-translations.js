#!/usr/bin/env node
/**
 * 添加Token和Ecosystem区域的缺失翻译键
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    homepage: {
      token: {
        header: "Web3 治理通证",
        claimButton: "领取通证空投",
        claimDesc: "每日签到可领取 1000 $QI"
      },
      ecosystem: {
        header: "文化守护 · 四大支柱",
        connector1: "每一个环节，都在构建",
        connector2: "从匠人的指尖，到全球的钱包 —"
      }
    }
  },
  en: {
    homepage: {
      token: {
        header: "Web3 Governance Token",
        claimButton: "Claim Token Airdrop",
        claimDesc: "Sign in daily to receive 1000 $QI"
      },
      ecosystem: {
        header: "Cultural Guardian · Four Pillars",
        connector1: "Every link is building",
        connector2: "From the artisan's fingertips to the global wallet —"
      }
    }
  },
  ja: {
    homepage: {
      token: {
        header: "Web3ガバナンストークン",
        claimButton: "トークンエアドロップを受け取る",
        claimDesc: "毎日ログインして1000 $QIを受け取る"
      },
      ecosystem: {
        header: "文化守護 · 四大支柱",
        connector1: "すべてのリンクが構築しています",
        connector2: "職人の指先からグローバルなウォレットへ —"
      }
    }
  },
  fr: {
    homepage: {
      token: {
        header: "Jeton de Gouvernance Web3",
        claimButton: "Réclamer l'Airdrop de Jetons",
        claimDesc: "Connectez-vous quotidiennement pour recevoir 1000 $QI"
      },
      ecosystem: {
        header: "Gardien Culturel · Quatre Piliers",
        connector1: "Chaque lien construit",
        connector2: "Du bout des doigts de l'artisan au portefeuille mondial —"
      }
    }
  },
  es: {
    homepage: {
      token: {
        header: "Token de Gobernanza Web3",
        claimButton: "Reclamar Airdrop de Tokens",
        claimDesc: "Inicia sesión diariamente para recibir 1000 $QI"
      },
      ecosystem: {
        header: "Guardián Cultural · Cuatro Pilares",
        connector1: "Cada enlace está construyendo",
        connector2: "De las yemas de los dedos del artesano a la billetera global —"
      }
    }
  },
  ru: {
    homepage: {
      token: {
        header: "Токен Управления Web3",
        claimButton: "Получить Эйрдроп Токенов",
        claimDesc: "Входите ежедневно, чтобы получать 1000 $QI"
      },
      ecosystem: {
        header: "Культурный Страж · Четыре Столпа",
        connector1: "Каждое звено строит",
        connector2: "От кончиков пальцев мастера до глобального кошелька —"
      }
    }
  },
  ms: {
    homepage: {
      token: {
        header: "Token Tadbir Urus Web3",
        claimButton: "Tuntut Airdrop Token",
        claimDesc: "Log masuk setiap hari untuk menerima 1000 $QI"
      },
      ecosystem: {
        header: "Penjaga Budaya · Empat Tiang",
        connector1: "Setiap pautan sedang membina",
        connector2: "Dari hujung jari tukang ke dompet global —"
      }
    }
  }
};

console.log('🔄 添加Token和Ecosystem区域的缺失翻译键...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并 homepage.token 翻译
  if (!data.homepage) data.homepage = {};
  if (!data.homepage.token) data.homepage.token = {};
  Object.assign(data.homepage.token, translations[locale].homepage.token);
  
  // 合并 homepage.ecosystem 翻译
  if (!data.homepage.ecosystem) data.homepage.ecosystem = {};
  Object.assign(data.homepage.ecosystem, translations[locale].homepage.ecosystem);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 所有翻译键已添加！\n');
console.log('📊 添加的翻译键：');
console.log('  - homepage.token.header (1个)');
console.log('  - homepage.token.claimButton (1个)');
console.log('  - homepage.token.claimDesc (1个)');
console.log('  - homepage.ecosystem.header (1个)');
console.log('  - homepage.ecosystem.connector1, connector2 (2个)');
console.log('\n  总计: 6个键 × 7种语言 = 42条翻译\n');

process.exit(0);

