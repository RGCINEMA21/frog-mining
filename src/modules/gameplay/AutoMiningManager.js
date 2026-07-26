import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';

/**
 * AutoMiningManager — Handles auto mining activation, timer, and offline calculation.
 * Score is calculated based on real time, not browser open time.
 */
export class AutoMiningManager {
  constructor(eventBus, gameDataManager) {
    this.events = eventBus;
    this.gameDataManager = gameDataManager;
    this._intervalId = null;
    this._active = false;
    this._package = null;
    this._startTime = null;
    this._endTime = null;
  }

  /**
   * Initialize — check for existing session and calculate offline gains.
   */
  init() {
    const data = this.gameDataManager.getData();
    if (!data || !data.autoMining) return;

    const am = data.autoMining;
    if (am.active && am.endTime) {
      const now = Date.now();
      const endTime = new Date(am.endTime).getTime();

      if (now >= endTime) {
        // Mining expired while offline
        this._handleExpired();
      } else {
        // Calculate offline gains
        this._calculateOfflineGains(am);
        // Resume timer
        this._resumeTimer(am);
      }
    }

    Logger.info('AutoMiningManager', 'Initialized — Active: ' + this._active);
  }

  /**
   * Activate auto mining with a package.
   * @param {string} packageKey - 'basic' or 'premium'
   * @returns {{ success: boolean, error?: string }}
   */
  activate(packageKey) {
    // Check if already active
    if (this._active) {
      return { success: false, error: 'Auto Mining is already active' };
    }

    // Get package config
    const pkg = this._getPackage(packageKey);
    if (!pkg) {
      return { success: false, error: 'Invalid package' };
    }

    // Check diamond balance
    if (!this.gameDataManager.canAfford(pkg.price)) {
      const balance = this.gameDataManager.getDiamonds();
      return {
        success: false,
        error: 'Not enough Diamonds. You have ' + balance.toLocaleString() + ', need ' + pkg.price.toLocaleString(),
      };
    }

    // Spend diamonds
    const spent = this.gameDataManager.spendDiamonds(pkg.price, 'auto-mining');
    if (!spent) {
      return { success: false, error: 'Failed to spend Diamonds' };
    }

    // Set up mining session
    const now = Date.now();
    const durationMs = pkg.duration * 1000;
    const endTime = now + durationMs;

    this._active = true;
    this._package = pkg;
    this._startTime = new Date(now).toISOString();
    this._endTime = new Date(endTime).toISOString();

    // Save state
    this._saveState();

    // Start timer
    this._startTimer();

    // Emit events
    this.events.emit('autoMining:activate', {
      package: pkg,
      startTime: this._startTime,
      endTime: this._endTime,
      diamonds: this.gameDataManager.getDiamonds(),
    });

    Logger.info('AutoMining', 'Activated: ' + pkg.label + ' for ' + pkg.price + ' diamonds');
    return { success: true };
  }

  /**
   * Get current status.
   */
  getStatus() {
    if (!this._active) {
      return { active: false };
    }

    const now = Date.now();
    const endTime = new Date(this._endTime).getTime();
    const remainingMs = Math.max(0, endTime - now);

    return {
      active: true,
      package: this._package,
      startTime: this._startTime,
      endTime: this._endTime,
      remainingMs,
      remainingFormatted: this._formatTime(remainingMs),
    };
  }

  /**
   * Start the tick timer (every second).
   */
  _startTimer() {
    if (this._intervalId) return;

    this._intervalId = setInterval(() => {
      this._tick();
    }, 1000);
  }

  /**
   * Resume timer from saved state.
   */
  _resumeTimer(am) {
    this._active = true;
    this._package = this._getPackage(am.package);
    this._startTime = am.startTime;
    this._endTime = am.endTime;

    this._startTimer();
    this.events.emit('autoMining:resume', this.getStatus());
  }

  /**
   * Called every second while active.
   */
  _tick() {
    if (!this._active) return;

    const now = Date.now();
    const endTime = new Date(this._endTime).getTime();

    if (now >= endTime) {
      this._handleExpired();
      return;
    }

    // Add score
    this.gameDataManager.addScoreFromAutoMining(Config.AUTO_MINING.SCORE_PER_SECOND);

    // Update remaining
    const remainingMs = endTime - now;
    this.events.emit('autoMining:tick', {
      remainingMs,
      remainingFormatted: this._formatTime(remainingMs),
      score: this.gameDataManager.getScore(),
    });

    // Save periodically (every 10 seconds)
    if (Math.floor(now / 10000) !== Math.floor((now - 1000) / 10000)) {
      this._saveState();
    }
  }

  /**
   * Handle mining expired.
   */
  _handleExpired() {
    this._active = false;
    this._package = null;
    this._startTime = null;
    this._endTime = null;

    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    // Clear saved state
    this._clearState();

    this.events.emit('autoMining:expire', {
      score: this.gameDataManager.getScore(),
    });

    Logger.info('AutoMining', 'Expired');
  }

  /**
   * Calculate offline gains when player returns.
   */
  _calculateOfflineGains(am) {
    const now = Date.now();
    const endTime = new Date(am.endTime).getTime();
    const startTime = new Date(am.startTime).getTime();

    // Calculate how many seconds have passed since last save
    const lastProcessed = am.lastProcessed ? new Date(am.lastProcessed).getTime() : startTime;
    const elapsed = Math.floor((now - lastProcessed) / 1000);

    // Cap at remaining duration
    const remaining = Math.floor((endTime - lastProcessed) / 1000);
    const secondsToAdd = Math.min(elapsed, remaining);

    if (secondsToAdd > 0) {
      this.gameDataManager.addScoreFromAutoMining(secondsToAdd);
      Logger.info('AutoMining', 'Offline gains: +' + secondsToAdd + ' score');
    }
  }

  /**
   * Deactivate (for testing or manual stop).
   */
  deactivate() {
    this._handleExpired();
    this.events.emit('autoMining:deactivate');
  }

  /**
   * Get available packages.
   */
  getPackages() {
    return [
      {
        key: 'basic',
        label: 'Basic Pack',
        price: Config.AUTO_MINING.BASIC_PRICE,
        duration: Config.AUTO_MINING.BASIC_DURATION,
        durationFormatted: this._formatTime(Config.AUTO_MINING.BASIC_DURATION * 1000),
        scorePerSecond: Config.AUTO_MINING.SCORE_PER_SECOND,
        totalScore: Config.AUTO_MINING.BASIC_DURATION * Config.AUTO_MINING.SCORE_PER_SECOND,
      },
      {
        key: 'premium',
        label: 'Premium Pack',
        price: Config.AUTO_MINING.PREMIUM_PRICE,
        duration: Config.AUTO_MINING.PREMIUM_DURATION,
        durationFormatted: this._formatTime(Config.AUTO_MINING.PREMIUM_DURATION * 1000),
        scorePerSecond: Config.AUTO_MINING.SCORE_PER_SECOND,
        totalScore: Config.AUTO_MINING.PREMIUM_DURATION * Config.AUTO_MINING.SCORE_PER_SECOND,
      },
    ];
  }

  _getPackage(key) {
    const packages = {
      basic: {
        key: 'basic',
        label: 'Basic Pack',
        price: Config.AUTO_MINING.BASIC_PRICE,
        duration: Config.AUTO_MINING.BASIC_DURATION,
      },
      premium: {
        key: 'premium',
        label: 'Premium Pack',
        price: Config.AUTO_MINING.PREMIUM_PRICE,
        duration: Config.AUTO_MINING.PREMIUM_DURATION,
      },
    };
    return packages[key] || null;
  }

  _formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return hours + 'h ' + minutes + 'm ' + seconds + 's';
    }
    return minutes + 'm ' + seconds + 's';
  }

  _saveState() {
    const data = this.gameDataManager.getData();
    if (!data) return;

    data.autoMining = {
      active: this._active,
      package: this._package?.key || null,
      startTime: this._startTime,
      endTime: this._endTime,
      lastProcessed: new Date().toISOString(),
    };

    // Save directly to localStorage
    const key = Config.STORAGE_KEY + ':gamedata:' + data.playerId;
    localStorage.setItem(key, JSON.stringify(data));
  }

  _clearState() {
    const data = this.gameDataManager.getData();
    if (!data) return;

    data.autoMining = {
      active: false,
      package: null,
      startTime: null,
      endTime: null,
    };

    const key = Config.STORAGE_KEY + ':gamedata:' + data.playerId;
    localStorage.setItem(key, JSON.stringify(data));
  }

  destroy() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
}
