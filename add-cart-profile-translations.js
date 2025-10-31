#!/usr/bin/env node
/**
 * 为购物车和个人中心页面添加翻译
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    cart: {
      selected: "已选",
      items: "件",
      defaultSpec: "默认规格",
      confirmClear: "确定要清空购物车吗？",
      couponInDevelopment: "优惠券功能开发中..."
    },
    profile: {
      points: "积分",
      rewards: "奖励",
      viewAll: "查看全部",
      activityCenter: "活动中心",
      checkinDesc: "签到领积分，连续签到奖励更多",
      airdropDesc: "参与活动领取空投奖励",
      daoDesc: "参与社区治理，投票决策",
      myServices: "我的服务",
      certifiedArtisans: "查看所有认证传承人",
      myCollection: "我的收藏",
      collectionDesc: "收藏的商品和文化故事"
    },
    wallet: {
      clickToConnect: "点击右侧按钮连接钱包"
    }
  },
  en: {
    cart: {
      selected: "Selected",
      items: "items",
      defaultSpec: "Default Spec",
      confirmClear: "Are you sure you want to clear the cart?",
      couponInDevelopment: "Coupon feature is under development"
    },
    profile: {
      points: "Points",
      rewards: "Rewards",
      viewAll: "View All",
      activityCenter: "Activity Center",
      checkinDesc: "Check in to earn points, consecutive check-ins earn more",
      airdropDesc: "Participate in activities to claim airdrop rewards",
      daoDesc: "Participate in community governance and vote on decisions",
      myServices: "My Services",
      certifiedArtisans: "View all certified artisans",
      myCollection: "My Collection",
      collectionDesc: "Collected products and cultural stories"
    },
    wallet: {
      clickToConnect: "Click the button on the right to connect wallet"
    }
  },
  ja: {
    cart: {
      selected: "選択済み",
      items: "件",
      defaultSpec: "デフォルト仕様",
      confirmClear: "カートを空にしてもよろしいですか？",
      couponInDevelopment: "クーポン機能は開発中です"
    },
    profile: {
      points: "ポイント",
      rewards: "報酬",
      viewAll: "すべて表示",
      activityCenter: "アクティビティセンター",
      checkinDesc: "チェックインしてポイントを獲得、連続チェックインでさらなる報酬",
      airdropDesc: "アクティビティに参加してエアドロップ報酬を獲得",
      daoDesc: "コミュニティガバナンスに参加し、決定に投票",
      myServices: "マイサービス",
      certifiedArtisans: "すべての認定職人を表示",
      myCollection: "マイコレクション",
      collectionDesc: "収集した商品と文化ストーリー"
    },
    wallet: {
      clickToConnect: "右側のボタンをクリックしてウォレットを接続"
    }
  },
  fr: {
    cart: {
      selected: "Sélectionné",
      items: "articles",
      defaultSpec: "Spécification par défaut",
      confirmClear: "Êtes-vous sûr de vouloir vider le panier ?",
      couponInDevelopment: "Fonctionnalité de coupon en développement"
    },
    profile: {
      points: "Points",
      rewards: "Récompenses",
      viewAll: "Voir tout",
      activityCenter: "Centre d'activités",
      checkinDesc: "Connectez-vous pour gagner des points, des connexions consécutives rapportent plus",
      airdropDesc: "Participez aux activités pour réclamer des récompenses d'airdrop",
      daoDesc: "Participez à la gouvernance communautaire et votez sur les décisions",
      myServices: "Mes services",
      certifiedArtisans: "Voir tous les artisans certifiés",
      myCollection: "Ma collection",
      collectionDesc: "Produits collectés et histoires culturelles"
    },
    wallet: {
      clickToConnect: "Cliquez sur le bouton à droite pour connecter le portefeuille"
    }
  },
  es: {
    cart: {
      selected: "Seleccionado",
      items: "artículos",
      defaultSpec: "Especificación predeterminada",
      confirmClear: "¿Estás seguro de que quieres vaciar el carrito?",
      couponInDevelopment: "Funcionalidad de cupón en desarrollo"
    },
    profile: {
      points: "Puntos",
      rewards: "Recompensas",
      viewAll: "Ver todo",
      activityCenter: "Centro de actividades",
      checkinDesc: "Regístrese para ganar puntos, los registros consecutivos ganan más",
      airdropDesc: "Participa en actividades para reclamar recompensas de airdrop",
      daoDesc: "Participa en la gobernanza comunitaria y vota sobre decisiones",
      myServices: "Mis servicios",
      certifiedArtisans: "Ver todos los artesanos certificados",
      myCollection: "Mi colección",
      collectionDesc: "Productos recopilados e historias culturales"
    },
    wallet: {
      clickToConnect: "Haz clic en el botón de la derecha para conectar la billetera"
    }
  },
  ru: {
    cart: {
      selected: "Выбрано",
      items: "товаров",
      defaultSpec: "Стандартная спецификация",
      confirmClear: "Вы уверены, что хотите очистить корзину?",
      couponInDevelopment: "Функция купонов в разработке"
    },
    profile: {
      points: "Баллы",
      rewards: "Награды",
      viewAll: "Посмотреть все",
      activityCenter: "Центр активности",
      checkinDesc: "Регистрируйтесь для получения баллов, последовательные регистрации дают больше",
      airdropDesc: "Участвуйте в активностях, чтобы получить награды аирдропа",
      daoDesc: "Участвуйте в управлении сообществом и голосуйте по решениям",
      myServices: "Мои услуги",
      certifiedArtisans: "Просмотреть всех сертифицированных мастеров",
      myCollection: "Моя коллекция",
      collectionDesc: "Собранные товары и культурные истории"
    },
    wallet: {
      clickToConnect: "Нажмите кнопку справа, чтобы подключить кошелек"
    }
  },
  ms: {
    cart: {
      selected: "Dipilih",
      items: "item",
      defaultSpec: "Spesifikasi Lalai",
      confirmClear: "Adakah anda pasti mahu mengosongkan troli?",
      couponInDevelopment: "Fungsi kupon sedang dibangunkan"
    },
    profile: {
      points: "Mata",
      rewards: "Ganjaran",
      viewAll: "Lihat Semua",
      activityCenter: "Pusat Aktiviti",
      checkinDesc: "Daftar masuk untuk mendapat mata, daftar masuk berturut-turut mendapat lebih banyak",
      airdropDesc: "Sertai aktiviti untuk menuntut ganjaran airdrop",
      daoDesc: "Sertai tadbir urus komuniti dan undi keputusan",
      myServices: "Perkhidmatan Saya",
      certifiedArtisans: "Lihat semua tukang yang disahkan",
      myCollection: "Koleksi Saya",
      collectionDesc: "Produk yang dikumpul dan cerita budaya"
    },
    wallet: {
      clickToConnect: "Klik butang di sebelah kanan untuk menyambung dompet"
    }
  }
};

console.log('🔄 为购物车和个人中心页面添加翻译...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并购物车翻译
  Object.assign(data.cart, translations[locale].cart);
  
  // 合并个人中心翻译
  Object.assign(data.profile, translations[locale].profile);
  
  // 合并钱包翻译
  Object.assign(data.wallet, translations[locale].wallet);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 购物车和个人中心翻译已添加！\n');
console.log('📊 添加的翻译键：');
console.log('  - cart.selected, items, defaultSpec, confirmClear, couponInDevelopment');
console.log('  - profile.points, rewards, viewAll, activityCenter, checkinDesc, airdropDesc, daoDesc, myServices, certifiedArtisans, myCollection, collectionDesc');
console.log('  - wallet.clickToConnect');
console.log('\n  总计: 18个键 × 7种语言 = 126条翻译\n');

process.exit(0);

