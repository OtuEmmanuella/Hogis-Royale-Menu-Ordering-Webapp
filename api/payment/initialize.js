import { initializePayment } from '../../services/payment';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, email, orderId, branchId } = req.body;
    const paymentData = await initializePayment(amount, email, orderId, branchId);
    res.json(paymentData);
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
}