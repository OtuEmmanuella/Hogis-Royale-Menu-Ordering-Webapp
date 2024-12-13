

// import { createTransport } from 'nodemailer';
// import dotenv from 'dotenv';
// import { FieldValue } from 'firebase-admin/firestore';
// import { getDb } from './firebaseServices.js';

// dotenv.config();

// export const branchConfig = {
//   '1': {
//     name: 'Hogis Royale And Apartment',
//     email: process.env.BRANCH1_EMAIL,
//     password: process.env.BRANCH1_APP_PASSWORD,
//     phone: '+2348100072049',
//     address: '6 Bishop Moynagh Avenue, State Housing Calabar',
//   },
//   '2': {
//     name: 'Hogis Luxury Suites',
//     email: process.env.BRANCH2_EMAIL,
//     password: process.env.BRANCH2_APP_PASSWORD,
//     phone: '+2348100072049',
//     address: 'Hogis Luxury Suites Location',
//   },
//   '3': {
//     name: 'Hogis Exclusive Resorts',
//     email: process.env.BRANCH3_EMAIL,
//     password: process.env.BRANCH3_APP_PASSWORD,
//     phone: '+2348100072049',
//     address: 'Hogis Exclusive Resorts Location',
//   },
// };

// class EmailService {
//   constructor() {
//     this.transporters = new Map();
//   }

//   getTransporter(branchId) {
//     if (!this.transporters.has(branchId)) {
//       const email = branchConfig[branchId].email;
//       const password = branchConfig[branchId].password;

//       if (!email || !password) {
//         throw new Error(`Missing email configuration for branch ${branchId}`);
//       }

//       const transporter = createTransport({
//         service: 'Gmail',
//         auth: { user: email, pass: password },
//         debug: true,
//         logger: true,
//       });

//       this.transporters.set(branchId, transporter);
//     }

//     return this.transporters.get(branchId);
//   }

//   async verifyTransporter(branchId) {
//     const transporter = this.getTransporter(branchId);
//     try {
//       await transporter.verify();
//       console.log(`Email transporter verified for branch ${branchId}`);
//       return true;
//     } catch (error) {
//       console.error(`Email transporter verification failed for branch ${branchId}:`, error);
//       throw error;
//     }
//   }


//   createOrderHTML(orderDetails, isVendor = false) {
//     const vendorSpecificInfo = isVendor ? `
//       <h2>Customer Information:</h2>
//       <p>Email: ${orderDetails.customer.email}</p>
//       <p>Phone: ${orderDetails.customer.phone}</p>
//     ` : '';

//     return `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
//         <h1 style="color: #333; text-align: center;">${isVendor ? 'New Order Received' : 'Thank you for your order!'}</h1>
//         <p style="font-size: 16px;">Order #${orderDetails.orderId} - Total: ₦${orderDetails.amount.toLocaleString()}</p>
//         ${vendorSpecificInfo}
//         <h2>Order Details:</h2>
//         <ul>${orderDetails.items.map(item => `<li>${item.name} (x${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString()}</li>`).join('')}</ul>
//         <p><strong>Total:</strong> ₦${orderDetails.amount.toLocaleString()}</p>
//       </div>
//     `;
//   }

//   async sendOrderConfirmation(orderRef, orderData, paymentData) {
//     const db = getDb();

//     try {
//       const orderSnapshot = await orderRef.get();
//       if (!orderSnapshot.exists) throw new Error('Order not found.');

//       const order = orderSnapshot.data();

//       // Prevent duplicate emails
//       if (order.emailSent) {
//         console.log(`Email already sent for order: ${orderRef.id}`);
//         return;
//       }

//       // 1. Update order status
//       await orderRef.update({
//         status: 'paid',
//         paymentDetails: paymentData,
//         paymentReference: paymentData.reference,
//         updatedAt: FieldValue.serverTimestamp(),
//         paymentDate: FieldValue.serverTimestamp(),
//       });

//       // 2. Send confirmation email to customer
//       const customerEmailOptions = {
//         from: `${orderData.branchName} <${process.env[`BRANCH${orderData.branchId}_EMAIL`]}>`,
//         to: orderData.customer.email,
//         subject: `Order Confirmation #${orderRef.id}`,
//         html: this.createOrderHTML({
//           orderId: orderRef.id,
//           amount: paymentData.amount / 100,
//           items: orderData.items,
//           // customer: orderData.customer,
//         }),
//       };

//       await this.sendEmail(orderData.branchId, customerEmailOptions);

//       // 3. Send notification email to vendor
//       const vendorEmailOptions = {
//         from: `${orderData.branchName} <${process.env[`BRANCH${orderData.branchId}_EMAIL`]}>`,
//         to: branchConfig[orderData.branchId].email,
//         subject: `New Order Received #${orderRef.id}`,
//         html: this.createOrderHTML({
//           orderId: orderRef.id,
//           amount: paymentData.amount / 100,
//           items: orderData.items,
//           // customer: orderData.customer.customerName,
//         }, true),
//       };

//       await this.sendEmail(orderData.branchId, vendorEmailOptions);

//       // 4. Mark email as sent
//       await orderRef.update({
//         emailSent: true,
//         emailSendAttempts: FieldValue.increment(1),
//       });

//       console.log(`Confirmation emails sent for order: ${orderRef.id}`);
//     } catch (error) {
//       console.error('Error in sendOrderConfirmation:', error);

//       // Update email error status
//       await orderRef.update({
//         emailError: error.message,
//         emailSendAttempts: FieldValue.increment(1),
//       });

//       throw error;
//     }
//   }

//   async sendEmail(branchId, options) {
//     await this.verifyTransporter(branchId);
//     const transporter = this.getTransporter(branchId);

//     try {
//       const result = await transporter.sendMail(options);
//       console.log('Email sent successfully:', result.messageId);
//       return result;
//     } catch (error) {
//       console.error('Failed to send email:', error);
//       throw error;
//     }
//   }
// }

// export const emailService = new EmailService();



import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from './firebaseServices.js';

dotenv.config();

const branchConfig = {
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

class EmailService {
  constructor() {
    this.transporters = new Map();
  }

  getTransporter(branchId) {
    if (!this.transporters.has(branchId)) {
      const email = branchConfig[branchId].email;
      const password = branchConfig[branchId].password;

      if (!email || !password) {
        throw new Error(`Missing email configuration for branch ${branchId}`);
      }

      const transporter = createTransport({
        service: 'Gmail',
        auth: { user: email, pass: password },
        debug: true,
        logger: true,
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

  createOrderHTML(orderDetails, isVendor = false) {
    const vendorSpecificInfo = isVendor ? `
      <h2>Customer Information:</h2>
      <p>Email: ${orderDetails.customer.email}</p>
      <p>Phone: ${orderDetails.customer.phone}</p>
    ` : '';
  
    const content = `
      <h1 style="color: #333; text-align: center;">${isVendor ? 'New Order Received' : 'Thank you for your order!'}</h1>
      <p style="font-size: 16px;">Order #${orderDetails.orderId} - Total: ₦${orderDetails.amount.toLocaleString()}</p>
      ${vendorSpecificInfo}
      <h2>Order Details:</h2>
      <ul>${orderDetails.items.map(item => `<li>${item.name} (x${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString()}</li>`).join('')}</ul>
      <p><strong>Total:</strong> ₦${orderDetails.amount.toLocaleString()}</p>
    `;
  
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hogis Feedback</title>
        <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .logo { text-align: left; margin-bottom: 20px; }
        .logo img { max-width: 150px; width: 100%; height: auto; display: inline-block; }
        .banner { width: 100%; max-width: 600px; height: auto; margin-bottom: 20px; display: block; }
        h2 { color: #2c3e50; margin-top: 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        img { -ms-interpolation-mode: bicubic; }
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .content { padding: 10px !important; }
          .logo img { max-width: 80px !important; }
        }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://drive.google.com/thumbnail?id=1hVz4ADITDRxa5ZVI9ZYY2SgWyWFY-SjT&sz=w600" alt="Hogis Logo" style="max-width: 150px; width: 100%; height: auto;">
          </div>
          <img src="https://drive.google.com/thumbnail?id=1rBwnwcrBK6sJEiTDdmvy8_PlljpsKI7a&sz=w600" alt="Hogis Banner" class="banner" style="display: block; max-width: 600px; width: 100%;">
          <div class="content">
            ${content}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendOrderConfirmation(orderRef, orderData, paymentData) {
    const db = getDb();

    try {
      const orderSnapshot = await orderRef.get();
      if (!orderSnapshot.exists) throw new Error('Order not found.');

      const order = orderSnapshot.data();

      // Prevent duplicate emails
      if (order.emailSent) {
        console.log(`Email already sent for order: ${orderRef.id}`);
        return;
      }

      // 1. Update order status
      await orderRef.update({
        status: 'paid',
        paymentDetails: paymentData,
        paymentReference: paymentData.reference,
        updatedAt: FieldValue.serverTimestamp(),
        paymentDate: FieldValue.serverTimestamp(),
      });

      // 2. Send confirmation email to customer
      const customerEmailOptions = {
        from: `${orderData.branchName} <${process.env[`BRANCH${orderData.branchId}_EMAIL`]}>`,
        to: orderData.customer.email,
        subject: `Order Confirmation #${orderRef.id}`,
        html: this.createOrderHTML({
          orderId: orderRef.id,
          amount: paymentData.amount / 100,
          items: orderData.items,
          customer: {
            email: orderData.customer.email,
            phone: orderData.customer.phone
          },
        }),
      };

      await this.sendEmail(orderData.branchId, customerEmailOptions);

      // 3. Send notification email to vendor
      const vendorEmailOptions = {
        from: `${orderData.branchName} <${process.env[`BRANCH${orderData.branchId}_EMAIL`]}>`,
        to: branchConfig[orderData.branchId].email,
        subject: `New Order Received #${orderRef.id}`,
        html: this.createOrderHTML({
          orderId: orderRef.id,
          amount: paymentData.amount / 100,
          items: orderData.items,
          customer: {
            email: orderData.customer.email,
            phone: orderData.customer.phone
          },
        }, true),
      };

      await this.sendEmail(orderData.branchId, vendorEmailOptions);

      // 4. Mark email as sent and clear cache
      await orderRef.update({
        emailSent: true,
        emailSendAttempts: FieldValue.increment(1),
      });

      // Clear cache if using any caching mechanism
      // Example for a simple in-memory cache:
      if (this.transporters.has(orderData.branchId)) {
        this.transporters.delete(orderData.branchId);
        console.log(`Cache cleared for branch ${orderData.branchId}`);
      }

      console.log(`Confirmation emails sent for order: ${orderRef.id}`);
    } catch (error) {
      console.error('Error in sendOrderConfirmation:', error);

      // Update email error status
      await orderRef.update({
        emailError: error.message,
        emailSendAttempts: FieldValue.increment(1),
      });

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
}

export const emailService = new EmailService();