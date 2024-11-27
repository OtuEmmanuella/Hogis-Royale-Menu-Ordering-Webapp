const crypto = require('crypto');

class PaymentService {
  verifyPaystackSignature(requestBody, signature, secretKey) {
    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(JSON.stringify(requestBody))
      .digest('hex');
    return hash === signature;
  }

  async handlePaystackWebhook(event, data) {
    const orderId = data.reference;
    
    switch (event) {
      case 'charge.success':
        return await orderService.handleSuccessfulPayment(orderId, data);
      case 'charge.failed':
        return await orderService.handleFailedPayment(orderId, data);
      default:
        throw new Error(`Unhandled event type: ${event}`);
    }
  }
}

module.exports = new PaymentService();