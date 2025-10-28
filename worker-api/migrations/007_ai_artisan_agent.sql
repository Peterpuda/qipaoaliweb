-- 007: AI 匠人智能体功能 - 数据库架构
-- 创建日期: 2025-10-28
-- 功能: 支持匠人 AI 人格设定、文化叙事生成、对话日志

-- 1. 匠人 AI 人格设定表
CREATE TABLE IF NOT EXISTS artisan_voice (
  id TEXT PRIMARY KEY,
  artisan_id TEXT NOT NULL UNIQUE,
  
  -- 语气风格
  tone_style TEXT DEFAULT 'warm',  -- warm/professional/passionate/humble
  
  -- 自我介绍（多语言）
  self_intro_zh TEXT,
  self_intro_en TEXT,
  
  -- 核心设定
  core_values TEXT,           -- 核心价值观
  cultural_lineage TEXT,      -- 文化传承背景
  forbidden_topics TEXT,      -- 禁止话题（JSON 数组）
  
  -- 对话样例（用于 few-shot learning）
  examples TEXT,              -- JSON: [{q:"", a:""}]
  
  -- AI 模型配置
  model_config TEXT,          -- JSON: {model, temperature, max_tokens}
  
  -- 状态
  enabled INTEGER DEFAULT 1,  -- 是否启用 AI
  
  -- 时间戳
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  
  -- 外键约束
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE
);

-- 2. 文化叙事内容表
CREATE TABLE IF NOT EXISTS content_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  
  -- 内容类型
  type TEXT NOT NULL,         -- story/feature/heritage/usage/narrative_package
  
  -- 内容（JSON 格式）
  content_json TEXT NOT NULL,
  
  -- 语言
  lang TEXT NOT NULL DEFAULT 'zh',  -- zh/en/ja/ko
  
  -- 状态
  status TEXT DEFAULT 'draft',      -- draft/published/archived
  
  -- 审核信息
  created_by TEXT,            -- 创建者钱包地址
  reviewed_by TEXT,           -- 审核者钱包地址
  review_notes TEXT,          -- 审核备注
  
  -- 版本控制
  version INTEGER DEFAULT 1,
  parent_id TEXT,             -- 父版本 ID
  
  -- 统计
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  -- 时间戳
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  published_at INTEGER,
  
  -- 外键约束
  FOREIGN KEY (product_id) REFERENCES products_new(id) ON DELETE CASCADE
);

-- 3. AI 对话日志表
CREATE TABLE IF NOT EXISTS artisan_agent_logs (
  id TEXT PRIMARY KEY,
  artisan_id TEXT NOT NULL,
  
  -- 用户信息（可选，用于分析）
  user_id TEXT,               -- 用户标识（钱包地址或匿名 ID）
  session_id TEXT,            -- 会话 ID
  
  -- 对话内容
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'zh',
  
  -- 上下文信息
  context_json TEXT,          -- 对话上下文（JSON）
  
  -- AI 模型信息
  model_used TEXT,            -- 使用的模型名称
  tokens_used INTEGER,        -- 消耗的 token 数
  response_time_ms INTEGER,   -- 响应时间（毫秒）
  
  -- 内容审核
  flagged INTEGER DEFAULT 0,  -- 是否被标记
  flag_reason TEXT,           -- 标记原因
  flag_type TEXT,             -- 标记类型: sensitive/spam/inappropriate
  reviewed INTEGER DEFAULT 0, -- 是否已审核
  
  -- 用户反馈
  user_feedback TEXT,         -- helpful/not_helpful/inappropriate
  feedback_note TEXT,
  
  -- 时间戳
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 4. AI 内容审核队列表（可选）
CREATE TABLE IF NOT EXISTS ai_moderation_queue (
  id TEXT PRIMARY KEY,
  
  -- 内容来源
  source_type TEXT NOT NULL,  -- chat_log/narrative/other
  source_id TEXT NOT NULL,    -- 对应记录的 ID
  
  -- 审核状态
  status TEXT DEFAULT 'pending',  -- pending/approved/rejected
  priority INTEGER DEFAULT 0,     -- 优先级
  
  -- 审核信息
  reviewed_by TEXT,
  review_result TEXT,
  review_notes TEXT,
  
  -- 时间戳
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  reviewed_at INTEGER
);

-- ============================================
-- 索引优化
-- ============================================

-- artisan_voice 索引
CREATE INDEX IF NOT EXISTS idx_artisan_voice_artisan 
  ON artisan_voice(artisan_id);
CREATE INDEX IF NOT EXISTS idx_artisan_voice_enabled 
  ON artisan_voice(enabled);

-- content_variants 索引
CREATE INDEX IF NOT EXISTS idx_content_variants_product 
  ON content_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_content_variants_type 
  ON content_variants(type);
CREATE INDEX IF NOT EXISTS idx_content_variants_lang 
  ON content_variants(lang);
CREATE INDEX IF NOT EXISTS idx_content_variants_status 
  ON content_variants(status);
CREATE INDEX IF NOT EXISTS idx_content_variants_created 
  ON content_variants(created_at DESC);

-- artisan_agent_logs 索引
CREATE INDEX IF NOT EXISTS idx_agent_logs_artisan 
  ON artisan_agent_logs(artisan_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_user 
  ON artisan_agent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_session 
  ON artisan_agent_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_flagged 
  ON artisan_agent_logs(flagged);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created 
  ON artisan_agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_lang 
  ON artisan_agent_logs(lang);

-- ai_moderation_queue 索引
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status 
  ON ai_moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority 
  ON ai_moderation_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_source 
  ON ai_moderation_queue(source_type, source_id);

-- ============================================
-- 初始化默认数据（可选）
-- ============================================

-- 插入一个示例配置（如果需要的话）
-- INSERT INTO artisan_voice (id, artisan_id, tone_style, self_intro_zh, enabled)
-- SELECT 
--   'av_' || lower(hex(randomblob(8))),
--   id,
--   'warm',
--   '我是一名传统匠人，专注于非遗技艺的传承与创新。',
--   0
-- FROM artisans
-- WHERE NOT EXISTS (SELECT 1 FROM artisan_voice WHERE artisan_id = artisans.id);

