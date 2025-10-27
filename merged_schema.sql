-- 合并后的数据库结构 - Songbrocade 旗袍会投票空投系统
-- 整合了 db/schema.sql 和 d1/schema.sql 的所有表结构

-- ========== 核心业务表 ==========

-- 事件表（合并了两个版本的字段）
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  -- 时间字段（支持两种格式）
  start_at TEXT,           -- 旧格式：文本时间
  end_at TEXT,             -- 旧格式：文本时间
  start_ts INTEGER,        -- 新格式：时间戳
  end_ts INTEGER,          -- 新格式：时间戳
  -- 位置和合约信息
  location TEXT,
  poap_contract TEXT,
  chain_id INTEGER,
  created_by TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 签到表（合并了两个版本的字段）
CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  wallet TEXT NOT NULL,
  -- 签到相关字段
  code TEXT,               -- 签到码
  token_id INTEGER,        -- POAP token ID
  ts INTEGER NOT NULL,     -- 签到时间戳
  sig TEXT,                -- 签名
  tx_hash TEXT,            -- 交易哈希
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, wallet)
);

-- ========== 用户和社区管理 ==========

-- 会员表
CREATE TABLE IF NOT EXISTS members (
  wallet TEXT PRIMARY KEY,
  nickname TEXT,
  avatar TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 工坊表
CREATE TABLE IF NOT EXISTS workshops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  custodian TEXT,
  wallet TEXT,
  jurisdiction TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- ========== 签到码和验证 ==========

-- 签到码表（来自旧版本）
CREATE TABLE IF NOT EXISTS checkin_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT,
  code TEXT,
  nonce TEXT,
  expires_at TEXT,
  used INTEGER DEFAULT 0
);

-- 随机数表（来自新版本）
CREATE TABLE IF NOT EXISTS nonces (
  nonce TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- ========== 奖励和积分系统 ==========

-- 奖励表
CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet TEXT NOT NULL,
  type TEXT NOT NULL,
  points INTEGER NOT NULL,
  meta TEXT,
  ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- ========== 订单和支付 ==========

-- 订单表
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

-- ========== 审计和日志 ==========

-- 审计日志表（来自旧版本）
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP,
  actor TEXT,
  action TEXT,
  target TEXT,
  meta_json TEXT,
  tx_hash TEXT
);

-- ========== 索引优化 ==========

-- 事件表索引
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
CREATE INDEX IF NOT EXISTS idx_events_start_ts ON events(start_ts);
CREATE INDEX IF NOT EXISTS idx_events_end_ts ON events(end_ts);

-- 签到表索引
CREATE INDEX IF NOT EXISTS idx_checkins_event_id ON checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_checkins_wallet ON checkins(wallet);
CREATE INDEX IF NOT EXISTS idx_checkins_ts ON checkins(ts);

-- 会员表索引
CREATE INDEX IF NOT EXISTS idx_members_wallet ON members(wallet);

-- 工坊表索引
CREATE INDEX IF NOT EXISTS idx_workshops_name ON workshops(name);
CREATE INDEX IF NOT EXISTS idx_workshops_custodian ON workshops(custodian);

-- 签到码表索引
CREATE INDEX IF NOT EXISTS idx_checkin_tokens_event_id ON checkin_tokens(event_id);
CREATE INDEX IF NOT EXISTS idx_checkin_tokens_code ON checkin_tokens(code);

-- 随机数表索引
CREATE INDEX IF NOT EXISTS idx_nonces_event_id ON nonces(event_id);

-- 奖励表索引
CREATE INDEX IF NOT EXISTS idx_rewards_wallet ON rewards(wallet);
CREATE INDEX IF NOT EXISTS idx_rewards_type ON rewards(type);
CREATE INDEX IF NOT EXISTS idx_rewards_ts ON rewards(ts);

-- 订单表索引
CREATE INDEX IF NOT EXISTS idx_orders_wallet ON orders(wallet);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 审计日志表索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ts ON audit_logs(ts);

-- ========== 数据迁移说明 ==========
/*
合并策略说明：

1. events 表：
   - 保留所有字段，支持新旧两种时间格式
   - start_at/end_at (TEXT) 和 start_ts/end_ts (INTEGER) 并存
   - 添加了 poap_contract, chain_id, created_by 字段

2. checkins 表：
   - 合并了所有字段，包括 code, token_id, sig, tx_hash
   - 保持 UNIQUE(event_id, wallet) 约束
   - 支持两种时间格式

3. 新增表：
   - members: 会员管理
   - workshops: 工坊管理
   - rewards: 奖励系统
   - orders: 订单管理

4. 保留表：
   - checkin_tokens: 签到码管理
   - nonces: 随机数验证
   - audit_logs: 审计日志

5. 索引优化：
   - 为所有常用查询字段添加索引
   - 提高查询性能

使用建议：
- 新功能优先使用新字段（如 start_ts/end_ts）
- 旧数据可以逐步迁移到新字段
- 保持向后兼容性
*/






