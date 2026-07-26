/**
 * Modal — Overlay dialog with slide-up animation.
 */
export function createModal({ title, content, actions = [], onClose }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-handle"></div>
    <div class="modal-header">${title || ''}</div>
    <div class="modal-body"></div>
    <div class="modal-actions"></div>
  `;

  const body = modal.querySelector('.modal-body');
  if (typeof content === 'string') body.innerHTML = content;
  else if (content) body.appendChild(content);

  const actionsEl = modal.querySelector('.modal-actions');
  actions.forEach(({ label, variant = 'primary', onClick: actionClick }) => {
    const btn = document.createElement('button');
    btn.className = `btn btn-${variant}`;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      actionClick?.();
      closeModal();
    });
    actionsEl.appendChild(btn);
  });

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  function closeModal() {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
    onClose?.();
  }

  return { close: closeModal, el: overlay };
}
