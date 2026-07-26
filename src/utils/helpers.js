export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function formatNumber(num) {
  return num.toLocaleString();
}

export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') el.className = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value);
  }
  for (const child of children) {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child) el.appendChild(child);
  }
  return el;
}
