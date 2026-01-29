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

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="modal-header sticky-header" style={{ position: 'relative' }}>
        <h3
          style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {activity.type === 'LOAN'
            ? '🏦'
            : activity.type === 'PAYMENT'
              ? '💰'
              : activity.type === 'PENALTY'
                ? '⚠'
                : '👤'}
          {activity.title}
        </h3>
        <button className="modal-close" onClick={onClose}>
          <span>×</span>
        </button>
      </div>

      <div className="modal-scroll" style={{ padding: '24px' }}>
        <div className="form-section" style={{ padding: 0 }}>
          <div
            className="detail-row"
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px',
            }}
          >
            <span style={{ color: '#64748b', fontWeight: '500' }}>Event</span>
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{activity.description}</span>
          </div>

          <div
            className="detail-row"
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px',
            }}
          >
            <span style={{ color: '#64748b', fontWeight: '500' }}>Transaction Amount</span>
            <span
              style={{
                fontWeight: '700',
                color: activity.type === 'BORROWER' ? '#64748b' : '#0f172a',
                fontSize: '22px',
              }}
            >
              {activity.type === 'BORROWER' ? 'N/A' : formatCurrency(activity.amount)}
            </span>
          </div>

          <div
            className="detail-row"
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px',
            }}
          >
            <span style={{ color: '#64748b', fontWeight: '500' }}>Logged On</span>
            <span style={{ fontWeight: '500', color: '#334155' }}>
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
            <span style={{ color: '#64748b', fontWeight: '500' }}>Activity Category</span>
            <span
              className="status-badge active"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
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
