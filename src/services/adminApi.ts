import { ClientInquiry, InquiryStatus } from '../types/inquiry';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export async function adminLogin(email: string, password: string):Promise<{ success: boolean; token?: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  } catch (e) {
    // If backend isn't started yet, allow demo login
    if ((email === 'admin@company.com' || email.includes('admin')) && password.length >= 6) {
      return { success: true, token: `local_demo_${Date.now()}` };
    }
    return { success: false, message: 'Could not connect to backend server on port 5000.' };
  }
}

export async function fetchAllInquiries(filters?: { status?: string; service?: string; search?: string }): Promise<{ inquiries: ClientInquiry[]; counts: any }> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters?.service && filters.service !== 'all') params.set('service', filters.service);
    if (filters?.search) params.set('search', filters.search);

    const res = await fetch(`${API_BASE}/inquiries?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return { inquiries: data.inquiries || [], counts: data.counts || {} };
    }
  } catch (e) {
    console.warn('Backend API at port 5000 unreachable:', e);
  }
  return { inquiries: [], counts: {} };
}

export async function updateStatus(ticketId: string, status: InquiryStatus, note?: string): Promise<ClientInquiry | null> {
  try {
    const res = await fetch(`${API_BASE}/inquiries/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.inquiry;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export async function sendAdminMessage(ticketId: string, text: string): Promise<ClientInquiry | null> {
  try {
    const res = await fetch(`${API_BASE}/inquiries/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'support', senderName: 'Admin Desk', text }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.inquiry;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export async function deleteInquiry(ticketId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/inquiries/${ticketId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// ----------------- IAM USER & ROLE API SERVICES -----------------
export async function apiFetchUsers(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/users`);
    if (res.ok) {
      const data = await res.json();
      return data.users || [];
    }
  } catch (e) {
    console.warn('Backend /api/users not reachable, using local storage.');
  }
  return [];
}

export async function apiCreateUser(userData: {
  name: string;
  email: string;
  password: string;
  roleId: string;
  status?: string;
}): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Could not connect to backend server on port 5000.' };
  }
}

export async function apiUpdateUser(id: string, updates: any): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Could not connect to backend server on port 5000.' };
  }
}

export async function apiDeleteUser(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Could not connect to backend server on port 5000.' };
  }
}

export async function apiFetchRoles(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/roles`);
    if (res.ok) {
      const data = await res.json();
      return data.roles || [];
    }
  } catch (e) {
    console.warn('Backend /api/roles not reachable, using local storage.');
  }
  return [];
}

export async function apiCreateRole(roleData: {
  name: string;
  description: string;
  badgeColor: string;
  permissions: string[];
}): Promise<{ success: boolean; role?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Could not connect to backend server on port 5000.' };
  }
}

export async function apiUpdateRole(id: string, updates: any): Promise<{ success: boolean; role?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Could not connect to backend server on port 5000.' };
  }
}

export async function apiDeleteRole(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/roles/${id}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Could not connect to backend server on port 5000.' };
  }
}

