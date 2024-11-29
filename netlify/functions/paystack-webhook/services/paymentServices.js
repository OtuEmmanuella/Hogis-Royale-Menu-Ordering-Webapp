// import { getDb } from './firebaseServices';
// import { FieldValue } from 'firebase-admin/firestore';
// import { sendOrderConfirmation, sendPaymentFailureNotification } from './emailService.js';

// export async function handleSuccessfulPayment(orderRef, orderData, paymentData) {
//   const db = getDb();
  
//   try {
//     // Update order status
//     const updates = {
//       status: 'paid',
//       paymentDetails: paymentData,
//       paymentReference: paymentData.reference,
//       updatedAt: FieldValue.serverTimestamp(),
//       paymentDate: FieldValue.serverTimestamp()
//     };

//     await orderRef.update(updates);

//     // Create payment record
//     const paymentRef = db.collection('payments').doc(orderRef.id);
//     await paymentRef.set({
//       orderId: orderRef.id,
//       status: 'success',
//       amount: paymentData.amount / 100,
//       currency: paymentData.currency,
//       paymentReference: paymentData.reference,
//       paymentGateway: 'paystack',
//       customerEmail: paymentData.customer.email,
//       branchId: orderData.branchId,
//       metadata: paymentData,
//       createdAt: FieldValue.serverTimestamp()
//     });

//     // Send confirmation email
//     await sendOrderConfirmation(orderData.customer.email, {
//       orderId: orderRef.id,
//       branchId: orderData.branchId,
//       amount: paymentData.amount / 100,
//       items: orderData.items,
//       deliveryOption: orderData.deliveryOption,
//       deliveryPrice: orderData.deliveryPrice
//     });
//   } catch (error) {
//     console.error('Error handling successful payment:', error);
//     throw error;
//   }
// }

// export async function handleFailedPayment(orderRef, orderData, paymentData) {
//   const db = getDb();
  
//   try {
//     // Update order status
//     const updates = {
//       status: 'failed',
//       paymentError: paymentData.gateway_response,
//       updatedAt: FieldValue.serverTimestamp(),
//       paymentReference: paymentData.reference
//     };

//     await orderRef.update(updates);

//     // Create payment record
//     const paymentRef = db.collection('payments').doc(orderRef.id);
//     await paymentRef.set({
//       orderId: orderRef.id,
//       status: 'failed',
//       amount: paymentData.amount / 100,
//       currency: paymentData.currency,
//       paymentReference: paymentData.reference,
//       paymentGateway: 'paystack',
//       customerEmail: paymentData.customer.email,
//       branchId: orderData.branchId,
//       errorMessage: paymentData.gateway_response,
//       metadata: paymentData,
//       createdAt: FieldValue.serverTimestamp()
//     });

//     // Send failure notification
//     await sendPaymentFailureNotification(orderData.customer.email, {
//       orderId: orderRef.id,
//       branchId: orderData.branchId,
//       error: paymentData.gateway_response
//     });
//   } catch (error) {
//     console.error('Error handling failed payment:', error);
//     throw error;
//   }
// }

import { getDb } from './firebaseServices.js';
import { emailService } from './emailService.js';
import { FieldValue } from 'firebase-admin/firestore';

export async function handleSuccessfulPayment(orderRef, orderData, paymentData) {
  const db = getDb();
  
  try {
    // 1. Update order status
    await orderRef.update({
      status: 'paid',
      paymentDetails: paymentData,
      paymentReference: paymentData.reference,
      updatedAt: FieldValue.serverTimestamp(),
      paymentDate: FieldValue.serverTimestamp()
    });

    // 2. Create payment record
    await db.collection('payments').doc(orderRef.id).set({
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

    // 3. Send confirmation email with retry logic
    const emailOptions = {
      from: `${orderData.branchName} <${process.env[`BRANCH${orderData.branchId}_EMAIL`]}>`,
      to: orderData.customer.email,
      cc: process.env[`BRANCH${orderData.branchId}_EMAIL`],
      subject: `Order Confirmation #${orderRef.id}`,
      html: createOrderHTML({
        orderId: orderRef.id,
        amount: paymentData.amount / 100,
        items: orderData.items,
        deliveryOption: orderData.deliveryOption,
        deliveryPrice: orderData.deliveryPrice
      })
    };

    let retries = 3;
    while (retries > 0) {
      try {
        await emailService.sendEmail(orderData.branchId, emailOptions);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }

  } catch (error) {
    console.error('Error in handleSuccessfulPayment:', error);
    // Still mark the order as paid but log the email failure
    await orderRef.update({
      emailError: error.message,
      emailSendAttempts: FieldValue.increment(1)
    });
    throw error;
  }
}