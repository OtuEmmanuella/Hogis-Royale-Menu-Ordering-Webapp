import React from 'react';

const InvoiceSummary = ({ subtotal, deliveryFee, total, formatPrice }) => {
  return (
    <div className="w-1/2 ml-auto mb-8">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
          <div className="h-px bg-gray-200 my-2"></div>
          <div className="flex justify-between text-lg font-bold text-gray-800">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;