import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase/FirebaseConfig'; 
import {
  User,
  HelpCircle,
  FileText,
  Info,
  HelpingHand,
  Share2,
  Globe,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Shield,
  LogOut 
} from 'lucide-react';

const UserAccountPage = () => {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user's first name
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setFirstName(userDoc.data().firstName || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        navigate('/login'); // Redirect if not authenticated
      }
    });
  
    return () => unsubscribe();
  }, [auth, navigate]);

  const menuItems = [
    { icon: <User className="w-6 h-6" />, title: 'Profile', path: '/profile' },
    { icon: <HelpCircle className="w-6 h-6" />, title: 'Help & Support', path: '/support' },
    { icon: <Shield className="w-6 h-6" />, title: 'Privacy Policy', path: '/privacy' },
    { icon: <Info className="w-6 h-6" />, title: 'About Us', path: '/about' },
    { icon: <HelpingHand className="w-6 h-6" />, title: 'FAQ', path: '/faq' },
    { icon: <Share2 className="w-6 h-6" />, title: 'Refer a Friend', path: '/refer' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/menu');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-6 shadow-sm flex justify-between items-center">
        <nav>
          <a 
            href="/menu" 
            className="text-sm font-medium text-black-600 hover:underline"
          >
            ← Back to Menu
          </a>
        </nav>
        <h1 className="text-sm font-bold text-gray-900 text-right">
          Hello, {firstName}!
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-4">
                <div className="text-gray-600">{item.icon}</div>
                <span className="text-gray-800 font-medium">{item.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAccountPage;