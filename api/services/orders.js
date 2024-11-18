import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const createOrder = async (orderData) => {
  try {
    const { branchId, items, customer, amount, deliveryOption } = orderData;
    
    const orderRef = collection(db, 'branches', branchId, 'orders');
    const order = await addDoc(orderRef, {
      items,
      customer,
      amount,
      deliveryOption,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return order.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, branchId, status, paymentReference) => {
  try {
    const orderRef = doc(db, 'branches', branchId, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      paymentReference,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};