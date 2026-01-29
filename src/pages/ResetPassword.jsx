import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/auth.css';
import API from '../utils/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.warning('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      toast.success('Account secured! Your password has been changed successfully.');
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Verification Error: The reset link may be invalid or expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-desc">Please enter your new password below.</p>

        <form onSubmit={handleSubmit}>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
            <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁️'}</span>
          </div>

          <div className="password-wrapper">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <span onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? '🙈' : '👁️'}</span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <button className="forgot-btn" onClick={() => navigate('/')}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
