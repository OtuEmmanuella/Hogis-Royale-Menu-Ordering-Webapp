// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { TrendingUp, TrendingDown, LayoutDashboard, ShoppingBag, MessageCircle, Menu } from 'lucide-react';

// const BRANCHES = [
//   { id: '1', name: 'Hogis Royale & Apartments' },
//   { id: '2', name: 'Hogis Luxury Suites' },
//   { id: '3', name: 'Hogis Exclusive Suites' }
// ];

// function CashierDashboard() {
//     const navigate = useNavigate(); 
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [branchStats, setBranchStats] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedBranch, setSelectedBranch] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');

//   const calculateBranchStats = (orders, branchId, branchName) => {
//     const branchOrders = orders.filter(order => order.branchId === branchId);
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     const todayOrders = branchOrders.filter(order => 
//       new Date(order.createdAt) >= today
//     );

//     const yesterdayOrders = branchOrders.filter(order => 
//       new Date(order.createdAt) >= yesterday && 
//       new Date(order.createdAt) < today
//     );

//     const totalRevenue = branchOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

//     const trend = yesterdayOrders.length > 0
//       ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100
//       : 0;

//     return {
//       branchName,
//       totalOrders: branchOrders.length,
//       todayOrders: todayOrders.length,
//       totalRevenue,
//       trend
//     };
//   };

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const db = getFirestore();
//         const ordersSnapshot = await getDocs(collection(db, 'orders'));
//         const ordersData = ordersSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//           createdAt: doc.data().createdAt?.toDate() || new Date(),
//           totalAmount: parseFloat(doc.data().totalAmount) || 0,
//           branchId: doc.data().branchId?.toString() || 'unknown'
//         }));

//         setOrders(ordersData);
//         const stats = BRANCHES.map(branch => 
//           calculateBranchStats(ordersData, branch.id, branch.name)
//         );
//         setBranchStats(stats);
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//         setError(error.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   const renderSidebar = () => (
//     <div className="bg-white h-screen w-64 fixed left-0 top-0 shadow-lg">
//       <div className="p-4 border-b">
//         <div className="flex items-center gap-2">
//           <Menu className="h-6 w-6" />
//           <h1 className="text-xl font-bold text-blue-600">Hogis Admin</h1>
//         </div>
//       </div>
//       <nav className="p-4">
//         {[
//           { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: null },
//           { id: 'orders', label: 'Orders', icon: ShoppingBag, route: '/orders' },
//           { id: 'enquiries', label: 'Enquiries', icon: MessageCircle, route: '/customer-inquiries' }
//         ].map((item) => {
//           const Icon = item.icon;
//           return (
//             <button
//               key={item.id}
//               onClick={() => {
//                 setActiveTab(item.id);
//                 // If route is specified, navigate to that route
//                 if (item.route) {
//                   navigate(item.route);
//                 }
//               }}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 ${
//                 activeTab === item.id
//                   ? 'bg-blue-50 text-blue-600'
//                   : 'text-gray-600 hover:bg-gray-50'
//               }`}
//             >
//               <Icon className="h-5 w-5" />
//               <span>{item.label}</span>
//             </button>
//           );
//         })}
//       </nav>
//     </div>
//   );

//   const renderBranchCard = (stats) => {
//     const trendClass = stats.trend > 0 ? 'text-green-600' : 'text-red-600';

//     return (
//       <div key={stats.branchName} className="bg-white rounded-lg shadow-lg p-6">
//         <h3 className="text-xl font-bold mb-4 text-gray-600">{stats.branchName}</h3>
//         <div className="grid grid-cols-2 gap-4">
//           <div className="text-center">
//             <span className="block text-3xl font-bold text-gray-800">
//               {stats.totalOrders}
//             </span>
//             <span className="text-sm text-gray-600">Total Orders</span>
//           </div>
//           <div className="text-center">
//             <span className="block text-3xl font-bold text-gray-800">
//               ₦{stats.totalRevenue.toLocaleString()}
//             </span>
//             <span className="text-sm text-gray-600">Revenue</span>
//           </div>
//         </div>
        
//       </div>
//     );
//   };

//   const renderDashboard = () => (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Branch Performance Dashboard</h1>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         {branchStats.map(stats => renderBranchCard(stats))}
//       </div>
//       <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
//         <h3 className="text-xl font-bold mb-4">Branch Orders Overview</h3>
//         <div className="h-[400px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={branchStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="branchName" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="totalOrders" fill="#8884d8" name="Total Orders" />
//               <Bar dataKey="totalRevenue" fill="#82ca9d" name="Revenue (₦)" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );

//   const renderOrders = () => (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold">Orders</h2>
//         <div className="flex gap-4">
//           <select
//             value={selectedBranch}
//             onChange={(e) => setSelectedBranch(e.target.value)}
//             className="rounded-lg border-gray-300 shadow-sm"
//           >
//             <option value="all">All Branches</option>
//             {BRANCHES.map(branch => (
//               <option key={branch.id} value={branch.id}>{branch.name}</option>
//             ))}
//           </select>
//           <input
//             type="text"
//             placeholder="Search orders..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="rounded-lg border-gray-300 shadow-sm"
//           />
//         </div>
//       </div>
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Order ID
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Customer
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Branch
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Amount
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {orders
//               .filter(order => 
//                 (selectedBranch === 'all' || order.branchId === selectedBranch) &&
//                 (searchTerm === '' || 
//                   order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                   order.id.toLowerCase().includes(searchTerm.toLowerCase())
//                 )
//               )
//               .map(order => (
//                 <tr key={order.id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {order.id}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {order.customer?.name || 'N/A'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {BRANCHES.find(b => b.id === order.branchId)?.name || 'Unknown'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     ₦{order.totalAmount.toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
//                       ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
//                         order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                         'bg-gray-100 text-gray-800'}`}>
//                       {order.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   const renderEnquiries = () => (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-6">Customer Enquiries</h2>
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <p className="text-gray-600">No enquiries at the moment.</p>
//       </div>
//     </div>
//   );

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-xl">Loading...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-xl text-red-600">Error: {error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {renderSidebar()}
//       <div className="ml-64 flex-1">
//         {activeTab === 'dashboard' && renderDashboard()}
//         {activeTab === 'orders' && renderOrders()}
//         {activeTab === 'enquiries' && renderEnquiries()}
//       </div>
//     </div>
//   );
// }

// export default CashierDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, LayoutDashboard, ShoppingBag, MessageCircle, Menu, X } from 'lucide-react';

const BRANCHES = [
  { id: '1', name: 'Hogis Royale & Apartments' },
  { id: '2', name: 'Hogis Luxury Suites' },
  { id: '3', name: 'Hogis Exclusive Suites' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function CashierDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [branchStats, setBranchStats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const calculateBranchStats = (orders, branchId, branchName) => {
    const branchOrders = orders.filter(order => order.branchId === branchId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayOrders = branchOrders.filter(order => 
      new Date(order.createdAt) >= today
    );

    const yesterdayOrders = branchOrders.filter(order => 
      new Date(order.createdAt) >= yesterday && 
      new Date(order.createdAt) < today
    );

    const totalRevenue = branchOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = branchOrders.length > 0 ? totalRevenue / branchOrders.length : 0;

    const trend = yesterdayOrders.length > 0
      ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100
      : 0;

    return {
      branchName,
      totalOrders: branchOrders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      averageOrderValue,
      trend
    };
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const db = getFirestore();
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          totalAmount: parseFloat(doc.data().totalAmount) || 0,
          branchId: doc.data().branchId?.toString() || 'unknown'
        }));

        setOrders(ordersData);
        const stats = BRANCHES.map(branch => 
          calculateBranchStats(ordersData, branch.id, branch.name)
        );
        setBranchStats(stats);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderSidebar = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-gradient-to-br from-blue-900 to-blue-800 h-screen w-64 fixed left-0 top-0 shadow-xl z-50"
        >
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Hogis Admin</h1>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-white hover:text-blue-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <nav className="p-6">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: null },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, route: '/orders' },
              { id: 'enquiries', label: 'Enquiries', icon: MessageCircle, route: '/customer-inquiries' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.route) navigate(item.route);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderBranchCard = (stats) => {
    const trendClass = stats.trend > 0 ? 'text-green-500' : 'text-red-500';
    const TrendIcon = stats.trend > 0 ? TrendingUp : TrendingDown;

    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
      >
        <h3 className="text-xl font-bold mb-4 text-gray-800">{stats.branchName}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-3xl font-bold text-blue-600">
              {stats.totalOrders}
            </span>
            <span className="block text-sm text-gray-500">Total Orders</span>
          </div>
          <div className="space-y-2">
            <span className="text-3xl font-bold text-green-600">
              ₦{stats.totalRevenue.toLocaleString()}
            </span>
            <span className="block text-sm text-gray-500">Revenue</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <TrendIcon className={`h-5 w-5 ${trendClass}`} />
          <span className={`${trendClass} font-semibold`}>
            {Math.abs(stats.trend).toFixed(1)}% vs yesterday
          </span>
        </div>
      </motion.div>
    );
  };

  const renderDashboard = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Branch Performance</h1>
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branchStats.map(stats => renderBranchCard(stats))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold mb-6 text-gray-800">Revenue Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={branchStats}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branchName" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold mb-6 text-gray-800">Orders Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branchStats}
                  dataKey="totalOrders"
                  nameKey="branchName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {branchStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
        <div className="flex gap-4">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Branches</option>
            {BRANCHES.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {orders
                  .filter(order => 
                    (selectedBranch === 'all' || order.branchId === selectedBranch) &&
                    (searchTerm === '' || 
                      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      order.id.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  )
                  .map(order => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customer?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {BRANCHES.find(b => b.id === order.branchId)?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}
                        >
                          {order.status}
                        </motion.span>
                      </td>
                    </motion.tr>
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderEnquiries = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Enquiries</h2>
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500 text-lg">No enquiries at the moment</p>
        </div>
      </motion.div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xl text-blue-600 font-semibold"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xl text-red-600 font-semibold"
        >
          Error: {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {renderSidebar()}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}
      >
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'enquiries' && renderEnquiries()}
      </motion.div>
    </div>
  );
}

export default CashierDashboard;