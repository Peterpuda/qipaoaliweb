-- 006: 移除签到表的唯一约束，支持无限次签到
-- 允许同一个钱包地址对同一活动多次签到

-- 1. 删除唯一约束索引（如果存在）
DROP INDEX IF EXISTS idx_checkins_event_wallet;

-- 2. 由于 SQLite 不支持直接删除表约束，我们需要重建表
-- 创建新的临时表（无唯一约束）
CREATE TABLE IF NOT EXISTS checkins_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  wallet TEXT NOT NULL,
  code TEXT,
  token_id INTEGER,
  ts INTEGER NOT NULL,
  sig TEXT,
  tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 复制数据到新表
INSERT INTO checkins_new (id, event_id, wallet, code, token_id, ts, sig, tx_hash, created_at)
SELECT id, event_id, wallet, code, token_id, ts, sig, tx_hash, created_at
FROM checkins;

-- 4. 删除旧表
DROP TABLE IF EXISTS checkins;

-- 5. 重命名新表
ALTER TABLE checkins_new RENAME TO checkins;

-- 6. 创建索引以提高查询性能（但不是唯一索引）
CREATE INDEX IF NOT EXISTS idx_checkins_event_wallet_time 
ON checkins(event_id, wallet, created_at DESC);

-- 7. 创建事件索引
CREATE INDEX IF NOT EXISTS idx_checkins_event 
ON checkins(event_id);

-- 8. 创建钱包索引
CREATE INDEX IF NOT EXISTS idx_checkins_wallet 
ON checkins(wallet);

