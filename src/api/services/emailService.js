import { createTransport } from 'nodemailer';
import { branchConfig } from '../config/branchConfig.js';

function getEmailTransporter(branchId) {
  const branch = branchConfig[branchId];
  if (!branch) {
    throw new Error('Invalid branch ID');
  }

  return createTransport({
    service: 'gmail',
    auth: {
      user: branch.email,
      pass: branch.password
    }
  });
}

export async function sendOrderConfirmation(email, orderDetails) {
  const branchTransporter = getEmailTransporter(orderDetails.branchId);
  const branch = branchConfig[orderDetails.branchId];

  const mailOptions = {
    from: `${branch.name} <${branch.email}>`,
    to: email,
    cc: branch.email, // Send copy to branch email
    subject: `Order Confirmation #${orderDetails.orderId}`,
    html: `
      <h1>Thank you for your order from ${branch.name}!</h1>
      <p>Your payment of ₦${orderDetails.amount} has been confirmed.</p>
      <h2>Order Details:</h2>
      <ul>
        ${orderDetails.items.map(item => `
          <li>${item.name} x ${item.quantity} - ₦${item.price * item.quantity}</li>
        `).join('')}
      </ul>
      <p>Delivery Location: ${orderDetails.deliveryOption}</p>
      <p>Delivery Fee: ₦${orderDetails.deliveryPrice}</p>
      <p>Total Amount: ₦${orderDetails.amount}</p>
    `
  };

  await branchTransporter.sendMail(mailOptions);
}

export async function sendPaymentFailureNotification(email, details) {
  const branchTransporter = getEmailTransporter(details.branchId);
  const branch = branchConfig[details.branchId];

  const mailOptions = {
    from: `${branch.name} <${branch.email}>`,
    to: email,
    cc: branch.email,
    subject: `Payment Failed for Order #${details.orderId}`,
    html: `
      <h1>Payment Failed</h1>
      <p>We were unable to process your payment for order #${details.orderId}.</p>
      <p>Error: ${details.error}</p>
      <p>Please try again or contact our support at ${branch.email}</p>
    `
  };

  await branchTransporter.sendMail(mailOptions);
}