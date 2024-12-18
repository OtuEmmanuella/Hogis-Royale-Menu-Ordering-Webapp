import React, { useState } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Mail, Lock, User, Phone } from 'lucide-react';
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
  
  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Image Section - Only visible on large screens */}
        <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center" style={{
          backgroundImage: 'url("/Hogis Group Logo 2.jpg")',
          backgroundSize: 'cover'
        }}>
          <div className="w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center px-8">
              <h1 className="text-4xl font-bold mb-4">Welcome to Hogis Group</h1>
              <p className="text-lg">Join our community and discover amazing features</p>
            </div>
          </div>
        </div>

        {/* Signup Form Section */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-gray-50">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
              <p className="mt-2 text-gray-600">Craving Something Delicious? Get Started!</p>
            </div>

            <form onSubmit={handleSignup} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 08012345678"
                      required
                    />
                  </div>
                  {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !!phoneError}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#AF6E1C] to-[#C49402] hover:from-[#5A3D1E] hover:to-[#402E16] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>

                <button type="button" className="auth-button google-button" onClick={handleGoogleSignup}>
            <FcGoogle className="google-icon" /> Sign in with Google
          </button>
              </div>

             

              <div className="flex items-center justify-center">
                <div className="text-sm">
                  <a href="/login" className="font-medium text-blue-900 hover:text-blue-500">
                    Already have an account? Log in
                  </a>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 text-center">
                  By signing up, you agree to our{' '}
                  <a href="/privacy" className="text-blue-500 hover:underline">
                    Privacy Policy
                  </a>
                  . We collect and process your data as described in our policy.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      
      </>
  );
}

export default Signup;