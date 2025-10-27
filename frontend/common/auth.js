// 通用认证模块
// 用于商品详情页和商城页的统一认证逻辑

// API 基础配置
const API_BASE = 'https://songbrocade-api.petterbrand03.workers.dev';

// 获取 Bearer Token
function getBearer() {
  return localStorage.getItem("bearer_token") || "";
}

// 设置 Bearer Token
function setBearer(token) {
  localStorage.setItem("bearer_token", token);
}

// 清除 Bearer Token
function clearBearer() {
  localStorage.removeItem("bearer_token");
}

// 获取钱包地址
function getWalletAddress() {
  return localStorage.getItem("wallet_address") || "";
}

// 设置钱包地址
function setWalletAddress(address) {
  localStorage.setItem("wallet_address", address);
}

// 构建认证头
function authHeaders(json = true) {
  const h = {};
  const b = getBearer();
  if (b) h["Authorization"] = "Bearer " + b;
  if (json) h["Content-Type"] = "application/json";
  return h;
}

// 检查是否已登录
function isLoggedIn() {
  const token = getBearer();
  const wallet = getWalletAddress();
  return !!(token && wallet);
}

// 完整的钱包登录流程
async function walletLogin() {
  if (!window.ethereum) {
    throw new Error('请安装MetaMask钱包');
  }
  
  try {
    // 1. 连接钱包
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || !accounts[0]) {
      throw new Error('未获取到钱包地址');
    }
    const wallet = accounts[0];
    
    // 2. 获取挑战
    const challengeResponse = await fetch(`${API_BASE}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: wallet })
    });
    
    const challengeData = await challengeResponse.json();
    if (!challengeData.ok) {
      throw new Error(challengeData.error || '获取挑战失败');
    }
    
    // 3. 钱包签名
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [challengeData.message, wallet]
    });
    
    // 4. 验证签名获取token
    const verifyResponse = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: wallet,
        signature: signature,
        message: challengeData.message
      })
    });
    
    const verifyData = await verifyResponse.json();
    if (!verifyData.ok) {
      throw new Error(verifyData.error || '登录失败');
    }
    
    // 5. 保存认证信息
    setBearer(verifyData.token);
    setWalletAddress(wallet);
    
    return {
      success: true,
      wallet: wallet,
      token: verifyData.token
    };
    
  } catch (error) {
    console.error('钱包登录失败:', error);
    throw error;
  }
}

// 通用 API 请求函数
async function apiFetch(endpoint, options = {}) {
  const url = API_BASE + endpoint;
  const defaultOptions = {
    headers: authHeaders(true),
    method: 'GET',
  };
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json();
    
    // 检查认证失败
    if (response.status === 403 && data.error === 'not allowed') {
      // 清除无效的token
      clearBearer();
      showToast('登录已过期，请重新连接钱包', 'error');
      return { ok: false, error: 'AUTH_REQUIRED', message: '需要重新登录' };
    }
    
    return data;
  } catch (error) {
    console.error('API请求失败:', error);
    return { ok: false, error: error.message };
  }
}

// 显示提示消息
function showToast(message, type = 'info') {
  // 移除现有的toast
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toastHtml = `
    <div class="fixed top-4 right-4 bg-white border border-line rounded-xl p-4 shadow-lg z-50 max-w-sm" id="toast">
      <div class="flex items-center">
        <i class="fas fa-${type === 'success' ? 'check-circle text-green-600' : type === 'error' ? 'exclamation-circle text-red-600' : 'info-circle text-blue-600'} mr-2"></i>
        <span class="text-sm text-ink">${message}</span>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', toastHtml);
  
  setTimeout(() => {
    const toast = document.getElementById('toast');
    if (toast) toast.remove();
  }, 3000);
}

// 短地址显示
function shortAddr(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

// 导出函数供其他页面使用
window.authModule = {
  getBearer,
  setBearer,
  clearBearer,
  getWalletAddress,
  setWalletAddress,
  authHeaders,
  isLoggedIn,
  walletLogin,
  apiFetch,
  showToast,
  shortAddr,
  API_BASE
};
