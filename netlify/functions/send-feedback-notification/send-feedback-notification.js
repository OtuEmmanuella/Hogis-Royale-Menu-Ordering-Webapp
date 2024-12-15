// const nodemailer = require('nodemailer');

// // Email transport configuration for Gmail
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // Use TLS
//   auth: {
//     user: process.env.BRANCH1_EMAIL,
//     pass: process.env.BRANCH1_APP_PASSWORD
//   }
// });

// // Email templates
// const customerEmailTemplate = (name) => ({
//   subject: 'Thank you for your feedback - Hogis',
//   html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//     <h2>Thank you for your feedback, ${name}!</h2>
//     <p>We have received your feedback and truly appreciate you taking the time to share your experience with us.</p>
//     <p>Our team will carefully review your comments and if necessary, we'll get back to you soon.</p>
//     <p>Best regards,<br>The Hogis Team</p>
//   </div>`
// });

// const vendorEmailTemplate = (feedback) => ({
//   subject: 'New Customer Feedback Received',
//   html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//     <h2>New Feedback Received</h2>
//     <p><strong>Branch:</strong> ${feedback.branch}</p>
//     <p><strong>Customer Name:</strong> ${feedback.name}</p>
//     <p><strong>Rating:</strong> ${feedback.rating}/5</p>
//     <p><strong>Comments:</strong> ${feedback.comment}</p>
//     ${feedback.email ? `<p><strong>Customer Email:</strong> ${feedback.email}</p>` : ''}
//     ${feedback.photoURLs?.length ? `<p><strong>Photos Attached:</strong> ${feedback.photoURLs.length}</p>` : ''}
//   </div>`
// });

// exports.handler = async (event) => {
//   if (event.httpMethod !== 'POST') {
//     return { statusCode: 405, body: 'Method Not Allowed' };
//   }

//   try {
//     const feedback = JSON.parse(event.body);
//     const vendorEmail = process.env.BRANCH2_EMAIL; // Adjust this if needed

//     // Send email to vendor
//     await transporter.sendMail({
//       from: process.env.BRANCH1_EMAIL,
//       to: vendorEmail,
//       ...vendorEmailTemplate(feedback)
//     });

//     // Send confirmation email to customer if email provided
//     if (feedback.email) {
//       await transporter.sendMail({
//         from: process.env.BRANCH1_EMAIL,
//         to: feedback.email,
//         ...customerEmailTemplate(feedback.name)
//       });
//     }

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: 'Notification emails sent successfully' })
//     };
//   } catch (error) {
//     console.error('Detailed error:', error.stack || error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: `Failed to send notification emails: ${error.message}` })
//     };
//   }
// };

// const nodemailer = require('nodemailer');

// // Email transport configuration for Gmail
// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false, // Use TLS
//   auth: {
//     user: process.env.BRANCH1_EMAIL,
//     pass: process.env.BRANCH1_APP_PASSWORD
//   }
// });

// // Base email template
// const baseEmailTemplate = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Hogis Feedback</title>
//   <style>
//     body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
//     .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//     .logo { text-align: center; margin-bottom: 20px; }
//     .logo img { max-width: 150px; height: auto; }
//     .banner { width: 100%; max-width: 600px; height: auto; margin-bottom: 20px; }
//     h2 { color: #2c3e50; margin-top: 0; }
//     .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
//     @media only screen and (max-width: 600px) {
//       .container { width: 100% !important; }
//       .content { padding: 10px !important; }
//     }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <div class="logo">
//       <img src="https://drive.google.com/uc?export=view&id=1hVz4ADITDRxa5ZVI9ZYY2SgWyWFY-SjT" alt="Hogis Logo">
//     </div>
//     <img src="https://drive.google.com/uc?export=view&id=1rBwnwcrBK6sJEiTDdmvy8_PlljpsKI7a" alt="Hogis Banner" class="banner">
//     <div class="content">
//       {{content}}
//     </div>
//   </div>
// </body>
// </html>
// `;

// // Email templates
// const customerEmailTemplate = (name) => ({
//   subject: 'Thank you for your feedback - Hogis',
//   html: baseEmailTemplate.replace('{{content}}', `
//     <h2>Thank you for your feedback, ${name}!</h2>
//     <p>We have received your feedback and truly appreciate you taking the time to share your experience with us.</p>
//     <p>Our team will carefully review your comments and if necessary, we'll get back to you soon.</p>
//     <p>Best regards,<br>The Hogis Team</p>
//   `)
// });

// const vendorEmailTemplate = (feedback) => ({
//   subject: 'New Customer Feedback Received',
//   html: baseEmailTemplate.replace('{{content}}', `
//     <h2>New Feedback Received</h2>
//     <p><strong>Branch:</strong> ${feedback.branch}</p>
//     <p><strong>Customer Name:</strong> ${feedback.name}</p>
//     <p><strong>Rating:</strong> ${feedback.rating}/5</p>
//     <p><strong>Comments:</strong> ${feedback.comment}</p>
//     ${feedback.email ? `<p><strong>Customer Email:</strong> ${feedback.email}</p>` : ''}
//     ${feedback.photoURLs?.length ? `<p><strong>Photos Attached:</strong> ${feedback.photoURLs.length}</p>` : ''}
//   `)
// });

// exports.handler = async (event) => {
//   if (event.httpMethod !== 'POST') {
//     return { statusCode: 405, body: 'Method Not Allowed' };
//   }

//   try {
//     const feedback = JSON.parse(event.body);
//     const vendorEmail = process.env.BRANCH2_EMAIL; // Adjust this if needed

//     // Send email to vendor
//     await transporter.sendMail({
//       from: process.env.BRANCH1_EMAIL,
//       to: vendorEmail,
//       ...vendorEmailTemplate(feedback)
//     });

//     // Send confirmation email to customer if email provided
//     if (feedback.email) {
//       await transporter.sendMail({
//         from: process.env.BRANCH1_EMAIL,
//         to: feedback.email,
//         ...customerEmailTemplate(feedback.name)
//       });
//     }

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: 'Notification emails sent successfully' })
//     };
//   } catch (error) {
//     console.error('Detailed error:', error.stack || error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: `Failed to send notification emails: ${error.message}` })
//     };
//   }
// };

const nodemailer = require('nodemailer');

// Email transport configuration for Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.BRANCH1_EMAIL,
    pass: process.env.BRANCH1_APP_PASSWORD
  }
});

const baseEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hogis Feedback</title>
  <style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .logo { text-align: left; margin-bottom: 20px; }
  .logo img { max-width: 150px; width: 100%; height: auto; display: inline-block; }
  .banner { width: 100%; max-width: 600px; height: auto; margin-bottom: 20px; display: block; }
  h2 { color: #2c3e50; margin-top: 0; }
  .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
  img { -ms-interpolation-mode: bicubic; }
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .content { padding: 10px !important; }
    .logo img { max-width: 80px !important; } /* Significantly smaller on mobile */
  }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://drive.google.com/thumbnail?id=1hVz4ADITDRxa5ZVI9ZYY2SgWyWFY-SjT&sz=w600" alt="Hogis Logo" style="max-width: 150px; width: 100%; height: auto;">
    </div>
    <img src="https://drive.google.com/thumbnail?id=1rBwnwcrBK6sJEiTDdmvy8_PlljpsKI7a&sz=w600" alt="Hogis Banner" class="banner" style="display: block; max-width: 600px; width: 100%;">
    <div class="content">
      {{content}}
    </div>
  </div>
</body>
</html>
`;

// Email templates
const customerEmailTemplate = (name) => ({
  subject: 'Hogis Group - Thank you for your feedback',
  html: baseEmailTemplate.replace('{{content}}', `
    <h2>Thank you for your feedback, ${name}!</h2>
    <p>We have received your feedback and truly appreciate you taking the time to share your experience with us.</p>
    <p>Our team will carefully review your comments and if necessary, we'll get back to you soon.</p>
    <p>Best regards,<br>The Hogis Team</p>
  `)
});

const vendorEmailTemplate = (feedback) => ({
  subject: 'New Customer Feedback Received',
  html: baseEmailTemplate.replace('{{content}}', `
    <h2>New Feedback Received</h2>
    <p><strong>Branch:</strong> ${feedback.branch}</p>
    <p><strong>Customer Name:</strong> ${feedback.name}</p>
     <p><strong>Customer Phone:</strong> ${feedback.phone}</p>
    <p><strong>Rating:</strong> ${feedback.rating}/5</p>
    <p><strong>Comments:</strong> ${feedback.comment}</p>
    ${feedback.email ? `<p><strong>Customer Email:</strong> ${feedback.email}</p>` : ''}
    ${feedback.photoURLs?.length ? `<p><strong>Photos Attached:</strong> ${feedback.photoURLs.length}</p>` : ''}
  `)
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const feedback = JSON.parse(event.body);
    const vendorEmail = process.env.BRANCH2_EMAIL;

    // Send email to vendor
    await transporter.sendMail({
      from: process.env.BRANCH1_EMAIL,
      to: vendorEmail,
      ...vendorEmailTemplate(feedback)
    });

    // Send confirmation email to customer if email provided
    if (feedback.email) {
      await transporter.sendMail({
        from: process.env.BRANCH1_EMAIL,
        to: feedback.email,
        ...customerEmailTemplate(feedback.name)
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notification emails sent successfully' })
    };
  } catch (error) {
    console.error('Detailed error:', error.stack || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to send notification emails: ${error.message}` })
    };
  }
};