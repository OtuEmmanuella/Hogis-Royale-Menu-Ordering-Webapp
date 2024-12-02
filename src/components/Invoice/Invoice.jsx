import React from 'react';
import InvoiceHeader from './InvoiceHeader';
import InvoiceCustomerInfo from './InvoiceCustomerInfo';
import InvoiceItems from './InvoiceItems';
import InvoiceSummary from './InvoiceSummary';
import InvoiceFooter from './InvoiceFooter';

const Invoice = ({ order }) => {
  const formatPrice = (price) => {
    return `₦${Number(price || 0).toLocaleString('en-NG', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  // Calculate totals
  const subtotal = (order.items || []).reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  const deliveryFee = order.deliveryPrice || 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg" id="invoice-content">
      <InvoiceHeader order={order} />
      <InvoiceCustomerInfo order={order} />
      <InvoiceItems items={order.items} formatPrice={formatPrice} />
      <InvoiceSummary 
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
        formatPrice={formatPrice}
      />
      <InvoiceFooter />
    </div>
  );
};

export default Invoice;