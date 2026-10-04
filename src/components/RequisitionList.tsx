import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatBirr, formatDate, getStatusDisplay } from '../utils/format';
import { CATEGORY_DETAILS } from '../data/mockData';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Eye,
  Check,
  Coins,
  Send,
  Clock,
  Lock,
  ChevronRight,
  Receipt,
  FileCheck,
  CheckCircle,
  X,
} from 'lucide-react';
import { RequisitionStatus } from '../types';

export const RequisitionList: React.FC = () => {
  const {
    requisitions,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    currentUser,
    setSelectedRequisition,
    setIsNewReqModalOpen,
    verifyRequisition,
    approveRequisition,
    disburseRequisition,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filtered list
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((r) => {
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'pending') {
          if (r.status !== 'pending_finance' && r.status !== 'pending_gm') {
            return false;
          }
        } else if (r.status !== filterStatus) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && r.category !== categoryFilter) {
        return false;
      }

      // Branch filter
      if (branchFilter !== 'all' && r.branch !== branchFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchVoucher = r.voucherNumber.toLowerCase().includes(q);
        const matchPayee = r.payee.toLowerCase().includes(q);
        const matchRequester = r.requesterName.toLowerCase().includes(q);
        const matchBranch = r.branch.toLowerCase().includes(q);
        if (!matchTitle && !matchVoucher && !matchPayee && !matchRequester && !matchBranch) {
          return false;
        }
      }

      return true;
    });
  }, [requisitions, filterStatus, categoryFilter, branchFilter, searchQuery]);

  return (
    <div className="space-y-4 sm:space-y-5 pb-28 md:pb-12">
      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Petty Cash Requisitions</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            4-Stage Control: Staff Request ➔ Finance Check ➔ GM Approval ➔ Finance Payment
          </p>
        </div>

        <button
          onClick={() => setIsNewReqModalOpen(true)}
          className="flex items-center justify-center gap-1.5 bg-[#00AEEF] hover:bg-[#0284C7] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-xs shadow-sky-900/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Requisition</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by voucher #, purpose, payee, or requester..."
              className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-[#00AEEF] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Toggle on Mobile */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="sm:hidden flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 text-stone-700 rounded-xl text-xs font-medium cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Category & Branch Filters</span>
          </button>

          {/* Category Dropdown (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Branches</option>
              <option value="Bole Medhanialem Flagship">Bole Medhanialem</option>
              <option value="Piassa Kids Corner">Piassa Corner</option>
              <option value="Kazanchis Atelier">Kazanchis Atelier</option>
              <option value="CMC Kids Boutique">CMC Boutique</option>
              <option value="Head Office / Warehouse">Head Office</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Sheet */}
        {showFiltersMobile && (
          <div className="sm:hidden grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full py-2 px-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
            >
              <option value="all">All Branches</option>
              <option value="Bole Medhanialem Flagship">Bole Medhanialem</option>
              <option value="Piassa Kids Corner">Piassa Corner</option>
              <option value="Kazanchis Atelier">Kazanchis Atelier</option>
              <option value="CMC Kids Boutique">CMC Boutique</option>
              <option value="Head Office / Warehouse">Head Office</option>
            </select>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-stone-100 pt-3 text-xs scrollbar-none">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Vouchers ({requisitions.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            In Pipeline (
            {requisitions.filter((r) => r.status === 'pending_finance' || r.status === 'pending_gm').length}
            )
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Ready for Payment ({requisitions.filter((r) => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilterStatus('disbursed')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'disbursed'
                ? 'bg-[#00AEEF] text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Paid & Disbursed ({requisitions.filter((r) => r.status === 'disbursed').length})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === 'rejected'
                ? 'bg-rose-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Declined ({requisitions.filter((r) => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Requisitions List Table/Cards */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredRequisitions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">No requisitions found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              There are no petty cash vouchers matching your active filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredRequisitions.map((req) => {
              const status = getStatusDisplay(req.status);
              const cat = CATEGORY_DETAILS[req.category];

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequisition(req)}
                  className="p-3.5 sm:p-4 hover:bg-stone-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer group"
                >
                  {/* Left side: Voucher ID, Title & Metadata */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:bg-sky-50 group-hover:text-[#0284C7] transition-colors">
                      <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-stone-900">
                          {req.voucherNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.bg} ${status.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
                          {status.label}
                        </span>
                        <span className="text-[11px] text-stone-500 hidden sm:inline">
                          · {req.branch}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-stone-800 mt-1 truncate">
                        {req.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 flex-wrap">
                        <span className="font-medium text-stone-600">
                          By: {req.requesterName} ({req.requesterRole})
                        </span>
                        <span>·</span>
                        <span>Payee: {req.payee}</span>
                        <span>·</span>
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Amount + Quick Pipeline Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-2.5 md:pt-0 border-stone-100 gap-2">
                    <div className="text-left md:text-right">
                      <div className="text-base font-extrabold text-stone-900 font-mono">
                        {formatBirr(req.amount)}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {req.paymentMethod}
                        {req.paymentReference && ` (${req.paymentReference})`}
                      </div>
                    </div>

                    {/* Quick Action buttons based on Role */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* 1. FINANCE TEAM ACTIONS */}
                      {currentUser?.role === 'finance' && (
                        <>
                          {req.status === 'pending_finance' && (
                            <button
                              onClick={() =>
                                verifyRequisition(
                                  req.id,
                                  'Verified by Finance. Forwarded to GM for approval.'
                                )
                              }
                              className="bg-[#00AEEF] hover:bg-[#0284C7] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              title="Verify receipt & send to General Manager"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Verify & Send to GM</span>
                            </button>
                          )}

                          {req.status === 'pending_gm' && (
                            <span
                              className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-default"
                              title="Verified by Finance. Waiting for General Manager to approve."
                            >
                              <Clock className="w-3 h-3 text-indigo-500" />
                              <span>Sent to GM</span>
                            </span>
                          )}

                          {req.status === 'approved' && (
                            <button
                              onClick={() =>
                                disburseRequisition(
                                  req.id,
                                  req.paymentMethod,
                                  `REF-${Math.floor(100000 + Math.random() * 900000)}`,
                                  'Authorized and disbursed by Finance Custodian following GM approval'
                                )
                              }
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              title="Disburse cash or electronic transfer"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>Disburse</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* 2. GENERAL MANAGER ACTIONS */}
                      {currentUser?.role === 'general_manager' && (
                        <>
                          {req.status === 'pending_finance' && (
                            <span
                              className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-default"
                              title="Finance team is checking receipts and verifying request."
                            >
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>Pending Finance</span>
                            </span>
                          )}

                          {req.status === 'pending_gm' && (
                            <button
                              onClick={() =>
                                approveRequisition(
                                  req.id,
                                  'Officially approved by General Manager. Returned to Finance for payout.'
                                )
                              }
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              title="Approve Requisition for Finance Payout"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {req.status === 'approved' && (
                            <span
                              className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-default"
                              title="Approved by GM. Sent to Finance for payment."
                            >
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span>Sent to Finance</span>
                            </span>
                          )}
                        </>
                      )}

                      <button
                        onClick={() => setSelectedRequisition(req)}
                        className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                        title="View Voucher"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
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
