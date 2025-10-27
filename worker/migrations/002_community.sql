-- 002_community.sql
-- Sprint-1: members / roles / points_ledger; events add weight/capacity

-- 1) events 扩展（如已存在同名列，忽略错误）
ALTER TABLE events ADD COLUMN weight INTEGER DEFAULT 100;
ALTER TABLE events ADD COLUMN capacity INTEGER;

-- 2) members：钱包绑定与隐私同意（只存哈希，不存明文）
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet TEXT UNIQUE NOT NULL,
  handle TEXT,
  pii_hash TEXT,
  consent_at INTEGER,
  created_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_members_wallet ON members(wallet);

-- 3) roles：权限与范围（可选）
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet TEXT NOT NULL,
  role TEXT NOT NULL,   -- 'organizer' | 'host' | 'volunteer'
  scope TEXT,           -- 城市/分会
  created_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_roles_wallet ON roles(wallet);

-- 4) points_ledger：出席积分流水
CREATE TABLE IF NOT EXISTS points_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet TEXT NOT NULL,
  event_id TEXT NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT,              -- 'attendance' 等
  tx_hash TEXT,             -- 前端铸造成功可回传
  created_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_points_wallet ON points_ledger(wallet);