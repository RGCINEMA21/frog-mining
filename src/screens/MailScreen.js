import { Logger } from '@utils/logger.js';
import { MailConfig } from '@modules/mail/MailConfig.js';

/**
 * MailScreen — Full mail UI with list, detail, claim, and filters.
 */
export class MailScreen {
  constructor(eventBus) {
    this.events = eventBus;
    this.el = null;
    this._activeFilter = 'all';
    this._selectedMail = null;
    this._mails = [];
  }

  show(container) {
    this.el = document.createElement('div');
    this.el.className = 'screen mail-screen';

    const header = document.createElement('div');
    header.className = 'screen-header';
    header.innerHTML = '<h1>📬 Mail</h1>';

    const content = document.createElement('div');
    content.className = 'screen-content';

    // Filters
    const filters = document.createElement('div');
    filters.className = 'mail-filters';
    ['all', 'unread', 'hasReward', 'claimed', 'expired'].forEach((f) => {
      const btn = document.createElement('button');
      btn.className = 'mail-filter-btn' + (f === this._activeFilter ? ' active' : '');
      btn.textContent = this._getFilterLabel(f);
      btn.dataset.filter = f;
      btn.addEventListener('click', () => {
        this._activeFilter = f;
        filters.querySelectorAll('.mail-filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this._renderList();
      });
      filters.appendChild(btn);
    });

    // Mail list
    const list = document.createElement('div');
    list.className = 'mail-list';
    list.id = 'mail-list';

    // Mail detail (hidden by default)
    const detail = document.createElement('div');
    detail.className = 'mail-detail hidden';
    detail.id = 'mail-detail';

    content.appendChild(filters);
    content.appendChild(list);
    content.appendChild(detail);

    this.el.appendChild(header);
    this.el.appendChild(content);
    container.appendChild(this.el);

    Logger.debug('MailScreen', 'Shown');
  }

  /**
   * Update mails from MailManager.
   */
  updateMails(mails) {
    this._mails = mails;
    this._renderList();
  }

  _renderList() {
    const listEl = this.el?.querySelector('#mail-list');
    const detailEl = this.el?.querySelector('#mail-detail');
    if (!listEl) return;

    // Show list, hide detail
    listEl.classList.remove('hidden');
    detailEl?.classList.add('hidden');

    const filtered = this._filterMails(this._activeFilter);

    if (filtered.length === 0) {
      listEl.innerHTML = '<div class="mail-empty">📭 No mail found</div>';
      return;
    }

    listEl.innerHTML = filtered.map((mail) => {
      const cat = MailConfig.CATEGORIES[mail.category] || MailConfig.CATEGORIES.announcement;
      const hasReward = mail.rewardType && mail.rewardAmount > 0;
      const isUnclaimed = hasReward && mail.claimStatus === 'unclaimed';
      const isExpired = mail.claimStatus === 'expired';

      return `
        <div class="mail-item ${!mail.read ? 'unread' : ''} ${isExpired ? 'expired' : ''}" data-id="${mail.id}">
          <div class="mail-item-icon" style="color: ${cat.color}">${cat.icon}</div>
          <div class="mail-item-content">
            <div class="mail-item-header">
              <span class="mail-item-title">${mail.title}</span>
              <span class="mail-item-date">${this._formatDate(mail.createdAt)}</span>
            </div>
            <div class="mail-item-preview">${this._getPreview(mail.content)}</div>
            <div class="mail-item-footer">
              ${hasReward ? '<span class="mail-item-reward">💎 ' + mail.rewardAmount.toLocaleString() + '</span>' : ''}
              ${isUnclaimed ? '<span class="mail-item-badge">NEW</span>' : ''}
              ${isExpired ? '<span class="mail-item-expired">EXPIRED</span>' : ''}
              ${mail.claimStatus === 'claimed' ? '<span class="mail-item-claimed">✅ Claimed</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind click events
    listEl.querySelectorAll('.mail-item').forEach((item) => {
      item.addEventListener('click', () => {
        const mailId = item.dataset.id;
        this._showDetail(mailId);
      });
    });
  }

  _showDetail(mailId) {
    const mail = this._mails.find((m) => m.id === mailId);
    if (!mail) return;

    this._selectedMail = mail;
    this.events.emit('mail:open', { mailId });

    const listEl = this.el?.querySelector('#mail-list');
    const detailEl = this.el?.querySelector('#mail-detail');
    if (!listEl || !detailEl) return;

    listEl.classList.add('hidden');
    detailEl.classList.remove('hidden');

    const cat = MailConfig.CATEGORIES[mail.category] || MailConfig.CATEGORIES.announcement;
    const hasReward = mail.rewardType && mail.rewardAmount > 0;
    const canClaim = hasReward && mail.claimStatus === 'unclaimed';
    const isExpired = mail.claimStatus === 'expired';

    detailEl.innerHTML = `
      <div class="mail-detail-card">
        <button class="mail-back-btn" id="mail-back">← Back</button>
        <div class="mail-detail-header">
          <span class="mail-detail-icon" style="color: ${cat.color}">${cat.icon}</span>
          <div>
            <div class="mail-detail-title">${mail.title}</div>
            <div class="mail-detail-category">${cat.label}</div>
          </div>
        </div>
        <div class="mail-detail-date">${this._formatDateFull(mail.createdAt)}</div>
        <div class="mail-detail-content">${mail.content}</div>
        ${hasReward ? `
          <div class="mail-detail-reward">
            <span class="mail-reward-label">Reward:</span>
            <span class="mail-reward-amount">💎 ${mail.rewardAmount.toLocaleString()} Diamond</span>
          </div>
        ` : ''}
        <div class="mail-detail-actions">
          ${canClaim ? '<button class="btn btn-gold mail-claim-btn" id="mail-claim">🎁 Claim Reward</button>' : ''}
          ${isExpired ? '<div class="mail-expired-notice">⏰ This mail has expired</div>' : ''}
          ${mail.claimStatus === 'claimed' ? '<div class="mail-claimed-notice">✅ Reward already claimed</div>' : ''}
        </div>
      </div>
    `;

    // Back button
    detailEl.querySelector('#mail-back')?.addEventListener('click', () => {
      this._renderList();
    });

    // Claim button
    detailEl.querySelector('#mail-claim')?.addEventListener('click', () => {
      this._handleClaim(mailId);
    });
  }

  _handleClaim(mailId) {
    this.events.emit('mail:claimRequest', { mailId });
  }

  _filterMails(filter) {
    switch (filter) {
      case 'unread': return this._mails.filter((m) => !m.read);
      case 'hasReward': return this._mails.filter((m) => m.rewardType && m.rewardAmount > 0 && m.claimStatus === 'unclaimed');
      case 'claimed': return this._mails.filter((m) => m.claimStatus === 'claimed');
      case 'expired': return this._mails.filter((m) => m.claimStatus === 'expired');
      default: return this._mails;
    }
  }

  _getFilterLabel(filter) {
    const labels = {
      all: 'All',
      unread: 'Unread',
      hasReward: '🎁 Rewards',
      claimed: 'Claimed',
      expired: 'Expired',
    };
    return labels[filter] || filter;
  }

  _getPreview(content) {
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  }

  _formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return date.toLocaleDateString();
  }

  _formatDateFull(isoString) {
    return new Date(isoString).toLocaleString();
  }

  hide() { this.el?.remove(); }
  destroy() { this.el?.remove(); }
}
