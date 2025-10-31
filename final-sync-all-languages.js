#!/usr/bin/env node
/**
 * 最终同步：为所有语言添加缺失的 29 个键
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend/i18n/locales');

console.log('🔄 最终同步所有语言包...\n');

// 需要添加的键和翻译
const additions = {
  zh: {
    auth: {
      haveAccount: "已有账号？",
      resetPassword: "重置密码",
      sendResetLink: "发送重置链接",
      backToLogin: "返回登录",
      invalidEmail: "无效的邮箱地址",
      weakPassword: "密码太弱"
    },
    checkout: {
      tax: "税费",
      processing: "处理中...",
      orderPlaced: "订单已提交",
      paymentFailed: "支付失败"
    },
    orders: {
      trackOrder: "追踪订单",
      returnOrder: "退货",
      pending: "待处理",
      processing: "处理中",
      shipped: "已发货",
      delivered: "已送达",
      cancelled: "已取消",
      returned: "已退货",
      orderDetails: "订单详情",
      billingAddress: "账单地址",
      orderItems: "订单商品",
      confirmCancel: "确定要取消此订单吗？",
      refundAmount: "退款金额"
    },
    wallet: {
      connecting: "连接中...",
      switchNetwork: "切换网络",
      viewOnExplorer: "在浏览器中查看",
      transactionPending: "交易待处理",
      transactionSuccess: "交易成功",
      transactionFailed: "交易失败"
    }
  },
  
  en: {
    auth: {
      haveAccount: "Already have an account?",
      resetPassword: "Reset Password",
      sendResetLink: "Send Reset Link",
      backToLogin: "Back to Login",
      invalidEmail: "Invalid email address",
      weakPassword: "Password is too weak"
    },
    checkout: {
      tax: "Tax",
      processing: "Processing...",
      orderPlaced: "Order Placed Successfully",
      paymentFailed: "Payment Failed"
    },
    orders: {
      trackOrder: "Track Order",
      returnOrder: "Return Order",
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
      orderDetails: "Order Details",
      billingAddress: "Billing Address",
      orderItems: "Order Items",
      confirmCancel: "Are you sure you want to cancel this order?",
      refundAmount: "Refund Amount"
    },
    wallet: {
      connecting: "Connecting...",
      switchNetwork: "Switch Network",
      viewOnExplorer: "View on Explorer",
      transactionPending: "Transaction Pending",
      transactionSuccess: "Transaction Successful",
      transactionFailed: "Transaction Failed"
    }
  },
  
  ja: {
    auth: {
      haveAccount: "すでにアカウントをお持ちですか？",
      resetPassword: "パスワードをリセット",
      sendResetLink: "リセットリンクを送信",
      backToLogin: "ログインに戻る",
      invalidEmail: "無効なメールアドレス",
      weakPassword: "パスワードが弱すぎます"
    },
    checkout: {
      tax: "税金",
      processing: "処理中...",
      orderPlaced: "注文が完了しました",
      paymentFailed: "支払いに失敗しました"
    },
    orders: {
      trackOrder: "注文を追跡",
      returnOrder: "返品",
      pending: "保留中",
      processing: "処理中",
      shipped: "発送済み",
      delivered: "配達済み",
      cancelled: "キャンセル済み",
      returned: "返品済み",
      orderDetails: "注文詳細",
      billingAddress: "請求先住所",
      orderItems: "注文商品",
      confirmCancel: "この注文をキャンセルしてもよろしいですか？",
      refundAmount: "返金額"
    },
    wallet: {
      connecting: "接続中...",
      switchNetwork: "ネットワークを切り替え",
      viewOnExplorer: "エクスプローラーで表示",
      transactionPending: "トランザクション保留中",
      transactionSuccess: "トランザクション成功",
      transactionFailed: "トランザクション失敗"
    }
  },
  
  fr: {
    auth: {
      haveAccount: "Vous avez déjà un compte?",
      resetPassword: "Réinitialiser le mot de passe",
      sendResetLink: "Envoyer le lien de réinitialisation",
      backToLogin: "Retour à la connexion",
      invalidEmail: "Adresse e-mail invalide",
      weakPassword: "Le mot de passe est trop faible"
    },
    checkout: {
      tax: "Taxe",
      processing: "Traitement en cours...",
      orderPlaced: "Commande passée avec succès",
      paymentFailed: "Paiement échoué"
    },
    orders: {
      trackOrder: "Suivre la commande",
      returnOrder: "Retourner la commande",
      pending: "En attente",
      processing: "En cours de traitement",
      shipped: "Expédié",
      delivered: "Livré",
      cancelled: "Annulé",
      returned: "Retourné",
      orderDetails: "Détails de la commande",
      billingAddress: "Adresse de facturation",
      orderItems: "Articles de la commande",
      confirmCancel: "Êtes-vous sûr de vouloir annuler cette commande?",
      refundAmount: "Montant du remboursement"
    },
    wallet: {
      connecting: "Connexion en cours...",
      switchNetwork: "Changer de réseau",
      viewOnExplorer: "Voir sur l'explorateur",
      transactionPending: "Transaction en attente",
      transactionSuccess: "Transaction réussie",
      transactionFailed: "Transaction échouée"
    }
  },
  
  es: {
    auth: {
      haveAccount: "¿Ya tienes una cuenta?",
      resetPassword: "Restablecer contraseña",
      sendResetLink: "Enviar enlace de restablecimiento",
      backToLogin: "Volver al inicio de sesión",
      invalidEmail: "Dirección de correo electrónico no válida",
      weakPassword: "La contraseña es demasiado débil"
    },
    checkout: {
      tax: "Impuesto",
      processing: "Procesando...",
      orderPlaced: "Pedido realizado con éxito",
      paymentFailed: "Pago fallido"
    },
    orders: {
      trackOrder: "Rastrear pedido",
      returnOrder: "Devolver pedido",
      pending: "Pendiente",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
      returned: "Devuelto",
      orderDetails: "Detalles del pedido",
      billingAddress: "Dirección de facturación",
      orderItems: "Artículos del pedido",
      confirmCancel: "¿Estás seguro de que quieres cancelar este pedido?",
      refundAmount: "Monto del reembolso"
    },
    wallet: {
      connecting: "Conectando...",
      switchNetwork: "Cambiar red",
      viewOnExplorer: "Ver en el explorador",
      transactionPending: "Transacción pendiente",
      transactionSuccess: "Transacción exitosa",
      transactionFailed: "Transacción fallida"
    }
  }
};

// 更新每个语言
['zh', 'en', 'ja', 'fr', 'es'].forEach(locale => {
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
  console.log(`✅ ${locale}.json 已同步`);
});

console.log('\n✅ 最终同步完成！\n');
console.log('📊 添加的内容：');
console.log('  - auth: 6 个键');
console.log('  - checkout: 4 个键');
console.log('  - orders: 13 个键');
console.log('  - wallet: 6 个键');
console.log('\n  总计: 29 个键 × 5 种语言 = 145 条翻译\n');

process.exit(0);

