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
  console.log('Sending order confirmation email:', { email, orderDetails });
  
  try {
    const branch = getBranchInfo(orderDetails.branchId);
    
    // Format items for email
    const itemsList = orderDetails.items
      .map(item => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₦${item.price.toLocaleString()}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₦${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `)
      .join('');

    const mailOptions = {
      from: `${branch.name} <${branch.email}>`,
      to: email,
      cc: branch.email,
      subject: `Order Confirmation #${orderDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #1a73e8;">${branch.name}</h1>
            <p style="color: #666;">${branch.address}</p>
          </div>
          
          <div style="padding: 20px;">
            <h2>Thank you for your order!</h2>
            <p>Your payment of ₦${orderDetails.amount.toLocaleString()} has been confirmed.</p>
            
            <div style="margin: 20px 0;">
              <h3>Order Details:</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 8px; border: 1px solid #ddd;">Item</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
            </div>
            
            <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
              <p><strong>Delivery Location:</strong> ${orderDetails.deliveryOption}</p>
              <p><strong>Delivery Fee:</strong> ₦${orderDetails.deliveryPrice.toLocaleString()}</p>
              <p><strong>Total Amount:</strong> ₦${orderDetails.amount.toLocaleString()}</p>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin-top: 20px;">
            <p>For any questions, please contact us at:</p>
            <p>Email: ${branch.email}</p>
            <p>Phone: ${branch.phone}</p>
          </div>
        </div>
      `
    };

    const result = await branch.transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
}

export async function sendPaymentFailureNotification(email, details) {
  console.log('Sending payment failure notification:', { email, details });
  
  try {
    const branch = getBranchInfo(details.branchId);
    
    const mailOptions = {
      from: `${branch.name} <${branch.email}>`,
      to: email,
      cc: branch.email,
      subject: `Payment Failed for Order #${details.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #dc3545;">${branch.name}</h1>
            <p style="color: #666;">${branch.address}</p>
          </div>
          
          <div style="padding: 20px;">
            <h2>Payment Failed</h2>
            <p>We were unable to process your payment for order #${details.orderId}.</p>
            <p><strong>Error:</strong> ${details.error}</p>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
              <p>Please try again or contact our support team:</p>
              <p>Email: ${branch.email}</p>
              <p>Phone: ${branch.phone}</p>
            </div>
          </div>
        </div>
      `
    };

    const result = await branch.transporter.sendMail(mailOptions);
    console.log('Payment failure notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending payment failure notification:', error);
    throw error;
  }
}

export async function sendInvoiceEmail(email, invoiceUrl, orderData) {
  console.log('Sending invoice email:', { email, invoiceUrl });
  
  try {
    const branch = getBranchInfo(orderData.branchId);
    
    const mailOptions = {
      from: `${branch.name} <${branch.email}>`,
      to: email,
      cc: branch.email,
      subject: `Invoice for Order #${orderData.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #1a73e8;">${branch.name}</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Your Invoice is Ready</h2>
            <p>Thank you for your order. Please find your invoice attached below.</p>
            
            <div style="margin: 20px 0; text-align: center;">
              <a href="${invoiceUrl}" 
                 style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Download Invoice
              </a>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin-top: 20px;">
            <p>For any questions, please contact us at:</p>
            <p>Email: ${branch.email}</p>
            <p>Phone: ${branch.phone}</p>
          </div>
        </div>
      `
    };

    const result = await branch.transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}