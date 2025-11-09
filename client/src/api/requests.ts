import api from './axios';
import { User } from './auth';
import { Equipment } from './equipment';

export interface Request {
  _id: string;
  requester: User;
  equipment: Equipment;
  quantity: number;
  requestDate: string;
  requestedStartDate: string;
  requestedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'borrowed' | 'returned' | 'overdue';
  purpose: string;
  notes?: string;
  approvedBy?: User;
  approvalDate?: string;
  rejectionReason?: string;
  returnNotes?: string;
  damageReported: boolean;
  damageDescription?: string;
  penalty: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestData {
  equipmentId: string;
  quantity: number;
  requestedStartDate: string;
  requestedEndDate: string;
  purpose: string;
  notes?: string;
}

export const requestAPI = {
  // Get all requests (filtered by role)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    equipmentId?: string;
    requesterId?: string;
  }) => {
    const response = await api.get('/requests', { params });
    return response.data;
  },

  // Get request by ID
  getById: async (id: string) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  // Create new request
  create: async (requestData: CreateRequestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  // Approve request (staff/admin)
  approve: async (id: string, notes?: string) => {
    const response = await api.put(`/requests/${id}/approve`, { notes });
    return response.data;
  },

  // Reject request (staff/admin)
  reject: async (id: string, rejectionReason: string) => {
    const response = await api.put(`/requests/${id}/reject`, { rejectionReason });
    return response.data;
  },

  // Mark as borrowed (staff/admin)
  markAsBorrowed: async (id: string, actualStartDate?: string, notes?: string) => {
    const response = await api.put(`/requests/${id}/borrowed`, { actualStartDate, notes });
    return response.data;
  },

  // Mark as returned (staff/admin)
  markAsReturned: async (id: string, data: {
    actualEndDate?: string;
    returnNotes?: string;
    damageReported?: boolean;
    damageDescription?: string;
    penalty?: number;
  }) => {
    const response = await api.put(`/requests/${id}/returned`, data);
    return response.data;
  },

  // Get request statistics (staff/admin)
  getStats: async () => {
    const response = await api.get('/requests/stats');
    return response.data;
  },
};