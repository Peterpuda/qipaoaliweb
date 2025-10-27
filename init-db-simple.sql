-- 简化版数据库初始化脚本
-- 只包含必需的表

-- 1. 签到表
CREATE TABLE IF NOT EXISTS checkins (
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
);

-- 2. 会员表
CREATE TABLE IF NOT EXISTS members (
  wallet TEXT PRIMARY KEY,
  nickname TEXT,
  avatar TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 3. 奖励表
CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet TEXT NOT NULL,
  type TEXT NOT NULL,
  points INTEGER NOT NULL,
  meta TEXT,
  ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 4. 订单表
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT NOT NULL,
  wallet TEXT NOT NULL,
  product_id TEXT NOT NULL,
  amount_wei TEXT NOT NULL,
  chain TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  UNIQUE(order_no)
);

-- 5. 徽章发行表
CREATE TABLE IF NOT EXISTS badges_issues (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  buyer_wallet TEXT NOT NULL,
  token_id TEXT NOT NULL,
  contract_addr TEXT NOT NULL,
  sig_payload TEXT,
  claimed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 6. 商品表
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title_zh TEXT NOT NULL,
  title_en TEXT,
  desc_md TEXT,
  price_native TEXT NOT NULL,
  price_currency TEXT NOT NULL,
  artisan_id TEXT,
  stock INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  badge_token_id TEXT,
  badge_contract TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 7. 匠人表
CREATE TABLE IF NOT EXISTS artisans (
  id TEXT PRIMARY KEY,
  name_zh TEXT NOT NULL,
  name_en TEXT,
  bio TEXT,
  region TEXT,
  verified INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 8. 物流信息表（加密存储）
CREATE TABLE IF NOT EXISTS shipping_info (
  order_id TEXT PRIMARY KEY,
  encrypted_data TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_checkins_event_id ON checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_checkins_wallet ON checkins(wallet);
CREATE INDEX IF NOT EXISTS idx_rewards_wallet ON rewards(wallet);
CREATE INDEX IF NOT EXISTS idx_orders_wallet ON orders(wallet);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_badges_order_id ON badges_issues(order_id);
CREATE INDEX IF NOT EXISTS idx_badges_wallet ON badges_issues(buyer_wallet);
CREATE INDEX IF NOT EXISTS idx_products_artisan ON products(artisan_id);
