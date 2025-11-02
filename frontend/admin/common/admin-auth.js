/**
 * Admin 鉴权中间件
 * 自动检查所有 admin 页面的登录状态
 * Token 有效期：7天
 * 未登录自动重定向到登录页
 */

// 白名单：不需要鉴权的页面
const AUTH_WHITELIST = [
  '/admin/login.html',
  '/admin/login'
];

// Token 有效期（7天）
const TOKEN_EXPIRY_DAYS = 7;
const TOKEN_EXPIRY_MS = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

/**
 * 检查当前页面是否需要鉴权
 */
function requiresAuth() {
  const currentPath = window.location.pathname;
  return !AUTH_WHITELIST.some(path => 
    currentPath.endsWith(path) || currentPath.includes(path)
  );
}

/**
 * 获取 Token 信息（包括过期时间）
 */
function getTokenInfo() {
  const token = readToken();
  if (!token) {
    return null;
  }
  
  // 检查 token 的存储时间
  const tokenTimestamp = localStorage.getItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY + '.timestamp');
  if (!tokenTimestamp) {
    // 如果没有时间戳，设置当前时间
    const now = Date.now();
    localStorage.setItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY + '.timestamp', now.toString());
    return { token, timestamp: now, expired: false };
  }
  
  const timestamp = parseInt(tokenTimestamp, 10);
  const now = Date.now();
  const expired = (now - timestamp) > TOKEN_EXPIRY_MS;
  
  return { token, timestamp, expired };
}

/**
 * 设置 Token（带时间戳）
 */
function setTokenWithTimestamp(token) {
  if (token) {
    setToken(token);
    localStorage.setItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY + '.timestamp', Date.now().toString());
  } else {
    setToken(null);
    localStorage.removeItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY + '.timestamp');
  }
}

/**
 * 执行鉴权检查
 */
async function checkAuth() {
  // 如果是白名单页面，不检查
  if (!requiresAuth()) {
    console.log('✅ Auth check: Whitelist page, skipping auth');
    return true;
  }
  
  console.log('🔐 Auth check: Checking admin authentication...');
  
  // 检查 Token
  const tokenInfo = getTokenInfo();
  
  if (!tokenInfo || !tokenInfo.token) {
    console.warn('❌ Auth check: No token found, redirecting to login');
    redirectToLogin('no_token');
    return false;
  }
  
  // 检查 Token 是否过期
  if (tokenInfo.expired) {
    console.warn('❌ Auth check: Token expired, redirecting to login');
    // 清除过期的 token
    setTokenWithTimestamp(null);
    redirectToLogin('token_expired');
    return false;
  }
  
  // Token 剩余有效期
  const remainingDays = Math.ceil((TOKEN_EXPIRY_MS - (Date.now() - tokenInfo.timestamp)) / (24 * 60 * 60 * 1000));
  console.log(`✅ Auth check: Token valid, ${remainingDays} days remaining`);
  
  // 可选：验证 Token 是否真实有效（调用后端 API）
  // 注意：这里暂时跳过后端验证，如需要可以取消注释以下代码
  /*
  try {
    const response = await fetch(`${ADMIN_CONFIG.API_BASE}/admin/verify`, {
      headers: authHeaders()
    });
    
    if (!response.ok) {
      console.warn('❌ Auth check: Token invalid (backend verification failed)');
      setTokenWithTimestamp(null);
      redirectToLogin('token_invalid');
      return false;
    }
    
    console.log('✅ Auth check: Token verified by backend');
  } catch (error) {
    console.error('⚠️ Auth check: Backend verification failed (network error), allowing access:', error);
    // 网络错误时，暂时允许访问（根据安全需求可调整）
  }
  */
  
  return true;
}

/**
 * 重定向到登录页
 */
function redirectToLogin(reason = 'unknown') {
  const returnUrl = encodeURIComponent(window.location.href);
  const loginUrl = `/admin/login.html?returnUrl=${returnUrl}&reason=${reason}`;
  
  console.log(`🔄 Redirecting to login: ${loginUrl}`);
  
  // 显示提示信息（如果 i18n 已加载）
  if (window.i18n) {
    const message = reason === 'token_expired' 
      ? window.i18n.t('admin.sessionExpired')
      : window.i18n.t('admin.loginRequired') || '请先登录';
    
    if (window.toast) {
      window.toast(message, 'warning');
    } else {
      console.log(`💬 ${message}`);
    }
  }
  
  // 延迟一点时间，让用户看到提示
  setTimeout(() => {
    window.location.href = loginUrl;
  }, 500);
}

/**
 * 退出登录
 */
function logout() {
  console.log('👋 Logging out...');
  setTokenWithTimestamp(null);
  
  // 显示提示
  if (window.toast) {
    window.toast(window.i18n ? window.i18n.t('admin.logoutSuccess') : '已退出登录', 'success');
  }
  
  // 跳转到登录页
  setTimeout(() => {
    window.location.href = '/admin/login.html';
  }, 500);
}

/**
 * 更新页面上的登录状态显示
 */
function updateAuthState() {
  const authStateEl = document.getElementById('authState');
  if (!authStateEl) return;
  
  const tokenInfo = getTokenInfo();
  
  if (tokenInfo && tokenInfo.token && !tokenInfo.expired) {
    const remainingDays = Math.ceil((TOKEN_EXPIRY_MS - (Date.now() - tokenInfo.timestamp)) / (24 * 60 * 60 * 1000));
    authStateEl.textContent = window.i18n ? window.i18n.t('admin.loggedIn') : `已登录 (${remainingDays}天)`;
    authStateEl.className = 'pill success';
  } else {
    authStateEl.textContent = window.i18n ? window.i18n.t('admin.notLoggedIn') : '未登录';
    authStateEl.className = 'pill';
  }
}

// 立即执行鉴权检查（同步检查，阻止页面渲染）
(function() {
  // 如果不需要鉴权，直接返回
  if (!requiresAuth()) {
    console.log('✅ Auth check: Whitelist page, skipping auth');
    return;
  }
  
  console.log('🔐 Auth check: Checking admin authentication (immediate)...');
  
  // 同步检查 Token
  const tokenInfo = getTokenInfo();
  
  if (!tokenInfo || !tokenInfo.token) {
    console.warn('❌ Auth check: No token found, redirecting to login (immediate)');
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.replace(`/admin/login.html?returnUrl=${returnUrl}&reason=no_token`);
    // 阻止后续脚本执行
    throw new Error('Auth check failed: No token');
  }
  
  // 检查 Token 是否过期
  if (tokenInfo.expired) {
    console.warn('❌ Auth check: Token expired, redirecting to login (immediate)');
    setTokenWithTimestamp(null);
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.replace(`/admin/login.html?returnUrl=${returnUrl}&reason=token_expired`);
    // 阻止后续脚本执行
    throw new Error('Auth check failed: Token expired');
  }
  
  // Token 剩余有效期
  const remainingDays = Math.ceil((TOKEN_EXPIRY_MS - (Date.now() - tokenInfo.timestamp)) / (24 * 60 * 60 * 1000));
  console.log(`✅ Auth check: Token valid, ${remainingDays} days remaining (immediate)`);
})();

// 页面加载完成后更新状态
window.addEventListener('DOMContentLoaded', () => {
  updateAuthState();
});

// 定期检查 Token 是否过期（每 5 分钟检查一次）
setInterval(() => {
  const tokenInfo = getTokenInfo();
  if (tokenInfo && tokenInfo.expired && requiresAuth()) {
    console.warn('⏰ Token expired during session, redirecting to login');
    redirectToLogin('token_expired_during_session');
  }
}, 5 * 60 * 1000);

// 导出函数供其他脚本使用
window.adminAuth = {
  checkAuth,
  requiresAuth,
  getTokenInfo,
  setTokenWithTimestamp,
  logout,
  updateAuthState,
  TOKEN_EXPIRY_DAYS
};

console.log(`🔐 admin-auth.js loaded (Token expiry: ${TOKEN_EXPIRY_DAYS} days)`);

