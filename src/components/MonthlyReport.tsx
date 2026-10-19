import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatBirr, formatDate } from '../utils/format';
import {
  FileText,
  Download,
  Calendar,
  Building2,
  TrendingDown,
  FileSpreadsheet,
  Coins,
  CreditCard,
} from 'lucide-react';
import { BranchLocation, BRANCH_LOCATIONS } from '../types';

export const MonthlyReport: React.FC = () => {
  const { requisitions, depositRequests, setSelectedRequisition } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<'2026-10' | '2026-09' | 'all'>('2026-10');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Filter approved deposit requests (Money In requested by Finance to GM)
  const filteredDeposits = useMemo(() => {
    return depositRequests.filter((d) => {
      if (d.status !== 'approved_deposit') return false;
      if (selectedMonth !== 'all' && !d.updatedAt.startsWith(selectedMonth)) return false;
      return true;
    });
  }, [depositRequests, selectedMonth]);

  const totalBirrDeposited = useMemo(() => {
    return filteredDeposits.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredDeposits]);

  // Filter disbursed requisitions by selected month and branch (Money Out)
  const filteredDisbursed = useMemo(() => {
    return requisitions.filter((r) => {
      if (r.status !== 'disbursed') return false;
      if (selectedMonth !== 'all' && !r.updatedAt.startsWith(selectedMonth)) return false;
      if (selectedBranch !== 'all' && r.branch !== selectedBranch) return false;
      return true;
    });
  }, [requisitions, selectedMonth, selectedBranch]);

  // Overall Birr spent for the selection
  const totalBirrSpent = useMemo(() => {
    return filteredDisbursed.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredDisbursed]);

  const averageVoucherBirr = useMemo(() => {
    if (filteredDisbursed.length === 0) return 0;
    return totalBirrSpent / filteredDisbursed.length;
  }, [filteredDisbursed, totalBirrSpent]);

  // Branch breakdown
  const branchStats = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};

    filteredDisbursed.forEach((r) => {
      if (!map[r.branch]) {
        map[r.branch] = { total: 0, count: 0 };
      }
      map[r.branch].total += r.amount;
      map[r.branch].count += 1;
    });

    return Object.entries(map)
      .map(([branch, val]) => ({
        branch: branch as BranchLocation,
        total: val.total,
        count: val.count,
        percent: totalBirrSpent > 0 ? (val.total / totalBirrSpent) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredDisbursed, totalBirrSpent]);

  // Payment method breakdown
  const paymentStats = useMemo(() => {
    const map: Record<string, number> = {};
    filteredDisbursed.forEach((r) => {
      map[r.paymentMethod] = (map[r.paymentMethod] || 0) + r.amount;
    });
    return Object.entries(map).map(([method, total]) => ({
      method,
      total,
      percent: totalBirrSpent > 0 ? (total / totalBirrSpent) * 100 : 0,
    }));
  }, [filteredDisbursed, totalBirrSpent]);

  // Export to CSV functionality
  const handleExportCSV = () => {
    const headers = [
      'Voucher Number',
      'Date Disbursed',
      'Expense Purpose',
      'Branch',
      'Requester',
      'Payment Method',
      'Payment Reference',
      'Amount (ETB / Birr)',
    ];

    const rows = filteredDisbursed.map((r) => [
      `"${r.voucherNumber}"`,
      `"${r.updatedAt}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.branch}"`,
      `"${r.requesterName}"`,
      `"${r.paymentMethod}"`,
      `"${r.paymentReference || ''}"`,
      r.amount.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Kurtta_Petty_Cash_Monthly_Report_${selectedMonth}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMonthLabel = (key: string) => {
    if (key === '2026-10') return 'October 2026 (Current)';
    if (key === '2026-09') return 'September 2026';
    return 'All Recorded Periods';
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Header and Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-[#0284C7]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-stone-900">
              Monthly Petty Cash Expenditure Report
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Official Birr expenditure breakdown for Kurtta Kids Clothes finance records
          </p>
        </div>

        {/* Month & Branch Selectors + Export Action */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value as any)}
              className="bg-transparent font-semibold text-stone-800 focus:outline-hidden cursor-pointer"
            >
              <option value="2026-10">October 2026 (Current)</option>
              <option value="2026-09">September 2026</option>
              <option value="all">All Months</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent font-medium text-stone-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Shops</option>
              {BRANCH_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Export CSV for Excel or Accounting"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Birr Cash Flow & Spend Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Funds Deposited (Money In) */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-emerald-100 font-bold">
            Fund Deposits In (Money In)
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-2">
            {formatBirr(totalBirrDeposited)}
          </div>
          <div className="text-xs text-emerald-100/90 mt-2">
            Requested by Finance & approved by GM
          </div>
        </div>

        {/* Total Birr Spent (Money Out) */}
        <div className="bg-gradient-to-br from-[#0284C7] via-[#00AEEF] to-[#38BDF8] text-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-sky-100 font-bold">
            Petty Cash Spent (Money Out)
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-2">
            {formatBirr(totalBirrSpent)}
          </div>
          <div className="text-xs text-sky-100/90 mt-2">
            Across {filteredDisbursed.length} disbursed vouchers
          </div>
        </div>

        {/* Net Balance Movement */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs uppercase tracking-wider text-stone-500 font-bold">
            Net Cash Flow Movement
          </div>
          <div className={`text-2xl font-black font-mono mt-2 ${totalBirrDeposited - totalBirrSpent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatBirr(totalBirrDeposited - totalBirrSpent)}
          </div>
          <div className="text-xs text-stone-500 mt-2">
            Deposits minus disbursements
          </div>
        </div>

        {/* Average Voucher Amount */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs uppercase tracking-wider text-stone-500 font-bold">
            Average Requisition Ticket
          </div>
          <div className="text-2xl font-black text-stone-900 font-mono mt-2">
            {formatBirr(averageVoucherBirr)}
          </div>
          <div className="text-xs text-stone-500 mt-2">
            Per approved petty cash payout
          </div>
        </div>
      </div>

      {/* Fund Deposits (Money In) Details Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            Fund Deposit Requests (Finance to GM - Money In)
          </h2>
          <span className="text-xs text-stone-400 font-mono">Replenishment Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="pb-3 px-3">Ref #</th>
                <th className="pb-3 px-3">Deposit Title</th>
                <th className="pb-3 px-3">Requester (Finance)</th>
                <th className="pb-3 px-3">Channel</th>
                <th className="pb-3 px-3 text-right">Amount (Birr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-800">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-stone-400 font-medium">
                    No approved fund deposits recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-stone-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{dep.referenceNumber}</td>
                    <td className="py-3 px-3 font-semibold">{dep.title}</td>
                    <td className="py-3 px-3 text-stone-600">{dep.requesterName}</td>
                    <td className="py-3 px-3 font-medium text-stone-700">{dep.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">+{formatBirr(dep.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown Section: Branches & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch / Location Breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00AEEF]" />
              Expenditure by Kurtta Branch / Workshop
            </h2>
            <span className="text-xs text-stone-400 font-mono font-medium">Distribution</span>
          </div>

          <div className="space-y-3.5">
            {branchStats.map((item) => (
              <div key={item.branch}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-stone-800 truncate max-w-[200px]">
                    {item.branch}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">{item.count} items</span>
                    <span className="font-bold text-stone-900 font-mono">
                      {formatBirr(item.total)}
                    </span>
                    <span className="text-stone-400 w-10 text-right">
                      {item.percent.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00AEEF] rounded-full"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method split */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00AEEF]" />
                Payment Method Breakdown
              </h2>
              <span className="text-xs text-stone-400 font-mono font-medium">By Channel</span>
            </div>

            <div className="space-y-3">
              {paymentStats.map((p) => (
                <div key={p.method} className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-900">{p.method}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {p.percent.toFixed(1)}% of total outflows
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-[#0284C7] font-mono">
                      {formatBirr(p.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Disbursed Vouchers Table for this Month */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-stone-900">
              Itemized Disbursement Register
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Showing {filteredDisbursed.length} authorized disbursements for {getMonthLabel(selectedMonth)}
            </p>
          </div>
        </div>

        {/* Mobile View: Card List */}
        <div className="block sm:hidden divide-y divide-stone-100">
          {filteredDisbursed.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRequisition(r)}
              className="p-4 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-mono font-bold text-[#0284C7]">
                  {r.voucherNumber}
                </span>
                <span className="text-sm font-extrabold text-stone-900 font-mono">
                  {formatBirr(r.amount)}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-stone-800 mt-1">{r.title}</h3>
              <div className="text-[11px] text-stone-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                <span>{r.branch}</span>
                <span>·</span>
                <span>{r.paymentMethod}</span>
                <span>·</span>
                <span>{formatDate(r.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Purpose</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4 text-right">Amount (Birr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDisbursed.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedRequisition(r)}
                  className="hover:bg-stone-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-[#0284C7]">
                    {r.voucherNumber}
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    {formatDate(r.updatedAt)}
                  </td>
                  <td className="py-3 px-4 font-medium text-stone-800 max-w-xs truncate">
                    {r.title}
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    {r.branch}
                  </td>
                  <td className="py-3 px-4 text-stone-700 whitespace-nowrap">{r.paymentMethod}</td>
                  <td className="py-3 px-4 text-stone-600 font-mono text-[11px] whitespace-nowrap">
                    {r.paymentReference || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-stone-900 text-right whitespace-nowrap">
                    {formatBirr(r.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
