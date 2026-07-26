/**
 * Card — Reusable card container.
 */
export function createCard({ content, className = '', onClick }) {
  const card = document.createElement('div');
  card.className = `card ${className}`.trim();
  if (typeof content === 'string') card.innerHTML = content;
  else if (content) card.appendChild(content);
  if (onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', onClick);
  }
  return card;
}
