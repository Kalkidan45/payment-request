import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBirr, formatDate, getRoleDisplay, getStatusDisplay } from '../utils/format';
import {
  Wallet,
  TrendingDown,
  Clock,
  Plus,
  ShieldAlert,
  Coins,
  Receipt,
  Building2,
  ChevronRight,
  Eye,
  Check,
  Send,
  FileCheck,
  CheckCircle,
} from 'lucide-react';
import { Requisition, BranchLocation } from '../types';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    requisitions,
    liveSpentThisMonth,
    liveSpentToday,
    committedPendingAmount,
    pendingFinanceCount,
    pendingGMCount,
    readyForPaymentCount,
    setActiveTab,
    setIsNewReqModalOpen,
    setSelectedRequisition,
    verifyRequisition,
    approveRequisition,
    disburseRequisition,
  } = useApp();

  if (!currentUser) return null;

  const roleInfo = getRoleDisplay(currentUser.role);

  // Filter items needing current user's direct attention
  const actionRequiredList = requisitions.filter((r) => {
    if (currentUser.role === 'finance') {
      return r.status === 'pending_finance' || r.status === 'approved';
    }
    if (currentUser.role === 'general_manager') {
      return r.status === 'pending_gm';
    }
    return false;
  });

  // Recent 5 requisitions
  const recentRequisitions = requisitions.slice(0, 5);

  // Live disbursements feed (most recent disbursed)
  const recentDisbursed = requisitions
    .filter((r) => r.status === 'disbursed')
    .slice(0, 4);

  // Branch breakdown for this month
  const branchTotals: Record<string, number> = {};
  requisitions
    .filter((r) => r.status === 'disbursed' && r.updatedAt.startsWith('2026-10'))
    .forEach((r) => {
      branchTotals[r.branch] = (branchTotals[r.branch] || 0) + r.amount;
    });

  const sortedBranches = Object.entries(branchTotals)
    .sort(([, a], [, b]) => b - a);

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
      {/* 4-STAGE PIPELINE OVERVIEW BANNER                               */}
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
                4-Stage Workflow & Fund Overview
              </h2>
            </div>
            <div className="text-[11px] sm:text-xs text-stone-400 font-mono">
              Staff ➔ Finance ➔ GM ➔ Finance Payout
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 mt-4 sm:mt-5">
            {/* Metric 1: Stage 1 Needs Finance Check */}
            <div
              onClick={() => setActiveTab('requisitions')}
              className="bg-stone-800/60 hover:bg-stone-800/90 transition-colors rounded-xl p-3 sm:p-4 border border-stone-700/60 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-amber-300 font-medium">
                <span>1. Needs Finance Check</span>
                <FileCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-amber-300 font-mono mt-1 truncate">
                {pendingFinanceCount} Items
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                Staff requests submitted
              </div>
            </div>

            {/* Metric 2: Stage 2 Needs GM Approval */}
            <div
              onClick={() => setActiveTab('requisitions')}
              className="bg-stone-800/60 hover:bg-stone-800/90 transition-colors rounded-xl p-3 sm:p-4 border border-stone-700/60 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-indigo-300 font-medium">
                <span>2. Needs GM Approval</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-indigo-300 font-mono mt-1 truncate">
                {pendingGMCount} Items
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                Verified by Finance
              </div>
            </div>

            {/* Metric 3: Stage 3 GM Approved (Ready for Payment) */}
            <div
              onClick={() => setActiveTab('requisitions')}
              className="bg-stone-800/60 hover:bg-stone-800/90 transition-colors rounded-xl p-3 sm:p-4 border border-stone-700/60 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-emerald-300 font-medium">
                <span>3. Ready for Payment</span>
                <Coins className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-emerald-300 font-mono mt-1 truncate">
                {readyForPaymentCount} Items
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                Returned to Finance for payout
              </div>
            </div>

            {/* Metric 4: Stage 4 Total Paid & Disbursed This Month */}
            <div
              onClick={() => setActiveTab('requisitions')}
              className="bg-stone-800/60 hover:bg-stone-800/90 transition-colors rounded-xl p-3 sm:p-4 border border-stone-700/60 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-sky-300 font-medium">
                <span>4. Paid This Month</span>
                <TrendingDown className="w-4 h-4 text-[#00AEEF]" />
              </div>
              <div className="text-base xs:text-lg sm:text-2xl font-black text-sky-300 font-mono mt-1 truncate">
                {formatBirr(liveSpentThisMonth)}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5 truncate">
                Fully disbursed & audited
              </div>
            </div>
          </div>

          {/* Requisitions Summary Status */}
          <div className="mt-5 pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-300">
            <span className="font-medium">
              Committed in Pipeline: <strong className="text-amber-300">{formatBirr(committedPendingAmount)}</strong> pending · <strong className="text-emerald-400">{formatBirr(liveSpentThisMonth)}</strong> settled this month
            </span>
            <span className="text-stone-400 font-mono text-[11px]">
              Kurtta Kids Clothes Internal Financial Control
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ACTION REQUIRED BANNER (If current role has pending tasks)     */}
      {/* ============================================================== */}
      {actionRequiredList.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
              <h2 className="text-sm font-bold text-amber-900">
                Action Required ({actionRequiredList.length} Requisition{actionRequiredList.length > 1 ? 's' : ''})
              </h2>
            </div>
            <span className="text-xs text-amber-800 font-semibold">
              Role: {roleInfo.title.split('(')[0]}
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
                    <span>·</span>
                    <span className="font-medium text-amber-700">
                      {req.status === 'pending_finance'
                        ? 'Needs Finance Check'
                        : req.status === 'pending_gm'
                        ? 'Needs GM Approval'
                        : 'Ready for Payment'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 gap-2">
                  <button
                    onClick={() => setSelectedRequisition(req)}
                    className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Review Details
                  </button>

                  {/* Fast Action Buttons by Role & State */}
                  {currentUser.role === 'finance' && req.status === 'pending_finance' && (
                    <button
                      onClick={() =>
                        verifyRequisition(
                          req.id,
                          'Verified by Finance. Forwarded to GM for approval.'
                        )
                      }
                      className="bg-[#00AEEF] hover:bg-[#0284C7] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Verify & Send to GM
                    </button>
                  )}

                  {currentUser.role === 'general_manager' && req.status === 'pending_gm' && (
                    <button
                      onClick={() =>
                        approveRequisition(
                          req.id,
                          'Officially approved by General Manager. Returned to Finance for payment.'
                        )
                      }
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
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
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
      {/* 2-COLUMN LAYOUT: Recent Requisitions & Outflow by Branch        */}
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
              className="text-xs font-semibold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {recentRequisitions.map((req) => {
              const status = getStatusDisplay(req.status);
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequisition(req)}
                  className="p-3.5 sm:p-4 hover:bg-stone-50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-900">
                        {req.voucherNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.bg} ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-800 mt-1 truncate">
                      {req.title}
                    </h4>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {req.requesterName} · {req.branch}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-extrabold text-stone-900 font-mono">
                      {formatBirr(req.amount)}
                    </div>
                    <div className="text-[11px] text-stone-500">{formatDate(req.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Outflow by Store Branch & Live Feed */}
        <div className="space-y-6">
          {/* Outflow by Store Branch */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#00AEEF]" />
              <span>Outflow by Store Branch</span>
            </h3>
            {sortedBranches.length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center">No disbursements this month</p>
            ) : (
              <div className="space-y-3">
                {sortedBranches.map(([branchName, total]) => {
                  const percent = liveSpentThisMonth > 0 ? (total / liveSpentThisMonth) * 100 : 0;

                  return (
                    <div key={branchName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-800 truncate max-w-[180px]">{branchName}</span>
                        <span className="font-bold text-stone-900 font-mono">
                          {formatBirr(total)}
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#00AEEF] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, percent)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live Recent Disbursements Feed */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-stone-900">Recent Disbursements</h3>
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>

            {recentDisbursed.length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center">No payments disbursed yet</p>
            ) : (
              <div className="space-y-2.5">
                {recentDisbursed.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequisition(req)}
                    className="p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-stone-900 truncate">{req.title}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {req.paymentMethod} {req.paymentReference ? `· ${req.paymentReference}` : ''}
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <div className="text-xs font-extrabold text-emerald-700 font-mono">
                        {formatBirr(req.amount)}
                      </div>
                      <div className="text-[9px] text-stone-400">
                        {formatDate(req.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
