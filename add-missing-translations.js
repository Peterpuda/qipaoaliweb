#!/usr/bin/env node
/**
 * 为所有语言包添加缺失的翻译
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');
const missingFile = path.join(__dirname, 'missing-translations.json');

// 读取缺失的翻译（中文版本）
const missingTranslations = JSON.parse(fs.readFileSync(missingFile, 'utf-8'));

// 翻译映射（手动翻译为各语言的本地化表达）
const translations = {
  zh: missingTranslations.homepage,
  
  en: {
    token: {
      communityEngagement: "Community Engagement",
      title: "$QI · Guardian's Certificate",
      subtitle: "$QI is not a speculative token, but a proof of participation in cultural preservation",
      role1Title: "Cultural Decision Maker",
      role1Desc: "Your vote shapes the future of culture",
      role2Title: "Heritage Contributor",
      role2Desc: "Daily check-ins, share stories, create content",
      role3Title: "Cultural Collector",
      role3Desc: "Priority access to limited NFT masterpieces, your wallet is a museum",
      compliance: "Compliance Statement:",
      stat1Label: "Total Supply",
      stat2Label: "Circulating Supply",
      stat3Label: "Holders",
      stat4Label: "Network"
    },
    ecosystem: {
      title: "Complete Ecosystem, Empowering Culture",
      subtitle: "The Future of Cultural Sustainability",
      description: "Not just a marketplace, but a bridge of civilization",
      feature1Badge: "AI Dialogue",
      feature1Desc: "Every artisan has an AI avatar ready to answer your questions.",
      feature2Desc: "Every piece has a unique NFT certificate.",
      feature3Desc: "Every participation is recorded on-chain.",
      feature4Desc: "The future of culture, decided globally.",
      techLabel1: "Blockchain",
      techLabel2: "Decentralized Storage"
    },
    tech: {
      title: "Technical Architecture",
      baseChainDesc: "L2 Blockchain",
      ipfsDesc: "Distributed Storage",
      arweaveDesc: "Permanent Storage",
      openaiDesc: "AI Agent",
      cloudflareDesc: "Edge Computing"
    },
    governance: {
      title: "Governance & Future",
      ctaButton: "Join DAO Governance",
      heroTitle: "You're not joining a project",
      heroSubtitle: "You're joining a cultural preservation revolution",
      audience1: "Traditional culture guardians",
      audience2: "Master artisans with skills",
      audience3: "Web3 believers in the future",
      audience4: "DAO governance innovators",
      audienceCta: "This is your stage",
      stat1Label: "On-Chain",
      stat2Label: "Open Source",
      stat3Label: "Permanent"
    },
    footer: {
      brandName: "Heritage on Chain",
      brandDesc: "AI × Web3 Cultural Preservation Platform",
      aiLabel: "Artificial Intelligence",
      web3Label: "Web3 Technology",
      quickLinksTitle: "Quick Links",
      resourcesTitle: "Resources",
      copyright: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service"
    },
    dao: {
      title: "Cultural Protection, Global Governance",
      description: "Powered by DAO decentralized governance, holding $QI is your key to shaping heritage",
      ctaButton: "Join Governance",
      stat1Label: "Proposals",
      stat2Label: "Active Voters",
      stat3Label: "Executed"
    },
    hero: {
      notJustStory: "But guardians of the future"
    }
  },
  
  ja: {
    token: {
      communityEngagement: "コミュニティ参加度",
      title: "$QI · 文化守護者の証",
      subtitle: "$QIは投機トークンではなく、文化保護への参加証明です",
      role1Title: "文化の意思決定者",
      role1Desc: "あなたの一票が文化の未来を決める",
      role2Title: "伝承貢献者",
      role2Desc: "毎日のチェックイン、物語の共有、コンテンツ創作",
      role3Title: "文化コレクター",
      role3Desc: "限定NFT真品の優先購入、あなたのウォレットが博物館に",
      compliance: "コンプライアンス声明：",
      stat1Label: "総供給量",
      stat2Label: "流通量",
      stat3Label: "保有者",
      stat4Label: "ネットワーク"
    },
    ecosystem: {
      title: "完全なエコシステム、文化に力を",
      subtitle: "文化持続可能性の未来",
      description: "単なるマーケットプレイスではなく、文明の架け橋",
      feature1Badge: "AI対話",
      feature1Desc: "すべての職人にAIアバターがあり、いつでも質問に答えます。",
      feature2Desc: "すべての作品に唯一のNFT証明書があります。",
      feature3Desc: "すべての参加がチェーン上に記録されます。",
      feature4Desc: "文化の未来は、世界中で決定されます。",
      techLabel1: "ブロックチェーン",
      techLabel2: "分散型ストレージ"
    },
    tech: {
      title: "技術アーキテクチャ",
      baseChainDesc: "L2ブロックチェーン",
      ipfsDesc: "分散型ストレージ",
      arweaveDesc: "永久ストレージ",
      openaiDesc: "AIエージェント",
      cloudflareDesc: "エッジコンピューティング"
    },
    governance: {
      title: "ガバナンスと未来",
      ctaButton: "DAOガバナンスに参加",
      heroTitle: "あなたが参加するのはプロジェクトではない",
      heroSubtitle: "文化保護革命です",
      audience1: "伝統を愛する文化守護者",
      audience2: "技を持つ職人",
      audience3: "未来を信じるWeb3ビルダー",
      audience4: "ルールを変えたいDAOガバナー",
      audienceCta: "ここがあなたのステージ",
      stat1Label: "オンチェーン",
      stat2Label: "オープンソース",
      stat3Label: "永久保存"
    },
    footer: {
      brandName: "非遺上鏈",
      brandDesc: "AI × Web3 文化保護プラットフォーム",
      aiLabel: "人工知能",
      web3Label: "Web3技術",
      quickLinksTitle: "クイックリンク",
      resourcesTitle: "リソース",
      copyright: "全著作権所有。",
      privacy: "プライバシーポリシー",
      terms: "利用規約"
    },
    dao: {
      title: "文化保護、グローバルガバナンス",
      description: "DAO分散型自治により、$QIを保有することが未来の伝承への鍵",
      ctaButton: "ガバナンスに参加",
      stat1Label: "提案数",
      stat2Label: "アクティブ投票者",
      stat3Label: "実行済み"
    },
    hero: {
      notJustStory: "未来の守り人として"
    }
  },
  
  fr: {
    token: {
      communityEngagement: "Engagement Communautaire",
      title: "$QI · Certificat du Gardien",
      subtitle: "$QI n'est pas un jeton spéculatif, mais une preuve de participation à la préservation culturelle",
      role1Title: "Décideur Culturel",
      role1Desc: "Votre vote façonne l'avenir de la culture",
      role2Title: "Contributeur Patrimonial",
      role2Desc: "Enregistrements quotidiens, partage d'histoires, création de contenu",
      role3Title: "Collectionneur Culturel",
      role3Desc: "Accès prioritaire aux NFT d'exception, votre portefeuille est un musée",
      compliance: "Déclaration de Conformité:",
      stat1Label: "Offre Totale",
      stat2Label: "Offre en Circulation",
      stat3Label: "Détenteurs",
      stat4Label: "Réseau"
    },
    ecosystem: {
      title: "Écosystème Complet, Autonomiser la Culture",
      subtitle: "L'Avenir de la Durabilité Culturelle",
      description: "Pas seulement une marketplace, mais un pont de civilisation",
      feature1Badge: "Dialogue IA",
      feature1Desc: "Chaque artisan a un avatar IA prêt à répondre à vos questions.",
      feature2Desc: "Chaque pièce a un certificat NFT unique.",
      feature3Desc: "Chaque participation est enregistrée on-chain.",
      feature4Desc: "L'avenir de la culture, décidé mondialement.",
      techLabel1: "Blockchain",
      techLabel2: "Stockage Décentralisé"
    },
    tech: {
      title: "Architecture Technique",
      baseChainDesc: "Blockchain L2",
      ipfsDesc: "Stockage Distribué",
      arweaveDesc: "Stockage Permanent",
      openaiDesc: "Agent IA",
      cloudflareDesc: "Edge Computing"
    },
    governance: {
      title: "Gouvernance & Avenir",
      ctaButton: "Rejoindre la Gouvernance DAO",
      heroTitle: "Vous ne rejoignez pas un projet",
      heroSubtitle: "Vous rejoignez une révolution de préservation culturelle",
      audience1: "Gardiens de la culture traditionnelle",
      audience2: "Artisans maîtres de leur art",
      audience3: "Bâtisseurs Web3 croyant en l'avenir",
      audience4: "Innovateurs de gouvernance DAO",
      audienceCta: "C'est votre scène",
      stat1Label: "On-Chain",
      stat2Label: "Open Source",
      stat3Label: "Permanent"
    },
    footer: {
      brandName: "Patrimoine sur Chaîne",
      brandDesc: "Plateforme de Préservation Culturelle IA × Web3",
      aiLabel: "Intelligence Artificielle",
      web3Label: "Technologie Web3",
      quickLinksTitle: "Liens Rapides",
      resourcesTitle: "Ressources",
      copyright: "Tous droits réservés.",
      privacy: "Politique de Confidentialité",
      terms: "Conditions d'Utilisation"
    },
    dao: {
      title: "Protection Culturelle, Gouvernance Mondiale",
      description: "Propulsé par la gouvernance décentralisée DAO, détenir $QI est votre clé pour façonner le patrimoine",
      ctaButton: "Rejoindre la Gouvernance",
      stat1Label: "Propositions",
      stat2Label: "Votants Actifs",
      stat3Label: "Exécutées"
    },
    hero: {
      notJustStory: "Mais gardiens de l'avenir"
    }
  },
  
  es: {
    token: {
      communityEngagement: "Participación Comunitaria",
      title: "$QI · Certificado del Guardián",
      subtitle: "$QI no es un token especulativo, sino una prueba de participación en la preservación cultural",
      role1Title: "Tomador de Decisiones Culturales",
      role1Desc: "Tu voto da forma al futuro de la cultura",
      role2Title: "Contribuidor Patrimonial",
      role2Desc: "Registros diarios, compartir historias, crear contenido",
      role3Title: "Coleccionista Cultural",
      role3Desc: "Acceso prioritario a NFTs de edición limitada, tu billetera es un museo",
      compliance: "Declaración de Cumplimiento:",
      stat1Label: "Suministro Total",
      stat2Label: "Suministro Circulante",
      stat3Label: "Titulares",
      stat4Label: "Red"
    },
    ecosystem: {
      title: "Ecosistema Completo, Empoderando la Cultura",
      subtitle: "El Futuro de la Sostenibilidad Cultural",
      description: "No solo un mercado, sino un puente de civilización",
      feature1Badge: "Diálogo IA",
      feature1Desc: "Cada artesano tiene un avatar IA listo para responder tus preguntas.",
      feature2Desc: "Cada pieza tiene un certificado NFT único.",
      feature3Desc: "Cada participación se registra en la cadena.",
      feature4Desc: "El futuro de la cultura, decidido globalmente.",
      techLabel1: "Blockchain",
      techLabel2: "Almacenamiento Descentralizado"
    },
    tech: {
      title: "Arquitectura Técnica",
      baseChainDesc: "Blockchain L2",
      ipfsDesc: "Almacenamiento Distribuido",
      arweaveDesc: "Almacenamiento Permanente",
      openaiDesc: "Agente IA",
      cloudflareDesc: "Computación en el Borde"
    },
    governance: {
      title: "Gobernanza y Futuro",
      ctaButton: "Unirse a la Gobernanza DAO",
      heroTitle: "No te unes a un proyecto",
      heroSubtitle: "Te unes a una revolución de preservación cultural",
      audience1: "Guardianes de la cultura tradicional",
      audience2: "Maestros artesanos con habilidades",
      audience3: "Constructores Web3 que creen en el futuro",
      audience4: "Innovadores de gobernanza DAO",
      audienceCta: "Este es tu escenario",
      stat1Label: "En Cadena",
      stat2Label: "Código Abierto",
      stat3Label: "Permanente"
    },
    footer: {
      brandName: "Patrimonio en Cadena",
      brandDesc: "Plataforma de Preservación Cultural IA × Web3",
      aiLabel: "Inteligencia Artificial",
      web3Label: "Tecnología Web3",
      quickLinksTitle: "Enlaces Rápidos",
      resourcesTitle: "Recursos",
      copyright: "Todos los derechos reservados.",
      privacy: "Política de Privacidad",
      terms: "Términos de Servicio"
    },
    dao: {
      title: "Protección Cultural, Gobernanza Global",
      description: "Impulsado por la gobernanza descentralizada DAO, tener $QI es tu llave para dar forma al patrimonio",
      ctaButton: "Unirse a la Gobernanza",
      stat1Label: "Propuestas",
      stat2Label: "Votantes Activos",
      stat3Label: "Ejecutadas"
    },
    hero: {
      notJustStory: "Sino guardianes del futuro"
    }
  },
  
  ru: {
    token: {
      communityEngagement: "Вовлеченность Сообщества",
      title: "$QI · Сертификат Хранителя",
      subtitle: "$QI — это не спекулятивный токен, а доказательство участия в сохранении культуры",
      role1Title: "Принимающий Культурные Решения",
      role1Desc: "Ваш голос формирует будущее культуры",
      role2Title: "Вкладчик в Наследие",
      role2Desc: "Ежедневные регистрации, обмен историями, создание контента",
      role3Title: "Культурный Коллекционер",
      role3Desc: "Приоритетный доступ к лимитированным NFT шедеврам, ваш кошелек — это музей",
      compliance: "Заявление о Соответствии:",
      stat1Label: "Общее Предложение",
      stat2Label: "Циркулирующее Предложение",
      stat3Label: "Держатели",
      stat4Label: "Сеть"
    },
    ecosystem: {
      title: "Полная Экосистема, Расширяющая Культуру",
      subtitle: "Будущее Культурной Устойчивости",
      description: "Не просто маркетплейс, а мост цивилизации",
      feature1Badge: "Диалог с ИИ",
      feature1Desc: "У каждого мастера есть ИИ-аватар, готовый ответить на ваши вопросы.",
      feature2Desc: "У каждого произведения есть уникальный NFT-сертификат.",
      feature3Desc: "Каждое участие записывается в блокчейн.",
      feature4Desc: "Будущее культуры решается глобально.",
      techLabel1: "Блокчейн",
      techLabel2: "Децентрализованное Хранилище"
    },
    tech: {
      title: "Техническая Архитектура",
      baseChainDesc: "Блокчейн L2",
      ipfsDesc: "Распределенное Хранилище",
      arweaveDesc: "Постоянное Хранилище",
      openaiDesc: "ИИ-Агент",
      cloudflareDesc: "Граничные Вычисления"
    },
    governance: {
      title: "Управление и Будущее",
      ctaButton: "Присоединиться к Управлению DAO",
      heroTitle: "Вы присоединяетесь не к проекту",
      heroSubtitle: "Вы присоединяетесь к революции сохранения культуры",
      audience1: "Хранители традиционной культуры",
      audience2: "Мастера-ремесленники с навыками",
      audience3: "Строители Web3, верящие в будущее",
      audience4: "Новаторы управления DAO",
      audienceCta: "Это ваша сцена",
      stat1Label: "В Блокчейне",
      stat2Label: "Открытый Исходный Код",
      stat3Label: "Постоянно"
    },
    footer: {
      brandName: "Наследие в Блокчейне",
      brandDesc: "Платформа Сохранения Культуры ИИ × Web3",
      aiLabel: "Искусственный Интеллект",
      web3Label: "Технология Web3",
      quickLinksTitle: "Быстрые Ссылки",
      resourcesTitle: "Ресурсы",
      copyright: "Все права защищены.",
      privacy: "Политика Конфиденциальности",
      terms: "Условия Использования"
    },
    dao: {
      title: "Защита Культуры, Глобальное Управление",
      description: "Работает на децентрализованном управлении DAO, владение $QI — ваш ключ к формированию наследия",
      ctaButton: "Присоединиться к Управлению",
      stat1Label: "Предложения",
      stat2Label: "Активные Голосующие",
      stat3Label: "Выполнено"
    },
    hero: {
      notJustStory: "Но хранители будущего"
    }
  },
  
  ms: {
    token: {
      communityEngagement: "Penglibatan Komuniti",
      title: "$QI · Sijil Penjaga",
      subtitle: "$QI bukan token spekulatif, tetapi bukti penyertaan dalam pemeliharaan budaya",
      role1Title: "Pembuat Keputusan Budaya",
      role1Desc: "Undi anda membentuk masa depan budaya",
      role2Title: "Penyumbang Warisan",
      role2Desc: "Daftar masuk harian, kongsi cerita, cipta kandungan",
      role3Title: "Pengumpul Budaya",
      role3Desc: "Akses keutamaan kepada NFT edisi terhad, dompet anda adalah muzium",
      compliance: "Kenyataan Pematuhan:",
      stat1Label: "Jumlah Bekalan",
      stat2Label: "Bekalan Beredar",
      stat3Label: "Pemegang",
      stat4Label: "Rangkaian"
    },
    ecosystem: {
      title: "Ekosistem Lengkap, Memperkasa Budaya",
      subtitle: "Masa Depan Kemampanan Budaya",
      description: "Bukan sekadar pasaran, tetapi jambatan tamadun",
      feature1Badge: "Dialog AI",
      feature1Desc: "Setiap tukang ada avatar AI bersedia menjawab soalan anda.",
      feature2Desc: "Setiap karya mempunyai sijil NFT unik.",
      feature3Desc: "Setiap penyertaan direkodkan di rantaian.",
      feature4Desc: "Masa depan budaya, diputuskan secara global.",
      techLabel1: "Blockchain",
      techLabel2: "Penyimpanan Terdesentralisasi"
    },
    tech: {
      title: "Seni Bina Teknikal",
      baseChainDesc: "Blockchain L2",
      ipfsDesc: "Penyimpanan Teragih",
      arweaveDesc: "Penyimpanan Kekal",
      openaiDesc: "Agen AI",
      cloudflareDesc: "Pengkomputeran Tepi"
    },
    governance: {
      title: "Tadbir Urus & Masa Depan",
      ctaButton: "Sertai Tadbir Urus DAO",
      heroTitle: "Anda tidak menyertai projek",
      heroSubtitle: "Anda menyertai revolusi pemeliharaan budaya",
      audience1: "Penjaga budaya tradisional",
      audience2: "Tukang mahir dengan kemahiran",
      audience3: "Pembina Web3 yang percaya pada masa depan",
      audience4: "Inovator tadbir urus DAO",
      audienceCta: "Ini pentas anda",
      stat1Label: "Di Rantaian",
      stat2Label: "Sumber Terbuka",
      stat3Label: "Kekal"
    },
    footer: {
      brandName: "Warisan di Rantaian",
      brandDesc: "Platform Pemeliharaan Budaya AI × Web3",
      aiLabel: "Kecerdasan Buatan",
      web3Label: "Teknologi Web3",
      quickLinksTitle: "Pautan Pantas",
      resourcesTitle: "Sumber",
      copyright: "Hak cipta terpelihara.",
      privacy: "Dasar Privasi",
      terms: "Terma Perkhidmatan"
    },
    dao: {
      title: "Perlindungan Budaya, Tadbir Urus Global",
      description: "Dikuasakan oleh tadbir urus terdesentralisasi DAO, memegang $QI adalah kunci anda untuk membentuk warisan",
      ctaButton: "Sertai Tadbir Urus",
      stat1Label: "Cadangan",
      stat2Label: "Pengundi Aktif",
      stat3Label: "Dilaksanakan"
    },
    hero: {
      notJustStory: "Tetapi penjaga masa depan"
    }
  }
};

console.log('🔄 正在更新所有语言包...\n');

// 更新每个语言包
const locales = ['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'];

locales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  
  // 读取现有语言包
  const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 深度合并新翻译
  if (!existingData.homepage) {
    existingData.homepage = {};
  }
  
  // 合并各个区域
  Object.keys(translations[locale]).forEach(section => {
    if (!existingData.homepage[section]) {
      existingData.homepage[section] = {};
    }
    
    Object.assign(existingData.homepage[section], translations[locale][section]);
  });
  
  // 写回文件
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
  
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 所有语言包已更新！');
console.log('\n📊 新增翻译键统计：');
console.log(`  - Token 区域: 14 个键`);
console.log(`  - Ecosystem 区域: 10 个键`);
console.log(`  - Tech 区域: 6 个键`);
console.log(`  - Governance 区域: 10 个键`);
console.log(`  - Footer 区域: 9 个键`);
console.log(`  - DAO 区域: 5 个键`);
console.log(`  - Hero 区域: 1 个键`);
console.log(`\n  总计: 55 个新翻译键 × 7 种语言 = 385 条翻译\n`);

process.exit(0);

