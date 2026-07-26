import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';
import { LeaderboardConfig } from './LeaderboardConfig.js';

/**
 * LeaderboardManager — Handles ranking, periods, rewards.
 * All calculations are done here (simulating backend).
 */
export class LeaderboardManager {
  constructor(eventBus, gameDataManager, accountManager) {
    this.events = eventBus;
    this.gameDataManager = gameDataManager;
    this.accountManager = accountManager;
    this._storageKey = Config.STORAGE_KEY + ':leaderboard';
    this._data = null;
  }

  /**
   * Initialize leaderboard data.
   */
  init() {
    this._data = this._load();
    this._checkPeriodReset();
    this._ensureCurrentPeriods();
    Logger.info('Leaderboard', 'Initialized');
  }

  /**
   * Update player score in all active leaderboards.
   */
  updateScore(score) {
    if (!this._data) return;

    const account = this.accountManager.getAccount();
    if (!account) return;

    ['daily', 'weekly', 'monthly'].forEach((period) => {
      const board = this._data[period];
      if (!board || !board.active) return;

      // Find or create entry
      let entry = board.entries.find((e) => e.playerId === account.id);
      if (!entry) {
        entry = {
          playerId: account.id,
          username: account.username,
          avatar: account.avatar,
          score: 0,
          firstScoreAt: null,
        };
        board.entries.push(entry);
      }

      // Update score
      if (score > entry.score) {
        if (entry.score === 0) {
          entry.firstScoreAt = Date.now();
        }
        entry.score = score;
      }
    });

    this._save();
    this.events.emit('leaderboard:update');
  }

  /**
   * Get leaderboard for a period.
   */
  getBoard(period) {
    if (!this._data || !this._data[period]) return { entries: [], playerRank: null };

    const board = this._data[period];
    const sorted = this._sortEntries(board.entries);
    const account = this.accountManager.getAccount();

    // Calculate ranks
    const ranked = sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isPlayer: account && entry.playerId === account.id,
    }));

    // Find player position
    let playerRank = null;
    if (account) {
      const playerEntry = ranked.find((e) => e.isPlayer);
      if (playerEntry) {
        playerRank = playerEntry.rank;
      }
    }

    return {
      entries: ranked.slice(0, LeaderboardConfig.MAX_DISPLAY),
      playerRank,
      totalPlayers: sorted.length,
      rewardPool: LeaderboardConfig.PERIODS[period].rewardPool,
    };
  }

  /**
   * Get countdown to period end.
   */
  getCountdown(period) {
    if (!this._data || !this._data[period]) return null;

    const board = this._data[period];
    const now = Date.now();
    const remaining = Math.max(0, board.endTime - now);

    return {
      remainingMs: remaining,
      formatted: this._formatCountdown(remaining),
      ended: remaining === 0,
    };
  }

  /**
   * Close a period and distribute rewards.
   */
  closePeriod(period) {
    if (!this._data || !this._data[period]) return;

    const board = this._data[period];
    board.active = false;

    // Calculate and distribute rewards
    const rewards = this._calculateRewards(board.entries, period);
    const mails = [];

    rewards.forEach((reward) => {
      if (reward.diamonds > 0) {
        mails.push({
          playerId: reward.playerId,
          title: this._getRewardTitle(period, reward.rank),
          content: this._getRewardContent(period, reward.rank, reward.diamonds),
          rewardType: 'diamond',
          rewardAmount: reward.diamonds,
        });
      }
    });

    this._save();

    this.events.emit('leaderboard:close', { period, rewards, mails });
    Logger.info('Leaderboard', 'Closed ' + period + ' — ' + rewards.length + ' rewards');

    return { rewards, mails };
  }

  /**
   * Start a new period.
   */
  startNewPeriod(period) {
    const now = Date.now();
    const endTime = this._getPeriodEndTime(period, now);

    this._data[period] = {
      active: true,
      startTime: now,
      endTime: endTime,
      entries: [],
    };

    this._save();
    this.events.emit('leaderboard:newPeriod', { period });
    Logger.info('Leaderboard', 'New ' + period + ' period started');
  }

  /**
   * Sort entries by score desc, then by firstScoreAt asc.
   */
  _sortEntries(entries) {
    return [...entries].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.firstScoreAt || 0) - (b.firstScoreAt || 0);
    });
  }

  /**
   * Calculate reward distribution.
   */
  _calculateRewards(entries, period) {
    const sorted = this._sortEntries(entries);
    const pool = LeaderboardConfig.PERIODS[period].rewardPool;
    const rewards = [];

    sorted.forEach((entry, index) => {
      const rank = index + 1;
      const diamonds = this._calculateRewardForRank(rank, pool, sorted.length);

      if (diamonds > 0) {
        rewards.push({
          playerId: entry.playerId,
          username: entry.username,
          rank,
          score: entry.score,
          diamonds: Math.round(diamonds),
        });
      }
    });

    return rewards;
  }

  /**
   * Calculate diamonds for a specific rank.
   */
  _calculateRewardForRank(rank, pool, totalPlayers) {
    if (totalPlayers < LeaderboardConfig.MIN_PLAYERS_FOR_REWARDS) return 0;

    const dist = LeaderboardConfig.REWARD_DISTRIBUTION;

    // Find the applicable percentage
    let percentage = 0;
    const ranks = Object.keys(dist).map(Number).sort((a, b) => a - b);

    for (const r of ranks) {
      if (rank <= r) {
        percentage = dist[r];
        break;
      }
    }

    // For ranks beyond defined distribution, use smaller percentage
    if (percentage === 0 && rank <= 50) {
      percentage = 0.001;
    }

    return pool * percentage;
  }

  /**
   * Check if any periods need reset.
   */
  _checkPeriodReset() {
    if (!this._data) return;

    const now = Date.now();

    ['daily', 'weekly', 'monthly'].forEach((period) => {
      const board = this._data[period];
      if (!board) return;

      if (board.active && now >= board.endTime) {
        this.closePeriod(period);
        this.startNewPeriod(period);
      }
    });
  }

  /**
   * Ensure all periods exist.
   */
  _ensureCurrentPeriods() {
    if (!this._data) this._data = {};

    const now = Date.now();

    ['daily', 'weekly', 'monthly'].forEach((period) => {
      if (!this._data[period]) {
        const endTime = this._getPeriodEndTime(period, now);
        this._data[period] = {
          active: true,
          startTime: now,
          endTime: endTime,
          entries: [],
        };
      }
    });

    this._save();
  }

  /**
   * Get period end time.
   */
  _getPeriodEndTime(period, fromTime) {
    const date = new Date(fromTime);

    switch (period) {
      case 'daily':
        date.setHours(23, 59, 59, 999);
        break;
      case 'weekly': {
        const daysUntilSunday = 6 - date.getDay();
        date.setDate(date.getDate() + daysUntilSunday);
        date.setHours(23, 59, 59, 999);
        break;
      }
      case 'monthly': {
        date.setMonth(date.getMonth() + 1, 0);
        date.setHours(23, 59, 59, 999);
        break;
      }
    }

    return date.getTime();
  }

  _formatCountdown(ms) {
    if (ms <= 0) return 'Ended';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return days + 'd ' + (hours % 24) + 'h';
    if (hours > 0) return hours + 'h ' + (minutes % 60) + 'm';
    return minutes + 'm ' + (seconds % 60) + 's';
  }

  _getRewardTitle(period, rank) {
    const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
    if (rank === 1) return '🏆 ' + periodLabel + ' Champion!';
    if (rank === 2) return '🥈 ' + periodLabel + ' Runner-up!';
    if (rank === 3) return '🥉 ' + periodLabel + ' Bronze!';
    return '🎉 ' + periodLabel + ' Reward #' + rank;
  }

  _getRewardContent(period, rank, diamonds) {
    return 'Congratulations! You ranked #' + rank + ' in the ' + period + ' leaderboard! You earned ' + diamonds.toLocaleString() + ' Diamonds!';
  }

  _load() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  _save() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._data));
    } catch (err) {
      Logger.error('Leaderboard', 'Save failed', err);
    }
  }

  destroy() {}
}
