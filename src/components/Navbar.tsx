import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { formatBirr, getRoleDisplay } from '../utils/format';
import {
  Plus,
  Users,
  LogOut,
  ChevronDown,
  Layers,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Coins,
  Send,
  Database,
} from 'lucide-react';
import { Role } from '../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchRole,
    logout,
    activeTab,
    setActiveTab,
    setIsNewReqModalOpen,
    setIsStaffDirectoryOpen,
    liveSpentThisMonth,
    committedPendingAmount,
    isManagerOrFinance,
    isManager,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  if (!currentUser) return null;

  const currentRoleInfo = getRoleDisplay(currentUser.role);

  const availableRoles: { role: Role; label: string; desc: string }[] = [
    { role: 'staff', label: 'Almaz (Staff / Requester)', desc: 'Request page only (Creates vouchers)' },
    { role: 'general_manager', label: 'Solomon (General Manager)', desc: 'Sole approval authority for all requests' },
    { role: 'finance', label: 'Bethelhem (Finance Custodian)', desc: 'Disburses GM-approved vouchers & reports' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (isManagerOrFinance) setActiveTab('dashboard');
                else setActiveTab('my_requests');
              }}
              className="text-left focus:outline-hidden group cursor-pointer"
            >
              <Logo size="md" inverted={true} />
            </button>

            {/* Navigation for Manager & Finance ONLY */}
            {isManagerOrFinance ? (
              <nav className="hidden md:flex items-center gap-1 ml-6 border-l border-stone-800 pl-6 text-sm">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-sky-500/20 text-[#00AEEF]'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('requisitions')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                    activeTab === 'requisitions'
                      ? 'bg-sky-500/20 text-[#00AEEF]'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  All Company Vouchers
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                    activeTab === 'reports'
                      ? 'bg-sky-500/20 text-[#00AEEF]'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Monthly Report
                </button>

                <button
                  onClick={() => setIsStaffDirectoryOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-medium text-stone-300 hover:text-white hover:bg-stone-800 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  {isManager ? 'Manage Staff' : 'Staff Directory'}
                </button>
              </nav>
            ) : (
              /* Navigation for Staff / Requester (Request page only!) */
              <div className="hidden md:flex items-center gap-2 ml-6 border-l border-stone-800 pl-6">
                <div className="bg-sky-950/60 border border-sky-800/60 text-sky-300 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#00AEEF]" />
                  <span>Staff Requisition Page Only</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Approved & Pending Money Tracker: Hidden on small mobile screens to keep header uncluttered */}
            {isManagerOrFinance && (
              <div className="hidden md:flex items-center gap-2 bg-stone-800/90 border border-stone-700/80 px-2.5 sm:px-3 py-1.5 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 hidden lg:inline">
                    Approved Oct:
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                  {formatBirr(liveSpentThisMonth)}
                </span>
                <span className="hidden sm:inline text-stone-600 text-xs">|</span>
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-300">
                  <span className="text-stone-400">Pending:</span>
                  <span className="font-semibold text-amber-300 font-mono">
                    {formatBirr(committedPendingAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Action: New Requisition Button (compact on mobile) */}
            <button
              onClick={() => setIsNewReqModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-[#00AEEF] hover:bg-[#0284C7] active:bg-[#0369A1] text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-sky-900/40 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Request Cash</span>
            </button>

            {/* Role Switcher Pill for Evaluation */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsRoleDropdownOpen(!isRoleDropdownOpen);
                  setIsProfileDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                title="Switch active role to test access boundaries"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
                <span className="max-w-[80px] sm:max-w-[130px] truncate hidden xs:inline">
                  {currentRoleInfo.title.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-76 bg-white text-stone-900 rounded-xl shadow-2xl border border-stone-200 py-2 z-50">
                  <div className="px-3.5 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                      <span>Test Role Access</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Database className="w-3 h-3" /> Firebase Live
                      </span>
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Verify that Staff only has request page, while Manager & Finance have dashboard & transactions:
                    </p>
                  </div>

                  <div className="py-1">
                    {availableRoles.map((r) => {
                      const isCurrent = currentUser.role === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => {
                            switchRole(r.role);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 hover:bg-stone-50 transition-colors flex items-start gap-2.5 ${
                            isCurrent ? 'bg-sky-50/70' : ''
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              isCurrent ? 'bg-[#00AEEF]' : 'bg-stone-300'
                            }`}
                          />
                          <div>
                            <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              {r.label}
                              {isCurrent && (
                                <span className="text-[9px] bg-sky-100 text-[#0284C7] px-1.5 py-0.2 rounded font-bold">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-500 leading-tight mt-0.5">
                              {r.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsRoleDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover border border-[#00AEEF]/50"
                />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-stone-900 rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <p className="text-sm font-bold text-stone-900">{currentUser.name}</p>
                    <p className="text-xs text-[#0284C7] font-semibold">{currentUser.roleTitle}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                      @{currentUser.username} · {currentUser.branch}
                    </p>
                  </div>

                  <div className="py-1 text-xs">
                    {isManager && (
                      <button
                        onClick={() => {
                          setIsStaffDirectoryOpen(true);
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700 cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-stone-500" />
                        Staff Management (Create Staff)
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
