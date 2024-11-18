import axios from 'axios';

export const initializePayment = async (amount, email, orderId, branchId, metadata = {}) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: amount * 100, // Convert to kobo
        email,
        metadata: {
          orderId,
          branchId,
          ...metadata
        },
        callback_url: `${process.env.FRONTEND_URL}/payment/verify`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VITE_PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw error;
  }
};