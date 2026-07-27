import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';
import { Api } from '@utils/api.js';

const PERIODS = {
  daily: { rewardPool: 1000000 },
  weekly: { rewardPool: 5000000 },
  monthly: { rewardPool: 20000000 },
};

function getPeriodEndTime(type) {
  const now = new Date();
  switch (type) {
    case 'daily':
      now.setHours(23, 59, 59, 999);
      break;
    case 'weekly': {
      const d = 6 - now.getDay();
      now.setDate(now.getDate() + d);
      now.setHours(23, 59, 59, 999);
      break;
    }
    case 'monthly':
      now.setMonth(now.getMonth() + 1, 0);
      now.setHours(23, 59, 59, 999);
      break;
  }
  return now.getTime();
}

function formatCountdown(ms) {
  if (ms <= 0) return 'Ended';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return d + 'd ' + h + 'h';
  if (h > 0) return h + 'h ' + m + 'm';
  return m + 'm ' + (s % 60) + 's';
}

/**
 * LeaderboardManager — Works with localStorage, syncs to API when available.
 */
export class LeaderboardManager {
  constructor(eventBus, gameDataManager, accountManager) {
    this.events = eventBus;
    this.gameDataManager = gameDataManager;
    this.accountManager = accountManager;
    this._storageKey = Config.STORAGE_KEY + ':leaderboard';
    this._data = null;
    this._boards = { daily: null, weekly: null, monthly: null };
  }

  init() {
    this._data = this._load() || this._createDefaults();
    this._checkPeriodReset();
    this._ensurePeriods();
    this._refreshAll();
    Logger.info('Leaderboard', 'Initialized');
  }

  async updateScore(score) {
    const account = this.accountManager?.getAccount();
    if (!account) return;

    ['daily', 'weekly', 'monthly'].forEach((period) => {
      const board = this._data[period];
      if (!board || !board.active) return;

      let entry = board.entries.find((e) => e.playerId === account.id);
      if (!entry) {
        entry = {
          playerId: account.id,
          username: account.username,
          avatar: account.avatar || '🐸',
          score: 0,
          firstScoreAt: null,
        };
        board.entries.push(entry);
      }

      if (score > entry.score) {
        if (entry.score === 0) entry.firstScoreAt = Date.now();
        entry.score = score;
      }
    });

    this._save();
    this._refreshAll();
    this.events.emit('leaderboard:update');

    // Try API sync in background
    this._syncToApi(account.id, score);
  }

  async _syncToApi(playerId, score) {
    try {
      await Api.submitTap(playerId, score);
      for (const period of ['daily', 'weekly', 'monthly']) {
        const result = await Api.getLeaderboard(period, playerId);
        if (result.success && result.data.entries) {
          // Merge API entries into local
          const board = this._data[period];
          result.data.entries.forEach((apiEntry) => {
            const existing = board.entries.find((e) => e.playerId === apiEntry.playerId);
            if (existing) {
              if (apiEntry.score > existing.score) existing.score = apiEntry.score;
            } else {
              board.entries.push({
                playerId: apiEntry.playerId,
                username: apiEntry.username,
                avatar: apiEntry.avatar || '🐸',
                score: apiEntry.score,
                firstScoreAt: null,
              });
            }
          });
          this._save();
        }
      }
    } catch { /* offline, ignore */ }
  }

  _refreshAll() {
    const account = this.accountManager?.getAccount();
    const playerId = account?.id || null;

    ['daily', 'weekly', 'monthly'].forEach((period) => {
      const board = this._data[period];
      if (!board) { this._boards[period] = null; return; }

      const sorted = this._sortEntries(board.entries);
      const now = Date.now();
      const remainingMs = Math.max(0, board.endTime - now);

      const ranked = sorted.map((entry, i) => ({
        ...entry,
        rank: i + 1,
        isPlayer: playerId ? entry.playerId === playerId : false,
      }));

      let playerRank = null;
      if (playerId) {
        const pe = ranked.find((e) => e.isPlayer);
        if (pe) playerRank = pe.rank;
      }

      this._boards[period] = {
        entries: ranked.slice(0, 100),
        playerRank,
        totalPlayers: sorted.length,
        rewardPool: PERIODS[period].rewardPool,
        countdown: {
          remainingMs,
          formatted: formatCountdown(remainingMs),
          ended: remainingMs === 0,
        },
      };
    });
  }

  getBoard(period) {
    return this._boards[period] || { entries: [], playerRank: null, totalPlayers: 0, rewardPool: 0, countdown: { remainingMs: 0, formatted: 'Ended', ended: true } };
  }

  getCountdown(period) {
    const b = this._boards[period];
    return b?.countdown || null;
  }

  _sortEntries(entries) {
    return [...entries].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.firstScoreAt || 0) - (b.firstScoreAt || 0);
    });
  }

  _ensurePeriods() {
    const now = Date.now();
    ['daily', 'weekly', 'monthly'].forEach((period) => {
      if (!this._data[period]) {
        this._data[period] = {
          active: true,
          startTime: now,
          endTime: getPeriodEndTime(period),
          entries: [],
        };
      }
    });
    this._save();
  }

  _checkPeriodReset() {
    if (!this._data) return;
    const now = Date.now();
    ['daily', 'weekly', 'monthly'].forEach((period) => {
      const board = this._data[period];
      if (board && board.active && now >= board.endTime) {
        board.active = false;
        this._data[period] = {
          active: true,
          startTime: now,
          endTime: getPeriodEndTime(period),
          entries: [],
        };
      }
    });
    this._save();
  }

  _createDefaults() {
    const now = Date.now();
    return {
      daily: { active: true, startTime: now, endTime: getPeriodEndTime('daily'), entries: [] },
      weekly: { active: true, startTime: now, endTime: getPeriodEndTime('weekly'), entries: [] },
      monthly: { active: true, startTime: now, endTime: getPeriodEndTime('monthly'), entries: [] },
    };
  }

  _save() {
    try { localStorage.setItem(this._storageKey, JSON.stringify(this._data)); } catch {}
  }

  _load() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  destroy() {}
}
