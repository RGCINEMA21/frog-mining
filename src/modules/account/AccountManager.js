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
        // Validate with server in background — clear if not found
        Api.getSession(account.id).then((result) => {
          if (!result.success) {
            Logger.warn('Account', 'Session invalid on server, clearing');
            this._remove(this._sessionKey);
            this._remove(this._storageKey);
            this._account = null;
            window.location.reload();
          }
        }).catch(() => {}); // offline — keep local session
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
    // Try API first
    const result = await Api.register(username, email, password);
    if (result.success) {
      const p = result.data.player;
      const account = {
        id: p.id, username: p.username, email: email, avatar: p.avatar,
        totalScore: p.total_score, totalDiamond: p.total_diamonds,
        createdAt: p.created_at, lastLoginAt: p.last_login, accountStatus: p.status,
      };
      this._account = account;
      this._save(this._storageKey, account);
      this._save(this._sessionKey, { active: true, playerId: account.id });
      Logger.info('Account', 'Registered: ' + username);
      this.events.emit('account:register', account);
      return { success: true, account };
    }

    if (result.error && (result.error.includes('sudah digunakan') || result.error.includes('sudah terdaftar'))) {
      return { success: false, error: result.error };
    }

    // Offline fallback
    Logger.warn('Account', 'API unavailable, registering offline');
    const account = {
      id: this._generateUUID(), username, email, avatar: '🐸',
      totalScore: 0, totalDiamond: 0,
      createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString(),
      accountStatus: 'active',
    };
    this._account = account;
    this._save(this._storageKey, account);
    this._save(this._sessionKey, { active: true, playerId: account.id });
    this.events.emit('account:register', account);
    return { success: true, account };
  }

  async login(email, password) {
    const result = await Api.login(email, password);
    if (result.success) {
      const p = result.data.player;
      const account = {
        id: p.id, username: p.username, email: email, avatar: p.avatar,
        totalScore: p.total_score, totalDiamond: p.total_diamonds,
        createdAt: p.created_at, lastLoginAt: p.last_login, accountStatus: p.status,
      };
      this._account = account;
      this._save(this._storageKey, account);
      this._save(this._sessionKey, { active: true, playerId: account.id });
      Logger.info('Account', 'Logged in: ' + p.username);
      this.events.emit('account:login', account);
      return { success: true, account };
    }

    return { success: false, error: result.error || 'Login gagal' };
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

  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  _save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  _load(key) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } }
}
