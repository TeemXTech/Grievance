export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
  };
}

export interface WhatsAppMessage {
  id: number;
  phone: string;
  raw_text: string;
  created_at: string;
}

export interface GrievanceRequest {
  id: string;
  title: string;
  description: string;
  requester_name: string;
  requester_phone: string;
  requester_address: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
  assigned_to?: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  criticalRequests: number;
  resolvedRequests: number;
}
