import React, { useState } from 'react';
import { adminLogin } from '../services/adminApi';
import { authenticateAdmin } from '../utils/userStorage';
import { Lock, Mail, KeyRound, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  isDarkMode: boolean;
  onLoginSuccess: (email: string, token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isDarkMode, onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (res.success && res.token) {
        setIsLoading(false);
        onLoginSuccess(email, res.token);
        return;
      } else if (res.message && !res.message.includes('Could not connect')) {
        setIsLoading(false);
        setError(res.message);
        return;
      }
    } catch {}

    // Check userStorage (local RBAC registry)
    const localAuth = authenticateAdmin(email, password);
    setIsLoading(false);

    if (localAuth.user) {
      onLoginSuccess(localAuth.user.email, `adm_auth_${Date.now()}`);
    } else {
      setError(localAuth.error || 'Invalid administrator credentials. Password must be at least 6 characters.');
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@company.com');
    setPassword('AdminPass2026!');
    setError('');
  };

  const cardBg = isDarkMode 
    ? 'bg-stone-900 border-stone-800 text-stone-100 shadow-2xl' 
    : 'bg-[#FFFDF9] border-amber-200/90 text-stone-900 shadow-xl';
  const inputBg = isDarkMode
    ? 'bg-stone-950 border-stone-700 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:ring-amber-400'
    : 'bg-[#F5F1E8]/70 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-amber-500 focus:bg-[#FFFDF9]';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-2xl border p-6 sm:p-8 ${cardBg}`}>
        
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20 mb-3 font-bold">
            <Lock className="h-6 w-6 text-stone-950" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Dedicated Admin Portal (Port 8080)
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
            Administrator Sign In
          </h2>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              Admin Account Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className={`w-full rounded-lg border pl-9.5 pr-3 py-2 text-xs sm:text-sm transition-all focus:outline-none focus:ring-1 ${inputBg}`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Security Password
              </label>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className={`w-full rounded-lg border pl-9.5 pr-10 py-2 text-xs sm:text-sm transition-all focus:outline-none focus:ring-1 ${inputBg}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-stone-950 shadow-sm hover:bg-amber-300 transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <span>Sign In to Admin Workspace</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
