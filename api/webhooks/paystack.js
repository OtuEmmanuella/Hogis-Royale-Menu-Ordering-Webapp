// pages/api/webhooks/paystack.js
import { updateOrderStatus } from '../services/orders';  // Adjust path based on your structure
import crypto from 'crypto';

// Enable body parsing
export const config = {
  api: {
    bodyParser: true
  }
};

const validatePaystackSignature = (req) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY is not configured');
      return false;
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    return hash === req.headers['x-paystack-signature'];
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
};

export default async function handler(req, res) {
  // Log request details
  console.log('Webhook received:', {
    method: req.method,
    path: req.url,
    headers: {
      'x-paystack-signature': req.headers['x-paystack-signature'] ? 'present' : 'missing',
      'content-type': req.headers['content-type']
    }
  });

  // Verify HTTP method
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ 
      status: 'error',
      message: 'Method not allowed' 
    });
  }

  try {
    // Log raw body for debugging
    console.log('Webhook body:', JSON.stringify(req.body));

    // Validate signature
    if (!validatePaystackSignature(req)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid signature' 
      });
    }

    const event = req.body;
    console.log('Processing webhook event:', event.event);

    if (event.event === 'charge.success') {
      const { reference, metadata, status } = event.data;
      
      console.log('Charge success data:', {
        reference,
        metadata,
        status
      });

      // Verify metadata
      if (!metadata?.orderId || !metadata?.branchId) {
        console.error('Missing metadata in webhook:', metadata);
        return res.status(400).json({
          status: 'error',
          message: 'Missing orderId or branchId in metadata'
        });
      }

      // Update order status
      try {
        await updateOrderStatus(
          metadata.orderId,
          metadata.branchId,
          'successful',
          reference
        );
        
        console.log('Order updated successfully:', {
          orderId: metadata.orderId,
          status: 'successful',
          reference
        });

      } catch (updateError) {
        console.error('Error updating order:', updateError);
        // Still return 200 to Paystack but log the error
        return res.status(200).json({
          status: 'received',
          message: 'Webhook received but order update failed'
        });
      }
    }

    // Always acknowledge receipt to Paystack
    return res.status(200).json({
      status: 'success',
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Still return 200 to Paystack even if we have an error
    return res.status(200).json({
      status: 'error',
      message: 'Webhook received but processing failed'
    });
  }
}