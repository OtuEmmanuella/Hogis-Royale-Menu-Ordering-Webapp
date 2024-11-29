// paystack-webhook.js
import { createHmac } from 'crypto';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase initialization service
export const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
  return admin;
};

export const handleSuccessfulPayment = async (orderRef, orderData, paymentData) => {
  if (!orderRef || !orderRef.id) {
    console.error('Invalid orderRef:', orderRef);
    return;
  }
  
  const updateData = {
    paymentStatus: 'paid',
    paymentDetails: paymentData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    await orderRef.update(updateData);
  } catch (error) {
    console.error('Error updating order:', error);
  }

  // Update inventory if necessary
  if (orderData.items) {
    const db = getFirestore();
    const batch = db.batch();

    for (const item of orderData.items) {
      const menuItemRef = db.collection('menu_items').doc(item.id);
      batch.update(menuItemRef, {
        quantity: admin.firestore.FieldValue.increment(-item.quantity)
      });
    }

    try {
      await batch.commit();
    } catch (error) {
      console.error('Error committing batch:', error);
    }
  }
};


// Main webhook handler
export const handler = async (event, context) => {
  const PAYSTACK_SECRET_KEY = 'sk_test_ba77305f373265f6edc410a39f0432a6c07eecae';

  console.log('Webhook received:', {
    headers: event.headers,
    method: event.httpMethod,
    bodyLength: event.body ? event.body.length : 0
  });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const signature = event.headers['x-paystack-signature'] || 
                     event.headers['X-Paystack-Signature'];

    if (!signature) {
      console.error('Paystack signature header missing');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Signature header missing' }),
      };
    }

    const hash = createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(event.body)
      .digest('hex');

    console.log('Received Paystack Payload:', event.body);
    console.log('Calculated Hash:', hash);
    console.log('Received Signature:', signature);

    console.log('Full comparison:', {
      calculatedHashLength: hash.length,
      receivedSignatureLength: signature.length,
      match: hash === signature
    });

    if (hash !== signature) {
      console.error('Signature mismatch:', { calculated: hash, received: signature });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }

    const body = JSON.parse(event.body);
    if (!body || !body.data) {
      throw new Error('Invalid webhook payload structure');
    }

    await initializeFirebase();
    const db = getFirestore();

    const { event: webhookEvent, data } = body;
    const orderId = data.reference;

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.error('Order not found:', orderId);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    const orderData = orderDoc.data();

    switch (webhookEvent) {
      case 'charge.success':
      case 'payment.success':
        await handleSuccessfulPayment(orderRef, orderData, data);
        break;
      case 'charge.failed':
        await handleFailedPayment(orderRef, orderData, data);
        break;
      default:
        console.warn('Unhandled webhook event:', webhookEvent);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Unhandled event type' })
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Webhook processed successfully',
        event: webhookEvent,
        orderId: orderId
      })
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};