import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';
import { Api } from '@utils/api.js';

/**
 * AccountManager — Email/password auth with API + localStorage fallback.
 */
export class AccountManager {
  constructor(eventBus) {
    this.events = eventBus;
    this._storageKey = Config.STORAGE_KEY + ':account';
    this._sessionKey = Config.STORAGE_KEY + ':session';
    this._account = null;
  }

  checkSession() {
    try {
      const session = this._load(this._sessionKey);
      const account = this._load(this._storageKey);
      if (session && session.active && account && account.id) {
        this._account = account;
        Logger.info('Account', 'Session found: ' + account.username);
        return { hasAccount: true, account };
      }
      return { hasAccount: false, account: null };
    } catch {
      return { hasAccount: false, account: null };
    }
  }

  async register(username, email, password) {
    // Check local storage for duplicate email
    const accounts = this._loadAllAccounts();
    const existEmail = accounts.find((a) => a.email === email.trim().toLowerCase());
    if (existEmail) {
      return { success: false, error: 'Email sudah terdaftar' };
    }
    const existUser = accounts.find((a) => a.username === username.trim());
    if (existUser) {
      return { success: false, error: 'Username sudah digunakan' };
    }

    const account = {
      id: this._generateUUID(), username: username.trim(), email: email.trim().toLowerCase(),
      avatar: '🐸', password: password, totalScore: 0, totalDiamond: 0,
      createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString(),
      accountStatus: 'active',
    };

    this._account = account;
    this._save(this._storageKey, account);
    this._save(this._sessionKey, { active: true, playerId: account.id });
    this._saveAccount(account);

    // Try API sync in background (no blocking)
    Api.register(username, email, password).catch(() => {});

    Logger.info('Account', 'Registered: ' + username);
    this.events.emit('account:register', account);
    return { success: true, account };
  }

  async login(email, password) {
    const accounts = this._loadAllAccounts();
    const account = accounts.find((a) => a.email === email.trim().toLowerCase());

    if (!account) {
      return { success: false, error: 'Email tidak ditemukan' };
    }
    if (account.password !== password) {
      return { success: false, error: 'Password salah' };
    }

    this._account = { ...account, password: undefined };
    account.lastLoginAt = new Date().toISOString();
    this._save(this._storageKey, account);
    this._save(this._sessionKey, { active: true, playerId: account.id });
    this._saveAccount(account);

    Logger.info('Account', 'Logged in: ' + account.username);
    this.events.emit('account:login', account);
    return { success: true, account };
  }

  async syncSession() {
    if (!this._account) return;
    const result = await Api.getSession(this._account.id);
    if (result.success) {
      const p = result.data.player;
      this._account.totalScore = p.total_score;
      this._account.totalDiamond = p.total_diamonds;
      this._save(this._storageKey, this._account);
    }
  }

  getAccount() {
    return this._account || this._load(this._storageKey);
  }

  updateAccount(updates) {
    const account = this.getAccount();
    if (!account) return false;
    Object.assign(account, updates);
    this._account = account;
    this._save(this._storageKey, account);
    return true;
  }

  validateUsername(username) {
    if (!username || typeof username !== 'string') return { valid: false, error: 'Username wajib diisi' };
    const t = username.trim();
    if (t.length < 3) return { valid: false, error: 'Username minimal 3 karakter' };
    if (t.length > 20) return { valid: false, error: 'Username maksimal 20 karakter' };
    if (!/^[a-zA-Z0-9_]+$/.test(t)) return { valid: false, error: 'Username hanya huruf, angka, underscore' };
    return { valid: true };
  }

  _loadAllAccounts() {
    try {
      const raw = localStorage.getItem(Config.STORAGE_KEY + ':accounts');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  _saveAccount(account) {
    const accounts = this._loadAllAccounts();
    const idx = accounts.findIndex((a) => a.id === account.id);
    if (idx >= 0) accounts[idx] = account;
    else accounts.push(account);
    localStorage.setItem(Config.STORAGE_KEY + ':accounts', JSON.stringify(accounts));
  }

  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  _save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  _load(key) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } }
}
