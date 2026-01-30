import { useEffect, useState } from 'react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import Select from '../../../common/Select';

const AddPaymentModal = ({ open, loan, onClose, onSubmit }) => {
  const [paymentFor, setPaymentFor] = useState('EMI');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPaymentFor('EMI');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('CASH');
      setRemarks('');
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
      setError('Please select a payment date');
      return;
    }
    if (!paymentMode) {
      setError('Please select a payment mode');
      return;
    }

    setError('');
    onSubmit({
      loan_id: loan.loan_id,
      payment_for: paymentFor,
      amount: Number(amount),
      payment_date: date,
      payment_mode: paymentMode,
      remarks: remarks,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0 }}>💳 Make Payment</h3>
          <span
            style={{
              background: 'var(--nav-active)',
              color: 'var(--accent)',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: '600',
              border: '1px solid var(--border-main)',
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
          {/* Loan Context Info */}
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
              <strong>Outstanding Balance:</strong>{' '}
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                ₹{loan.outstanding_amount}
              </span>
            </p>
          </div>

          <div className="form-grid">
            <div className="form-field full">
              <label>Payment For *</label>
              <Select
                options={['EMI', 'INTEREST', 'PENALTY']}
                value={paymentFor}
                onChange={(value) => setPaymentFor(value)}
              />
            </div>

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
              <label>Payment Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="form-field full">
              <label>Payment Mode *</label>
              <Select
                options={['CASH', 'GPAY', 'PHONEPE', 'NETBANKING', 'CHEQUE']}
                value={paymentMode}
                onChange={(value) => setPaymentMode(value)}
              />
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
        <Button text="Confirm Payment" onClick={handleSubmit} />
      </div>
    </Modal>
  );
};

export default AddPaymentModal;
