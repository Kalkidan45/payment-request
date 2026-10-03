import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORY_DETAILS } from '../data/mockData';
import { formatBirr } from '../utils/format';
import {
  X,
  Upload,
  Receipt,
  AlertCircle,
  FileCheck,
  Building2,
  Calendar,
  Sparkles,
  Camera,
  Trash2,
} from 'lucide-react';
import { ExpenseCategory, BranchLocation, PaymentMethod } from '../types';

export const NewRequisitionModal: React.FC = () => {
  const { isNewReqModalOpen, setIsNewReqModalOpen, createRequisition, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('fabric_accessories');
  const [amount, setAmount] = useState<number>(1200);
  const [branch, setBranch] = useState<BranchLocation>(
    currentUser?.branch || 'Bole Medhanialem Flagship'
  );
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Physical Cash');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(
    'https://images.unsplash.com/photo-1554415707-9e4c018a482a?w=600&auto=format&fit=crop&q=80'
  );
  const [receiptName, setReceiptName] = useState<string>('receipt_preview.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewReqModalOpen || !currentUser) return null;

  // Preset quick suggestions for retail stores
  const quickSuggestions = [
    { title: 'Zippers & Organic Cotton Lining', category: 'fabric_accessories' as ExpenseCategory, amount: 1450, payee: 'Mercato Habesha Thread Store' },
    { title: 'Customer Doorstep Delivery - Bole', category: 'local_courier' as ExpenseCategory, amount: 450, payee: 'Fetan Express Delivery' },
    { title: 'Kurtta Branded Kraft Paper Shopping Bags', category: 'packaging_tags' as ExpenseCategory, amount: 2400, payee: 'Addis Colour Packaging' },
    { title: 'Hypoallergenic Disinfecting Wipes & Cleaners', category: 'cleaning_sanitation' as ExpenseCategory, amount: 980, payee: 'Family First Supermarket' },
  ];

  const handleApplySuggestion = (sug: typeof quickSuggestions[0]) => {
    setTitle(sug.title);
    setCategory(sug.category);
    setAmount(sug.amount);
    setPayee(sug.payee);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setReceiptUrl(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0 || !payee.trim()) {
      alert('Please fill in title, payee, and a valid Birr amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequisition({
        title: title.trim(),
        category,
        amount,
        branch,
        payee: payee.trim(),
        paymentMethod,
        description: description.trim() || `Payment requisition for ${title}`,
        urgency,
        receiptUrl,
        receiptName,
      });

      // Reset form
      setTitle('');
      setAmount(1200);
      setPayee('');
      setDescription('');
      setIsNewReqModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl w-full max-w-xl my-auto overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-stone-900 to-stone-850 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00AEEF]"></span>
              <h2 className="text-sm sm:text-lg font-bold">New Cash Requisition</h2>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">
              Kurtta Kids Clothes · Expense voucher requisition & approval
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

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
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

          {/* Expense Title */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Purpose / Expense Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 50 baby clothing zippers & cotton lining"
              className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900 focus:outline-hidden focus:border-[#00AEEF] min-h-[44px]"
            />
          </div>

          {/* Category & Branch Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Expense Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900 bg-white focus:outline-hidden focus:border-[#00AEEF] cursor-pointer min-h-[44px]"
              >
                {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Payee Vendor & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Payee / Vendor Name *
              </label>
              <input
                type="text"
                required
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                placeholder="e.g. Mercato Habesha Haberdashery"
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900 focus:outline-hidden focus:border-[#00AEEF] min-h-[44px]"
              />
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

          {/* Urgency & Justification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900 bg-white focus:outline-hidden focus:border-[#00AEEF] cursor-pointer min-h-[44px]"
              >
                <option value="Normal">Normal (Routine)</option>
                <option value="Urgent">Urgent (Needed Today)</option>
                <option value="Emergency">Emergency (Immediate)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Operational Justification
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Reason or department benefit..."
                className="w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900 focus:outline-hidden focus:border-[#00AEEF] min-h-[44px]"
              />
            </div>
          </div>

          {/* Receipt Attachment (Mobile Camera or Upload) */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Receipt or Proforma Snapshot
            </label>
            <div className="border-2 border-dashed border-stone-300 hover:border-sky-400 rounded-xl p-3 sm:p-4 text-center bg-stone-50/50 transition-colors">
              {receiptUrl ? (
                <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-stone-200">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={receiptUrl}
                      alt="Receipt"
                      className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                    />
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-semibold text-stone-800 truncate max-w-[180px]">
                        {receiptName}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                        <FileCheck className="w-3 h-3" /> Attached successfully
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptUrl(undefined);
                        setReceiptName('');
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <label className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors">
                      <span>Change</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <Receipt className="w-8 h-8 text-stone-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-stone-800">
                    Upload receipt or photo snapshot
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    PNG, JPG, or PDF (Supports smartphone camera capture)
                  </p>
                  <label className="mt-2.5 inline-flex items-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs active:scale-95">
                    <Camera className="w-3.5 h-3.5 text-[#00AEEF]" />
                    <span>Select or Snap Photo</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
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
