import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, GoogleAuthProvider, OAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FcGoogle } from "react-icons/fc";
import { AiFillApple } from "react-icons/ai";
import { FaChevronRight } from 'react-icons/fa';
import { TiArrowBack } from "react-icons/ti";
import './Auth-styles.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = await checkIfAdmin(user.uid);
        navigate('/menu');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const checkIfAdmin = async (uid) => {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists() && adminDoc.data().isAdmin;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/menu');
    } catch (error) {
      console.error('Email/Password Sign-In Error:', error);
      if (error.code === 'auth/user-not-found') {
        setError("You don't have an account yet! Please sign up.");
      } else {
        setError(error.message);
      }
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName: user.displayName ? user.displayName.split(' ')[0] : '',
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
        email: user.email,
      }, { merge: true });

      navigate('/menu');
    } catch (error) {
      console.error('OAuth Sign-In Error:', error);
      if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        console.log('Popup blocked, trying redirect...');
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error('Redirect Sign-In Error:', redirectError);
          setError('An error occurred during sign-in. Please try again.');
        }
      } else {
        setError(error.message);
      }
    }
  };

  const handleGoogleLogin = () => handleOAuthLogin(new GoogleAuthProvider());
  const handleAppleLogin = () => handleOAuthLogin(new OAuthProvider('apple.com'));

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="auth-page">
      <nav className="breadcrumb">
        <Link to="/menu" className="back-to-menu">
          <TiArrowBack className="back-icon" />
        </Link>
        <FaChevronRight className="breadcrumb-separator" />
        <span>Login</span>
      </nav>
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleLogin}>
          <h2 className="auth-title">Login</h2>
          {error && <p className="auth-error">{error}</p>}
          <input
            type="email"
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit" className="auth-button">Login</button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="auth-button google-button" onClick={handleGoogleLogin}>
            <FcGoogle className="google-icon" /> Sign in with Google
          </button>

          <button type="button" className="auth-button apple-button" onClick={handleAppleLogin}>
            <AiFillApple className="apple-icon" /> Sign in with Apple
          </button>

          <div className="auth-links">
            <Link to="/signup" className="auth-link">Don't have an account? <span className='link'>Sign up</span></Link>
            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;