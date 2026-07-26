import { Logger } from '@utils/logger.js';
import { createButton } from '@ui/components/Button.js';

const PACKAGES = [
  { id: 'starter', name: 'Starter Pack', diamond: 10, price: 'Rp 5.000', popular: false },
  { id: 'basic', name: 'Basic Pack', diamond: 50, price: 'Rp 20.000', popular: false },
  { id: 'mega', name: 'Mega Pack', diamond: 200, price: 'Rp 50.000', popular: true },
  { id: 'ultimate', name: 'Ultimate Pack', diamond: 500, price: 'Rp 100.000', popular: false },
];

export class ShopScreen {
  constructor(eventBus) {
    this.events = eventBus;
    this.el = null;
  }

  show(container) {
    this.el = document.createElement('div');
    this.el.className = 'screen shop-screen';

    const header = document.createElement('div');
    header.className = 'screen-header';
    header.innerHTML = '<h1>🛒 Shop</h1><div class="shop-balance">💎 <span id="shop-diamond">0</span></div>';

    const grid = document.createElement('div');
    grid.className = 'shop-grid';

    PACKAGES.forEach((pkg) => {
      const card = document.createElement('div');
      card.className = 'shop-card' + (pkg.popular ? ' popular' : '');
      card.innerHTML = `
        ${pkg.popular ? '<div class="shop-popular-badge">POPULAR</div>' : ''}
        <div class="shop-card-diamond">💎 ${pkg.diamond}</div>
        <div class="shop-card-name">${pkg.name}</div>
        <div class="shop-card-price">${pkg.price}</div>
      `;
      const btn = createButton({
        label: 'Beli',
        variant: pkg.popular ? 'gold' : 'primary',
        onClick: () => {
          this.events.emit('shop:buy', { productId: pkg.id });
        },
      });
      card.appendChild(btn);
      grid.appendChild(card);
    });

    const content = document.createElement('div');
    content.className = 'screen-content';
    content.appendChild(grid);

    this.el.appendChild(header);
    this.el.appendChild(content);
    container.appendChild(this.el);
    Logger.debug('ShopScreen', 'Shown');
  }

  updateDiamonds(count) {
    const el = this.el?.querySelector('#shop-diamond');
    if (el) el.textContent = count.toLocaleString();
  }

  hide() { this.el?.remove(); }
  destroy() { this.el?.remove(); }
}
