/**
 * EventBus — Lightweight pub/sub event system.
 * Decouples game modules from each other.
 */
export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  once(event, callback) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      callback(...args);
    };
    return this.on(event, wrapper);
  }

  off(event, callback) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) this._listeners.delete(event);
    }
  }

  emit(event, ...args) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      for (const cb of listeners) cb(...args);
    }
  }

  clear() {
    this._listeners.clear();
  }
}
