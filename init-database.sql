-- 初始化数据库脚本
-- 数据库名：qipaoweb3

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS qipaoweb3 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qipaoweb3;

-- 1. events 表
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  start_ts BIGINT NOT NULL,
  end_ts BIGINT NOT NULL,
  location VARCHAR(500),
  created_at BIGINT NOT NULL,
  INDEX idx_start_ts (start_ts),
  INDEX idx_end_ts (end_ts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. checkins 表
CREATE TABLE IF NOT EXISTS checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  wallet VARCHAR(42) NOT NULL,
  code VARCHAR(100),
  token_id INT,
  ts BIGINT NOT NULL,
  sig TEXT,
  tx_hash VARCHAR(66),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_event_wallet (event_id, wallet),
  INDEX idx_event_id (event_id),
  INDEX idx_wallet (wallet),
  INDEX idx_ts (ts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. members 表
CREATE TABLE IF NOT EXISTS members (
  wallet VARCHAR(42) PRIMARY KEY,
  nickname VARCHAR(100),
  avatar VARCHAR(500),
  created_at BIGINT NOT NULL,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. products 表
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  title_zh VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  desc_md TEXT,
  price_native VARCHAR(100) NOT NULL,
  price_currency VARCHAR(20) NOT NULL,
  artisan_id VARCHAR(255),
  stock INT DEFAULT 0,
  sales INT DEFAULT 0,
  badge_token_id VARCHAR(100),
  badge_contract VARCHAR(42),
  created_at BIGINT NOT NULL,
  INDEX idx_artisan_id (artisan_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. artisans 表
CREATE TABLE IF NOT EXISTS artisans (
  id VARCHAR(255) PRIMARY KEY,
  name_zh VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  bio TEXT,
  region VARCHAR(100),
  verified TINYINT DEFAULT 0,
  created_at BIGINT NOT NULL,
  INDEX idx_verified (verified),
  INDEX idx_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. orders 表
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(100) NOT NULL UNIQUE,
  wallet VARCHAR(42) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  amount_wei VARCHAR(100) NOT NULL,
  chain VARCHAR(50) NOT NULL,
  tx_hash VARCHAR(66),
  status VARCHAR(50) NOT NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_wallet (wallet),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. rewards 表
CREATE TABLE IF NOT EXISTS rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wallet VARCHAR(42) NOT NULL,
  type VARCHAR(50) NOT NULL,
  points INT NOT NULL,
  meta TEXT,
  ts BIGINT NOT NULL,
  INDEX idx_wallet (wallet),
  INDEX idx_type (type),
  INDEX idx_ts (ts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. badges_issues 表
CREATE TABLE IF NOT EXISTS badges_issues (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL,
  buyer_wallet VARCHAR(42) NOT NULL,
  token_id VARCHAR(100) NOT NULL,
  contract_addr VARCHAR(42) NOT NULL,
  sig_payload TEXT,
  claimed TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_buyer_wallet (buyer_wallet),
  INDEX idx_claimed (claimed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. shipping_info 表
CREATE TABLE IF NOT EXISTS shipping_info (
  order_id VARCHAR(100) PRIMARY KEY,
  encrypted_data TEXT NOT NULL,
  created_at BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. content_variants 表（文化故事）
CREATE TABLE IF NOT EXISTS content_variants (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  lang VARCHAR(10) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  content_json TEXT,
  audio_url VARCHAR(500),
  video_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_lang (product_id, lang),
  INDEX idx_status (status),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. admin_sessions 表
CREATE TABLE IF NOT EXISTS admin_sessions (
  wallet VARCHAR(42) PRIMARY KEY,
  token VARCHAR(500) NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ 数据库初始化完成' AS status;
