-- ============================================================
-- Food Delivery System — Full Database Schema (SQLite)
-- ============================================================

PRAGMA journal_mode = WAL;   -- Write-Ahead Logging for better concurrency
PRAGMA foreign_keys = ON;    -- Enforce FK constraints

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'customer'  -- 'customer' | 'admin'
                        CHECK(role IN ('customer','admin')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- RESTAURANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurants (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT    NOT NULL,
  cuisine           TEXT    NOT NULL,
  description       TEXT,
  address           TEXT,
  rating            REAL    NOT NULL DEFAULT 4.0,
  rating_count      INTEGER NOT NULL DEFAULT 120,
  delivery_time_min INTEGER NOT NULL DEFAULT 30,
  min_order         REAL    NOT NULL DEFAULT 0,
  is_open           INTEGER NOT NULL DEFAULT 1,  -- 1 = open, 0 = closed
  image_url         TEXT,
  banner_url        TEXT,
  tags              TEXT    -- JSON string or comma-separated tags
);

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT    NOT NULL,
  description   TEXT,
  price         REAL    NOT NULL,
  category      TEXT    NOT NULL,
  available_qty INTEGER NOT NULL DEFAULT 100,  -- used for inventory locking demo
  is_available  INTEGER NOT NULL DEFAULT 1,    -- 1 = available, 0 = unavailable
  is_veg        INTEGER NOT NULL DEFAULT 1,    -- 1 = veg, 0 = non-veg
  calories      INTEGER DEFAULT 350,
  rating        REAL    DEFAULT 4.5,
  image_url     TEXT
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  restaurant_id    INTEGER NOT NULL REFERENCES restaurants(id),
  status           TEXT    NOT NULL DEFAULT 'pending'
                           CHECK(status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  total_amount     REAL    NOT NULL,
  subtotal         REAL    NOT NULL DEFAULT 0,
  delivery_fee     REAL    NOT NULL DEFAULT 0,
  discount_amount  REAL    NOT NULL DEFAULT 0,
  tip_amount       REAL    NOT NULL DEFAULT 0,
  payment_method   TEXT    NOT NULL DEFAULT 'upi',
  delivery_address TEXT    NOT NULL,
  notes            TEXT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- ORDER ITEMS  (line items — immutable snapshot of price)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity     INTEGER NOT NULL CHECK(quantity > 0),
  unit_price   REAL    NOT NULL   -- price at time of order (snapshot)
);

-- ============================================================
-- CART  (server-side per-user cart)
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
  UNIQUE(user_id, menu_item_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_user     ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
CREATE INDEX IF NOT EXISTS idx_menu_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_cart_user       ON cart(user_id);
