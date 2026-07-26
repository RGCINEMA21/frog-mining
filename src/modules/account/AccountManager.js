import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';
import { Api } from '@utils/api.js';

/**
 * AccountManager — Handles player account lifecycle via API.
 * Falls back to localStorage when server is unavailable.
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
    } catch (err) {
      Logger.error('Account', 'Session check failed', err);
      return { hasAccount: false, account: null };
    }
  }

  async register(username) {
    const validation = this.validateUsername(username);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const trimmed = username.trim();

    // Try API first
    const result = await Api.register(trimmed);
    if (result.success) {
      const player = result.data.player;
      const account = {
        id: player.id,
        username: player.username,
        avatar: player.avatar,
        totalScore: player.total_score,
        totalDiamond: player.total_diamonds,
        createdAt: player.created_at,
        lastLoginAt: player.last_login,
        accountStatus: player.status,
      };
      this._account = account;
      this._save(this._storageKey, account);
      this._save(this._sessionKey, { active: true, playerId: account.id });
      Logger.info('Account', 'Registered via API: ' + trimmed);
      this.events.emit('account:register', account);
      return { success: true, account };
    }

    // Check if error is "username taken" (server reachable but conflict)
    if (result.error && result.error.includes('already taken')) {
      return { success: false, error: 'Username already taken' };
    }

    // Offline fallback — create locally
    Logger.warn('Account', 'API unavailable, registering offline');
    const account = {
      id: this._generateUUID(),
      username: trimmed,
      avatar: '🐸',
      totalScore: 0,
      totalDiamond: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      accountStatus: 'active',
    };
    this._account = account;
    this._save(this._storageKey, account);
    this._save(this._sessionKey, { active: true, playerId: account.id });
    this.events.emit('account:register', account);
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

  logout() {
    try {
      this._remove(this._sessionKey);
      this._account = null;
      Logger.info('Account', 'Logged out');
      this.events.emit('account:logout');
    } catch (err) {
      Logger.error('Account', 'Logout failed', err);
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
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username is required' };
    }
    const trimmed = username.trim();
    if (trimmed.length === 0) return { valid: false, error: 'Username cannot be empty' };
    if (trimmed.length < 3) return { valid: false, error: 'Username must be at least 3 characters' };
    if (trimmed.length > 20) return { valid: false, error: 'Username must be 20 characters or less' };
    if (!/^[a-zA-Z0-9]+$/.test(trimmed)) return { valid: false, error: 'Username can only contain letters and numbers' };
    return { valid: true };
  }

  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  _save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  _load(key) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } }
  _remove(key) { localStorage.removeItem(key); }
}
