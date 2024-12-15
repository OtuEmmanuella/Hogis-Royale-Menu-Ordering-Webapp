import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, GoogleAuthProvider, OAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FcGoogle } from "react-icons/fc";
import { FaChevronLeft } from 'react-icons/fa';
import { DotSpinner } from '@uiball/loaders';
import { Mail, Lock } from 'lucide-react';
import './Auth-styles.css';

const checkUserRole = async (uid) => {
  const adminDoc = await getDoc(doc(db, 'admins', uid));
  if (adminDoc.exists() && adminDoc.data().isAdmin) {
    return 'admin';
  }
  const cashierDoc = await getDoc(doc(db, 'cashiers', uid));
  if (cashierDoc.exists() && cashierDoc.data().isCashier) {
    return 'cashier';
  }
  return 'customer';
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await checkUserRole(user.uid);
        navigate('/menu', { state: { userRole: role } });
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const role = await checkUserRole(userCredential.user.uid);
      navigate('/menu', { state: { userRole: role } });
    } catch (error) {
      console.error('Email/Password Sign-In Error:', error);
      if (error.code === 'auth/user-not-found') {
        setError("You don't have an account yet! Please sign up.");
      } else {
        setError(error.message);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
  

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: adds a semi-transparent overlay
      }}>
      <DotSpinner size={40} speed={0.9} color="white" />
      </div>
    );
  }

  

  return (
<div className="auth-page bg-red-00 h-[100vh]">
<nav className="breadcrumb">
        <Link to="/menu" className="back-to-menu">
          <FaChevronLeft className="back-icon" />
        </Link>
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

          

          <div className="auth-links">
            <Link to="/signup" className="auth-link">Don't have an account? <span className='link'>Sign up</span></Link>
            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 text-center">
                By logging in, you agree to our{' '}
                <Link to="/privacy" className="text-blue-500 hover:underline">
                  Privacy Policy
                </Link>
                . We collect and process your data as described in our policy.
              </p>
            </div>
        </form>
      </div>
    </div>
  );
}

export default Login;