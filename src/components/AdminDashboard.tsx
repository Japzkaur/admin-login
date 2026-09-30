import React, { useState, useEffect, useMemo } from 'react';
import { ClientInquiry, InquiryStatus } from '../types/inquiry';
import { 
  fetchAllInquiries, 
  updateStatus, 
  sendAdminMessage, 
  deleteInquiry 
} from '../services/adminApi';
import { 
  Search, 
  Filter, 
  FileText, 
  Trash2, 
  Copy, 
  Check, 
  Mail, 
  Phone, 
  Building2, 
  Paperclip, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Send, 
  X, 
  Download, 
  TrendingUp, 
  Inbox, 
  LogOut, 
  ShieldCheck, 
  Server,
  Users,
  Shield
} from 'lucide-react';
import { UserManagementView } from './UserManagementView';

interface AdminDashboardProps {
  isDarkMode: boolean;
  adminEmail: string;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isDarkMode,
  adminEmail,
  onLogout,
}) => {
  const [activeSection, setActiveSection] = useState<'inquiries' | 'users'>('inquiries');
  const [inquiries, setInquiries] = useState<ClientInquiry[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ClientInquiry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newStatus, setNewStatus] = useState<InquiryStatus>('in_review');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAllInquiries({
      status: statusFilter,
      service: serviceFilter,
      search: searchTerm,
    });
    setInquiries(data.inquiries);
    setCounts(data.counts);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, serviceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  useEffect(() => {
    if (selectedInquiry) {
      setNewStatus(selectedInquiry.status);
      setStatusNote('');
      setStatusUpdateSuccess(false);
      setAdminReplyText('');
    }
  }, [selectedInquiry]);

  const handleCopy = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (ticketId: string, status: InquiryStatus, note?: string) => {
    const updated = await updateStatus(ticketId, status, note);
    if (updated) {
      loadData();
      setSelectedInquiry(updated);
      setStatusUpdateSuccess(true);
      setTimeout(() => setStatusUpdateSuccess(false), 2500);
    }
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !adminReplyText.trim()) return;
    const updated = await sendAdminMessage(selectedInquiry.id, adminReplyText.trim());
    if (updated) {
      loadData();
      setSelectedInquiry(updated);
      setAdminReplyText('');
    }
  };

  const handleDelete = async (ticketId: string) => {
    const success = await deleteInquiry(ticketId);
    if (success) {
      loadData();
      if (selectedInquiry?.id === ticketId) {
        setSelectedInquiry(null);
      }
    }
    setDeleteConfirmId(null);
  };

  const handleExportCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ['Ticket ID', 'Date', 'Client Name', 'Company', 'Email', 'Phone', 'Service', 'Status'];
    const rows = inquiries.map(inq => [
      `"${inq.id}"`,
      `"${new Date(inq.createdAt).toLocaleDateString()}"`,
      `"${inq.clientName.replace(/"/g, '""')}"`,
      `"${inq.companyName.replace(/"/g, '""')}"`,
      `"${inq.clientEmail}"`,
      `"${inq.phone || ''}"`,
      `"${inq.serviceType}"`,
      `"${inq.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admin-inquiries-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            <span>Received</span>
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40">
            <RefreshCw className="h-3 w-3" />
            <span>In Review</span>
          </span>
        );
      case 'proposal_ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            <FileText className="h-3 w-3" />
            <span>Proposal Ready</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            <TrendingUp className="h-3 w-3" />
            <span>In Progress</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const cardBg = isDarkMode 
    ? 'bg-stone-900 border-stone-800 text-stone-100 shadow-sm' 
    : 'bg-[#FFFDF9] border-amber-200/80 text-stone-900 shadow-xs';
  const inputBg = isDarkMode
    ? 'bg-stone-950 border-stone-700 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:ring-amber-400'
    : 'bg-[#F5F1E8]/70 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-amber-500 focus:bg-[#FFFDF9]';
  const subtext = isDarkMode ? 'text-stone-400' : 'text-stone-600';

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Top Admin Bar */}
      <header className={`sticky top-0 z-40 border-b px-4 sm:px-6 py-2.5 ${
        isDarkMode ? 'border-stone-800 bg-stone-950 text-white' : 'border-amber-200/80 bg-stone-900 text-white'
      }`}>
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-400 text-stone-950 font-bold">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm tracking-wide">
                ADMIN PORTAL (PORT 8080)
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-stone-400">
                Connected to API Port 5000
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline text-stone-300">{adminEmail}</span>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Header & Global Tools */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-amber-200/60 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Administrative Portal
            </span>
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight mt-1 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              {activeSection === 'inquiries' ? 'Client Inquiries & Stage Manager' : 'Admin Users & Security Roles'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-amber-300/60 dark:border-stone-800 p-0.5 bg-[#F5F1E8] dark:bg-stone-900">
              <button
                onClick={() => setActiveSection('inquiries')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeSection === 'inquiries'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Inbox className="h-3.5 w-3.5" />
                <span>Inquiries ({counts.total || inquiries.length})</span>
              </button>

              <button
                onClick={() => setActiveSection('users')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeSection === 'users'
                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Users & Roles</span>
              </button>
            </div>

            {activeSection === 'inquiries' && (
              <>
                <button
                  onClick={handleExportCSV}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    isDarkMode ? 'border-stone-700 bg-stone-900 text-stone-200' : 'border-amber-200 bg-[#FFFDF9] text-stone-700 hover:bg-amber-100/70'
                  }`}
                >
                  <Download className="h-3.5 w-3.5 text-amber-600" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={loadData}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    isDarkMode ? 'border-stone-700 bg-stone-900 text-stone-200' : 'border-amber-200 bg-[#FFFDF9] text-stone-700 hover:bg-amber-100/70'
                  }`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </>
            )}
          </div>
        </div>

        {activeSection === 'users' ? (
          <UserManagementView
            isDarkMode={isDarkMode}
            currentUserEmail={adminEmail}
          />
        ) : (
          <>

        {/* Metric Cards - Fun Distinct Colors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          
          {/* Total: Indigo */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
              statusFilter === 'all' 
                ? 'border-indigo-500 ring-2 ring-indigo-400/40 bg-indigo-100/70 dark:bg-indigo-950/60 shadow-md shadow-indigo-500/15 scale-[1.02]' 
                : 'border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 hover:border-indigo-400'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">Total</span>
            <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">{counts.total || inquiries.length}</span>
          </button>

          {/* In Review: Sky */}
          <button
            onClick={() => setStatusFilter('in_review')}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
              statusFilter === 'in_review' 
                ? 'border-sky-500 ring-2 ring-sky-400/40 bg-sky-100/70 dark:bg-sky-950/60 shadow-md shadow-sky-500/15 scale-[1.02]' 
                : 'border-sky-200/60 dark:border-sky-900/40 bg-sky-50/30 dark:bg-sky-950/20 hover:border-sky-400'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-1">In Review</span>
            <span className="text-2xl font-extrabold text-sky-700 dark:text-sky-300">{counts.in_review || 0}</span>
          </button>

          {/* Proposal: Purple */}
          <button
            onClick={() => setStatusFilter('proposal_ready')}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
              statusFilter === 'proposal_ready' 
                ? 'border-purple-500 ring-2 ring-purple-400/40 bg-purple-100/70 dark:bg-purple-950/60 shadow-md shadow-purple-500/15 scale-[1.02]' 
                : 'border-purple-200/60 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/20 hover:border-purple-400'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">Proposal</span>
            <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-300">{counts.proposal_ready || 0}</span>
          </button>

          {/* Active: Rose */}
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
              statusFilter === 'in_progress' 
                ? 'border-rose-500 ring-2 ring-rose-400/40 bg-rose-100/70 dark:bg-rose-950/60 shadow-md shadow-rose-500/15 scale-[1.02]' 
                : 'border-rose-200/60 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 hover:border-rose-400'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">Active</span>
            <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-300">{counts.in_progress || 0}</span>
          </button>

          {/* Completed: Emerald */}
          <button
            onClick={() => setStatusFilter('completed')}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
              statusFilter === 'completed' 
                ? 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-100/70 dark:bg-emerald-950/60 shadow-md shadow-emerald-500/15 scale-[1.02]' 
                : 'border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-400'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">Completed</span>
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{counts.completed || 0}</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className={`p-4 rounded-xl border mb-6 ${cardBg}`}>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ticket ID, client name, company, or email..."
                className={`w-full rounded-lg border pl-9 pr-3 py-1.5 text-xs ${inputBg}`}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 shadow-xs cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table of Inquiries */}
        <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
          {inquiries.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="h-10 w-10 text-stone-400 mx-auto mb-2" />
              <p className="text-sm font-bold">No Inquiries Found</p>
              <p className="text-xs text-stone-400 mt-1">Make sure the backend API on port 5000 is running.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b text-[11px] uppercase tracking-wider text-stone-400 ${
                    isDarkMode ? 'bg-stone-950/60 border-stone-800' : 'bg-[#F5F1E8] border-amber-200/60'
                  }`}>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Client / Company</th>
                    <th className="py-3 px-4 hidden md:table-cell">Service</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {inquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => setSelectedInquiry(inq)}
                      className={`cursor-pointer transition-colors ${
                        selectedInquiry?.id === inq.id
                          ? isDarkMode ? 'bg-amber-950/30' : 'bg-amber-100/40'
                          : isDarkMode ? 'hover:bg-stone-800/40' : 'hover:bg-[#F5F1E8]/70'
                      }`}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{inq.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-800 dark:text-stone-100">{inq.clientName}</div>
                        <div className="text-[11px] text-stone-500">{inq.companyName}</div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-stone-700 dark:text-stone-300">{inq.serviceType}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {renderStatusBadge(inq.status)}
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-stone-500 whitespace-nowrap">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedInquiry(inq); }}
                          className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 font-semibold text-xs cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        )}

        {/* Inquiry Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
            <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden ${
              isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-[#FFFDF9] border-amber-200 text-stone-900'
            }`}>
              
              <div className="flex items-center justify-between border-b px-5 py-3.5 bg-[#F5F1E8] dark:bg-stone-950/60 border-amber-200/60 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{selectedInquiry.id}</span>
                  {renderStatusBadge(selectedInquiry.status)}
                </div>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                
                {/* Contact */}
                <div className={`p-3 rounded-lg border grid grid-cols-1 sm:grid-cols-3 gap-2 ${
                  isDarkMode ? 'border-stone-800 bg-stone-950' : 'border-amber-200/80 bg-[#F5F1E8]/70'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block">Client</span>
                    <span className="font-bold">{selectedInquiry.clientName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block">Company</span>
                    <span className="font-bold">{selectedInquiry.companyName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block">Email</span>
                    <span className="text-amber-700 dark:text-amber-400 font-medium">{selectedInquiry.clientEmail}</span>
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <span className="text-[10px] uppercase text-stone-400 font-bold block mb-1">
                    Requirements & Scope
                  </span>
                  <p className={`p-3 rounded-lg border ${
                    isDarkMode ? 'border-stone-800 bg-stone-950' : 'border-amber-200/60 bg-[#F5F1E8]/40 text-stone-800'
                  }`}>
                    {selectedInquiry.projectDetails}
                  </p>
                </div>

                {selectedInquiry.specificQuestions && (
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-bold block mb-1">
                      Specific Questions
                    </span>
                    <p className={`p-3 rounded-lg border ${
                      isDarkMode ? 'border-stone-800 bg-stone-950' : 'border-amber-200/60 bg-[#F5F1E8]/40 text-stone-800'
                    }`}>
                      {selectedInquiry.specificQuestions}
                    </p>
                  </div>
                )}

                {/* Status Updater */}
                <div className={`p-3.5 rounded-xl border ${
                  isDarkMode ? 'border-amber-900/50 bg-amber-950/20' : 'border-amber-300/80 bg-amber-50/60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-700 dark:text-amber-400 uppercase text-[11px]">
                      Advance Milestone / Status
                    </span>
                    {statusUpdateSuccess && (
                      <span className="text-emerald-600 font-bold text-xs">Saved to Backend!</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as InquiryStatus)}
                        className={`w-full rounded-lg border px-2.5 py-1.5 text-xs ${inputBg}`}
                      >
                        <option value="received">1. Received</option>
                        <option value="in_review">2. In Review</option>
                        <option value="proposal_ready">3. Proposal Ready</option>
                        <option value="in_progress">4. In Progress</option>
                        <option value="completed">5. Completed</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Status note (e.g. reviewed scope)..."
                        className={`w-full rounded-lg border px-2.5 py-1.5 text-xs ${inputBg}`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleStatusChange(selectedInquiry.id, newStatus, statusNote)}
                    className="mt-2.5 w-full py-2 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 shadow-xs cursor-pointer"
                  >
                    Apply Status Change
                  </button>
                </div>

                {/* Messages & Timeline */}
                <div className="border-t border-stone-200 dark:border-stone-800 pt-3">
                  <span className="font-bold uppercase text-[10px] text-stone-400 block mb-2">
                    Communication Log
                  </span>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
                    {selectedInquiry.messages.map(m => (
                      <div key={m.id} className="p-2 rounded border border-amber-200/60 dark:border-stone-800 bg-[#F5F1E8]/50 dark:bg-stone-950 text-xs">
                        <div className="flex justify-between text-[10px] font-bold text-stone-400">
                          <span className={m.sender === 'support' ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500'}>{m.senderName}</span>
                          <span>{m.timestamp}</span>
                        </div>
                        <p className="mt-0.5">{m.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendAdminMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="Send update or note to client tracker..."
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-xs ${inputBg}`}
                    />
                    <button
                      type="submit"
                      disabled={!adminReplyText.trim()}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 disabled:opacity-50 cursor-pointer"
                    >
                      Reply
                    </button>
                  </form>
                </div>

              </div>

              <div className="flex items-center justify-between border-t border-amber-200/60 dark:border-stone-800 px-5 py-3 bg-[#F5F1E8] dark:bg-stone-950/60">
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="text-xs text-rose-500 font-semibold hover:text-rose-700 cursor-pointer"
                >
                  Delete Inquiry
                </button>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-3 py-1 rounded border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};
