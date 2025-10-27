PRAGMA foreign_keys = OFF;

-- 临时备份旧 events 表（若存在）
DROP TABLE IF EXISTS events_bak;
CREATE TABLE IF NOT EXISTS events_bak AS SELECT * FROM events;

-- 删除原有表
DROP TABLE IF EXISTS events;

-- 创建新的正确结构
CREATE TABLE events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  location      TEXT,
  start_time    TEXT,
  poap_contract TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 从备份写回原有数据（旧表中没有 slug，因此用 name 派生）
INSERT INTO events (slug, name, location, start_time, poap_contract, created_at)
SELECT
  lower(replace(name, ' ', '-')) AS slug,
  name,
  location,
  start_time,
  poap_contract,
  COALESCE(created_at, datetime('now'))
FROM events_bak
WHERE name IS NOT NULL
  AND poap_contract IS NOT NULL;

-- 删除临时备份
DROP TABLE IF EXISTS events_bak;

PRAGMA foreign_keys = ON;

-- 建索引
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug);