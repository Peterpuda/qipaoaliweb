-- D1 schema for POAP/签到
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT,
  start_at TEXT,
  end_at TEXT,
  poap_contract TEXT,
  chain_id INTEGER,
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS checkin_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT,
  code TEXT,
  nonce TEXT,
  expires_at TEXT,
  used INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT,
  wallet TEXT,
  code TEXT,
  tx_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP,
  actor TEXT,
  action TEXT,
  target TEXT,
  meta_json TEXT,
  tx_hash TEXT
);
