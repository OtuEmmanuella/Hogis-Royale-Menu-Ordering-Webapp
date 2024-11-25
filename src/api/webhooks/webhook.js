import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createHmac } from 'crypto';
import { createTransport } from 'nodemailer';

// Initialize Firebase Admin
const serviceAccount = {
  // Add your Firebase service account credentials here
  // Get this from Firebase Console > Project Settings > Service Accounts
};

if (!global.firebaseApp) {
  global.firebaseApp = initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

// Configure nodemailer
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Paystack signature
    const hash = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;
    const orderId = data.reference;

    // Get order from Firestore
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();

    switch (event) {
      case 'charge.success':
        await handleSuccessfulPayment(orderRef, orderData, data);
        break;
      case 'charge.failed':
        await handleFailedPayment(orderRef, orderData, data);
        break;
      default:
        return res.status(400).json({ error: 'Unhandled event type' });
    }

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSuccessfulPayment(orderRef, orderData, paymentData) {
  const updates = {
    status: 'paid',
    paymentDetails: paymentData,
    updatedAt: new Date().toISOString()
  };

  await orderRef.update(updates);

  // Send confirmation email
  await sendOrderConfirmation(orderData.customer.email, {
    orderId: orderRef.id,
    amount: paymentData.amount / 100,
    items: orderData.items
  });
}

async function handleFailedPayment(orderRef, orderData, paymentData) {
  const updates = {
    status: 'failed',
    paymentError: paymentData.gateway_response,
    updatedAt: new Date().toISOString()
  };

  await orderRef.update(updates);

  // Send failure notification
  await sendPaymentFailureNotification(orderData.customer.email, {
    orderId: orderRef.id,
    error: paymentData.gateway_response
  });
}

async function sendOrderConfirmation(email, orderDetails) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Order Confirmation #${orderDetails.orderId}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your payment of ₦${orderDetails.amount} has been confirmed.</p>
      <h2>Order Details:</h2>
      <ul>
        ${orderDetails.items.map(item => `
          <li>${item.name} x ${item.quantity} - ₦${item.price * item.quantity}</li>
        `).join('')}
      </ul>
    `
  };

  await transporter.sendMail(mailOptions);
}

async function sendPaymentFailureNotification(email, details) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Payment Failed for Order #${details.orderId}`,
    html: `
      <h1>Payment Failed</h1>
      <p>We were unable to process your payment for order #${details.orderId}.</p>
      <p>Error: ${details.error}</p>
      <p>Please try again or contact support if you need assistance.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}