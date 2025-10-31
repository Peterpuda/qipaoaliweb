#!/usr/bin/env node
/**
 * 为 index.html 主页添加缺失的翻译
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    common: {
      toggleSound: "开启/关闭声音",
      playPause: "播放/暂停"
    },
    homepage: {
      dao: {
        intro1: "文化保护不再是少数人的使命，而是全球社区的共识。",
        intro2: "你的每一票，都在决定哪些文化值得被永续守护"
      },
      ecosystem: {
        artisanCenter: "匠人中心",
        feature1Desc2: "从一针的走向，到千年的传承 — 比视频更细致，比博物馆更生动",
        talkToArtisan: "与匠人对话",
        authenticGallery: "链上真品馆",
        feature2Desc2: "假货不可能，价值才可信 — 你的钱包，就是你的私人博物馆",
        exploreCollection: "探索藏品",
        participationProof: "参与证明",
        inscribeParticipation: "铭刻参与",
        globalGovernance: "全球共治",
        joinDAO: "加入 DAO"
      },
      tech: {
        label: "技术栈",
        desc: "等前沿技术，打造安全可靠的文化保护平台"
      }
    }
  },
  en: {
    common: {
      toggleSound: "Toggle Sound",
      playPause: "Play/Pause"
    },
    homepage: {
      dao: {
        intro1: "Cultural preservation is no longer a mission for a few, but a consensus of the global community.",
        intro2: "Every vote you cast decides which cultures deserve to be protected forever"
      },
      ecosystem: {
        artisanCenter: "Artisan Center",
        feature1Desc2: "From the thread's path to the heritage of a millennium — more detailed than video, more vivid than museums",
        talkToArtisan: "Talk to Artisan",
        authenticGallery: "Authentic Gallery on Chain",
        feature2Desc2: "Fakes are impossible, value is trustworthy — your wallet is your private museum",
        exploreCollection: "Explore Collection",
        participationProof: "Participation Proof",
        inscribeParticipation: "Inscribe Participation",
        globalGovernance: "Global Co-Governance",
        joinDAO: "Join DAO"
      },
      tech: {
        label: "Tech Stack",
        desc: "and other cutting-edge technologies, building a secure and reliable cultural protection platform"
      }
    }
  },
  ja: {
    common: {
      toggleSound: "音量切り替え",
      playPause: "再生/一時停止"
    },
    homepage: {
      dao: {
        intro1: "文化保護はもはや少数の使命ではなく、グローバルコミュニティの合意です。",
        intro2: "あなたの投票一つ一つが、どの文化が永続的に守る価値があるかを決定します"
      },
      ecosystem: {
        artisanCenter: "職人センター",
        feature1Desc2: "一針の進路から千年の継承へ — ビデオよりも詳細、博物館よりも鮮明",
        talkToArtisan: "職人と話す",
        authenticGallery: "チェーン上の真品館",
        feature2Desc2: "偽物は不可能、価値が信頼できる — あなたのウォレットがあなたのプライベート博物館",
        exploreCollection: "コレクションを探索",
        participationProof: "参加証明",
        inscribeParticipation: "参加を刻印",
        globalGovernance: "グローバル共治",
        joinDAO: "DAOに参加"
      },
      tech: {
        label: "技術スタック",
        desc: "などの最先端技術で、安全で信頼性の高い文化保護プラットフォームを構築"
      }
    }
  },
  fr: {
    common: {
      toggleSound: "Activer/Désactiver le son",
      playPause: "Lecture/Pause"
    },
    homepage: {
      dao: {
        intro1: "La préservation culturelle n'est plus la mission de quelques-uns, mais le consensus de la communauté mondiale.",
        intro2: "Chaque vote que vous exprimez détermine quelles cultures méritent d'être protégées pour toujours"
      },
      ecosystem: {
        artisanCenter: "Centre des Artisans",
        feature1Desc2: "Du chemin du fil au patrimoine millénaire — plus détaillé que la vidéo, plus vivant que les musées",
        talkToArtisan: "Parler à l'Artisan",
        authenticGallery: "Galerie Authentique sur la Chaîne",
        feature2Desc2: "Les contrefaçons sont impossibles, la valeur est digne de confiance — votre portefeuille est votre musée privé",
        exploreCollection: "Explorer la Collection",
        participationProof: "Preuve de Participation",
        inscribeParticipation: "Graver la Participation",
        globalGovernance: "Co-Gouvernance Mondiale",
        joinDAO: "Rejoindre le DAO"
      },
      tech: {
        label: "Pile Technologique",
        desc: "et autres technologies de pointe, construisant une plateforme de protection culturelle sécurisée et fiable"
      }
    }
  },
  es: {
    common: {
      toggleSound: "Activar/Desactivar Sonido",
      playPause: "Reproducir/Pausar"
    },
    homepage: {
      dao: {
        intro1: "La preservación cultural ya no es la misión de unos pocos, sino el consenso de la comunidad global.",
        intro2: "Cada voto que emites decide qué culturas merecen ser protegidas para siempre"
      },
      ecosystem: {
        artisanCenter: "Centro de Artesanos",
        feature1Desc2: "Desde el camino del hilo hasta el patrimonio milenario — más detallado que el video, más vívido que los museos",
        talkToArtisan: "Hablar con el Artesano",
        authenticGallery: "Galería Auténtica en la Cadena",
        feature2Desc2: "Las falsificaciones son imposibles, el valor es confiable — tu billetera es tu museo privado",
        exploreCollection: "Explorar Colección",
        participationProof: "Prueba de Participación",
        inscribeParticipation: "Inscribir Participación",
        globalGovernance: "Co-Gobernanza Global",
        joinDAO: "Unirse al DAO"
      },
      tech: {
        label: "Pila Tecnológica",
        desc: "y otras tecnologías de vanguardia, construyendo una plataforma de protección cultural segura y confiable"
      }
    }
  },
  ru: {
    common: {
      toggleSound: "Переключить Звук",
      playPause: "Воспроизвести/Пауза"
    },
    homepage: {
      dao: {
        intro1: "Сохранение культуры больше не является миссией немногих, а консенсусом глобального сообщества.",
        intro2: "Каждый ваш голос решает, какие культуры заслуживают вечной защиты"
      },
      ecosystem: {
        artisanCenter: "Центр Мастеров",
        feature1Desc2: "От пути нити до наследия тысячелетия — детальнее видео, живее музеев",
        talkToArtisan: "Поговорить с Мастером",
        authenticGallery: "Галерея Подлинников в Блокчейне",
        feature2Desc2: "Подделки невозможны, ценность заслуживает доверия — ваш кошелек — ваш частный музей",
        exploreCollection: "Исследовать Коллекцию",
        participationProof: "Подтверждение Участия",
        inscribeParticipation: "Запечатлеть Участие",
        globalGovernance: "Глобальное Соуправление",
        joinDAO: "Присоединиться к DAO"
      },
      tech: {
        label: "Технологический Стек",
        desc: "и другие передовые технологии, создавая безопасную и надежную платформу защиты культуры"
      }
    }
  },
  ms: {
    common: {
      toggleSound: "Tukar Bunyi",
      playPause: "Main/Jeda"
    },
    homepage: {
      dao: {
        intro1: "Pemeliharaan budaya bukan lagi misi segelintir orang, tetapi konsensus komuniti global.",
        intro2: "Setiap undi yang anda berikan menentukan budaya mana yang layak dilindungi selamanya"
      },
      ecosystem: {
        artisanCenter: "Pusat Tukang",
        feature1Desc2: "Dari laluan benang ke warisan milenium — lebih terperinci daripada video, lebih jelas daripada muzium",
        talkToArtisan: "Bercakap dengan Tukang",
        authenticGallery: "Galeri Asli di Rantaian",
        feature2Desc2: "Palsu tidak mungkin, nilai boleh dipercayai — dompet anda adalah muzium peribadi anda",
        exploreCollection: "Terokai Koleksi",
        participationProof: "Bukti Penyertaan",
        inscribeParticipation: "Tulis Penyertaan",
        globalGovernance: "Tadbir Urus Bersama Global",
        joinDAO: "Sertai DAO"
      },
      tech: {
        label: "Timbunan Teknologi",
        desc: "dan teknologi canggih lain, membina platform perlindungan budaya yang selamat dan boleh dipercayai"
      }
    }
  }
};

console.log('🔄 为 index.html 主页添加缺失的翻译...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并 common 翻译
  if (!data.common) data.common = {};
  Object.assign(data.common, translations[locale].common);
  
  // 合并 homepage.dao 翻译
  if (!data.homepage.dao) data.homepage.dao = {};
  Object.assign(data.homepage.dao, translations[locale].homepage.dao);
  
  // 合并 homepage.ecosystem 翻译
  if (!data.homepage.ecosystem) data.homepage.ecosystem = {};
  Object.assign(data.homepage.ecosystem, translations[locale].homepage.ecosystem);
  
  // 合并 homepage.tech 翻译
  if (!data.homepage.tech) data.homepage.tech = {};
  Object.assign(data.homepage.tech, translations[locale].homepage.tech);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ index.html 主页翻译已添加！\n');
console.log('📊 添加的翻译键：');
console.log('  - common.toggleSound, common.playPause (2个)');
console.log('  - homepage.dao.intro1, homepage.dao.intro2 (2个)');
console.log('  - homepage.ecosystem.* (9个)');
console.log('  - homepage.tech.label, homepage.tech.desc (2个)');
console.log('\n  总计: 15个键 × 7种语言 = 105条翻译\n');

process.exit(0);

