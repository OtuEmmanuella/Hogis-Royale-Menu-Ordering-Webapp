import React from 'react';

const InvoiceItems = ({ items, formatPrice }) => {
  return (
    <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Item</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Quantity</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Price</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {(items || []).map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  {item.specifications && (
                    <p className="text-sm text-gray-500">Note: {item.specifications}</p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center text-gray-600">{item.quantity}</td>
              <td className="px-6 py-4 text-right text-gray-600">{formatPrice(item.price)}</td>
              <td className="px-6 py-4 text-right font-medium text-gray-800">
                {formatPrice(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceItems;