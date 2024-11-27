import { createTransport } from 'nodemailer';
import { branchConfig } from '../config/branchConfig.js';

function createEmailTransporter(email, password) {
  return createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: email, pass: password },
    tls: { rejectUnauthorized: false }
  });
}

function getBranchInfo(branchId) {
  const branch = branchConfig[branchId];
  if (!branch) {
    throw new Error(`Invalid branch ID: ${branchId}`);
  }
  
  if (!branch.email || !branch.password) {
    throw new Error(`Missing email configuration for branch ${branchId}`);
  }
  
  return {
    ...branch,
    transporter: createEmailTransporter(branch.email, branch.password)
  };
}

export async function sendOrderConfirmation(email, orderDetails) {
  const branch = getBranchInfo(orderDetails.branchId);
  
  const mailOptions = {
    from: `${branch.name} <${branch.email}>`,
    to: email,
    cc: branch.email,
    subject: `Order Confirmation #${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Thank you for your order!</h1>
        <p>Your payment of ₦${orderDetails.amount.toLocaleString()} has been confirmed.</p>
        <h2>Order Details:</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₦${item.price.toLocaleString()}</td>
                <td>₦${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p><strong>Delivery Location:</strong> ${orderDetails.deliveryOption}</p>
        <p><strong>Delivery Fee:</strong> ₦${orderDetails.deliveryPrice.toLocaleString()}</p>
        <p><strong>Total Amount:</strong> ₦${orderDetails.amount.toLocaleString()}</p>
      </div>
    `
  };

  return await branch.transporter.sendMail(mailOptions);
}

export async function sendPaymentFailureNotification(email, details) {
  const branch = getBranchInfo(details.branchId);
  
  const mailOptions = {
    from: `${branch.name} <${branch.email}>`,
    to: email,
    cc: branch.email,
    subject: `Payment Failed for Order #${details.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Payment Failed</h1>
        <p>We were unable to process your payment for order #${details.orderId}.</p>
        <p><strong>Error:</strong> ${details.error}</p>
        <p>Please try again or contact our support team:</p>
        <p>Email: ${branch.email}</p>
        <p>Phone: ${branch.phone}</p>
      </div>
    `
  };

  return await branch.transporter.sendMail(mailOptions);
}