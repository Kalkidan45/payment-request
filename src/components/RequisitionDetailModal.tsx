import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBirr, formatDate, getStatusDisplay, getRoleDisplay } from '../utils/format';
import { CATEGORY_DETAILS } from '../data/mockData';
import {
  X,
  Printer,
  Receipt,
  User,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Coins,
  Send,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Clock,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { PaymentMethod } from '../types';

export const RequisitionDetailModal: React.FC = () => {
  const {
    selectedRequisition,
    setSelectedRequisition,
    currentUser,
    verifyRequisition,
    approveRequisition,
    disburseRequisition,
    rejectRequisition,
    setVoucherToPrint,
    setIsPrintModalOpen,
  } = useApp();

  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [disburseMethod, setDisburseMethod] = useState<PaymentMethod>(
    selectedRequisition?.paymentMethod || 'Physical Cash'
  );
  const [disburseRef, setDisburseRef] = useState('');
  const [showImageZoom, setShowImageZoom] = useState(false);

  if (!selectedRequisition) return null;

  const req = selectedRequisition;
  const status = getStatusDisplay(req.status);
  const cat = CATEGORY_DETAILS[req.category];

  // Stage 2: Finance checks and forwards to GM
  const handleVerify = () => {
    verifyRequisition(
      req.id,
      comment || 'Checked & verified by Finance. Forwarded to General Manager for approval.'
    );
    setSelectedRequisition(null);
  };

  // Stage 3: GM approves and returns to Finance
  const handleApprove = () => {
    approveRequisition(
      req.id,
      comment || 'Approved by General Manager. Returned to Finance for payment disbursement.'
    );
    setSelectedRequisition(null);
  };

  // Stage 4: Finance disburses payment
  const handleDisburse = () => {
    disburseRequisition(
      req.id,
      disburseMethod,
      disburseRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      comment || 'Disbursed and recorded in petty cash ledger following GM approval'
    );
    setSelectedRequisition(null);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectRequisition(req.id, rejectReason);
    setSelectedRequisition(null);
  };

  const handlePrint = () => {
    setVoucherToPrint(req);
    setIsPrintModalOpen(true);
  };

  // 4-Step Pipeline Status
  const isStep1Done = true; // Staff request submitted
  const isStep2Done = req.status === 'pending_gm' || req.status === 'approved' || req.status === 'disbursed';
  const isStep3Done = req.status === 'approved' || req.status === 'disbursed';
  const isStep4Done = req.status === 'disbursed';
  const isRejected = req.status === 'rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl w-full max-w-2xl my-auto overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/20 text-[#00AEEF] flex items-center justify-center font-bold shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-bold font-mono text-sky-300 truncate">
                  {req.voucherNumber}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border ${status.bg} ${status.color} truncate`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
                  {status.label}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 truncate">
                Kurtta Kids Clothes Official Payment Requisition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer active:scale-95"
              title="Print Official Petty Cash Voucher"
            >
              <Printer className="w-3.5 h-3.5 text-[#00AEEF]" />
              <span className="hidden sm:inline">Print Voucher</span>
            </button>
            <button
              onClick={() => setSelectedRequisition(null)}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4-Stage Workflow Stepper */}
        <div className="bg-stone-100/80 px-4 py-3 border-b border-stone-200">
          <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-2 flex items-center justify-between">
            <span>4-Step Payment Workflow</span>
            <span className="text-[#0284C7] font-semibold">Staff ➔ Finance ➔ GM ➔ Finance</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
            {/* Step 1 */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                isStep1Done
                  ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <CheckCircle className="w-3 h-3 text-sky-600" />
                <span className="text-[9px] uppercase tracking-wider">Step 1</span>
              </div>
              <div className="truncate">Staff Request</div>
            </div>

            {/* Step 2 */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                isStep2Done
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                  : req.status === 'pending_finance'
                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold ring-2 ring-amber-400/30'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                {isStep2Done ? (
                  <CheckCircle className="w-3 h-3 text-indigo-600" />
                ) : req.status === 'pending_finance' ? (
                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                ) : (
                  <Clock className="w-3 h-3 text-stone-400" />
                )}
                <span className="text-[9px] uppercase tracking-wider">Step 2</span>
              </div>
              <div className="truncate">Finance Check</div>
            </div>

            {/* Step 3 */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                isStep3Done
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                  : req.status === 'pending_gm'
                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold ring-2 ring-amber-400/30'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                {isStep3Done ? (
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                ) : req.status === 'pending_gm' ? (
                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                ) : (
                  <Clock className="w-3 h-3 text-stone-400" />
                )}
                <span className="text-[9px] uppercase tracking-wider">Step 3</span>
              </div>
              <div className="truncate">GM Approval</div>
            </div>

            {/* Step 4 */}
            <div
              className={`p-2 rounded-xl border transition-all ${
                isStep4Done
                  ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                  : req.status === 'approved'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-400/30'
                  : 'bg-white border-stone-200 text-stone-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                {isStep4Done ? (
                  <CheckCircle className="w-3 h-3 text-sky-600" />
                ) : req.status === 'approved' ? (
                  <Coins className="w-3 h-3 text-emerald-600 animate-pulse" />
                ) : (
                  <Coins className="w-3 h-3 text-stone-400" />
                )}
                <span className="text-[9px] uppercase tracking-wider">Step 4</span>
              </div>
              <div className="truncate">Finance Payment</div>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Key Amount & Title Banner */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">
                Requisition Amount
              </span>
              <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
                {formatBirr(req.amount)}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                Preferred Method: <strong className="text-stone-800">{req.paymentMethod}</strong>
                {req.paymentReference && ` · Ref: ${req.paymentReference}`}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">
                Branch / Location
              </span>
              <div className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">
                {req.branch}
              </div>
              <div className="text-xs text-sky-800 font-semibold mt-0.5">
                {cat?.name || req.category}
              </div>
            </div>
          </div>

          {/* Requisition Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-stone-400 font-medium">Expense Title:</span>
              <p className="font-bold text-stone-900 mt-0.5 text-sm">{req.title}</p>
            </div>

            <div>
              <span className="text-stone-400 font-medium">Payee / Beneficiary:</span>
              <p className="font-semibold text-stone-900 mt-0.5 text-sm">{req.payee}</p>
            </div>

            <div>
              <span className="text-stone-400 font-medium">Requester:</span>
              <p className="font-semibold text-stone-900 mt-0.5">
                {req.requesterName} · {req.requesterRole}
              </p>
              <p className="text-stone-500 text-[11px]">{req.requesterPhone}</p>
            </div>

            <div>
              <span className="text-stone-400 font-medium">Urgency & Date:</span>
              <p className="font-semibold text-stone-900 mt-0.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                    req.urgency === 'Emergency'
                      ? 'bg-rose-500'
                      : req.urgency === 'Urgent'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                ></span>
                {req.urgency} Priority · {formatDate(req.createdAt)}
              </p>
            </div>
          </div>

          {/* Description */}
          {req.description && (
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 text-xs">
              <span className="text-stone-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                Business Justification & Details:
              </span>
              <p className="text-stone-700 leading-relaxed">{req.description}</p>
            </div>
          )}

          {/* Rejection Note */}
          {req.rejectionReason && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs">
              <span className="font-bold flex items-center gap-1 text-rose-900 mb-1">
                <XCircle className="w-4 h-4 text-rose-600" />
                Reason for Rejection:
              </span>
              <p className="mt-0.5">{req.rejectionReason}</p>
            </div>
          )}

          {/* Receipt / Invoice Attachment */}
          {req.receiptUrl && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-stone-400 font-medium">Attached Receipt / Bill Slip:</span>
                <span className="text-stone-500 text-[11px]">{req.receiptName}</span>
              </div>
              <div
                onClick={() => setShowImageZoom(true)}
                className="relative group rounded-xl overflow-hidden border border-stone-200 cursor-pointer bg-stone-100 max-h-48 flex items-center justify-center"
              >
                <img
                  src={req.receiptUrl}
                  alt="Receipt Preview"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                  <ExternalLink className="w-4 h-4" />
                  <span>Click to Zoom Receipt</span>
                </div>
              </div>
            </div>
          )}

          {/* Zoom Lightbox */}
          {showImageZoom && (
            <div
              className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
              onClick={() => setShowImageZoom(false)}
            >
              <div className="max-w-2xl max-h-[90vh] bg-white p-2 rounded-2xl">
                <img
                  src={req.receiptUrl}
                  alt="Enlarged Receipt"
                  className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Approval Workflow & Audit Trail */}
          <div className="border-t border-stone-200 pt-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Audit Trail & Timestamped Log</span>
            </h3>
            <div className="space-y-2.5">
              {req.history.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">
                        {step.userName} ({step.userRole.replace('_', ' ')})
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {formatDate(step.timestamp)}
                      </span>
                    </div>
                    <div className="text-[11px] text-sky-900 font-semibold capitalize mt-0.5 flex items-center gap-1">
                      <span>Action:</span>
                      <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-[10px]">
                        {step.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {step.comment && (
                      <p className="text-stone-600 mt-1 text-[11px]">{step.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Role-Based Action Controls */}
          {currentUser && req.status !== 'disbursed' && req.status !== 'rejected' && (
            <div className="border-t border-stone-200 pt-4 bg-stone-50 p-4 rounded-2xl">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00AEEF]" />
                <span>Action Controls ({currentUser.roleTitle})</span>
              </h3>

              {!isRejecting ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add verification/approval comment or notes (optional)..."
                    className="w-full text-base sm:text-xs p-2.5 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF] min-h-[44px]"
                  />

                  {/* 1. FINANCE TEAM ACTIONS */}
                  {currentUser.role === 'finance' && (
                    <div className="space-y-2.5">
                      {req.status === 'pending_finance' && (
                        /* STAGE 2: Finance checks request and sends to GM */
                        <div className="space-y-2">
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <FileCheck className="w-4 h-4 text-amber-700" />
                              <span>Finance Review & Verification Required:</span>
                            </div>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                              Check the receipt, vendor quotation, and budget allocation. Once checked, click below to verify and forward to the General Manager for final approval.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleVerify}
                              className="flex-1 bg-[#00AEEF] hover:bg-[#0284C7] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              <span>Verify & Send to General Manager ({formatBirr(req.amount)})</span>
                            </button>
                            <button
                              onClick={() => setIsRejecting(true)}
                              className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-semibold py-2.5 px-3 rounded-xl text-xs cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {req.status === 'pending_gm' && (
                        /* Request is currently waiting for GM approval */
                        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-indigo-700 animate-pulse" />
                            <span>Forwarded to General Manager:</span>
                          </div>
                          <p className="text-[11px] text-indigo-800 leading-relaxed">
                            You have verified this requisition. It is now awaiting executive approval from General Manager Solomon Girma.
                          </p>
                        </div>
                      )}

                      {req.status === 'approved' && (
                        /* STAGE 4: GM approved! Finance is authorized to pay/disburse */
                        <div className="space-y-2.5">
                          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                              <CheckCircle className="w-4 h-4 text-emerald-700" />
                              <span>Approved by General Manager — Ready for Payout</span>
                            </div>
                            <p className="text-[11px] text-emerald-800">
                              The General Manager has approved this voucher. You are now authorized to disburse funds.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                                Disbursement Method
                              </label>
                              <select
                                value={disburseMethod}
                                onChange={(e) => setDisburseMethod(e.target.value as PaymentMethod)}
                                className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-medium"
                              >
                                <option value="Physical Cash">Physical Cash (Safe Box)</option>
                                <option value="Telebirr">Telebirr Direct Payout</option>
                                <option value="CBE Birr">CBE Birr Transfer</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                                Voucher / Payment Ref #
                              </label>
                              <input
                                type="text"
                                value={disburseRef}
                                onChange={(e) => setDisburseRef(e.target.value)}
                                placeholder="e.g. CASH-VOUCH-110"
                                className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={handleDisburse}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                            >
                              <Coins className="w-4 h-4" />
                              <span>Disburse {formatBirr(req.amount)} to Payee</span>
                            </button>
                            <button
                              onClick={() => setIsRejecting(true)}
                              className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-semibold py-2.5 px-3 rounded-xl text-xs cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. GENERAL MANAGER ACTIONS */}
                  {currentUser.role === 'general_manager' && (
                    <div className="space-y-2.5">
                      {req.status === 'pending_finance' && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-700" />
                            <span>Step 2: Awaiting Finance Check:</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Finance team is checking the receipts and verifying the request. It will appear for your executive approval once verified.
                          </p>
                        </div>
                      )}

                      {req.status === 'pending_gm' && (
                        /* STAGE 3: GM Approves and returns to Finance */
                        <div className="space-y-2">
                          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-indigo-700" />
                              <span>👑 General Manager Executive Approval:</span>
                            </div>
                            <p className="text-[11px] text-indigo-800 leading-relaxed">
                              Finance has verified this request. You hold sole executive authorization to approve store funds.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleApprove}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve & Send to Finance for Payment ({formatBirr(req.amount)})</span>
                            </button>
                            <button
                              onClick={() => setIsRejecting(true)}
                              className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-semibold py-2.5 px-3 rounded-xl text-xs cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {req.status === 'approved' && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                            <CheckCircle className="w-4 h-4 text-emerald-700" />
                            <span>Approved by General Manager:</span>
                          </div>
                          <p className="text-[11px] text-emerald-800 leading-relaxed">
                            This voucher has been officially approved and returned to Finance for payment disbursement.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. STAFF / REQUESTER VIEW */}
                  {currentUser.role === 'staff' && (
                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#00AEEF]" />
                        <span>Requisition in Progress:</span>
                      </div>
                      <p className="text-[11px] text-sky-800 leading-relaxed">
                        Your requisition is being processed through the standard 4-step control workflow (Staff Request ➔ Finance Check ➔ GM Approval ➔ Finance Payment).
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Rejection Reason Form */
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-rose-800">
                    State Reason for Declining Requisition *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Non-compliant receipt, exceeds petty cash allocation, or duplicate requisition..."
                    className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-xl focus:outline-hidden focus:border-rose-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReject}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2 px-3 rounded-xl text-xs cursor-pointer"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => setIsRejecting(false)}
                      className="bg-stone-200 text-stone-700 py-2 px-3 rounded-xl text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
