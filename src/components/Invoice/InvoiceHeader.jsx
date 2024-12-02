import React from 'react';

const InvoiceHeader = ({ order, branchLogo }) => {
  return (
    <div className="flex justify-between items-start mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
      <div className="flex items-center">
        <img 
          src="/Hogis Group Logo 2.jpg" 
          alt="Hogis Logo" 
          className="w-24 h-24 object-contain mr-4"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{order.branchName}</h1>
          <p className="text-gray-600 mt-1">...affordable Luxury</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-indigo-600">INVOICE</div>
        <p className="text-gray-600 mt-1">#{order.id}</p>
        <p className="text-gray-600 mt-1">{order.createdAt.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default InvoiceHeader;