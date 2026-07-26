import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbDir = join(__dirname, '../../data');
mkdirSync(dbDir, { recursive: true });

const db = new Database(join(dbDir, 'frog-mining.db'));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT DEFAULT '🐸',
    total_score INTEGER DEFAULT 0,
    total_diamonds INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS auto_mining (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    status TEXT DEFAULT 'inactive',
    package_key TEXT,
    start_time TEXT,
    end_time TEXT,
    last_processed TEXT,
    total_generated_score INTEGER DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id)
  );

  CREATE TABLE IF NOT EXISTS leaderboard_seasons (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    reward_pool INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS leaderboards (
    id TEXT PRIMARY KEY,
    season_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    rank INTEGER,
    reward_diamond INTEGER DEFAULT 0,
    reward_status TEXT DEFAULT 'pending',
    first_score_at TEXT,
    FOREIGN KEY (season_id) REFERENCES leaderboard_seasons(id),
    FOREIGN KEY (player_id) REFERENCES players(id),
    UNIQUE(season_id, player_id)
  );

  CREATE TABLE IF NOT EXISTS mails (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT DEFAULT 'system',
    reward_type TEXT,
    reward_amount INTEGER DEFAULT 0,
    claim_status TEXT DEFAULT 'unclaimed',
    created_at TEXT DEFAULT (datetime('now')),
    expired_at TEXT,
    FOREIGN KEY (player_id) REFERENCES players(id)
  );

  CREATE TABLE IF NOT EXISTS shop_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    diamond_amount INTEGER NOT NULL,
    bonus_diamond INTEGER DEFAULT 0,
    price TEXT NOT NULL,
    currency TEXT DEFAULT 'IDR',
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (product_id) REFERENCES shop_products(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance_before INTEGER DEFAULT 0,
    balance_after INTEGER DEFAULT 0,
    reference TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (player_id) REFERENCES players(id)
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT,
    action TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed default shop products
const productCount = db.prepare('SELECT COUNT(*) as count FROM shop_products').get();
if (productCount.count === 0) {
  const insertProduct = db.prepare(
    'INSERT INTO shop_products (id, name, diamond_amount, bonus_diamond, price, currency) VALUES (?, ?, ?, ?, ?, ?)'
  );
  insertProduct.run('starter', 'Starter', 10, 0, 'Rp 5.000', 'IDR');
  insertProduct.run('basic', 'Basic', 50, 5, 'Rp 20.000', 'IDR');
  insertProduct.run('mega', 'Mega', 200, 30, 'Rp 50.000', 'IDR');
  insertProduct.run('ultimate', 'Ultimate', 500, 100, 'Rp 100.000', 'IDR');
  insertProduct.run('royal', 'Royal', 1500, 400, 'Rp 250.000', 'IDR');
}

// Seed default system settings
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM system_settings').get();
if (settingsCount.count === 0) {
  const insertSetting = db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)');
  insertSetting.run('auto_mining_score_per_second', '1');
  insertSetting.run('mail_expiry_days', '30');
  insertSetting.run('maintenance_mode', 'false');
}

export default db;
