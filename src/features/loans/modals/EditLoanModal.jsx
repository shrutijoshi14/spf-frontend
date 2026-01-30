import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import { useLoanContext } from '../../../context/LoanContext';
import '../../../styles/modal.css';
import API from '../../../utils/api';

const EditLoanModal = ({ open, loan, onClose }) => {
  const { updateLoan, borrowers } = useLoanContext();

  const [form, setForm] = useState({
    principal: '',
    disbursementDate: '',
    dueDate: '',
    interestRate: '',
    interestType: 'flat',
    tenureValue: '',
    tenureUnit: 'month',
    status: 'ACTIVE',
    purpose: '',
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // Helper to get local YYYY-MM-DD from ISO string
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (loan?.loan_id && open) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await API.get(`/loans/${loan.loan_id}/details`);
          const freshLoan = res.data.data.loan;

          setForm({
            principal: freshLoan.principal_amount || '',
            disbursementDate: formatDate(freshLoan.disbursement_date),
            dueDate: formatDate(freshLoan.due_date),
            interestRate: freshLoan.interest_rate || '',
            interestType: freshLoan.interest_type || 'flat',
            tenureValue: freshLoan.tenure_value || '',
            tenureUnit: freshLoan.tenure_unit || 'month',
            status: freshLoan.status || 'ACTIVE',
            purpose: freshLoan.purpose || '',
          });
          setErrors({});
        } catch (err) {
          console.error('Failed to fetch fresh loan details', err);
          toast.error('Could not refresh loan details');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [open, loan?.loan_id]);

  const calculateDueDate = (date, value, unit) => {
    if (!date || !value || !unit) return '';

    // Create date from YYYY-MM-DD components to avoid timezone offsets
    const [y, m, d] = date.split('-').map(Number);
    const target = new Date(y, m - 1, d);

    // Normalize unit to lowercase for comparison
    const u = unit.toLowerCase();

    if (u === 'day') target.setDate(target.getDate() + Number(value));
    if (u === 'week') target.setDate(target.getDate() + Number(value) * 7);
    if (u === 'month') target.setMonth(target.getMonth() + Number(value));

    // Return YYYY-MM-DD
    const ry = target.getFullYear();
    const rm = String(target.getMonth() + 1).padStart(2, '0');
    const rd = String(target.getDate()).padStart(2, '0');
    return `${ry}-${rm}-${rd}`;
  };

  // Calculate due date synchronous logic
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate Due Date if relevant fields change
      if (['disbursementDate', 'tenureValue', 'tenureUnit'].includes(name)) {
        const { disbursementDate, tenureValue, tenureUnit } = updated;
        if (disbursementDate && tenureValue && tenureUnit) {
          updated.dueDate = calculateDueDate(disbursementDate, tenureValue, tenureUnit);
        }
      }

      return updated;
    });

    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const err = {};
    if (!form.principal || Number(form.principal) <= 0)
      err.principal = 'Principal must be positive';
    if (form.interestRate === '' || Number(form.interestRate) < 0)
      err.interestRate = 'Rate cannot be negative';
    if (!form.tenureValue || Number(form.tenureValue) <= 0)
      err.tenureValue = 'Tenure must be positive';
    if (!form.status) err.status = 'Status is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await updateLoan(loan.loan_id, form);
      if (res.success) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const borrowerName =
    borrowers.find((b) => b.borrower_id === loan?.borrower_id)?.full_name || 'Borrower';

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <h3>✏️ Edit Loan #{loan?.loan_id}</h3>
        <button className="modal-close" onClick={onClose} disabled={isSubmitting}>
          ×
        </button>
      </div>

      <div className="modal-body-scroll">
        <div className="form-section">
          {/* Info Display */}
          {/* Info Display - Standardized */}
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '12px 16px',
              background: 'var(--nav-active)',
              borderRadius: '12px',
              border: '1px solid var(--border-main)',
            }}
          >
            <p style={{ margin: 0, color: 'var(--accent)', fontSize: '0.9rem' }}>
              <strong>Borrower:</strong> {borrowerName}
            </p>
          </div>

          <div className="form-grid">
            <Field label="Principal Amount *" error={errors.principal}>
              <input
                type="number"
                name="principal"
                value={form.principal}
                onChange={handleChange}
              />
            </Field>

            <Field label="Disbursement Date *" error={errors.disbursementDate}>
              <input
                type="date"
                name="disbursementDate"
                value={form.disbursementDate}
                onChange={handleChange}
              />
            </Field>

            <Field label="Interest Rate (%) *" error={errors.interestRate}>
              <input
                type="number"
                name="interestRate"
                value={form.interestRate}
                onChange={handleChange}
              />
            </Field>

            <Field label="Interest Type *" error={errors.interestType}>
              <select name="interestType" value={form.interestType} onChange={handleChange}>
                <option value="flat">Flat</option>
                <option value="reducing">Reducing</option>
              </select>
            </Field>

            <Field label="Tenure Value *" error={errors.tenureValue}>
              <input
                type="number"
                name="tenureValue"
                value={form.tenureValue}
                onChange={handleChange}
              />
            </Field>

            <Field label="Tenure Unit *" error={errors.tenureUnit}>
              <select name="tenureUnit" value={form.tenureUnit} onChange={handleChange}>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </Field>

            <Field label="Due Date" error={errors.dueDate}>
              <input type="date" name="dueDate" value={form.dueDate} readOnly />
            </Field>

            <Field label="Status *" error={errors.status}>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </Field>

            <Field label="Purpose" full>
              <textarea name="purpose" value={form.purpose} onChange={handleChange} />
            </Field>
          </div>
        </div>
      </div>

      <div className="sticky-footer">
        <Button text="Cancel" variant="outline" onClick={onClose} />
        <Button text={isSubmitting ? 'Saving...' : 'Save Changes'} onClick={handleSubmit} />
      </div>
    </Modal>
  );
};

const Field = ({ label, error, full, children }) => (
  <div className={`form-field ${full ? 'full' : ''}`}>
    <label>{label}</label>
    {children}
    {error && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</span>}
  </div>
);

export default EditLoanModal;
