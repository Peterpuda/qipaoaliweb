
-- D1 schema for Songbrocade Phase 2
CREATE TABLE IF NOT EXISTS members (
  wallet TEXT PRIMARY KEY,
  nickname TEXT,
  avatar TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS workshops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  custodian TEXT,
  wallet TEXT,
  jurisdiction TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  wallet TEXT NOT NULL,
  token_id INTEGER,
  ts INTEGER NOT NULL,
  sig TEXT,
  UNIQUE(event_id, wallet)
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_ts INTEGER NOT NULL,
  end_ts INTEGER NOT NULL,
  location TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS nonces (
  nonce TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet TEXT NOT NULL,
  type TEXT NOT NULL,
  points INTEGER NOT NULL,
  meta TEXT,
  ts INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT NOT NULL,
  wallet TEXT NOT NULL,
  product_id TEXT NOT NULL,
  amount_wei TEXT NOT NULL,
  chain TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(order_no)
);
