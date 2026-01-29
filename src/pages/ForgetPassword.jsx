import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/auth.css';
import API from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email });

      // ✅ DEV MODE AUTO REDIRECT
      if (res.data.token) {
        toast.info('Dev Mode: Redirecting to reset page...', { autoClose: 1500 });
        navigate(`/reset-password/${res.data.token}`);
      } else {
        toast.success('Instructions sent! Check your email.');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'System error: Unable to send reset instructions.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-desc">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <button className="forgot-btn back-to-login" onClick={() => navigate('/')}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
