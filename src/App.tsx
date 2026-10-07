import React, { useState, useEffect } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

const ADMIN_TOKEN_KEY = 'admin_port_8080_token';
const ADMIN_EMAIL_KEY = 'admin_port_8080_email';

export default function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem(ADMIN_EMAIL_KEY) || 'admin@company.com';
  });

  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleLoginSuccess = (email: string, userToken: string) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, userToken);
    localStorage.setItem(ADMIN_EMAIL_KEY, email);
    setToken(userToken);
    setAdminEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
    setToken(null);
  };

  return (
    <div className={isDarkMode ? 'dark bg-stone-950 text-white min-h-screen' : 'bg-[#FBF9F4] text-stone-900 min-h-screen'}>
      {!token ? (
        <AdminLogin
          isDarkMode={isDarkMode}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <AdminDashboard
          isDarkMode={isDarkMode}
          adminEmail={adminEmail}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
