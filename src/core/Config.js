/**
 * Config — Centralized game configuration.
 * All settings come from env or this file. Never hardcode elsewhere.
 */
export const Config = {
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || 'Frog Mining',
    VERSION: import.meta.env.VITE_APP_VERSION || '0.1.0',
    ENV: import.meta.env.VITE_ENV || 'development',
    DEBUG: import.meta.env.VITE_DEBUG === 'true',
  },

  API: {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
    TIMEOUT: 10000,
  },

  ROUTES: [
    { path: '/', name: 'home', icon: '🏠', label: 'Home' },
    { path: '/shop', name: 'shop', icon: '🛒', label: 'Shop' },
    { path: '/leaderboard', name: 'leaderboard', icon: '🏆', label: 'Board' },
    { path: '/mail', name: 'mail', icon: '📬', label: 'Mail' },
    { path: '/profile', name: 'profile', icon: '👤', label: 'Profile' },
    { path: '/settings', name: 'settings', icon: '⚙️', label: 'Settings' },
  ],

  SCORE: {
    PER_TAP: 1,
  },

  AUTO_MINING: {
    BASIC_PRICE: 1000,
    BASIC_DURATION: 18000,
    PREMIUM_PRICE: 5000,
    PREMIUM_DURATION: 86400,
    SCORE_PER_SECOND: 1,
  },

  STORAGE_KEY: 'frog-mining',
};
