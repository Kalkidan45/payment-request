import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { formatBirr, formatDateOnly } from '../utils/format';
import { CATEGORY_DETAILS } from '../data/mockData';
import { X, Printer, CheckCircle } from 'lucide-react';

export const PrintVoucherModal: React.FC = () => {
  const { isPrintModalOpen, setIsPrintModalOpen, voucherToPrint } = useApp();

  if (!isPrintModalOpen || !voucherToPrint) return null;

  const req = voucherToPrint;
  const cat = CATEGORY_DETAILS[req.category];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden border border-stone-200 print:shadow-none print:border-none print:w-full">
        {/* Screen Controls Header (hidden in print) */}
        <div className="p-3 sm:p-4 bg-stone-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#00AEEF]" />
            <span className="text-xs sm:text-sm font-bold">
              Official Petty Cash Voucher Print Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#00AEEF] hover:bg-[#0284C7] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Voucher Document */}
        <div className="p-6 sm:p-8 text-stone-900 font-sans space-y-6 bg-white" id="printable-voucher">
          {/* Header */}
          <div className="border-b-2 border-stone-900 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Logo size="lg" />
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">
                  Quality Children's Apparel
                </p>
                <p className="text-[10px] text-stone-500">
                  TIN: 0049281902 · Addis Ababa, Ethiopia
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-black uppercase tracking-wider text-amber-800">
                PETTY CASH VOUCHER
              </div>
              <div className="text-base font-mono font-black text-stone-900 mt-0.5">
                {req.voucherNumber}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                Date: {formatDateOnly(req.updatedAt || req.createdAt)}
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-stone-300 p-4 rounded-xl bg-stone-50/50">
            <div>
              <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                Paid To (Payee / Vendor):
              </span>
              <span className="text-sm font-bold text-stone-900 block mt-0.5">{req.payee}</span>
            </div>

            <div>
              <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                Branch / Department:
              </span>
              <span className="text-sm font-bold text-stone-900 block mt-0.5">{req.branch}</span>
            </div>

            <div>
              <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                Expense Classification:
              </span>
              <span className="text-xs font-bold text-stone-800 block mt-0.5">
                {cat?.name || req.category}
              </span>
            </div>

            <div>
              <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px]">
                Payment Mode & Ref:
              </span>
              <span className="text-xs font-bold text-stone-800 block mt-0.5">
                {req.paymentMethod} {req.paymentReference ? `(${req.paymentReference})` : ''}
              </span>
            </div>
          </div>

          {/* Description & Itemization */}
          <div>
            <span className="text-stone-500 font-semibold block uppercase tracking-wider text-[10px] mb-1">
              Particulars / Purpose of Expenditure:
            </span>
            <div className="border border-stone-300 p-3 rounded-xl text-xs text-stone-800 min-h-16 leading-relaxed">
              <strong className="block text-stone-900 font-bold mb-1">{req.title}</strong>
              {req.description}
            </div>
          </div>

          {/* Amount Box */}
          <div className="border-2 border-stone-900 p-4 rounded-xl flex items-center justify-between bg-stone-50">
            <div>
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                Total Amount in Ethiopian Birr (ETB)
              </span>
              <div className="text-xs text-stone-500 italic mt-0.5">
                Paid from store petty cash safe box
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-stone-900">
              {formatBirr(req.amount)}
            </div>
          </div>

          {/* 4 Signatures Block (Crucial for Ethiopian Accounting) */}
          <div className="pt-4 border-t border-stone-200">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-4">
              Required Authorizations & Signatures
            </span>

            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              {/* Prepared By */}
              <div className="border border-stone-300 p-2.5 rounded-lg flex flex-col justify-between h-24">
                <span className="text-[10px] text-stone-500 uppercase font-semibold">
                  Prepared By (Requester)
                </span>
                <div className="text-[11px] font-bold text-stone-900 truncate">
                  {req.requesterName}
                </div>
                <div className="border-t border-dashed border-stone-400 pt-1 text-[9px] text-stone-400">
                  Signature
                </div>
              </div>

              {/* Checked By */}
              <div className="border border-stone-300 p-2.5 rounded-lg flex flex-col justify-between h-24">
                <span className="text-[10px] text-stone-500 uppercase font-semibold">
                  Store / Branch Manager
                </span>
                <div className="text-[11px] font-bold text-stone-900">Dawit Bekele</div>
                <div className="border-t border-dashed border-stone-400 pt-1 text-[9px] text-stone-400">
                  Signature & Date
                </div>
              </div>

              {/* Approved / Custodian */}
              <div className="border border-stone-300 p-2.5 rounded-lg flex flex-col justify-between h-24">
                <span className="text-[10px] text-stone-500 uppercase font-semibold">
                  Finance Custodian
                </span>
                <div className="text-[11px] font-bold text-stone-900">Bethelhem Haile</div>
                <div className="border-t border-dashed border-stone-400 pt-1 text-[9px] text-stone-400">
                  Signature & Seal
                </div>
              </div>

              {/* Received By */}
              <div className="border border-stone-300 p-2.5 rounded-lg flex flex-col justify-between h-24">
                <span className="text-[10px] text-stone-500 uppercase font-semibold">
                  Cash Received By
                </span>
                <div className="text-[11px] font-bold text-stone-900 truncate">{req.payee}</div>
                <div className="border-t border-dashed border-stone-400 pt-1 text-[9px] text-stone-400">
                  Receiver Signature
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[9px] text-stone-400 text-center pt-2">
            Kurtta Kids Clothes Financial Internal Controls · All disbursements backed by genuine receipts
          </div>
        </div>
      </div>
    </div>
  );
};
