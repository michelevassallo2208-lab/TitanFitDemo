import React, { useState, useEffect } from 'react';
import { AuthState, User, Role } from './types';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { ClientPortal } from './components/ClientPortal';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  // Check local storage for persisted session (optional, simpler for now to reset on refresh for security in demo)
  useEffect(() => {
      // In a real app, validate token here.
  }, []);

  const handleLogin = (user: User) => {
    setAuth({
      user,
      isAuthenticated: true,
    });
  };

  const handleLogout = () => {
    setAuth({
      user: null,
      isAuthenticated: false,
    });
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (auth.user?.role === Role.ADMIN) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  if (auth.user?.role === Role.USER) {
    return <ClientPortal user={auth.user} onLogout={handleLogout} />;
  }

  return <div>Errore: Ruolo non riconosciuto.</div>;
};

export default App;
