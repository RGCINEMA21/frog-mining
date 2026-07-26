import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';

/**
 * ScoreManager — Core score logic with validation.
 * All score changes go through this module.
 */
export class ScoreManager {
  constructor(eventBus, gameDataManager) {
    this.events = eventBus;
    this.gameDataManager = gameDataManager;
    this._lastTapTime = 0;
    this._tapCooldown = 50; // ms between taps (anti-spam)
    this._totalTaps = 0;
  }

  init() {
    this._totalTaps = this.gameDataManager.getTaps();
    Logger.info('ScoreManager', 'Initialized — Score: ' + this.gameDataManager.getScore());
  }

  /**
   * Process a tap from the player.
   * @returns {{ success: boolean, score?: number, amount?: number, error?: string }}
   */
  processTap() {
    const now = Date.now();

    // Anti-spam: reject taps too close together
    if (now - this._lastTapTime < this._tapCooldown) {
      return { success: false, error: 'too_fast' };
    }

    // Validate score won't go negative
    const currentScore = this.gameDataManager.getScore();
    if (currentScore < 0) {
      Logger.warn('ScoreManager', 'Negative score detected, resetting');
      this.gameDataManager.resetScore();
    }

    // Process tap
    const amount = Config.SCORE.PER_TAP;
    const success = this.gameDataManager.addScore(amount);

    if (!success) {
      return { success: false, error: 'failed' };
    }

    this._lastTapTime = now;
    this._totalTaps++;

    const newScore = this.gameDataManager.getScore();

    // Emit tap event for UI
    this.events.emit('game:tapProcessed', {
      score: newScore,
      amount,
      tapCount: this._totalTaps,
    });

    return { success: true, score: newScore, amount };
  }

  /**
   * Get current score.
   */
  getScore() {
    return this.gameDataManager.getScore();
  }

  /**
   * Get total taps.
   */
  getTotalTaps() {
    return this._totalTaps;
  }

  /**
   * Get rank estimate (placeholder until leaderboard).
   */
  getRank() {
    const score = this.getScore();
    if (score === 0) return '--';
    return Math.max(1, 100 - Math.floor(score / 100));
  }

  destroy() {}
}
