import crypto from 'crypto';

// Your Paystack secret key
const PAYSTACK_SECRET_KEY = 'sk_test_ba77305f373265f6edc410a39f0432a6c07eecae';

// The request payload
const payload = JSON.stringify({
    "event": "payment.success",
    "data": {
      "id": "KVBCelfBSyHBQcGPVTJW",
      "status": "pending",
      "amount": 16500,
      "currency": "NGN",
      "reference": "KVBCelfBSyHBQcGPVTJW",
      "email": "otumanuella131@gmail.com",
      "items": [
        { "id": "cXdBZxBxeh4KO53Dpbxs", "name": "BEEF", "price": 3500, "quantity": 1 },
        { "id": "9KishvY5eteINF3BDrhN", "name": "BUSH MEAT", "price": 3000, "quantity": 1 },
        { "id": "fZG2ywfNAftIaXTnO0xi", "name": "CHICKEN", "price": 4000, "quantity": 1 },
        { "id": "wnPhgv0Qwn86NtvtTv00", "name": "GIZZARD", "price": 4000, "quantity": 1 }
      ],
      "paymentMethod": "paystack",
      "totalAmount": 16500,
      "deliveryOption": "Unical",
      "deliveryPrice": 2000,
      "branchId": "1",
      "branchName": "Hogis Royale And Apartment",
      "createdAt": "2024-11-28T00:28:00+01:00",
      "customer": {
        "name": "Emmanuella Otu",
        "email": "otumanuella131@gmail.com",
        "phone": "09067359156",
        "address": "15 Atekong Street, Calabar",
        "city": "Calabar"
      }
    }
  });

const signature = crypto
  .createHmac('sha512', PAYSTACK_SECRET_KEY)
  .update(payload)
  .digest('hex');

console.log('Signature:', signature);
console.log('\nCurl command:');
console.log(`curl -X POST http://localhost:8888/.netlify/functions/paystack-webhook \\
-H "x-paystack-signature: ${signature}" \\
-H "Content-Type: application/json" \\
-d '${payload}'`);
