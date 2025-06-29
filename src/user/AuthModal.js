import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

function AuthModal({ isOpen, onClose }) {
  const [isSignup, setIsSignup] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignup) {
        // Signup: POST /auth/signup
        const response = await axios.post('https://donjerseysporthouseco.co.ke/backend/api/auth/signup', {
          username,
          email,
          password
        });

        if (response.data.message === "User registered successfully") {
          setIsSignup(false);
          setError("Account created successfully. Please log in.");
        } else {
          setError(response.data.message || "Signup failed.");
        }
      } else {
        // Login: POST /auth/login
        const response = await axios.post('https://donjerseysporthouseco.co.ke/backend/api/auth/login', {
          identifier,
          password
        });

        if (response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          if (response.data.user.is_admin) {
            localStorage.setItem('isAdmin', 'true');
            navigate('/admin/dashboard');
          } else {
            localStorage.removeItem('isAdmin');
            navigate('/');
          }

          onClose();
        } else {
          setError(response.data.message || "Login failed.");
        }
      }
    } catch (err) {
      setError(`Error ${isSignup ? 'signing up' : 'logging in'}: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal-box">
          <button className="modal-close" onClick={onClose}>X</button>
          <h2>{isSignup ? "Sign Up" : "Login"}</h2>

          <form onSubmit={handleAuth}>
            {isSignup ? (
              <>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </>
            ) : (
              <input
                type="text"
                placeholder="Username or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>

            {error && <p className="error">{error}</p>}
          </form>

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#007BFF', cursor: 'pointer' }}
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    )
  );
}

export default AuthModal;
