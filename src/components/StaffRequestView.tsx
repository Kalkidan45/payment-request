import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBirr, formatDate, getStatusDisplay } from '../utils/format';
import { CATEGORY_DETAILS } from '../data/mockData';
import {
  Plus,
  Receipt,
  Clock,
  CheckCircle2,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Search,
  Sparkles,
} from 'lucide-react';

export const StaffRequestView: React.FC = () => {
  const {
    currentUser,
    myRequisitions,
    setIsNewReqModalOpen,
    setSelectedRequisition,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'pending' | 'disbursed' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  if (!currentUser) return null;

  // Filter staff's own requisitions
  const filtered = myRequisitions.filter((r) => {
    if (filter === 'pending' && !r.status.startsWith('pending') && r.status !== 'approved') {
      return false;
    }
    if (filter === 'disbursed' && r.status !== 'disbursed') {
      return false;
    }
    if (filter === 'rejected' && r.status !== 'rejected') {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchVouch = r.voucherNumber.toLowerCase().includes(q);
      const matchPayee = r.payee.toLowerCase().includes(q);
      if (!matchTitle && !matchVouch && !matchPayee) return false;
    }
    return true;
  });

  const pendingCount = myRequisitions.filter(
    (r) => r.status.startsWith('pending') || r.status === 'approved'
  ).length;

  const totalMyDisbursed = myRequisitions
    .filter((r) => r.status === 'disbursed')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 md:pb-12 max-w-4xl mx-auto px-1 sm:px-0">
      {/* Staff Greeting & Requisition Banner */}
      <div className="bg-gradient-to-r from-[#0284C7] via-[#00AEEF] to-[#38BDF8] text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-sky-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative overflow-hidden">
        {/* Subtle decorative motif */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-xs mb-1.5">
            <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="truncate max-w-[200px]">{currentUser.branch}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Selam, {currentUser.name}
          </h1>
          <p className="text-xs text-sky-100 mt-0.5">
            Kurtta Staff Portal · {currentUser.roleTitle}
          </p>
        </div>

        <button
          onClick={() => setIsNewReqModalOpen(true)}
          className="relative z-10 bg-white hover:bg-sky-50 active:scale-95 text-[#0284C7] font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Cash Requisition</span>
        </button>
      </div>

      {/* Quick Summary of Own Requests (Compact on Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-500 font-medium">
            <span>Active Requests</span>
            <Clock className="w-4 h-4 text-[#00AEEF]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 mt-1 font-mono">
            {pendingCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5 truncate">
            Awaiting GM / Payout
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-500 font-medium">
            <span>Total Paid Out</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base sm:text-2xl font-black text-emerald-700 mt-1 font-mono truncate">
            {formatBirr(totalMyDisbursed)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5 truncate">
            Disbursed to date
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200 shadow-xs flex sm:flex-col justify-between items-center sm:items-start">
          <div className="flex sm:w-full items-center justify-between text-[11px] sm:text-xs text-stone-500 font-medium">
            <span>Total Submitted</span>
            <Receipt className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-right sm:text-left">
            <div className="text-base sm:text-2xl font-black text-stone-900 font-mono">
              {myRequisitions.length} Vouchers
            </div>
            <div className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">All time requests</div>
          </div>
        </div>
      </div>

      {/* Requisitions List Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Mobile-friendly Search Header */}
        <div className="p-3.5 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900">My Requisition Vouchers</h2>
            <p className="text-xs text-stone-500">
              4-Step Workflow: Staff Request ➔ Finance Check ➔ GM Approval ➔ Finance Payment
            </p>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by voucher #, title, or payee..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF] focus:bg-white text-stone-900 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Filter Tabs (Smooth horizontal touch swipe) */}
        <div className="bg-stone-50 px-3 sm:px-4 py-2 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'disbursed', label: 'Disbursed' },
            { id: 'rejected', label: 'Declined' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap active:scale-95 ${
                filter === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Requisitions Items */}
        {filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">No requisitions found</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
              You haven't submitted any petty cash vouchers matching this filter.
            </p>
            <button
              onClick={() => setIsNewReqModalOpen(true)}
              className="mt-4 bg-[#00AEEF] hover:bg-[#0284C7] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Request</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filtered.map((req) => {
              const status = getStatusDisplay(req.status);
              const cat = CATEGORY_DETAILS[req.category];

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequisition(req)}
                  className="p-3.5 sm:p-4 hover:bg-sky-50/40 active:bg-sky-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        cat ? cat.bg : 'bg-stone-100'
                      }`}
                    >
                      <Receipt className={`w-5 h-5 ${cat ? cat.color : 'text-stone-700'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-[#0284C7]">
                          {req.voucherNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.bg} ${status.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
                          {status.label}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-stone-900 mt-1 line-clamp-1">
                        {req.title}
                      </h4>
                      <div className="text-[11px] text-stone-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="truncate max-w-[140px]">Payee: {req.payee}</span>
                        <span>·</span>
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 pl-13 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div className="text-sm sm:text-base font-black text-stone-900 font-mono">
                        {formatBirr(req.amount)}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {req.paymentMethod}
                      </div>
                    </div>
                    <div className="text-stone-400 p-1">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
