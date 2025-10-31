#!/usr/bin/env node
/**
 * 添加页脚区域的缺失翻译键
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    homepage: {
      footer: {
        description: '融合 <span class="text-[#D4AF37]">人工智能</span> 与 <span class="text-[#D4AF37]">Web3 技术</span>，构建全球非遗文化数字保护生态，实现文化传承、AI 智能导览与 DAO 社区自治。',
        linkAbout: '关于平台',
        linkArtisans: '匠人中心',
        linkMall: 'NFT 链商',
        linkDAO: 'DAO 治理',
        linkRewards: '奖励中心',
        resourceWhitepaper: '白皮书',
        resourceDocs: '开发文档',
        resourceBrand: '品牌资产',
        resourcePrivacy: '隐私政策',
        resourceTerms: '服务条款'
      }
    }
  },
  en: {
    homepage: {
      footer: {
        description: 'Integrating <span class="text-[#D4AF37]">Artificial Intelligence</span> and <span class="text-[#D4AF37]">Web3 Technology</span>, building a global intangible cultural heritage digital protection ecosystem, realizing cultural inheritance, AI intelligent guidance, and DAO community autonomy.',
        linkAbout: 'About Platform',
        linkArtisans: 'Artisan Center',
        linkMall: 'NFT Marketplace',
        linkDAO: 'DAO Governance',
        linkRewards: 'Reward Center',
        resourceWhitepaper: 'Whitepaper',
        resourceDocs: 'Development Docs',
        resourceBrand: 'Brand Assets',
        resourcePrivacy: 'Privacy Policy',
        resourceTerms: 'Terms of Service'
      }
    }
  },
  ja: {
    homepage: {
      footer: {
        description: '<span class="text-[#D4AF37]">人工知能</span>と<span class="text-[#D4AF37]">Web3技術</span>を融合し、グローバルな無形文化遺産デジタル保護エコシステムを構築し、文化継承、AIインテリジェントガイダンス、DAOコミュニティ自律を実現。',
        linkAbout: 'プラットフォームについて',
        linkArtisans: '職人センター',
        linkMall: 'NFTマーケットプレイス',
        linkDAO: 'DAOガバナンス',
        linkRewards: '報酬センター',
        resourceWhitepaper: 'ホワイトペーパー',
        resourceDocs: '開発ドキュメント',
        resourceBrand: 'ブランド資産',
        resourcePrivacy: 'プライバシーポリシー',
        resourceTerms: '利用規約'
      }
    }
  },
  fr: {
    homepage: {
      footer: {
        description: 'Intégration de l\'<span class="text-[#D4AF37]">Intelligence Artificielle</span> et de la <span class="text-[#D4AF37]">Technologie Web3</span>, construction d\'un écosystème mondial de protection numérique du patrimoine culturel immatériel, réalisation de l\'héritage culturel, du guidage intelligent par IA et de l\'autonomie de la communauté DAO.',
        linkAbout: 'À Propos',
        linkArtisans: 'Centre des Artisans',
        linkMall: 'Marché NFT',
        linkDAO: 'Gouvernance DAO',
        linkRewards: 'Centre de Récompenses',
        resourceWhitepaper: 'Livre Blanc',
        resourceDocs: 'Documentation',
        resourceBrand: 'Actifs de Marque',
        resourcePrivacy: 'Politique de Confidentialité',
        resourceTerms: 'Conditions d\'Utilisation'
      }
    }
  },
  es: {
    homepage: {
      footer: {
        description: 'Integrando <span class="text-[#D4AF37]">Inteligencia Artificial</span> y <span class="text-[#D4AF37]">Tecnología Web3</span>, construyendo un ecosistema global de protección digital del patrimonio cultural inmaterial, realizando herencia cultural, guía inteligente por IA y autonomía de la comunidad DAO.',
        linkAbout: 'Acerca de la Plataforma',
        linkArtisans: 'Centro de Artesanos',
        linkMall: 'Mercado NFT',
        linkDAO: 'Gobernanza DAO',
        linkRewards: 'Centro de Recompensas',
        resourceWhitepaper: 'Libro Blanco',
        resourceDocs: 'Documentación',
        resourceBrand: 'Activos de Marca',
        resourcePrivacy: 'Política de Privacidad',
        resourceTerms: 'Términos de Servicio'
      }
    }
  },
  ru: {
    homepage: {
      footer: {
        description: 'Интеграция <span class="text-[#D4AF37]">Искусственного Интеллекта</span> и <span class="text-[#D4AF37]">Технологии Web3</span>, создание глобальной экосистемы цифровой защиты нематериального культурного наследия, реализация культурного наследия, интеллектуального гида на основе ИИ и автономии сообщества DAO.',
        linkAbout: 'О Платформе',
        linkArtisans: 'Центр Мастеров',
        linkMall: 'NFT Маркетплейс',
        linkDAO: 'DAO Управление',
        linkRewards: 'Центр Наград',
        resourceWhitepaper: 'Белая Книга',
        resourceDocs: 'Документация',
        resourceBrand: 'Активы Бренда',
        resourcePrivacy: 'Политика Конфиденциальности',
        resourceTerms: 'Условия Использования'
      }
    }
  },
  ms: {
    homepage: {
      footer: {
        description: 'Mengintegrasikan <span class="text-[#D4AF37]">Kecerdasan Buatan</span> dan <span class="text-[#D4AF37]">Teknologi Web3</span>, membina ekosistem perlindungan digital warisan budaya tidak ketara global, merealisasikan warisan budaya, panduan pintar AI dan autonomi komuniti DAO.',
        linkAbout: 'Tentang Platform',
        linkArtisans: 'Pusat Tukang',
        linkMall: 'Pasar NFT',
        linkDAO: 'Tadbir Urus DAO',
        linkRewards: 'Pusat Ganjaran',
        resourceWhitepaper: 'Kertas Putih',
        resourceDocs: 'Dokumentasi',
        resourceBrand: 'Aset Jenama',
        resourcePrivacy: 'Dasar Privasi',
        resourceTerms: 'Terma Perkhidmatan'
      }
    }
  }
};

console.log('🔄 添加页脚区域的缺失翻译键...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并 homepage.footer 翻译
  if (!data.homepage) data.homepage = {};
  if (!data.homepage.footer) data.homepage.footer = {};
  Object.assign(data.homepage.footer, translations[locale].homepage.footer);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 所有翻译键已添加！\n');
console.log('📊 添加的翻译键：');
console.log('  - homepage.footer.description (1个)');
console.log('  - homepage.footer.link* (5个快速链接)');
console.log('  - homepage.footer.resource* (5个资源文档)');
console.log('\n  总计: 11个键 × 7种语言 = 77条翻译\n');

process.exit(0);

