import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { getRoleDisplay } from '../utils/format';
import { Lock, User, UserCheck, Sparkles, AlertCircle } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { currentUser, login, loginWithCredentials, users } = useApp();

  const [usernameOrEmail, setUsernameOrEmail] = useState('almaz');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');

  if (currentUser) return null;

  const handleQuickLogin = (userId: string) => {
    login(userId);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const success = loginWithCredentials(usernameOrEmail, password);
    if (!success) {
      setErrorMsg('Invalid username/email or password. Please try again or use the demo profiles below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
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
          <span>Company Staff & Management Sign In</span>
          <span className="text-[11px] text-stone-500 font-normal">Staff created by Manager</span>
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
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Username or Company Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="e.g. almaz or solomon"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF] text-stone-900 bg-stone-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF] text-stone-900 bg-stone-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00AEEF] hover:bg-[#0284C7] active:bg-[#0369A1] text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20 mt-1"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In to Kurtta Portal</span>
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-2">
            <div className="relative flex items-center justify-center mb-3">
              <div className="border-t border-stone-200 w-full"></div>
              <span className="bg-white px-2.5 text-[11px] text-stone-400 uppercase font-bold tracking-wider">
                Or Quick Login by Role
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.slice(0, 4).map((u) => {
                const roleBadge = getRoleDisplay(u.role);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u.id)}
                    className="text-left p-2 rounded-xl border border-stone-200 hover:border-[#00AEEF] hover:bg-sky-50/50 transition-all flex items-center gap-2.5 group cursor-pointer"
                  >
                    <img
                      src={u.avatarUrl}
                      alt={u.name}
                      className="w-8 h-8 rounded-lg object-cover border border-stone-200"
                    />
                    <div className="truncate flex-1">
                      <div className="text-xs font-bold text-stone-900 group-hover:text-[#0284C7] truncate">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">
                        {roleBadge.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-center text-stone-400">
            Kurtta Kids Clothes · Addis Ababa · Only General Manager can register new staff accounts
          </p>
        </div>
      </div>
    </div>
  );
};
