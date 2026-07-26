import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * API — HTTP client for backend communication.
 */
export const Api = {
  async _request(method, path, body = null) {
    try {
      const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(BASE_URL + path, opts);
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || 'Request failed' };
      }

      return { success: true, data: data.data, message: data.message };
    } catch (err) {
      Logger.error('API', method + ' ' + path + ' failed', err.message);
      return { success: false, error: 'Network error. Playing offline.' };
    }
  },

  // Auth
  register(username) {
    return this._request('POST', '/api/auth/register', { username });
  },

  getSession(playerId) {
    return this._request('GET', '/api/auth/session/' + playerId);
  },

  // Score
  submitTap(playerId, amount = 1) {
    return this._request('POST', '/api/score/tap', { playerId, amount });
  },

  getScore(playerId) {
    return this._request('GET', '/api/score/' + playerId);
  },

  // Leaderboard
  getLeaderboard(type, playerId = null) {
    const q = playerId ? '?playerId=' + playerId : '';
    return this._request('GET', '/api/leaderboard/' + type + q);
  },

  // Auto Mining
  getAutoMining(playerId) {
    return this._request('GET', '/api/automining/' + playerId);
  },

  activateAutoMining(playerId, packageKey) {
    return this._request('POST', '/api/automining/activate', { playerId, packageKey });
  },

  // Mail
  getMails(playerId) {
    return this._request('GET', '/api/mail/' + playerId);
  },

  claimMail(playerId, mailId) {
    return this._request('POST', '/api/mail/claim', { playerId, mailId });
  },

  createMail(playerId, title, content, category, rewardType, rewardAmount) {
    return this._request('POST', '/api/mail/create', {
      playerId, title, content, category, rewardType, rewardAmount,
    });
  },

  // Diamond / Shop
  getShopProducts() {
    return this._request('GET', '/api/shop/products');
  },

  purchaseProduct(playerId, productId) {
    return this._request('POST', '/api/shop/purchase', { playerId, productId });
  },

  getTransactions(playerId) {
    return this._request('GET', '/api/transactions/' + playerId);
  },
};
