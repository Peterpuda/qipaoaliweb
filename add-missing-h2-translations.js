#!/usr/bin/env node
/**
 * 添加缺失的 h2 标题翻译
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    ecosystem: {
      mainTitle: "从线下到链上，从对话到永恒"
    },
    tech: {
      mainTitle: "Web3 全栈技术方案"
    }
  },
  en: {
    ecosystem: {
      mainTitle: "From Offline to On-Chain, From Dialogue to Eternity"
    },
    tech: {
      mainTitle: "Full-Stack Web3 Technology"
    }
  },
  ja: {
    ecosystem: {
      mainTitle: "オフラインからオンチェーンへ、対話から永遠へ"
    },
    tech: {
      mainTitle: "Web3 フルスタック技術ソリューション"
    }
  },
  fr: {
    ecosystem: {
      mainTitle: "Du Hors-Ligne à la Blockchain, du Dialogue à l'Éternité"
    },
    tech: {
      mainTitle: "Solution Technologique Web3 Full-Stack"
    }
  },
  es: {
    ecosystem: {
      mainTitle: "De lo Offline a la Blockchain, del Diálogo a la Eternidad"
    },
    tech: {
      mainTitle: "Solución Tecnológica Web3 Full-Stack"
    }
  },
  ru: {
    ecosystem: {
      mainTitle: "От оффлайна к блокчейну, от диалога к вечности"
    },
    tech: {
      mainTitle: "Полнофункциональное технологическое решение Web3"
    }
  },
  ms: {
    ecosystem: {
      mainTitle: "Dari Luar Talian ke Rantaian, Dari Dialog ke Keabadian"
    },
    tech: {
      mainTitle: "Penyelesaian Teknologi Web3 Penuh"
    }
  }
};

console.log('🔄 添加缺失的 h2 标题翻译...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 添加 ecosystem.mainTitle
  if (!data.homepage.ecosystem.mainTitle) {
    data.homepage.ecosystem.mainTitle = translations[locale].ecosystem.mainTitle;
  }
  
  // 添加 tech.mainTitle
  if (!data.homepage.tech.mainTitle) {
    data.homepage.tech.mainTitle = translations[locale].tech.mainTitle;
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 完成！添加了 2 个新翻译键到所有 7 种语言\n');

