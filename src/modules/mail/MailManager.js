import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';
import { MailConfig } from './MailConfig.js';

/**
 * MailManager — Handles mail creation, claiming, filtering, and expiry.
 */
export class MailManager {
  constructor(eventBus, gameDataManager, accountManager) {
    this.events = eventBus;
    this.gameDataManager = gameDataManager;
    this.accountManager = accountManager;
    this._storageKey = Config.STORAGE_KEY + ':mails';
    this._mails = [];
  }

  /**
   * Initialize — load mails and check expiry.
   */
  init() {
    const account = this.accountManager.getAccount();
    if (!account) return;

    this._mails = this._load(account.id);
    this._checkExpiry();
    this._cleanupExpired();
    Logger.info('MailManager', 'Initialized — ' + this._mails.length + ' mails');
  }

  /**
   * Get all mails for current player.
   */
  getMails(filter = 'all') {
    let mails = [...this._mails];

    switch (filter) {
      case 'unread':
        mails = mails.filter((m) => !m.read);
        break;
      case 'hasReward':
        mails = mails.filter((m) => m.rewardType && m.rewardAmount > 0 && m.claimStatus === 'unclaimed');
        break;
      case 'claimed':
        mails = mails.filter((m) => m.claimStatus === 'claimed');
        break;
      case 'expired':
        mails = mails.filter((m) => m.claimStatus === 'expired');
        break;
    }

    // Sort by date, newest first
    mails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return mails;
  }

  /**
   * Get a single mail by ID.
   */
  getMail(mailId) {
    return this._mails.find((m) => m.id === mailId) || null;
  }

  /**
   * Get unread count.
   */
  getUnreadCount() {
    return this._mails.filter((m) => !m.read).length;
  }

  /**
   * Get unclaimed reward count.
   */
  getUnclaimedCount() {
    return this._mails.filter((m) => m.rewardType && m.rewardAmount > 0 && m.claimStatus === 'unclaimed').length;
  }

  /**
   * Create a new mail.
   */
  createMail({ title, content, category = 'announcement', rewardType = null, rewardAmount = 0, expiryDays = null }) {
    const account = this.accountManager.getAccount();
    if (!account) return null;

    // Check max mails
    if (this._mails.length >= MailConfig.MAX_MAILS) {
      // Remove oldest read/expired mails
      this._cleanupOldest();
    }

    const now = new Date();
    const expiry = expiryDays ?? MailConfig.DEFAULT_EXPIRY_DAYS;
    const expiresAt = expiry > 0 ? new Date(now.getTime() + expiry * 24 * 60 * 60 * 1000).toISOString() : null;

    const mail = {
      id: this._generateUUID(),
      playerId: account.id,
      title,
      content,
      category,
      rewardType,
      rewardAmount,
      claimStatus: rewardType ? 'unclaimed' : 'none',
      read: false,
      createdAt: now.toISOString(),
      expiresAt,
    };

    this._mails.unshift(mail);
    this._save(account.id);

    this.events.emit('mail:new', { mail });
    Logger.info('Mail', 'Created: ' + title + ' (' + category + ')');
    return mail;
  }

  /**
   * Mark mail as read.
   */
  markRead(mailId) {
    const mail = this._mails.find((m) => m.id === mailId);
    if (!mail) return false;

    mail.read = true;
    this._save(this.accountManager.getAccount()?.id);
    this.events.emit('mail:read', { mailId });
    return true;
  }

  /**
   * Claim reward from mail.
   * @returns {{ success: boolean, error?: string, reward?: number }}
   */
  claimReward(mailId) {
    const mail = this._mails.find((m) => m.id === mailId);
    if (!mail) {
      return { success: false, error: 'Mail not found' };
    }

    // Check if has reward
    if (!mail.rewardType || mail.rewardAmount <= 0) {
      return { success: false, error: 'This mail has no reward' };
    }

    // Check if already claimed
    if (mail.claimStatus === 'claimed') {
      return { success: false, error: 'Reward already claimed' };
    }

    // Check if expired
    if (mail.claimStatus === 'expired') {
      return { success: false, error: 'Mail has expired' };
    }

    // Check expiry date
    if (mail.expiresAt && new Date(mail.expiresAt) < new Date()) {
      mail.claimStatus = 'expired';
      this._save(this.accountManager.getAccount()?.id);
      return { success: false, error: 'Mail has expired' };
    }

    // Process reward
    if (mail.rewardType === 'diamond') {
      const added = this.gameDataManager.addDiamonds(mail.rewardAmount, 'mail');
      if (!added) {
        return { success: false, error: 'Failed to add Diamonds' };
      }
    }

    // Mark as claimed
    mail.claimStatus = 'claimed';
    mail.read = true;
    this._save(this.accountManager.getAccount()?.id);

    this.events.emit('mail:claim', { mailId, rewardType: mail.rewardType, reward: mail.rewardAmount });
    Logger.info('Mail', 'Claimed: ' + mail.title + ' — ' + mail.rewardAmount + ' ' + mail.rewardType);

    return { success: true, reward: mail.rewardAmount };
  }

  /**
   * Delete a mail.
   */
  deleteMail(mailId) {
    const index = this._mails.findIndex((m) => m.id === mailId);
    if (index === -1) return false;

    this._mails.splice(index, 1);
    this._save(this.accountManager.getAccount()?.id);
    this.events.emit('mail:delete', { mailId });
    return true;
  }

  /**
   * Check and update expired mails.
   */
  _checkExpiry() {
    const now = new Date();
    let changed = false;

    this._mails.forEach((mail) => {
      if (mail.claimStatus === 'unclaimed' && mail.expiresAt) {
        if (new Date(mail.expiresAt) < now) {
          mail.claimStatus = 'expired';
          changed = true;
          Logger.info('Mail', 'Expired: ' + mail.title);
        }
      }
    });

    if (changed) {
      this._save(this.accountManager.getAccount()?.id);
    }
  }

  /**
   * Auto-delete very old expired mails.
   */
  _cleanupExpired() {
    const cutoff = new Date(Date.now() - MailConfig.AUTO_DELETE_EXPIRED_DAYS * 24 * 60 * 60 * 1000);
    const before = this._mails.length;

    this._mails = this._mails.filter((mail) => {
      if (mail.claimStatus === 'expired' && new Date(mail.createdAt) < cutoff) {
        return false;
      }
      return true;
    });

    if (this._mails.length !== before) {
      this._save(this.accountManager.getAccount()?.id);
      Logger.info('Mail', 'Cleaned up ' + (before - this._mails.length) + ' old expired mails');
    }
  }

  _cleanupOldest() {
    // Remove oldest read mails first
    const readMails = this._mails.filter((m) => m.read && m.claimStatus !== 'unclaimed');
    if (readMails.length > 0) {
      const oldest = readMails[readMails.length - 1];
      const index = this._mails.indexOf(oldest);
      if (index > -1) this._mails.splice(index, 1);
    }
  }

  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  _save(playerId) {
    if (!playerId) return;
    const key = this._storageKey + ':' + playerId;
    localStorage.setItem(key, JSON.stringify(this._mails));
  }

  _load(playerId) {
    try {
      const key = this._storageKey + ':' + playerId;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  destroy() {}
}
