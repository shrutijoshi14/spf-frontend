import { useEffect, useState } from 'react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';

const EditPenaltyModal = ({ open, loan, penaltyToEdit, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Prefill for Edit Mode
  useEffect(() => {
    if (penaltyToEdit && open) {
      setAmount(penaltyToEdit.penalty_amount);
      setDate(new Date(penaltyToEdit.penalty_date).toISOString().split('T')[0]);
      setReason(penaltyToEdit.reason || '');
    }
  }, [penaltyToEdit, open]);

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
      ...penaltyToEdit,
      loan_id: loan.loan_id,
      amount: Number(amount),
      date: date, // Note: Backend expects 'date' or 'penalty_date'? Service usually maps to db field. Service update: 'date' param maps to penalty_date col.
      reason: reason,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <h3>✏️ Edit Penalty - Loan #{loan.loan_id}</h3>
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
              <label>Penalty Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="form-field full">
              <label>Reason</label>
              <textarea
                placeholder="Reason for penalty"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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
        <Button text="Update Penalty" onClick={handleSubmit} />
      </div>
    </Modal>
  );
};

export default EditPenaltyModal;
