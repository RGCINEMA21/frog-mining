/**
 * Popup — Lightweight toast notification.
 */
let popupQueue = [];
let popupActive = false;

function showNext() {
  if (popupQueue.length === 0) { popupActive = false; return; }
  popupActive = true;
  const { message, type, duration } = popupQueue.shift();
  const popup = document.createElement('div');
  popup.className = `popup popup-${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  popup.innerHTML = `<span class="popup-icon">${icons[type] || 'ℹ️'}</span><span class="popup-message">${message}</span>`;
  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.classList.add('active'));
  setTimeout(() => {
    popup.classList.remove('active');
    setTimeout(() => { popup.remove(); showNext(); }, 300);
  }, duration || 2000);
}

export function showPopup(message, type = 'success', duration = 2000) {
  popupQueue.push({ message, type, duration });
  if (!popupActive) showNext();
}
