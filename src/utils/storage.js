import { Config } from '@core/Config.js';

const PREFIX = Config.STORAGE_KEY + ':';

export function save(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
    return true;
  } catch { return false; }
}

export function load(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function clear() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
