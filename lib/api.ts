import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Mock data for when API is not available
const mockDashboardStats = {
  totalRequests: 1247,
  pendingRequests: 89,
  resolvedRequests: 1158,
  avgResolutionTime: 3.2,
  monthlyGrowth: 12.5,
  satisfactionRate: 94.2,
}

const mockRecentRequests = [
  {
    id: "1",
    title: "Road Repair Request",
    status: "pending",
    priority: "high",
    createdAt: "2024-01-15T10:30:00Z",
    citizen: "Rajesh Kumar",
    category: "Infrastructure",
  },
  {
    id: "2",
    title: "Water Supply Issue",
    status: "in_progress",
    priority: "medium",
    createdAt: "2024-01-14T14:20:00Z",
    citizen: "Priya Sharma",
    category: "Utilities",
  },
  {
    id: "3",
    title: "Street Light Maintenance",
    status: "resolved",
    priority: "low",
    createdAt: "2024-01-13T09:15:00Z",
    citizen: "Amit Patel",
    category: "Infrastructure",
  },
]

const mockTrends = [
  { month: "Jan", requests: 120, resolved: 115 },
  { month: "Feb", requests: 135, resolved: 128 },
  { month: "Mar", requests: 148, resolved: 142 },
  { month: "Apr", requests: 162, resolved: 155 },
  { month: "May", requests: 178, resolved: 170 },
  { month: "Jun", requests: 195, resolved: 188 },
]

const mockCategoryDistribution = [
  { name: "Infrastructure", value: 35, count: 437 },
  { name: "Utilities", value: 25, count: 312 },
  { name: "Healthcare", value: 20, count: 249 },
  { name: "Education", value: 12, count: 150 },
  { name: "Others", value: 8, count: 99 },
]

const mockRequests = [
  {
    id: "1",
    title: "Road Repair on Main Street",
    description: "Large potholes causing traffic issues",
    status: "pending",
    priority: "high",
    type: "infrastructure",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    citizen: {
      name: "Rajesh Kumar",
      phone: "+91 9876543210",
      email: "rajesh@example.com",
    },
    category: "Infrastructure",
    location: "Main Street, Hyderabad",
    assignedTo: null,
  },
  {
    id: "2",
    title: "Water Supply Disruption",
    description: "No water supply for 3 days in our area",
    status: "in_progress",
    priority: "high",
    type: "utilities",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
    citizen: {
      name: "Priya Sharma",
      phone: "+91 9876543211",
      email: "priya@example.com",
    },
    category: "Utilities",
    location: "Sector 12, Hyderabad",
    assignedTo: "Field Officer 1",
  },
]

const mockUsers = [
  {
    id: "1",
    name: "Minister Rama Rao",
    email: "minister@telangana.gov.in",
    role: "minister",
    phone: "+91 9876543200",
    status: "active",
  },
  {
    id: "2",
    name: "PA Srinivas",
    email: "pa@telangana.gov.in",
    role: "pa",
    phone: "+91 9876543201",
    status: "active",
  },
  {
    id: "3",
    name: "Field Officer Ravi",
    email: "field1@telangana.gov.in",
    role: "field_officer",
    phone: "+91 9876543202",
    status: "active",
  },
]

const mockWhatsAppMessages = [
  {
    id: "1",
    from: "+919876543210",
    message: "Road repair needed on Main Street",
    timestamp: "2024-01-15T10:30:00Z",
    status: "pending",
    parsed: false,
  },
  {
    id: "2",
    from: "+919876543211",
    message: "Water supply issue in Sector 12",
    timestamp: "2024-01-14T14:20:00Z",
    status: "pending",
    parsed: false,
  },
]

// API functions with fallbacks
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await api.get("/api/dashboard/stats")
      return response.data
    } catch (error) {
      console.warn("API not available, using mock data")
      return mockDashboardStats
    }
  },

  getRecentRequests: async () => {
    try {
      const response = await api.get("/api/dashboard/recent-requests")
      return response.data
    } catch (error) {
      console.warn("API not available, using mock data")
      return mockRecentRequests
    }
  },

  getTrends: async () => {
    try {
      const response = await api.get("/api/dashboard/trends")
      return response.data
    } catch (error) {
      console.warn("API not available, using mock data")
      return mockTrends
    }
  },

  getCategoryDistribution: async () => {
    try {
      const response = await api.get("/api/dashboard/category-distribution")
      return response.data
    } catch (error) {
      console.warn("API not available, using mock data")
      return mockCategoryDistribution
    }
  },
}

export const requestsAPI = {
  getAll: async (filters?: any) => {
    try {
      const response = await api.get("/api/grievances", { params: filters })
      return response.data
    } catch (error) {
      console.warn("API not available, using mock data")
      return { grievances: mockRequests, pagination: { page: 1, limit: 20, total: mockRequests.length, pages: 1 } }
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/api/grievances/${id}`)
      return response.data
    } catch (error) {
      console.warn("API not available, using mock data")
      return mockRequests.find((r) => r.id === id)
    }
  },

  create: async (data: any) => {
    try {
      const response = await api.post("/api/grievances", data)
      return response.data
    } catch (error) {
      console.warn("API not available, returning mock response")
      return { id: Date.now().toString(), ...data, status: "pending" }
    }
  },

  update: async (id: string, data: any) => {
    try {
      const response = await api.put(`/api/grievances/${id}`, data)
      return response.data
    } catch (error) {
      console.warn("API not available, returning mock response")
      return { id, ...data }
    }
  },

  assign: async (id: string, assigneeId: string) => {
    try {
      const response = await api.post(`/api/requests/${id}/assign`, { assigneeId })
      return response.data
    } catch (error) {
      console.warn("API not available, returning mock response")
      return { success: true }
    }
  },
}

export const whatsappAPI = {
  getPending: async () => {
    try {
      const response = await api.get("/api/whatsapp/pending")
      return response.data
    } catch (error) {
      console.warn("API not available, using mock data")
      return mockWhatsAppMessages
    }
  },

  approveMessage: async ({ id, data }: { id: string; data: any }) => {
    try {
      const response = await api.post(`/api/whatsapp/${id}/approve`, data)
      return response.data
    } catch (error) {
      console.warn("API not available, returning mock response")
      return { success: true }
    }
  },
}

export const usersAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/api/users")
      return response.data
    } catch (error) {
      console.warn("API not available, using mock data")
      return mockUsers
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/api/users/${id}`)
      return response.data
    } catch (error) {
      console.warn("API not available, using mock data")
      return mockUsers.find((u) => u.id === id)
    }
  },
}

export default api
