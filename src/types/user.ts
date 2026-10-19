export type Permission = 
  | 'view_inquiries'
  | 'update_status'
  | 'reply_client'
  | 'export_data'
  | 'manage_users'
  | 'delete_inquiries';

export interface PermissionDefinition {
  id: Permission;
  label: string;
  description: string;
}

export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  { id: 'view_inquiries', label: 'View Inquiries', description: 'Browse inquiry list and open project briefs' },
  { id: 'update_status', label: 'Update Status & Milestones', description: 'Advance stages and publish milestone timeline notes' },
  { id: 'reply_client', label: 'Reply to Clients', description: 'Post advisory messages to the client communication timeline' },
  { id: 'export_data', label: 'Export Data (CSV)', description: 'Download CSV reports of client inquiries' },
  { id: 'manage_users', label: 'Manage Users & Roles', description: 'Create and edit administrator accounts and define roles' },
  { id: 'delete_inquiries', label: 'Delete Records', description: 'Permanently remove inquiry entries from the system' },
];

export type RoleBadgeColor = 'amber' | 'sky' | 'purple' | 'rose' | 'emerald' | 'indigo';

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  badgeColor: RoleBadgeColor;
  permissions: Permission[];
  isSystem?: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  roleId: string;
  roleName: string;
  status: 'active' | 'suspended';
  avatarColor?: string;
  createdAt: string;
  lastLogin?: string;
}
