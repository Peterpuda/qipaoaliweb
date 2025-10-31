#!/usr/bin/env node
/**
 * 为商品详情页添加翻译
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

const translations = {
  zh: {
    loadingArtisan: "加载匠人信息...",
    blockchainCertification: "链上认证",
    checkingCertification: "检查认证状态...",
    notFound: "商品不存在",
    invalidId: "请检查商品ID是否正确",
    loadFailed: "加载失败",
    productNotFound: "商品未找到",
    dataLoadFailed: "商品数据加载失败",
    imageLoadFailed: "图片加载失败",
    productImage: "商品图片",
    certifiedRWA: "已认证 RWA 数字资产",
    onChainVerify: "链上验证",
    pendingCertification: "待认证"
  },
  en: {
    loadingArtisan: "Loading artisan information...",
    blockchainCertification: "Blockchain Certification",
    checkingCertification: "Checking certification status...",
    notFound: "Product Not Found",
    invalidId: "Please check if the product ID is correct",
    loadFailed: "Failed to Load",
    productNotFound: "Product not found",
    dataLoadFailed: "Product data load failed",
    imageLoadFailed: "Image Load Failed",
    productImage: "Product Image",
    certifiedRWA: "Certified RWA Digital Asset",
    onChainVerify: "On-Chain Verified",
    pendingCertification: "Pending Certification"
  },
  ja: {
    loadingArtisan: "職人情報を読み込み中...",
    blockchainCertification: "ブロックチェーン認証",
    checkingCertification: "認証状態を確認中...",
    notFound: "商品が見つかりません",
    invalidId: "商品IDが正しいか確認してください",
    loadFailed: "読み込みに失敗しました",
    productNotFound: "商品が見つかりません",
    dataLoadFailed: "商品データの読み込みに失敗しました",
    imageLoadFailed: "画像の読み込みに失敗しました",
    productImage: "商品画像",
    certifiedRWA: "認証済み RWA デジタル資産",
    onChainVerify: "オンチェーン認証済み",
    pendingCertification: "認証待ち"
  },
  fr: {
    loadingArtisan: "Chargement des informations de l'artisan...",
    blockchainCertification: "Certification Blockchain",
    checkingCertification: "Vérification du statut de certification...",
    notFound: "Produit Introuvable",
    invalidId: "Veuillez vérifier si l'ID du produit est correct",
    loadFailed: "Échec du Chargement",
    productNotFound: "Produit non trouvé",
    dataLoadFailed: "Échec du chargement des données du produit",
    imageLoadFailed: "Échec du Chargement de l'Image",
    productImage: "Image du Produit",
    certifiedRWA: "Actif Numérique RWA Certifié",
    onChainVerify: "Vérifié sur la Chaîne",
    pendingCertification: "En Attente de Certification"
  },
  es: {
    loadingArtisan: "Cargando información del artesano...",
    blockchainCertification: "Certificación Blockchain",
    checkingCertification: "Verificando estado de certificación...",
    notFound: "Producto No Encontrado",
    invalidId: "Por favor verifique si el ID del producto es correcto",
    loadFailed: "Error al Cargar",
    productNotFound: "Producto no encontrado",
    dataLoadFailed: "Error al cargar datos del producto",
    imageLoadFailed: "Error al Cargar Imagen",
    productImage: "Imagen del Producto",
    certifiedRWA: "Activo Digital RWA Certificado",
    onChainVerify: "Verificado en Cadena",
    pendingCertification: "Certificación Pendiente"
  },
  ru: {
    loadingArtisan: "Загрузка информации о мастере...",
    blockchainCertification: "Блокчейн Сертификация",
    checkingCertification: "Проверка статуса сертификации...",
    notFound: "Товар Не Найден",
    invalidId: "Пожалуйста, проверьте правильность ID товара",
    loadFailed: "Ошибка Загрузки",
    productNotFound: "Товар не найден",
    dataLoadFailed: "Ошибка загрузки данных товара",
    imageLoadFailed: "Ошибка Загрузки Изображения",
    productImage: "Изображение Товара",
    certifiedRWA: "Сертифицированный Цифровой Актив RWA",
    onChainVerify: "Проверено в Блокчейне",
    pendingCertification: "Ожидает Сертификации"
  },
  ms: {
    loadingArtisan: "Memuatkan maklumat tukang...",
    blockchainCertification: "Pensijilan Blockchain",
    checkingCertification: "Memeriksa status pensijilan...",
    notFound: "Produk Tidak Ditemui",
    invalidId: "Sila semak sama ada ID produk betul",
    loadFailed: "Gagal Memuatkan",
    productNotFound: "Produk tidak dijumpai",
    dataLoadFailed: "Gagal memuatkan data produk",
    imageLoadFailed: "Gagal Memuatkan Imej",
    productImage: "Imej Produk",
    certifiedRWA: "Aset Digital RWA Disahkan",
    onChainVerify: "Disahkan di Rantaian",
    pendingCertification: "Menunggu Pensijilan"
  }
};

console.log('🔄 为商品详情页添加翻译...\n');

['zh', 'en', 'ja', 'fr', 'es', 'ru', 'ms'].forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  // 合并翻译
  Object.assign(data.product, translations[locale]);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ ${locale}.json 已更新`);
});

console.log('\n✅ 商品详情页翻译已添加！\n');
console.log('📊 添加的翻译键：');
console.log('  - product.loadingArtisan');
console.log('  - product.blockchainCertification');
console.log('  - product.checkingCertification');
console.log('  - product.notFound');
console.log('  - product.invalidId');
console.log('  - product.loadFailed');
console.log('  - product.productNotFound');
console.log('  - product.dataLoadFailed');
console.log('  - product.imageLoadFailed');
console.log('  - product.productImage');
console.log('  - product.certifiedRWA');
console.log('  - product.onChainVerify');
console.log('  - product.pendingCertification');
console.log('\n  总计: 13个键 × 7种语言 = 91条翻译\n');

process.exit(0);

