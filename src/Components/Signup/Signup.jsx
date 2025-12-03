import { useState } from 'react';
import './signup.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Fixed API_URL - remove /api/auth from the base URL
  const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, { // Fixed endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // Save user data too
        
        // Redirect after a brief delay to show success message
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              welcomeMessage: `Welcome, ${formData.name}!`,
              isNewUser: true 
            }
          });
        }, 1500);
        
      } else {
        setErrors({ submit: data.message || 'Signup failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {success ? (
          <div className="success-wrapper">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Account Created!</h2>
            <p className="success-text">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="signup-header">
              <h1 className="signup-title">Create Account</h1>
              <p className="signup-subtitle">Step {step} of 2</p>
            </div>

            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>

            <div className="signup-form">
              {step === 1 ? (
                <div className="form-step">
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input
                      className="input-field"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onKeyPress={(e) => handleKeyPress(e, handleNext)}
                      placeholder="John Doe"
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input
                      className="input-field"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onKeyPress={(e) => handleKeyPress(e, handleNext)}
                      placeholder="you@example.com"
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>

                  <button
                    onClick={handleNext}
                    className="btn btn-primary"
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <div className="form-step">
                  <div className="input-group">
                    <label className="input-label">Password</label>
                    <input
                      className="input-field"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onKeyPress={(e) => handleKeyPress(e, handleSubmit)}
                      placeholder="••••••••"
                    />
                    {errors.password && <span className="error-text">{errors.password}</span>}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Confirm Password</label>
                    <input
                      className="input-field"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onKeyPress={(e) => handleKeyPress(e, handleSubmit)}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                  </div>

                  {errors.submit && (
                    <div className="submit-error">{errors.submit}</div>
                  )}

                  <div className="button-group">
                    <button
                      onClick={() => setStep(1)}
                      className="btn btn-back"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="btn btn-primary"
                      style={{
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? (
                        <span className="loading-wrapper">
                          <span className="spinner" />
                          Creating...
                        </span>
                      ) : 'Create Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="signup-footer">
              Already have an account?{' '}
              <a href="/login" className="signup-link">Sign in</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;