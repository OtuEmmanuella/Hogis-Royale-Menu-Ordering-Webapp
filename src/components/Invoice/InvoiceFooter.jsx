import React from 'react';

const InvoiceFooter = () => {
  return (
    <div className="text-center border-t pt-8">
      <div className="max-w-md mx-auto">
        <img 
          src="/Hogis Group Logo 2.jpg" 
          alt="Hogis Footer Logo" 
          className="w-16 h-16 mx-auto mb-4 object-contain"
        />
        <p className="text-gray-600 mb-2">Thank you for choosing Hogis</p>
        <p className="text-sm text-gray-500">
          For any inquiries, please contact us at hogisroyaleandapartment@gmail.com
        </p>
      </div>
    </div>
  );
};

export default InvoiceFooter;