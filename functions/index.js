const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

admin.initializeApp();

exports.paystackWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const secret = functions.config().paystack.secret_key;
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    
    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;
      
      if (event.event === 'charge.success') {
        await handleSuccessfulPayment(event.data, 'paystack');
      }
      
      res.status(200).send('Webhook processed successfully');
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    res.status(500).send('Internal server error');
  }
});

exports.flutterwaveWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const secretHash = functions.config().flutterwave.secret_hash;
    const signature = req.headers["verif-hash"];
    
    if (!signature || (signature !== secretHash)) {
      return res.status(401).send('Invalid signature');
    }
    
    const event = req.body;
    
    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      await handleSuccessfulPayment(event.data, 'flutterwave');
    }
    
    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Error processing Flutterwave webhook:', error);
    res.status(500).send('Internal server error');
  }
});

async function handleSuccessfulPayment(paymentData, provider) {
  const orderId = provider === 'paystack' ? paymentData.reference : paymentData.tx_ref;
  
  try {
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderSnapshot = await orderRef.get();
    const orderData = orderSnapshot.data();

    await orderRef.update({ 
      status: 'paid',
      paymentProvider: provider,
      paymentDetails: paymentData
    });
    
    await generateAndSendInvoice(orderData);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

async function generateAndSendInvoice(orderData) {
  const doc = new jsPDF();

  // Add logo
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/Hogis.jpg?alt=media';
  doc.addImage(logoUrl, 'JPEG', 10, 10, 40, 40);

  // Company details
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('Hogis Royale', 105, 20, null, null, 'center');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('6 Bishop Moynagh Avenue, State Housing Calabar, Nigeria', 105, 30, null, null, 'center');
  doc.text('Phone: +2348100072049 | Email: info@hogisroyale.com', 105, 35, null, null, 'center');

  // Invoice title and number
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('INVOICE', 20, 50);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Invoice Number: INV-${Date.now()}`, 20, 60);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);

  // Add customer information
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Bill To:', 20, 80);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(orderData.customer.name, 20, 85);
  doc.text(orderData.customer.email, 20, 90);
  doc.text(orderData.customer.phone, 20, 95);
  doc.text(orderData.customer.address, 20, 100);
  doc.text(orderData.customer.city, 20, 105);

  // Create table for order items
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
    theme: 'striped',
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });

  // Add totals
  const finalY = doc.lastAutoTable.finalY + 10;
  const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderData.totalAmount - subtotal;
  doc.text(`Subtotal: ₦${subtotal.toFixed(2)}`, 140, finalY);
  doc.text(`Delivery: ₦${deliveryFee.toFixed(2)}`, 140, finalY + 5);
  doc.setFont(undefined, 'bold');
  doc.text(`Total: ₦${orderData.totalAmount.toFixed(2)}`, 140, finalY + 10);

  // Add footer
  doc.setFontSize(10);
  doc.setFont(undefined, 'italic');
  doc.text('Thank you for dining with Hogis Royale!', 105, 280, null, null, 'center');

  // Save the PDF to Firebase Storage
  const pdfBuffer = doc.output('arraybuffer');
  const bucket = admin.storage().bucket();
  const file = bucket.file(`invoices/${orderData.id}.pdf`);
  await file.save(Buffer.from(pdfBuffer), {
    metadata: { contentType: 'application/pdf' }
  });

  // Get a signed URL for the file
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2500'
  });

  // Send email with invoice link (you'll need to implement this part)
  await sendInvoiceEmail(orderData.customer.email, url);
}

function sendInvoiceEmail(email, invoiceUrl) {
  // Implement email sending logic here
  console.log(`Sending invoice to ${email} with URL: ${invoiceUrl}`);
  // You might want to use a service like SendGrid or Nodemailer to send emails
}