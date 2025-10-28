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

async function ensureAuth() {
  const t = readToken();
  const authStateEl = $('#authState');

  if (!t) {
    if (authStateEl) {
      authStateEl.textContent = '未登录';
      authStateEl.className = 'pill pill-error';
    }
    toast('未检测到管理员登录，请先完成签名登录。', 'error');
    return false;
  }
  
  // 验证管理员权限（白名单检查）
  try {
    const response = await fetch(`${ADMIN_CONFIG.API_BASE}/admin/artisans`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${t}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      if (authStateEl) {
        authStateEl.textContent = '已登录';
        authStateEl.className = 'pill pill-ok';
      }
      return true;
    } else {
      if (authStateEl) {
        authStateEl.textContent = '权限不足';
        authStateEl.className = 'pill pill-error';
      }
      toast('管理员权限验证失败，您的地址不在白名单中。', 'error');
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
window.apiJSONmulti = apiJSONmulti;
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
