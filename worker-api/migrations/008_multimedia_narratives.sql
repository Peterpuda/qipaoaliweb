-- 多媒体文化叙事扩展
-- 为 content_variants 表添加音频和视频支持

-- 添加音频相关字段
ALTER TABLE content_variants ADD COLUMN audio_key TEXT;
ALTER TABLE content_variants ADD COLUMN audio_url TEXT;
ALTER TABLE content_variants ADD COLUMN audio_duration INTEGER DEFAULT 0;
ALTER TABLE content_variants ADD COLUMN audio_size INTEGER DEFAULT 0;

-- 添加视频相关字段
ALTER TABLE content_variants ADD COLUMN video_key TEXT;
ALTER TABLE content_variants ADD COLUMN video_url TEXT;
ALTER TABLE content_variants ADD COLUMN video_duration INTEGER DEFAULT 0;
ALTER TABLE content_variants ADD COLUMN video_size INTEGER DEFAULT 0;
ALTER TABLE content_variants ADD COLUMN video_thumbnail TEXT;

-- 添加生成状态跟踪
ALTER TABLE content_variants ADD COLUMN generation_status TEXT DEFAULT 'pending';
ALTER TABLE content_variants ADD COLUMN generation_progress TEXT;

-- 添加互动统计字段（如果不存在）
-- view_count 和 like_count 已在之前的 schema 中存在，这里确保它们存在
CREATE INDEX IF NOT EXISTS idx_content_variants_generation_status 
  ON content_variants(generation_status);

-- 注释
-- generation_status: pending/text_only/processing/completed/failed
-- generation_progress: JSON 格式，记录各个格式的生成进度
-- {
--   "text": {"status": "completed", "time": 1234567890},
--   "audio": {"status": "completed", "time": 1234567895, "size": 524288},
--   "video": {"status": "processing", "progress": 45, "eta": 120}
-- }

