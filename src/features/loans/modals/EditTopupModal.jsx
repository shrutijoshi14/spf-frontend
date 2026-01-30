import { useEffect, useState } from 'react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';

const EditTopupModal = ({ open, loan, topupToEdit, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  // Prefill for Edit Mode
  useEffect(() => {
    if (topupToEdit && open) {
      setAmount(topupToEdit.topup_amount);
      setDate(new Date(topupToEdit.topup_date).toISOString().split('T')[0]);
      setRemarks(topupToEdit.remarks || '');
    }
  }, [topupToEdit, open]);

  if (!open || !loan) return null;

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!date) {
      setError('Please select a top-up date');
      return;
    }

    setError('');
    onSubmit({
      ...topupToEdit,
      loan_id: loan.loan_id,
      amount: Number(amount),
      topup_date: date,
      remarks: remarks,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <h3>✏️ Edit Top-up - Loan #{loan.loan_id}</h3>
        <button className="modal-close" onClick={onClose}>
          <span>×</span>
        </button>
      </div>

      <div className="modal-body-scroll">
        <div className="form-section">
          {/* Loan Context Info - Added to match AddTopupModal */}
          <div
            style={{
              padding: '10px',
              background: 'var(--nav-active)',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-main)',
            }}
          >
            <p style={{ margin: 0, color: 'var(--accent)', fontSize: '0.9rem' }}>
              <strong>Borrower:</strong> {loan.full_name || 'N/A'}
            </p>
            <p style={{ margin: '4px 0 0', color: 'var(--accent)', fontSize: '0.9rem' }}>
              <strong>Current Principal:</strong>{' '}
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                ₹{loan.principal_amount}
              </span>
            </p>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Amount (₹) *</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                min="1"
              />
            </div>

            <div className="form-field">
              <label>Top-up Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="form-field full">
              <label>Remarks</label>
              <textarea
                placeholder="Optional remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
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
        <Button text="Update Top-up" onClick={handleSubmit} />
      </div>
    </Modal>
  );
};

export default EditTopupModal;
