import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';

/**
 * AccountManager — Handles player account lifecycle.
 * Stores account data in localStorage (server sync later).
 */
export class AccountManager {
  constructor(eventBus) {
    this.events = eventBus;
    this._storageKey = Config.STORAGE_KEY + ':account';
    this._sessionKey = Config.STORAGE_KEY + ':session';
  }

  /**
   * Check if player has an existing account in this browser.
   */
  checkSession() {
    try {
      const session = this._load(this._sessionKey);
      const account = this._load(this._storageKey);
      if (session && session.active && account && account.id) {
        Logger.info('Account', 'Session found: ' + account.username);
        return { hasAccount: true, account };
      }
      return { hasAccount: false, account: null };
    } catch (err) {
      Logger.error('Account', 'Session check failed', err);
      return { hasAccount: false, account: null };
    }
  }

  /**
   * Register a new player account.
   */
  register(username) {
    const validation = this.validateUsername(username);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const trimmed = username.trim();
      const account = {
        id: this._generateUUID(),
        username: trimmed,
        avatar: null,
        totalScore: 0,
        totalDiamond: 0,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        accountStatus: 'active',
      };

      this._save(this._storageKey, account);
      this._save(this._sessionKey, { active: true, playerId: account.id });

      Logger.info('Account', 'Registered: ' + trimmed + ' (' + account.id + ')');
      this.events.emit('account:register', account);
      return { success: true, account };
    } catch (err) {
      Logger.error('Account', 'Registration failed', err);
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  }

  /**
   * Login with existing session.
   */
  login() {
    try {
      const { hasAccount, account } = this.checkSession();
      if (!hasAccount || !account) {
        return { success: false, error: 'No account found' };
      }
      account.lastLoginAt = new Date().toISOString();
      this._save(this._storageKey, account);
      Logger.info('Account', 'Logged in: ' + account.username);
      this.events.emit('account:login', account);
      return { success: true, account };
    } catch (err) {
      Logger.error('Account', 'Login failed', err);
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Logout — clear session, keep account.
   */
  logout() {
    try {
      this._remove(this._sessionKey);
      Logger.info('Account', 'Logged out');
      this.events.emit('account:logout');
    } catch (err) {
      Logger.error('Account', 'Logout failed', err);
    }
  }

  /**
   * Get current account data.
   */
  getAccount() {
    return this._load(this._storageKey);
  }

  /**
   * Update account data.
   */
  updateAccount(updates) {
    const account = this._load(this._storageKey);
    if (!account) return false;
    Object.assign(account, updates);
    this._save(this._storageKey, account);
    return true;
  }

  /**
   * Validate username.
   */
  validateUsername(username) {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username is required' };
    }
    const trimmed = username.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Username cannot be empty' };
    }
    if (trimmed.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (trimmed.length > 20) {
      return { valid: false, error: 'Username must be 20 characters or less' };
    }
    if (trimmed !== username) {
      return { valid: false, error: 'Username cannot start or end with spaces' };
    }
    if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
      return { valid: false, error: 'Username can only contain letters and numbers' };
    }
    return { valid: true };
  }

  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  _save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  _load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  _remove(key) {
    localStorage.removeItem(key);
  }
}
