import { getDoc, doc } from 'firebase/firestore';
import { db } from '../components/Firebase/FirebaseConfig.jsx';

export const checkUserRole = async (uid) => {
  const adminDoc = await getDoc(doc(db, 'admins', uid));
  if (adminDoc.exists() && adminDoc.data().isAdmin) {
    return 'admin';
  }
  const cashierDoc = await getDoc(doc(db, 'cashiers', uid));
  if (cashierDoc.exists() && cashierDoc.data().isCashier) {
    return 'cashier';
  }
  return 'customer';
};

