import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createHmac } from 'crypto';
import { sendOrderConfirmation, sendPaymentFailureNotification } from './services/emailService.js';

// Initialize Firebase Admin
let firebaseApp;

function initializeFirebase() {
  if (!firebaseApp) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CERT_URL
    };

    firebaseApp = initializeApp({
      credential: cert(serviceAccount)
    });
  }
  return firebaseApp;
}

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const signature = event.headers['x-paystack-signature'];

    // Verify Paystack signature
    const hash = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    // Initialize Firebase
    initializeFirebase();
    const db = getFirestore();

    const { event: webhookEvent, data } = body;
    const orderId = data.reference;

    // Get order from Firestore
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    const orderData = orderDoc.data();

    switch (webhookEvent) {
      case 'charge.success':
        await handleSuccessfulPayment(orderRef, orderData, data);
        break;
      case 'charge.failed':
        await handleFailedPayment(orderRef, orderData, data);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Unhandled event type' })
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook processed successfully' })
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleSuccessfulPayment(orderRef, orderData, paymentData) {
  const updates = {
    status: 'paid',
    paymentDetails: paymentData,
    paymentReference: paymentData.reference,
    updatedAt: FieldValue.serverTimestamp(),
    paymentDate: FieldValue.serverTimestamp()
  };

  await orderRef.update(updates);

  // Create payment record
  const db = getFirestore();
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
}

async function handleFailedPayment(orderRef, orderData, paymentData) {
  const updates = {
    status: 'failed',
    paymentError: paymentData.gateway_response,
    updatedAt: FieldValue.serverTimestamp(),
    paymentReference: paymentData.reference
  };

  await orderRef.update(updates);

  // Create payment record
  const db = getFirestore();
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
}