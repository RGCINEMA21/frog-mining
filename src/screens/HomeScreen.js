import { Logger } from '@utils/logger.js';

/**
 * HomeScreen — Main gameplay screen with frog, score, and auto mining.
 */
export class HomeScreen {
  constructor(eventBus) {
    this.events = eventBus;
    this.el = null;
    this._tapEnabled = true;
  }

  show(container) {
    this.el = document.createElement('div');
    this.el.className = 'screen home-screen';
    this.el.innerHTML = `
      <div class="home-top">
        <div class="home-stat">
          <div class="home-stat-value gold" id="home-score">0</div>
          <div class="home-stat-label">SCORE</div>
        </div>
        <div class="home-stat">
          <div class="home-stat-value crystal" id="home-diamond">💎 0</div>
          <div class="home-stat-label">DIAMOND</div>
        </div>
      </div>

      <div class="home-center">
        <div class="frog-container" id="frog-container">
          <div class="frog-glow" id="frog-glow"></div>
          <div class="frog-head" id="frog-head">🐸</div>
          <div class="frog-shadow"></div>
        </div>
      </div>

      <div class="home-bottom">
        <!-- Auto Mining Status (when active) -->
        <div class="mining-status hidden" id="mining-status">
          <div class="mining-status-header">
            <span class="mining-status-icon">⛏️</span>
            <span class="mining-status-title">Auto Mining Active</span>
          </div>
          <div class="mining-status-timer" id="mining-timer">--:--:--</div>
          <div class="mining-progress">
            <div class="mining-fill" id="mining-fill"></div>
          </div>
          <div class="mining-status-score">+1/sec • <span id="mining-total">0</span> score earned</div>
        </div>

        <!-- Auto Mining Activation (when inactive) -->
        <div class="mining-activate" id="mining-activate">
          <div class="mining-activate-title">⛏️ Auto Mining</div>
          <div class="mining-activate-subtitle">Earn score while you sleep!</div>
          <div class="mining-packages" id="mining-packages"></div>
        </div>
      </div>
    `;
    container.appendChild(this.el);

    // Bind frog tap
    const frog = this.el.querySelector('#frog-head');
    frog.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleTap();
    });
    frog.addEventListener('touchend', (e) => {
      e.preventDefault();
    });

    Logger.debug('HomeScreen', 'Shown');
  }

  _handleTap() {
    if (!this._tapEnabled) return;
    this.events.emit('game:tap');
    this._animateFrog();
    this._animateFloatingPlus();
    this._animateGlow();
  }

  _animateFrog() {
    const frog = this.el?.querySelector('#frog-head');
    if (!frog) return;
    frog.classList.remove('frog-tap');
    void frog.offsetWidth;
    frog.classList.add('frog-tap');
    setTimeout(() => frog.classList.remove('frog-tap'), 300);
  }

  _animateFloatingPlus() {
    const container = this.el?.querySelector('#frog-container');
    if (!container) return;
    const float = document.createElement('div');
    float.className = 'floating-plus';
    float.textContent = '+1';
    float.style.left = 'calc(50% + ' + (Math.random() * 40 - 20) + 'px)';
    container.appendChild(float);
    setTimeout(() => float.remove(), 800);
  }

  _animateGlow() {
    const glow = this.el?.querySelector('#frog-glow');
    if (!glow) return;
    glow.classList.remove('glow-pulse');
    void glow.offsetWidth;
    glow.classList.add('glow-pulse');
    setTimeout(() => glow.classList.remove('glow-pulse'), 200);
  }

  // ═══ Score Updates ═══

  updateScore(score) {
    const el = this.el?.querySelector('#home-score');
    if (!el) return;
    const old = parseInt(el.textContent.replace(/,/g, '')) || 0;
    el.textContent = score.toLocaleString();
    if (score !== old) {
      el.classList.remove('score-pulse');
      void el.offsetWidth;
      el.classList.add('score-pulse');
      setTimeout(() => el.classList.remove('score-pulse'), 200);
    }
  }

  updateDiamonds(count) {
    const el = this.el?.querySelector('#home-diamond');
    if (el) el.textContent = '💎 ' + count.toLocaleString();
  }

  // ═══ Auto Mining UI ═══

  showMiningPackages(packages, canAfford, onSelect) {
    const container = this.el?.querySelector('#mining-packages');
    const activate = this.el?.querySelector('#mining-activate');
    const status = this.el?.querySelector('#mining-status');
    if (!container || !activate || !status) return;

    activate.classList.remove('hidden');
    status.classList.add('hidden');

    container.innerHTML = packages.map((pkg) => `
      <div class="mining-package ${!canAfford(pkg.key) ? 'disabled' : ''}" data-package="${pkg.key}">
        <div class="mining-package-info">
          <div class="mining-package-name">${pkg.label}</div>
          <div class="mining-package-details">
            <span class="mining-package-duration">⏱️ ${pkg.durationFormatted}</span>
            <span class="mining-package-score">+${pkg.totalScore.toLocaleString()} score</span>
          </div>
        </div>
        <div class="mining-package-price">
          <span class="mining-diamond">💎 ${pkg.price.toLocaleString()}</span>
          <button class="btn btn-sm btn-primary mining-buy-btn" ${!canAfford(pkg.key) ? 'disabled' : ''}>
            ${canAfford(pkg.key) ? 'Activate' : 'Need more 💎'}
          </button>
        </div>
      </div>
    `).join('');

    // Bind buttons
    container.querySelectorAll('.mining-buy-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.mining-package');
        const pkgKey = card?.dataset.package;
        if (pkgKey && !btn.disabled) {
          onSelect(pkgKey);
        }
      });
    });
  }

  showMiningActive(status) {
    const activate = this.el?.querySelector('#mining-activate');
    const statusEl = this.el?.querySelector('#mining-status');
    if (!activate || !statusEl) return;

    activate.classList.add('hidden');
    statusEl.classList.remove('hidden');

    this._updateMiningTimer(status.remainingMs, status.remainingFormatted);
  }

  updateMiningTick(remainingMs, remainingFormatted) {
    this._updateMiningTimer(remainingMs, remainingFormatted);
  }

  _updateMiningTimer(remainingMs, formatted) {
    const timer = this.el?.querySelector('#mining-timer');
    const fill = this.el?.querySelector('#mining-fill');
    if (timer) timer.textContent = formatted;
    if (fill) {
      // Get total duration from package
      const data = window.__game?.gameDataManager?.getData();
      const totalMs = data?.autoMining?.endTime
        ? (new Date(data.autoMining.endTime).getTime() - new Date(data.autoMining.startTime).getTime())
        : 1;
      const pct = (remainingMs / totalMs) * 100;
      fill.style.width = Math.max(0, pct) + '%';
    }
  }

  updateMiningTotalScore(score) {
    const el = this.el?.querySelector('#mining-total');
    if (el) el.textContent = score.toLocaleString();
  }

  hideMiningActive() {
    const activate = this.el?.querySelector('#mining-activate');
    const status = this.el?.querySelector('#mining-status');
    if (activate) activate.classList.remove('hidden');
    if (status) status.classList.add('hidden');
  }

  setTapEnabled(enabled) {
    this._tapEnabled = enabled;
  }

  hide() { this.el?.remove(); }
  destroy() { this.el?.remove(); }
}
