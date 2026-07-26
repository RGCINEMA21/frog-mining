import { Logger } from '@utils/logger.js';
import { showDialog } from '@ui/components/Dialog.js';
import { Config } from '@core/Config.js';

/**
 * SettingsScreen — Settings page matching design reference.
 */
export class SettingsScreen {
  constructor(eventBus) {
    this.events = eventBus;
    this.el = null;
  }

  show(container) {
    this.el = document.createElement('div');
    this.el.className = 'screen settings-screen';

    this.el.innerHTML = `
      <div class="settings-header">
        <div class="settings-header-left">
          <span class="settings-back" id="settings-back">‹</span>
        </div>
        <h1 class="settings-title">Pengaturan</h1>
        <div class="settings-header-right"></div>
      </div>

      <div class="settings-content">
        <div class="settings-card">
          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-icon">🔊</span>
              <span class="settings-row-label">Suara</span>
            </div>
            <label class="toggle">
              <input type="checkbox" checked id="toggle-sound">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-icon">🎵</span>
              <span class="settings-row-label">Musik</span>
            </div>
            <label class="toggle">
              <input type="checkbox" id="toggle-music">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-card">
          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-icon">🌐</span>
              <span class="settings-row-label">Bahasa</span>
            </div>
            <div class="settings-row-right">
              <span class="settings-row-value">Indonesia</span>
              <span class="settings-row-arrow">›</span>
            </div>
          </div>

          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-icon">📋</span>
              <span class="settings-row-label">Versi</span>
            </div>
            <span class="settings-row-value">${Config.APP.VERSION}</span>
          </div>
        </div>

        <button class="settings-logout-btn" id="settings-logout">
          Keluar
        </button>
      </div>
    `;

    container.appendChild(this.el);

    // Sound toggle
    this.el.querySelector('#toggle-sound').addEventListener('change', (e) => {
      this.events.emit('settings:soundToggle', e.target.checked);
    });

    // Music toggle
    this.el.querySelector('#toggle-music').addEventListener('change', (e) => {
      this.events.emit('settings:musicToggle', e.target.checked);
    });

    // Logout
    this.el.querySelector('#settings-logout').addEventListener('click', () => {
      showDialog({
        title: 'Keluar',
        message: 'Yakin ingin keluar? Data kamu akan tetap tersimpan.',
        confirmLabel: 'Keluar',
        cancelLabel: 'Batal',
        onConfirm: () => {
          this.events.emit('settings:logout');
        },
      });
    });

    // Back button (go home)
    this.el.querySelector('#settings-back').addEventListener('click', () => {
      this.events.emit('nav:change', '/');
    });

    Logger.debug('SettingsScreen', 'Shown');
  }

  hide() { this.el?.remove(); }
  destroy() { this.el?.remove(); }
}
