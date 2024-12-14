

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
      <p>Phone:${orderDetails?.customer?.customerName || 'Unknown Customer'};</p>
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
  <title>Hogis Order Confirmation</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Roboto', Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 20px 0; text-align: center; background-color: #DA291C;">
        <img src="https://drive.google.com/thumbnail?id=1hVz4ADITDRxa5ZVI9ZYY2SgWyWFY-SjT&sz=w200" alt="Hogis Logo" style="max-width: 150px; height: auto;">
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <h1 style="color: #DA291C; text-align: center; font-size: 28px; margin-bottom: 20px;">
          ${isVendor ? 'New Order Received' : 'Thank You for Your Order!'}
        </h1>
        <p style="font-size: 18px; text-align: center; margin-bottom: 30px;">
          Order #${orderDetails.orderId} - Total: <strong>₦${orderDetails.amount.toLocaleString()}</strong>
        </p>
        ${isVendor ? `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
          <tr>
            <td style="padding: 15px; background-color: #FFC72C; border-radius: 5px;">
              <h2 style="color: #DA291C; margin: 0 0 10px 0; font-size: 20px;">Customer Information</h2>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${orderDetails?.customer?.customerName || 'Unknown Customer'}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${orderDetails.customer.email}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${orderDetails.customer.phone}</p>
            </td>
          </tr>
        </table>
        ` : ''}
        <h2 style="color: #DA291C; font-size: 22px; margin-bottom: 15px;">Order Details</h2>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
          <tr style="background-color: #FFC72C; color: #DA291C;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #DA291C;">Item</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #DA291C;">Quantity</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #DA291C;">Price</th>
          </tr>
          ${orderDetails.items.map(item => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
            <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e0e0e0;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">₦${(item.price * item.quantity).toLocaleString()}</td>
          </tr>
          `).join('')}
          <tr style="background-color: #f9f9f9;">
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">₦${orderDetails.amount.toLocaleString()}</td>
          </tr>
        </table>
        <p style="text-align: center; font-size: 16px; color: #666666; margin-top: 30px;">
          Thank you for choosing Hogis. We hope you enjoy your meal!
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; background-color: #DA291C; color: #ffffff; text-align: center;">
        <p style="margin: 0 0 10px 0;">Connect with us</p>
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://drive.google.com/thumbnail?id=1rBwnwcrBK6sJEiTDdmvy8_PlljpsKI7a&sz=w50" alt="Facebook" style="width: 24px; height: 24px;"></a>
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://drive.google.com/thumbnail?id=1rBwnwcrBK6sJEiTDdmvy8_PlljpsKI7a&sz=w50" alt="Twitter" style="width: 24px; height: 24px;"></a>
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://drive.google.com/thumbnail?id=1rBwnwcrBK6sJEiTDdmvy8_PlljpsKI7a&sz=w50" alt="Instagram" style="width: 24px; height: 24px;"></a>
        <p style="margin: 10px 0 0 0; font-size: 12px;">© 2023 Hogis. All rights reserved.</p>
      </td>
    </tr>
  </table>
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