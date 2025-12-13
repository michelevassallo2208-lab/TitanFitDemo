import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { db } from '../services/store';
import { Lock, User as UserIcon, Activity, ShieldPlus, X, Check } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // First Run State
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');

  useEffect(() => {
    // Check if any admin exists
    const hasAdmin = db.hasAdmin();
    setIsFirstRun(!hasAdmin);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = db.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      onLogin(user);
    } else {
      setError('Credenziali non valide. Riprova.');
    }
  };

  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regUser || !regPass) return;

    const newAdmin: User = {
      id: `admin-${Date.now()}`,
      fullName: regName,
      username: regUser,
      password: regPass,
      role: Role.ADMIN
    };

    db.saveUser(newAdmin);
    
    // Auto login
    onLogin(newAdmin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-titan-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900 rounded-full blur-[150px]"></div>
      </div>

      <div className="z-10 w-full max-w-4xl bg-dark-800/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10 relative">
        
        {/* Left Side: Brand */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center bg-gradient-to-br from-titan-900 to-dark-900 text-white border-b md:border-b-0 md:border-r border-white/10">
           <div className="mb-6 p-4 bg-titan-500/20 rounded-full">
             <Activity size={64} className="text-titan-500" />
           </div>
           <h1 className="text-4xl font-bold mb-2 tracking-tight">TITAN<span className="text-titan-500">FIT</span></h1>
           <p className="text-titan-100/60 text-center text-sm uppercase tracking-widest">Cloud Training Platform</p>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center relative">
          <h2 className="text-2xl font-bold text-white mb-6">Accedi alla tua area</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">ID Cliente / Admin</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-dark-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-titan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                  placeholder="Inserisci username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-dark-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-titan-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-titan-600 hover:bg-titan-500 text-white font-bold rounded-lg shadow-lg shadow-titan-500/20 transition-all transform hover:scale-[1.02]"
            >
              ACCEDI
            </button>
          </form>

          {isFirstRun && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full py-2 px-4 border border-titan-500/30 bg-titan-500/10 hover:bg-titan-500/20 text-titan-300 font-medium rounded-lg transition-all flex items-center justify-center gap-2 group"
              >
                <ShieldPlus size={18} className="group-hover:text-titan-400" />
                Configurazione Iniziale: Crea Admin
              </button>
            </div>
          )}

          <div className="mt-8 text-center text-xs text-gray-600">
            Powered by TitanFit Cloud Technology &copy; 2024
          </div>
        </div>
      </div>

      {/* ADMIN REGISTRATION MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-dark-800 w-full max-w-md rounded-2xl border border-titan-500/30 p-8 shadow-[0_0_50px_rgba(13,148,136,0.15)] relative">
            <button 
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-titan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <ShieldPlus size={32} className="text-titan-500" />
               </div>
               <h3 className="text-2xl font-bold text-white">Setup Amministratore</h3>
               <p className="text-gray-400 text-sm mt-2">Crea il primo account Master Trainer per gestire la piattaforma.</p>
            </div>

            <form onSubmit={handleRegisterAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nome Palestra / Trainer</label>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg p-3 text-white focus:border-titan-500 outline-none transition-colors"
                  placeholder="Es. Palestra Zeus"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Username Admin</label>
                <input 
                  type="text" 
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg p-3 text-white focus:border-titan-500 outline-none transition-colors"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input 
                  type="password" 
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg p-3 text-white focus:border-titan-500 outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-titan-600 hover:bg-titan-500 text-white font-bold rounded-lg shadow-lg shadow-titan-500/20 transition-all flex items-center justify-center gap-2 mt-6"
              >
                <Check size={20} />
                Completa Setup
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};