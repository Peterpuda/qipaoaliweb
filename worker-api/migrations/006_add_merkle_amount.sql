-- 006: 添加 merkle_amount 字段用于记录生成 Merkle Tree 时的快照金额

-- 1. 添加 merkle_amount 字段（用于合约验证）
ALTER TABLE airdrop_eligible ADD COLUMN merkle_amount TEXT DEFAULT NULL;

-- 2. 更新现有数据：将当前 item_index 不为空的记录设置 merkle_amount
-- 这些是已经生成过 Merkle Tree 的记录
UPDATE airdrop_eligible 
SET merkle_amount = '1000000000000000000000'
WHERE item_index IS NOT NULL AND merkle_amount IS NULL;

-- 3. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_airdrop_eligible_merkle 
ON airdrop_eligible(event_id, wallet, merkle_amount);

