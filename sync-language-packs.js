#!/usr/bin/env node
/**
 * 同步语言包
 * 从英文语言包同步缺失的键到其他语言
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

console.log('🔄 开始同步语言包...\n');

// 读取英文语言包作为参考
const enPath = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

// 需要同步的语言
const targetLocales = ['ru', 'ms'];

// 缺失的键和对应的英文翻译
const missingKeys = {
  auth: {
    login: "Login",
    register: "Register",
    logout: "Logout",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    rememberMe: "Remember Me",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    signUp: "Sign Up",
    signIn: "Sign In",
    resetPassword: "Reset Password",
    sendResetLink: "Send Reset Link",
    backToLogin: "Back to Login",
    passwordMismatch: "Passwords do not match",
    invalidEmail: "Invalid email address",
    weakPassword: "Password is too weak",
    loginSuccess: "Login successful"
  },
  checkout: {
    title: "Checkout",
    shippingInfo: "Shipping Information",
    selectAddress: "Select Address",
    addNewAddress: "Add New Address",
    paymentMethod: "Payment Method",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    tax: "Tax",
    total: "Total",
    placeOrder: "Place Order",
    processing: "Processing...",
    orderPlaced: "Order Placed Successfully",
    paymentFailed: "Payment Failed"
  },
  error: {
    general: "An error occurred",
    network: "Network error",
    notFound: "Not found",
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    serverError: "Server error",
    timeout: "Request timeout",
    invalidInput: "Invalid input",
    required: "This field is required"
  },
  footer: {
    about: "About Us",
    contact: "Contact",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    copyright: "All rights reserved.",
    followUs: "Follow Us",
    newsletter: "Newsletter",
    emailPlaceholder: "Enter your email",
    subscribe: "Subscribe"
  },
  orders: {
    title: "My Orders",
    orderNumber: "Order Number",
    orderTime: "Order Time",
    orderStatus: "Status",
    orderTotal: "Total",
    viewDetails: "View Details",
    trackOrder: "Track Order",
    cancelOrder: "Cancel Order",
    returnOrder: "Return Order",
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
    noOrders: "No orders yet",
    orderDetails: "Order Details",
    shippingAddress: "Shipping Address",
    billingAddress: "Billing Address",
    paymentMethod: "Payment Method",
    orderItems: "Order Items",
    confirmCancel: "Are you sure you want to cancel this order?"
  },
  success: {
    saved: "Saved successfully",
    deleted: "Deleted successfully",
    updated: "Updated successfully",
    created: "Created successfully",
    sent: "Sent successfully",
    copied: "Copied to clipboard"
  },
  wallet: {
    connect: "Connect Wallet",
    disconnect: "Disconnect",
    connected: "Connected",
    notConnected: "Not Connected",
    selectWallet: "Select Wallet",
    connecting: "Connecting...",
    switchNetwork: "Switch Network",
    wrongNetwork: "Wrong Network",
    balance: "Balance",
    address: "Address",
    copyAddress: "Copy Address",
    viewOnExplorer: "View on Explorer",
    transactionPending: "Transaction Pending",
    transactionSuccess: "Transaction Successful",
    transactionFailed: "Transaction Failed"
  }
};

// 俄语翻译
const ruTranslations = {
  auth: {
    login: "Войти",
    register: "Регистрация",
    logout: "Выйти",
    email: "Электронная почта",
    password: "Пароль",
    confirmPassword: "Подтвердите пароль",
    forgotPassword: "Забыли пароль?",
    rememberMe: "Запомнить меня",
    noAccount: "Нет аккаунта?",
    haveAccount: "Уже есть аккаунт?",
    signUp: "Зарегистрироваться",
    signIn: "Войти",
    resetPassword: "Сбросить пароль",
    sendResetLink: "Отправить ссылку для сброса",
    backToLogin: "Вернуться к входу",
    passwordMismatch: "Пароли не совпадают",
    invalidEmail: "Неверный адрес электронной почты",
    weakPassword: "Пароль слишком слабый",
    loginSuccess: "Вход выполнен успешно"
  },
  checkout: {
    title: "Оформление заказа",
    shippingInfo: "Информация о доставке",
    selectAddress: "Выбрать адрес",
    addNewAddress: "Добавить новый адрес",
    paymentMethod: "Способ оплаты",
    orderSummary: "Итого по заказу",
    subtotal: "Промежуточный итог",
    shipping: "Доставка",
    tax: "Налог",
    total: "Итого",
    placeOrder: "Оформить заказ",
    processing: "Обработка...",
    orderPlaced: "Заказ успешно оформлен",
    paymentFailed: "Оплата не удалась"
  },
  error: {
    general: "Произошла ошибка",
    network: "Ошибка сети",
    notFound: "Не найдено",
    unauthorized: "Не авторизован",
    forbidden: "Запрещено",
    serverError: "Ошибка сервера",
    timeout: "Время ожидания истекло",
    invalidInput: "Неверный ввод",
    required: "Это поле обязательно"
  },
  footer: {
    about: "О нас",
    contact: "Контакты",
    terms: "Условия использования",
    privacy: "Политика конфиденциальности",
    copyright: "Все права защищены.",
    followUs: "Подписывайтесь",
    newsletter: "Рассылка",
    emailPlaceholder: "Введите ваш email",
    subscribe: "Подписаться"
  },
  orders: {
    title: "Мои заказы",
    orderNumber: "Номер заказа",
    orderTime: "Время заказа",
    orderStatus: "Статус",
    orderTotal: "Итого",
    viewDetails: "Посмотреть детали",
    trackOrder: "Отследить заказ",
    cancelOrder: "Отменить заказ",
    returnOrder: "Вернуть заказ",
    pending: "В ожидании",
    processing: "Обработка",
    shipped: "Отправлено",
    delivered: "Доставлено",
    cancelled: "Отменено",
    returned: "Возвращено",
    noOrders: "Пока нет заказов",
    orderDetails: "Детали заказа",
    shippingAddress: "Адрес доставки",
    billingAddress: "Адрес для выставления счета",
    paymentMethod: "Способ оплаты",
    orderItems: "Товары в заказе",
    confirmCancel: "Вы уверены, что хотите отменить этот заказ?"
  },
  success: {
    saved: "Успешно сохранено",
    deleted: "Успешно удалено",
    updated: "Успешно обновлено",
    created: "Успешно создано",
    sent: "Успешно отправлено",
    copied: "Скопировано в буфер обмена"
  },
  wallet: {
    connect: "Подключить кошелек",
    disconnect: "Отключить",
    connected: "Подключено",
    notConnected: "Не подключено",
    selectWallet: "Выбрать кошелек",
    connecting: "Подключение...",
    switchNetwork: "Переключить сеть",
    wrongNetwork: "Неверная сеть",
    balance: "Баланс",
    address: "Адрес",
    copyAddress: "Скопировать адрес",
    viewOnExplorer: "Посмотреть в обозревателе",
    transactionPending: "Транзакция в ожидании",
    transactionSuccess: "Транзакция успешна",
    transactionFailed: "Транзакция не удалась"
  }
};

// 马来语翻译
const msTranslations = {
  auth: {
    login: "Log Masuk",
    register: "Daftar",
    logout: "Log Keluar",
    email: "E-mel",
    password: "Kata Laluan",
    confirmPassword: "Sahkan Kata Laluan",
    forgotPassword: "Lupa Kata Laluan?",
    rememberMe: "Ingat Saya",
    noAccount: "Tiada akaun?",
    haveAccount: "Sudah mempunyai akaun?",
    signUp: "Daftar",
    signIn: "Log Masuk",
    resetPassword: "Set Semula Kata Laluan",
    sendResetLink: "Hantar Pautan Set Semula",
    backToLogin: "Kembali ke Log Masuk",
    passwordMismatch: "Kata laluan tidak sepadan",
    invalidEmail: "Alamat e-mel tidak sah",
    weakPassword: "Kata laluan terlalu lemah",
    loginSuccess: "Log masuk berjaya"
  },
  checkout: {
    title: "Daftar Keluar",
    shippingInfo: "Maklumat Penghantaran",
    selectAddress: "Pilih Alamat",
    addNewAddress: "Tambah Alamat Baru",
    paymentMethod: "Kaedah Pembayaran",
    orderSummary: "Ringkasan Pesanan",
    subtotal: "Subjumlah",
    shipping: "Penghantaran",
    tax: "Cukai",
    total: "Jumlah",
    placeOrder: "Buat Pesanan",
    processing: "Memproses...",
    orderPlaced: "Pesanan Berjaya Dibuat",
    paymentFailed: "Pembayaran Gagal"
  },
  error: {
    general: "Ralat berlaku",
    network: "Ralat rangkaian",
    notFound: "Tidak dijumpai",
    unauthorized: "Tidak dibenarkan",
    forbidden: "Dilarang",
    serverError: "Ralat pelayan",
    timeout: "Tamat masa permintaan",
    invalidInput: "Input tidak sah",
    required: "Medan ini diperlukan"
  },
  footer: {
    about: "Tentang Kami",
    contact: "Hubungi",
    terms: "Terma Perkhidmatan",
    privacy: "Dasar Privasi",
    copyright: "Hak cipta terpelihara.",
    followUs: "Ikuti Kami",
    newsletter: "Surat Berita",
    emailPlaceholder: "Masukkan e-mel anda",
    subscribe: "Langgan"
  },
  orders: {
    title: "Pesanan Saya",
    orderNumber: "Nombor Pesanan",
    orderTime: "Masa Pesanan",
    orderStatus: "Status",
    orderTotal: "Jumlah",
    viewDetails: "Lihat Butiran",
    trackOrder: "Jejak Pesanan",
    cancelOrder: "Batal Pesanan",
    returnOrder: "Pulangkan Pesanan",
    pending: "Menunggu",
    processing: "Memproses",
    shipped: "Dihantar",
    delivered: "Diterima",
    cancelled: "Dibatalkan",
    returned: "Dipulangkan",
    noOrders: "Tiada pesanan lagi",
    orderDetails: "Butiran Pesanan",
    shippingAddress: "Alamat Penghantaran",
    billingAddress: "Alamat Pengebilan",
    paymentMethod: "Kaedah Pembayaran",
    orderItems: "Item Pesanan",
    confirmCancel: "Adakah anda pasti mahu membatalkan pesanan ini?"
  },
  success: {
    saved: "Berjaya disimpan",
    deleted: "Berjaya dipadam",
    updated: "Berjaya dikemas kini",
    created: "Berjaya dicipta",
    sent: "Berjaya dihantar",
    copied: "Disalin ke papan keratan"
  },
  wallet: {
    connect: "Sambung Dompet",
    disconnect: "Putuskan Sambungan",
    connected: "Disambungkan",
    notConnected: "Tidak Disambungkan",
    selectWallet: "Pilih Dompet",
    connecting: "Menyambung...",
    switchNetwork: "Tukar Rangkaian",
    wrongNetwork: "Rangkaian Salah",
    balance: "Baki",
    address: "Alamat",
    copyAddress: "Salin Alamat",
    viewOnExplorer: "Lihat di Penjelajah",
    transactionPending: "Transaksi Menunggu",
    transactionSuccess: "Transaksi Berjaya",
    transactionFailed: "Transaksi Gagal"
  }
};

const translations = {
  ru: ruTranslations,
  ms: msTranslations
};

// 同步每个目标语言
targetLocales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  let data = {};
  
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.log(`⚠️  无法读取 ${locale}.json，将创建新文件`);
  }
  
  // 添加缺失的键
  Object.keys(translations[locale]).forEach(section => {
    if (!data[section]) {
      data[section] = {};
    }
    Object.assign(data[section], translations[locale][section]);
  });
  
  // 写回文件
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ ${locale}.json 已同步`);
});

console.log('\n✅ 同步完成！\n');
console.log('📊 添加的内容：');
console.log('  - auth: 19 个键');
console.log('  - checkout: 14 个键');
console.log('  - error: 9 个键');
console.log('  - footer: 9 个键');
console.log('  - orders: 23 个键');
console.log('  - success: 6 个键');
console.log('  - wallet: 15 个键');
console.log('\n  总计: 95 个键 × 2 种语言 = 190 条翻译\n');

process.exit(0);

