import axios from "axios"

// Use environment variable or fallback to mock API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        window.location.href = "/auth/login"
      }
    }
    return Promise.reject(error)
  },
)

// Mock data for demo purposes
const mockData = {
  dashboardStats: {
    totalRequests: 1247,
    pendingRequests: 89,
    resolvedRequests: 1158,
    avgResolutionTime: 3.2,
    monthlyGrowth: 12.5,
    satisfactionRate: 94.2,
  },
  recentRequests: [
    {
      id: "1",
      title: "Road Repair Request",
      status: "pending",
      priority: "high",
      createdAt: "2024-01-15T10:30:00Z",
      assignedTo: "Field Officer A",
      category: "Infrastructure",
    },
    {
      id: "2",
      title: "Water Supply Issue",
      status: "in_progress",
      priority: "medium",
      createdAt: "2024-01-14T14:20:00Z",
      assignedTo: "Field Officer B",
      category: "Utilities",
    },
    {
      id: "3",
      title: "Street Light Maintenance",
      status: "resolved",
      priority: "low",
      createdAt: "2024-01-13T09:15:00Z",
      assignedTo: "Field Officer C",
      category: "Infrastructure",
    },
  ],
  trends: [
    { month: "Jan", requests: 120, resolved: 115 },
    { month: "Feb", requests: 135, resolved: 128 },
    { month: "Mar", requests: 148, resolved: 142 },
    { month: "Apr", requests: 162, resolved: 155 },
    { month: "May", requests: 178, resolved: 170 },
    { month: "Jun", requests: 195, resolved: 188 },
  ],
  categoryDistribution: [
    { name: "Infrastructure", value: 35, count: 437 },
    { name: "Utilities", value: 25, count: 312 },
    { name: "Healthcare", value: 20, count: 249 },
    { name: "Education", value: 12, count: 150 },
    { name: "Others", value: 8, count: 99 },
  ],
  users: [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "field_officer",
      status: "active",
      lastLogin: "2024-01-15T08:30:00Z",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "pa",
      status: "active",
      lastLogin: "2024-01-15T09:15:00Z",
    },
  ],
  whatsappMessages: [
    {
      id: "1",
      from: "+919876543210",
      message: "Road repair needed at Main Street",
      timestamp: "2024-01-15T10:30:00Z",
      status: "pending",
      parsed: false,
    },
    {
      id: "2",
      from: "+919876543211",
      message: "Water supply issue in Block A",
      timestamp: "2024-01-15T11:00:00Z",
      status: "pending",
      parsed: false,
    },
  ],
}

// API functions with mock fallback
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await api.get("/dashboard/stats")
      return response.data
    } catch (error) {
      console.warn("Using mock data for dashboard stats")
      return mockData.dashboardStats
    }
  },

  getRecentRequests: async () => {
    try {
      const response = await api.get("/dashboard/recent-requests")
      return response.data
    } catch (error) {
      console.warn("Using mock data for recent requests")
      return mockData.recentRequests
    }
  },

  getTrends: async () => {
    try {
      const response = await api.get("/dashboard/trends")
      return response.data
    } catch (error) {
      console.warn("Using mock data for trends")
      return mockData.trends
    }
  },

  getCategoryDistribution: async () => {
    try {
      const response = await api.get("/dashboard/category-distribution")
      return response.data
    } catch (error) {
      console.warn("Using mock data for category distribution")
      return mockData.categoryDistribution
    }
  },
}

export const requestsAPI = {
  getAll: async (filters?: any) => {
    try {
      const response = await api.get("/requests", { params: filters })
      return response.data
    } catch (error) {
      console.warn("Using mock data for requests")
      return mockData.recentRequests
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/requests/${id}`)
      return response.data
    } catch (error) {
      console.warn("Using mock data for request")
      return mockData.recentRequests.find((r) => r.id === id)
    }
  },

  create: async (data: any) => {
    try {
      const response = await api.post("/requests", data)
      return response.data
    } catch (error) {
      console.warn("Mock request creation")
      return { id: Date.now().toString(), ...data, status: "pending" }
    }
  },

  update: async (id: string, data: any) => {
    try {
      const response = await api.put(`/requests/${id}`, data)
      return response.data
    } catch (error) {
      console.warn("Mock request update")
      return { id, ...data }
    }
  },

  assign: async (id: string, assigneeId: string) => {
    try {
      const response = await api.post(`/requests/${id}/assign`, { assigneeId })
      return response.data
    } catch (error) {
      console.warn("Mock request assignment")
      return { success: true }
    }
  },
}

export const whatsappAPI = {
  getPendingMessages: async () => {
    try {
      const response = await api.get("/whatsapp/pending")
      return response.data
    } catch (error) {
      console.warn("Using mock data for WhatsApp messages")
      return mockData.whatsappMessages
    }
  },

  approveMessage: async (id: string) => {
    try {
      const response = await api.post(`/whatsapp/${id}/approve`)
      return response.data
    } catch (error) {
      console.warn("Mock WhatsApp message approval")
      return { success: true }
    }
  },

  parseMessage: async (id: string) => {
    try {
      const response = await api.post(`/whatsapp/${id}/parse`)
      return response.data
    } catch (error) {
      console.warn("Mock WhatsApp message parsing")
      return {
        success: true,
        parsed: {
          category: "Infrastructure",
          priority: "medium",
          description: "Parsed from WhatsApp message",
        },
      }
    }
  },
}

export const usersAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/users")
      return response.data
    } catch (error) {
      console.warn("Using mock data for users")
      return mockData.users
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch (error) {
      console.warn("Using mock data for user")
      return mockData.users.find((u) => u.id === id)
    }
  },

  create: async (data: any) => {
    try {
      const response = await api.post("/users", data)
      return response.data
    } catch (error) {
      console.warn("Mock user creation")
      return { id: Date.now().toString(), ...data }
    }
  },

  update: async (id: string, data: any) => {
    try {
      const response = await api.put(`/users/${id}`, data)
      return response.data
    } catch (error) {
      console.warn("Mock user update")
      return { id, ...data }
    }
  },
}

export default api
