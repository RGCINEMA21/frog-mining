/**
 * MailConfig — Mail categories, icons, colors, and settings.
 */
export const MailConfig = {
  // Mail category definitions
  CATEGORIES: {
    leaderboard: {
      label: 'Leaderboard Reward',
      icon: '🏆',
      color: '#D4A017',
    },
    purchase: {
      label: 'Purchase Confirmation',
      icon: '🛒',
      color: '#48BFE3',
    },
    compensation: {
      label: 'Server Compensation',
      icon: '🎁',
      color: '#74C69D',
    },
    announcement: {
      label: 'System Announcement',
      icon: '📢',
      color: '#7B68EE',
    },
    event: {
      label: 'Event Reward',
      icon: '🎉',
      color: '#F4845F',
    },
    admin: {
      label: 'Admin Message',
      icon: '👤',
      color: '#E63946',
    },
  },

  // Default expiry in days (0 = never expires)
  DEFAULT_EXPIRY_DAYS: 7,

  // Max mails per player
  MAX_MAILS: 100,

  // Auto-delete expired after days
  AUTO_DELETE_EXPIRED_DAYS: 30,
};
