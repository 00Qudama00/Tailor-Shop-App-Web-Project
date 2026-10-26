import { useState } from 'react';
import Modal from './Modal';

export default function ConfirmModal({ title, message, confirmText = 'Delete', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={handleConfirm} disabled={busy}>
            {busy ? 'Please wait...' : confirmText}
          </button>
        </>
      }
    >
      <p className="muted">{message}</p>
    </Modal>
  );
}
