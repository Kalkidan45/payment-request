import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatBirr, formatDate, getStatusDisplay, getRoleDisplay } from '../utils/format';
import { CATEGORY_DETAILS } from '../data/mockData';
import {
  Search,
  Filter,
  Plus,
  Receipt,
  Eye,
  Check,
  Coins,
  ChevronRight,
  SlidersHorizontal,
  X,
  FileCheck,
  Lock,
} from 'lucide-react';
import { Requisition, ExpenseCategory, BranchLocation } from '../types';

export const RequisitionList: React.FC = () => {
  const {
    requisitions,
    currentUser,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    setSelectedRequisition,
    setIsNewReqModalOpen,
    endorseRequisition,
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
          if (r.status !== 'pending_gm') {
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
            Track, approve, and disburse store vouchers across all branches
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
              <option value="Bole Medhanialem Flagship">Bole Branch</option>
              <option value="Piassa Kids Corner">Piassa Corner</option>
              <option value="Kazanchis Atelier">Kazanchis Workshop</option>
              <option value="Head Office / Warehouse">Head Office</option>
            </select>
          </div>
        )}

        {/* Segmented Status Filter Tabs (Anti-slop zero-pill clean button controls) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-stone-100">
          {(
            [
              { id: 'all', label: 'All Vouchers' },
              { id: 'pending', label: 'Pending Approval' },
              { id: 'approved', label: 'Approved for Payout' },
              { id: 'disbursed', label: 'Disbursed (Paid)' },
              { id: 'rejected', label: 'Declined' },
            ] as const
          ).map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Requisitions List: Responsive for Mobile Cards & Clean Desktop Rows */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredRequisitions.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No requisitions found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Try adjusting your search criteria, category filters, or submit a new petty cash
              payment request.
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
                  className="p-4 hover:bg-stone-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        cat ? cat.bg : 'bg-stone-100'
                      }`}
                    >
                      <Receipt className={`w-5 h-5 ${cat ? cat.color : 'text-stone-700'}`} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-900">
                          {req.voucherNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.bg} ${status.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
                          {status.label}
                        </span>
                        {req.urgency !== 'Normal' && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            {req.urgency}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-stone-900 mt-1 line-clamp-1">
                        {req.title}
                      </h3>

                      <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>Requester: {req.requesterName}</span>
                        <span>·</span>
                        <span>{req.branch}</span>
                        <span>·</span>
                        <span>Payee: {req.payee}</span>
                        <span>·</span>
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Amount + Quick Approval Actions */}
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
                      {/* General Manager: SOLE APPROVAL AUTHORITY */}
                      {currentUser?.role === 'general_manager' &&
                        req.status !== 'approved' &&
                        req.status !== 'disbursed' && (
                          <button
                            onClick={() =>
                              approveRequisition(req.id, 'Officially approved by General Manager.')
                            }
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            title="Approve Requisition for Payout"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                      {/* Finance Officer: Disburse ONLY IF GM APPROVED! */}
                      {currentUser?.role === 'finance' && (
                        req.status === 'approved' ? (
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
                        ) : req.status !== 'disbursed' && req.status !== 'rejected' ? (
                          <span
                            className="text-[10px] text-stone-500 bg-stone-100 border border-stone-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-not-allowed"
                            title="Awaiting General Manager approval. Finance cannot disburse until approved."
                          >
                            <Lock className="w-3 h-3 text-stone-400" />
                            <span>Needs GM Approval</span>
                          </span>
                        ) : null
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
