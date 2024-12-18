import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaCommentDots, FaCog } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchBar from '../components/SearchBar/SearchBar';
import Categories from '../components/Categories/categories';
import { ShoppingCartIcon } from '../components/ShoppingCart/ShoppingCart';
import { auth, db } from '../components/Firebase/FirebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useShoppingCart } from '../components/ShoppingCart/ShoppingCartContext';
import NavBar from '../components/NavBar/TempNavBar';
import { DotSpinner } from '@uiball/loaders';
import { checkUserRole } from '../utils/authUtils';
import './Menu.css';
import PromoBanner from '../components/what-we-offer-PromoBanner/PromoBanner';
import PopularMeals from '../Popular/popularMealsData';
import PopularDrinks from '../Popular/popularDrinks';
import TrackingBanner from '../components/what-we-offer-PromoBanner/TrackingBanner';
import BrevoConversationsWidget from '../components/Brevo/BrevoConversationsWidget';


const AnimatedFeedbackHeading = ({ navigate, showLoginAlert }) => {
  const headingVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const handleFeedbackClick = (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      navigate('/feedback');
    } else {
      showLoginAlert();
    }
  };

  return (
    <motion.h2
      className='dish-ideas'
      variants={headingVariants}
      initial="initial"
      animate="animate"
    >
      <a href="/feedback" onClick={handleFeedbackClick} style={{ textDecoration: 'none', color: 'inherit' }}>
        You got some <span style={{ textDecoration: 'underline' }}>Feedback</span>?{' '}
        <FaCommentDots style={{ display: 'inline', verticalAlign: 'middle' }} />
      </a>
    </motion.h2>
  );
};

const UserDisplay = () => {
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setFirstName(userDoc.data().firstName || '');
        }
      }
    };

    fetchUserData();
  }, []);

  return firstName ? (
    <div className="user-display-wrapper">
      <div className="user-display">
        Welcome, {firstName}!
      </div>
    </div>
  ) : null;
};



const Menu = () => {
  const { addToCart } = useShoppingCart();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('customer');
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const role = location.state?.userRole || await checkUserRole(user.uid);
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole('customer');
      }
      setLoading(false);
    });
   }, [location]);

  const handleAddToCart = (item) => {
    // Create a unique toast ID to prevent duplicate toasts
    const toastId = `add-to-cart-${item.id}`;
    
    // Check if a toast with this ID already exists
    if (!toast.isActive(toastId)) {
      addToCart(item);
      console.log('Adding item to cart:', item);
      toast.success(`${item.name} added to cart!`, {
        toastId, // Use unique ID to prevent duplicates
        onClick: () => navigate('/cart')
      });
    }
  };


  const showLoginAlert = () => {
    Swal.fire({
      title: 'Signup Required',
      text: 'Please create an account to access the feedback page.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Create an Account'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/signup');
      }
    });
  };

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
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      }}>
      <DotSpinner size={40} speed={0.9} color="white" />
      </div>
    );
  }


  return (
    <div className='body'>
    <div className='menu-container-menu'>
      <header className='menu-header'>
        <div className="header-left">
          <UserDisplay />
        </div>
        <div className="header-right">
        {userRole === 'admin' && (
            <Link to="/admin-dashboard">
              <FaCog className='dashboard-link'/>
            </Link>
          )}
          {userRole === 'cashier' && (
            <Link to="/cashier-dashboard">
              <FaCog className='dashboard-link'/>
            </Link>
          )}
          <ShoppingCartIcon />
        </div>
      </header>
      <SearchBar />
      <main>
        <Categories addToCart={handleAddToCart} />
        <PromoBanner />
        <PopularMeals />
        <TrackingBanner />
        <PopularDrinks />
        {/* <RecommendedSection recipes={recommendedRecipes} addToCart={handleAddToCart} /> */}
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="custom-toast-container" 
      />

      <NavBar />
    </div>
    </div>
    
  );
};
export default Menu;