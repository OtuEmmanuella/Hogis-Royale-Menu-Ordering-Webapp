// /api/webhooks/paystack.js

import { createHmac } from 'crypto';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { sendOrderConfirmation, sendPaymentFailureNotification } from '../services/emailService.js';
import { generateAndSendInvoice } from '../services/invoiceService.js';
import PaymentService from '../services/paymentService.js';

// Initialize Firebase Admin
if (!global.firebaseApp) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.VITE_FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CERT_URL
  };

  try {
    global.firebaseApp = initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

const db = getFirestore();

export default async function handler(req, res) {
  console.log('Webhook received:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Paystack signature
    const secret = process.env.VITE_PAYSTACK_SECRET_KEY;
    const hash = createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    console.log('Signature verification:', {
      calculated: hash,
      received: req.headers['x-paystack-signature']
    });

    if (hash !== req.headers['x-paystack-signature']) {
      console.error('Invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;
    const orderId = data.reference;

    console.log('Processing webhook event:', { event, orderId, data });

    // Get order from Firestore
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.error('Order not found:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();
    console.log('Order data:', orderData);

    // Ensure branchId is a string
    if (orderData.branchId) {
      orderData.branchId = orderData.branchId.toString();
    }

    switch (event) {
      case 'charge.success':
        await handleSuccessfulPayment(orderRef, orderData, data);
        break;
      case 'charge.failed':
        await handleFailedPayment(orderRef, orderData, data);
        break;
      default:
        console.warn('Unhandled event type:', event);
        return res.status(400).json({ error: 'Unhandled event type' });
    }

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSuccessfulPayment(orderRef, orderData, paymentData) {
  console.log('Processing successful payment:', { orderId: orderRef.id, paymentData });

  try {
    // Update order status in Firestore
    const updates = {
      status: 'paid',
      paymentDetails: paymentData,
      paymentReference: paymentData.reference,
      updatedAt: FieldValue.serverTimestamp(),
      paymentDate: FieldValue.serverTimestamp()
    };

    await orderRef.update(updates);
    console.log('Order updated successfully:', updates);

    // Create payment record
    const paymentRef = db.collection('payments').doc(orderRef.id);
    await paymentRef.set({
      orderId: orderRef.id,
      status: 'success',
      amount: paymentData.amount / 100,
      currency: paymentData.currency,
      paymentReference: paymentData.reference,
      paymentGateway: 'paystack',
      customerEmail: paymentData.customer.email,
      branchId: orderData.branchId,
      metadata: paymentData,
      createdAt: FieldValue.serverTimestamp()
    });

    // Send confirmation email
    await sendOrderConfirmation(orderData.customer.email, {
      orderId: orderRef.id,
      branchId: orderData.branchId,
      amount: paymentData.amount / 100,
      items: orderData.items,
      deliveryOption: orderData.deliveryOption,
      deliveryPrice: orderData.deliveryPrice
    });

    // Generate and send invoice
    await generateAndSendInvoice(orderData);

    console.log('Payment processing completed successfully');
  } catch (error) {
    console.error('Error in handleSuccessfulPayment:', error);
    throw error;
  }
}

async function handleFailedPayment(orderRef, orderData, paymentData) {
  console.log('Processing failed payment:', { orderId: orderRef.id, paymentData });

  try {
    // Update order status in Firestore
    const updates = {
      status: 'failed',
      paymentError: paymentData.gateway_response,
      updatedAt: FieldValue.serverTimestamp(),
      paymentReference: paymentData.reference
    };

    await orderRef.update(updates);
    console.log('Order updated with failed status:', updates);

    // Create payment record
    const paymentRef = db.collection('payments').doc(orderRef.id);
    await paymentRef.set({
      orderId: orderRef.id,
      status: 'failed',
      amount: paymentData.amount / 100,
      currency: paymentData.currency,
      paymentReference: paymentData.reference,
      paymentGateway: 'paystack',
      customerEmail: paymentData.customer.email,
      branchId: orderData.branchId,
      errorMessage: paymentData.gateway_response,
      metadata: paymentData,
      createdAt: FieldValue.serverTimestamp()
    });

    // Send failure notification
    await sendPaymentFailureNotification(orderData.customer.email, {
      orderId: orderRef.id,
      branchId: orderData.branchId,
      error: paymentData.gateway_response
    });

    console.log('Failed payment processing completed');
  } catch (error) {
    console.error('Error in handleFailedPayment:', error);
    throw error;
  }
}