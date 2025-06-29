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
        const response = await axios.post('https://donjerseysporthouseco.co.ke/backend/api/auth/login', { username, email, password });
        if (response.data.message === "User registered successfully") {
          onClose();
        } else {
          setError(response.data.message);
        }
      } else {
        const response = await axios.post('https://donjerseysporthouseco.co.ke/backend/api/auth/signup', { identifier, password });
        if (response.data.access_token) {
          // Store JWT, user details, and admin status
          localStorage.setItem('token', response.data.access_token);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          if (response.data.user.is_admin) {
            localStorage.setItem('isAdmin', 'true');
            navigate('/admin/dashboard');  // Navigate to admin dashboard
          } else {
            localStorage.removeItem('isAdmin');
            navigate('/');  
          }

          onClose();
        } else {
          setError(response.data.message);
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
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </>
            ) : (
              <input type="text" placeholder="Username or Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            )}
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>

            {error && <p className="error">{error}</p>}
          </form>
        </div>
      </div>
    )
  );
}

export default AuthModal;
