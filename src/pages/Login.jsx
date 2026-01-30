import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/auth.css';
import API from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ... (states)
  const [welcomeName, setWelcomeName] = useState('');

  const [signup, setSignup] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [signin, setSignin] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const storedName = localStorage.getItem('full_name');
    if (storedName) {
      setWelcomeName(storedName);
      setIsSignUp(false);
    }
  }, []);

  const handleSignupChange = (e) => {
    setSignup({ ...signup, [e.target.name]: e.target.value });
  };

  const handleSigninChange = (e) => {
    setSignin({ ...signin, [e.target.name]: e.target.value });
  };

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

      setIsSignUp(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
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
      setIsLoading(false); // Only set false on error, keep true for success redirect
    }
    // Note: On success we don't set loading false to prevent button flashing before navigation
  };

  return (
    <div className="auth-wrapper">
      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`}>
        {/* SIGN UP */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignupSubmit}>
            <h1>Create Account</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

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
          </form>
        </div>

        {/* SIGN IN */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSigninSubmit}>
            <h1>Sign In</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

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
          </form>
        </div>

        {/* OVERLAY */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>

              {welcomeName && <h4 className="welcome-name">{welcomeName} 👋</h4>}

              <p>To keep connected with us please login with your personal info</p>

              <button className="ghost" onClick={() => setIsSignUp(false)}>
                Sign In
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hello Friend!</h1>
              <button className="ghost" onClick={() => setIsSignUp(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
