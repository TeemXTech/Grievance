"use client"

interface ReportProps {
  type: 'grievance' | 'project' | 'summary'
  data: any[]
  filters?: {
    dateFrom?: string
    dateTo?: string
    village?: string
    minister?: string
    status?: string
  }
  language?: 'en' | 'te'
}

const translations = {
  en: {
    title: "Government of Telangana",
    subtitle: "Grievance Management System",
    grievanceReport: "GRIEVANCE REPORT",
    projectReport: "PROJECT REPORT",
    summaryReport: "SUMMARY REPORT",
    generatedOn: "Generated On",
    filters: "Filters Applied",
    total: "Total Records",
    reference: "Reference",
    name: "Name",
    phone: "Phone",
    village: "Village",
    status: "Status",
    date: "Date",
    projectName: "Project Name",
    minister: "Minister",
    cost: "Cost",
    summary: "Summary Statistics"
  },
  te: {
    title: "తెలంగాణ ప్రభుత్వం",
    subtitle: "ఫిర్యాదు నిర్వహణ వ్యవస్థ",
    grievanceReport: "ఫిర్యాదు నివేదిక",
    projectReport: "ప్రాజెక్ట్ నివేదిక",
    summaryReport: "సారాంశ నివేదిక",
    generatedOn: "రూపొందించిన తేదీ",
    filters: "వర్తించిన ఫిల్టర్లు",
    total: "మొత్తం రికార్డులు",
    reference: "రిఫరెన్స్",
    name: "పేరు",
    phone: "ఫోన్",
    village: "గ్రామం",
    status: "స్థితి",
    date: "తేదీ",
    projectName: "ప్రాజెక్ట్ పేరు",
    minister: "మంత్రి",
    cost: "వ్యయం",
    summary: "సారాంశ గణాంకాలు"
  }
}

export function ReportTemplate({ type, data, filters, language = 'en' }: ReportProps) {
  const t = translations[language]

  const getReportTitle = () => {
    switch (type) {
      case 'grievance': return t.grievanceReport
      case 'project': return t.projectReport
      case 'summary': return t.summaryReport
      default: return 'REPORT'
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 print:p-4">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
            <span className="text-white font-bold text-xl">TS</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-800">{t.title}</h1>
            <h2 className="text-lg text-gray-600">{t.subtitle}</h2>
          </div>
        </div>
        <div className="bg-blue-100 text-blue-800 px-6 py-2 rounded inline-block">
          <strong className="text-xl">{getReportTitle()}</strong>
        </div>
      </div>

      {/* Report Info */}
      <div className="mb-6 bg-gray-50 p-4 rounded">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>{t.generatedOn}:</strong> {new Date().toLocaleString()}
          </div>
          <div>
            <strong>{t.total}:</strong> {data.length}
          </div>
        </div>
        
        {filters && (
          <div className="mt-4">
            <strong>{t.filters}:</strong>
            <div className="mt-2 text-sm">
              {filters.dateFrom && <span>From: {filters.dateFrom} </span>}
              {filters.dateTo && <span>To: {filters.dateTo} </span>}
              {filters.village && <span>Village: {filters.village} </span>}
              {filters.minister && <span>Minister: {filters.minister} </span>}
              {filters.status && <span>Status: {filters.status} </span>}
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      {type === 'grievance' && (
        <table className="w-full border-collapse border border-gray-400 mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 text-left">{t.reference}</th>
              <th className="border border-gray-400 p-2 text-left">{t.name}</th>
              <th className="border border-gray-400 p-2 text-left">{t.phone}</th>
              <th className="border border-gray-400 p-2 text-left">{t.village}</th>
              <th className="border border-gray-400 p-2 text-left">{t.status}</th>
              <th className="border border-gray-400 p-2 text-left">{t.date}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border border-gray-400 p-2 font-mono text-sm">{item.referenceNumber}</td>
                <td className="border border-gray-400 p-2">{item.patientName}</td>
                <td className="border border-gray-400 p-2">{item.patientPhone}</td>
                <td className="border border-gray-400 p-2">{item.village || '-'}</td>
                <td className="border border-gray-400 p-2">{item.status}</td>
                <td className="border border-gray-400 p-2">{new Date(item.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {type === 'project' && (
        <table className="w-full border-collapse border border-gray-400 mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 text-left">{t.reference}</th>
              <th className="border border-gray-400 p-2 text-left">{t.projectName}</th>
              <th className="border border-gray-400 p-2 text-left">{t.minister}</th>
              <th className="border border-gray-400 p-2 text-left">{t.village}</th>
              <th className="border border-gray-400 p-2 text-left">{t.status}</th>
              <th className="border border-gray-400 p-2 text-left">{t.cost}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border border-gray-400 p-2 font-mono text-sm">{item.referenceNumber}</td>
                <td className="border border-gray-400 p-2">{item.projectName}</td>
                <td className="border border-gray-400 p-2">{item.ministerName}</td>
                <td className="border border-gray-400 p-2">{item.village || '-'}</td>
                <td className="border border-gray-400 p-2">{item.status}</td>
                <td className="border border-gray-400 p-2">₹{item.estimatedCost?.toLocaleString() || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {type === 'summary' && (
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded border">
            <h3 className="font-bold text-blue-800 mb-3">{t.summary}</h3>
            <div className="space-y-2">
              <div>Total Grievances: {data.filter(d => d.type === 'grievance').length}</div>
              <div>Total Projects: {data.filter(d => d.type === 'project').length}</div>
              <div>Completed: {data.filter(d => d.status === 'COMPLETED' || d.status === 'RESOLVED').length}</div>
              <div>In Progress: {data.filter(d => d.status === 'IN_PROGRESS').length}</div>
              <div>Pending: {data.filter(d => d.status === 'PENDING' || d.status === 'NEW').length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t border-gray-400 pt-4">
        <div>This is a computer generated report</div>
        <div>For queries, contact: support@telangana.gov.in</div>
      </div>

      {/* Print Button */}
      <div className="text-center mt-6 print:hidden">
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mr-4"
        >
          Print Report
        </button>
        <button 
          onClick={() => {
            const csv = data.map(row => Object.values(row).join(',')).join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `report-${Date.now()}.csv`
            a.click()
          }}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>
    </div>
  )
}