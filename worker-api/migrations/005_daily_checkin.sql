-- 005: 支持每日签到功能
-- 移除旧的唯一约束，添加每日签到支持

-- 1. 删除旧的 checkins 表的唯一约束（创建新表来替代）
DROP INDEX IF EXISTS idx_checkins_event_wallet;

-- 2. 为 checkins 表添加日期字段索引
CREATE INDEX IF NOT EXISTS idx_checkins_daily 
ON checkins(event_id, wallet, DATE(created_at));

-- 3. 修改 airdrop_eligible 表，支持累加代币
-- 添加签到次数字段
ALTER TABLE airdrop_eligible ADD COLUMN checkin_count INTEGER DEFAULT 0;
ALTER TABLE airdrop_eligible ADD COLUMN last_checkin_date TEXT;

-- 4. 创建每日签到统计视图
CREATE VIEW IF NOT EXISTS daily_checkin_stats AS
SELECT 
  event_id,
  wallet,
  DATE(created_at) as checkin_date,
  COUNT(*) as daily_count,
  MIN(created_at) as first_checkin_time
FROM checkins
GROUP BY event_id, wallet, DATE(created_at);

