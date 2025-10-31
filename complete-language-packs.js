#!/usr/bin/env node
/**
 * 完整补全俄语和马来语语言包的所有缺失键
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

console.log('🔄 补全语言包...\n');

// 读取英文语言包
const enData = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8'));

// 俄语补充翻译
const ruAdditions = {
  auth: {
    hasAccount: "Уже есть аккаунт?",
    registerSuccess: "Регистрация успешна",
    logoutSuccess: "Выход выполнен успешно",
    invalidCredentials: "Неверные учетные данные",
    emailRequired: "Требуется электронная почта",
    passwordRequired: "Требуется пароль"
  },
  checkout: {
    discount: "Скидка",
    agreeToTerms: "Я согласен с условиями",
    termsAndConditions: "Условия использования",
    privacyPolicy: "Политика конфиденциальности"
  },
  orders: {
    trackingNumber: "Номер отслеживания",
    payNow: "Оплатить сейчас",
    confirmReceipt: "Подтвердить получение",
    review: "Отзыв",
    requestRefund: "Запросить возврат",
    contactSeller: "Связаться с продавцом",
    status: "Статус"
  },
  wallet: {
    metamask: "MetaMask",
    walletConnect: "WalletConnect",
    coinbase: "Coinbase Wallet",
    installMetamask: "Установить MetaMask",
    addressCopied: "Адрес скопирован",
    transactionHistory: "История транзакций"
  }
};

// 马来语补充翻译
const msAdditions = {
  auth: {
    hasAccount: "Sudah mempunyai akaun?",
    registerSuccess: "Pendaftaran berjaya",
    logoutSuccess: "Log keluar berjaya",
    invalidCredentials: "Kelayakan tidak sah",
    emailRequired: "E-mel diperlukan",
    passwordRequired: "Kata laluan diperlukan"
  },
  checkout: {
    discount: "Diskaun",
    agreeToTerms: "Saya bersetuju dengan syarat",
    termsAndConditions: "Terma dan Syarat",
    privacyPolicy: "Dasar Privasi"
  },
  orders: {
    trackingNumber: "Nombor Penjejakan",
    payNow: "Bayar Sekarang",
    confirmReceipt: "Sahkan Penerimaan",
    review: "Ulasan",
    requestRefund: "Minta Bayaran Balik",
    contactSeller: "Hubungi Penjual",
    status: "Status"
  },
  wallet: {
    metamask: "MetaMask",
    walletConnect: "WalletConnect",
    coinbase: "Dompet Coinbase",
    installMetamask: "Pasang MetaMask",
    addressCopied: "Alamat disalin",
    transactionHistory: "Sejarah Transaksi"
  }
};

const additions = {
  ru: ruAdditions,
  ms: msAdditions
};

// 更新每个语言
['ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并补充内容
  Object.keys(additions[locale]).forEach(section => {
    if (!data[section]) {
      data[section] = {};
    }
    Object.assign(data[section], additions[locale][section]);
  });
  
  // 写回文件
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ ${locale}.json 已补全`);
});

console.log('\n✅ 补全完成！\n');
console.log('📊 添加的内容：');
console.log('  - auth: 6 个键');
console.log('  - checkout: 4 个键');
console.log('  - orders: 7 个键');
console.log('  - wallet: 6 个键');
console.log('\n  总计: 23 个键 × 2 种语言 = 46 条翻译\n');

process.exit(0);

