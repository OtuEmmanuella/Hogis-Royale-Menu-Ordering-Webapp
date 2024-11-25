import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createHmac } from 'crypto';
import { serviceAccount } from '../../src/config/serviceAccount.js';
import { sendOrderConfirmation, sendPaymentFailureNotification } from '../services/emailService.js';

if (!global.firebaseApp) {
  global.firebaseApp = initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const hash = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;
    const orderId = data.reference;
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();
    await processPaymentEvent(event, orderRef, orderData, data);

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function processPaymentEvent(event, orderRef, orderData, paymentData) {
  const updates = {
    updatedAt: new Date().toISOString(),
    paymentDetails: paymentData
  };

  switch (event) {
    case 'charge.success':
      updates.status = 'paid';
      await orderRef.update(updates);
      await sendOrderConfirmation(orderData.customer.email, {
        orderId: orderRef.id,
        branchId: orderData.branchId,
        amount: paymentData.amount / 100,
        items: orderData.items,
        deliveryOption: orderData.deliveryOption,
        deliveryPrice: orderData.deliveryPrice
      });
      break;

    case 'charge.failed':
      updates.status = 'failed';
      updates.paymentError = paymentData.gateway_response;
      await orderRef.update(updates);
      await sendPaymentFailureNotification(orderData.customer.email, {
        orderId: orderRef.id,
        branchId: orderData.branchId,
        error: paymentData.gateway_response
      });
      break;

    default:
      throw new Error('Unhandled event type');
  }
}