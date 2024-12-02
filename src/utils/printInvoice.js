export const printInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
  
    const styles = `
      <style>
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #1f2937;
          }
  
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
          }
  
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
  
          th {
            background-color: #f9fafb;
            font-weight: 600;
          }
  
          .no-print {
            display: none;
          }
  
          img {
            max-width: 100px;
            height: auto;
          }
  
          .gradient-bg {
            background: #f8faff !important;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    `;
  
    const invoiceContent = document.getElementById('invoice-content')?.innerHTML;
  
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hogis Invoice #${order.id}</title>
          ${styles}
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-white">
          ${invoiceContent}
        </body>
      </html>
    `);
  
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500);
    };
  };