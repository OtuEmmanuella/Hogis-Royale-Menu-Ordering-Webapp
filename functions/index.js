const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
const {jsPDF} = require("jspdf");
require("jspdf-autotable");

admin.initializeApp();

/**
 * Handles Paystack webhook events
 */
exports.paystackWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const secret = functions.config().paystack.secret_key;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");
    
    if (hash === req.headers["x-paystack-signature"]) {
      const event = req.body;
      
      switch (event.event) {
        case "charge.success":
          await handleSuccessfulPayment(event.data, "paystack");
          break;
        case "charge.failed":
          await handleFailedPayment(event.data, "paystack");
          break;
        case "refund.processed":
          await handleRefund(event.data, "paystack");
          break;
      }
      
      res.status(200).send("Webhook processed successfully");
    } else {
      res.status(400).send("Invalid signature");
    }
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
    res.status(500).send("Internal server error");
  }
});

/**
 * Handles successful payment processing
 * @param {Object} paymentData - Payment data from provider
 * @param {string} provider - Payment provider name
 */
async function handleSuccessfulPayment(paymentData, provider) {
  const orderId = provider === "paystack" ? 
    paymentData.reference : 
    paymentData.tx_ref;
  
  try {
    const orderRef = admin.firestore().collection("orders").doc(orderId);
    const orderSnapshot = await orderRef.get();
    
    if (!orderSnapshot.exists) {
      throw new Error("Order not found");
    }
    
    const orderData = orderSnapshot.data();

    await orderRef.update({ 
      status: "paid",
      paymentProvider: provider,
      paymentDetails: paymentData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await admin.firestore().collection("payments").doc(orderId).set({
      orderId,
      amount: paymentData.amount / 100,
      status: "success",
      provider,
      providerReference: paymentData.reference,
      customerEmail: paymentData.customer.email,
      metadata: paymentData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    await generateAndSendInvoice(orderData);

    await sendAdminNotification({
      title: "New Payment Received",
      body: `Payment of ₦${paymentData.amount / 100} received for order ${orderId}`,
      data: {orderId, type: "payment_success"},
    });

  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

/**
 * Handles failed payment processing
 * @param {Object} paymentData - Payment data from provider
 * @param {string} provider - Payment provider name
 */
async function handleFailedPayment(paymentData, provider) {
  const orderId = provider === "paystack" ? 
    paymentData.reference : 
    paymentData.tx_ref;
  
  try {
    await admin.firestore().collection("orders").doc(orderId).update({
      status: "payment_failed",
      paymentError: paymentData.gateway_response,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await admin.firestore().collection("payments").doc(orderId).set({
      orderId,
      amount: paymentData.amount / 100,
      status: "failed",
      provider,
      providerReference: paymentData.reference,
      customerEmail: paymentData.customer.email,
      errorMessage: paymentData.gateway_response,
      metadata: paymentData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error handling failed payment:", error);
    throw error;
  }
}

/**
 * Handles refund processing
 * @param {Object} refundData - Refund data from provider
 * @param {string} provider - Payment provider name
 */
async function handleRefund(refundData, provider) {
  const orderId = refundData.reference;
  
  try {
    await admin.firestore().collection("orders").doc(orderId).update({
      status: "refunded",
      refundDetails: refundData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await admin.firestore().collection("payments").doc(`${orderId}_refund`).set({
      orderId,
      amount: refundData.amount / 100,
      status: "refunded",
      provider,
      providerReference: refundData.reference,
      metadata: refundData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error handling refund:", error);
    throw error;
  }
}

/**
 * Sends notification to admin users
 * @param {Object} notification - Notification details
 */
async function sendAdminNotification(notification) {
  try {
    const adminTokensSnapshot = await admin.firestore()
      .collection("adminNotificationTokens")
      .get();
    
    const tokens = adminTokensSnapshot.docs.map((doc) => doc.data().token);
    
    if (tokens.length > 0) {
      await admin.messaging().sendMulticast({
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
      });
    }
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
}

/**
 * Generates and sends invoice for an order
 * @param {Object} orderData - Order details
 */
async function generateAndSendInvoice(orderData) {
  const doc = new jsPDF();
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/your-project-id" + 
    ".appspot.com/o/Hogis.jpg?alt=media";
  
  doc.addImage(logoUrl, "JPEG", 10, 10, 40, 40);

  // Company details
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text("Hogis Royale", 105, 20, null, null, "center");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "6 Bishop Moynagh Avenue, State Housing Calabar, Nigeria",
    105,
    30,
    null,
    null,
    "center"
  );
  doc.text(
    "Phone: +2348100072049 | Email: info@hogisroyale.com",
    105,
    35,
    null,
    null,
    "center"
  );

  // Invoice details
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("INVOICE", 20, 50);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  doc.text(`Invoice Number: INV-${Date.now()}`, 20, 60);
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
  doc.text(orderData.customer.address, 20, 100);
  doc.text(orderData.customer.city, 20, 105);

  // Order items table
  const tableColumn = ["Item", "Quantity", "Price", "Total"];
  const tableRows = orderData.items.map((item) => [
    item.name,
    item.quantity,
    `₦${item.price.toFixed(2)}`,
    `₦${(item.quantity * item.price).toFixed(2)}`,
  ]);

  doc.autoTable({
    startY: 120,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: {fillColor: [0, 102, 204], textColor: 255},
    alternateRowStyles: {fillColor: [240, 240, 240]},
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  const subtotal = orderData.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = orderData.totalAmount - subtotal;
  doc.text(`Subtotal: ₦${subtotal.toFixed(2)}`, 140, finalY);
  doc.text(`Delivery: ₦${deliveryFee.toFixed(2)}`, 140, finalY + 5);
  doc.setFont(undefined, "bold");
  doc.text(`Total: ₦${orderData.totalAmount.toFixed(2)}`, 140, finalY + 10);

  // Footer
  doc.setFontSize(10);
  doc.setFont(undefined, "italic");
  doc.text(
    "Thank you for dining with Hogis Royale!",
    105,
    280,
    null,
    null,
    "center"
  );

  // Save PDF to Firebase Storage
  const pdfBuffer = doc.output("arraybuffer");
  const bucket = admin.storage().bucket();
  const file = bucket.file(`invoices/${orderData.id}.pdf`);
  await file.save(Buffer.from(pdfBuffer), {
    metadata: {contentType: "application/pdf"},
  });

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2500",
  });

  await sendInvoiceEmail(orderData.customer.email, url);
}

/**
 * Sends invoice email to customer
 * @param {string} email - Customer email address
 * @param {string} invoiceUrl - URL to download invoice
 */
function sendInvoiceEmail(email, invoiceUrl) {
  console.log(`Sending invoice to ${email} with URL: ${invoiceUrl}`);
}

