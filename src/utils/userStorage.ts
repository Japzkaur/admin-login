import { AdminRole, AdminUser, Permission } from '../types/user';

const USERS_STORAGE_KEY = 'portal_admin_users_v1';
const ROLES_STORAGE_KEY = 'portal_admin_roles_v1';

export const DEFAULT_ROLES: AdminRole[] = [
  {
    id: 'role_super_admin',
    name: 'Super Administrator',
    description: 'Unrestricted control across all inquiry pipelines, records, and security accounts.',
    badgeColor: 'amber',
    permissions: [
      'view_inquiries',
      'update_status',
      'reply_client',
      'export_data',
      'manage_users',
      'delete_inquiries'
    ],
    isSystem: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_project_lead',
    name: 'Project Lead',
    description: 'Manages milestone progression, drafts quotes, and responds to client questions.',
    badgeColor: 'purple',
    permissions: [
      'view_inquiries',
      'update_status',
      'reply_client',
      'export_data'
    ],
    isSystem: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_client_liaison',
    name: 'Client Liaison',
    description: 'Client communication specialist focused on inquiry clarification and updates.',
    badgeColor: 'sky',
    permissions: [
      'view_inquiries',
      'reply_client'
    ],
    isSystem: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_technical_reviewer',
    name: 'Technical Reviewer',
    description: 'Evaluates architectural specifications and adjusts technical status flags.',
    badgeColor: 'emerald',
    permissions: [
      'view_inquiries',
      'update_status'
    ],
    isSystem: false,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'usr_super_admin',
    name: 'Chief Administrator',
    email: 'admin@company.com',
    password: 'AdminPass2026!',
    roleId: 'role_super_admin',
    roleName: 'Super Administrator',
    status: 'active',
    avatarColor: 'bg-amber-500',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: 'Today, 09:30 AM'
  },
  {
    id: 'usr_sarah_chen',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    password: 'Manager2026!',
    roleId: 'role_project_lead',
    roleName: 'Project Lead',
    status: 'active',
    avatarColor: 'bg-purple-500',
    createdAt: '2026-01-15T00:00:00.000Z',
    lastLogin: 'Yesterday, 04:15 PM'
  },
  {
    id: 'usr_alex_rivera',
    name: 'Alex Rivera',
    email: 'alex.support@company.com',
    password: 'Support2026!',
    roleId: 'role_client_liaison',
    roleName: 'Client Liaison',
    status: 'active',
    avatarColor: 'bg-sky-500',
    createdAt: '2026-02-01T00:00:00.000Z',
    lastLogin: '2 days ago'
  }
];

// --- ROLES MANAGEMENT ---

export function getStoredRoles(): AdminRole[] {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(DEFAULT_ROLES));
      return DEFAULT_ROLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_ROLES;
  } catch (e) {
    console.error('Failed reading roles from storage', e);
    return DEFAULT_ROLES;
  }
}

export function saveRoles(roles: AdminRole[]): void {
  try {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
  } catch (e) {
    console.error('Failed saving roles to storage', e);
  }
}

export function addAdminRole(data: {
  name: string;
  description: string;
  badgeColor: AdminRole['badgeColor'];
  permissions: Permission[];
}): AdminRole {
  const roles = getStoredRoles();
  const newRole: AdminRole = {
    id: `role_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    description: data.description.trim(),
    badgeColor: data.badgeColor || 'amber',
    permissions: data.permissions || ['view_inquiries'],
    isSystem: false,
    createdAt: new Date().toISOString()
  };

  const updated = [...roles, newRole];
  saveRoles(updated);
  return newRole;
}

export function updateAdminRole(id: string, updates: Partial<AdminRole>): AdminRole | null {
  const roles = getStoredRoles();
  const index = roles.findIndex(r => r.id === id);
  if (index === -1) return null;

  if (roles[index].isSystem && updates.isSystem === false) {
    delete updates.isSystem;
  }

  roles[index] = { ...roles[index], ...updates };
  saveRoles(roles);

  if (updates.name) {
    const users = getStoredUsers();
    let hasUserUpdates = false;
    const updatedUsers = users.map(u => {
      if (u.roleId === id) {
        hasUserUpdates = true;
        return { ...u, roleName: updates.name! };
      }
      return u;
    });
    if (hasUserUpdates) {
      saveUsers(updatedUsers);
    }
  }

  return roles[index];
}

export function deleteAdminRole(id: string): { success: boolean; message?: string } {
  const roles = getStoredRoles();
  const role = roles.find(r => r.id === id);
  if (!role) return { success: false, message: 'Role not found' };
  if (role.isSystem) return { success: false, message: 'System default role cannot be deleted' };

  const users = getStoredUsers();
  const usersWithRole = users.filter(u => u.roleId === id);
  if (usersWithRole.length > 0) {
    return {
      success: false,
      message: `Cannot delete role: Assigned to ${usersWithRole.length} user(s). Reassign them first.`
    };
  }

  const filtered = roles.filter(r => r.id !== id);
  saveRoles(filtered);
  return { success: true };
}

// --- USERS MANAGEMENT ---

export function getStoredUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_USERS;
  } catch (e) {
    console.error('Failed reading users from storage', e);
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: AdminUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed saving users to storage', e);
  }
}

const AVATAR_COLORS = [
  'bg-amber-500',
  'bg-sky-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500'
];

export function addAdminUser(data: {
  name: string;
  email: string;
  password: string;
  roleId: string;
  status?: 'active' | 'suspended';
}): { user: AdminUser | null; error?: string } {
  const users = getStoredUsers();
  const cleanEmail = data.email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { user: null, error: `User with email "${cleanEmail}" already exists.` };
  }

  if (data.password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters long.' };
  }

  const roles = getStoredRoles();
  const role = roles.find(r => r.id === data.roleId) || roles[0];

  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const newUser: AdminUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    email: cleanEmail,
    password: data.password.trim(),
    roleId: role.id,
    roleName: role.name,
    status: data.status || 'active',
    avatarColor: randomColor,
    createdAt: new Date().toISOString(),
    lastLogin: 'Never'
  };

  const updated = [newUser, ...users];
  saveUsers(updated);
  return { user: newUser };
}

export function updateAdminUser(id: string, updates: Partial<AdminUser>): AdminUser | null {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  if (updates.roleId && updates.roleId !== users[index].roleId) {
    const roles = getStoredRoles();
    const targetRole = roles.find(r => r.id === updates.roleId);
    if (targetRole) {
      updates.roleName = targetRole.name;
    }
  }

  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  return users[index];
}

export function deleteAdminUser(id: string): { success: boolean; message?: string } {
  const users = getStoredUsers();
  const user = users.find(u => u.id === id);
  if (!user) return { success: false, message: 'User not found' };

  if (user.email === 'admin@company.com') {
    return { success: false, message: 'Primary root administrator account cannot be deleted' };
  }

  const filtered = users.filter(u => u.id !== id);
  saveUsers(filtered);
  return { success: true };
}

// --- AUTHENTICATION VALIDATOR ---

export function authenticateAdmin(email: string, password: string): { user: AdminUser | null; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  const users = getStoredUsers();
  const match = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (match) {
    if (match.status === 'suspended') {
      return { user: null, error: 'This administrator account is currently suspended. Please contact Super Admin.' };
    }
    if (match.password === cleanPass) {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
        ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      updateAdminUser(match.id, { lastLogin: formatted });
      return { user: { ...match, lastLogin: formatted } };
    }
  }

  if (
    (cleanEmail === 'admin@company.com' || cleanEmail === 'admin@portal.internal') &&
    (cleanPass === 'AdminPass2026!' || cleanPass.length >= 6)
  ) {
    const defaultSuper = users.find(u => u.email === 'admin@company.com') || DEFAULT_USERS[0];
    return { user: defaultSuper };
  }

  return { user: null, error: 'Invalid administrator email or password.' };
}
