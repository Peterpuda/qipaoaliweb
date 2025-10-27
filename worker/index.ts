// worker-api/index.js
import { ethers } from 'ethers';

/* -------------------- config & defaults -------------------- */
const DEFAULT_ADMIN = '0xef85456652ada05f12708b9bdcf215780e780d18'; // 你的默认管理员（小写）

/* -------------------- tiny utils -------------------- */
function corsify(resp, env){
  const r = new Response(resp.body, resp);
  r.headers.set('access-control-allow-origin', env.CORS_ORIGIN || '*');
  r.headers.set('access-control-allow-headers', 'authorization,content-type,x-admin-bearer');
  r.headers.set('access-control-allow-methods', 'GET,POST,OPTIONS');
  r.headers.set('access-control-expose-headers', '*');
  if (!r.headers.get('content-type')) r.headers.set('content-type','application/json; charset=utf-8');
  r.headers.set('vary','origin');
  return r;
}
function json(env, data, status=200){ return corsify(new Response(JSON.stringify(data), { status }), env); }
async function readJSON(req){ try{ return await req.json(); }catch{ return {}; } }
function stripApi(p){ return p.startsWith('/api/') ? p.slice(4) : p; }

async function d1Run(env, sql, binds=[]) { return env.DB.prepare(sql).bind(...binds).run(); }
async function d1All(env, sql, binds=[]) { const r = await env.DB.prepare(sql).bind(...binds).all(); return r.results || []; }

function randomHex(n=16){ const b=new Uint8Array(n); crypto.getRandomValues(b); return [...b].map(x=>x.toString(16).padStart(2,'0')).join(''); }
async function genStaticCode(env, slug){
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.AUTH_SECRET || 'qipao-secret'),
    {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`event:${slug}`));
  const hex = [...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,'0')).join('');
  return hex.slice(0,16).toUpperCase();
}

/* --------- schema detector: 兼容新老 events / checkins 表 --------- */
const schemaCache = { events: null, checkins: null };

async function getCols(env, table){
  if (schemaCache[table]) return schemaCache[table];
  try{
    const rows = await d1All(env, `PRAGMA table_info(${table})`);
    const cols = rows.map(r => String(r.name || r.cid || '').toLowerCase()).filter(Boolean);
    schemaCache[table] = cols;
    return cols;
  }catch{
    schemaCache[table] = [];
    return [];
  }
}

async function isEventsLegacy(env){
  // 老表包含 slug、name，且通常没有 start_ts/end_ts/location
  const cols = await getCols(env, 'events');
  return cols.includes('slug') && !cols.includes('start_ts') && !cols.includes('end_ts');
}

async function checkinsUsesEventSlug(env){
  const cols = await getCols(env, 'checkins');
  // 优先用 event_slug；退化到 event_id
  if (cols.includes('event_slug')) return 'event_slug';
  return 'event_id';
}

/* -------------------- auth helpers -------------------- */
function readBearerRaw(req){
  const h1 = req.headers.get('authorization') || '';
  const h2 = req.headers.get('x-admin-bearer') || '';
  if (h2) return h2.trim();
  if (h1.toLowerCase().startsWith('bearer ')) return h1.slice(7).trim();
  return '';
}
function readBearerAddr(req){
  const token = readBearerRaw(req);
  if (!token) return null;

  // base64(JSON)
  try{
    const obj = JSON.parse(atob(token));
    if (obj?.addr) return String(obj.addr).toLowerCase();
    if (obj?.address) return String(obj.address).toLowerCase();
  }catch{}

  // JWT（仅解析 payload）
  const parts = token.split('.');
  if (parts.length === 3){
    try{
      const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')))));
      if (payload?.addr) return String(payload.addr).toLowerCase();
      if (payload?.address) return String(payload.address).toLowerCase();
    }catch{}
  }
  return null;
}

function adminRule(env){
  const raw = String(env.ADMIN_WALLETS ?? '').trim();
  if (raw) return raw;
  return DEFAULT_ADMIN; // 未配置时回退你的默认管理员
}
function checkAdmin(addr, env){
  const rule = adminRule(env);
  if (!rule) return false;
  if (rule === '*') return !!addr;
  const allow = rule.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  return allow.includes(String(addr||'').toLowerCase());
}
function makeToken(addr){ return btoa(JSON.stringify({ addr: String(addr).toLowerCase(), ts: Date.now() })); }

/* -------------------- in-memory challenge -------------------- */
const challenges = new Map(); // key: address(or nonce) -> message

/* -------------------- core handler (auto-CORS & schema aware) -------------------- */
async function handle(req, env){
  const url = new URL(req.url);
  const path = stripApi(url.pathname);

  // health
  if (req.method === 'GET' && (path === '/' || path === '/health')){
    return json(env, { ok:true, service:'worker-api', ts: Date.now() });
  }

  // OPTIONS 预检
  if (req.method === 'OPTIONS'){
    return corsify(new Response(null, { status:204 }), env);
  }

  // whoami（自检）
  if (req.method === 'GET' && path === '/admin/whoami'){
    const addr = readBearerAddr(req);
    const rule = adminRule(env);
    if (!addr) return json(env, { ok:false, error:'NO_TOKEN', rule }, 401);
    const ok = checkAdmin(addr, env);
    return json(env, ok ? { ok:true, addr, rule } : { ok:false, error:'NOT_ADMIN', addr, rule }, ok ? 200 : 403);
  }

  // ========== Auth ==========
  if ((req.method === 'POST' || req.method === 'GET') && path === '/auth/challenge'){
    const body = req.method === 'POST' ? await readJSON(req) : {};
    const addr = String(body.address || body.addr || '').toLowerCase();
    const nonce = randomHex(8);
    const message = [
      'Login to Admin',
      `Nonce: ${nonce}`,
      addr ? `Address: ${addr}` : '',
      body?.domain ? `Domain: ${body.domain}` : '',
      (body?.chainId !== undefined) ? `ChainId: ${body.chainId}` : ''
    ].filter(Boolean).join('\n');
    challenges.set(addr || nonce, message);
    return corsify(new Response(JSON.stringify({ ok:true, nonce, message, msg: message }), {
      status:200, headers:{ 'content-type':'application/json', 'set-cookie':`nonce=${nonce}; Max-Age=300; Path=/; SameSite=Lax` }
    }), env);
  }

  if (req.method === 'POST' && path === '/auth/verify'){
    const body = await readJSON(req);
    const address = String(body.address || body.addr || '').toLowerCase();
    const signature = body.signature || body.sig;
    const message = body.message || challenges.get(address) || '';

    if (!address || !signature || !message) return json(env, { ok:false, error:'MISSING_FIELDS' }, 400);

    let recovered;
    try{ recovered = ethers.verifyMessage(message, signature); }
    catch{ return json(env, { ok:false, error:'BAD_SIGNATURE' }, 400); }

    if (String(recovered).toLowerCase() !== address) return json(env, { ok:false, error:'ADDR_MISMATCH' }, 400);

    const token = makeToken(address);
    challenges.delete(address);
    return json(env, { ok:true, token });
  }

  // ========== Admin ==========
  if (req.method === 'POST' && path === '/admin/event-upsert'){
    const addr = readBearerAddr(req);
    const rule = adminRule(env);
    if (!addr) return json(env, { ok:false, error:'NO_TOKEN' }, 401);
    if (!checkAdmin(addr, env)) return json(env, { ok:false, error:'NOT_ADMIN', addr, rule }, 403);

    const body = await readJSON(req);
    const slug = String(body.slug || body.title || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    const title = String(body.title || '').trim();
    const start_ts = Number(body.start_ts || 0) || null;
    const end_ts   = Number(body.end_ts   || 0) || null;
    const location = String(body.location || '').trim() || null;
    if (!slug || !title) return json(env, { ok:false, error:'slug_title_required' }, 400);

    // 根据 schema 分支：老表 or 新表
    if (await isEventsLegacy(env)) {
      // 老表：events(slug TEXT, name TEXT, weight INTEGER, capacity INTEGER, ...)
      // 先 UPDATE，若未命中再 INSERT（避免依赖 slug 上的 UNIQUE 约束）
      const r1 = await d1Run(env, `UPDATE events SET name=? WHERE slug=?`, [title, slug]);
      const changed = (r1.meta && r1.meta.changes) ? r1.meta.changes : 0;
      if (!changed) {
        await d1Run(env, `INSERT INTO events (slug, name, weight, capacity) VALUES (?, ?, ?, NULL)`, [slug, title, 100]);
      }
    } else {
      // 新表：events(id TEXT PRIMARY KEY, name TEXT, start_ts INTEGER, end_ts INTEGER, location TEXT, created_at INTEGER)
      await d1Run(env, `
        INSERT INTO events (id, name, start_ts, end_ts, location, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name,
          start_ts=excluded.start_ts,
          end_ts=excluded.end_ts,
          location=excluded.location
      `, [slug, title, start_ts, end_ts, location, Date.now()]);
    }

    const static_code = await genStaticCode(env, slug);
    return json(env, { ok:true, static_code, slug });
  }

  if (req.method === 'GET' && path === '/admin/event-code'){
    const addr = readBearerAddr(req);
    const rule = adminRule(env);
    if (!addr) return json(env, { ok:false, error:'NO_TOKEN' }, 401);
    if (!checkAdmin(addr, env)) return json(env, { ok:false, error:'NOT_ADMIN', addr, rule }, 403);

    const slug = url.searchParams.get('event_slug') || url.searchParams.get('id') || '';
    if (!slug) return json(env, { ok:false, error:'event_slug_required' }, 400);

    const static_code = await genStaticCode(env, slug);
    return json(env, { ok:true, event_slug: slug, static_code });
  }

  // ========== User ==========
  if (req.method === 'POST' && path === '/poap/checkin'){
    const body = await readJSON(req);
    const slug   = String(body.event_slug || body.eventId || body.slug || '').trim();
    const wallet = String(body.wallet || body.address || '').toLowerCase();
    const code   = String(body.code || body.nonce || '').toUpperCase();
    if (!slug || !wallet) return json(env, { ok:false, error:'MISSING_FIELDS' }, 400);

    // 事件是否存在（兼容新老结构）
    let exists = false;
    if (await isEventsLegacy(env)) {
      const ev = (await d1All(env, `SELECT slug FROM events WHERE slug=? LIMIT 1`, [slug]))[0];
      exists = !!ev;
    } else {
      const ev = (await d1All(env, `SELECT id FROM events WHERE id=? LIMIT 1`, [slug]))[0];
      exists = !!ev;
    }
    if (!exists) return json(env, { ok:false, error:'EVENT_NOT_FOUND' }, 404);

    if (code){
      const expect = await genStaticCode(env, slug);
      if (expect !== code) return json(env, { ok:false, error:'BAD_CODE' }, 400);
    }

    // checkins 表字段名兼容
    const evCol = await checkinsUsesEventSlug(env); // 'event_slug' or 'event_id'
    const sql = `INSERT INTO checkins (${evCol}, wallet, token_id, ts, sig) VALUES (?, ?, NULL, ?, NULL)`;
    try{
      await d1Run(env, sql, [slug, wallet, Date.now()]);
    }catch{}

    return json(env, { ok:true, duplicated:false, event_slug: slug });
  }

  return json(env, { ok:false, error:'NOT_FOUND', path: url.pathname }, 404);
}

/* -------------------- export (global try/catch for CORS on errors) -------------------- */
export default {
  async fetch(req, env){
    try{
      return await handle(req, env);
    }catch(e){
      const msg = (e && e.message) ? e.message : String(e);
      return corsify(new Response(JSON.stringify({ ok:false, error:'INTERNAL', message: msg }), {
        status: 500,
        headers: { 'content-type':'application/json' }
      }), env);
    }
  }
};