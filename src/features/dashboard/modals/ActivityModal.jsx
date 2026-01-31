import { AlertTriangle, Banknote, Landmark, User } from 'lucide-react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import '../../../styles/modal.css';

const ActivityModal = ({ isOpen, activity, onClose }) => {
  if (!activity) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getAmountColor = () => {
    switch (activity.type) {
      case 'LOAN':
        return '#3b82f6';
      case 'PAYMENT':
        return '#10b981';
      case 'PENALTY':
        return '#ef4444';
      default:
        return 'var(--text-main)';
    }
  };

  const getHeaderIcon = () => {
    switch (activity.type) {
      case 'LOAN':
        return <Landmark size={22} style={{ color: '#2563eb' }} />;
      case 'PAYMENT':
        return <Banknote size={22} style={{ color: '#10b981' }} />;
      case 'PENALTY':
        return <AlertTriangle size={22} style={{ color: '#ef4444' }} />;
      default:
        return <User size={22} style={{ color: 'var(--text-main)' }} />;
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="modal-header sticky-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {getHeaderIcon()}
          {activity.title}
        </h3>
        <button className="modal-close" onClick={onClose}>
          <span>×</span>
        </button>
      </div>

      <div className="modal-scroll">
        <div className="form-section" style={{ padding: 0 }}>
          <div
            className="detail-row"
            style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-main)',
              paddingBottom: '12px',
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Event</span>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
              {activity.description}
            </span>
          </div>

          <div
            className="detail-row"
            style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-main)',
              paddingBottom: '12px',
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
              Transaction Amount
            </span>
            <span
              style={{
                fontWeight: '700',
                color: activity.type === 'BORROWER' ? 'var(--text-muted)' : getAmountColor(),
                fontSize: '22px',
              }}
            >
              {activity.type === 'BORROWER' ? 'N/A' : formatCurrency(activity.amount)}
            </span>
          </div>

          <div
            className="detail-row"
            style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-main)',
              paddingBottom: '12px',
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Logged On</span>
            <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>
              {new Date(activity.time).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>

          <div
            className="detail-row"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Activity Category</span>
            <span
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-main)',
                color: 'var(--text-main)',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              {activity.type}
            </span>
          </div>
        </div>
      </div>

      <div className="sticky-footer" style={{ borderTop: 'none' }}>
        <Button text="Dismiss" variant="outline" onClick={onClose} />
      </div>
    </Modal>
  );
};

export default ActivityModal;
