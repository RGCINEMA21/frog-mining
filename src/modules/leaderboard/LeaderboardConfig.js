/**
 * LeaderboardConfig — All leaderboard settings.
 * Change these values without modifying code.
 */
export const LeaderboardConfig = {
  // Period types
  PERIODS: {
    daily: {
      label: 'Daily',
      resetInterval: 'day',
      rewardPool: 1000000,
    },
    weekly: {
      label: 'Weekly',
      resetInterval: 'week',
      rewardPool: 5000000,
    },
    monthly: {
      label: 'Monthly',
      resetInterval: 'month',
      rewardPool: 20000000,
    },
  },

  // Reward distribution rules
  // rank: percentage of reward pool
  REWARD_DISTRIBUTION: {
    1: 0.15,    // #1 gets 15%
    2: 0.10,    // #2 gets 10%
    3: 0.07,    // #3 gets 7%
    4: 0.05,    // #4 gets 5%
    5: 0.04,    // #5 gets 4%
    6: 0.035,   // #6 gets 3.5%
    7: 0.03,    // #7 gets 3%
    8: 0.025,   // #8 gets 2.5%
    9: 0.02,    // #9 gets 2%
    10: 0.015,  // #10 gets 1.5%
    // Ranks 11-50 share remaining
    11: 0.01,
    20: 0.005,
    50: 0.002,
  },

  // Min players for reward distribution
  MIN_PLAYERS_FOR_REWARDS: 1,

  // Leaderboard display
  MAX_DISPLAY: 50,
  SHOW_PLAYER_POSITION: true,
};
