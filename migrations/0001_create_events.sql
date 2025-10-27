-- migrations/0001_create_events.sql
-- 活动映射：人类可读信息  → 合约 / 事件键
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,                    -- 建议英文短码，如 chengdu-20251208
  name          TEXT NOT NULL,                           -- 活动中文名
  location      TEXT,                                    -- 活动地点
  start_time    TEXT,                                    -- ISO 时间，如 2025-12-08T19:30:00+08:00
  poap_contract TEXT NOT NULL,                           -- POAP 合约地址
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 便于通过 name 模糊查询（可选）
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);