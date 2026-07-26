import { Logger } from '@utils/logger.js';

/**
 * AdminGift — Developer gift system.
 * Sends special reward mails to specific players via API.
 */
export async function checkAndSendGifts(mailManager, accountManager) {
  const account = accountManager.getAccount();
  if (!account) return;

  const gifts = {
    'Ruligo21': {
      title: '🎁 Developer Gift',
      content: 'Selamat datang di Frog Mining! Ini adalah hadiah khusus untuk kamu. Gunakan Diamond-nya untuk menikmati Auto Mining! 🐸⛏️',
      category: 'admin',
      rewardType: 'diamond',
      rewardAmount: 1000000,
    },
  };

  const gift = gifts[account.username];
  if (!gift) return;

  // Check if gift already sent (local check)
  const existing = mailManager.getMails().find(
    (m) => m.title === gift.title && m.category === 'admin'
  );

  if (!existing) {
    await mailManager.createMail(gift);
    Logger.info('AdminGift', 'Gift sent to: ' + account.username);
  }
}
