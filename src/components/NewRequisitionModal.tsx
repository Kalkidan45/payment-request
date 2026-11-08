import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBirr } from '../utils/format';
import {
  X,
  FileCheck,
  Building2,
  Calendar,
  Sparkles,
  CreditCard,
  AlertCircle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { BranchLocation, PaymentMethod, BRANCH_LOCATIONS } from '../types';

export const NewRequisitionModal: React.FC = () => {
  const { isNewReqModalOpen, setIsNewReqModalOpen, createRequisition, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [branch, setBranch] = useState<BranchLocation>(
    currentUser?.branch || 'Shop 1'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Physical Cash');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isNewReqModalOpen || !currentUser || currentUser.role === 'finance' || currentUser.role === 'general_manager') return null;

  // Preset quick suggestions for retail stores (strictly adhering to <= 1000 Birr rule)
  const quickSuggestions = [
    { title: 'Zippers & Romper Tailoring Materials', amount: 450 },
    { title: 'Customer Doorstep Delivery Packages', amount: 350 },
    { title: 'Kurtta Store Packaging & Paper Bags', amount: 750 },
    { title: 'Hypoallergenic Disinfecting Wipes & Cleaners', amount: 980 },
    { title: 'Emergency Store Cleaning & Water Supply', amount: 600 },
  ];

  const handleApplySuggestion = (sug: typeof quickSuggestions[0]) => {
    setTitle(sug.title);
    setAmount(sug.amount);
    setErrorMsg('');
  };

  const handleAmountChange = (val: number) => {
    setAmount(val);
    if (val > 1000) {
      setErrorMsg('Store requisitions are strictly limited to a maximum of 1,000 Birr per request.');
    } else {
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!title.trim() || amount <= 0) {
      setErrorMsg('Please fill in purpose title and a valid Birr amount.');
      return;
    }

    if (amount > 1000) {
      setErrorMsg('Store requisitions are strictly limited to a maximum of 1,000 Birr per request.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequisition({
        title: title.trim(),
        amount,
        branch,
        paymentMethod,
        description: description.trim() || `Payment requisition for ${title}`,
      });

      // Reset form
      setTitle('');
      setAmount(500);
      setDescription('');
      setErrorMsg('');
      setIsNewReqModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit requisition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAmountOverLimit = amount > 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl w-full max-w-lg my-auto overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-stone-900 to-stone-850 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00AEEF]"></span>
              <h2 className="text-sm sm:text-lg font-bold">New Cash Requisition</h2>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">
              Kurtta Kids Clothes · Expense voucher requisition (Max 1,000 Br)
            </p>
          </div>
          <button
            onClick={() => {
              setIsNewReqModalOpen(false);
              setErrorMsg('');
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="bg-stone-50 px-3 sm:px-4 py-2 border-b border-stone-200 overflow-x-auto flex items-center gap-1.5 no-scrollbar text-xs shrink-0">
          <span className="text-stone-500 font-semibold shrink-0 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#00AEEF]" />
            Quick:
          </span>
          {quickSuggestions.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplySuggestion(sug)}
              className="bg-white hover:bg-sky-50 active:scale-95 border border-stone-200 text-stone-700 px-2.5 py-1 rounded-lg shrink-0 transition-all text-[11px] font-medium cursor-pointer"
            >
              {sug.title.split(' ')[0]} {sug.title.split(' ')[1]} ({formatBirr(sug.amount)})
            </button>
          ))}
        </div>

        {/* Policy Limit Alert Banner */}
        <div className="px-3.5 sm:px-6 pt-3">
          <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-sky-800 font-medium">
              <Info className="w-4 h-4 text-[#00AEEF] shrink-0" />
              <span><strong>System Policy:</strong> Store requisitions are capped at <strong>1,000 Birr</strong> per request.</span>
            </div>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md font-bold shrink-0">
              Limit: 1,000 Br
            </span>
          </div>
        </div>

        {/* Error message if triggered */}
        {errorMsg && (
          <div className="px-3.5 sm:px-6 pt-2">
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Amount in Ethiopian Birr */}
          <div
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all border ${
              isAmountOverLimit
                ? 'bg-rose-50/70 border-rose-300'
                : 'bg-sky-50/70 border-sky-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <label
                className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                  isAmountOverLimit ? 'text-rose-700' : 'text-[#0284C7]'
                }`}
              >
                Requisition Amount (Ethiopian Birr / ብር) *
              </label>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAmountOverLimit
                    ? 'bg-rose-200 text-rose-800'
                    : 'bg-sky-200/80 text-sky-800'
                }`}
              >
                Max 1,000 Br Limit
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xl sm:text-2xl font-black font-mono ${
                  isAmountOverLimit ? 'text-rose-600' : 'text-[#0284C7]'
                }`}
              >
                Br
              </span>
              <input
                type="number"
                min="10"
                max="1000"
                step="10"
                required
                value={amount || ''}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                className={`w-full text-2xl sm:text-3xl font-black bg-transparent border-b-2 font-mono py-1 focus:outline-hidden transition-colors ${
                  isAmountOverLimit
                    ? 'text-rose-700 border-rose-400 focus:border-rose-600'
                    : 'text-stone-900 border-sky-300 focus:border-[#00AEEF]'
                }`}
                placeholder="0.00"
              />
            </div>

            {isAmountOverLimit && (
              <p className="text-xs text-rose-600 font-semibold mt-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Amount exceeds allowable limit! Maximum request is 1,000 Birr.</span>
              </p>
            )}

            {/* Quick amount increment pills */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
              {[100, 250, 500, 750, 1000].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => {
                    setAmount(inc);
                    setErrorMsg('');
                  }}
                  className={`border text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer shrink-0 active:scale-95 ${
                    amount === inc
                      ? 'bg-[#00AEEF] text-white border-[#00AEEF] shadow-xs'
                      : 'bg-white hover:bg-sky-100 border-sky-200 text-[#0284C7]'
                  }`}
                >
                  {inc === 1000 ? 'Max (1,000 Br)' : `${inc} Br`}
                </button>
              ))}
            </div>
          </div>

          {/* Expense Purpose / Title */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Purpose / Expense Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Replacement zippers & cotton lining for baby rompers"
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900 focus:outline-hidden focus:border-[#00AEEF] min-h-[44px]"
            />
          </div>

          {/* Branch Location & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Store Branch / Location *
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as BranchLocation)}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900 bg-white focus:outline-hidden focus:border-[#00AEEF] cursor-pointer min-h-[44px]"
              >
                {BRANCH_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Requested Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900 bg-white focus:outline-hidden focus:border-[#00AEEF] cursor-pointer min-h-[44px]"
              >
                <option value="Physical Cash">Physical Cash (From Safe)</option>
                <option value="Telebirr">Telebirr Direct Payout</option>
                <option value="CBE Birr">CBE Birr Corporate Payout</option>
                <option value="Amole / Awash">Amole / Awash Pay</option>
              </select>
            </div>
          </div>

          {/* Operational Justification / Description */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Operational Justification / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or explanation for this expenditure..."
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900 focus:outline-hidden focus:border-[#00AEEF]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0 || isAmountOverLimit}
              className={`w-full font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[48px] ${
                isAmountOverLimit
                  ? 'bg-rose-500 text-white cursor-not-allowed opacity-90'
                  : 'bg-[#00AEEF] hover:bg-[#0284C7] active:bg-[#0369A1] text-white shadow-sky-900/30 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>
                {isAmountOverLimit
                  ? 'Amount Exceeds 1,000 Birr Limit'
                  : `Submit Requisition for Approval (${formatBirr(amount)})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
