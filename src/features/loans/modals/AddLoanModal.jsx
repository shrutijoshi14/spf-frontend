import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import { useLoanContext } from '../../../context/LoanContext';
import '../../../styles/modal.css';

const AddLoanModal = ({ open, onClose }) => {
  const { borrowers, addLoan } = useLoanContext();

  const [form, setForm] = useState({
    borrowerId: '',
    principal: '',
    disbursementDate: '',
    interestRate: '',
    interestType: 'FLAT',
    tenureValue: '',
    tenureUnit: 'month',
    status: 'ACTIVE',
    purpose: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        borrowerId: '',
        principal: '',
        disbursementDate: new Date().toISOString().split('T')[0],
        interestRate: '',
        interestType: 'FLAT',
        tenureValue: '',
        tenureUnit: 'month',
        status: 'ACTIVE',
        purpose: '',
      });
      setErrors({});
    }
  }, [open]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateDueDate = (date, value, unit) => {
    if (!date || !value || !unit) return '';
    const d = new Date(date);
    if (unit === 'day') d.setDate(d.getDate() + Number(value));
    if (unit === 'week') d.setDate(d.getDate() + Number(value) * 7);
    if (unit === 'month') d.setMonth(d.getMonth() + Number(value));
    return d.toISOString().split('T')[0];
  };

  const dueDate = calculateDueDate(form.disbursementDate, form.tenureValue, form.tenureUnit);

  /* Removed duplicate declaration */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const err = {};
    if (!form.borrowerId) err.borrowerId = 'Select a borrower';
    if (!form.disbursementDate) err.disbursementDate = 'Select disbursement date';

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

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setIsSubmitting(true);

      const loanData = {
        borrowerId: Number(form.borrowerId),
        principal: Number(form.principal),
        interestRate: Number(form.interestRate || 0),
        interestType: form.interestType,
        tenureValue: Number(form.tenureValue),
        tenureUnit: form.tenureUnit,
        disbursementDate: form.disbursementDate,
        status: form.status,
        purpose: form.purpose,
      };

      const res = await addLoan(loanData);
      if (res?.success) onClose();
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <h3>💰 Add Loan</h3>
        <button className="modal-close" onClick={onClose} disabled={isSubmitting}>
          <span>×</span>
        </button>
      </div>

      <div className="modal-body-scroll">
        <div className="form-section">
          <Section title="Loan Details">
            <div className="form-grid">
              <Field label="Borrower *" error={errors.borrowerId}>
                <select
                  name="borrowerId"
                  value={form.borrowerId}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">Select Borrower</option>
                  {borrowers?.map((b) => (
                    <option key={b.borrower_id} value={b.borrower_id}>
                      {b.full_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Disbursement Date *" error={errors.disbursementDate}>
                <input
                  type="date"
                  name="disbursementDate"
                  value={form.disbursementDate}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Principal Amount *" error={errors.principal}>
                <input
                  type="number"
                  name="principal"
                  value={form.principal}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                  required
                />
              </Field>

              <Field label="Interest Rate (%) *" error={errors.interestRate}>
                <input
                  type="number"
                  name="interestRate"
                  value={form.interestRate}
                  onChange={handleChange}
                  placeholder="e.g., 4"
                  required
                />
              </Field>

              <Field label="Interest Type *" error={errors.interestType}>
                <select
                  required
                  name="interestType"
                  value={form.interestType}
                  onChange={handleChange}
                  placeholder="Select Interest Type"
                >
                  <option value="FLAT">Flat</option>
                  <option value="REDUCING">Reducing</option>
                </select>
              </Field>

              <Field label="Tenure Value *" error={errors.tenureValue}>
                <input
                  type="number"
                  name="tenureValue"
                  value={form.tenureValue}
                  onChange={handleChange}
                  placeholder="eg., 12"
                  required
                />
              </Field>

              <Field label="Tenure Unit *" error={errors.tenureUnit}>
                <select required name="tenureUnit" value={form.tenureUnit} onChange={handleChange}>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </Field>

              <Field label="Due Date">
                <input type="date" value={dueDate} readOnly />
              </Field>

              <Field label="Status *" error={errors.status}>
                <select required name="status" value={form.status} onChange={handleChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </Field>

              <Field label="Purpose" full>
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="Reason of Loan e.g., Personal Loan"
                />
              </Field>
            </div>
          </Section>
        </div>
      </div>

      <div className="sticky-footer">
        <Button text="Cancel" variant="outline" onClick={onClose} />
        <Button text={isSubmitting ? 'Saving...' : 'Save Loan'} onClick={handleSubmit} />
      </div>
    </Modal>
  );
};

/* 🔹 Reusable helpers (same pattern as borrower) */
const Field = ({ label, error, full, children }) => (
  <div className={`form-field ${full ? 'full' : ''}`}>
    <label>{label}</label>
    {children}
    {error && (
      <span className="error" style={{ color: 'var(--danger)', fontSize: '12px' }}>
        {error}
      </span>
    )}
  </div>
);

const Section = ({ title, children }) => (
  <div className="form-section-block">
    <h3 className="section-title">{title}</h3>
    {children}
  </div>
);

export default AddLoanModal;
