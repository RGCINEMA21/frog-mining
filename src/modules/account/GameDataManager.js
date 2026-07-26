import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';

/**
 * GameDataManager — Manages player game data (score, diamond, etc.).
 * Persists to localStorage, syncs with server later.
 */
export class GameDataManager {
  constructor(eventBus, accountManager) {
    this.events = eventBus;
    this.accountManager = accountManager;
    this._storageKey = Config.STORAGE_KEY + ':gamedata';
    this._data = null;
  }

  /**
   * Load game data for current player.
   */
  init() {
    const account = this.accountManager.getAccount();
    if (!account) {
      Logger.warn('GameDataManager', 'No account found');
      return;
    }

    this._data = this._load(account.id) || this._createDefault(account.id);
    Logger.info('GameDataManager', 'Loaded data for: ' + account.username);
    this.events.emit('gamedata:init', this._data);
  }

  /**
   * Get current game data.
   */
  getData() {
    return this._data ? { ...this._data } : null;
  }

  /**
   * Get score.
   */
  getScore() {
    return this._data?.score || 0;
  }

  /**
   * Get diamond balance.
   */
  getDiamonds() {
    return this._data?.diamonds || 0;
  }

  /**
   * Get total taps.
   */
  getTaps() {
    return this._data?.totalTaps || 0;
  }

  /**
   * Add score from tap.
   */
  addScore(amount = 1) {
    if (!this._data || amount <= 0) return false;
    this._data.score += amount;
    this._data.totalTaps += amount;
    this._save();
    this.events.emit('gamedata:scoreChange', {
      score: this._data.score,
      amount,
      source: 'tap',
    });
    return true;
  }

  /**
   * Add score from auto mining.
   */
  addScoreFromAutoMining(amount = 1) {
    if (!this._data || amount <= 0) return false;
    this._data.score += amount;
    this._save();
    this.events.emit('gamedata:scoreChange', {
      score: this._data.score,
      amount,
      source: 'auto',
    });
    return true;
  }

  /**
   * Add diamonds (from reward or purchase).
   */
  addDiamonds(amount, source = 'unknown') {
    if (!this._data || amount <= 0) return false;
    this._data.diamonds += amount;
    this._save();
    this.events.emit('gamedata:diamondChange', {
      diamonds: this._data.diamonds,
      amount,
      source,
    });
    return true;
  }

  /**
   * Spend diamonds (for auto mining, etc).
   */
  spendDiamonds(amount, purpose = 'unknown') {
    if (!this._data || amount <= 0 || this._data.diamonds < amount) return false;
    this._data.diamonds -= amount;
    this._save();
    this.events.emit('gamedata:diamondChange', {
      diamonds: this._data.diamonds,
      amount: -amount,
      source: purpose,
    });
    return true;
  }

  /**
   * Check if player can afford a cost.
   */
  canAfford(cost) {
    return this._data ? this._data.diamonds >= cost : false;
  }

  /**
   * Reset game data (for new season, etc).
   */
  resetScore() {
    if (!this._data) return;
    this._data.score = 0;
    this._save();
    this.events.emit('gamedata:scoreReset');
  }

  /**
   * Create default game data.
   */
  _createDefault(playerId) {
    const defaultData = {
      playerId,
      score: 0,
      diamonds: 0,
      totalTaps: 0,
      autoMining: {
        active: false,
        package: null,
        startTime: null,
        endTime: null,
      },
      createdAt: new Date().toISOString(),
    };
    this._save(defaultData);
    return defaultData;
  }

  _save(data) {
    if (!this._data && !data) return;
    const toSave = data || this._data;
    const key = this._storageKey + ':' + toSave.playerId;
    localStorage.setItem(key, JSON.stringify(toSave));
  }

  _load(playerId) {
    try {
      const key = this._storageKey + ':' + playerId;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
