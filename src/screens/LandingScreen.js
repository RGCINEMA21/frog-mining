import { Logger } from '@utils/logger.js';
import { createButton } from '@ui/components/Button.js';
import { createInput } from '@ui/components/Input.js';

/**
 * LandingScreen — Email/password registration and login.
 */
export class LandingScreen {
  constructor(eventBus) {
    this.events = eventBus;
    this.el = null;
    this._mode = 'register'; // 'register' or 'login'
    this._email = '';
    this._password = '';
    this._username = '';
    this._errorEl = null;
    this._usernameGroup = null;
    this._btnEl = null;
    this._toggleEl = null;
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

    // Form
    const form = document.createElement('div');
    form.className = 'landing-form';

    // Username (only for register)
    this._usernameGroup = document.createElement('div');
    this._usernameGroup.className = 'landing-field-group';
    const usernameInput = createInput({
      placeholder: 'Username (3-20 karakter)',
      maxLength: 20,
      onInput: (val) => { this._username = val; this._clearError(); },
    });
    this._usernameGroup.appendChild(usernameInput.el);
    this._usernameInput = usernameInput.input;

    // Email
    const emailGroup = document.createElement('div');
    emailGroup.className = 'landing-field-group';
    const emailInput = createInput({
      placeholder: 'Email',
      type: 'email',
      onInput: (val) => { this._email = val; this._clearError(); },
    });
    emailGroup.appendChild(emailInput.el);
    this._emailInput = emailInput.input;
    this._emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._passwordInput?.focus();
    });

    // Password
    const passGroup = document.createElement('div');
    passGroup.className = 'landing-field-group';
    const passInput = createInput({
      placeholder: 'Kata sandi (min. 6 karakter)',
      type: 'password',
      onInput: (val) => { this._password = val; this._clearError(); },
    });
    passGroup.appendChild(passInput.el);
    this._passwordInput = passInput.input;
    this._passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleSubmit();
    });

    // Error
    this._errorEl = document.createElement('div');
    this._errorEl.className = 'landing-error hidden';

    // Submit button
    this._btnEl = createButton({
      label: '🎮  Daftar',
      variant: 'gold',
      className: 'landing-btn',
      onClick: () => this._handleSubmit(),
    });

    // Toggle register/login
    this._toggleEl = document.createElement('div');
    this._toggleEl.className = 'landing-toggle';
    this._toggleEl.innerHTML = `
      <span class="landing-toggle-text">Sudah punya akun?</span>
      <span class="landing-toggle-link" id="toggle-mode">Masuk</span>
    `;

    form.appendChild(this._usernameGroup);
    form.appendChild(emailGroup);
    form.appendChild(passGroup);
    form.appendChild(this._errorEl);
    form.appendChild(this._btnEl);
    form.appendChild(this._toggleEl);

    content.appendChild(logo);
    content.appendChild(form);
    this.el.appendChild(content);
    container.appendChild(this.el);

    // Toggle mode
    this._toggleEl.querySelector('#toggle-mode').addEventListener('click', () => {
      this._mode = this._mode === 'register' ? 'login' : 'register';
      this._updateMode();
    });

    // Listen for switch to login after register success
    this.events.on('landing:showLogin', ({ email }) => {
      this._mode = 'login';
      this._email = email || '';
      this._updateMode();
      if (this._emailInput) this._emailInput.value = this._email;
      if (this._passwordInput) { this._passwordInput.value = ''; this._passwordInput.focus(); }
    });

    this._updateMode();
    Logger.debug('LandingScreen', 'Shown');
  }

  _updateMode() {
    const isRegister = this._mode === 'register';
    this._usernameGroup.style.display = isRegister ? 'block' : 'none';
    this._btnEl.el.querySelector('button').textContent = isRegister ? '🎮  Daftar' : '🎮  Masuk';
    this._toggleEl.querySelector('.landing-toggle-text').textContent = isRegister ? 'Sudah punya akun?' : 'Belum punka akun?';
    this._toggleEl.querySelector('#toggle-mode').textContent = isRegister ? 'Masuk' : 'Daftar';
    this._clearError();
    setTimeout(() => {
      if (isRegister) this._usernameInput?.focus();
      else this._emailInput?.focus();
    }, 100);
  }

  _handleSubmit() {
    const email = this._email.trim();
    const password = this._password.trim();

    if (!email) { this._showError('Masukkan email'); return; }
    if (!email.includes('@')) { this._showError('Email tidak valid'); return; }
    if (!password) { this._showError('Masukkan kata sandi'); return; }
    if (password.length < 6) { this._showError('Kata sandi minimal 6 karakter'); return; }

    if (this._mode === 'register') {
      const username = this._username.trim();
      if (!username) { this._showError('Masukkan username'); return; }
      if (username.length < 3) { this._showError('Username minimal 3 karakter'); return; }
      if (username.length > 20) { this._showError('Username maksimal 20 karakter'); return; }
      this.events.emit('landing:start', { mode: 'register', username, email, password });
    } else {
      this.events.emit('landing:start', { mode: 'login', email, password });
    }
  }

  _showError(msg) {
    if (!this._errorEl) return;
    this._errorEl.textContent = msg;
    this._errorEl.classList.remove('hidden');
  }

  _clearError() {
    if (this._errorEl) this._errorEl.classList.add('hidden');
  }

  hide() { this.el?.remove(); }
  destroy() { this.el?.remove(); }
}
