import { getDb } from '../firebaseServices.js';
import { FieldValue } from 'firebase-admin/firestore';

export class FirestoreService {
  constructor() {
    this.db = getDb();
  }

  async updateOrderStatus(transaction, orderRef, paymentData) {
    transaction.update(orderRef, {
      status: 'paid',
      paymentDetails: paymentData,
      paymentReference: paymentData.reference,
      updatedAt: FieldValue.serverTimestamp(),
      paymentDate: FieldValue.serverTimestamp()
    });
  }

  async createPaymentRecord(transaction, orderRef, paymentData, branchId) {
    const paymentRef = this.db.collection('payments').doc(orderRef.id);
    transaction.set(paymentRef, {
      orderId: orderRef.id,
      status: 'success',
      amount: paymentData.amount / 100,
      currency: paymentData.currency,
      paymentReference: paymentData.reference,
      paymentGateway: 'paystack',
      customerEmail: paymentData.customer.email,
      branchId: branchId,
      metadata: paymentData,
      createdAt: FieldValue.serverTimestamp()
    });
  }

  async updateEmailLog(transaction, emailLogRef, data) {
    transaction.set(emailLogRef, data, { merge: true });
  }

  async runOrderTransaction(orderRef, paymentData, branchId) {
    const emailLogRef = this.db.collection('emailLogs').doc(orderRef.id);

    try {
      await this.db.runTransaction(async (transaction) => {
        // Verify the order document exists
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists) {
          throw new Error(`Order document ${orderRef.id} not found`);
        }

        await this.updateOrderStatus(transaction, orderRef, paymentData);
        await this.createPaymentRecord(transaction, orderRef, paymentData, branchId);
        await this.updateEmailLog(transaction, emailLogRef, {
          orderId: orderRef.id,
          confirmationAttempts: FieldValue.increment(1),
          lastAttempt: FieldValue.serverTimestamp()
        });
      });
      return true;
    } catch (error) {
      console.error('Transaction failed:', error);
      if (error.code === 5) { // NOT_FOUND error
        await this.handleMissingDocument(orderRef.id, error);
      }
      throw error;
    }
  }

  async handleMissingDocument(orderId, error) {
    // Log the error for monitoring
    await this.db.collection('errorLogs').add({
      type: 'DOCUMENT_NOT_FOUND',
      orderId: orderId,
      timestamp: FieldValue.serverTimestamp(),
      error: error.message
    });
  }
}

export const firestoreService = new FirestoreService();