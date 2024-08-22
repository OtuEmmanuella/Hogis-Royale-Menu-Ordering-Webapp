import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data().isAdmin) {
          setIsAdmin(true);
        } else {
          navigate('/menu');
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!user || !isAdmin) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <ToastContainer />
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <nav className='dashboard-nav'>
          <Link className='admin-link' to="/admin/manage-menu">Manage Menu</Link>
          <Link className='admin-link' to="/admin/manage-notifications">Manage Notifications</Link>
          {/* <Link to="/orders">Orders</Link>
          <Link to="/users">Users</Link>
          <Link to="/sales-reports">Sales Reports</Link>
          <Link to="/customer-inquiries">Customer Inquiries</Link> */}
        </nav>
      </header>
      <main className="dashboard-main">
      </main>
    </div>
  );
};

export default AdminDashboard;