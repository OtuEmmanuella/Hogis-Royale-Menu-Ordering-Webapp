import { getDb } from './firebaseServices';
import { FieldValue } from 'firebase-admin/firestore';
import { sendOrderConfirmation, sendPaymentFailureNotification } from './emailService.js';

export async function handleSuccessfulPayment(orderRef, orderData, paymentData) {
  const db = getDb();
  
  try {
    // Update order status
    const updates = {
      status: 'paid',
      paymentDetails: paymentData,
      paymentReference: paymentData.reference,
      updatedAt: FieldValue.serverTimestamp(),
      paymentDate: FieldValue.serverTimestamp()
    };

    await orderRef.update(updates);

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
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

export async function handleFailedPayment(orderRef, orderData, paymentData) {
  const db = getDb();
  
  try {
    // Update order status
    const updates = {
      status: 'failed',
      paymentError: paymentData.gateway_response,
      updatedAt: FieldValue.serverTimestamp(),
      paymentReference: paymentData.reference
    };

    await orderRef.update(updates);

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
  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
}