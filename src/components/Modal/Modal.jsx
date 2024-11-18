// LoginModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './LoginModal.css';

const LoginModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-body">
          <div className="login-illustration">
            <svg width="120" height="120" viewBox="0 0 24 24">
              <path 
                fill="currentColor" 
                d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z"
              />
            </svg>
          </div>
          <h2>Login Required</h2>
          <p>Please log in to proceed with checkout</p>
          <div className="modal-actions">
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/signup" className="signup-btn">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;