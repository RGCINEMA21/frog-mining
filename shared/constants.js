/**
 * Shared constants — Used by both frontend and backend.
 * This file is imported by both sides.
 */

export const GAME_NAME = 'Frog Mining';
export const GAME_VERSION = '0.1.0';

export const SCORE_PER_TAP = 1;

export const AUTO_MINING = {
  BASIC: { price: 1000, duration: 18000, label: 'Basic (5h)' },
  PREMIUM: { price: 5000, duration: 86400, label: 'Premium (24h)' },
};

export const LEADERBOARD_REWARDS = {
  daily: { 1: 50, 2: 30, 3: 20, '4-5': 10, '6-10': 5 },
  monthly: { 1: 100, 2: 60, 3: 40, '4-5': 20, '6-10': 10, '11-50': 5 },
};
