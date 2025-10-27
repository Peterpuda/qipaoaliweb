// worker-api/utils/db.js
// D1 schema 初始化 + 在线迁移：逐条 prepare/run，且自动补齐缺失列

// --- 基础建表语句（合并后的完整结构） ---
const STMT_CREATE = [
  // 事件表（合并版本）
  `CREATE TABLE IF NOT EXISTS events (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     start_at TEXT,
     end_at TEXT,
     start_ts INTEGER,
     end_ts INTEGER,
     location TEXT,
     poap_contract TEXT,
     chain_id INTEGER,
     created_by TEXT,
     created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
   )`,

  // 签到表（合并版本）
  `CREATE TABLE IF NOT EXISTS checkins (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     event_id TEXT NOT NULL,
     wallet TEXT NOT NULL,
     code TEXT,
     token_id INTEGER,
     ts INTEGER NOT NULL,
     sig TEXT,
     tx_hash TEXT,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(event_id, wallet)
   )`,

  // 会员表
  `CREATE TABLE IF NOT EXISTS members (
     wallet TEXT PRIMARY KEY,
     nickname TEXT,
     avatar TEXT,
     created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
   )`,

  // 工坊表
  `CREATE TABLE IF NOT EXISTS workshops (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     custodian TEXT,
     wallet TEXT,
     jurisdiction TEXT,
     created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
   )`,

  // 签到码表
  `CREATE TABLE IF NOT EXISTS checkin_tokens (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     event_id TEXT,
     code TEXT,
     nonce TEXT,
     expires_at TEXT,
     used INTEGER DEFAULT 0
   )`,

  // 随机数表
  `CREATE TABLE IF NOT EXISTS nonces (
     nonce TEXT PRIMARY KEY,
     event_id TEXT NOT NULL,
     used INTEGER DEFAULT 0,
     created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
   )`,

  // 奖励表
  `CREATE TABLE IF NOT EXISTS rewards (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     wallet TEXT NOT NULL,
     type TEXT NOT NULL,
     points INTEGER NOT NULL,
     meta TEXT,
     ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
   )`,

  // 订单表（扩展：qty、shipping_enc、updated_at）
  `CREATE TABLE IF NOT EXISTS orders (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     order_no TEXT NOT NULL,
     wallet TEXT NOT NULL,
     product_id TEXT NOT NULL,
     qty INTEGER NOT NULL DEFAULT 1,
     shipping_enc TEXT,
     amount_wei TEXT NOT NULL,
     chain TEXT NOT NULL,
     tx_hash TEXT,
     status TEXT NOT NULL,
     created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
     updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
     UNIQUE(order_no)
   )`,

  // 审计日志表
  `CREATE TABLE IF NOT EXISTS audit_logs (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     ts DATETIME DEFAULT CURRENT_TIMESTAMP,
     actor TEXT,
     action TEXT,
     target TEXT,
     meta_json TEXT,
     tx_hash TEXT
   )`,

  // 传承人表
  `CREATE TABLE IF NOT EXISTS artisans (
     id TEXT PRIMARY KEY,
     wallet TEXT NOT NULL,
     name_zh TEXT NOT NULL,
     name_en TEXT,
     bio TEXT,
     region TEXT,
     verified INTEGER DEFAULT 0,
     created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
     updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
   )`,

  // 商品表
  `CREATE TABLE IF NOT EXISTS products_new (
     id TEXT PRIMARY KEY,
     artisan_id TEXT NOT NULL,
     slug TEXT NOT NULL,
     title_zh TEXT NOT NULL,
     title_en TEXT,
     desc_md TEXT,
     image_key TEXT,
     price_native REAL NOT NULL,
     price_currency TEXT NOT NULL,
     price_points INTEGER DEFAULT 0,
     stock INTEGER DEFAULT 0,
     badge_contract TEXT,
     created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
     updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
   )`,

  // 徽章发行表
  `CREATE TABLE IF NOT EXISTS badges_issues (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    buyer_wallet TEXT NOT NULL,
    token_id TEXT NOT NULL,
    contract_addr TEXT NOT NULL,
    sig_payload TEXT,
    claimed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,

  // 空投资格表
  `CREATE TABLE IF NOT EXISTS airdrop_eligible (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet TEXT NOT NULL,
    event_id TEXT NOT NULL,
    amount TEXT NOT NULL,
    item_index INTEGER,
    proof TEXT,
    claimed INTEGER DEFAULT 0,
    merkle_batch TEXT,
    token_tx_hash TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    UNIQUE(wallet, event_id)
  )`,

  // Merkle 批次表
  `CREATE TABLE IF NOT EXISTS merkle_batches (
    batch_id TEXT PRIMARY KEY,
    merkle_root TEXT NOT NULL,
    distributor_address TEXT NOT NULL,
    total_amount TEXT NOT NULL,
    claim_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  )`
];

// --- 需要补齐的列定义（老表缺少时自动 ADD COLUMN） ---
const COLUMN_PATCHES = {
  events: [
    // 列名, SQL 片段（含类型/默认值/约束）
    ['start_at', 'TEXT'],
    ['end_at', 'TEXT'],
    ['start_ts', 'INTEGER'],
    ['end_ts', 'INTEGER'],
    ['location', 'TEXT'],
    ['poap_contract', 'TEXT'],
    ['chain_id', 'INTEGER'],
    ['created_by', 'TEXT'],
    ['created_at', 'INTEGER NOT NULL DEFAULT (strftime(\'%s\', \'now\'))'],
  ],
  checkins: [
    ['code', 'TEXT'],
    ['tx_hash', 'TEXT'],
    ['created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
  members: [
    // 新表，无需补列
  ],
  workshops: [
    // 新表，无需补列
  ],
  checkin_tokens: [
    // 新表，无需补列
  ],
  nonces: [
    ['created_at', 'INTEGER NOT NULL DEFAULT (strftime(\'%s\', \'now\'))'],
  ],
  rewards: [
    ['ts', 'INTEGER NOT NULL DEFAULT (strftime(\'%s\', \'now\'))'],
  ],
  orders: [
    ['product_id',   'TEXT NOT NULL'],
    ['qty',          'INTEGER NOT NULL DEFAULT 1'],
    ['shipping_enc', 'TEXT'],
    ['amount_wei',   'TEXT NOT NULL'],
    ['chain',        'TEXT NOT NULL'],
    ['tx_hash',      'TEXT'],
    ['status',       'TEXT NOT NULL DEFAULT \'pending\''],
    ['created_at',   'INTEGER NOT NULL DEFAULT (strftime(\'%s\', \'now\'))'],
    ['updated_at',   'INTEGER NOT NULL DEFAULT (strftime(\'%s\', \'now\'))'],
  ],
  audit_logs: [
    // 新表，无需补列
  ],
  artisans: [
    // 新表，无需补列
  ],
  products_new: [
    // 新表，无需补列
  ],
  badges_issues: [
    // 新表，无需补列
  ]
};

// --- 索引（没有就创建） ---
const STMT_INDEX = [
  // 事件表索引
  `CREATE INDEX IF NOT EXISTS idx_events_name ON events(name)`,
  `CREATE INDEX IF NOT EXISTS idx_events_start_ts ON events(start_ts)`,
  `CREATE INDEX IF NOT EXISTS idx_events_end_ts ON events(end_ts)`,
  
  // 签到表索引
  `CREATE INDEX IF NOT EXISTS idx_checkins_event_id ON checkins(event_id)`,
  `CREATE INDEX IF NOT EXISTS idx_checkins_wallet ON checkins(wallet)`,
  `CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON checkins(created_at)`,
  
  // 会员表索引
  `CREATE INDEX IF NOT EXISTS idx_members_wallet ON members(wallet)`,
  
  // 工坊表索引
  `CREATE INDEX IF NOT EXISTS idx_workshops_name ON workshops(name)`,
  `CREATE INDEX IF NOT EXISTS idx_workshops_custodian ON workshops(custodian)`,
  
  // 签到码表索引
  `CREATE INDEX IF NOT EXISTS idx_checkin_tokens_event_id ON checkin_tokens(event_id)`,
  `CREATE INDEX IF NOT EXISTS idx_checkin_tokens_code ON checkin_tokens(code)`,
  
  // 随机数表索引
  `CREATE INDEX IF NOT EXISTS idx_nonces_event_id ON nonces(event_id)`,
  
  // 奖励表索引
  `CREATE INDEX IF NOT EXISTS idx_rewards_wallet ON rewards(wallet)`,
  `CREATE INDEX IF NOT EXISTS idx_rewards_type ON rewards(type)`,
  `CREATE INDEX IF NOT EXISTS idx_rewards_ts ON rewards(ts)`,
  
  // 订单表索引
  `CREATE INDEX IF NOT EXISTS idx_orders_wallet ON orders(wallet)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`,
  
  // 审计日志表索引
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_ts ON audit_logs(ts)`,

  // 传承人表索引
  `CREATE INDEX IF NOT EXISTS idx_artisans_wallet ON artisans(wallet)`,
  `CREATE INDEX IF NOT EXISTS idx_artisans_verified ON artisans(verified)`,
  `CREATE INDEX IF NOT EXISTS idx_artisans_updated_at ON artisans(updated_at)`,

  // 商品表索引
  `CREATE INDEX IF NOT EXISTS idx_products_artisan_id ON products_new(artisan_id)`,
  `CREATE INDEX IF NOT EXISTS idx_products_slug ON products_new(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products_new(updated_at)`,

  // 徽章发行表索引
  `CREATE INDEX IF NOT EXISTS idx_badges_order_id ON badges_issues(order_id)`,
  `CREATE INDEX IF NOT EXISTS idx_badges_wallet ON badges_issues(buyer_wallet)`,
  `CREATE INDEX IF NOT EXISTS idx_badges_claimed ON badges_issues(claimed)`,

  // 空投资格表索引
  `CREATE INDEX IF NOT EXISTS idx_airdrop_wallet ON airdrop_eligible(wallet)`,
  `CREATE INDEX IF NOT EXISTS idx_airdrop_event_id ON airdrop_eligible(event_id)`,
  `CREATE INDEX IF NOT EXISTS idx_airdrop_claimed ON airdrop_eligible(claimed)`,
  `CREATE INDEX IF NOT EXISTS idx_airdrop_batch ON airdrop_eligible(merkle_batch)`,

  // Merkle 批次表索引
  `CREATE INDEX IF NOT EXISTS idx_merkle_batches_root ON merkle_batches(merkle_root)`,
  `CREATE INDEX IF NOT EXISTS idx_merkle_batches_distributor ON merkle_batches(distributor_address)`
];

async function tableInfo(env, table) {
  const { results } = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
  // 结果包含：cid, name, type, notnull, dflt_value, pk
  return results || [];
}

async function columnExists(env, table, col) {
  const info = await tableInfo(env, table);
  return info.some(r => (r.name || r.NAME) === col);
}

async function addColumn(env, table, col, def) {
  // SQLite 允许直接 ADD COLUMN；无 IF NOT EXISTS，所以需要先检查
  await env.DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`).run();
}

export async function ensureSchema(env) {
  const db = env.DB;
  if (!db) throw new Error('D1 binding "DB" missing');

  const applied = {
    createdTables: 0,
    addedColumns: []
  };

  // 1) 若不存在则创建基础表
  for (const sql of STMT_CREATE) {
    await db.prepare(sql).run();
    applied.createdTables++;
  }

  // 2) 对已存在的表，按需补列（迁移）
  for (const [table, defs] of Object.entries(COLUMN_PATCHES)) {
    for (const [col, def] of defs) {
      const has = await columnExists(env, table, col);
      if (!has) {
        await addColumn(env, table, col, def);
        applied.addedColumns.push(`${table}.${col}`);
      }
    }
  }

  // 3) 索引（没有就创建）
  for (const sql of STMT_INDEX) {
    await db.prepare(sql).run();
  }

  return { ok: true, applied };
}

// 便捷查询
export async function query(env, sql, params = []) {
  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return results;
}

// 写入/更新/删除
export async function run(env, sql, params = []) {
  const res = await env.DB.prepare(sql).bind(...params).run();
  return res;
}