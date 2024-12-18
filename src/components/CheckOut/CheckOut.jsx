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
  const [deliveryMethod, setDeliveryMethod] = useState(searchParams.get('deliveryMethod') || '');

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
  const [recipientPhone, setRecipientPhone] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentProcessingMessage, setPaymentProcessingMessage] = useState('');

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

  useEffect(() => {
    let unsubscribe;
    if (orderId) {
      const orderRef = doc(db, 'orders', orderId);
      unsubscribe = onSnapshot(orderRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'success' || data.status === 'paid') {
            setProcessingPayment(true);
            setPaymentProcessingMessage('Payment confirmed. Preparing your order...');
            
            setTimeout(() => {
              setPaymentStatus('success');
              navigate(`/order-confirmation/${orderId}`);
            }, 2000);
          } else if (data.status === 'failed') {
            setProcessingPayment(false);
            setPaymentProcessingMessage('Payment failed. Please try again.');
            setPaymentStatus('failed');
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

    const orderRef = doc(collection(db, 'orders'));
    const orderId = orderRef.id;

    const orderData = {
      id: orderId,
      customer: {
        userId: user ? user.uid : null,
        customerName: name,
        recipientName: payingForSomeone ? recipientName : null,
        recipientPhone: payingForSomeone ? recipientPhone : null, 
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
      deliveryMethod, 
      deliveryPrice,
      branchId: branchId,
      branchName: branches[branchId] || 'Unknown Branch'
    };

    await setDoc(orderRef, orderData);
  
    setOrderId(orderId);
    return orderId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await saveUserInformation();

    try {
      const orderId = await createOrder();

      setProcessingPayment(true);
      setPaymentProcessingMessage('Initiating payment...');

      const config = {
        reference: orderId,
        email: email,
        amount: finalAmount * 100,
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        metadata: {
          branchId: branchId,
          orderType: orderType,
          deliveryLocation: deliveryLocation,
          deliveryMethod: deliveryMethod
        }
      };

      const initializePayment = usePaystackPayment(config);
      initializePayment(
        (response) => {
          console.log('Payment initiated:', response);
          setPaymentProcessingMessage('Processing payment...');
        },
        () => {
          setProcessingPayment(false);
          setPaymentProcessingMessage('Payment process cancelled.');
          console.log("Payment closed");
        }
      );
    } catch (error) {
      setProcessingPayment(false);
      setPaymentProcessingMessage('Error processing order. Please try again.');
      console.error("Order creation failed:", error);
    }
  };

  const PaymentProcessingOverlay = () => {
    return (
      <div className="payment-processing-overlay">
        <div className="payment-processing-content">
          <div className="spinner"></div>
          <p>{paymentProcessingMessage}</p>
        </div>
      </div>
    );
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
      {processingPayment && <PaymentProcessingOverlay />}
      
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
                    placeholder="Your Address Or Recipient's address if your paying for someone else"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Method</label>
                  <input
                    type="text"
                    value={deliveryMethod}
                    readOnly
                    className="form-control"
                  />
                </div>
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
                <>
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
                  <div className="form-group">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="Recipient's phone number"
                      required
                    />
                  </div>
                </>
              )}

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

              <button type="submit" className="pay-button">
                Pay {formatPrice(finalAmount)}
                <IoMdLock className="lock-icon" />
              </button>
              <small className="text-gray-500 text-center block mt-1">
  Secured with Paystack
</small>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;