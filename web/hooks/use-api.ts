import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dashboardAPI, requestsAPI, whatsappAPI, usersAPI } from "@/lib/api"

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardAPI.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useRecentRequests = () => {
  return useQuery({
    queryKey: ["dashboard", "recent-requests"],
    queryFn: dashboardAPI.getRecentRequests,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useTrends = () => {
  return useQuery({
    queryKey: ["dashboard", "trends"],
    queryFn: dashboardAPI.getTrends,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useCategoryDistribution = () => {
  return useQuery({
    queryKey: ["dashboard", "category-distribution"],
    queryFn: dashboardAPI.getCategoryDistribution,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Requests hooks
export const useRequests = (filters?: any) => {
  return useQuery({
    queryKey: ["requests", filters],
    queryFn: () => requestsAPI.getAll(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useRequest = (id: string) => {
  return useQuery({
    queryKey: ["requests", id],
    queryFn: () => requestsAPI.getById(id),
    enabled: !!id,
  })
}

export const useCreateRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: requestsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useUpdateRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => requestsAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["requests", id] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useAssignRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) => requestsAPI.assign(id, assigneeId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["requests", id] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

// WhatsApp hooks
export const usePendingWhatsAppMessages = () => {
  return useQuery({
    queryKey: ["whatsapp", "pending"],
    queryFn: whatsappAPI.getPendingMessages,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

export const useApproveWhatsAppMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: whatsappAPI.approveMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "pending"] })
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useParseWhatsAppMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: whatsappAPI.parseMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "pending"] })
    },
  })
}

// Users hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersAPI.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => usersAPI.getById(id),
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["users", id] })
    },
  })
}
