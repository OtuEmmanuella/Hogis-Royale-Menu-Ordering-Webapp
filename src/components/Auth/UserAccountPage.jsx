import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, LogOut } from 'lucide-react';
import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';
import UserInfo from '../UserInfo';
import CurrentCart from '../CurrentCart';
import OrderHistory from '../OrderHistory';
import LoadingSpinner from '../LoadingSpinner';
import '../../styles/UserAccount.css';

const UserAccountPage = () => {
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { cartItems } = useShoppingCart();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));

          if (adminDoc.exists() && adminDoc.data().isAdmin) {
            setIsAdmin(true);
            setUser({ id: currentUser.uid, email: currentUser.email, ...adminDoc.data() });
          } else if (userDoc.exists()) {
            setUser({ id: currentUser.uid, ...userDoc.data() });
            setOrderHistory(userDoc.data().orderHistory || []);
          } else {
            console.error('User authenticated but not in Firestore');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/menu');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleImageUpdate = (photoURL) => {
    setUser(prev => ({ ...prev, photoURL }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
        Error loading user data
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center space-x-2 mb-6 text-gray-600">
        <Link to="/menu" className="hover:text-gray-900 transition-colors">
          Menu
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">My Account</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
      
      <div className="grid gap-8 max-w-4xl mx-auto">
        <UserInfo 
          user={user} 
          isAdmin={isAdmin} 
          onImageUpdate={handleImageUpdate}
        />

        {!isAdmin && (
          <>
            <CurrentCart cartItems={cartItems} />
            <OrderHistory userId={user.id} />
          </>
        )}

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