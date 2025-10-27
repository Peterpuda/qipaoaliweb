-- 003_rewards.sql
-- Sprint-2: 奖励批次与分配（离线可用版）

-- 奖励批次
CREATE TABLE IF NOT EXISTS reward_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT UNIQUE NOT NULL,
  from_ts INTEGER NOT NULL,
  to_ts INTEGER NOT NULL,
  unit INTEGER NOT NULL,                -- 每积分对应的奖励单位，例如 100
  merkle_root TEXT NOT NULL,            -- SHA-256 简易根
  total_points INTEGER NOT NULL,
  total_addresses INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reward_batches_batch_id ON reward_batches(batch_id);

-- 批次内的分配清单
CREATE TABLE IF NOT EXISTS reward_allocations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT NOT NULL,
  wallet TEXT NOT NULL,
  points INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  leaf TEXT NOT NULL,                   -- 该钱包的叶子哈希
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reward_alloc_batch_wallet ON reward_allocations(batch_id, wallet);

-- 领取记录（预留，当前为离线可用版）
CREATE TABLE IF NOT EXISTS reward_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT NOT NULL,
  wallet TEXT NOT NULL,
  claimed_at INTEGER NOT NULL,
  tx_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_reward_claims_batch_wallet ON reward_claims(batch_id, wallet);