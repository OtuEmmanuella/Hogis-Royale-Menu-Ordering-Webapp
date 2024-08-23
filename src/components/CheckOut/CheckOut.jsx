import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, User, FileText } from 'lucide-react';

import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity } from 'react-icons/fa';

import { IoMdArrowBack, IoMdLock } from "react-icons/io";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { usePaystackPayment } from 'react-paystack';
import { ClipLoader } from 'react-spinners';
import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';
import { getFlutterwaveConfig, getPaystackConfig } from '../FlutterWave/FlutterwaveConfig';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './CheckOut.css';

const CheckoutPage = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialDeliveryOption = searchParams.get('delivery') || '';
  const initialDeliveryPrice = Number(searchParams.get('deliveryPrice')) || 0;

  const [paymentMethod, setPaymentMethod] = useState('flutterwave');
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

  const { cartItems } = useShoppingCart();

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalAmount = totalPrice + deliveryPrice;

  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const customer = {
    email: email,
    phone_number: phone,
    name: name,
  };

  const flutterwaveConfig = getFlutterwaveConfig(finalAmount, customer);
  const handleFlutterPayment = useFlutterwave(flutterwaveConfig);

  const paystackConfig = getPaystackConfig(finalAmount, { email });
  const initializePaystackPayment = usePaystackPayment(paystackConfig);

  const generateInvoice = (orderDetails, customerInfo) => {
    const doc = new jsPDF();

    const logoUrl = '/Hogis.jpg';
    const logoWidth = 40;
    const logoHeight = 40;
    doc.addImage(logoUrl, 'PNG', 10, 10, logoWidth, logoHeight);

    // Company details
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('Hogis Royale', 105, 20, null, null, 'center');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('6 Bishop Moynagh Avenue, State Housing Calabar, Nigeria', 105, 30, null, null, 'center');
    doc.text('Phone: +2348100072049 | Email: info@hogisroyale.com', 105, 35, null, null, 'center');

    // Invoice title and number
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 20, 50);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Invoice Number: INV-${Date.now()}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);

    // Add customer information
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 20, 80);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(customerInfo.name, 20, 85);
    doc.text(customerInfo.email, 20, 90);
    doc.text(customerInfo.phone, 20, 95);
    doc.text(customerInfo.address, 20, 100);
    doc.text(customerInfo.city, 20, 105);

    // Create table for order items
    const tableColumn = ["Item", "Quantity", "Price", "Total"];
    const tableRows = orderDetails.items.map(item => [
      item.name,
      item.quantity,
      `₦${item.price.toFixed(2)}`,
      `₦${(item.quantity * item.price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 120,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    // Add totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ₦${orderDetails.subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Delivery: ₦${orderDetails.deliveryFee.toFixed(2)}`, 140, finalY + 5);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: ₦${orderDetails.total.toFixed(2)}`, 140, finalY + 10);

    // Add footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.text('Thank you for dining with Hogis Royale!', 105, 280, null, null, 'center');

    // Save the PDF
    doc.save(`hogis_royale_invoice_${Date.now()}.pdf`);
  };

  const prepareInvoiceData = () => {
    const orderDetails = {
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: totalPrice,
      deliveryFee: deliveryPrice,
      total: finalAmount
    };

    const customerInfo = {
      name: payingForSomeone ? recipientName : name,
      email,
      phone,
      address,
      city
    };

    return { orderDetails, customerInfo };
  };

  const onPaymentSuccess = (response) => {
    console.log(response);
    const { orderDetails, customerInfo } = prepareInvoiceData();
    generateInvoice(orderDetails, customerInfo);
    // Additional success handling...
  };

  const onPaystackSuccess = (reference) => {
    console.log(reference);
    onPaymentSuccess(reference);
  };

  const onPaystackClose = () => {
    console.log('Paystack payment closed');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deliveryOption) {
      alert("Please select a delivery option before proceeding to payment.");
      return;
    }
    if (paymentMethod === 'flutterwave') {
      handleFlutterPayment({
        callback: (response) => {
          console.log(response);
          closePaymentModal();
          if (response.status === "successful") {
            onPaymentSuccess(response);
          } else {
            console.log("Flutterwave payment failed");
          }
        },
        onClose: () => {},
      });
    } else if (paymentMethod === 'paystack') {
      initializePaystackPayment(onPaystackSuccess, onPaystackClose);
    }
  };

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust this time as needed

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <ClipLoader color="#0066CC" size={50} />
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
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Full Name" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <FaEnvelope className="input-icon" />
                  <input 
                    id="email" 
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
                    id="phone" 
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
                    id="address" 
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
                    id="city" 
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
                  <button
                    type="button"
                    className={`payment-option ${paymentMethod === 'flutterwave' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('flutterwave')}
                    aria-label="Pay with Flutterwave"
                  >
                    <img src='/flutterwave-1.svg' alt="Flutterwave" />
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
                    id="recipient" 
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
              <IoMdLock /> Secured by {paymentMethod === 'flutterwave' ? 'Flutterwave' : 'Paystack'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;