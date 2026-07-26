import { Logger } from '@utils/logger.js';
import { showDialog } from '@ui/components/Dialog.js';

/**
 * SettingsScreen — Settings with sound toggle and logout.
 */
export class SettingsScreen {
  constructor(eventBus) {
    this.events = eventBus;
    this.el = null;
  }

  show(container) {
    this.el = document.createElement('div');
    this.el.className = 'screen settings-screen';

    const header = document.createElement('div');
    header.className = 'screen-header';
    header.innerHTML = '<h1>⚙️ Settings</h1>';

    const content = document.createElement('div');
    content.className = 'screen-content';
    content.innerHTML = `
      <div class="settings-group">
        <div class="settings-item">
          <span>🔊 Sound Effects</span>
          <label class="toggle">
            <input type="checkbox" checked id="toggle-sound">
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-item">
          <span>🎵 Music</span>
          <label class="toggle">
            <input type="checkbox" id="toggle-music">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      <div class="settings-group">
        <div class="settings-item">
          <span>🌐 Language</span>
          <span class="settings-value">English</span>
        </div>
        <div class="settings-item">
          <span>📱 Version</span>
          <span class="settings-value">v0.1.0</span>
        </div>
      </div>
      <div class="settings-group">
        <div class="settings-item clickable" id="settings-about">
          <span>ℹ️ About Frog Mining</span>
          <span class="settings-arrow">›</span>
        </div>
      </div>
      <div class="settings-group">
        <div class="settings-item clickable logout-item" id="settings-logout">
          <span>🚪 Logout</span>
          <span class="settings-arrow">›</span>
        </div>
      </div>
    `;

    // Sound toggle
    const soundToggle = content.querySelector('#toggle-sound');
    soundToggle.addEventListener('change', (e) => {
      this.events.emit('settings:soundToggle', e.target.checked);
    });

    // Logout
    const logoutBtn = content.querySelector('#settings-logout');
    logoutBtn.addEventListener('click', () => {
      showDialog({
        title: 'Logout',
        message: 'Are you sure you want to logout? Your data will be saved.',
        confirmLabel: 'Logout',
        cancelLabel: 'Cancel',
        onConfirm: () => {
          this.events.emit('settings:logout');
        },
      });
    });

    this.el.appendChild(header);
    this.el.appendChild(content);
    container.appendChild(this.el);
    Logger.debug('SettingsScreen', 'Shown');
  }

  hide() { this.el?.remove(); }
  destroy() { this.el?.remove(); }
}
