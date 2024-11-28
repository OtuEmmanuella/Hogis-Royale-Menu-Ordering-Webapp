import { createTransport } from 'nodemailer';
import { branchConfig } from '../config/branchConfig.js';

function createEmailTransporter(email, password) {
  console.log('Setting up Gmail transporter for:', email);
  
  const transporter = createTransport({
    service: 'Gmail',
    auth: {
      user: email,
      pass: password // This should be an App Password, not regular Gmail password
    }
  });

  return transporter;
}

async function verifyTransporter(transporter, branchEmail) {
  try {
    await transporter.verify();
    console.log(`Email transporter verified successfully for ${branchEmail}`);
    return true;
  } catch (error) {
    console.error(`Email transporter verification failed for ${branchEmail}:`, error);
    throw new Error(`Email configuration error: ${error.message}`);
  }
}

function getBranchInfo(branchId) {
  console.log(`Getting branch info for ID: ${branchId}`);
  
  const branch = branchConfig[branchId];
  
  if (!branch) {
    throw new Error(`Invalid branch ID: ${branchId}`);
  }
  
  if (!branch.email || !branch.password) {
    console.error('Branch config error:', {
      branchId,
      hasEmail: !!branch.email,
      hasPassword: !!branch.password
    });
    throw new Error(`Missing email configuration for branch ${branchId}`);
  }
  
  return {
    ...branch,
    transporter: createEmailTransporter(branch.email, branch.password)
  };
}

function createOrderHTML(orderDetails) {
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

function createFailureHTML(details, branch) {
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

export async function sendOrderConfirmation(email, orderDetails) {
  console.log('Initiating order confirmation email send:', {
    to: email,
    orderId: orderDetails.orderId
  });

  try {
    const branch = getBranchInfo(orderDetails.branchId);
    await verifyTransporter(branch.transporter, branch.email);
    
    const mailOptions = {
      from: `${branch.name} <${branch.email}>`,
      to: email,
      cc: branch.email,
      subject: `Order Confirmation #${orderDetails.orderId}`,
      html: createOrderHTML(orderDetails)
    };

    const result = await branch.transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', {
      messageId: result.messageId,
      to: email
    });
    
    return result;

  } catch (error) {
    console.error('Failed to send order confirmation email:', {
      error: error.message,
      stack: error.stack,
      email,
      orderId: orderDetails.orderId
    });
    throw new Error(`Failed to send order confirmation: ${error.message}`);
  }
}

export async function sendPaymentFailureNotification(email, details) {
  console.log('Initiating payment failure notification:', {
    to: email,
    orderId: details.orderId
  });

  try {
    const branch = getBranchInfo(details.branchId);
    await verifyTransporter(branch.transporter, branch.email);
    
    const mailOptions = {
      from: `${branch.name} <${branch.email}>`,
      to: email,
      cc: branch.email,
      subject: `Payment Failed for Order #${details.orderId}`,
      html: createFailureHTML(details, branch)
    };

    const result = await branch.transporter.sendMail(mailOptions);
    console.log('Payment failure notification sent successfully:', {
      messageId: result.messageId,
      to: email
    });
    
    return result;

  } catch (error) {
    console.error('Failed to send payment failure notification:', {
      error: error.message,
      stack: error.stack,
      email,
      orderId: details.orderId
    });
    throw new Error(`Failed to send payment failure notification: ${error.message}`);
  }
}

// Test route for verifying email functionality
export async function testEmailService(branchId = '1') {
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
    
    const branch = getBranchInfo(branchId);
    await verifyTransporter(branch.transporter, branch.email);
    
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