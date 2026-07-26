/**
 * Logger — Development logging utility.
 * Logs are only shown in development mode.
 */

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const COLORS = {
  DEBUG: '#888',
  INFO: '#48BFE3',
  WARN: '#F4845F',
  ERROR: '#E63946',
};

let currentLevel = LEVELS.DEBUG;

function formatTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function log(level, tag, message, data) {
  if (LEVELS[level] < currentLevel) return;

  const time = formatTime();
  const color = COLORS[level];
  const prefix = `[${time}] [${level}] [${tag}]`;

  if (data !== undefined) {
    console.log(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold`, data);
  } else {
    console.log(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold`);
  }
}

export const Logger = {
  debug: (tag, msg, data) => log('DEBUG', tag, msg, data),
  info: (tag, msg, data) => log('INFO', tag, msg, data),
  warn: (tag, msg, data) => log('WARN', tag, msg, data),
  error: (tag, msg, data) => log('ERROR', tag, msg, data),
  setLevel: (level) => { currentLevel = LEVELS[level] || 0; },
};
