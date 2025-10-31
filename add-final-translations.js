#!/usr/bin/env node
/**
 * 添加最终的翻译键到所有语言包
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

console.log('🔄 正在添加最终翻译键...\n');

// 新增的翻译内容
const newTranslations = {
  zh: {
    token: {
      introText1: "不是炒币的筹码，而是",
      proofText: "参与文化守护的身份证明",
      introText2: "。基于",
      introText3: "发行，持有 $QI 意味着你成为了：",
      role1DescFull: "对哪些非遗项目值得上链、资金如何分配、未来如何发展 — 你的一票决定文化的走向。这不是形式，而是真正的话语权",
      role2DescFull: "每日签到、分享故事、创作内容 — 每一次参与都会获得通证奖励。守护文化的过程，也是价值累积的过程",
      role3DescFull: "优先购买限量 NFT 真品、参加线下非遗体验、与 AI 匠人深度对话 — 你的钱包，就是博物馆",
      complianceLabel: "合规声明：",
      complianceText: "$QI 为社区功能凭证，非证券且不具备投资功能，不支持二级市场交易或转让。仅用于生态治理和权益访问。"
    },
    governance: {
      stat1Desc: "链上运行",
      stat2Desc: "开源透明",
      stat3Desc: "永久存储"
    }
  },
  
  en: {
    token: {
      introText1: "is not a speculative token, but a",
      proofText: "proof of participation in cultural preservation",
      introText2: ". Issued on",
      introText3: ", holding $QI means you become:",
      role1DescFull: "Which heritage projects deserve to be on-chain, how funds are allocated, how the future develops — your vote shapes the direction of culture. This is not a formality, but real decision-making power",
      role2DescFull: "Daily check-ins, sharing stories, creating content — every participation earns token rewards. The process of protecting culture is also the process of accumulating value",
      role3DescFull: "Priority access to limited NFT masterpieces, offline heritage experiences, deep conversations with AI artisans — your wallet is a museum",
      complianceLabel: "Compliance Statement:",
      complianceText: "$QI is a community utility token, not a security and has no investment function. It does not support secondary market trading or transfer. It is only used for ecosystem governance and access rights."
    },
    governance: {
      stat1Desc: "On-Chain 24/7",
      stat2Desc: "100% Open Source",
      stat3Desc: "Permanent Storage"
    }
  },
  
  ja: {
    token: {
      introText1: "は投機トークンではなく、",
      proofText: "文化保護への参加証明",
      introText2: "です。",
      introText3: "で発行され、$QIを保有することは、あなたが次のような存在になることを意味します：",
      role1DescFull: "どの非遺産プロジェクトがチェーン上に値するか、資金をどのように配分するか、未来をどのように発展させるか — あなたの一票が文化の方向性を決めます。これは形式ではなく、真の発言権です",
      role2DescFull: "毎日のチェックイン、物語の共有、コンテンツ創作 — すべての参加がトークン報酬を獲得します。文化を守るプロセスは、価値を蓄積するプロセスでもあります",
      role3DescFull: "限定NFT真品への優先アクセス、オフライン非遺産体験、AI職人との深い対話 — あなたのウォレットは博物館です",
      complianceLabel: "コンプライアンス声明：",
      complianceText: "$QIはコミュニティユーティリティトークンであり、証券ではなく投資機能もありません。二次市場での取引や譲渡はサポートしていません。エコシステムガバナンスとアクセス権のみに使用されます。"
    },
    governance: {
      stat1Desc: "24/7オンチェーン",
      stat2Desc: "100%オープンソース",
      stat3Desc: "永久保存"
    }
  },
  
  fr: {
    token: {
      introText1: "n'est pas un jeton spéculatif, mais une",
      proofText: "preuve de participation à la préservation culturelle",
      introText2: ". Émis sur",
      introText3: ", détenir $QI signifie que vous devenez :",
      role1DescFull: "Quels projets patrimoniaux méritent d'être sur la chaîne, comment les fonds sont alloués, comment l'avenir se développe — votre vote façonne la direction de la culture. Ce n'est pas une formalité, mais un vrai pouvoir décisionnel",
      role2DescFull: "Enregistrements quotidiens, partage d'histoires, création de contenu — chaque participation rapporte des récompenses en jetons. Le processus de protection de la culture est aussi le processus d'accumulation de valeur",
      role3DescFull: "Accès prioritaire aux chefs-d'œuvre NFT limités, expériences patrimoniales hors ligne, conversations approfondies avec des artisans IA — votre portefeuille est un musée",
      complianceLabel: "Déclaration de Conformité :",
      complianceText: "$QI est un jeton utilitaire communautaire, pas un titre et n'a aucune fonction d'investissement. Il ne prend pas en charge les échanges ou les transferts sur le marché secondaire. Il est uniquement utilisé pour la gouvernance de l'écosystème et les droits d'accès."
    },
    governance: {
      stat1Desc: "On-Chain 24/7",
      stat2Desc: "100% Open Source",
      stat3Desc: "Stockage Permanent"
    }
  },
  
  es: {
    token: {
      introText1: "no es un token especulativo, sino una",
      proofText: "prueba de participación en la preservación cultural",
      introText2: ". Emitido en",
      introText3: ", tener $QI significa que te conviertes en:",
      role1DescFull: "Qué proyectos patrimoniales merecen estar en la cadena, cómo se asignan los fondos, cómo se desarrolla el futuro — tu voto da forma a la dirección de la cultura. Esto no es una formalidad, sino un poder de decisión real",
      role2DescFull: "Registros diarios, compartir historias, crear contenido — cada participación gana recompensas en tokens. El proceso de proteger la cultura es también el proceso de acumular valor",
      role3DescFull: "Acceso prioritario a obras maestras NFT limitadas, experiencias patrimoniales fuera de línea, conversaciones profundas con artesanos IA — tu billetera es un museo",
      complianceLabel: "Declaración de Cumplimiento:",
      complianceText: "$QI es un token de utilidad comunitaria, no un valor y no tiene función de inversión. No admite comercio o transferencia en el mercado secundario. Solo se utiliza para la gobernanza del ecosistema y los derechos de acceso."
    },
    governance: {
      stat1Desc: "On-Chain 24/7",
      stat2Desc: "100% Código Abierto",
      stat3Desc: "Almacenamiento Permanente"
    }
  },
  
  ru: {
    token: {
      introText1: "не является спекулятивным токеном, а",
      proofText: "доказательством участия в сохранении культуры",
      introText2: ". Выпущен на",
      introText3: ", владение $QI означает, что вы становитесь:",
      role1DescFull: "Какие проекты наследия заслуживают быть в блокчейне, как распределяются средства, как развивается будущее — ваш голос формирует направление культуры. Это не формальность, а реальная власть принятия решений",
      role2DescFull: "Ежедневные регистрации, обмен историями, создание контента — каждое участие приносит вознаграждение в токенах. Процесс защиты культуры — это также процесс накопления ценности",
      role3DescFull: "Приоритетный доступ к лимитированным NFT шедеврам, оффлайн опыт наследия, глубокие беседы с ИИ-мастерами — ваш кошелек это музей",
      complianceLabel: "Заявление о Соответствии:",
      complianceText: "$QI — это служебный токен сообщества, а не ценная бумага и не имеет инвестиционной функции. Он не поддерживает торговлю или передачу на вторичном рынке. Используется только для управления экосистемой и прав доступа."
    },
    governance: {
      stat1Desc: "В Блокчейне 24/7",
      stat2Desc: "100% Открытый Код",
      stat3Desc: "Постоянное Хранение"
    }
  },
  
  ms: {
    token: {
      introText1: "bukan token spekulatif, tetapi",
      proofText: "bukti penyertaan dalam pemeliharaan budaya",
      introText2: ". Diterbitkan di",
      introText3: ", memegang $QI bermakna anda menjadi:",
      role1DescFull: "Projek warisan mana yang layak berada di rantaian, bagaimana dana diagihkan, bagaimana masa depan berkembang — undi anda membentuk arah budaya. Ini bukan formaliti, tetapi kuasa membuat keputusan sebenar",
      role2DescFull: "Daftar masuk harian, berkongsi cerita, mencipta kandungan — setiap penyertaan mendapat ganjaran token. Proses melindungi budaya juga merupakan proses mengumpul nilai",
      role3DescFull: "Akses keutamaan kepada karya agung NFT terhad, pengalaman warisan luar talian, perbualan mendalam dengan tukang AI — dompet anda adalah muzium",
      complianceLabel: "Kenyataan Pematuhan:",
      complianceText: "$QI adalah token utiliti komuniti, bukan sekuriti dan tidak mempunyai fungsi pelaburan. Ia tidak menyokong perdagangan atau pemindahan pasaran sekunder. Ia hanya digunakan untuk tadbir urus ekosistem dan hak akses."
    },
    governance: {
      stat1Desc: "Di Rantaian 24/7",
      stat2Desc: "100% Sumber Terbuka",
      stat3Desc: "Penyimpanan Kekal"
    }
  }
};

// 更新每个语言包
const locales = ['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'];

locales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  
  // 读取现有语言包
  const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并新翻译
  if (!existingData.homepage) {
    existingData.homepage = {};
  }
  
  // 合并 token 区域
  if (!existingData.homepage.token) {
    existingData.homepage.token = {};
  }
  Object.assign(existingData.homepage.token, newTranslations[locale].token);
  
  // 合并 governance 区域
  if (!existingData.homepage.governance) {
    existingData.homepage.governance = {};
  }
  Object.assign(existingData.homepage.governance, newTranslations[locale].governance);
  
  // 写回文件
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
  
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 所有语言包已更新！');
console.log('\n📊 新增翻译键统计：');
console.log(`  - Token 区域: 9 个键`);
console.log(`  - Governance 区域: 3 个键`);
console.log(`\n  总计: 12 个新翻译键 × 7 种语言 = 84 条翻译\n`);

process.exit(0);

