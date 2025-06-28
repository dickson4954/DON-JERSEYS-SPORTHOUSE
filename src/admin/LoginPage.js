import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import './login.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();  // Initialize navigate

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.username || !formData.password || (!isLogin && (!formData.fullName || !formData.email))) {
      return 'Please fill in all required fields.';
    }
    if (!isLogin && !/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Invalid email address.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setErrors(error);
      return;
    }

    const url = isLogin ? 'https://donjerseysporthouseco.co.ke/backend/api/auth/login' : 'https://donjerseysporthouseco.co.ke/backend/api/auth/signup';
    const requestData = isLogin
  ? { identifier: formData.username, password: formData.password } // Use identifier here
  : { username: formData.username, email: formData.email, password: formData.password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      const result = await response.json();

      if (response.ok) {
        setSuccess(isLogin ? 'Login successful!' : 'Registration successful!');
        setErrors('');

        // Navigate to /admin/dashboard on successful login
        if (isLogin) {
          navigate('/admin/dashboard');  
        }
      } else {
        setErrors(result.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setErrors('Failed to connect to server.');
    }
  };

  return (
    <div className="page-container">
      <div className="login-page">
        <div className="form">
          {isLogin ? (
            <form className="login-form" onSubmit={handleSubmit}>
              <h2><i className="fas fa-lock"></i> Login</h2>
              {errors && <div className="error">{errors}</div>}
              {success && <div className="success">{success}</div>}
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button type="submit">Login</button>
              <p className="message">
                Not registered? <button type="button" className="toggle-btn" onClick={toggleForm}>Create an account</button>
              </p>
            </form>
          ) : (
            <form className="register-form" onSubmit={handleSubmit}>
              <h2><i className="fas fa-lock"></i> Register</h2>
              {errors && <div className="error">{errors}</div>}
              {success && <div className="success">{success}</div>}
              <input
                type="text"
                placeholder="Full Name *"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                placeholder="Username *"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                placeholder="Email *"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                placeholder="Password *"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button type="submit">Create</button>
              <p className="message">
                Already registered? <button type="button" className="toggle-btn" onClick={toggleForm}>Sign In</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
