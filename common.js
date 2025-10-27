/* ======= common.js · 前端共享工具 ======= */

/** 你的 Workers API 根域名（改成你自己的 Worker 域名） */
export const API_BASE = 'https://songbrocade-api.petterbrand03.workers.dev'; 
// ↑↑↑ 如已换成别的 worker，改这一行即可。必须是 https://xxx.workers.dev

/** localStorage key 统一管理 */
export const LS = {
  ADMIN_ADDR:  'qipao.admin.addr',
  ADMIN_BEARER:'qipao.admin.bearer',
  LAST_EVENT:  'qipao.last.event'
};
window.LS = LS;

/** 读取管理员登录态（地址 + Bearer） */
export function readAdminAuth() {
  return {
    addr:   localStorage.getItem(LS.ADMIN_ADDR)   || '',
    bearer: localStorage.getItem(LS.ADMIN_BEARER) || ''
  };
}

/** 存储管理员登录态 */
export function writeAdminAuth(addr, bearer) {
  if (addr)   localStorage.setItem(LS.ADMIN_ADDR, addr);
  if (bearer) localStorage.setItem(LS.ADMIN_BEARER, bearer);
}

/** 基础 fetch（自动拼 API_BASE、带 CORS、带 Bearer） */
export async function apiFetch(path, init = {}) {
  const url = path.startsWith('http') ? path : (API_BASE.replace(/\/$/,'') + path);
  const opts = {
    method: init.method || 'GET',
    // 只在需要时加 header，避免多余 header 触发预检失败
    headers: {
      ...(init.headers || {})
    },
    body: init.body,
    mode: 'cors',
    credentials: 'omit',
    redirect: 'follow'
  };

  // 如果有 Bearer，自动加
  try {
    const { bearer } = readAdminAuth();
    if (bearer && !opts.headers['authorization'] && !opts.headers['Authorization']) {
      opts.headers['authorization'] = 'Bearer ' + bearer;
    }
  } catch(_) {}

  const res = await fetch(url, opts);
  return res;
}

/** EIP-191 签名（ethers v5/viem 皆可；优先用 window.ethereum.request） */
export async function signMessage(message) {
  if (!window.ethereum) throw new Error('No wallet');
  // 要求钱包连接
  const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const sig = await window.ethereum.request({
    method: 'personal_sign',
    params: [ message, address ]
  });
  return { address, signature: sig };
}

/** 管理员登录：GET /api/auth/challenge -> 签名 -> POST /api/auth/verify */
export async function adminLoginFlow() {
  // 1) 取 challenge（注意用 GET）
  const r1 = await apiFetch('/api/auth/challenge', { method: 'GET' });
  if (!r1.ok) throw new Error('challenge failed: ' + r1.status);
  const j1 = await r1.json();
  if (!j1 || !j1.msg) throw new Error('bad challenge payload');

  // 2) 钱包签名
  const { address, signature } = await signMessage(j1.msg);

  // 3) 验证（把地址+签名回传）
  const r2 = await apiFetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address, signature })
  });
  if (!r2.ok) throw new Error('verify failed: ' + r2.status);
  const j2 = await r2.json();
  if (!j2 || !j2.token) throw new Error('no bearer token');

  writeAdminAuth(address, j2.token);
  return { address, bearer: j2.token };
}

/** 小工具：设置状态文本颜色 */
export function setStatus(el, text, color) {
  el.textContent = text;
  if (color) el.style.color = color;
}