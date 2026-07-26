import { createModal } from './Modal.js';

/**
 * Dialog — Confirmation dialog.
 */
export function showDialog({ title, message, confirmLabel = 'OK', cancelLabel, onConfirm, onCancel }) {
  const actions = [];
  if (cancelLabel) actions.push({ label: cancelLabel, variant: 'secondary', onClick: onCancel });
  actions.push({ label: confirmLabel, variant: 'primary', onClick: onConfirm });
  return createModal({ title, content: message, actions });
}
