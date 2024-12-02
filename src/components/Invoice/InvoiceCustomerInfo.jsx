import React from 'react';

const InvoiceCustomerInfo = ({ order }) => {
  return (
    <div className="grid grid-cols-2 gap-8 mb-8 p-6 bg-white rounded-lg shadow-sm">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Bill To</h2>
        <div className="space-y-2 text-gray-600">
          <p className="font-medium text-gray-800">{order.customerName}</p>
          <p>{order.email}</p>
          <p>{order.phone}</p>
          <p>{order.address}</p>
          <p>{order.city}</p>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Delivery Details</h2>
        <div className="space-y-2 text-gray-600">
          <p><span className="font-medium">Recipient:</span> {order.recipientName}</p>
          <p><span className="font-medium">Delivery Option:</span> {order.deliveryOption}</p>
          <p><span className="font-medium">Reference:</span> {order.paymentReference}</p>
          <p><span className="font-medium">Status:</span> 
            <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              {order.status}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCustomerInfo;