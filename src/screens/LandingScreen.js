import { Logger } from '@utils/logger.js';
import { createButton } from '@ui/components/Button.js';
import { createInput } from '@ui/components/Input.js';

/**
 * LandingScreen — Welcome page with username input and validation.
 */
export class LandingScreen {
  constructor(eventBus) {
    this.events = eventBus;
    this.el = null;
    this._username = '';
    this._errorEl = null;
    this._btnEl = null;
  }

  show(container) {
    this.el = document.createElement('div');
    this.el.className = 'screen landing-screen';

    const content = document.createElement('div');
    content.className = 'landing-content';

    // Logo
    const logo = document.createElement('div');
    logo.className = 'landing-logo';
    logo.innerHTML = `
      <div class="landing-frog">🐸</div>
      <div class="landing-title">Frog Mining</div>
      <div class="landing-tagline">Tap. Mine. Climb!</div>
    `;

    // Input
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'landing-input-wrapper';
    const input = createInput({
      placeholder: 'Enter username (3-20 chars)',
      maxLength: 20,
      onInput: (val) => {
        this._username = val;
        this._clearError();
        this._validateLive(val);
      },
    });
    inputWrapper.appendChild(input.el);

    // Error display
    this._errorEl = document.createElement('div');
    this._errorEl.className = 'landing-error hidden';
    inputWrapper.appendChild(this._errorEl);

    // Button
    this._btnEl = createButton({
      label: '🎮  Mulai Bermain',
      variant: 'gold',
      className: 'landing-btn',
      onClick: () => {
        this._handleSubmit();
      },
    });

    // Enter key support
    input.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleSubmit();
    });

    content.appendChild(logo);
    content.appendChild(inputWrapper);
    content.appendChild(this._btnEl);
    this.el.appendChild(content);
    container.appendChild(this.el);

    setTimeout(() => input.input.focus(), 500);
    Logger.debug('LandingScreen', 'Shown');
  }

  _handleSubmit() {
    const trimmed = this._username.trim();
    if (trimmed.length === 0) {
      this._showError('Please enter a username');
      return;
    }

    // Emit with validation result
    this.events.emit('landing:start', { username: trimmed });
  }

  _validateLive(value) {
    const trimmed = value.trim();
    if (trimmed.length > 0 && trimmed.length < 3) {
      this._showError('At least 3 characters needed');
    }
  }

  _showError(message) {
    if (!this._errorEl) return;
    this._errorEl.textContent = message;
    this._errorEl.classList.remove('hidden');
  }

  _clearError() {
    if (this._errorEl) {
      this._errorEl.classList.add('hidden');
    }
  }

  hide() { this.el?.remove(); }
  destroy() { this.el?.remove(); }
}
