import { useEffect, useState } from 'react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import Select from '../../../common/Select';
import { useAuth } from '../../../context/AuthContext';

const AddPaymentModal = ({ open, loan, onClose, onSubmit }) => {
  const { hasPermission, isAdmin } = useAuth();
  const [paymentFor, setPaymentFor] = useState('EMI');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [isOverride, setIsOverride] = useState(false);

  const canOverride = hasPermission('payment.override') || isAdmin;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPaymentFor('EMI');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('CASH');
      setRemarks('');
      setError('');
      setIsOverride(false);
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
    const payload = {
      loan_id: loan.loan_id,
      amount: Number(amount),
      payment_date: date,
      payment_mode: paymentMode,
      remarks: remarks,
      override: isOverride,
    };

    // Only send specific payment_for if overriding
    if (isOverride) {
      payload.payment_for = paymentFor;
    }

    onSubmit(payload);
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
            <div className="form-field full" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
                Amount to Pay
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: 'var(--text-muted)',
                  }}
                >
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  min="1"
                  style={{
                    paddingLeft: '32px',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'var(--text-main)',
                    height: '56px',
                    borderColor: error ? 'var(--danger)' : 'var(--border-main)',
                  }}
                />
              </div>

              {!isOverride && (
                <div
                  style={{
                    marginTop: '12px',
                    background: 'var(--bg-secondary)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Auto-Allocation Priority:
                  </span>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      1. Penalty
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(249, 115, 22, 0.1)',
                        color: '#f97316',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        border: '1px solid rgba(249, 115, 22, 0.2)',
                      }}
                    >
                      2. Interest
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      3. Principal
                    </div>
                  </div>
                </div>
              )}
            </div>

            {canOverride && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  background: isOverride ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)',
                  border: isOverride ? '1px solid var(--accent)' : '1px solid var(--border-main)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => setIsOverride(!isOverride)}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontWeight: '600',
                      color: isOverride ? 'var(--accent)' : 'var(--text-main)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Override Allocation
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Manually specify payment type (Admin Only)
                  </span>
                </div>

                <div
                  style={{
                    width: '40px',
                    height: '22px',
                    background: isOverride ? 'var(--accent)' : '#cbd5e1',
                    borderRadius: '20px',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      background: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: isOverride ? '20px' : '2px',
                      transition: 'left 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
              </div>
            )}

            {isOverride && (
              <div className="form-field full" style={{ animation: 'fadeIn 0.3s' }}>
                <label>Payment For *</label>
                <Select
                  options={['EMI', 'INTEREST', 'PENALTY']}
                  value={paymentFor}
                  onChange={(value) => setPaymentFor(value)}
                />
              </div>
            )}

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
