import { Logger } from '@utils/logger.js';

/**
 * SplashScreen — Loading screen with logo animation.
 * Shows for ~2 seconds then navigates to landing.
 */
export class SplashScreen {
  constructor(eventBus) {
    this.events = eventBus;
    this.el = null;
  }

  show(container) {
    this.el = document.createElement('div');
    this.el.className = 'screen splash-screen';
    this.el.innerHTML = `
      <div class="splash-content">
        <div class="splash-logo">
          <div class="splash-frog">🐸</div>
          <div class="splash-title">Frog Mining</div>
          <div class="splash-subtitle">Collect & Climb!</div>
        </div>
        <div class="splash-loader">
          <div class="splash-loader-bar"></div>
        </div>
      </div>
    `;
    container.appendChild(this.el);

    // Auto-navigate after animation
    setTimeout(() => {
      this.events.emit('splash:complete');
    }, 2200);

    Logger.debug('SplashScreen', 'Shown');
  }

  hide() { this.el?.remove(); }
  destroy() { this.el?.remove(); }
}
