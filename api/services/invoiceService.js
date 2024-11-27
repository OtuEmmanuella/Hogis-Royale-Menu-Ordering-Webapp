import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getStorage } from 'firebase-admin/storage';
import { sendInvoiceEmail } from './emailService.js';

export async function generateAndSendInvoice(orderData) {
  console.log('Generating invoice for order:', orderData.id);

  try {
    const doc = new jsPDF();
    
    // Add company logo
    const logoUrl = "https://firebasestorage.googleapis.com/v0/b/hogis-royale-menu.appspot.com/o/Hogis.jpg?alt=media";
    doc.addImage(logoUrl, "JPEG", 10, 10, 40, 40);

    // Company details
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text("Hogis Royale", 105, 20, null, null, "center");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("6 Bishop Moynagh Avenue, State Housing Calabar, Nigeria", 105, 30, null, null, "center");
    doc.text("Phone: +2348100072049 | Email: info@hogisroyale.com", 105, 35, null, null, "center");

    // Invoice details
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("INVOICE", 20, 50);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(`Invoice Number: INV-${orderData.id}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);

    // Customer information
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Bill To:", 20, 80);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(orderData.customer.name, 20, 85);
    doc.text(orderData.customer.email, 20, 90);
    doc.text(orderData.customer.phone, 20, 95);

    // Order items table
    const tableColumn = ["Item", "Quantity", "Price", "Total"];
    const tableRows = orderData.items.map(item => [
      item.name,
      item.quantity,
      `₦${item.price.toFixed(2)}`,
      `₦${(item.quantity * item.price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 120,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    // Save PDF to Firebase Storage
    const pdfBuffer = doc.output('arraybuffer');
    const bucket = getStorage().bucket();
    const file = bucket.file(`invoices/${orderData.id}.pdf`);
    
    await file.save(Buffer.from(pdfBuffer), {
      metadata: { contentType: 'application/pdf' }
    });

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });

    console.log('Invoice generated and stored:', url);

    // Send invoice email
    await sendInvoiceEmail(orderData.customer.email, url);
    
    console.log('Invoice email sent successfully');
  } catch (error) {
    console.error('Error generating/sending invoice:', error);
    throw error;
  }
}