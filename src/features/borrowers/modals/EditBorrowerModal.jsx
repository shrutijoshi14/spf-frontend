import { useEffect, useState } from 'react';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import '../../../styles/modal.css';

const EditBorrowerModal = ({ open, borrower, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    alternate_mobile: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    guarantor_name: '',
    guarantor_phone: '',
    guarantor_address: '',
    guarantor_relation: '',
    relative_name: '',
    relative_phone: '',
    relation: '',
  });

  useEffect(() => {
    if (borrower) {
      setFormData({
        full_name: borrower.full_name || '',
        email: borrower.email || '',
        mobile: borrower.mobile || '',
        alternate_mobile: borrower.alternate_mobile || '',
        address_line1: borrower.address_line1 || '',
        address_line2: borrower.address_line2 || '',
        city: borrower.city || '',
        state: borrower.state || '',
        pincode: borrower.pincode || '',
        guarantor_name: borrower.guarantor_name || '',
        guarantor_phone: borrower.guarantor_phone || '',
        guarantor_address: borrower.guarantor_address || '',
        guarantor_relation: borrower.guarantor_relation || '',
        relative_name: borrower.relative_name || '',
        relative_phone: borrower.relative_phone || '',
        relation: borrower.relation || '',
      });
    }
  }, [borrower]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <h3>✏️ Edit Borrower</h3>
        <button className="modal-close" onClick={onClose}>
          <span>×</span>
        </button>
      </div>

      <div className="modal-body-scroll">
        <div className="form-section">
          {/* 1. PERSONAL DETAILS */}
          <Section title="Personal Details">
            <div className="form-grid">
              <Input
                label="Full Name *"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
              <Input
                label="Mobile *"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
              <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
              <Input
                label="Alt Mobile"
                name="alternate_mobile"
                value={formData.alternate_mobile}
                onChange={handleChange}
              />
            </div>
          </Section>

          {/* 2. ADDRESS DETAILS */}
          <Section title="Address Details">
            <div className="form-grid">
              <Input
                label="Address Line 1 *"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                required
                full
              />
              <Input
                label="Address Line 2"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                full
              />
              <Input
                label="City *"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <Input
                label="State *"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
              <Input
                label="Pincode *"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </Section>

          {/* 3. GUARANTOR DETAILS */}
          <Section title="Guarantor Details">
            <div className="form-grid">
              <Input
                label="Name *"
                name="guarantor_name"
                value={formData.guarantor_name}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone *"
                name="guarantor_phone"
                value={formData.guarantor_phone}
                onChange={handleChange}
                required
              />
              <Input
                label="Address *"
                name="guarantor_address"
                value={formData.guarantor_address}
                onChange={handleChange}
                required
                full
              />
              <Input
                label="Message/Relation"
                name="guarantor_relation"
                value={formData.guarantor_relation}
                onChange={handleChange}
                full
              />
            </div>
          </Section>

          {/* 4. RELATIVE DETAILS */}
          <Section title="Relative Details">
            <div className="form-grid">
              <Input
                label="Name *"
                name="relative_name"
                value={formData.relative_name}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone *"
                name="relative_phone"
                value={formData.relative_phone}
                onChange={handleChange}
                required
              />
              <Input
                label="Relation *"
                name="relation"
                value={formData.relation}
                onChange={handleChange}
                required
              />
            </div>
          </Section>
        </div>
      </div>

      <div className="sticky-footer">
        <Button text="Cancel" variant="outline" onClick={onClose} />
        <Button text="Save Changes" onClick={handleSubmit} />
      </div>
    </Modal>
  );
};

/* Reusable Standard Components */
const Section = ({ title, children }) => (
  <div className="form-section-block">
    <h3 className="section-title">{title}</h3>
    {children}
  </div>
);

const Input = ({ label, full, ...props }) => (
  <div className={`form-field ${full ? 'full' : ''}`}>
    <label>{label}</label>
    <input {...props} />
  </div>
);

export default EditBorrowerModal;
