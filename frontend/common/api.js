const API_BASE = 'https://songbrocade-api.petterbrand03.workers.dev';
const ADMIN_TOKEN_KEY = 'qipao.admin.token';

function getToken(){
  return localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export async function api(path, opts = {}){
  const headers = {
    'content-type': 'application/json',
    ...(getToken() ? { 'authorization': 'Bearer ' + getToken() } : {})
  };
  const r = await fetch(API_BASE + path, { ...opts, headers });
  const data = await r.json().catch(()=>({}));
  if (!r.ok || data.error) throw new Error(data.error || r.statusText);
  return data;
}