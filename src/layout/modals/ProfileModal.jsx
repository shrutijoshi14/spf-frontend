import { ArrowLeft, Edit2, Mail, Phone, Save, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../common/Modal';
import API from '../../utils/api';
import './profile-modal.css';

const ProfileModal = ({ open, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', mobile: '' });
  const [errors, setErrors] = useState({});

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/profile');
      if (res.data.success) {
        setProfile(res.data.data);
        setForm({
          full_name: res.data.data.full_name,
          email: res.data.data.email,
          mobile: res.data.data.mobile,
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProfile();
      setIsEditing(false);
      setErrors({});
    }
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const err = {};
    if (!form.full_name) err.full_name = 'Name is required';
    if (!form.email) err.email = 'Email is required';
    if (!form.mobile) err.mobile = 'Mobile is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await API.put('/auth/profile', form);
      if (res.data.success) {
        toast.success('Profile updated successfully');
        setProfile(res.data.data);
        localStorage.setItem('full_name', res.data.data.full_name);
        setIsEditing(false);
        // Refresh page to sync Topbar name if changed
        if (form.full_name !== profile.full_name) {
          window.location.reload();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} className="profile-modal-box">
      <div className="profile-modal-container">
        <div className="profile-hero">
          <div className="profile-hero-content">
            <div className="profile-avatar">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-main-info">
              <h2>{isEditing ? 'Edit Profile' : profile?.full_name || 'Loading...'}</h2>
              <span className="profile-role-badge">
                {profile?.role === 'SUPERADMIN'
                  ? 'Super Administrator'
                  : profile?.role === 'ADMIN'
                    ? 'Administrator'
                    : profile?.role === 'STAFF'
                      ? 'Staff Member'
                      : profile?.role || 'User'}
              </span>
            </div>
          </div>
          <div className="profile-hero-actions">
            {!isEditing ? (
              <button className="profile-edit-toggle" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} /> Edit
              </button>
            ) : (
              <button className="profile-edit-toggle back" onClick={() => setIsEditing(false)}>
                <ArrowLeft size={16} /> Cancel
              </button>
            )}
            <button className="modal-close" onClick={onClose} style={{ marginLeft: '12px' }}>
              <span>×</span>
            </button>
          </div>
        </div>

        <div className="profile-content modal-body-scroll">
          {isEditing ? (
            <div className="profile-edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                </div>
                {errors.full_name && <span className="error-text">{errors.full_name}</span>}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input
                    type="text"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile"
                  />
                </div>
                {errors.mobile && <span className="error-text">{errors.mobile}</span>}
              </div>

              <button className="profile-save-btn" onClick={handleUpdate} disabled={loading}>
                <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <>
              <div className="profile-section">
                <h3 className="profile-section-title">Contact Information</h3>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <div className="info-icon-box">
                      <Mail size={18} />
                    </div>
                    <div className="info-text">
                      <label>Email Address</label>
                      <p>{profile?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="profile-info-item">
                    <div className="info-icon-box">
                      <Phone size={18} />
                    </div>
                    <div className="info-text">
                      <label>Mobile Number</label>
                      <p>{profile?.mobile || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3 className="profile-section-title">Account Security</h3>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <div className="info-icon-box">
                      <Shield size={18} />
                    </div>
                    <div className="info-text">
                      <label>Account Status</label>
                      <p className="status-active">Active</p>
                    </div>
                  </div>
                  <div className="profile-info-item">
                    <div className="info-icon-box">
                      <User size={18} />
                    </div>
                    <div className="info-text">
                      <label>User ID</label>
                      <p>#{profile?.user_id || '...'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
