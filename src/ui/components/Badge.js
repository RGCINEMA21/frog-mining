/**
 * Badge — Notification badge count.
 */
export function createBadge(count) {
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = count > 99 ? '99+' : String(count);
  if (count === 0) badge.classList.add('badge-hidden');
  return badge;
}
