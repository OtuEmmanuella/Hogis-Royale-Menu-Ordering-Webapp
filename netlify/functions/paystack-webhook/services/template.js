export const createOrderHTML = ({ orderId, amount, items, deliveryOption, deliveryPrice }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Order Confirmation #${orderId}</h2>
    <p>Thank you for your order! Your payment of ₦${amount.toFixed(2)} has been received.</p>
    
    <h3>Order Details:</h3>
    <ul>
      ${items.map(item => `
        <li>${item.name} x ${item.quantity} - ₦${(item.price * item.quantity).toFixed(2)}</li>
      `).join('')}
    </ul>
    
    <p>Delivery Option: ${deliveryOption}</p>
    ${deliveryPrice ? `<p>Delivery Fee: ₦${deliveryPrice.toFixed(2)}</p>` : ''}
    
    <p>Total Amount: ₦${amount.toFixed(2)}</p>
    
    <p>If you have any questions about your order, please contact us.</p>
  </div>
`;

export const createFailureHTML = (details, branch) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Payment Failed for Order #${details.orderId}</h2>
    <p>We're sorry, but your payment was not successful.</p>
    
    <p>Error: ${details.error}</p>
    
    <p>You can try placing your order again or contact us for assistance:</p>
    <ul>
      <li>Email: ${branch.email}</li>
      <li>Phone: ${branch.phone}</li>
    </ul>
  </div>
`;