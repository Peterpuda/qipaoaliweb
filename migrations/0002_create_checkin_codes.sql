-- 签到码存储表
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS checkin_codes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event_slug  TEXT NOT NULL,           -- 与 events.slug 对应（不强约束，便于兼容历史 eventId）
  code        TEXT NOT NULL,
  expires_at  TEXT NOT NULL,           -- ISO 字符串
  used_by     TEXT,                    -- 钱包地址（小写）
  used_at     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_codes_event ON checkin_codes(event_slug);
CREATE INDEX IF NOT EXISTS idx_codes_code  ON checkin_codes(code);