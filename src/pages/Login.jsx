import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/auth.css';
import API from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false); // Toggle state
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  const [signin, setSignin] = useState({
    email: '',
    password: '',
  });

  const [signup, setSignup] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const storedName = localStorage.getItem('full_name');
    if (storedName) {
      setWelcomeName(storedName);
    }
  }, []);

  const handleSigninChange = (e) => {
    setSignin({ ...signin, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignup({ ...signup, [e.target.name]: e.target.value });
  };

  // ✅ LOGIN
  const handleSigninSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', signin);
      const userData = res.data;

      login(userData);
      setWelcomeName(userData.full_name);

      if (userData.isFirstSuperAdmin) {
        toast.success(
          'System Setup: No SuperAdmin found. You have been promoted to SuperAdmin! 🛡️'
        );
      }

      toast.success(`Welcome ${userData.full_name} 👋`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  // ✅ SIGNUP
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    if (signup.password !== signup.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await API.post('/auth/signup', {
        full_name: signup.full_name,
        email: signup.email,
        mobile: signup.mobile,
        password: signup.password,
      });

      toast.success('Signup successful! Please login 🎉');

      setSignup({
        full_name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
      });

      setIsSignUp(false); // Switch back to login
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Generic Toggle Handler
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="form-container">
          {!isSignUp ? (
            <form onSubmit={handleSigninSubmit} key="signin-form">
              <h1>Sign In</h1>
              {error && <p style={{ color: '#ef4444', marginBottom: '10px' }}>{error}</p>}

              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleSigninChange}
                required
              />

              <div className="password-wrapper">
                <input
                  type={showSigninPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  onChange={handleSigninChange}
                  required
                />
                <span onClick={() => setShowSigninPassword(!showSigninPassword)}>
                  {showSigninPassword ? '🙈' : '👁️'}
                </span>
              </div>

              <button
                type="button"
                className="forgot-btn"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot your password?
              </button>

              <button type="submit" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Logging In...' : 'Login'}
              </button>

              <div className="toggle-text">
                New here? <span onClick={toggleMode}>Create Account</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} key="signup-form">
              <h1>Create Account</h1>
              {error && <p style={{ color: '#ef4444', marginBottom: '10px' }}>{error}</p>}

              <input
                name="full_name"
                placeholder="Full Name"
                onChange={handleSignupChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleSignupChange}
                required
              />
              <input name="mobile" placeholder="Mobile" onChange={handleSignupChange} required />

              <div className="password-wrapper">
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  onChange={handleSignupChange}
                  required
                />
                <span onClick={() => setShowSignupPassword(!showSignupPassword)}>
                  {showSignupPassword ? '🙈' : '👁️'}
                </span>
              </div>

              <div className="password-wrapper">
                <input
                  type={showSignupConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={handleSignupChange}
                  required
                />
                <span onClick={() => setShowSignupConfirm(!showSignupConfirm)}>
                  {showSignupConfirm ? '🙈' : '👁️'}
                </span>
              </div>

              <button type="submit" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>

              <div className="toggle-text">
                Already have an account? <span onClick={toggleMode}>Sign In</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
