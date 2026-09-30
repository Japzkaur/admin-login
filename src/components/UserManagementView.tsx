import React, { useState, useEffect, useMemo } from 'react';
import { 
  AdminUser, 
  AdminRole, 
  Permission, 
  AVAILABLE_PERMISSIONS, 
  RoleBadgeColor 
} from '../types/user';
import { 
  getStoredUsers, 
  getStoredRoles, 
  addAdminUser, 
  updateAdminUser, 
  deleteAdminUser, 
  addAdminRole, 
  updateAdminRole, 
  deleteAdminRole 
} from '../utils/userStorage';
import {
  apiFetchUsers,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  apiFetchRoles,
  apiCreateRole,
  apiUpdateRole,
  apiDeleteRole
} from '../services/adminApi';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Copy, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Fingerprint
} from 'lucide-react';

interface UserManagementViewProps {
  isDarkMode: boolean;
  currentUserEmail?: string;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  isDarkMode,
  currentUserEmail
}) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [passwordChangeUser, setPasswordChangeUser] = useState<AdminUser | null>(null);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states for Add/Edit User
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRoleId, setUserRoleId] = useState('');
  const [userStatus, setUserStatus] = useState<'active' | 'suspended'>('active');
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states for Add/Edit Role
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleColor, setRoleColor] = useState<RoleBadgeColor>('amber');
  const [rolePermissions, setRolePermissions] = useState<Permission[]>(['view_inquiries']);

  // Load data
  const refreshData = () => {
    const loadedUsers = getStoredUsers();
    const loadedRoles = getStoredRoles();
    setUsers(loadedUsers);
    setRoles(loadedRoles);
    if (!userRoleId && loadedRoles.length > 0) {
      setUserRoleId(loadedRoles[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackNotice({ text, type });
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  // Generate strong random password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserPassword(res);
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Open modal for Create User
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    generateStrongPassword();
    setUserRoleId(roles[0]?.id || 'role_super_admin');
    setUserStatus('active');
    setModalError('');
    setShowPasswordInModal(true);
    setShowAddUserModal(true);
  };

  // Open modal for Edit User
  const handleOpenEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPassword(user.password);
    setUserRoleId(user.roleId);
    setUserStatus(user.status);
    setModalError('');
    setShowPasswordInModal(false);
    setShowAddUserModal(true);
  };

  // Save User (Create or Update)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!userName.trim() || !userEmail.trim()) {
      setModalError('Please enter both name and email address.');
      return;
    }

    if (userPassword.length < 6) {
      setModalError('Password must be at least 6 characters long.');
      return;
    }

    if (editingUser) {
      const res = updateAdminUser(editingUser.id, {
        name: userName.trim(),
        roleId: userRoleId,
        password: userPassword.trim(),
        status: userStatus
      });
      if (res) {
        refreshData();
        setShowAddUserModal(false);
        showNotice(`Account "${userName}" updated successfully.`);
      }
    } else {
      const res = addAdminUser({
        name: userName.trim(),
        email: userEmail.trim(),
        password: userPassword.trim(),
        roleId: userRoleId,
        status: userStatus
      });

      if (res.error) {
        setModalError(res.error);
        return;
      }

      refreshData();
      setShowAddUserModal(false);
      showNotice(`New user "${userName}" added with role "${roles.find(r => r.id === userRoleId)?.name}".`);
    }
  };

  // Delete User
  const handleDeleteUser = (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete administrator account for ${user.name} (${user.email})?`)) {
      const res = deleteAdminUser(user.id);
      if (res.success) {
        refreshData();
        showNotice(`Account "${user.name}" removed from system.`);
      } else {
        alert(res.message || 'Cannot delete this account.');
      }
    }
  };

  // Quick Change Password
  const handleSaveQuickPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChangeUser || userPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    updateAdminUser(passwordChangeUser.id, { password: userPassword.trim() });
    refreshData();
    setPasswordChangeUser(null);
    showNotice(`Password updated for ${passwordChangeUser.name}.`);
  };

  // Open modal for Create Role
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDesc('');
    setRoleColor('amber');
    setRolePermissions(['view_inquiries']);
    setShowAddRoleModal(true);
  };

  // Open modal for Edit Role
  const handleOpenEditRole = (role: AdminRole) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description);
    setRoleColor(role.badgeColor);
    setRolePermissions(role.permissions);
    setShowAddRoleModal(true);
  };

  // Toggle permission in role form
  const handleTogglePermission = (perm: Permission) => {
    setRolePermissions(prev => {
      if (prev.includes(perm)) {
        return prev.filter(p => p !== perm);
      } else {
        return [...prev, perm];
      }
    });
  };

  // Save Role (Create or Update)
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      alert('Please enter a role title.');
      return;
    }

    if (editingRole) {
      updateAdminRole(editingRole.id, {
        name: roleName.trim(),
        description: roleDesc.trim(),
        badgeColor: roleColor,
        permissions: rolePermissions
      });
      refreshData();
      setShowAddRoleModal(false);
      showNotice(`Role "${roleName}" updated successfully.`);
    } else {
      addAdminRole({
        name: roleName.trim(),
        description: roleDesc.trim() || 'Custom administrative role permissions.',
        badgeColor: roleColor,
        permissions: rolePermissions
      });
      refreshData();
      setShowAddRoleModal(false);
      showNotice(`New role "${roleName}" created and ready for assignment.`);
    }
  };

  // Delete Role
  const handleDeleteRole = (role: AdminRole) => {
    if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      const res = deleteAdminRole(role.id);
      if (res.success) {
        refreshData();
        showNotice(`Role "${role.name}" deleted.`);
      } else {
        alert(res.message);
      }
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (roleFilter !== 'all' && user.roleId !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.roleName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  const getBadgeClasses = (color: RoleBadgeColor) => {
    switch (color) {
      case 'amber':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
      case 'sky':
        return 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800';
      case 'purple':
        return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800';
      case 'rose':
        return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800';
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300';
    }
  };

  const cardBg = isDarkMode 
    ? 'bg-stone-900 border-stone-800 text-stone-100 shadow-sm' 
    : 'bg-[#FFFDF9] border-amber-200/80 text-stone-900 shadow-xs';
  const inputBg = isDarkMode
    ? 'bg-stone-950 border-stone-700 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:ring-amber-400'
    : 'bg-[#F5F1E8]/70 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-amber-500 focus:bg-[#FFFDF9]';

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {feedbackNotice && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-md transition-all ${
          feedbackNotice.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{feedbackNotice.text}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Sub Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Identity & Access Management (IAM)
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
            Admin Accounts & Role Permissions
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Create administrator users, assign secure passwords, and customize security roles with specific access levels.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreateRole}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isDarkMode 
                ? 'border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white' 
                : 'border-amber-300 bg-[#F5F1E8] text-stone-800 hover:bg-amber-100 shadow-xs'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            <span>+ New Role</span>
          </button>

          <button
            onClick={handleOpenCreateUser}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>+ Add User</span>
          </button>
        </div>
      </div>

      {/* Metric Cards for Users */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between text-indigo-500 mb-1">
            <span className="text-[11px] font-bold uppercase">Total Users</span>
            <Users className="h-4 w-4" />
          </div>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{users.length}</span>
          <span className="block text-[10px] text-stone-400 mt-0.5">Registered accounts</span>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between text-emerald-500 mb-1">
            <span className="text-[11px] font-bold uppercase">Active Status</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {users.filter(u => u.status === 'active').length}
          </span>
          <span className="block text-[10px] text-stone-400 mt-0.5">Can sign in directly</span>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between text-purple-500 mb-1">
            <span className="text-[11px] font-bold uppercase">Defined Roles</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{roles.length}</span>
          <span className="block text-[10px] text-stone-400 mt-0.5">Security levels</span>
        </div>

        <div className={`p-4 rounded-xl border ${cardBg}`}>
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-[11px] font-bold uppercase">Security Mode</span>
            <KeyRound className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Password / Role RBAC</span>
          <span className="block text-[10px] text-stone-400 mt-0.5">Instant credential sync</span>
        </div>
      </div>

      {/* Tabs navigation: Users vs Roles */}
      <div className="flex items-center gap-2 border-b border-amber-200/60 pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-amber-400 text-stone-950 shadow-xs'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Administrators & Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-amber-400 text-stone-950 shadow-xs'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Roles & Access Rights ({roles.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Filters & Search */}
          <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${cardBg}`}>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email, or role..."
                className={`w-full rounded-lg border pl-9 pr-3 py-1.5 text-xs ${inputBg}`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider shrink-0">
                Filter Role:
              </span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs w-full sm:w-auto ${inputBg}`}
              >
                <option value="all">All Roles ({users.length})</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold uppercase tracking-wider text-stone-400 ${
                    isDarkMode ? 'bg-stone-950/60 border-stone-800' : 'bg-[#F5F1E8] border-amber-200/60'
                  }`}>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Password</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/40 dark:divide-stone-800/80">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        No administrator accounts found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const roleObj = roles.find(r => r.id === user.roleId);
                      const isCurrent = currentUserEmail && user.email.toLowerCase() === currentUserEmail.toLowerCase();

                      return (
                        <tr key={user.id} className="hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`h-8 w-8 rounded-full ${user.avatarColor || 'bg-amber-500'} flex items-center justify-center text-stone-950 font-bold text-xs uppercase shadow-xs shrink-0`}>
                                {user.name.substring(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-stone-900 dark:text-stone-100">{user.name}</span>
                                  {isCurrent && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 font-bold">
                                      You
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-stone-400 font-mono">{user.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeClasses(roleObj?.badgeColor || 'amber')}`}>
                              <Shield className="h-3 w-3" />
                              <span>{user.roleName}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                const newStatus = user.status === 'active' ? 'suspended' : 'active';
                                updateAdminUser(user.id, { status: newStatus });
                                refreshData();
                                showNotice(`Status changed to ${newStatus} for ${user.name}.`);
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                                user.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                              }`}
                              title="Click to toggle account status"
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="capitalize">{user.status}</span>
                            </button>
                          </td>

                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="text-stone-400 tracking-widest text-[11px]">••••••••</span>
                              <button
                                onClick={() => handleCopy(user.password, user.id)}
                                className="p-1 rounded text-stone-400 hover:text-amber-500 transition-colors"
                                title="Copy password to clipboard"
                              >
                                {copiedKey === user.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => {
                                  setPasswordChangeUser(user);
                                  setUserPassword('');
                                }}
                                className="text-[10px] px-1.5 py-0.5 rounded border border-stone-700 hover:border-amber-400 hover:text-amber-400 transition-colors font-sans"
                                title="Set a new password"
                              >
                                Reset
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-stone-400 text-[11px]">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{user.lastLogin || 'Never'}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditUser(user)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-800 transition-colors cursor-pointer"
                                title="Edit user settings"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              {user.email !== 'admin@company.com' && (
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-stone-800 transition-colors cursor-pointer"
                                  title="Delete user account"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map(role => {
              const assignedCount = users.filter(u => u.roleId === role.id).length;

              return (
                <div key={role.id} className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${cardBg}`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getBadgeClasses(role.badgeColor)}`}>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>{role.name}</span>
                        </span>
                        {role.isSystem && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-semibold">
                            System Default
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditRole(role)}
                          className="p-1 text-stone-400 hover:text-amber-400"
                          title="Edit role name & permissions"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="p-1 text-stone-400 hover:text-rose-400"
                            title="Delete custom role"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-stone-400 mb-3 leading-relaxed">
                      {role.description}
                    </p>

                    <div className="border-t border-amber-200/50 dark:border-stone-800/80 pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                        Granted Permissions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_PERMISSIONS.map(perm => {
                          const hasPerm = role.permissions.includes(perm.id);
                          return (
                            <span
                              key={perm.id}
                              className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${
                                hasPerm
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-bold'
                                  : 'bg-stone-950/40 text-stone-500 border-stone-800 line-through opacity-40'
                              }`}
                            >
                              {hasPerm ? <Check className="h-2.5 w-2.5 text-amber-500" /> : <X className="h-2.5 w-2.5 text-stone-600" />}
                              <span>{perm.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-200/40 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                    <span>{assignedCount} administrator account(s) assigned</span>
                    <button
                      onClick={() => {
                        setRoleFilter(role.id);
                        setActiveTab('users');
                      }}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                    >
                      View Users →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD OR EDIT USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-colors ${cardBg}`}>
            
            <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-stone-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400 text-stone-950 font-bold">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {editingUser ? `Edit Account: ${editingUser.name}` : 'Create New Administrator Account'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Assign role privileges and login credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-md text-stone-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Full Name / Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className={`w-full rounded-lg border px-3 py-2 ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Login Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    disabled={!!editingUser}
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. jordan.miller@company.com"
                    className={`w-full rounded-lg border pl-9 pr-3 py-2 ${inputBg} ${editingUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Security Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type={showPasswordInModal ? 'text' : 'password'}
                    required
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Enter password (min 6 chars)..."
                    className={`w-full rounded-lg border pl-9 pr-16 py-2 font-mono ${inputBg}`}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(userPassword, 'modal-pass')}
                      className="p-1 text-stone-400 hover:text-amber-500"
                      title="Copy to clipboard"
                    >
                      {copiedKey === 'modal-pass' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                      className="p-1 text-stone-400 hover:text-stone-200"
                    >
                      {showPasswordInModal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Assign Role & Permissions *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUserModal(false);
                      handleOpenCreateRole();
                    }}
                    className="text-[11px] text-amber-500 hover:underline font-bold"
                  >
                    + Create New Custom Role
                  </button>
                </div>
                <select
                  value={userRoleId}
                  onChange={(e) => setUserRoleId(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 ${inputBg}`}
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.permissions.length} permissions
                    </option>
                  ))}
                </select>
                {roles.find(r => r.id === userRoleId) && (
                  <p className="text-[11px] text-stone-400 mt-1.5 italic">
                    "{roles.find(r => r.id === userRoleId)?.description}"
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Account Status
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={userStatus === 'active'}
                      onChange={() => setUserStatus('active')}
                      className="text-amber-500"
                    />
                    <span>Active (Can sign in)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="suspended"
                      checked={userStatus === 'suspended'}
                      onChange={() => setUserStatus('suspended')}
                      className="text-amber-500"
                    />
                    <span>Suspended (Access blocked)</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-amber-200/60 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 shadow-xs cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: CREATE OR EDIT ROLE */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-colors ${cardBg}`}>
            
            <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-stone-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500 text-white font-bold">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Security Role'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Define custom role titles, badge styling, and granular feature access.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="p-1 rounded-md text-stone-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Regional Support Desk, Quality Auditor..."
                  className={`w-full rounded-lg border px-3 py-2 ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Description / Responsibilities
                </label>
                <textarea
                  rows={2}
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Brief summary of duties and permissions granted to this role..."
                  className={`w-full rounded-lg border px-3 py-2 ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Badge Color Identity
                </label>
                <div className="flex items-center gap-2">
                  {(['amber', 'sky', 'purple', 'rose', 'emerald', 'indigo'] as RoleBadgeColor[]).map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setRoleColor(color)}
                      className={`h-7 px-2.5 rounded-lg border text-[11px] font-bold capitalize transition-all flex items-center gap-1 cursor-pointer ${
                        roleColor === color
                          ? 'ring-2 ring-amber-400 scale-105 ' + getBadgeClasses(color)
                          : 'border-stone-700 bg-stone-900 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full bg-${color}-500`} />
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Allowed System Privileges:
                </label>
                <div className="space-y-2 border border-amber-200/50 dark:border-stone-800 rounded-xl p-3 bg-stone-950/20 max-h-48 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const isChecked = rolePermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/40' 
                            : 'hover:bg-stone-800/40 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-stone-600 text-amber-500 focus:ring-amber-400"
                        />
                        <div>
                          <span className="font-bold text-stone-900 dark:text-stone-100 block">
                            {perm.label}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {perm.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-amber-200/40 dark:border-stone-800 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Live Badge Preview:</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getBadgeClasses(roleColor)}`}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{roleName.trim() || 'Custom Role Name'}</span>
                </span>
              </div>

              <div className="mt-6 pt-3 border-t border-amber-200/60 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 shadow-xs cursor-pointer"
                >
                  {editingRole ? 'Save Role' : 'Create Role'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: QUICK PASSWORD RESET */}
      {passwordChangeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
          <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl transition-colors ${cardBg}`}>
            
            <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-stone-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400 text-stone-950 font-bold">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Reset Password</h3>
                  <p className="text-[11px] text-stone-400">{passwordChangeUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordChangeUser(null)}
                className="p-1 rounded-md text-stone-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPassword} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    New Security Password
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[10px] text-amber-500 hover:underline font-bold"
                  >
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)..."
                  className={`w-full rounded-lg border px-3 py-2 font-mono ${inputBg}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordChangeUser(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-700 hover:bg-stone-800 text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
