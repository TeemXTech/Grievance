"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  User,
  Phone,
  MapPin,
  Building,
  HeartPulse,
  Briefcase,
  ArrowRightLeft,
  ShieldAlert,
  Lock,
  History,
  Send,
  X,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react"

interface Petition {
  id: string
  trackingNumber: string
  type: string
  title: string
  description: string
  priority: string
  status: string
  applicantName: string
  applicantPhone: string
  applicantAddress?: string
  district?: string
  mandalName?: string
  villageName?: string
  referredByLeaderName?: string
  leaderEndorsementNote?: string
  handlingPaName?: string
  assignedOfficialName?: string
  assignedDepartment?: string
  privateNotes?: string
  hospitalName?: string
  medicalCondition?: string
  requestedAmount?: number
  sanctionedAmount?: number
  currentPosting?: string
  requestedPosting?: string
  employeeDesignation?: string
  qualification?: string
  daysAllowed?: number
  daysPassed?: number
  isOverdue?: boolean
  createdAt: string
  referredByLeader?: {
    id: string
    name: string
    phone: string
    designation: string
    partyRole?: string
  }
  handlingPa?: {
    name: string
    email: string
  }
  assignedOfficial?: {
    name: string
    email: string
  }
  timeline?: Array<{
    id: string
    actionTaken: string
    remarks?: string
    fromStatus?: string
    toStatus: string
    performedByName: string
    performedByRole: string
    isPrivateNote: boolean
    createdAt: string
  }>
}

interface Metadata {
  leaders: Array<{ id: string; name: string; designation: string; mandalName: string; villageName: string }>
  mandals: Array<{ id: string; name: string }>
  villages: Array<{ id: string; name: string; mandalId: string }>
  officials: Array<{ id: string; name: string }>
  pas: Array<{ id: string; name: string }>
  departments: string[]
}

export default function PACommandCenter() {
  const router = useRouter()

  // Data states
  const [petitions, setPetitions] = useState<Petition[]>([])
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>({ total: 0, overdueCount: 0 })

  // Filter states
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState("ALL")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [selectedDept, setSelectedDept] = useState("ALL")
  const [overdueOnly, setOverdueOnly] = useState(false)

  // Modal states
  const [activePetition, setActivePetition] = useState<Petition | null>(null)
  const [showLogModal, setShowLogModal] = useState(false)
  const [submittingAction, setSubmittingAction] = useState(false)

  // Action update form inside detail modal
  const [actionForm, setActionForm] = useState({
    newStatus: "",
    actionTaken: "",
    remarks: "",
    sanctionedAmount: "",
    privateNotes: "",
    isPrivate: false,
  })

  // New petition form state
  const [newForm, setNewForm] = useState({
    type: "CMRF_MEDICAL",
    title: "",
    description: "",
    priority: "HIGH",
    applicantName: "",
    applicantPhone: "",
    mandalName: "Manthanani",
    villageName: "Bittupalli",
    referredByLeaderId: "",
    handlingPaName: "PA Srinivas",
    assignedDepartment: "Health & Medical Services (DMHO)",
    assignedOfficialName: "Dr. K. Sudhakar (DMHO Peddapalli)",
    privateNotes: "",
    hospitalName: "",
    medicalCondition: "",
    requestedAmount: "",
    currentPosting: "",
    requestedPosting: "",
    employeeDesignation: "",
    qualification: "",
    daysAllowed: "7",
  })

  // Fetch Petitions
  const fetchPetitions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedType !== "ALL") params.append("type", selectedType)
      if (selectedStatus !== "ALL") params.append("status", selectedStatus)
      if (overdueOnly) params.append("overdue", "true")
      if (search.trim()) params.append("search", search.trim())

      const res = await fetch(`/api/pa/petitions?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setPetitions(data.petitions)
        setSummary(data.summary)
      }
    } catch (err) {
      console.error("Failed to fetch petitions:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch Metadata for dropdowns
  const fetchMetadata = async () => {
    try {
      const res = await fetch("/api/pa/metadata")
      const data = await res.json()
      if (data.success) {
        setMetadata(data)
      }
    } catch (err) {
      console.error("Failed to fetch metadata:", err)
    }
  }

  useEffect(() => {
    fetchMetadata()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPetitions()
    }, 250)
    return () => clearTimeout(timer)
  }, [selectedType, selectedStatus, overdueOnly, search])

  // Open detail modal and prep action form
  const handleSelectPetition = (petition: Petition) => {
    setActivePetition(petition)
    setActionForm({
      newStatus: petition.status,
      actionTaken: "",
      remarks: "",
      sanctionedAmount: petition.sanctionedAmount ? String(petition.sanctionedAmount) : "",
      privateNotes: petition.privateNotes || "",
      isPrivate: false,
    })
  }

  // Submit action / status update on active petition
  const handleUpdatePetition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePetition) return
    setSubmittingAction(true)

    try {
      const res = await fetch(`/api/pa/petitions/${activePetition.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionForm.newStatus,
          actionTaken: actionForm.actionTaken || `Status updated to ${actionForm.newStatus}`,
          actionRemarks: actionForm.remarks,
          sanctionedAmount: actionForm.sanctionedAmount || undefined,
          privateNotes: actionForm.privateNotes,
          performedByName: "PA Srinivas",
          performedByRole: "PA",
          isPrivateNote: actionForm.isPrivate,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setActivePetition(data.petition)
        // Refresh main list in background
        fetchPetitions()
        // Reset action fields
        setActionForm((prev) => ({
          ...prev,
          actionTaken: "",
          remarks: "",
        }))
      } else {
        alert("Error: " + data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to submit update.")
    } finally {
      setSubmittingAction(false)
    }
  }

  // Submit brand new petition
  const handleCreatePetition = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingAction(true)

    try {
      const selectedLeader = metadata?.leaders.find((l) => l.id === newForm.referredByLeaderId)

      const payload = {
        ...newForm,
        referredByLeaderName: selectedLeader ? selectedLeader.name : undefined,
      }

      const res = await fetch("/api/pa/petitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        setShowLogModal(false)
        fetchPetitions()
        // Reset form
        setNewForm({
          type: "CMRF_MEDICAL",
          title: "",
          description: "",
          priority: "HIGH",
          applicantName: "",
          applicantPhone: "",
          mandalName: "Manthanani",
          villageName: "Bittupalli",
          referredByLeaderId: "",
          handlingPaName: "PA Srinivas",
          assignedDepartment: "Health & Medical Services (DMHO)",
          assignedOfficialName: "Dr. K. Sudhakar (DMHO Peddapalli)",
          privateNotes: "",
          hospitalName: "",
          medicalCondition: "",
          requestedAmount: "",
          currentPosting: "",
          requestedPosting: "",
          employeeDesignation: "",
          qualification: "",
          daysAllowed: "7",
        })
      } else {
        alert("Error: " + data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to create petition.")
    } finally {
      setSubmittingAction(false)
    }
  }

  // Type color helpers
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "CMRF_MEDICAL":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200"><HeartPulse className="w-3 h-3 mr-1" /> CMRF Medical</span>
      case "EMPLOYEE_TRANSFER":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200"><ArrowRightLeft className="w-3 h-3 mr-1" /> Teacher/Transfer</span>
      case "JOB_EMPLOYMENT":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><Briefcase className="w-3 h-3 mr-1" /> Job / Skill</span>
      case "PERSONAL_GRIEVANCE":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><FileText className="w-3 h-3 mr-1" /> Land / Grievance</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200"><Layers className="w-3 h-3 mr-1" /> Petition</span>
    }
  }

  // Status color helpers
  const getStatusBadge = (status: string, isOverdue?: boolean) => {
    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> OVERDUE ALERT
        </span>
      )
    }
    switch (status) {
      case "SANCTIONED":
      case "RESOLVED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3 h-3 mr-1" /> Sanctioned / Done</span>
      case "UNDER_REVIEW":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200"><Clock className="w-3 h-3 mr-1" /> Under Review</span>
      case "ASSIGNED_TO_OFFICIAL":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><Building className="w-3 h-3 mr-1" /> With Official</span>
      case "SUBMITTED_TO_PA":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><User className="w-3 h-3 mr-1" /> In PA Office</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Government Navigation Header */}
      <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <span className="text-xl">🏛️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">PA Office Command Center</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/40 uppercase">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Hon'ble Minister D. Sridhar Babu Office • Manthanani Constituency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push("/demo-login")}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition-all font-medium"
            >
              Switch Role
            </button>
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1.5 text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log a Petition</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* 1. Top Metrics & Overdue Radar Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total */}
          <div
            onClick={() => { setOverdueOnly(false); setSelectedType("ALL"); }}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              !overdueOnly && selectedType === "ALL"
                ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Petitions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.total || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Across all mandals</p>
          </div>

          {/* Overdue Warning Radar */}
          <div
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden ${
              overdueOnly
                ? "bg-red-50 border-red-500 ring-2 ring-red-500/30 shadow-md"
                : summary.overdueCount > 0
                ? "bg-red-50/70 border-red-300 hover:border-red-400 shadow-sm"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 animate-bounce text-red-600" /> Overdue Radar
              </p>
            </div>
            <p className="text-2xl font-black text-red-700 mt-1">{summary.overdueCount || 0}</p>
            <p className="text-[11px] font-semibold text-red-600 mt-1">
              {overdueOnly ? "Showing overdue only" : "Files needing nudge"}
            </p>
          </div>

          {/* CMRF Medical */}
          <div
            onClick={() => { setSelectedType("CMRF_MEDICAL"); setOverdueOnly(false); }}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedType === "CMRF_MEDICAL"
                ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-md"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <p className="text-xs font-medium text-rose-700 uppercase tracking-wider flex items-center">
              <HeartPulse className="w-3.5 h-3.5 mr-1" /> CMRF / Medical
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.cmrfCount || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Emergency relief</p>
          </div>

          {/* Transfers */}
          <div
            onClick={() => { setSelectedType("EMPLOYEE_TRANSFER"); setOverdueOnly(false); }}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedType === "EMPLOYEE_TRANSFER"
                ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <p className="text-xs font-medium text-indigo-700 uppercase tracking-wider flex items-center">
              <ArrowRightLeft className="w-3.5 h-3.5 mr-1" /> Govt Transfers
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.transferCount || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Teachers & Staff</p>
          </div>

          {/* Jobs & Schemes */}
          <div
            onClick={() => { setSelectedType("JOB_EMPLOYMENT"); setOverdueOnly(false); }}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedType === "JOB_EMPLOYMENT"
                ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider flex items-center">
              <Briefcase className="w-3.5 h-3.5 mr-1" /> Job Requests
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.jobCount || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Youth placement</p>
          </div>

          {/* Sanctioned / Done */}
          <div
            onClick={() => { setSelectedStatus("SANCTIONED"); setOverdueOnly(false); }}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedStatus === "SANCTIONED"
                ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Sanctioned
            </p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{summary.resolvedCount || 0}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Letters issued</p>
          </div>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Live Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search citizen, phone, leader, tracking #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Status Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              {["ALL", "SUBMITTED_TO_PA", "ASSIGNED_TO_OFFICIAL", "UNDER_REVIEW", "SANCTIONED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedStatus === st
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st === "ALL" ? "All Statuses" : st.replace(/_/g, " ")}
                </button>
              ))}

              <button
                onClick={fetchPetitions}
                title="Refresh List"
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all ml-1"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Petitions List (Desktop Table / Mobile Cards) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Tracked Petitions & Applications ({petitions.length})
              </h2>
              {overdueOnly && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
                  Filtered: Overdue Warnings Only
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Click any row to view timeline, update status, and add Minister notes
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm font-medium">Loading petitions from database...</p>
            </div>
          ) : petitions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-base font-semibold text-slate-700">No petitions found</p>
              <p className="text-xs text-slate-500">Try adjusting your search terms or filters above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Tracking & Category</th>
                    <th className="py-3 px-4">Citizen / Applicant</th>
                    <th className="py-3 px-4">Village / Mandal</th>
                    <th className="py-3 px-4">Referred By Leader</th>
                    <th className="py-3 px-4">Assigned Department</th>
                    <th className="py-3 px-4">Status & Alerts</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {petitions.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => handleSelectPetition(p)}
                      className={`cursor-pointer transition-colors hover:bg-blue-50/60 ${
                        p.isOverdue ? "bg-red-50/40" : ""
                      }`}
                    >
                      {/* Tracking # & Title */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {p.trackingNumber}
                          </span>
                          <p className="font-semibold text-slate-900 line-clamp-1">{p.title}</p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {getTypeBadge(p.type)}
                            {p.priority === "URGENT" && (
                              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                                URGENT
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Citizen */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{p.applicantName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {p.applicantPhone}
                        </p>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <p className="font-medium text-slate-800">{p.villageName || "Manthanani"}</p>
                        <p className="text-xs text-slate-500">{p.mandalName || "Manthanani Mandal"}</p>
                      </td>

                      {/* Referred Leader */}
                      <td className="py-3.5 px-4">
                        {p.referredByLeaderName ? (
                          <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200">
                            <span className="mr-1">⭐</span>
                            <span className="truncate max-w-[140px]">{p.referredByLeaderName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Direct Citizen</span>
                        )}
                      </td>

                      {/* Assigned Department */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800 line-clamp-1">{p.assignedDepartment || "General Dept"}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {p.handlingPaName || "PA Staff"}
                        </p>
                      </td>

                      {/* Status & Overdue */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div>{getStatusBadge(p.status, p.isOverdue)}</div>
                          {p.isOverdue && (
                            <p className="text-[11px] font-bold text-red-600">
                              {p.daysPassed || 12} days idle • Nudge needed!
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Quick Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectPetition(p)
                          }}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================
          MODAL 1: PETITION DETAILS, TIMELINE & ACTION UPDATE
      ======================================================== */}
      {activePetition && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80 rounded-t-2xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                    {activePetition.trackingNumber}
                  </span>
                  {getTypeBadge(activePetition.type)}
                  {getStatusBadge(activePetition.status, activePetition.isOverdue)}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{activePetition.title}</h3>
                <p className="text-xs text-slate-500">
                  Logged on {new Date(activePetition.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
              </div>

              <button
                onClick={() => setActivePetition(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Overdue Alert banner if overdue */}
              {activePetition.isOverdue && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900 text-sm">Overdue Attention Flag</p>
                    <p className="text-xs text-red-700">
                      This file has been pending with {activePetition.assignedDepartment || "the department"} for over {activePetition.daysPassed || 7} days without resolution. Follow up with the official today.
                    </p>
                  </div>
                </div>
              )}

              {/* 4-Way Person Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Citizen */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    👤 Citizen / Applicant
                  </p>
                  <p className="font-bold text-slate-900 text-sm">{activePetition.applicantName}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {activePetition.applicantPhone}
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {activePetition.villageName}, {activePetition.mandalName}
                  </p>
                </div>

                {/* 2. Referring Leader */}
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200">
                  <p className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    ⭐ Referring Local Leader
                  </p>
                  {activePetition.referredByLeaderName ? (
                    <div>
                      <p className="font-bold text-indigo-950 text-sm">{activePetition.referredByLeaderName}</p>
                      <p className="text-xs text-indigo-800">
                        {activePetition.referredByLeader?.designation || "Village Leader"}
                      </p>
                      {activePetition.referredByLeader?.phone && (
                        <p className="text-xs text-indigo-700 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {activePetition.referredByLeader.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic mt-1">Direct Praja Darbar Citizen Intake</p>
                  )}
                </div>

                {/* 3. Handling PA */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    💼 Handling PA Staff
                  </p>
                  <p className="font-semibold text-slate-900">{activePetition.handlingPaName || "PA Srinivas"}</p>
                  <p className="text-xs text-slate-500">Minister's Office Core Team</p>
                </div>

                {/* 4. Assigned Department & Official */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    🏢 Assigned Department
                  </p>
                  <p className="font-semibold text-slate-900">{activePetition.assignedDepartment || "General Dept"}</p>
                  <p className="text-xs text-slate-600">{activePetition.assignedOfficialName || "Pending Official Assignment"}</p>
                </div>
              </div>

              {/* Description & Category Details */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Petition Summary</p>
                <p className="text-slate-800 leading-relaxed">{activePetition.description}</p>

                {/* Category specific cards */}
                {activePetition.type === "CMRF_MEDICAL" && (
                  <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Hospital:</span>{" "}
                      <span className="font-semibold text-slate-800">{activePetition.hospitalName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Condition:</span>{" "}
                      <span className="font-semibold text-slate-800">{activePetition.medicalCondition || "Medical"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Requested Amount:</span>{" "}
                      <span className="font-semibold text-slate-900">₹{activePetition.requestedAmount?.toLocaleString("en-IN") || "0"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Sanctioned Amount:</span>{" "}
                      <span className="font-bold text-emerald-700">₹{activePetition.sanctionedAmount?.toLocaleString("en-IN") || "0"}</span>
                    </div>
                  </div>
                )}

                {activePetition.type === "EMPLOYEE_TRANSFER" && (
                  <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Current Posting:</span>{" "}
                      <span className="font-semibold text-slate-800">{activePetition.currentPosting}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Requested Posting:</span>{" "}
                      <span className="font-semibold text-slate-800">{activePetition.requestedPosting}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 🔒 Confidential Minister & PA Private Notes */}
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    Confidential Private Notes (Minister & PA Only)
                  </p>
                  <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                    Secret
                  </span>
                </div>
                <p className="text-xs text-amber-950 font-medium italic">
                  "{activePetition.privateNotes || "No private notes entered yet."}"
                </p>
              </div>

              {/* Action History / Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <History className="w-4 h-4 text-blue-600" />
                    Action Timeline & Follow-up History ({activePetition.timeline?.length || 0})
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {activePetition.timeline && activePetition.timeline.length > 0 ? (
                    activePetition.timeline.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.actionTaken}</p>
                            <span className="text-[10px] text-slate-500">
                              {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          {item.remarks && <p className="text-xs text-slate-600 italic">"{item.remarks}"</p>}
                          <p className="text-[11px] text-slate-500">
                            By <span className="font-medium text-slate-700">{item.performedByName}</span> ({item.performedByRole})
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2">No follow-up events recorded yet.</p>
                  )}
                </div>
              </div>

              {/* ⚡ Take Action / Update File Form */}
              <form onSubmit={handleUpdatePetition} className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-blue-950 text-sm">Update File / Take Action</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
                    <select
                      value={actionForm.newStatus}
                      onChange={(e) => setActionForm({ ...actionForm, newStatus: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SUBMITTED_TO_PA">In PA Office (SUBMITTED_TO_PA)</option>
                      <option value="ASSIGNED_TO_OFFICIAL">Assigned to Department / Official</option>
                      <option value="UNDER_REVIEW">Under Review by Minister / Special Officer</option>
                      <option value="SANCTIONED">Sanctioned / Grant Approved</option>
                      <option value="RESOLVED">Resolved / Completed</option>
                      <option value="REJECTED">Rejected / Unfeasible</option>
                    </select>
                  </div>

                  {activePetition.type === "CMRF_MEDICAL" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Sanctioned Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 150000"
                        value={actionForm.sanctionedAmount}
                        onChange={(e) => setActionForm({ ...actionForm, sanctionedAmount: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Action Taken Note *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spoke to MRO regarding field survey; instructed to finish by Friday"
                    value={actionForm.actionTaken}
                    onChange={(e) => setActionForm({ ...actionForm, actionTaken: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Letter dispatched via special messenger"
                    value={actionForm.remarks}
                    onChange={(e) => setActionForm({ ...actionForm, remarks: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Update Private Notes (Minister/PA Only)</label>
                  <textarea
                    rows={2}
                    placeholder="Confidential notes..."
                    value={actionForm.privateNotes}
                    onChange={(e) => setActionForm({ ...actionForm, privateNotes: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingAction ? "Saving Update..." : "Save Action & Update Timeline"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: LOG A NEW PETITION (FAST 30-SEC INTAKE FORM)
      ======================================================== */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Log a Citizen Petition (Fast Intake)</h3>
                <p className="text-xs text-slate-500">Record a new request, link the local leader, and assign it to a department</p>
              </div>
              <button onClick={() => setShowLogModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePetition} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Petition Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "CMRF_MEDICAL", label: "CMRF / Medical", icon: HeartPulse },
                    { id: "EMPLOYEE_TRANSFER", label: "Govt Transfer", icon: ArrowRightLeft },
                    { id: "JOB_EMPLOYMENT", label: "Job Request", icon: Briefcase },
                    { id: "PERSONAL_GRIEVANCE", label: "Land / Local", icon: FileText },
                  ].map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setNewForm({ ...newForm, type: cat.id })}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          newForm.type === cat.id
                            ? "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs">{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Petition Title / Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Heart surgery assistance request at NIMS Hospital"
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                  <textarea
                    rows={2}
                    placeholder="Summarize the citizen's hardship or request..."
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Citizen Details */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">1. Citizen / Applicant</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Applicant Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Katta Mallesh"
                      value={newForm.applicantName}
                      onChange={(e) => setNewForm({ ...newForm, applicantName: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Applicant Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91-9876543210"
                      value={newForm.applicantPhone}
                      onChange={(e) => setNewForm({ ...newForm, applicantPhone: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Mandal</label>
                    <select
                      value={newForm.mandalName}
                      onChange={(e) => setNewForm({ ...newForm, mandalName: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      {metadata?.mandals.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Village</label>
                    <input
                      type="text"
                      placeholder="e.g. Bittupalli"
                      value={newForm.villageName}
                      onChange={(e) => setNewForm({ ...newForm, villageName: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Referring Leader & Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Local Leader */}
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200">
                  <label className="block text-xs font-bold text-indigo-950 uppercase tracking-wide mb-1">
                    2. Referring Local Leader (If any)
                  </label>
                  <select
                    value={newForm.referredByLeaderId}
                    onChange={(e) => setNewForm({ ...newForm, referredByLeaderId: e.target.value })}
                    className="w-full p-2 bg-white border border-indigo-300 rounded-lg text-xs"
                  >
                    <option value="">Direct Citizen Intake (No leader)</option>
                    {metadata?.leaders.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.designation} - {l.villageName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Department */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    3. Assign Department
                  </label>
                  <select
                    value={newForm.assignedDepartment}
                    onChange={(e) => setNewForm({ ...newForm, assignedDepartment: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    {metadata?.departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category specifics */}
              {newForm.type === "CMRF_MEDICAL" && (
                <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-rose-900 mb-1">Hospital Name</label>
                    <input
                      type="text"
                      placeholder="e.g. NIMS Hyderabad"
                      value={newForm.hospitalName}
                      onChange={(e) => setNewForm({ ...newForm, hospitalName: e.target.value })}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-rose-900 mb-1">Medical Condition</label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiac Surgery"
                      value={newForm.medicalCondition}
                      onChange={(e) => setNewForm({ ...newForm, medicalCondition: e.target.value })}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-rose-900 mb-1">Requested Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 200000"
                      value={newForm.requestedAmount}
                      onChange={(e) => setNewForm({ ...newForm, requestedAmount: e.target.value })}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Private Notes */}
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  Confidential Minister & PA Notes (Private)
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal notes visible only to Minister and PA..."
                  value={newForm.privateNotes}
                  onChange={(e) => setNewForm({ ...newForm, privateNotes: e.target.value })}
                  className="w-full p-2 bg-amber-50/70 border border-amber-300 rounded-lg text-xs"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg text-xs shadow-md transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingAction ? "Submitting..." : "Submit Petition & Begin Tracking"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
