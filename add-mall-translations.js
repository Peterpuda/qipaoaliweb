#!/usr/bin/env node
/**
 * 为商城首页添加翻译
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    category: {
      qipao: "旗袍",
      ceramics: "陶瓷",
      silk: "丝绸",
      jewelry: "首饰",
      tea: "茶具",
      art: "艺术品"
    },
    hero: {
      slide1: {
        title: "非遗传承 · 匠心之作",
        subtitle: "每一件作品都有故事"
      },
      slide2: {
        title: "限量手作 · 真实传承",
        subtitle: "链上认证 · 永久保真"
      },
      slide3: {
        title: "文化出海 · 全球共享",
        subtitle: "Web3 赋能非遗文化"
      }
    },
    heritageProjects: "非遗项目",
    noProducts: "暂无商品",
    product: "商品"
  },
  en: {
    category: {
      qipao: "Qipao",
      ceramics: "Ceramics",
      silk: "Silk",
      jewelry: "Jewelry",
      tea: "Tea Set",
      art: "Artwork"
    },
    hero: {
      slide1: {
        title: "Heritage Inheritance · Master's Craftsmanship",
        subtitle: "Every piece has a story"
      },
      slide2: {
        title: "Limited Edition · Authentic Heritage",
        subtitle: "On-Chain Certified · Forever Authentic"
      },
      slide3: {
        title: "Cultural Expansion · Global Sharing",
        subtitle: "Web3 Empowering Intangible Cultural Heritage"
      }
    },
    heritageProjects: "Heritage Projects",
    noProducts: "No products available",
    product: "Product"
  },
  ja: {
    category: {
      qipao: "旗袍",
      ceramics: "陶器",
      silk: "シルク",
      jewelry: "宝石",
      tea: "茶器",
      art: "芸術品"
    },
    hero: {
      slide1: {
        title: "無形文化遺産の継承 · 職人の技",
        subtitle: "すべての作品に物語がある"
      },
      slide2: {
        title: "限定制作 · 真の継承",
        subtitle: "オンチェーン認証 · 永続的な真正性"
      },
      slide3: {
        title: "文化の海外展開 · グローバル共有",
        subtitle: "Web3が無形文化遺産を強化"
      }
    },
    heritageProjects: "無形文化遺産プロジェクト",
    noProducts: "商品がありません",
    product: "商品"
  },
  fr: {
    category: {
      qipao: "Qipao",
      ceramics: "Céramique",
      silk: "Soie",
      jewelry: "Bijoux",
      tea: "Service à thé",
      art: "Œuvre d'art"
    },
    hero: {
      slide1: {
        title: "Patrimoine transmis · Artisanat de maître",
        subtitle: "Chaque pièce a une histoire"
      },
      slide2: {
        title: "Édition limitée · Patrimoine authentique",
        subtitle: "Certifié sur la chaîne · Authentique pour toujours"
      },
      slide3: {
        title: "Expansion culturelle · Partage mondial",
        subtitle: "Web3 renforçant le patrimoine culturel immatériel"
      }
    },
    heritageProjects: "Projets patrimoniaux",
    noProducts: "Aucun produit disponible",
    product: "Produit"
  },
  es: {
    category: {
      qipao: "Qipao",
      ceramics: "Cerámica",
      silk: "Seda",
      jewelry: "Joyería",
      tea: "Juego de té",
      art: "Obra de arte"
    },
    hero: {
      slide1: {
        title: "Herencia patrimonial · Artesanía de maestro",
        subtitle: "Cada pieza tiene una historia"
      },
      slide2: {
        title: "Edición limitada · Herencia auténtica",
        subtitle: "Certificado en cadena · Auténtico para siempre"
      },
      slide3: {
        title: "Expansión cultural · Compartir global",
        subtitle: "Web3 potenciando el patrimonio cultural inmaterial"
      }
    },
    heritageProjects: "Proyectos patrimoniales",
    noProducts: "No hay productos disponibles",
    product: "Producto"
  },
  ru: {
    category: {
      qipao: "Ципао",
      ceramics: "Керамика",
      silk: "Шелк",
      jewelry: "Украшения",
      tea: "Чайный набор",
      art: "Произведение искусства"
    },
    hero: {
      slide1: {
        title: "Наследие культур · Мастерство",
        subtitle: "Каждое изделие имеет историю"
      },
      slide2: {
        title: "Ограниченное издание · Подлинное наследие",
        subtitle: "Сертифицировано в блокчейне · Навсегда подлинно"
      },
      slide3: {
        title: "Культурное расширение · Глобальное распространение",
        subtitle: "Web3 расширяет возможности нематериального культурного наследия"
      }
    },
    heritageProjects: "Проекты культурного наследия",
    noProducts: "Товары недоступны",
    product: "Товар"
  },
  ms: {
    category: {
      qipao: "Qipao",
      ceramics: "Seramik",
      silk: "Sutera",
      jewelry: "Barang Kemas",
      tea: "Set Teh",
      art: "Karya Seni"
    },
    hero: {
      slide1: {
        title: "Warisan Budaya · Kraf Tukang",
        subtitle: "Setiap karya mempunyai cerita"
      },
      slide2: {
        title: "Edisi Terhad · Warisan Asli",
        subtitle: "Diperakui di Rantaian · Selamanya Asli"
      },
      slide3: {
        title: "Pengembangan Budaya · Perkongsian Global",
        subtitle: "Web3 Memperkasakan Warisan Budaya Tidak Ketara"
      }
    },
    heritageProjects: "Projek Warisan",
    noProducts: "Tiada produk tersedia",
    product: "Produk"
  }
};

console.log('🔄 为商城首页添加翻译...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 添加分类翻译
  if (!data.mall.category) {
    data.mall.category = {};
  }
  Object.assign(data.mall.category, translations[locale].category);
  
  // 添加Hero轮播翻译
  if (!data.mall.hero) {
    data.mall.hero = {};
  }
  Object.assign(data.mall.hero, translations[locale].hero);
  
  // 添加其他翻译
  data.mall.heritageProjects = translations[locale].heritageProjects;
  data.mall.noProducts = translations[locale].noProducts;
  data.mall.product = translations[locale].product;
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 商城首页翻译已添加！\n');
console.log('📊 添加的翻译键：');
console.log('  - mall.category.* (6个分类)');
console.log('  - mall.hero.slide1/2/3.* (6个标题和副标题)');
console.log('  - mall.heritageProjects');
console.log('  - mall.noProducts');
console.log('  - mall.product');
console.log('\n  总计: 15个键 × 7种语言 = 105条翻译\n');

process.exit(0);

