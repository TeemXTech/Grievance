"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  MapPin,
  User,
  Phone,
  HardHat,
  DollarSign,
  TrendingUp,
  History,
  Send,
  X,
  RefreshCw,
  ChevronRight,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  Calendar,
} from "lucide-react"

interface Milestone {
  id: string
  stage: string
  percentageDone: number
  updateNote: string
  updatedByName: string
  updatedByRole: string
  createdAt: string
}

interface PublicWork {
  id: string
  workCode: string
  title: string
  description?: string
  category: string
  stage: string
  district: string
  mandalName?: string
  villageName?: string
  wardNumber?: string
  estimatedBudget?: number
  sanctionedBudget?: number
  spentBudget?: number
  requestedByLeaderName?: string
  supervisingOfficial?: string
  executingDepartment?: string
  contractorName?: string
  contractorPhone?: string
  privateNotes?: string
  stuckReason?: string
  createdAt: string
  requestedByLeader?: {
    id: string
    name: string
    phone: string
    designation: string
    villageName?: string
  }
  milestones?: Milestone[]
}

interface Metadata {
  leaders: Array<{ id: string; name: string; designation: string; villageName: string }>
  mandals: Array<{ id: string; name: string }>
  departments: string[]
}

export default function PublicWorksTrackerPage() {
  const router = useRouter()

  const [works, setWorks] = useState<PublicWork[]>([])
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>({
    total: 0,
    completed: 0,
    inProgress: 0,
    stuck: 0,
    totalSanctionedBudget: 0,
    totalSpentBudget: 0,
  })

  // Filters
  const [search, setSearch] = useState("")
  const [selectedStage, setSelectedStage] = useState("ALL")
  const [selectedCategory, setSelectedCategory] = useState("ALL")

  // Modals
  const [activeWork, setActiveWork] = useState<PublicWork | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Progress Update Form
  const [updateForm, setUpdateForm] = useState({
    stage: "",
    percentageDone: 50,
    spentBudget: "",
    milestoneNote: "",
    contractorName: "",
    contractorPhone: "",
    stuckReason: "",
    privateNotes: "",
  })

  // Add Work Form
  const [newWorkForm, setNewWorkForm] = useState({
    title: "",
    description: "",
    category: "ROADS_BRIDGES",
    stage: "IN_PROGRESS",
    mandalName: "Manthanani",
    villageName: "Bittupalli",
    estimatedBudget: "",
    sanctionedBudget: "",
    requestedByLeaderId: "",
    supervisingOfficial: "EE Ramana (Panchayat Raj)",
    executingDepartment: "Panchayat Raj Engineering Department",
    contractorName: "",
    contractorPhone: "",
    privateNotes: "",
  })

  // Fetch live public works from database
  const fetchWorks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedStage !== "ALL") params.append("stage", selectedStage)
      if (selectedCategory !== "ALL") params.append("category", selectedCategory)
      if (search.trim()) params.append("search", search.trim())

      const res = await fetch(`/api/minister/projects?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setWorks(data.works)
        setSummary(data.summary)
      }
    } catch (err) {
      console.error("Failed to load public works:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch dropdown metadata
  const fetchMetadata = async () => {
    try {
      const res = await fetch("/api/pa/metadata")
      const data = await res.json()
      if (data.success) {
        setMetadata(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchMetadata()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorks()
    }, 200)
    return () => clearTimeout(timer)
  }, [selectedStage, selectedCategory, search])

  // Select work for inspection & prep update form
  const handleSelectWork = (work: PublicWork) => {
    setActiveWork(work)
    const latestMilestone = work.milestones && work.milestones.length > 0 ? work.milestones[0] : null
    setUpdateForm({
      stage: work.stage,
      percentageDone: latestMilestone ? latestMilestone.percentageDone : (work.stage === "COMPLETED" ? 100 : 50),
      spentBudget: work.spentBudget ? String(work.spentBudget) : "",
      milestoneNote: "",
      contractorName: work.contractorName || "",
      contractorPhone: work.contractorPhone || "",
      stuckReason: work.stuckReason || "",
      privateNotes: work.privateNotes || "",
    })
  }

  // Save progress / milestone update
  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWork) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/minister/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeWork.id,
          stage: updateForm.stage,
          percentageDone: updateForm.percentageDone,
          spentBudget: updateForm.spentBudget ? parseFloat(updateForm.spentBudget) : undefined,
          contractorName: updateForm.contractorName,
          contractorPhone: updateForm.contractorPhone,
          stuckReason: updateForm.stuckReason,
          privateNotes: updateForm.privateNotes,
          milestoneNote: updateForm.milestoneNote || `Updated progress to ${updateForm.percentageDone}% (${updateForm.stage})`,
          updatedByName: "PA Srinivas",
          updatedByRole: "PA",
        }),
      })

      const data = await res.json()
      if (data.success) {
        setActiveWork(data.work)
        fetchWorks()
        setUpdateForm((prev) => ({ ...prev, milestoneNote: "" }))
      } else {
        alert("Error: " + data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to save update.")
    } finally {
      setSubmitting(false)
    }
  }

  // Create new public work
  const handleCreateWork = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const leader = metadata?.leaders.find((l) => l.id === newWorkForm.requestedByLeaderId)
      const payload = {
        ...newWorkForm,
        requestedByLeaderName: leader ? leader.name : undefined,
      }

      const res = await fetch("/api/minister/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        setShowAddModal(false)
        fetchWorks()
        // Reset form
        setNewWorkForm({
          title: "",
          description: "",
          category: "ROADS_BRIDGES",
          stage: "IN_PROGRESS",
          mandalName: "Manthanani",
          villageName: "Bittupalli",
          estimatedBudget: "",
          sanctionedBudget: "",
          requestedByLeaderId: "",
          supervisingOfficial: "EE Ramana (Panchayat Raj)",
          executingDepartment: "Panchayat Raj Engineering Department",
          contractorName: "",
          contractorPhone: "",
          privateNotes: "",
        })
      } else {
        alert("Error: " + data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to create work.")
    } finally {
      setSubmitting(false)
    }
  }

  // Category badge helper
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "ROADS_BRIDGES":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">🛣️ Roads & Bridges</span>
      case "DRINKING_WATER":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-900 border border-cyan-200">💧 Drinking Water</span>
      case "EDUCATION_SCHOOLS":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">🏫 Schools & Edu</span>
      case "HEALTH_CLINICS":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-200">🏥 Health Centers</span>
      case "COMMUNITY_HALL":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-200">🏛️ Community Hall</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">🏗️ Public Work</span>
    }
  }

  // Stage badge helper
  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "COMPLETED":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> COMPLETED (100%)</span>
      case "IN_PROGRESS":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300"><TrendingUp className="w-3.5 h-3.5 mr-1" /> IN PROGRESS</span>
      case "STUCK_DELAYED":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse shadow-sm"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> STUCK / DELAYED</span>
      case "SANCTIONED":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200"><DollarSign className="w-3.5 h-3.5 mr-1" /> SANCTIONED</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{stage}</span>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Universal Government Top Navigation Bar */}
      <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <span className="text-xl">🏗️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Public Works & Projects Tracker</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 uppercase">
                  Constituency Works
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Manthanani Constituency Development Works • Live Budget & Milestones
              </p>
            </div>
          </div>

          {/* Quick Navigation Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/pa/dashboard")}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition-all font-medium flex items-center gap-1"
            >
              <span>💼 PA Command</span>
            </button>
            <button
              onClick={() => router.push("/minister/dashboard")}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition-all font-medium flex items-center gap-1"
            >
              <span>🏛️ Minister Memory</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Public Work</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Summary Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total Works */}
          <div
            onClick={() => setSelectedStage("ALL")}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedStage === "ALL"
                ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Works</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.total || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">All categories</p>
          </div>

          {/* In Progress */}
          <div
            onClick={() => setSelectedStage("IN_PROGRESS")}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedStage === "IN_PROGRESS"
                ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wider flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> In Progress
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.inProgress || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Active site works</p>
          </div>

          {/* Stuck / Delayed Warning */}
          <div
            onClick={() => setSelectedStage("STUCK_DELAYED")}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedStage === "STUCK_DELAYED"
                ? "bg-red-50 border-red-500 ring-2 ring-red-500/20 shadow-md"
                : summary.stuck > 0
                ? "bg-red-50/70 border-red-300 hover:border-red-400 shadow-sm"
                : "bg-white border-slate-200"
            }`}
          >
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 animate-bounce text-red-600" /> Stuck / Delayed
            </p>
            <p className="text-2xl font-black text-red-700 mt-1">{summary.stuck || 0}</p>
            <p className="text-[11px] font-semibold text-red-600 mt-1">Needs review</p>
          </div>

          {/* Completed Works */}
          <div
            onClick={() => setSelectedStage("COMPLETED")}
            className={`cursor-pointer rounded-xl p-4 border transition-all ${
              selectedStage === "COMPLETED"
                ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
            </p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{summary.completed || 0}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">100% delivered</p>
          </div>

          {/* Sanctioned Budget */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-purple-700 uppercase tracking-wider flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1" /> Sanctioned Budget
            </p>
            <p className="text-xl font-bold text-purple-900 mt-1">
              ₹{((summary.totalSanctionedBudget || 0) / 100000).toFixed(1)} Lakhs
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Government sanctioned</p>
          </div>

          {/* Spent Budget */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wider flex items-center">
              <HardHat className="w-3.5 h-3.5 mr-1" /> Budget Spent
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ₹{((summary.totalSpentBudget || 0) / 100000).toFixed(1)} Lakhs
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Actual bill payments</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search work title, village, leader, contractor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Category Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs text-slate-500 font-medium">Category:</span>
              {[
                { id: "ALL", label: "All Works" },
                { id: "ROADS_BRIDGES", label: "Roads & Bridges" },
                { id: "DRINKING_WATER", label: "Water Supply" },
                { id: "EDUCATION_SCHOOLS", label: "Schools" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === c.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c.label}
                </button>
              ))}

              <button
                onClick={fetchWorks}
                title="Refresh List"
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 ml-1"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Public Works List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Constituency Public Works ({works.length})
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              Click any project to update progress percentage, milestones, and contractor details
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm font-medium">Loading works from database...</p>
            </div>
          ) : works.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-base font-semibold text-slate-700">No public works found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or click "+ Add Public Work" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Work Code & Title</th>
                    <th className="py-3 px-4">Village / Mandal</th>
                    <th className="py-3 px-4">Requested By Leader</th>
                    <th className="py-3 px-4">Sanctioned & Spent</th>
                    <th className="py-3 px-4">Progress / Stage</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {works.map((w) => {
                    const latestMilestone = w.milestones && w.milestones.length > 0 ? w.milestones[0] : null
                    const percent = latestMilestone ? latestMilestone.percentageDone : (w.stage === "COMPLETED" ? 100 : 0)

                    return (
                      <tr
                        key={w.id}
                        onClick={() => handleSelectWork(w)}
                        className={`cursor-pointer transition-colors hover:bg-blue-50/60 ${
                          w.stage === "STUCK_DELAYED" ? "bg-red-50/40" : ""
                        }`}
                      >
                        {/* Work Code & Title */}
                        <td className="py-3.5 px-4 font-medium">
                          <div className="space-y-1">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                              {w.workCode}
                            </span>
                            <p className="font-semibold text-slate-900 line-clamp-1">{w.title}</p>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              {getCategoryBadge(w.category)}
                              {w.contractorName && (
                                <span className="text-[11px] text-slate-500">
                                  🏗️ {w.contractorName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 text-slate-700">
                          <p className="font-medium text-slate-900">{w.villageName || "Manthanani"}</p>
                          <p className="text-xs text-slate-500">{w.mandalName || "Manthanani Mandal"}</p>
                        </td>

                        {/* Leader */}
                        <td className="py-3.5 px-4">
                          {w.requestedByLeaderName ? (
                            <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200">
                              <span className="mr-1">⭐</span>
                              <span>{w.requestedByLeaderName}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">General Proposal</span>
                          )}
                        </td>

                        {/* Financials */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">
                            ₹{((w.sanctionedBudget || 0) / 100000).toFixed(1)}L <span className="text-xs font-normal text-slate-500">Sanctioned</span>
                          </p>
                          <p className="text-xs text-slate-600">
                            Spent: ₹{((w.spentBudget || 0) / 100000).toFixed(1)}L
                          </p>
                        </td>

                        {/* Progress bar & Stage */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="space-y-1.5">
                            <div>{getStageBadge(w.stage)}</div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  w.stage === "COMPLETED"
                                    ? "bg-emerald-500"
                                    : w.stage === "STUCK_DELAYED"
                                    ? "bg-red-500"
                                    : "bg-blue-600"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                              <span>{percent}% Complete</span>
                              {w.stuckReason && <span className="text-red-600 font-bold">Stuck</span>}
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectWork(w)
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1"
                          >
                            <span>Manage</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================
          MODAL 1: WORK DETAILS, MILESTONES & UPDATE PROGRESS
      ======================================================== */}
      {activeWork && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80 rounded-t-2xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
                    {activeWork.workCode}
                  </span>
                  {getCategoryBadge(activeWork.category)}
                  {getStageBadge(activeWork.stage)}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{activeWork.title}</h3>
                <p className="text-xs text-slate-500">
                  {activeWork.villageName}, {activeWork.mandalName} Mandal
                </p>
              </div>

              <button onClick={() => setActiveWork(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Stuck alert if any */}
              {activeWork.stage === "STUCK_DELAYED" && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900 text-sm">Project Delay Warning</p>
                    <p className="text-xs text-red-700 font-medium">
                      Reason: {activeWork.stuckReason || "Work paused on site. Review contractor & department notice."}
                    </p>
                  </div>
                </div>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Leader */}
                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200">
                  <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide">⭐ Championed By Leader</p>
                  <p className="font-bold text-indigo-950 text-sm mt-1">{activeWork.requestedByLeaderName || "General Work"}</p>
                  {activeWork.requestedByLeader?.designation && (
                    <p className="text-xs text-indigo-800">{activeWork.requestedByLeader.designation}</p>
                  )}
                  {activeWork.requestedByLeader?.phone && (
                    <p className="text-xs text-indigo-700 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {activeWork.requestedByLeader.phone}
                    </p>
                  )}
                </div>

                {/* 2. Financials */}
                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                  <p className="text-[11px] font-bold text-purple-900 uppercase tracking-wide">💰 Budget & Spending</p>
                  <p className="font-bold text-purple-950 text-sm mt-1">
                    Sanctioned: ₹{((activeWork.sanctionedBudget || 0) / 100000).toFixed(1)}L
                  </p>
                  <p className="text-xs text-purple-800 font-medium">
                    Spent: ₹{((activeWork.spentBudget || 0) / 100000).toFixed(1)}L
                  </p>
                </div>

                {/* 3. Contractor */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">🏗️ Executing Team</p>
                  <p className="font-semibold text-slate-900 text-sm mt-1">{activeWork.contractorName || "Contractor TBD"}</p>
                  <p className="text-xs text-slate-600">{activeWork.executingDepartment || "PR Department"}</p>
                  {activeWork.contractorPhone && (
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {activeWork.contractorPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Private Notes */}
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-300 space-y-1">
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  Confidential Minister & PA Notes (Private)
                </p>
                <p className="text-xs text-amber-950 font-medium italic">
                  "{activeWork.privateNotes || "No confidential notes entered."}"
                </p>
              </div>

              {/* Milestones History */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-600" />
                  Milestone Progress History ({activeWork.milestones?.length || 0})
                </h4>

                <div className="space-y-2">
                  {activeWork.milestones && activeWork.milestones.length > 0 ? (
                    activeWork.milestones.map((m, idx) => (
                      <div key={m.id || idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {m.percentageDone}%
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">{m.updateNote}</p>
                            <span className="text-[10px] text-slate-500">
                              {new Date(m.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Logged by <span className="font-medium text-slate-700">{m.updatedByName}</span> ({m.updatedByRole})
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-1">No progress milestones recorded yet.</p>
                  )}
                </div>
              </div>

              {/* ⚡ Update Progress Form */}
              <form onSubmit={handleSaveProgress} className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-blue-950 text-sm">Update Work Progress & Milestones</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Stage</label>
                    <select
                      value={updateForm.stage}
                      onChange={(e) => setUpdateForm({ ...updateForm, stage: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    >
                      <option value="PLANNED">PLANNED</option>
                      <option value="SANCTIONED">SANCTIONED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED (100%)</option>
                      <option value="STUCK_DELAYED">STUCK / DELAYED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Progress ({updateForm.percentageDone}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={updateForm.percentageDone}
                      onChange={(e) => setUpdateForm({ ...updateForm, percentageDone: parseInt(e.target.value) })}
                      className="w-full mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Spent Budget (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2800000"
                      value={updateForm.spentBudget}
                      onChange={(e) => setUpdateForm({ ...updateForm, spentBudget: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Completed second layer gravel; bitumen laying starts next Monday"
                    value={updateForm.milestoneNote}
                    onChange={(e) => setUpdateForm({ ...updateForm, milestoneNote: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                {updateForm.stage === "STUCK_DELAYED" && (
                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1">Reason for Delay</label>
                    <input
                      type="text"
                      placeholder="e.g. Forest department NOC pending / Contractor defaulted"
                      value={updateForm.stuckReason}
                      onChange={(e) => setUpdateForm({ ...updateForm, stuckReason: e.target.value })}
                      className="w-full p-2 bg-red-50 border border-red-300 rounded-lg text-xs text-red-900"
                    />
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Saving..." : "Save Milestone & Progress"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: + ADD PUBLIC WORK FORM
      ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Add New Public Work</h3>
                <p className="text-xs text-slate-500">Record a new infrastructure or constituency development project</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWork} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Title / Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laying of BT Road from Main Road to Harijanawada"
                  value={newWorkForm.title}
                  onChange={(e) => setNewWorkForm({ ...newWorkForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newWorkForm.category}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, category: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="ROADS_BRIDGES">Roads & Bridges</option>
                    <option value="DRINKING_WATER">Drinking Water Tank / Pipeline</option>
                    <option value="EDUCATION_SCHOOLS">School / Digital Lab</option>
                    <option value="HEALTH_CLINICS">Primary Health Center</option>
                    <option value="COMMUNITY_HALL">Community Hall / Vaikunta Dhamam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Stage</label>
                  <select
                    value={newWorkForm.stage}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, stage: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="SANCTIONED">Sanctioned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mandal</label>
                  <select
                    value={newWorkForm.mandalName}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, mandalName: e.target.value })}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bittupalli"
                    value={newWorkForm.villageName}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, villageName: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sanctioned Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 4500000"
                    value={newWorkForm.sanctionedBudget}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, sanctionedBudget: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Referring Local Leader</label>
                  <select
                    value={newWorkForm.requestedByLeaderId}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, requestedByLeaderId: e.target.value })}
                    className="w-full p-2 bg-white border border-indigo-300 rounded-lg text-xs"
                  >
                    <option value="">None / General Proposal</option>
                    {metadata?.leaders.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.designation} - {l.villageName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contractor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sri Sai Infra"
                    value={newWorkForm.contractorName}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, contractorName: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contractor Phone</label>
                  <input
                    type="text"
                    placeholder="+91-9440123456"
                    value={newWorkForm.contractorPhone}
                    onChange={(e) => setNewWorkForm({ ...newWorkForm, contractorPhone: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  Confidential Private Notes (Minister & PA)
                </label>
                <textarea
                  rows={2}
                  placeholder="Confidential remarks..."
                  value={newWorkForm.privateNotes}
                  onChange={(e) => setNewWorkForm({ ...newWorkForm, privateNotes: e.target.value })}
                  className="w-full p-2 bg-amber-50/70 border border-amber-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg text-xs shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Saving..." : "Save Public Work"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
