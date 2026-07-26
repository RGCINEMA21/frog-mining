import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';
import { Api } from '@utils/api.js';
import { LeaderboardConfig } from './LeaderboardConfig.js';

/**
 * LeaderboardManager — Fetches leaderboard from API.
 */
export class LeaderboardManager {
  constructor(eventBus, gameDataManager, accountManager) {
    this.events = eventBus;
    this.gameDataManager = gameDataManager;
    this.accountManager = accountManager;
    this._boards = { daily: null, weekly: null, monthly: null };
  }

  init() {
    Logger.info('Leaderboard', 'Initialized');
  }

  async updateScore(score) {
    // Score is submitted by ScoreManager, just refresh leaderboard
    this._refreshAll();
  }

  async _refreshAll() {
    const account = this.accountManager?.getAccount();
    const playerId = account?.id || null;

    for (const period of ['daily', 'weekly', 'monthly']) {
      const result = await Api.getLeaderboard(period, playerId);
      if (result.success) {
        this._boards[period] = result.data;
      }
    }
    this.events.emit('leaderboard:update');
  }

  getBoard(period) {
    return this._boards[period] || { entries: [], playerRank: null, totalPlayers: 0, rewardPool: 0 };
  }

  getCountdown(period) {
    const board = this._boards[period];
    if (!board || !board.countdown) return null;
    return board.countdown;
  }

  destroy() {}
}
