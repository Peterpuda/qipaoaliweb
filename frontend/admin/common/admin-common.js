// 旗袍DAO管理后台 - 共享JavaScript代码

// 配置常量
const ADMIN_CONFIG = {
  API_BASE: (window.POAP_CONFIG?.WORKER_BASE_URL || 'https://songbrocade-api.petterbrand03.workers.dev').replace(/\/+$/, ''),
  ADMIN_TOKEN_KEY: 'qipao.admin.token',
  FRONT_BASE: (window.POAP_CONFIG?.FRONT_BASE_URL || location.origin).replace(/\/+$/, '')
};

// DOM工具函数
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// 消息提示
function toast(msg, type = 'info') {
  const n = document.createElement('div');
  n.className = `toast ${type}`;
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

// 认证相关
function readToken() {
  // 优先从首页传递的token中获取
  return sessionStorage.getItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY) || 
         localStorage.getItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY) ||
         localStorage.getItem("bearer_token") || '';
}

function setToken(token) {
  if (token) {
    sessionStorage.setItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY);
  }
}

function getBearer() {
  return readToken();
}

function authHeaders() {
  const t = readToken();
  return t ? { 'authorization': 'Bearer ' + t } : {};
}

// 当前连接的钱包地址
let currentWallet = '';

// 连接钱包
async function connectAdminWallet() {
  if (!window.ethereum) {
    toast('未检测到钱包，请使用 MetaMask 等 Web3 钱包访问', 'error');
    return false;
  }
  
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    currentWallet = accounts[0];
    console.log('钱包已连接:', currentWallet);
    return true;
  } catch (error) {
    console.error('连接钱包失败:', error);
    toast('连接钱包失败: ' + error.message, 'error');
    return false;
  }
}

// 管理员登录（签名验证）
async function adminLogin() {
  try {
    // 1. 确保钱包已连接
    if (!currentWallet) {
      const connected = await connectAdminWallet();
      if (!connected) return false;
    }
    
    // 2. 获取挑战消息
    const challengeResponse = await fetch(`${ADMIN_CONFIG.API_BASE}/auth/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: currentWallet })
    });
    
    const challengeData = await challengeResponse.json();
    if (!challengeData.ok) {
      throw new Error(challengeData.error || '获取挑战失败');
    }
    
    // 3. 签名挑战
    const message = challengeData.message;
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, currentWallet]
    });
    
    // 4. 提交签名验证
    const verifyResponse = await fetch(`${ADMIN_CONFIG.API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: currentWallet,
        signature: signature,
        message: message
      })
    });
    
    const verifyData = await verifyResponse.json();
    
    if (verifyData.ok) {
      // 使用带时间戳的 token 设置（如果 admin-auth.js 已加载）
      if (window.adminAuth && window.adminAuth.setTokenWithTimestamp) {
        window.adminAuth.setTokenWithTimestamp(verifyData.token);
      } else {
        setToken(verifyData.token);
        // 手动设置时间戳
        localStorage.setItem(ADMIN_CONFIG.ADMIN_TOKEN_KEY + '.timestamp', Date.now().toString());
      }
      toast('管理员登录成功！', 'success');
      return true;
    } else {
      throw new Error(verifyData.error || '登录失败');
    }
  } catch (error) {
    console.error('管理员登录失败:', error);
    toast('登录失败: ' + error.message, 'error');
    return false;
  }
}

// 显示登录模态框
function showLoginModal() {
  const modalHTML = `
    <div id="adminLoginModal" class="modal-overlay" style="display: flex;">
      <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
          <h3><i class="fas fa-shield-alt"></i> 管理员登录</h3>
        </div>
        <div class="modal-body">
          <div style="padding: 20px; text-align: center;">
            <div class="alert alert-warning" style="margin-bottom: 20px;">
              <i class="fas fa-exclamation-triangle"></i>
              此区域仅限管理员访问
            </div>
            <p style="margin-bottom: 20px; color: #4A463F;">
              需要连接钱包并完成签名验证以确认管理员身份
            </p>
            <div id="loginWalletAddress" style="margin-bottom: 20px; padding: 10px; background: #f0f0f0; border-radius: 6px; font-family: monospace; font-size: 14px; display: none;">
              
            </div>
            <button onclick="startAdminLogin()" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">
              <i class="fas fa-wallet"></i> 连接钱包并签名
            </button>
            <button onclick="closeLoginModal()" class="btn btn-outline" style="width: 100%;">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 移除旧的模态框（如果存在）
  const oldModal = document.getElementById('adminLoginModal');
  if (oldModal) oldModal.remove();
  
  // 添加新模态框
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 关闭登录模态框
function closeLoginModal() {
  const modal = document.getElementById('adminLoginModal');
  if (modal) modal.remove();
}

// 开始管理员登录流程
async function startAdminLogin() {
  const loginBtn = document.querySelector('#adminLoginModal .btn-primary');
  const originalText = loginBtn.innerHTML;
  
  try {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
    
    const success = await adminLogin();
    if (success) {
      closeLoginModal();
      // 刷新页面以更新认证状态
      window.location.reload();
    }
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = originalText;
  }
}

async function ensureAuth() {
  const t = readToken();
  const authStateEl = $('#authState');

  if (!t) {
    if (authStateEl) {
      authStateEl.textContent = '未登录';
      authStateEl.className = 'pill pill-error';
    }
    // 显示登录模态框而不是只提示错误
    showLoginModal();
    return false;
  }
  
  // 验证管理员权限（白名单检查）
  try {
    const response = await fetch(`${ADMIN_CONFIG.API_BASE}/admin/whoami`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${t}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      currentWallet = data.wallet || '';
      
      if (authStateEl) {
        authStateEl.textContent = currentWallet ? shortAddr(currentWallet) : '已登录';
        authStateEl.className = 'pill pill-ok';
      }
      return true;
    } else {
      if (authStateEl) {
        authStateEl.textContent = '权限不足';
        authStateEl.className = 'pill pill-error';
      }
      
      // 清除无效token
      setToken('');
      
      // 403 说明不是管理员，401 说明 token 过期
      const errorMsg = response.status === 403 
        ? '您的钱包地址不在管理员白名单中' 
        : '登录已过期，请重新登录';
      
      toast(errorMsg, 'error');
      showLoginModal();
      return false;
    }
  } catch (error) {
    console.error('权限验证失败:', error);
    if (authStateEl) {
      authStateEl.textContent = '验证失败';
      authStateEl.className = 'pill pill-error';
    }
    toast('权限验证失败，请检查网络连接。', 'error');
    return false;
  }
}

// 短地址显示
function shortAddr(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

// API调用
async function apiJSONmulti(paths, init = {}) {
  const list = Array.isArray(paths) ? paths : [paths];
  let lastErr = 'NETWORK_ERROR';
  
  for (const p of list) {
    const url = p.startsWith('http') ? p : `${ADMIN_CONFIG.API_BASE}${p.startsWith('/') ? p : `/${p}`}`;
    try {
      // 检查是否是 FormData 上传（不设置 content-type，让浏览器自动设置）
      const isFormData = init.body instanceof FormData;
      
      const headers = { 
        ...authHeaders(), 
        ...(init.headers || {}) 
      };
      
      // 只有在非 FormData 时才设置 content-type: application/json
      if (!isFormData) {
        headers['content-type'] = 'application/json';
      }
      
      const r = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        ...init,
        headers
      });
      const txt = await r.text();
      let j = {};
      try { 
        j = JSON.parse(txt); 
      } catch {}
      
      if (r.ok) return j;
      lastErr = j?.error || `${r.status} ${txt}`;
    } catch (e) { 
      lastErr = e?.message || String(e); 
    }
  }
  throw new Error(lastErr);
}

// 为了向后兼容，添加 apiJSON 作为 apiJSONmulti 的别名（单路径简化版）
async function apiJSON(path, init = {}) {
  return await apiJSONmulti([path], init);
}

// 移动端导航（带安全检查）
function initMobileNav() {
  const hamburger = $('.hamburger');
  const sidebar = $('.sidebar');
  const overlay = $('.sidebar-overlay');
  const closeBtn = $('.sidebar-close');

  // 如果这些元素在当前页面不存在，就不要绑定，避免 null.addEventListener 崩溃
  if (hamburger && sidebar && overlay) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('open');
    });
  }

  if (overlay && sidebar) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  if (closeBtn && sidebar && overlay) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
}

// 页面导航
function navigateTo(page) {
  if (page === 'logout') {
    logout();
    return;
  }

  if (page && page !== getCurrentPage()) {
    // 避免重复添加 .html 后缀
    const url = page.endsWith('.html') ? page : `${page}.html`;
    window.location.href = url;
  }
}

function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop().replace('.html', '');
  return page || 'index';
}

// 登出
function logout() {
  setToken('');
  window.location.href = '../profile/';
}

// 二维码生成
function buildCheckinUrl(slug, code) {
  const url = `${ADMIN_CONFIG.FRONT_BASE}/checkin/?event=${encodeURIComponent(slug)}${code ? `&code=${encodeURIComponent(code)}` : ''}`;
  return url;
}

function setQRAndLinks(slug, code) {
  const url = buildCheckinUrl(slug, code);
  window.__lastCheckinURL = url;

  const imgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(url)}`;
  const img = $('#qrImg');
  if (img) img.src = imgUrl;

  const pre = $('#qrUrl');
  if (pre) pre.textContent = url;

  const aDown = $('#qrDownload');
  if (aDown) {
    aDown.href = imgUrl;
    const slugSafe = (slug || 'event');
    aDown.download = `qr_${slugSafe}.png`;
  }
}

// 复制到剪贴板
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制到剪贴板');
    return true;
  } catch (err) {
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      toast('已复制到剪贴板');
      return true;
    } catch (err) {
      toast('复制失败，请手动复制', 'error');
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN');
}

// 格式化日期
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('zh-CN');
}

// 加载状态管理
function showLoading(element) {
  if (element) {
    element.innerHTML = '<div class="loading"></div>';
    element.disabled = true;
  }
}

function hideLoading(element, originalText) {
  if (element) {
    element.innerHTML = originalText;
    element.disabled = false;
  }
}

// 表单验证
function validateForm(formData, requiredFields) {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors.push(`${field} 是必填字段`);
    }
  }
  
  return errors;
}

// 清空表单
function clearForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
  }
}

// 填充表单
function fillForm(formId, data) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  for (const [key, value] of Object.entries(data)) {
    const input = form.querySelector(`[name="${key}"], #${key}`);
    if (input) {
      if (input.type === 'checkbox') {
        input.checked = !!value;
      } else {
        input.value = value || '';
      }
    }
  }
}

// 获取表单数据
function getFormData(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};
  
  const formData = new FormData(form);
  const data = {};
  
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  
  return data;
}

// 页面初始化（只在 DOM 完成后跑）
function initPage() {
  // 1. 初始化移动端导航（内部做了 null 检查）
  initMobileNav();
  
  // 2. 检查认证状态并更新右上角 pill
  ensureAuth();
  
  // 3. 导航栏高亮当前页
  const currentPage = getCurrentPage();
  const navItems = $$('.nav-item');
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.includes(currentPage)) {
      item.classList.add('active');
    }
  });
  
  // 4. 复制签到链接按钮（有些页面没有二维码区域，所以要判空）
  const copyBtn = $('#qrCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = window.__lastCheckinURL || ($('#qrUrl')?.textContent || '').trim();
      if (url) {
        await copyToClipboard(url);
      } else {
        toast('暂无可复制的链接', 'error');
      }
    });
  }
}

// 导出到全局（兼容其他页面直接调用这些方法）
window.ADMIN_CONFIG = ADMIN_CONFIG;
window.$ = $;
window.$$ = $$;
window.toast = toast;
window.ensureAuth = ensureAuth;
window.adminLogin = adminLogin;
window.connectAdminWallet = connectAdminWallet;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.startAdminLogin = startAdminLogin;
window.shortAddr = shortAddr;
window.apiJSONmulti = apiJSONmulti;
window.apiJSON = apiJSON;
window.navigateTo = navigateTo;
window.logout = logout;
window.setQRAndLinks = setQRAndLinks;
window.copyToClipboard = copyToClipboard;
window.formatTime = formatTime;
window.formatDate = formatDate;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.validateForm = validateForm;
window.clearForm = clearForm;
window.fillForm = fillForm;
window.getFormData = getFormData;
window.goto = navigateTo; // alias

// 等 DOM 全部准备好后再跑 initPage，避免 null.addEventListener
document.addEventListener('DOMContentLoaded', initPage);
