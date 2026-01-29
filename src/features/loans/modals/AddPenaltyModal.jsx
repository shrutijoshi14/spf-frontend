import { useEffect, useState } from 'react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';

const AddPenaltyModal = ({ open, loan, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setReason('');
      setError('');
    }
  }, [open]);

  if (!open || !loan) return null;

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!date) {
      setError('Please select a penalty date');
      return;
    }

    setError('');
    onSubmit({
      loan_id: loan.loan_id,
      amount: Number(amount),
      penalty_date: date,
      reason: reason,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3>⚠️ Add Penalty</h3>
          <span
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger)',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: '600',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            #{loan.loan_id}
          </span>
        </div>
        <button className="modal-close" onClick={onClose}>
          <span>×</span>
        </button>
      </div>

      <div className="modal-body-scroll">
        <div className="form-section">
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--nav-active)',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-main)',
            }}
          >
            <p style={{ margin: 0, color: 'var(--accent)', fontSize: '0.9rem' }}>
              <strong>Borrower:</strong> {loan.full_name || 'N/A'}
            </p>
            <p style={{ margin: '4px 0 0', color: 'var(--accent)', fontSize: '1rem' }}>
              <strong>Outstanding Balance:</strong>{' '}
              <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                ₹{loan.outstanding_amount}
              </span>
            </p>
          </div>

          <div className="form-grid">
            <div className="form-field full">
              <label>Penalty Amount (₹) *</label>
              <input
                type="number"
                placeholder="Enter penalty amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                min="1"
              />
            </div>

            <div className="form-field full">
              <label>Penalty Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="form-field full">
              <label>Reason / Remarks</label>
              <textarea
                placeholder="Reason for penalty (e.g., Late Fee)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>

            {error && (
              <div
                className="full"
                style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '5px' }}
              >
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky-footer">
        <Button text="Cancel" variant="outline" onClick={onClose} />
        <Button text="Add Penalty" onClick={handleSubmit} />
      </div>
    </Modal>
  );
};

export default AddPenaltyModal;
