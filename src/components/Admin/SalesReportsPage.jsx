import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const BRANCHES = [
  { id: '1', name: 'Hogis Royale & Apartments' },
  { id: '2', name: 'Hogis Luxury Suites' },
  { id: '3', name: 'Hogis Exclusive Suites' }
];

const SalesReportsPage = () => {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, [selectedBranch, startDate, endDate, selectedCategory, selectedItem]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      let q = query(ordersRef, 
        where('createdAt', '>=', startDate), 
        where('createdAt', '<=', endDate)
      );

      if (selectedBranch !== 'all') {
        q = query(q, where('branchId', '==', selectedBranch));
      }

      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));

      const processedData = processOrders(orders);
      setSalesData(processedData);

      // Extract categories and items
      const allCategories = [...new Set(orders.flatMap(order => order.items.map(item => item.category)))];
      setCategories(['all', ...allCategories]);

      const allItems = [...new Set(orders.flatMap(order => order.items.map(item => item.name)))];
      setItems(['all', ...allItems]);

    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processOrders = (orders) => {
    const dailySales = {};
    const monthlySales = {};
    const productSales = {};
    const categorySales = {};
    let totalRevenue = 0;

    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const month = date.substring(0, 7);

      dailySales[date] = (dailySales[date] || 0) + order.totalAmount;
      monthlySales[month] = (monthlySales[month] || 0) + order.totalAmount;
      totalRevenue += order.totalAmount;

      order.items.forEach(item => {
        if (selectedCategory === 'all' || item.category === selectedCategory) {
          if (selectedItem === 'all' || item.name === selectedItem) {
            productSales[item.name] = (productSales[item.name] || 0) + (item.price * item.quantity);
            categorySales[item.category] = (categorySales[item.category] || 0) + (item.price * item.quantity);
          }
        }
      });
    });

    return {
      dailySales: Object.entries(dailySales).sort((a, b) => a[0].localeCompare(b[0])),
      monthlySales: Object.entries(monthlySales).sort((a, b) => a[0].localeCompare(b[0])),
      productSales: Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5),
      categorySales: Object.entries(categorySales),
      totalRevenue
    };
  };

  const dailySalesChart = {
    labels: salesData?.dailySales.map(([date]) => date),
    datasets: [
      {
        label: 'Daily Sales',
        data: salesData?.dailySales.map(([, amount]) => amount),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const monthlySalesChart = {
    labels: salesData?.monthlySales.map(([month]) => month),
    datasets: [
      {
        label: 'Monthly Sales',
        data: salesData?.monthlySales.map(([, amount]) => amount),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const topProductsChart = {
    labels: salesData?.productSales.map(([product]) => product),
    datasets: [
      {
        label: 'Top Products',
        data: salesData?.productSales.map(([, sales]) => sales),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sales Reports</h1>
        
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="all">All Branches</option>
            {BRANCHES.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>

          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />

          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {items.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading sales data...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-indigo-600">₦{salesData?.totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Daily Sales</h3>
                  <Line data={dailySalesChart} />
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Monthly Sales</h3>
                  <Bar data={monthlySalesChart} />
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Top Products</h3>
                  <Bar data={topProductsChart} />
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Category Sales Summary</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData?.categorySales.map(([category, amount]) => (
                      <tr key={category}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesReportsPage;

