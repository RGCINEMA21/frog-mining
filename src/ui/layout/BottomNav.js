import { Config } from '@core/Config.js';
import { Logger } from '@utils/logger.js';

/**
 * BottomNav — Bottom navigation bar with 5 menu items.
 */
export class BottomNav {
  constructor(container, eventBus) {
    this.container = container;
    this.events = eventBus;
    this.el = null;
    this._activePath = '/';
  }

  render() {
    this.el = document.createElement('nav');
    this.el.className = 'bottom-nav';

    const items = Config.ROUTES.filter((r) => r.path !== '/settings');
    const settingsRoute = Config.ROUTES.find((r) => r.path === '/settings');

    this.el.innerHTML = items.map((route) => `
      <button class="nav-item${route.path === this._activePath ? ' active' : ''}"
              data-path="${route.path}">
        <span class="nav-icon">${route.icon}</span>
        <span class="nav-label">${route.label}</span>
      </button>
    `).join('') + `
      <button class="nav-item${settingsRoute.path === this._activePath ? ' active' : ''}"
              data-path="${settingsRoute.path}">
        <span class="nav-icon">${settingsRoute.icon}</span>
        <span class="nav-label">${settingsRoute.label}</span>
      </button>
    `;

    this.el.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const path = btn.dataset.path;
        this.setActive(path);
        this.events.emit('nav:change', path);
      });
    });

    this.container.appendChild(this.el);
    Logger.debug('BottomNav', 'Rendered');
    return this;
  }

  setActive(path) {
    this._activePath = path;
    this.el.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.path === path);
    });
  }

  destroy() {
    this.el?.remove();
  }
}
