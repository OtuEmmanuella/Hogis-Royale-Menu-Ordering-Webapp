import React, { useState } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { AiFillApple } from "react-icons/ai";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth-styles.css';

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();

  // Nigerian phone number validation
  const validatePhoneNumber = (number) => {
    // Regex for Nigerian phone numbers (11 digits, starting with 0)
    const nigerianPhoneRegex = /^0[789][01]\d{8}$/;
    return nigerianPhoneRegex.test(number);
  };

  const handlePhoneNumberChange = (e) => {
    const inputPhoneNumber = e.target.value;

    // Only allow numbers
    const numbersOnly = inputPhoneNumber.replace(/\D/g, '');

    // Limit to 11 digits
    const truncatedNumber = numbersOnly.slice(0, 11);

    setPhoneNumber(truncatedNumber);

    // Validate phone number
    if (truncatedNumber && !validatePhoneNumber(truncatedNumber)) {
      setPhoneError('Please enter a valid Nigerian phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Additional phone number validation before submission
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Nigerian phone number');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email: user.email,
        phoneNumber, // Full 11-digit phone number
        createdAt: new Date(),
        orderHistory: []
      });

      toast.success('Signup successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider) => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Validate phone number if using OAuth
      if (!validatePhoneNumber(phoneNumber)) {
        toast.error('Please enter a valid Nigerian phone number');
        setLoading(false);
        return;
      }

      await setDoc(doc(db, 'users', user.uid), {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phoneNumber,
        createdAt: new Date(),
        orderHistory: []
      }, { merge: true });

      toast.success(`${provider.providerId} signup successful!`);
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => handleOAuthSignup(new GoogleAuthProvider());
  const handleAppleSignup = () => handleOAuthSignup(new OAuthProvider('apple.com'));

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSignup}>
        <h2 className="auth-title">Create an Account</h2>
        <div className="auth-input-group">
          <input
            type="text"
            className="auth-input"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            className="auth-input"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <input
          type="email"
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="auth-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div>
          <input
            type="tel"
            className="auth-input"
            placeholder="Phone Number (e.g., 08012345678)"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            maxLength="11"
            required
          />
          {phoneError && <p className="error-message">{phoneError}</p>}
        </div>
        <button type="submit" className="auth-button" disabled={loading || !!phoneError}>
          {loading ? <ClipLoader color="#ffffff" size={20} /> : 'Sign Up'}
        </button>
        <div className="auth-divider">
          <span>or</span>
        </div>
        <button
          type="button"
          className="auth-button google-button"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? <ClipLoader color="#ffffff" size={20} /> : (
            <>
              <FcGoogle className="google-icon" /> Sign up with Google
            </>
          )}
        </button>
        <button
          type="button"
          className="auth-button apple-button"
          onClick={handleAppleSignup}
          disabled={loading}
        >
          {loading ? <ClipLoader color="#ffffff" size={20} /> : (
            <>
              <AiFillApple className="apple-icon" /> Sign up with Apple
            </>
          )}
        </button>
        <Link to="/login" className="auth-link">
          Already have an account? <span className='link'>Login</span>
        </Link>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Signup;