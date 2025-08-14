"use client"

interface ReceiptProps {
  data: {
    referenceNumber: string
    patientName: string
    patientPhone: string
    village?: string
    issue: string
    createdAt: string
    qrCode: string
  }
  language?: 'en' | 'te'
}

const translations = {
  en: {
    title: "Government of Telangana",
    subtitle: "Grievance Management System",
    receipt: "GRIEVANCE RECEIPT",
    reference: "Reference Number",
    name: "Name",
    phone: "Phone",
    village: "Village",
    issue: "Issue",
    date: "Date",
    instructions: "Instructions:",
    instruction1: "Keep this receipt safe for future reference",
    instruction2: "Scan QR code to check status online",
    instruction3: "Contact helpline: 1800-XXX-XXXX",
    footer: "Thank you for using our services"
  },
  te: {
    title: "తెలంగాణ ప్రభుత్వం",
    subtitle: "ఫిర్యాదు నిర్వహణ వ్యవస్థ",
    receipt: "ఫిర్యాదు రసీదు",
    reference: "రిఫరెన్స్ నంబర్",
    name: "పేరు",
    phone: "ఫోన్",
    village: "గ్రామం",
    issue: "సమస్య",
    date: "తేదీ",
    instructions: "సూచనలు:",
    instruction1: "భవిష్యత్ రిఫరెన్స్ కోసం ఈ రసీదును సురక్షితంగా ఉంచండి",
    instruction2: "ఆన్లైన్లో స్థితిని తనిఖీ చేయడానికి QR కోడ్ను స్కాన్ చేయండి",
    instruction3: "హెల్ప్లైన్: 1800-XXX-XXXX",
    footer: "మా సేవలను ఉపయోగించినందుకు ధన్యవాదాలు"
  }
}

export function ReceiptTemplate({ data, language = 'en' }: ReceiptProps) {
  const t = translations[language]

  return (
    <div className="max-w-md mx-auto bg-white p-6 border-2 border-gray-800 print:border-black">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
        <div className="w-16 h-16 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">TS</span>
        </div>
        <h1 className="text-lg font-bold text-blue-800">{t.title}</h1>
        <h2 className="text-sm text-gray-600">{t.subtitle}</h2>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded mt-2 inline-block">
          <strong>{t.receipt}</strong>
        </div>
      </div>

      {/* Reference Number */}
      <div className="text-center mb-4 p-3 bg-yellow-50 border-2 border-yellow-400 rounded">
        <div className="text-sm text-gray-600">{t.reference}</div>
        <div className="text-xl font-bold text-red-600 font-mono">
          {data.referenceNumber}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between border-b border-gray-300 pb-1">
          <span className="font-medium">{t.name}:</span>
          <span>{data.patientName}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-1">
          <span className="font-medium">{t.phone}:</span>
          <span>{data.patientPhone}</span>
        </div>
        {data.village && (
          <div className="flex justify-between border-b border-gray-300 pb-1">
            <span className="font-medium">{t.village}:</span>
            <span>{data.village}</span>
          </div>
        )}
        <div className="flex justify-between border-b border-gray-300 pb-1">
          <span className="font-medium">{t.date}:</span>
          <span>{new Date(data.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Issue */}
      <div className="mb-6">
        <div className="font-medium mb-2">{t.issue}:</div>
        <div className="text-sm bg-gray-50 p-3 rounded border">
          {data.issue}
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-white border-2 border-gray-400">
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-xs">
            QR CODE
          </div>
        </div>
        <div className="text-xs text-gray-600 mt-2">Scan for updates</div>
      </div>

      {/* Instructions */}
      <div className="mb-6 text-xs">
        <div className="font-medium mb-2">{t.instructions}</div>
        <ul className="space-y-1 text-gray-600">
          <li>• {t.instruction1}</li>
          <li>• {t.instruction2}</li>
          <li>• {t.instruction3}</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t border-gray-400 pt-3">
        <div>{t.footer}</div>
        <div className="mt-1">Generated: {new Date().toLocaleString()}</div>
      </div>
    </div>
  )
}