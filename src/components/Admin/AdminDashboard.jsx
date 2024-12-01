import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { collection, query, where, getDocs, getDoc,doc,getAggregateFromServer, AggregateField } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const AdminNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { to: "/admin/manage-menu", text: "Manage Menu" },
    { to: "/admin/manage-notifications", text: "Manage Notifications" },
    { to: "/orders", text: "Orders" },
    { to: "/users", text: "Users" },
    { to: "/sales-reports", text: "Sales Reports" },
    { to: "/customer-inquiries", text: "Customer Inquiries" },
  ];


  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white font-bold">Admin Dashboard</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.text}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [branchRevenue, setBranchRevenue] = useState({});
  const [categoryRevenue, setCategoryRevenue] = useState({});
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState({});
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [customerTraffic, setCustomerTraffic] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data().isAdmin) {
          setIsAdmin(true);
          fetchDashboardData();
        } else {
          navigate('/menu');
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async () => {
    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);
    let total = 0;
    let branchRev = { 'Hogis Royale': 0, 'Hogis Luxury': 0, 'Hogis Exclusive': 0 };
    let catRev = {};
    let paymentMethods = {};
    let itemsSold = {};
    let traffic = {};

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      total += order.totalAmount;
      branchRev[order.branchName] = (branchRev[order.branchName] || 0) + order.totalAmount;
      paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;

      const orderDate = new Date(order.createdAt.seconds * 1000);
      const dayOfWeek = orderDate.toLocaleString('en-US', { weekday: 'long' });
      traffic[dayOfWeek] = (traffic[dayOfWeek] || 0) + 1;

      order.items.forEach((item) => {
        catRev[item.category] = (catRev[item.category] || 0) + (item.price * item.quantity);
        itemsSold[item.name] = (itemsSold[item.name] || 0) + item.quantity;
      });
    });

    setTotalRevenue(total);
    setBranchRevenue(branchRev);
    setCategoryRevenue(catRev);
    setPaymentMethodBreakdown(paymentMethods);
    setTopSellingItems(Object.entries(itemsSold).sort((a, b) => b[1] - a[1]).slice(0, 5));
    setCustomerTraffic(traffic);
  };

  if (!user || !isAdmin) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const barChartData = {
    labels: Object.keys(branchRevenue),
    datasets: [
      {
        label: 'Revenue by Branch',
        data: Object.values(branchRevenue),
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(paymentMethodBreakdown),
    datasets: [
      {
        data: Object.values(paymentMethodBreakdown),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const topSellingItemsData = {
    labels: topSellingItems.map(item => item[0]),
    datasets: [
      {
        label: 'Units Sold',
        data: topSellingItems.map(item => item[1]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const customerTrafficData = {
    labels: Object.keys(customerTraffic),
    datasets: [
      {
        label: 'Customer Traffic',
        data: Object.values(customerTraffic),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>
      <AdminNavigation />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                        <dd className="text-3xl font-semibold text-gray-900">₦{totalRevenue.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Sales by Branch</h3>
                  <div className="mt-5">
                    <Bar data={barChartData} />
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Method Breakdown</h3>
                  <div className="mt-5">
                    <Pie data={pieChartData} />
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Top Selling Items</h3>
                  <div className="mt-5">
                    <Bar data={topSellingItemsData} />
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Traffic by Day</h3>
                  <div className="mt-5">
                    <Line data={customerTrafficData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;