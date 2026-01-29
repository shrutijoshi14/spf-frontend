import { useEffect, useState } from 'react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import Select from '../../../common/Select';

const EditPaymentModal = ({ open, loan, paymentToEdit, onClose, onSubmit }) => {
  const [paymentFor, setPaymentFor] = useState('EMI');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  // Prefill for Edit Mode
  useEffect(() => {
    if (paymentToEdit && open) {
      setPaymentFor(paymentToEdit.payment_for || paymentToEdit.payment_type || 'EMI');
      setAmount(paymentToEdit.payment_amount);
      setDate(new Date(paymentToEdit.payment_date).toISOString().split('T')[0]);
      setPaymentMode(paymentToEdit.payment_mode || 'CASH');
      setRemarks(paymentToEdit.remarks || '');
    }
  }, [paymentToEdit, open]);

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
      ...paymentToEdit, // Preserve ID if editing
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
        <h3>✏️ Edit Payment - Loan #{loan.loan_id}</h3>
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
              background: '#eef2ff',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              border: '1px solid #c7d2fe',
            }}
          >
            <p style={{ margin: 0, color: '#3730a3', fontSize: '0.9rem' }}>
              <strong>Borrower:</strong> {loan.full_name || 'N/A'}
            </p>
            <p style={{ margin: '4px 0 0', color: '#3730a3', fontSize: '0.9rem' }}>
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
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>

            {error && (
              <div className="full" style={{ color: 'red', fontSize: '0.85rem', marginTop: '5px' }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky-footer">
        <Button text="Cancel" variant="outline" onClick={onClose} />
        <Button text="Update Payment" onClick={handleSubmit} />
      </div>
    </Modal>
  );
};

export default EditPaymentModal;
