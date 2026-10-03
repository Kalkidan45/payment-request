import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBirr, formatDate, getRoleDisplay, getStatusDisplay } from '../utils/format';
import { CATEGORY_DETAILS } from '../data/mockData';
import {
  Wallet,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Coins,
  Receipt,
  FileSpreadsheet,
  Building2,
  ChevronRight,
  Eye,
  Check,
  Send,
  Zap,
} from 'lucide-react';
import { Requisition } from '../types';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    requisitions,
    liveSpentThisMonth,
    liveSpentToday,
    committedPendingAmount,
    setActiveTab,
    setIsNewReqModalOpen,
    setSelectedRequisition,
    endorseRequisition,
    approveRequisition,
    disburseRequisition,
  } = useApp();

  if (!currentUser) return null;

  const roleInfo = getRoleDisplay(currentUser.role);

  // Filter items needing current user's attention
  const actionRequiredList = requisitions.filter((r) => {
    if (currentUser.role === 'general_manager') {
      return r.status === 'pending_gm';
    }
    if (currentUser.role === 'finance') {
      // Finance can ONLY disburse when General Manager has approved!
      return r.status === 'approved';
    }
    return false;
  });

  // Recent 5 requisitions
  const recentRequisitions = requisitions.slice(0, 5);

  // Live disbursements feed (most recent disbursed)
  const recentDisbursed = requisitions
    .filter((r) => r.status === 'disbursed')
    .slice(0, 4);

  // Category breakdown for this month
  const categoryTotals: Record<string, number> = {};
  requisitions
    .filter((r) => r.status === 'disbursed' && r.updatedAt.startsWith('2026-10'))
    .forEach((r) => {
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.amount;
    });

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 md:pb-12">
      {/* Top Welcome & Role Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-sky-300 shadow-xs"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-bold text-stone-900">
                Selam, {currentUser.name}
              </h1>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.bg} ${roleInfo.color} ${roleInfo.border}`}
              >
                {roleInfo.title.split('(')[0]}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-stone-400" />
              <span>{currentUser.branch}</span>
            </p>
          </div>
        </div>

        {/* Quick CTA Button */}
        <div className="flex items-center gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <button
            onClick={() => setIsNewReqModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#00AEEF] hover:bg-[#0284C7] active:scale-95 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shadow-sky-900/20 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Cash Requisition</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* LIVE SPENT PETTY CASH VISIBILITY BANNER (Instant Visibility)  */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl p-4 sm:p-6 border border-stone-800 shadow-lg relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-sky-300">
                Payment Requisition & Approval Overview
              </h2>
            </div>
            <div className="text-[11px] sm:text-xs text-stone-400 font-mono">
              Live Currency: Ethiopian Birr (ETB / ብር)
            </div>
          </div>

          {/* Core Metrics Grid (Optimized 2x2 for mobile) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 mt-4 sm:mt-5">
            {/* Metric 1: Total Approved & Disbursed This Month */}
            <div className="bg-stone-800/60 rounded-xl p-3 sm:p-4 border border-stone-700/60">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-400 font-medium">
                <span>Approved & Paid</span>
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-emerald-400 font-mono mt-1 truncate">
                {formatBirr(liveSpentThisMonth)}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                Disbursed this month
              </div>
            </div>

            {/* Metric 2: Live Disbursed Today */}
            <div className="bg-stone-800/60 rounded-xl p-3 sm:p-4 border border-stone-700/60">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-400 font-medium">
                <span>Paid Today</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-cyan-400 font-mono mt-1 truncate">
                {formatBirr(liveSpentToday)}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                Instant payouts
              </div>
            </div>

            {/* Metric 3: Committed / Pending Requisitions */}
            <div className="bg-stone-800/60 rounded-xl p-3 sm:p-4 border border-stone-700/60">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-400 font-medium">
                <span>Pending Approvals</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-amber-300 font-mono mt-1 truncate">
                {formatBirr(committedPendingAmount)}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                Awaiting review
              </div>
            </div>

            {/* Metric 4: Total Processed Vouchers */}
            <div className="bg-stone-800/60 rounded-xl p-3 sm:p-4 border border-stone-700/60">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-400 font-medium">
                <span>Total Vouchers</span>
                <Receipt className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-sky-300 font-mono mt-1 truncate">
                {requisitions.length} Items
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                All retail stores
              </div>
            </div>
          </div>

          {/* Requisitions Summary Status */}
          <div className="mt-5 pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-300">
            <span className="font-medium">
              October Overview: <strong className="text-emerald-400">{formatBirr(liveSpentThisMonth)}</strong> approved & paid out · <strong className="text-amber-300">{formatBirr(committedPendingAmount)}</strong> pending approval
            </span>
            <span className="text-stone-400 font-mono text-[11px]">
              Kurtta Kids Clothes Internal Payment Approval Flow
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ACTION REQUIRED BANNER (If current role has pending items)      */}
      {/* ============================================================== */}
      {actionRequiredList.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
              <h2 className="text-sm font-bold text-amber-900">
                Action Required ({actionRequiredList.length} Requisition{actionRequiredList.length > 1 ? 's' : ''})
              </h2>
            </div>
            <span className="text-xs text-amber-800 font-medium">
              Role: {roleInfo.title}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actionRequiredList.map((req) => (
              <div
                key={req.id}
                className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-amber-900">
                      {req.voucherNumber}
                    </span>
                    <span className="text-sm font-black text-stone-900 font-mono">
                      {formatBirr(req.amount)}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-stone-800 mt-1 line-clamp-1">
                    {req.title}
                  </h3>
                  <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-2">
                    <span>By: {req.requesterName}</span>
                    <span>·</span>
                    <span>{req.branch.split(' ')[0]}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                  <button
                    onClick={() => setSelectedRequisition(req)}
                    className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review Details
                  </button>

                  {/* Fast Action Buttons by Role */}
                  {currentUser.role === 'general_manager' && (
                    <button
                      onClick={() => approveRequisition(req.id, 'Officially approved by General Manager.')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve Payment
                    </button>
                  )}

                  {currentUser.role === 'finance' && req.status === 'approved' && (
                    <button
                      onClick={() =>
                        disburseRequisition(
                          req.id,
                          req.paymentMethod,
                          `AUTO-REF-${Math.floor(100000 + Math.random() * 900000)}`,
                          'Disbursed by Finance after General Manager approval'
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      Disburse {formatBirr(req.amount)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2-COLUMN LAYOUT: Recent Requisitions & Live Outflow Feed        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Recent Requisitions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">Recent Payment Requisitions</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Petty cash vouchers submitted across Kurtta branches
              </p>
            </div>
            <button
              onClick={() => setActiveTab('requisitions')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* List items (mobile-friendly cards / table) */}
          <div className="divide-y divide-stone-100">
            {recentRequisitions.map((req) => {
              const status = getStatusDisplay(req.status);
              const cat = CATEGORY_DETAILS[req.category];

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequisition(req)}
                  className="p-4 hover:bg-stone-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        cat ? cat.bg : 'bg-stone-100'
                      }`}
                    >
                      <Receipt className={`w-4 h-4 ${cat ? cat.color : 'text-stone-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-900">
                          {req.voucherNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.bg} ${status.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
                          {status.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-stone-800 mt-0.5 line-clamp-1">
                        {req.title}
                      </h4>
                      <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{req.branch.split(' ')[0]}</span>
                        <span>·</span>
                        <span>Payee: {req.payee}</span>
                        <span>·</span>
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                    <span className="text-base font-extrabold text-stone-900 font-mono">
                      {formatBirr(req.amount)}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      via {req.paymentMethod}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Outflow Pulse & Category Breakdown */}
        <div className="space-y-6">
          
          {/* Live Outflow Feed */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <h2 className="text-sm font-bold text-stone-900">Live Disbursed Feed</h2>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">Real-time</span>
            </div>

            <div className="space-y-3">
              {recentDisbursed.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedRequisition(item)}
                  className="p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50/60 border border-stone-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 truncate max-w-[150px]">
                      {item.title}
                    </span>
                    <span className="font-bold text-emerald-700 font-mono shrink-0">
                      -{formatBirr(item.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                    <span className="truncate">{item.branch.split(' ')[0]}</span>
                    <span>{formatDate(item.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Category Spend (This Month) */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-bold text-stone-900">October Spend by Category</h2>
              <button
                onClick={() => setActiveTab('reports')}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
              >
                Full Report →
              </button>
            </div>

            <div className="space-y-3">
              {sortedCategories.map(([catKey, total]) => {
                const cat = CATEGORY_DETAILS[catKey as keyof typeof CATEGORY_DETAILS];
                const pct = liveSpentThisMonth > 0 ? Math.round((total / liveSpentThisMonth) * 100) : 0;

                return (
                  <div key={catKey}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-stone-700 truncate max-w-[170px]">
                        {cat?.name || catKey}
                      </span>
                      <span className="font-bold text-stone-900 font-mono">
                        {formatBirr(total)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
