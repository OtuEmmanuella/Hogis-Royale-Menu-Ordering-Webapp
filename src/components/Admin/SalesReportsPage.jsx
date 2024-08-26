import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/FirebaseConfig';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const SalesReportsPage = () => {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      // In a real application, you would fetch this data from Firestore
      // For this example, we'll use dummy data
      const dummyData = {
        dailySales: [1200, 1900, 3000, 5000, 4000, 1800, 2500],
        monthlySales: [15000, 20000, 25000, 30000, 35000, 40000],
        topProducts: [
          { name: 'Product A', sales: 500 },
          { name: 'Product B', sales: 400 },
          { name: 'Product C', sales: 300 },
          { name: 'Product D', sales: 200 },
          { name: 'Product E', sales: 100 },
        ],
      };
      setSalesData(dummyData);
      setLoading(false);
    };

    fetchSalesData();
  }, []);

  const dailySalesChart = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Sales',
        data: salesData?.dailySales,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const monthlySalesChart = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Sales',
        data: salesData?.monthlySales,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const topProductsChart = {
    labels: salesData?.topProducts.map(product => product.name),
    datasets: [
      {
        label: 'Top Products',
        data: salesData?.topProducts.map(product => product.sales),
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
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading sales data...</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default SalesReportsPage;