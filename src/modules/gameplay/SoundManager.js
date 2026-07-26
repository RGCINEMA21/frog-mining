import { Logger } from '@utils/logger.js';

/**
 * SoundManager — Handles all game audio.
 * Uses Web Audio API for lightweight sound effects.
 */
export class SoundManager {
  constructor(eventBus) {
    this.events = eventBus;
    this._enabled = true;
    this._musicEnabled = false;
    this._audioCtx = null;
    this._sounds = {};
  }

  init() {
    // Create audio context on first user interaction
    this._initOnInteraction();
    Logger.info('SoundManager', 'Initialized');
  }

  _initOnInteraction() {
    const init = () => {
      if (!this._audioCtx) {
        try {
          this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          Logger.debug('SoundManager', 'AudioContext created');
        } catch (e) {
          Logger.warn('SoundManager', 'Web Audio not supported');
        }
      }
      document.removeEventListener('touchstart', init);
      document.removeEventListener('click', init);
    };
    document.addEventListener('touchstart', init, { once: true });
    document.addEventListener('click', init, { once: true });
  }

  /**
   * Play a tap sound effect.
   */
  playTap() {
    if (!this._enabled || !this._audioCtx) return;
    this._playBoing();
  }

  /**
   * Play a reward/success sound.
   */
  playReward() {
    if (!this._enabled || !this._audioCtx) return;
    this._playChime();
  }

  /**
   * Play a button click sound.
   */
  playClick() {
    if (!this._enabled || !this._audioCtx) return;
    this._playClick();
  }

  /**
   * Play error sound.
   */
  playError() {
    if (!this._enabled || !this._audioCtx) return;
    this._playBonk();
  }

  // ── Sound generators ──

  _playBoing() {
    const ctx = this._audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  _playChime() {
    const ctx = this._audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }

  _playClick() {
    const ctx = this._audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  _playBonk() {
    const ctx = this._audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  // ── Controls ──

  setEnabled(enabled) {
    this._enabled = enabled;
    Logger.debug('SoundManager', 'Sound ' + (enabled ? 'enabled' : 'disabled'));
  }

  isEnabled() {
    return this._enabled;
  }

  setMusicEnabled(enabled) {
    this._musicEnabled = enabled;
  }

  isMusicEnabled() {
    return this._musicEnabled;
  }

  destroy() {
    this._audioCtx?.close();
  }
}
