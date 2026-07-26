import { Logger } from '@utils/logger.js';

/**
 * Header — Top bar with Diamond, Rank, and Mail badge.
 */
export class Header {
  constructor(container) {
    this.container = container;
    this.el = null;
  }

  render() {
    this.el = document.createElement('header');
    this.el.className = 'app-header';
    this.el.innerHTML = `
      <div class="header-content">
        <div class="header-left">
          <span class="header-diamond">💎 <span id="header-diamond-count">0</span></span>
        </div>
        <div class="header-center">
          <span class="header-title">🐸 Frog Mining</span>
        </div>
        <div class="header-right">
          <span class="header-rank">🏆 <span id="header-rank">#--</span></span>
          <span class="header-mail-badge hidden" id="header-mail-badge">
            <span id="header-mail-count">0</span>
          </span>
        </div>
      </div>
    `;
    this.container.appendChild(this.el);
    return this;
  }

  updateDiamonds(count) {
    const el = this.el?.querySelector('#header-diamond-count');
    if (el) el.textContent = count.toLocaleString();
  }

  updateRank(rank) {
    const el = this.el?.querySelector('#header-rank');
    if (el) el.textContent = '#' + rank;
  }

  updateMailCount(count) {
    const badge = this.el?.querySelector('#header-mail-badge');
    const countEl = this.el?.querySelector('#header-mail-count');
    if (!badge || !countEl) return;

    if (count > 0) {
      badge.classList.remove('hidden');
      countEl.textContent = count > 99 ? '99+' : count;
    } else {
      badge.classList.add('hidden');
    }
  }

  destroy() {
    this.el?.remove();
  }
}
