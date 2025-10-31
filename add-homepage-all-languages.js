#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌐 为所有语言添加主页翻译...\n');

const translations = {
  ja: {
    "homepage": {
      "title": "AI駆動の文化グローバル化プラットフォーム",
      "description": "AIとWeb3技術を融合し、世界の無形文化遺産を保護",
      "hero": {
        "title": "文化のグローバル化",
        "subtitle": "中国の無形文化遺産が世界の文化と新たに出会う時",
        "videoLoading": "動画を読み込み中..."
      },
      "platform": {
        "title": "ブロックチェーンとAIによる文化革新",
        "subtitle": "遺産は過去だけでなく、未来の守護者",
        "ai": {
          "title": "AI職人アバター",
          "desc1": "AI職人と対話し、一針一針の物語を学ぶ。",
          "desc2": "遺産はもはやアーカイブではなく、温かい対話",
          "cta": "職人と話す"
        },
        "blockchain": {
          "title": "永久的なオンチェーンストレージ",
          "desc1": "工芸パターン、職人アーカイブ、傑作をブロックチェーンに。",
          "desc2": "チェーンが存在する限り、価値は持続する",
          "cta": "技術を学ぶ"
        },
        "nft": {
          "title": "NFT真正性証明書",
          "desc1": "すべての作品には固有のオンチェーン証明書があります。",
          "desc2": "偽造不可能、価値は信頼できる",
          "cta": "証明書を見る"
        }
      }
    }
  },
  fr: {
    "homepage": {
      "title": "Plateforme de Mondialisation Culturelle Alimentée par l'IA",
      "description": "Intégrer l'Intelligence Artificielle et la Technologie Web3 pour Préserver le Patrimoine Culturel Immatériel Mondial",
      "hero": {
        "title": "Mondialisation Culturelle",
        "subtitle": "Quand le Patrimoine Immatériel Chinois Rencontre à Nouveau les Cultures du Monde",
        "videoLoading": "Chargement de la vidéo..."
      },
      "platform": {
        "title": "Innovation Culturelle par la Blockchain et l'IA",
        "subtitle": "Le patrimoine n'est pas seulement le passé — c'est le gardien de notre avenir",
        "ai": {
          "title": "Avatar d'Artisan IA",
          "desc1": "Conversez avec des artisans IA, apprenez l'histoire derrière chaque point.",
          "desc2": "Le patrimoine n'est plus archivé, mais une conversation chaleureuse",
          "cta": "Parler aux Artisans"
        },
        "blockchain": {
          "title": "Stockage Permanent sur la Blockchain",
          "desc1": "Motifs artisanaux, archives d'artisans, chefs-d'œuvre sur la blockchain.",
          "desc2": "Tant que la chaîne existe, la valeur persiste",
          "cta": "Découvrir la Technologie"
        },
        "nft": {
          "title": "Certificat d'Authenticité NFT",
          "desc1": "Chaque pièce possède un certificat unique sur la chaîne.",
          "desc2": "Contrefaçon impossible, valeur digne de confiance",
          "cta": "Voir les Certificats"
        }
      }
    }
  },
  es: {
    "homepage": {
      "title": "Plataforma de Globalización Cultural Impulsada por IA",
      "description": "Integrando Inteligencia Artificial y Tecnología Web3 para Preservar el Patrimonio Cultural Inmaterial Global",
      "hero": {
        "title": "Globalización Cultural",
        "subtitle": "Cuando el Patrimonio Inmaterial Chino se Encuentra de Nuevo con las Culturas del Mundo",
        "videoLoading": "Cargando video..."
      },
      "platform": {
        "title": "Innovación Cultural a través de Blockchain e IA",
        "subtitle": "El patrimonio no es solo el pasado — es el guardián de nuestro futuro",
        "ai": {
          "title": "Avatar de Artesano IA",
          "desc1": "Conversa con artesanos IA, aprende la historia detrás de cada puntada.",
          "desc2": "El patrimonio ya no está archivado, sino que es una conversación cálida",
          "cta": "Hablar con Artesanos"
        },
        "blockchain": {
          "title": "Almacenamiento Permanente en Blockchain",
          "desc1": "Patrones artesanales, archivos de artesanos, obras maestras en blockchain.",
          "desc2": "Mientras exista la cadena, el valor persiste",
          "cta": "Conocer la Tecnología"
        },
        "nft": {
          "title": "Certificado de Autenticidad NFT",
          "desc1": "Cada pieza tiene un certificado único en la cadena.",
          "desc2": "Falsificación imposible, valor confiable",
          "cta": "Ver Certificados"
        }
      }
    }
  },
  ru: {
    "homepage": {
      "title": "Платформа Культурной Глобализации на Основе ИИ",
      "description": "Интеграция Искусственного Интеллекта и Технологии Web3 для Сохранения Глобального Нематериального Культурного Наследия",
      "hero": {
        "title": "Культурная Глобализация",
        "subtitle": "Когда Китайское Нематериальное Наследие Вновь Встречается с Мировыми Культурами",
        "videoLoading": "Загрузка видео..."
      },
      "platform": {
        "title": "Культурные Инновации через Блокчейн и ИИ",
        "subtitle": "Наследие — это не только прошлое, это страж нашего будущего",
        "ai": {
          "title": "ИИ Аватар Мастера",
          "desc1": "Общайтесь с ИИ мастерами, узнайте историю каждого стежка.",
          "desc2": "Наследие больше не архивируется, а представляет собой теплую беседу",
          "cta": "Поговорить с Мастерами"
        },
        "blockchain": {
          "title": "Постоянное Хранение в Блокчейне",
          "desc1": "Ремесленные узоры, архивы мастеров, шедевры в блокчейне.",
          "desc2": "Пока существует цепь, ценность сохраняется",
          "cta": "Узнать о Технологии"
        },
        "nft": {
          "title": "NFT Сертификат Подлинности",
          "desc1": "Каждое произведение имеет уникальный сертификат в цепи.",
          "desc2": "Подделка невозможна, ценность надежна",
          "cta": "Посмотреть Сертификаты"
        }
      }
    }
  },
  ms: {
    "homepage": {
      "title": "Platform Globalisasi Budaya Dikuasakan AI",
      "description": "Mengintegrasikan Kecerdasan Buatan dan Teknologi Web3 untuk Memelihara Warisan Budaya Tak Berwujud Global",
      "hero": {
        "title": "Globalisasi Budaya",
        "subtitle": "Apabila Warisan Tak Berwujud China Bertemu Semula dengan Budaya Dunia",
        "videoLoading": "Memuatkan video..."
      },
      "platform": {
        "title": "Inovasi Budaya Melalui Blockchain dan AI",
        "subtitle": "Warisan bukan hanya masa lalu — ia adalah penjaga masa depan kita",
        "ai": {
          "title": "Avatar Tukang AI",
          "desc1": "Berbual dengan tukang AI, pelajari cerita di sebalik setiap jahitan.",
          "desc2": "Warisan tidak lagi diarkibkan, tetapi perbualan yang hangat",
          "cta": "Bercakap dengan Tukang"
        },
        "blockchain": {
          "title": "Penyimpanan Kekal di Blockchain",
          "desc1": "Corak kraf, arkib tukang, karya agung di blockchain.",
          "desc2": "Selagi rantai wujud, nilai berterusan",
          "cta": "Ketahui Teknologi"
        },
        "nft": {
          "title": "Sijil Ketulenan NFT",
          "desc1": "Setiap karya mempunyai sijil unik di rantai.",
          "desc2": "Pemalsuan mustahil, nilai boleh dipercayai",
          "cta": "Lihat Sijil"
        }
      }
    }
  }
};

Object.keys(translations).forEach(lang => {
  const filePath = path.join(__dirname, `frontend/i18n/locales/${lang}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // 合并新的翻译
  content.homepage = { ...content.homepage, ...translations[lang].homepage };
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
  console.log(`✅ ${lang}.json 已更新`);
});

console.log('\n🎉 所有语言包更新完成！');
console.log('\n📊 支持的语言：');
console.log('  - 🇨🇳 中文 (Chinese)');
console.log('  - 🇺🇸 英文 (English)');
console.log('  - 🇯🇵 日文 (Japanese)');
console.log('  - 🇫🇷 法文 (French)');
console.log('  - 🇪🇸 西班牙语 (Spanish)');
console.log('  - 🇷🇺 俄语 (Russian)');
console.log('  - 🇲🇾 马来语 (Malay)');

