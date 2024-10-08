import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SplashPage from '../Pages/SplashPage';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';
import ForgotPassword from '../components/Auth/ForgotPassword';
import Menu from '../Pages/Menu';
import AdminDashboard from '../components/Admin/AdminDashboard';
import ManageMenu from '../components/Admin/ManageMenu'
import ManageNotifications from '../components/Admin/ManageNotifications';
import Breadcrumb from '../components/BreadCrumbs/breadCrumbs';
import FeedbackForm from '../components/Feedback/Feedback';
import CheckoutPage from '../components/CheckOut/CheckOut';
import { ShoppingCartPage } from '../components/ShoppingCart/ShoppingCart';
import { ShoppingCartProvider } from '../components/ShoppingCart/ShoppingCartContext';
import UserAccountPage from '../components/Auth/UserAccountPage';
import NotificationPage from '../components/Notification/NotificationPage';

// Import the new pages
import OrdersPage from '../components/Admin/OrdersPage';
import UsersPage from '../components/Admin/UsersPage';
import SalesReportsPage from '../components/Admin/SalesReportsPage';
import CustomerInquiriesPage from '../components/Admin/CustomerInquiriesPage';

const AppRoutes = () => {
  return (
    <ShoppingCartProvider>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-menu" element={<ManageMenu />} />
        <Route path="/admin/manage-notifications" element={<ManageNotifications />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/message" element={<NotificationPage />} />
        <Route path="/cart" element={<ShoppingCartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/account" element={<UserAccountPage />} />

        {/* Add new routes for the admin pages */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/sales-reports" element={<SalesReportsPage />} />
         <Route path="/customer-inquiries" element={<CustomerInquiriesPage />} />

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </ShoppingCartProvider>
  );
};

export default AppRoutes;