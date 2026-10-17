import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Lock, User, UserCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { currentUser, loginWithCredentials } = useApp();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (currentUser) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const success = loginWithCredentials(usernameOrEmail, password);
    if (!success) {
      setErrorMsg('Invalid username/email or password. Please verify your credentials and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-md my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header with Kurtta Cyan silk aesthetic */}
        <div className="bg-gradient-to-br from-[#0284C7] via-[#00AEEF] to-[#38BDF8] text-white p-6 sm:p-7 text-center relative overflow-hidden shadow-inner">
          <div className="relative z-10 flex flex-col items-center">
            <Logo size="lg" inverted={true} />
            <h1 className="text-lg sm:text-xl font-black mt-3 text-white tracking-tight">
              Petty Cash Payment Portal
            </h1>
            <p className="text-xs text-sky-100 mt-1 max-w-xs">
              Kurtta Kids Clothes Internal Financial Control & Approval System
            </p>
          </div>
        </div>

        {/* Sign In Notice */}
        <div className="bg-sky-50/60 px-6 py-2.5 border-b border-sky-100 flex items-center justify-between text-xs text-[#0284C7] font-semibold">
          <span>Authorized Personnel Sign In</span>
          <span className="text-[11px] text-stone-500 font-normal">Individual Account Login</span>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Standard Username/Email & Password Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Username or Company Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Enter username (e.g. almaz, bethelhem, solomon)"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF] text-stone-900 bg-stone-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF] text-stone-900 bg-stone-50 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00AEEF] hover:bg-[#0284C7] active:bg-[#0369A1] text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20 mt-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In to Kurtta Portal</span>
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 text-center space-y-1">
            <p className="text-[11px] text-stone-500">
              Accounts are created and administered by the General Manager.
            </p>
            <p className="text-[10px] text-stone-400">
              Kurtta Kids Clothes · Addis Ababa, Ethiopia · Dual-Control Governance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

