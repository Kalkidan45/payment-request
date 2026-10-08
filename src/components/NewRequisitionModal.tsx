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
} from 'lucide-react';
import { BranchLocation, PaymentMethod } from '../types';

export const NewRequisitionModal: React.FC = () => {
  const { isNewReqModalOpen, setIsNewReqModalOpen, createRequisition, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(1200);
  const [branch, setBranch] = useState<BranchLocation>(
    currentUser?.branch || 'Bole Medhanialem Flagship'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Physical Cash');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewReqModalOpen || !currentUser) return null;

  // Preset quick suggestions for retail stores
  const quickSuggestions = [
    { title: 'Zippers & Organic Cotton Lining for Baby Rompers', amount: 1450 },
    { title: 'Customer Doorstep Delivery Packages', amount: 450 },
    { title: 'Kurtta Branded Kraft Paper Shopping Bags', amount: 2400 },
    { title: 'Hypoallergenic Disinfecting Wipes & Cleaners', amount: 980 },
  ];

  const handleApplySuggestion = (sug: typeof quickSuggestions[0]) => {
    setTitle(sug.title);
    setAmount(sug.amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) {
      alert('Please fill in purpose title and a valid Birr amount.');
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
      setAmount(1200);
      setDescription('');
      setIsNewReqModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Kurtta Kids Clothes · Expense voucher requisition
            </p>
          </div>
          <button
            onClick={() => setIsNewReqModalOpen(false)}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Amount in Ethiopian Birr */}
          <div className="bg-sky-50/70 border border-sky-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
            <label className="block text-[11px] sm:text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
              Requisition Amount (Ethiopian Birr / ብር) *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#0284C7] font-mono">Br</span>
              <input
                type="number"
                min="10"
                max="50000"
                step="10"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full text-2xl sm:text-3xl font-black text-stone-900 bg-transparent border-b-2 border-sky-300 focus:outline-hidden focus:border-[#00AEEF] font-mono py-1"
                placeholder="0.00"
              />
            </div>

            {/* Quick amount increment pills */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
              {[250, 500, 1000, 2000, 3500].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setAmount(inc)}
                  className="bg-white hover:bg-sky-100 active:scale-95 border border-sky-200 text-[#0284C7] text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer shrink-0"
                >
                  +{inc}
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
                <option value="Bole Medhanialem Flagship">Bole Medhanialem Flagship</option>
                <option value="Piassa Kids Corner">Piassa Kids Corner</option>
                <option value="Kazanchis Atelier">Kazanchis Atelier</option>
                <option value="CMC Kids Boutique">CMC Kids Boutique</option>
                <option value="Head Office / Warehouse">Head Office / Warehouse</option>
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
              disabled={isSubmitting}
              className="w-full bg-[#00AEEF] hover:bg-[#0284C7] active:bg-[#0369A1] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-sky-900/30 flex items-center justify-center gap-2 cursor-pointer min-h-[48px] active:scale-98"
            >
              <FileCheck className="w-4 h-4" />
              <span>Submit Requisition for Approval ({formatBirr(amount)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
