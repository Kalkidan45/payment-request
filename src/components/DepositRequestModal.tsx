import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { X, Coins, Send, Building2 } from 'lucide-react';

export const DepositRequestModal: React.FC = () => {
  const { isDepositModalOpen, setIsDepositModalOpen, createDepositRequest, currentUser } = useApp();

  const [amount, setAmount] = useState<string>('50000');
  const [title, setTitle] = useState<string>('Monthly Petty Cash Replenishment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CBE Birr');
  const [description, setDescription] = useState<string>(
    'Requested additional petty cash deposit to replenish store operations float for branch disbursements.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isDepositModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid deposit amount in Birr (ETB).');
      return;
    }

    try {
      setIsSubmitting(true);
      await createDepositRequest({
        amount: numAmount,
        title: title.trim(),
        description: description.trim(),
        paymentMethod,
      });
      setIsSubmitting(false);
      setIsDepositModalOpen(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to submit deposit request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Request Fund Deposit from GM</h2>
              <p className="text-xs text-stone-400">
                Finance Department Petty Cash Replenishment Request
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDepositModalOpen(false)}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-xs text-sky-800">
            <strong>Workflow Notice:</strong> As Finance, you are requesting a cash deposit / fund replenishment from the General Manager. Once approved by the GM, the deposit amount will be added to the petty cash balance.
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Deposit Purpose / Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Monthly Petty Cash Replenishment"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:outline-hidden focus:border-[#00AEEF] focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Deposit Amount (ETB / Birr)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-stone-500">
                  ETB
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold font-mono text-stone-900 focus:outline-hidden focus:border-[#00AEEF] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:outline-hidden focus:border-[#00AEEF] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="CBE Birr">CBE Birr</option>
                <option value="Telebirr">Telebirr</option>
                <option value="Physical Cash">Physical Cash Safe</option>
                <option value="Amole / Awash">Awash Bank / Amole</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Detailed Description & Justification
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this deposit is needed for store operations..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:outline-hidden focus:border-[#00AEEF] focus:bg-white transition-colors resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 bg-[#00AEEF] hover:bg-[#0284C7] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Request...' : 'Send Deposit Request to GM'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
