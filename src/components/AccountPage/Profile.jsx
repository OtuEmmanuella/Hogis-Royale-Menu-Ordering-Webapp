import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, LogOut, ClipboardList } from 'lucide-react';
import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';
import UserInfo from '../UserInfo';
import CurrentCart from '../CurrentCart';
import LoadingSpinner from '../LoadingSpinner';
import '../../styles/UserAccount.css';
import Breadcrumb from '../BreadCrumbs/breadCrumbs';

const Profile = () => {
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


  const handleImageUpdate = (photoURL) => {
    setUser(prev => ({ ...prev, photoURL }));
  };

  const handleViewOrders = () => {
    navigate('/order-history');
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
    <div className="max-w-md mx-auto mt-8 bg-white shadow-lg rounded-lg overflow-hidden">

    <div className="container mx-auto px-4 py-8">
    
      <Breadcrumb />

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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-6 w-6 text-gray-700" />
                  <h2 className="text-2xl font-semibold text-gray-800">Orders</h2>
                </div>
                <button
                  onClick={handleViewOrders}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <ClipboardList className="h-5 w-5" />
                  View Order History
                </button>
              </div>
              <p className="text-gray-600">
                View your order history, track current orders, and manage your purchases.
              </p>
            </div>
          </>
        )}

       
      </div>
    </div>
    </div>
  );
};

export default Profile;