export function createOrderHTML(orderDetails) {
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
              <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Specifications</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Quantity</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Price</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.items.map(item => `
              <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${item.specifications}</td>
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
  
  export function createFailureHTML(details, branch) {
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