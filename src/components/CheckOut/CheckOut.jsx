import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../Firebase/FirebaseConfig';
import { usePaystackPayment } from 'react-paystack';
import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity } from 'react-icons/fa';
import { IoMdArrowBack, IoMdLock } from "react-icons/io";
import './CheckOut.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const branchId = searchParams.get('branch');
  const initialDeliveryOption = searchParams.get('delivery') || '';
  const initialDeliveryPrice = Number(searchParams.get('deliveryPrice')) || 0;

  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [saveInfo, setSaveInfo] = useState(false);
  const [payingForSomeone, setPayingForSomeone] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState(initialDeliveryOption);
  const [deliveryPrice, setDeliveryPrice] = useState(initialDeliveryPrice);
  const [showInvoice, setShowInvoice] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [recipientName, setRecipientName] = useState('');

  const { cartItems, clearCart } = useShoppingCart();

  const branches = {
    '1': 'Hogis Royale And Apartment',
    '2': 'Hogis Luxury Suites',
    '3': 'Hogis Exclusive Resorts'
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalAmount = totalPrice + deliveryPrice;

  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const createOrder = async () => {
    const user = auth.currentUser;
    const orderData = {
      customer: {
        userId: user ? user.uid : null,
        name: payingForSomeone ? recipientName : name,
        email,
        phone,
        address,
        city,
      },
      items: cartItems,
      totalAmount: finalAmount,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod,
      deliveryOption,
      deliveryPrice,
      branchId: branchId,
      branchName: branches[branchId] || 'Unknown Branch'
    };

    console.log('Creating order with data:', orderData);

    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    return orderRef.id;
  };

  const handlePaymentSuccess = (orderId) => {
    setShowInvoice(true);
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const orderId = await createOrder();
    
    if (paymentMethod === 'paystack') {
      const config = {
        reference: orderId,
        email: email,
        amount: finalAmount,
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        metadata: {
          branchId: branchId,
          deliveryOption: deliveryOption
        }
      };

      const initializePayment = usePaystackPayment(config);
      initializePayment(
        (response) => {
          console.log('Payment successful:', response);
          handlePaymentSuccess(orderId);
        },
        () => {
          console.log("Payment closed");
        }
      );
    }
  };

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

                <div className="form-group">
                  <FaCity className="input-icon" />
                  <input 
                    type="text" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
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
                    type="text" 
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
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
              <button className="toggle-invoice-btn" onClick={() => setShowInvoice(!showInvoice)}>
                {showInvoice ? 'Hide Details' : 'Show Details'}
              </button>
              {showInvoice && (
                <ul className="invoice-list">
                  {cartItems.map((item, index) => (
                    <li key={index} className="invoice-item">
                      <span className="invoice-item-name">{item.name}</span>
                      <span className="invoice-item-quantity">x{item.quantity}</span>
                      <span className="invoice-item-price">{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="summary-row">
                <span>Branch</span>
                <span>{branches[branchId] || 'Unknown Branch'}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Location</span>
                <span>{deliveryOption}</span>
              </div>
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
            
            <button type="submit" className="pay-button" onClick={handleSubmit}>
              Pay {formatPrice(finalAmount)}
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