import { useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../../../common/Button';
import Modal from '../../../common/Modal';
import { useBorrowerContext } from '../../../context/BorrowerContext';
import '../../../styles/modal.css';

const AddBorrowerModal = ({ open, onClose }) => {
  const { addBorrower } = useBorrowerContext();

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    alternateMobile: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pinCode: '',
    guarantorName: '',
    guarantorPhone: '',
    guarantorAddress: '',
    guarantorRelation: '',
    relativesName: '',
    relativesPhone: '',
    relation: '',
    photo: null,
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user types
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, photo: file });
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const err = {};

    // Helper to clean phone numbers (remove spaces, dashes, parentheses)
    const cleanPhone = (phone) => phone?.replace(/[\s\-\(\)]/g, '') || '';

    if (!form.fullName.trim()) err.fullName = 'Full name is required';

    const cleanMobile = cleanPhone(form.mobile);
    if (!/^\d{10}$/.test(cleanMobile)) err.mobile = 'Enter valid 10-digit mobile';

    if (form.alternateMobile) {
      const cleanAltMobile = cleanPhone(form.alternateMobile);
      if (!/^\d{10}$/.test(cleanAltMobile)) err.alternateMobile = 'Enter valid 10-digit mobile';
    }

    if (form.email && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      err.email = 'Enter valid email address';

    // Optional fields (Backend allows NULL)
    // if (!form.address1.trim()) err.address1 = 'Address Line 1 is required';
    // if (!form.city.trim()) err.city = 'City is required';
    // if (!form.state.trim()) err.state = 'State is required';
    if (form.pinCode && !/^\d{6}$/.test(form.pinCode.trim()))
      err.pinCode = 'Pin code must be 6 digits';

    // Optional details (Backend allows optional guarantor/relatives)
    if (form.guarantorPhone) {
      const cleanGP = cleanPhone(form.guarantorPhone);
      if (!/^\d{10}$/.test(cleanGP)) err.guarantorPhone = 'Enter valid 10-digit phone';
    }

    if (form.relativesPhone) {
      const cleanRP = cleanPhone(form.relativesPhone);
      if (!/^\d{10}$/.test(cleanRP)) err.relativesPhone = 'Enter valid 10-digit phone';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Helper to clean phone numbers for API
      const clean = (val) => val?.replace(/[\s\-\(\)]/g, '') || '';
      const trim = (val) => val?.trim() || '';

      // ✅ Prepare data - send to API
      const borrowerData = {
        full_name: trim(form.fullName),
        mobile: clean(form.mobile),
        alternate_mobile: clean(form.alternateMobile),
        email: trim(form.email),
        address_line1: trim(form.address1),
        address_line2: trim(form.address2),
        city: trim(form.city),
        state: trim(form.state),
        pincode: trim(form.pinCode),
        guarantor_name: trim(form.guarantorName),
        guarantor_phone: clean(form.guarantorPhone),
        guarantor_address: trim(form.guarantorAddress),
        guarantor_relation: trim(form.guarantorRelation),
        relatives_name: trim(form.relativesName),
        relatives_phone: clean(form.relativesPhone),
        relation: trim(form.relation),
      };

      const result = await addBorrower(borrowerData);
      console.log('📋 addBorrower result in Modal:', result);

      if (result?.success) {
        // Reset form
        setForm({
          fullName: '',
          mobile: '',
          alternateMobile: '',
          email: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          pinCode: '',
          guarantorName: '',
          guarantorPhone: '',
          guarantorAddress: '',
          guarantorRelation: '',
          relativesName: '',
          relativesPhone: '',
          relation: '',
          photo: null,
        });
        setPreview(null);
        setErrors({});
        onClose();
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header sticky-header">
        <h3>👤 Add Borrower</h3>
        <button className="modal-close" onClick={onClose} disabled={isSubmitting}>
          <span>×</span>
        </button>
      </div>

      <div className="modal-body-scroll">
        <div className="borrower-modal">
          <div className="borrower-profile">
            <label>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={isSubmitting}
              />
              <div className="photo-circle">
                {preview ? <img src={preview} alt="Borrower" /> : '👤'}
              </div>
            </label>
            <p className="upload-text">Upload Borrower Photo</p>
          </div>

          <div className="form-section">
            <Section title="Personal Details">
              <div className="form-grid">
                <Input
                  label="Full Name *"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  disabled={isSubmitting}
                />
                <Input
                  label="Mobile *"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  error={errors.mobile}
                  disabled={isSubmitting}
                />
                <Input
                  label="Alternate Mobile"
                  name="alternateMobile"
                  value={form.alternateMobile}
                  onChange={handleChange}
                  error={errors.alternateMobile}
                  disabled={isSubmitting}
                />
                <Input
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={isSubmitting}
                />
                <Input
                  label="Address Line 1"
                  name="address1"
                  value={form.address1}
                  onChange={handleChange}
                  full
                  error={errors.address1}
                  disabled={isSubmitting}
                />
                <Input
                  label="Address Line 2"
                  name="address2"
                  value={form.address2}
                  onChange={handleChange}
                  full
                  disabled={isSubmitting}
                />
                <Input
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  error={errors.city}
                  disabled={isSubmitting}
                />
                <Input
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  error={errors.state}
                  disabled={isSubmitting}
                />
                <Input
                  label="Pin Code"
                  name="pinCode"
                  value={form.pinCode}
                  onChange={handleChange}
                  error={errors.pinCode}
                  disabled={isSubmitting}
                />
              </div>
            </Section>

            <Section title="Guarantor Details">
              <div className="form-grid">
                <Input
                  label="Guarantor Name"
                  name="guarantorName"
                  value={form.guarantorName}
                  onChange={handleChange}
                  error={errors.guarantorName}
                  disabled={isSubmitting}
                />
                <Input
                  label="Guarantor Phone"
                  name="guarantorPhone"
                  value={form.guarantorPhone}
                  onChange={handleChange}
                  error={errors.guarantorPhone}
                  disabled={isSubmitting}
                />
                <Input
                  label="Guarantor Address"
                  name="guarantorAddress"
                  value={form.guarantorAddress}
                  onChange={handleChange}
                  full
                  error={errors.guarantorAddress}
                  disabled={isSubmitting}
                />
                <Input
                  label="Guarantor Message/Relation"
                  name="guarantorRelation"
                  value={form.guarantorRelation}
                  onChange={handleChange}
                  full
                  disabled={isSubmitting}
                />
              </div>
            </Section>

            <Section title="Relative Details">
              <div className="form-grid">
                <Input
                  label="Relative Name"
                  name="relativesName"
                  value={form.relativesName}
                  onChange={handleChange}
                  error={errors.relativesName}
                  disabled={isSubmitting}
                />
                <Input
                  label="Relative Phone"
                  name="relativesPhone"
                  value={form.relativesPhone}
                  onChange={handleChange}
                  error={errors.relativesPhone}
                  disabled={isSubmitting}
                />
                <Input
                  label="Relation"
                  name="relation"
                  value={form.relation}
                  onChange={handleChange}
                  error={errors.relation}
                  disabled={isSubmitting}
                />
              </div>
            </Section>
          </div>
        </div>
      </div>

      <div className="sticky-footer">
        <Button text="Cancel" variant="outline" onClick={onClose} disabled={isSubmitting} />
        <Button
          text={isSubmitting ? 'Saving...' : 'Save Borrower'}
          onClick={handleSubmit}
          disabled={isSubmitting}
        />
      </div>
    </Modal>
  );
};

const Input = ({ label, error, full, disabled, ...props }) => (
  <div className={`form-field ${full ? 'full' : ''}`}>
    <label>{label}</label>
    <input {...props} disabled={disabled} />
    {error && <span className="error">{error}</span>}
  </div>
);

const Section = ({ title, children }) => (
  <div className="form-section-block">
    <h3 className="section-title">{title}</h3>
    {children}
  </div>
);

export default AddBorrowerModal;
