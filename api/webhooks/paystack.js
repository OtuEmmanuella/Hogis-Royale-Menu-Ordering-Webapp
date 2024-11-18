import { updateOrderStatus } from '../../services/orders';
import crypto from 'crypto';

const validatePaystackSignature = (req) => {
  const secret = process.env.VITE_PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  return hash === req.headers['x-paystack-signature'];
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate Paystack signature before processing
    if (!validatePaystackSignature(req)) {
      console.error('Invalid Paystack signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success': {
        const { reference, metadata } = event.data;
        const { orderId, branchId } = metadata;

        if (!orderId || !branchId) {
          throw new Error('Missing required metadata');
        }

        // Update order status in database
        await updateOrderStatus(orderId, branchId, 'paid', reference);
        break;
      }

      case 'charge.failed': {
        const { reference, metadata } = event.data;
        const { orderId, branchId } = metadata;

        if (orderId && branchId) {
          await updateOrderStatus(orderId, branchId, 'failed', reference);
        }
        break;
      }

      case 'transfer.success':
      case 'transfer.failed':
        // Log transfer events but don't process them
        console.log(`Transfer event: ${event.event}`, event.data);
        break;

      default:
        console.log('Unhandled event:', event.event);
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Return 500 for processing errors
    return res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
}