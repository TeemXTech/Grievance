import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dashboardAPI, requestsAPI, whatsappAPI, usersAPI } from "../lib/api"

// Dashboard hooks
export const useDashboardStats = (options?: any) => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardAPI.getStats,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
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
export const useRequests = (filters?: any, options?: any) => {
  return useQuery({
    queryKey: ["requests", filters],
    queryFn: () => requestsAPI.getAll(filters),
    refetchOnWindowFocus: true,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useAssignRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) => requestsAPI.assign(id, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

// WhatsApp hooks
export const usePendingWhatsAppMessages = (options?: any) => {
  return useQuery({
    queryKey: ["whatsapp", "pending"],
    queryFn: whatsappAPI.getPending,
    refetchOnWindowFocus: true,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options
  })
}

export const useApproveWhatsAppMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: whatsappAPI.approveMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp"] })
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

// Users hooks
export const useUsers = (options?: any) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersAPI.getAll,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => usersAPI.getById(id),
    enabled: !!id,
  })
}
