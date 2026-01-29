import '../styles/modal.css';
import Button from './Button';
import Modal from './Modal';

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger', // danger, primary
}) => {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} className="confirmation-box">
      <div className="modal-header sticky-header">
        <h3 style={{ color: variant === 'danger' ? 'var(--danger)' : 'var(--text-main)' }}>
          {title}
        </h3>
        <button className="modal-close" onClick={onClose} disabled={isLoading}>
          <span>×</span>
        </button>
      </div>

      <div className="modal-scroll" style={{ padding: '20px 24px', fontSize: '15px' }}>
        <p>{message}</p>
      </div>

      <div className="sticky-footer">
        <Button text={cancelText} variant="outline" onClick={onClose} disabled={isLoading} />
        <Button
          text={isLoading ? 'Processing...' : confirmText}
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={isLoading}
        />
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
