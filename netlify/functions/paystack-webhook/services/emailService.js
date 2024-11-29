import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from './firebaseServices.js';

dotenv.config();

class EmailService {
  constructor() {
    this.transporters = new Map();
  }

  getTransporter(branchId) {
    if (!this.transporters.has(branchId)) {
      const email = process.env[`BRANCH${branchId}_EMAIL`];
      const password = process.env[`BRANCH${branchId}_APP_PASSWORD`];

      if (!email || !password) {
        throw new Error(`Missing email configuration for branch ${branchId}`);
      }

      const transporter = createTransport({
        service: 'Gmail',
        auth: { user: email, pass: password },
        debug: true,
        logger: true
      });

      this.transporters.set(branchId, transporter);
    }

    return this.transporters.get(branchId);
  }

  async verifyTransporter(branchId) {
    const transporter = this.getTransporter(branchId);
    try {
      await transporter.verify();
      console.log(`Email transporter verified for branch ${branchId}`);
      return true;
    } catch (error) {
      console.error(`Email transporter verification failed for branch ${branchId}:`, error);
      throw error;
    }
  }

  createOrderHTML(orderDetails) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Thank you for your order!</h1>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 16px; margin: 0;">Your payment of ₦${orderDetails.amount.toLocaleString()} has been confirmed.</p>
        </div>
        
        <h2 style="color: #444; margin-top: 30px;">Order Details:</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Item</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Quantity</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Price</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.items.map(item => `
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">₦${item.price.toLocaleString()}</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">₦${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Delivery Location:</strong> ${orderDetails.deliveryOption}</p>
          <p style="margin: 5px 0;"><strong>Delivery Fee:</strong> ₦${orderDetails.deliveryPrice.toLocaleString()}</p>
          <p style="margin: 5px 0; font-size: 18px;"><strong>Total Amount:</strong> ₦${orderDetails.amount.toLocaleString()}</p>
        </div>
      </div>
    `;
  }

  createFailureHTML(details, branch) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h1 style="color: #dc3545; text-align: center;">Payment Failed</h1>
        <div style="background-color: #fff3f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">We were unable to process your payment for order #${details.orderId}.</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Error:</strong> ${details.error}</p>
        </div>
        
        <div style="margin-top: 30px;">
          <h2 style="color: #444;">Need Help?</h2>
          <p>Please contact our support team:</p>
          <p><strong>Email:</strong> ${branch.email}</p>
          <p><strong>Phone:</strong> ${branch.phone}</p>
        </div>
      </div>
    `;
  }

  async sendOrderConfirmation(orderRef, orderData, paymentData) {
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
        html: this.createOrderHTML({
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
          await this.sendEmail(orderData.branchId, emailOptions);
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

    } catch (error) {
      console.error('Error in sendOrderConfirmation:', error);
      await orderRef.update({
        emailError: error.message,
        emailSendAttempts: FieldValue.increment(1)
      });
      throw error;
    }
  }

  async sendPaymentFailureNotification(email, details) {
    try {
      const branch = {
        email: process.env[`BRANCH${details.branchId}_EMAIL`],
        phone: process.env[`BRANCH${details.branchId}_PHONE`] || '+2348100072049'
      };

      const emailOptions = {
        from: `${details.branchName} <${branch.email}>`,
        to: email,
        cc: branch.email,
        subject: `Payment Failed for Order #${details.orderId}`,
        html: this.createFailureHTML(details, branch)
      };

      return await this.sendEmail(details.branchId, emailOptions);
    } catch (error) {
      console.error('Failed to send payment failure notification:', error);
      throw error;
    }
  }

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

  async testEmailService(branchId = '1') {
    try {
      const testOrderDetails = {
        branchId,
        orderId: `TEST-${Date.now()}`,
        amount: 1000,
        items: [{
          name: 'Test Item',
          quantity: 1,
          price: 1000
        }],
        deliveryOption: 'Test Location',
        deliveryPrice: 0
      };
      
      await this.verifyTransporter(branchId);
      
      return {
        status: 'success',
        message: 'Email service is configured correctly'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}

export const emailService = new EmailService();