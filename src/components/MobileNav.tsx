import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Layers,
  Plus,
  FileText,
  Users,
  Send,
  User,
  ShieldCheck,
  LogOut,
  X,
  ChevronUp,
} from 'lucide-react';
import { Role } from '../types';
import { getRoleDisplay } from '../utils/format';

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsNewReqModalOpen,
    setIsStaffDirectoryOpen,
    requisitions,
    currentUser,
    isManagerOrFinance,
    isGeneralManager,
    myRequisitions,
    switchRole,
    logout,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  // Items needing attention for role
  const pendingCount = requisitions.filter((r) => {
    if (currentUser.role === 'general_manager') {
      return r.status === 'pending_gm';
    }
    if (currentUser.role === 'finance') {
      return r.status === 'approved';
    }
    return false;
  }).length;

  const myPendingCount = myRequisitions.filter(
    (r) => r.status === 'pending_gm' || r.status === 'approved'
  ).length;

  const currentRoleInfo = getRoleDisplay(currentUser.role);

  const availableRoles: { role: Role; label: string; desc: string }[] = [
    { role: 'staff', label: 'Almaz (Staff)', desc: 'Request page only' },
    { role: 'general_manager', label: 'Solomon (General Mgr)', desc: 'Sole approval authority' },
    { role: 'finance', label: 'Bethelhem (Finance)', desc: 'Disburses GM-approved' },
  ];

  return (
    <>
      {/* Mobile Profile & Role Quick Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl border-t border-stone-200 p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto pb-10">
            {/* Handlebar */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#00AEEF]/40 shadow-xs"
                />
                <div>
                  <h3 className="text-base font-bold text-stone-900">{currentUser.name}</h3>
                  <p className="text-xs text-[#0284C7] font-semibold">{currentUser.roleTitle}</p>
                  <p className="text-[11px] text-stone-400">
                    @{currentUser.username} · {currentUser.branch}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switch Role Section (Convenient for mobile evaluation) */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00AEEF]" />
                <span>Switch Role to Test Approvals</span>
              </p>
              <div className="grid grid-cols-1 gap-2">
                {availableRoles.map((r) => {
                  const isCurrent = currentUser.role === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'border-sky-400 bg-sky-50 font-bold text-stone-900'
                          : 'border-stone-200 bg-stone-50/70 text-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          {r.label}
                          {isCurrent && (
                            <span className="text-[9px] bg-[#00AEEF] text-white px-1.5 py-0.5 rounded-full font-bold">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">{r.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              {isManagerOrFinance && (
                <button
                  onClick={() => {
                    setIsStaffDirectoryOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold p-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-stone-500" />
                  <span>Manage Staff Directory</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold p-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-xl border-t border-stone-800 shadow-[0_-8px_25px_rgba(0,0,0,0.45)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5"
      >
        {!isManagerOrFinance ? (
          /* Staff Mobile Layout: 3 clean actions */
          <div className="grid grid-cols-3 items-center h-14 max-w-sm mx-auto px-4">
            {/* Tab 1: My Requests */}
            <button
              onClick={() => setActiveTab('my_requests')}
              className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                activeTab === 'my_requests' ? 'text-[#00AEEF]' : 'text-stone-400'
              }`}
            >
              <div className="relative">
                <Send className="w-5 h-5" />
                {myPendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#00AEEF] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {myPendingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold">My Requests</span>
            </button>

            {/* Tab 2: Elevated Center FAB (+ Request Cash) */}
            <div className="flex items-center justify-center -mt-6">
              <button
                onClick={() => setIsNewReqModalOpen(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#00AEEF] text-white flex items-center justify-center shadow-lg shadow-sky-950/90 active:scale-90 transition-all border-4 border-stone-900 focus:outline-hidden"
                title="New Cash Requisition"
                aria-label="New Cash Requisition"
              >
                <Plus className="w-7 h-7 stroke-[3]" />
              </button>
            </div>

            {/* Tab 3: Profile & Role Sheet */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center py-1 text-stone-400 active:scale-95 transition-all"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-[#00AEEF]"
                />
              </div>
              <span className="text-[10px] mt-1 font-semibold flex items-center gap-0.5">
                Role <ChevronUp className="w-2.5 h-2.5" />
              </span>
            </button>
          </div>
        ) : (
          /* Manager & Finance Mobile Layout: 5 items */
          <div className="grid grid-cols-5 items-center h-14 max-w-md mx-auto px-2">
            {/* Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                activeTab === 'dashboard' ? 'text-[#00AEEF] font-bold' : 'text-stone-400'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Dashboard</span>
            </button>

            {/* Vouchers */}
            <button
              onClick={() => setActiveTab('requisitions')}
              className={`flex flex-col items-center justify-center py-1 relative transition-all active:scale-95 ${
                activeTab === 'requisitions' ? 'text-[#00AEEF] font-bold' : 'text-stone-400'
              }`}
            >
              <div className="relative">
                <Layers className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#00AEEF] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">Vouchers</span>
            </button>

            {/* Elevated Center FAB: + New Requisition */}
            <div className="flex items-center justify-center -mt-6">
              <button
                onClick={() => setIsNewReqModalOpen(true)}
                className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#00AEEF] text-white flex items-center justify-center shadow-lg shadow-sky-950/90 active:scale-90 transition-all border-3 border-stone-900 focus:outline-hidden"
                title="New Cash Requisition"
                aria-label="New Cash Requisition"
              >
                <Plus className="w-7 h-7 stroke-[3]" />
              </button>
            </div>

            {/* Monthly Reports */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                activeTab === 'reports' ? 'text-[#00AEEF] font-bold' : 'text-stone-400'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Reports</span>
            </button>

            {/* Profile / Roles Drawer */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center py-1 text-stone-400 active:scale-95 transition-all"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-[#00AEEF]"
              />
              <span className="text-[10px] mt-1 font-medium flex items-center gap-0.5">
                Role <ChevronUp className="w-2.5 h-2.5" />
              </span>
            </button>
          </div>
        )}
      </nav>
    </>
  );
};
