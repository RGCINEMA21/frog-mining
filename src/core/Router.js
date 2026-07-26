import { Logger } from '@utils/logger.js';

/**
 * Router — Client-side hash router.
 * Uses hash (#) routing for simplicity and Telegram Mini App compatibility.
 */
export class Router {
  constructor(eventBus) {
    this.events = eventBus;
    this.routes = new Map();
    this.currentRoute = null;
    this._onHashChange = this._handleHashChange.bind(this);
  }

  init(routes) {
    routes.forEach((route) => {
      this.routes.set(route.path, route);
    });

    window.addEventListener('hashchange', this._onHashChange);
    this._handleHashChange();

    Logger.info('Router', `Initialized with ${routes.length} routes`);
  }

  navigate(path) {
    window.location.hash = path;
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  _handleHashChange() {
    const hash = window.location.hash.slice(1) || '/';
    const route = this.routes.get(hash);

    if (route) {
      const prev = this.currentRoute;
      this.currentRoute = route;
      this.events.emit('route:change', { from: prev, to: route });
      Logger.debug('Router', `Navigate: ${hash}`);
    } else {
      this.navigate('/');
    }
  }

  destroy() {
    window.removeEventListener('hashchange', this._onHashChange);
  }
}
