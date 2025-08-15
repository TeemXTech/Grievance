// /lib/messages.js
const messages = {
  grievanceCreated: {
    english: (id) => `Your grievance (ID: ${id}) is registered. Scan the QR code to view status.`,
    telugu: (id) => `మీ ఫిర్యాదు (ID: ${id}) నమోదు చేయబడింది. QR కోడ్ స్కాన్ చేసి స్థితి చూడండి.`
  },
  statusUpdate: {
    english: (id, status) => `Your grievance (ID: ${id}) status updated to: ${status}.`,
    telugu: (id, status) => {
      const statusTelugu = {
        'Pending': 'పెండింగ్',
        'In Progress': 'ప్రగతిలో',
        'Resolved': 'పరిష్కరించబడింది'
      };
      return `మీ ఫిర్యాదు (ID: ${id}) స్థితి: ${statusTelugu[status] || status}.`;
    }
  }
};

async function sendWhatsAppMessage(mobile, englishText, teluguText, qrPath = null) {
  // Mock implementation - replace with actual WhatsApp API
  console.log(`Sending to ${mobile}:`);
  console.log(`EN: ${englishText}`);
  console.log(`TE: ${teluguText}`);
  if (qrPath) console.log(`QR: ${qrPath}`);
  
  // TODO: Implement actual WhatsApp/SMS sending
  // Example with Twilio or WhatsApp Cloud API
  return true;
}

module.exports = { messages, sendWhatsAppMessage };