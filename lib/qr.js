// /lib/qr.js
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function generateQRCode(grievanceId, baseUrl = 'https://yourdomain.com') {
  const url = `${baseUrl}/grievances/${grievanceId}`;
  const qrPath = path.join(process.cwd(), 'public', 'qrcodes', `${grievanceId}.png`);
  
  try {
    await QRCode.toFile(qrPath, url);
    return `/qrcodes/${grievanceId}.png`;
  } catch (error) {
    console.error('QR generation failed:', error);
    return null;
  }
}

async function generateQRBase64(grievanceId, baseUrl = 'https://yourdomain.com') {
  const url = `${baseUrl}/grievances/${grievanceId}`;
  try {
    return await QRCode.toDataURL(url);
  } catch (error) {
    console.error('QR base64 generation failed:', error);
    return null;
  }
}

module.exports = { generateQRCode, generateQRBase64 };