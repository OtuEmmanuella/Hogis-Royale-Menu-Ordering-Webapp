import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../components/Firebase/FirebaseConfig.jsx';

export const fetchUserOrders = async (userId) => {
  const ordersQuery = query(collection(db, 'orders'), where('customer.userId', '==', userId));
  const querySnapshot = await getDocs(ordersQuery);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const listenToOrderStatus = (orderId, onStatusChange) => {
  const orderRef = doc(db, 'orders', orderId);
  return onSnapshot(orderRef, (doc) => {
    if (doc.exists()) {
      const orderData = doc.data();
      onStatusChange(orderData.status);
    }
  });
};