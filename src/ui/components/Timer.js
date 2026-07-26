/**
 * Timer — Countdown display with progress bar.
 */
export class Timer {
  constructor({ totalMs, onComplete, onTick }) {
    this.totalMs = totalMs;
    this.remainingMs = totalMs;
    this.onComplete = onComplete;
    this.onTick = onTick;
    this._intervalId = null;
    this.el = null;
  }

  render() {
    this.el = document.createElement('div');
    this.el.className = 'timer-component';
    this.el.innerHTML = `
      <div class="timer-label">⏱️ <span class="timer-time">${this._fmt(this.remainingMs)}</span></div>
      <div class="timer-progress"><div class="timer-fill" style="width:100%"></div></div>
    `;
    return this.el;
  }

  start() {
    this._intervalId = setInterval(() => {
      this.remainingMs -= 1000;
      if (this.remainingMs <= 0) { this.remainingMs = 0; this.stop(); this.onComplete?.(); }
      this._update();
      this.onTick?.(this.remainingMs);
    }, 1000);
  }

  stop() { clearInterval(this._intervalId); this._intervalId = null; }

  _update() {
    if (!this.el) return;
    const pct = (this.remainingMs / this.totalMs) * 100;
    this.el.querySelector('.timer-time').textContent = this._fmt(this.remainingMs);
    this.el.querySelector('.timer-fill').style.width = pct + '%';
  }

  _fmt(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? h + 'h ' + m + 'm' : m + 'm ' + sec + 's';
  }

  destroy() { this.stop(); this.el?.remove(); }
}
