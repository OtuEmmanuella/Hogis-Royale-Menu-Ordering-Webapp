// pages/api/webhooks/test.js
export default function handler(req, res) {
    console.log('Test endpoint hit');
    res.status(200).json({ status: 'working' });
  }