// import React, { useState } from 'react';
// import { addDoc, collection } from 'firebase/firestore';
// import { db, auth } from '../Firebase/FirebaseConfig';
// import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
// import { usePaystackPayment } from 'react-paystack';
// import { getFlutterwaveConfig, getPaystackConfig } from '../FlutterWave/FlutterwaveConfig';
// import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity } from 'react-icons/fa';
// import { IoMdArrowBack, IoMdLock } from "react-icons/io";
// import './CheckOut.css';

// const CheckoutPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//   const initialDeliveryOption = searchParams.get('delivery') || '';
//   const initialDeliveryPrice = Number(searchParams.get('deliveryPrice')) || 0;

//   const [paymentMethod, setPaymentMethod] = useState('flutterwave');
//   const [saveInfo, setSaveInfo] = useState(false);
//   const [payingForSomeone, setPayingForSomeone] = useState(false);
//   const [deliveryOption, setDeliveryOption] = useState(initialDeliveryOption);
//   const [deliveryPrice, setDeliveryPrice] = useState(initialDeliveryPrice);
//   const [showInvoice, setShowInvoice] = useState(false);

//   // Form fields
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [address, setAddress] = useState('');
//   const [city, setCity] = useState('');
//   const [recipientName, setRecipientName] = useState('');

//   const { cartItems, clearCart } = useShoppingCart();

//   const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const finalAmount = totalPrice + deliveryPrice;

//   const formatPrice = (price) => {
//     return `₦${price.toLocaleString('en-NG', {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     })}`;
//   };

//   const createOrder = async () => {
//     const user = auth.currentUser;
//     const orderRef = await addDoc(collection(db, 'orders'), {
//       customer: {
//         userId: user ? user.uid : null,
//         name: payingForSomeone ? recipientName : name,
//         email,
//         phone,
//         address,
//         city,
//       },
//       items: cartItems,
//       totalAmount: finalAmount,
//       status: 'pending',
//       createdAt: new Date(),
//       paymentMethod,
//       deliveryOption,
//       deliveryPrice,
//     });
//     return orderRef.id;
//   };

//   const handlePaymentSuccess = (orderId) => {
//     setShowInvoice(true);
//     clearCart();
//     // You might want to navigate to a success page or show a success modal
//     navigate(`/order-confirmation/${orderId}`);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!deliveryOption) {
//       alert("Please select a delivery option before proceeding to payment.");
//       return;
//     }
    
//     const orderId = await createOrder();
    
//     if (paymentMethod === 'flutterwave') {
//       const config = {
//         ...getFlutterwaveConfig(finalAmount, { email, phone_number: phone, name }),
//         tx_ref: orderId,
//       };
//       const handleFlutterPayment = useFlutterwave(config);
//       handleFlutterPayment({
//         callback: (response) => {
//           console.log(response);
//           closePaymentModal();
//           if (response.status === "successful") {
//             handlePaymentSuccess(orderId);
//           } else {
//             console.log("Flutterwave payment failed");
//           }
//         },
//         onClose: () => {},
//       });
//     } else if (paymentMethod === 'paystack') {
//       const config = {
//         ...getPaystackConfig(finalAmount, { email }),
//         reference: orderId,
//       };
//       const initializePayment = usePaystackPayment(config);
//       initializePayment(
//         (response) => {
//           console.log(response);
//           handlePaymentSuccess(orderId);
//         },
//         () => {
//           console.log("Paystack payment closed");
//         }
//       );
//     }
//   };


//   return (
//     <div className="checkout-page">
//       <div className="checkout-container">
//         <div className="checkout-header">
//           <Link to="/cart" className="back-link">
//             <IoMdArrowBack size={24} />
//             <span>Back to Cart</span>
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
//                     id="name" 
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
//                     id="email" 
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
//                     id="phone" 
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
//                     id="address" 
//                     type="text" 
//                     value={address} 
//                     onChange={(e) => setAddress(e.target.value)} 
//                     placeholder="Address" 
//                     required 
//                   />
//                 </div>

//                 <div className="form-group">
//                   <FaCity className="input-icon" />
//                   <input 
//                     id="city" 
//                     type="text" 
//                     value={city} 
//                     onChange={(e) => setCity(e.target.value)} 
//                     placeholder="City" 
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
//                   <button
//                     type="button"
//                     className={`payment-option ${paymentMethod === 'flutterwave' ? 'selected' : ''}`}
//                     onClick={() => setPaymentMethod('flutterwave')}
//                     aria-label="Pay with Flutterwave"
//                   >
//                     <img src='/flutterwave-1.svg' alt="Flutterwave" />
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
//                     id="recipient" 
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
//                       <span className="invoice-item-name">{item.name}</span>
//                       <span className="invoice-item-quantity">x{item.quantity}</span>
//                       <span className="invoice-item-price">{formatPrice(item.price * item.quantity)}</span>
//                     </li>
//                   ))}
//                 </ul>
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
//               <IoMdLock /> Secured by {paymentMethod === 'flutterwave' ? 'Flutterwave' : 'Paystack'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;










import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../Firebase/FirebaseConfig';
import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity } from 'react-icons/fa';
import { IoMdArrowBack, IoMdLock } from "react-icons/io";
import './CheckOut.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialDeliveryOption = searchParams.get('delivery') || '';
  const initialDeliveryPrice = Number(searchParams.get('deliveryPrice')) || 0;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    recipientName: ''
  });

  // Other state
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [saveInfo, setSaveInfo] = useState(false);
  const [payingForSomeone, setPayingForSomeone] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState(initialDeliveryOption);
  const [deliveryPrice, setDeliveryPrice] = useState(initialDeliveryPrice);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { cartItems, clearCart } = useShoppingCart();

  // Load saved user info if available
  useEffect(() => {
    const loadSavedInfo = async () => {
      const user = auth.currentUser;
      if (user && localStorage.getItem('savedUserInfo')) {
        const savedInfo = JSON.parse(localStorage.getItem('savedUserInfo'));
        setFormData(prevData => ({
          ...prevData,
          ...savedInfo
        }));
      }
    };
    loadSavedInfo();
  }, []);

  // Calculate totals
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalAmount = totalPrice + deliveryPrice;

  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const createOrder = async () => {
    const user = auth.currentUser;
    try {
      const orderData = {
        customer: {
          userId: user ? user.uid : null,
          name: payingForSomeone ? formData.recipientName : formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
        },
        items: cartItems,
        totalAmount: finalAmount,
        status: 'pending',
        createdAt: new Date(),
        paymentMethod,
        deliveryOption,
        deliveryPrice,
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, status, reference) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        paymentReference: reference,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const handlePaymentSuccess = async (orderId, reference) => {
    try {
      await updateOrderStatus(orderId, 'paid', reference);
      
      if (saveInfo) {
        localStorage.setItem('savedUserInfo', JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city
        }));
      }

      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error('Error processing success:', error);
      alert('Payment successful but there was an error updating your order. Please contact support.');
    }
  };

  const handlePaystackPayment = async (e) => {
    e.preventDefault();
    if (!deliveryOption) {
      alert("Please select a delivery option before proceeding to payment.");
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = await createOrder();

      const config = {
        reference: `order_${orderId}_${Date.now()}`,
        email: formData.email,
        amount: finalAmount * 100, // Convert to kobo
        publicKey: process.env.VITE_PAYSTACK_PUBLIC_KEY,
        metadata: {
          orderId,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderId
            }
          ]
        },
        onSuccess: (response) => {
          handlePaymentSuccess(orderId, response.reference);
        },
        onClose: () => {
          setIsProcessing(false);
          console.log("Payment cancelled");
        }
      };

      const initializePayment = usePaystackPayment(config);
      initializePayment();
    } catch (error) {
      setIsProcessing(false);
      console.error("Error processing payment:", error);
      alert("There was an error processing your payment. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isProcessing) return;
    
    if (paymentMethod === 'paystack') {
      handlePaystackPayment(e);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <Link to="/" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <Link to="/cart" className="back-link">
            <IoMdArrowBack size={24} />
            <span>Back to Cart</span>
          </Link>
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
                    id="name" 
                    type="text" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Full Name" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <FaEnvelope className="input-icon" />
                  <input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="Email" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <FaPhone className="input-icon" />
                  <input 
                    id="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="Phone Number" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <FaMapMarkerAlt className="input-icon" />
                  <input 
                    id="address" 
                    type="text" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="Address" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <FaCity className="input-icon" />
                  <input 
                    id="city" 
                    type="text" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    placeholder="City" 
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
                    id="recipientName" 
                    type="text" 
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    placeholder="Recipient's name" 
                    required 
                  />
                </div>
              )}
            </form>
          </div>
          
          <div className="checkout-summary-container">
            <div className="order-summary">
              <h2 className="section-title">Order Summary</h2>
              <button 
                className="toggle-invoice-btn" 
                onClick={() => setShowInvoice(!showInvoice)}
              >
                {showInvoice ? 'Hide Details' : 'Show Details'}
              </button>
              
              {showInvoice && (
                <ul className="invoice-list">
                  {cartItems.map((item, index) => (
                    <li key={index} className="invoice-item">
                      <span className="invoice-item-name">{item.name}</span>
                      <span className="invoice-item-quantity">x{item.quantity}</span>
                      <span className="invoice-item-price">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="summary-row">
                <span>Delivery</span>
                <span>{formatPrice(deliveryPrice)}</span>
              </div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(finalAmount)}</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="pay-button" 
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ${formatPrice(finalAmount)}`}
              <IoMdLock className="lock-icon" />
            </button>
            
            <p className="secure-text">
              <IoMdLock /> Secured by Paystack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;