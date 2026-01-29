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
          <div className="form-grid">
            <div className="form-field full">
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

            <div className="form-field full">
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
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-main)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                }}
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
