import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../Firebase/FirebaseConfig';
import { usePaystackPayment } from 'react-paystack';
import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity } from 'react-icons/fa';
import { IoMdArrowBack, IoMdLock } from "react-icons/io";
import './CheckOut.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const branchId = searchParams.get('branch');
  const initialOrderType = searchParams.get('orderType') || '';
  const initialDeliveryLocation = searchParams.get('deliveryLocation') || '';
  const initialDeliveryPrice = Number(searchParams.get('deliveryPrice')) || 0;

  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [saveInfo, setSaveInfo] = useState(true);
  const [payingForSomeone, setPayingForSomeone] = useState(false);
  const [orderType, setOrderType] = useState(initialOrderType);
  const [deliveryLocation, setDeliveryLocation] = useState(initialDeliveryLocation);
  const [deliveryPrice, setDeliveryPrice] = useState(initialDeliveryPrice);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [orderId, setOrderId] = useState(null); // Added state for order ID
  const [paymentStatus, setPaymentStatus] = useState('pending'); // Added state for payment status

  const { cartItems, clearCart } = useShoppingCart();

  const branches = {
    '1': 'Hogis Royale And Apartment',
    '2': 'Hogis Luxury Suites',
    '3': 'Hogis Exclusive Resorts'
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      const user = auth.currentUser;

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          setName(
            (user.displayName ||
            `${userDocSnap.data()?.firstName || ''} ${userDocSnap.data()?.lastName || ''}`).trim()
          );

          setEmail(user.email || '');

          const phoneNumber =
            userDocSnap.data()?.phoneNumber ||
            user.phoneNumber ||
            '';
          setPhone(phoneNumber);

          setAddress(userDocSnap.data()?.address || '');
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }

      setIsLoading(false);
    };

    fetchUserDetails();
  }, []);

  // Listen for changes in order status
  useEffect(() => {
    let unsubscribe;
    if (orderId) {
      const orderRef = doc(db, 'orders', orderId);
      unsubscribe = onSnapshot(orderRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'success' || data.status === 'paid') {
            setPaymentStatus('success');
            navigate(`/order-confirmation/${orderId}`);
          } else if (data.status === 'failed') {
            setPaymentStatus('failed');
            // Optionally, show an error message to the user here
          }
        }
      });
    }

    return () => unsubscribe && unsubscribe();
  }, [orderId, navigate]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalAmount = totalPrice + deliveryPrice;

  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const saveUserInformation = async () => {
    const user = auth.currentUser;
    if (user && saveInfo) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          phoneNumber: phone,
          address,
          city,
        }, { merge: true });
      } catch (error) {
        console.error("Error saving user information:", error);
      }
    }
  };

  const createOrder = async () => {
    const user = auth.currentUser;
    const orderData = {
      customer: {
        userId: user ? user.uid : null,
        customerName: name,
        recipientName: payingForSomeone ? recipientName : null,
        email,
        phone,
        address,
        city,
      },
      items: cartItems.map(item => ({
        ...item,
        specifications: item.specifications || 'No special instructions'
      })),
      totalAmount: finalAmount,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod,
      orderType,
      deliveryLocation,
      deliveryPrice,
      branchId: branchId,
      branchName: branches[branchId] || 'Unknown Branch'
    };

    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    setOrderId(orderRef.id); // Set the order ID
    return orderRef.id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await saveUserInformation();

    try {
      const orderId = await createOrder();

      const config = {
        reference: orderId,
        email: email,
        amount: finalAmount * 100,
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        metadata: {
          branchId: branchId,
          orderType: orderType,
          deliveryLocation: deliveryLocation
        }
      };

      const initializePayment = usePaystackPayment(config);
      initializePayment(
        (response) => {
          console.log('Payment successful:', response);
          // The payment status change will now be handled via Firebase listener
        },
        () => {
          console.log("Payment closed");
        }
      );
    } catch (error) {
      console.error("Order creation failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button onClick={() => navigate(-1)} className="back-link">
            <IoMdArrowBack /> Back
          </button>
          <h1 className="checkout-title">Checkout</h1>
        </div>

        <div className="checkout-content">
          <div className="checkout-form-container">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h2 className="section-title">Delivery Information</h2>
                <div className="form-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div className="form-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                </div>

                <div className="form-group">
                  <FaPhone className="input-icon" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    required
                  />
                </div>

                <div className="form-group">
                  <FaMapMarkerAlt className="input-icon" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h2 className="section-title">Payment Method</h2>
                <div className="payment-options">
                  <button
                    type="button"
                    className={`payment-option ${paymentMethod === 'paystack' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('paystack')}
                    aria-label="Pay with Paystack"
                  >
                    <img className='paystack' src='/paystack-2.svg' alt="Paystack" />
                  </button>
                </div>
              </div>

              <div className="form-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={() => setSaveInfo(!saveInfo)}
                  />
                  <span>Save this information for next time</span>
                </label>
              </div>

              <div className="form-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={payingForSomeone}
                    onChange={() => setPayingForSomeone(!payingForSomeone)}
                  />
                  <span>Paying for someone else?</span>
                </label>
              </div>

              {payingForSomeone && (
                <div className="form-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient's name"
                    required
                  />
                </div>
              )}

              <button type="submit" className="pay-button">
                Pay {formatPrice(finalAmount)}
                <IoMdLock className="lock-icon" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;



// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
// import { db, auth } from '../Firebase/FirebaseConfig';
// import { usePaystackPayment } from 'react-paystack';
// import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';
// import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity } from 'react-icons/fa';
// import { IoMdArrowBack, IoMdLock } from "react-icons/io";
// import './CheckOut.css';

// const CheckoutPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);

//   const branchId = searchParams.get('branch');
//   const initialOrderType = searchParams.get('orderType') || '';
//   const initialDeliveryLocation = searchParams.get('deliveryLocation') || '';
//   const initialDeliveryPrice = Number(searchParams.get('deliveryPrice')) || 0;

//   const [paymentMethod, setPaymentMethod] = useState('paystack');
//   const [saveInfo, setSaveInfo] = useState(true);
//   const [payingForSomeone, setPayingForSomeone] = useState(false);
//   const [orderType, setOrderType] = useState(initialOrderType);
//   const [deliveryLocation, setDeliveryLocation] = useState(initialDeliveryLocation);
//   const [deliveryPrice, setDeliveryPrice] = useState(initialDeliveryPrice);
//   const [showInvoice, setShowInvoice] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [address, setAddress] = useState('');
//   const [city, setCity] = useState('');
//   const [recipientName, setRecipientName] = useState('');

//   const { cartItems, clearCart } = useShoppingCart();

//   const branches = {
//     '1': 'Hogis Royale And Apartment',
//     '2': 'Hogis Luxury Suites',
//     '3': 'Hogis Exclusive Resorts'
//   };

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       setIsLoading(true);
//       const user = auth.currentUser;

//       if (user) {
//         try {
//           const userDocRef = doc(db, 'users', user.uid);
//           const userDocSnap = await getDoc(userDocRef);

//           setName(
//             (user.displayName ||
//             `${userDocSnap.data()?.firstName || ''} ${userDocSnap.data()?.lastName || ''}`).trim()
//           );

//           setEmail(user.email || '');

//           const phoneNumber =
//             userDocSnap.data()?.phoneNumber ||
//             user.phoneNumber ||
//             '';
//           setPhone(phoneNumber);

//           setAddress(userDocSnap.data()?.address || '');
//         } catch (error) {
//           console.error("Error fetching user details:", error);
//         }
//       }

//       setIsLoading(false);
//     };

//     fetchUserDetails();
//   }, []);

//   const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const finalAmount = totalPrice + deliveryPrice;

//   const formatPrice = (price) => {
//     return `₦${price.toLocaleString('en-NG', {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     })}`;
//   };

//   const saveUserInformation = async () => {
//     const user = auth.currentUser;
//     if (user && saveInfo) {
//       try {
//         await setDoc(doc(db, 'users', user.uid), {
//           name,
//           email,
//           phoneNumber: phone,
//           address,
//           city,
//         }, { merge: true });
//       } catch (error) {
//         console.error("Error saving user information:", error);
//       }
//     }
//   };

//   const createOrder = async () => {
//     const user = auth.currentUser;
//     const orderData = {
//       customer: {
//         userId: user ? user.uid : null,
//         customerName: name,
//         recipientName: payingForSomeone ? recipientName : null,
//         email,
//         phone,
//         address,
//         city,
//       },
//       items: cartItems.map(item => ({
//         ...item,
//         specifications: item.specifications || 'No special instructions'
//       })),
//       totalAmount: finalAmount,
//       status: 'pending',
//       createdAt: new Date(),
//       paymentMethod,
//       orderType,
//       deliveryLocation,
//       deliveryPrice,
//       branchId: branchId,
//       branchName: branches[branchId] || 'Unknown Branch'
//     };

//     const orderRef = await addDoc(collection(db, 'orders'), orderData);
//     return orderRef.id;
//   };

//   const handlePaymentSuccess = (orderId) => {
//     setShowInvoice(true);
//     clearCart();
//     navigate(`/order-confirmation/${orderId}`);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     await saveUserInformation();

//     try {
//       const orderId = await createOrder();

//       const config = {
//         reference: orderId,
//         email: email,
//         amount: finalAmount * 100,
//         publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
//         metadata: {
//           branchId: branchId,
//           orderType: orderType,
//           deliveryLocation: deliveryLocation
//         }
//       };

//       const initializePayment = usePaystackPayment(config);
//       initializePayment(
//         (response) => {
//           console.log('Payment successful:', response);
//           handlePaymentSuccess(orderId);
//         },
//         () => {
//           console.log("Payment closed");
//         }
//       );
//     } catch (error) {
//       console.error("Order creation failed:", error);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="checkout-page">
//       <div className="checkout-container">
//         <div className="checkout-header">
//           <button onClick={() => navigate(-1)} className="back-link">
//             <IoMdArrowBack /> Back
//           </button>
//           <h1 className="checkout-title">Checkout</h1>
//         </div>

//         <div className="checkout-content">
//           <div className="checkout-form-container">
//             <form className="checkout-form" onSubmit={handleSubmit}>
//               <div className="form-section">
//                 <h2 className="section-title">Delivery Information</h2>
//                 <div className="form-group">
//                   <FaUser className="input-icon" />
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="Full Name"
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <FaEnvelope className="input-icon" />
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Email"
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <FaPhone className="input-icon" />
//                   <input
//                     type="tel"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     placeholder="Phone Number"
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <FaMapMarkerAlt className="input-icon" />
//                   <input
//                     type="text"
//                     value={address}
//                     onChange={(e) => setAddress(e.target.value)}
//                     placeholder="Address"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="form-section">
//                 <h2 className="section-title">Payment Method</h2>
//                 <div className="payment-options">
//                   <button
//                     type="button"
//                     className={`payment-option ${paymentMethod === 'paystack' ? 'selected' : ''}`}
//                     onClick={() => setPaymentMethod('paystack')}
//                     aria-label="Pay with Paystack"
//                   >
//                     <img className='paystack' src='/paystack-2.svg' alt="Paystack" />
//                   </button>
//                 </div>
//               </div>

//               <div className="form-section">
//                 <label className="checkbox-label">
//                   <input
//                     type="checkbox"
//                     checked={saveInfo}
//                     onChange={() => setSaveInfo(!saveInfo)}
//                   />
//                   <span>Save this information for next time</span>
//                 </label>
//               </div>

//               <div className="form-section">
//                 <label className="checkbox-label">
//                   <input
//                     type="checkbox"
//                     checked={payingForSomeone}
//                     onChange={() => setPayingForSomeone(!payingForSomeone)}
//                   />
//                   <span>Paying for someone else?</span>
//                 </label>
//               </div>

//               {payingForSomeone && (
//                 <div className="form-group">
//                   <FaUser className="input-icon" />
//                   <input
//                     type="text"
//                     value={recipientName}
//                     onChange={(e) => setRecipientName(e.target.value)}
//                     placeholder="Recipient's name"
//                     required
//                   />
//                 </div>
//               )}
//             </form>
//           </div>

//           <div className="checkout-summary-container">
//             <div className="order-summary">
//               <h2 className="section-title">Order Summary</h2>
//               <button className="toggle-invoice-btn" onClick={() => setShowInvoice(!showInvoice)}>
//                 {showInvoice ? 'Hide Details' : 'Show Details'}
//               </button>

//               {showInvoice && (
//                 <ul className="invoice-list">
//                   {cartItems.map((item, index) => (
//                     <li key={index} className="invoice-item">
//                       <div className="invoice-item-main">
//                         <span className="invoice-item-name">{item.name}</span>
//                         <span className="invoice-item-quantity">x{item.quantity}</span>
//                         <span className="invoice-item-price">
//                           {formatPrice(item.price * item.quantity)}
//                         </span>
//                       </div>

//                       {item.specifications && (
//                         <div className="invoice-item-specifications">
//                           <strong>Special Instructions:</strong> {item.specifications}
//                         </div>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//               )}

//               <div className="summary-row">
//                 <span>Branch</span>
//                 <span>{branches[branchId] || 'Unknown Branch'}</span>
//               </div>

//               <div className="summary-row">
//                 <span>Order Type</span>
//                 <span>
//                   {orderType === 'dine-in' ? 'Dine-In' :
//                    orderType === 'pickup' ? 'Takeout - Pickup' :
//                    orderType === 'delivery' ? 'Takeout - Delivery' : 'Not Specified'}
//                 </span>
//               </div>

//               {orderType === 'delivery' && (
//                 <div className="summary-row">
//                   <span>Delivery Location</span>
//                   <span>{deliveryLocation || 'Not Specified'}</span>
//                 </div>
//               )}

//               <div className="summary-row">
//                 <span>Delivery Address</span>
//                 <span>{address}, {city}</span>
//               </div>

//               <div className="summary-row">
//                 <span>Phone</span>
//                 <span>{phone}</span>
//               </div>

//               {payingForSomeone && (
//                 <>
//                   <div className="summary-row">
//                     <span>Buyer Name</span>
//                     <span>{name}</span>
//                   </div>
//                   <div className="summary-row">
//                     <span>Recipient Name</span>
//                     <span>{recipientName}</span>
//                   </div>
//                 </>
//               )}

//               <div className="summary-row">
//                 <span>Subtotal</span>
//                 <span>{formatPrice(totalPrice)}</span>
//               </div>

//               <div className="summary-row">
//                 <span>Delivery</span>
//                 <span>{formatPrice(deliveryPrice)}</span>
//               </div>

//               <div className="summary-row total">
//                 <span>Total</span>
//                 <span>{formatPrice(finalAmount)}</span>
//               </div>
//             </div>

//             <button type="submit" className="pay-button" onClick={handleSubmit}>
//               Pay {formatPrice(finalAmount)}
//               <IoMdLock className="lock-icon" />
//             </button>

//             <p className="secure-text">
//               <IoMdLock /> Secured by Paystack
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;





// import React, { useState, useEffect } from 'react';
// import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
// import { db, auth } from '../Firebase/FirebaseConfig';
// import { usePaystackPayment } from 'react-paystack';
// import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity } from 'react-icons/fa';
// import { IoMdArrowBack, IoMdLock } from "react-icons/io";
// import './CheckOut.css';

// const CheckoutPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//   const branchId = searchParams.get('branch');
//   const initialDeliveryOption = searchParams.get('delivery') || '';
//   const initialDeliveryPrice = Number(searchParams.get('deliveryPrice')) || 0;

//   // State for form fields and options
//   const [paymentMethod, setPaymentMethod] = useState('paystack');
//   const [saveInfo, setSaveInfo] = useState(true); // Default to true
//   const [payingForSomeone, setPayingForSomeone] = useState(false);
//   const [deliveryOption, setDeliveryOption] = useState(initialDeliveryOption);
//   const [deliveryPrice, setDeliveryPrice] = useState(initialDeliveryPrice);
//   const [showInvoice, setShowInvoice] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // Form fields
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [address, setAddress] = useState('');
//   const [city, setCity] = useState('');
//   const [recipientName, setRecipientName] = useState('');

//   const { cartItems, clearCart } = useShoppingCart();

//   // Fetch user details on component mount
//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       setIsLoading(true);
//       const user = auth.currentUser;

//       if (user) {
//         try {
//           // Fetch user profile from Firestore
//           const userDocRef = doc(db, 'users', user.uid);
//           const userDocSnap = await getDoc(userDocRef);

//           // Populate fields with available information
//           setName(
//             (user.displayName || 
//             `${userDocSnap.data()?.firstName || ''} ${userDocSnap.data()?.lastName || ''}`).trim()
//           );
          
//           setEmail(user.email || '');

//           // Phone number from various sources
//           const phoneNumber =
//             userDocSnap.data()?.phoneNumber ||
//             user.phoneNumber ||
//             '';
//           setPhone(phoneNumber);

//           // Additional profile details
//           setAddress(userDocSnap.data()?.address || '');
//           // setCity(userDocSnap.data()?.city || '');
//         } catch (error) {
//           console.error("Error fetching user details:", error);
//         }
//       }

//       setIsLoading(false);
//     };

//     fetchUserDetails();
//   }, []);

//   // Branches configuration
//   const branches = {
//     '1': 'Hogis Royale And Apartment',
//     '2': 'Hogis Luxury Suites',
//     '3': 'Hogis Exclusive Resorts'
//   };

//   // Price calculations
//   const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const finalAmount = totalPrice + deliveryPrice;

//   // Format price utility
//   const formatPrice = (price) => {
//     return `₦${price.toLocaleString('en-NG', {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     })}`;
//   };

//   // Save user information method
//   const saveUserInformation = async () => {
//     const user = auth.currentUser;
//     if (user && saveInfo) {
//       try {
//         await setDoc(doc(db, 'users', user.uid), {
//           name,
//           email,
//           phoneNumber: phone,
//           address,
//           city,
//         }, { merge: true });
//       } catch (error) {
//         console.error("Error saving user information:", error);
//       }
//     }
//   };

//   // Create order method
//   const createOrder = async () => {
//     const user = auth.currentUser;
//     const orderData = {
//       customer: {
//         userId: user ? user.uid : null,
//         customerName: name,
//         recipientName: payingForSomeone ? recipientName : null,
//         email,
//         phone,
//         address,
//         city,
//       },
//       items: cartItems.map(item => ({
//         ...item,
//         specifications: item.specifications || 'No special instructions'
//       })),
//       totalAmount: finalAmount,
//       status: 'pending',
//       createdAt: new Date(),
//       paymentMethod,
//       deliveryOption,
//       deliveryPrice,
//       branchId: branchId,
//       branchName: branches[branchId] || 'Unknown Branch'
//     };

//     const orderRef = await addDoc(collection(db, 'orders'), orderData);
//     return orderRef.id;
//   };

//   // Handle payment success
//   const handlePaymentSuccess = (orderId) => {
//     setShowInvoice(true);
//     clearCart();
//     navigate(`/order-confirmation/${orderId}`);
//   };

//   // Submit handler
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Save user information if checked
//     await saveUserInformation();

//     try {
//       const orderId = await createOrder();

//       // Paystack payment initialization
//       const config = {
//         reference: orderId,
//         email: email,
//         amount: finalAmount * 100, // Convert to kobo
//         publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
//         metadata: {
//           branchId: branchId,
//           deliveryOption: deliveryOption
//         }
//       };

//       const initializePayment = usePaystackPayment(config);
//       initializePayment(
//         (response) => {
//           console.log('Payment successful:', response);
//           handlePaymentSuccess(orderId);
//         },
//         () => {
//           console.log("Payment closed");
//         }
//       );
//     } catch (error) {
//       console.error("Order creation failed:", error);
//     }
//   };

//   // Render loading state if fetching user details
//   if (isLoading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="checkout-page">
//       <div className="checkout-container">
//         <div className="checkout-header">
//           <Link to="/cart" className="back-link">
//             <IoMdArrowBack /> Back to Cart
//           </Link>
//           <h1 className="checkout-title">Checkout</h1>
//         </div>

//         <div className="checkout-content">
//           <div className="checkout-form-container">
//             <form className="checkout-form" onSubmit={handleSubmit}>
//               <div className="form-section">
//                 <h2 className="section-title">Delivery Information</h2>
//                 <div className="form-group">
//                   <FaUser className="input-icon" />
//                   <input 
//                     type="text" 
//                     value={name} 
//                     onChange={(e) => setName(e.target.value)} 
//                     placeholder="Full Name" 
//                     required 
//                   />
//                 </div>
                
//                 <div className="form-group">
//                   <FaEnvelope className="input-icon" />
//                   <input 
//                     type="email" 
//                     value={email} 
//                     onChange={(e) => setEmail(e.target.value)} 
//                     placeholder="Email" 
//                     required 
//                   />
//                 </div>

//                 <div className="form-group">
//                   <FaPhone className="input-icon" />
//                   <input 
//                     type="tel" 
//                     value={phone} 
//                     onChange={(e) => setPhone(e.target.value)} 
//                     placeholder="Phone Number" 
//                     required 
//                   />
//                 </div>

//                 <div className="form-group">
//                   <FaMapMarkerAlt className="input-icon" />
//                   <input 
//                     type="text" 
//                     value={address} 
//                     onChange={(e) => setAddress(e.target.value)} 
//                     placeholder="Address" 
//                     required 
//                   />
//                 </div>

//               </div>
              
//               <div className="form-section">
//                 <h2 className="section-title">Payment Method</h2>
//                 <div className="payment-options">
//                   <button
//                     type="button"
//                     className={`payment-option ${paymentMethod === 'paystack' ? 'selected' : ''}`}
//                     onClick={() => setPaymentMethod('paystack')}
//                     aria-label="Pay with Paystack"
//                   >
//                     <img className='paystack' src='/paystack-2.svg' alt="Paystack" />
//                   </button>
//                 </div>
//               </div>

//               <div className="form-section">
//                 <label className="checkbox-label">
//                   <input
//                     type="checkbox"
//                     checked={saveInfo}
//                     onChange={() => setSaveInfo(!saveInfo)}
//                   />
//                   <span>Save this information for next time</span>
//                 </label>
//               </div>

//               <div className="form-section">
//                 <label className="checkbox-label">
//                   <input
//                     type="checkbox"
//                     checked={payingForSomeone}
//                     onChange={() => setPayingForSomeone(!payingForSomeone)}
//                   />
//                   <span>Paying for someone else?</span>
//                 </label>
//               </div>

//               {payingForSomeone && (
//                 <div className="form-group">
//                   <FaUser className="input-icon" />
//                   <input 
//                     type="text" 
//                     value={recipientName}
//                     onChange={(e) => setRecipientName(e.target.value)}
//                     placeholder="Recipient's name" 
//                     required 
//                   />
//                 </div>
//               )}
//             </form>
//           </div>
          
//           <div className="checkout-summary-container">
//             <div className="order-summary">
//               <h2 className="section-title">Order Summary</h2>
//               <button className="toggle-invoice-btn" onClick={() => setShowInvoice(!showInvoice)}>
//                 {showInvoice ? 'Hide Details' : 'Show Details'}
//               </button>
//               {showInvoice && (
//                 <ul className="invoice-list">
//                   {cartItems.map((item, index) => (
//                     <li key={index} className="invoice-item">
//                       <div className="invoice-item-main">
//                         <span className="invoice-item-name">{item.name}</span>
//                         <span className="invoice-item-quantity">x{item.quantity}</span>
//                         <span className="invoice-item-price"> -{formatPrice(item.price * item.quantity)}</span>
//                       </div>
                    
//                       {item.specifications && (
//                         <div className="invoice-item-specifications">
//                           <strong>Special Instructions:</strong> {item.specifications}
//                         </div>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
                
//               )}

//               <div className="summary-row">
//                 <span>Branch</span>
//                 <span>{branches[branchId] || 'Unknown Branch'}</span>
//               </div>
//               <div className="summary-row">
//                 <span>Delivery Location</span>
//                 <span>{deliveryOption}</span>
//               </div>
//               <div className="summary-row">
//                 <span>Delivery Address</span>
//                 <span>{address}, {city}</span>
//               </div>
//               <div className="summary-row">
//                 <span>Phone</span>
//                 <span>{phone}</span>
//               </div>
//               {payingForSomeone && (
//                   <>
//                     <div className="summary-row">
//                       <span>Buyer Name</span>
//                       <span>{name}</span>
//                     </div>
//                     <div className="summary-row">
//                       <span>Recipient Name</span>
//                       <span>{recipientName}</span>
//                     </div>
//                   </>
//                 )}
//               <div className="summary-row">
//                 <span>Subtotal</span>
//                 <span>{formatPrice(totalPrice)}</span>
//               </div>
//               <div className="summary-row">
//                 <span>Delivery</span>
//                 <span>{formatPrice(deliveryPrice)}</span>
//               </div>
//               <div className="summary-row total">
//                 <span>Total</span>
//                 <span>{formatPrice(finalAmount)}</span>
//               </div>
//             </div>
            
//             <button type="submit" className="pay-button" onClick={handleSubmit}>
//               Pay {formatPrice(finalAmount)}
//               <IoMdLock className="lock-icon" />
//             </button>
            
//             <p className="secure-text">
//               <IoMdLock /> Secured by Paystack
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;