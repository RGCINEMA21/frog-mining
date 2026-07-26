/**
 * Button — Reusable button component.
 */
export function createButton({ label, icon, variant = 'primary', onClick, className = '' }) {
  const btn = document.createElement('button');
  btn.className = `btn btn-${variant} ${className}`.trim();
  if (icon) btn.innerHTML = `<span class="btn-icon">${icon}</span>`;
  if (label) btn.innerHTML += `<span class="btn-label">${label}</span>`;
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}
