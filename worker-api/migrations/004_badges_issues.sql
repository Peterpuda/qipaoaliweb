-- Migration 004: 徽章发行表
-- 用于管理正品认证徽章的发行和领取

CREATE TABLE IF NOT EXISTS badges_issues (
  id TEXT PRIMARY KEY,          -- uuid
  order_id TEXT NOT NULL,       -- 关联订单
  buyer_wallet TEXT NOT NULL,   -- 谁能领
  token_id TEXT NOT NULL,       -- 徽章在1155合约里的tokenId
  contract_addr TEXT NOT NULL,  -- 哪个合约
  sig_payload TEXT,             -- 我们给前端的签名打包数据(JSON字符串)
  claimed INTEGER DEFAULT 0,    -- 是否已领取(用户成功mint)
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_badges_order_id ON badges_issues(order_id);
CREATE INDEX IF NOT EXISTS idx_badges_wallet ON badges_issues(buyer_wallet);

