import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from './firebaseServices.js';

dotenv.config();

// Branch Configuration
export const branchConfig = {
  '1': {
    name: 'Hogis Royale And Apartment',
    email: process.env.BRANCH1_EMAIL,
    password: process.env.BRANCH1_APP_PASSWORD,
    phone: '+2348100072049',
    address: '6 Bishop Moynagh Avenue, State Housing Calabar',
  },
  '2': {
    name: 'Hogis Luxury Suites',
    email: process.env.BRANCH2_EMAIL,
    password: process.env.BRANCH2_APP_PASSWORD,
    phone: '+2348100072049',
    address: 'Hogis Luxury Suites Location',
  },
  '3': {
    name: 'Hogis Exclusive Resorts',
    email: process.env.BRANCH3_EMAIL,
    password: process.env.BRANCH3_APP_PASSWORD,
    phone: '+2348100072049',
    address: 'Hogis Exclusive Resorts Location',
  },
};

// Email Service Class
class EmailService {
  constructor() {
    this.transporters = new Map();
  }

  // Initialize and get transporter for a branch
  getTransporter(branchId) {
    if (!this.transporters.has(branchId)) {
      const branch = branchConfig[branchId];
      if (!branch.email || !branch.password) {
        throw new Error(`Missing email configuration for branch ${branchId}`);
      }

      const transporter = createTransport({
        service: 'Gmail',
        auth: {
          user: branch.email,
          pass: branch.password,
        },
      });

      this.transporters.set(branchId, transporter);
    }
    return this.transporters.get(branchId);
  }

  // Verify email transporter
  async verifyTransporter(branchId) {
    const transporter = this.getTransporter(branchId);
    try {
      await transporter.verify();
      console.log(`Email transporter verified for branch ${branchId}`);
    } catch (error) {
      console.error(`Transporter verification failed for branch ${branchId}:`, error);
      throw error;
    }
  }

  // Create HTML for order confirmation
  createOrderHTML(orderDetails) {
    return `
      <div>
        <h1>Thank you for your order!</h1>
        <p>Customer Name: ${orderDetails.customer.name}</p>
        <p>Order ID: ${orderDetails.reference}</p>
        <p>Amount: ₦${orderDetails.amount.toLocaleString()}</p>
      </div>
    `;
  }

  // Prevent duplicate emails for an order
  async isEmailSent(orderId) {
    const db = getDb();
    const emailRecord = await db.collection('emails').doc(orderId).get();
    return emailRecord.exists;
  }

  // Record email status
  async recordEmailSent(orderId) {
    const db = getDb();
    await db.collection('emails').doc(orderId).set({
      sentAt: FieldValue.serverTimestamp(),
    });
  }

  // Send confirmation email
  async sendOrderConfirmation(orderRef, orderData, paymentData) {
    const db = getDb();

    try {
      const orderId = orderRef.id;

      // Prevent duplicate emails
      if (await this.isEmailSent(orderId)) {
        console.log(`Email already sent for order ${orderId}. Skipping.`);
        return;
      }

      // Update order status in DB
      await orderRef.update({
        status: 'paid',
        paymentDetails: paymentData,
        paymentReference: paymentData.reference,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Record payment in DB
      await db.collection('payments').doc(orderId).set({
        orderId,
        amount: paymentData.amount / 100,
        currency: paymentData.currency,
        paymentReference: paymentData.reference,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Send email
      const emailOptions = {
        from: `${orderData.branchName} <${branchConfig[orderData.branchId].email}>`,
        to: orderData.customer.email,
        subject: `Order Confirmation #${orderId}`,
        html: this.createOrderHTML(orderData),
      };

      await this.sendEmail(orderData.branchId, emailOptions);

      // Mark email as sent
      await this.recordEmailSent(orderId);
    } catch (error) {
      console.error('Error in sendOrderConfirmation:', error);
      await orderRef.update({
        emailError: error.message,
        emailSendAttempts: FieldValue.increment(1),
      });
      throw error;
    }
  }

  // Send email
  async sendEmail(branchId, options) {
    await this.verifyTransporter(branchId);
    const transporter = this.getTransporter(branchId);

    try {
      const result = await transporter.sendMail(options);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
