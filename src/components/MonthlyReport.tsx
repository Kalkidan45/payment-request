import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatBirr, formatDate, getStatusDisplay } from '../utils/format';
import { CATEGORY_DETAILS } from '../data/mockData';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building2,
  TrendingDown,
  PieChart,
  CheckCircle,
  FileSpreadsheet,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { ExpenseCategory, BranchLocation } from '../types';

export const MonthlyReport: React.FC = () => {
  const { requisitions, setSelectedRequisition, setVoucherToPrint, setIsPrintModalOpen } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<'2026-10' | '2026-09' | 'all'>('2026-10');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Filter disbursed requisitions by selected month and branch
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

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};

    filteredDisbursed.forEach((r) => {
      if (!map[r.category]) {
        map[r.category] = { total: 0, count: 0 };
      }
      map[r.category].total += r.amount;
      map[r.category].count += 1;
    });

    return Object.entries(map)
      .map(([cat, val]) => ({
        category: cat as ExpenseCategory,
        total: val.total,
        count: val.count,
        percent: totalBirrSpent > 0 ? (val.total / totalBirrSpent) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
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
      'Expense Title',
      'Category',
      'Branch',
      'Requester',
      'Payee / Vendor',
      'Payment Method',
      'Payment Reference',
      'Amount (ETB / Birr)',
    ];

    const rows = filteredDisbursed.map((r) => [
      `"${r.voucherNumber}"`,
      `"${r.updatedAt}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${CATEGORY_DETAILS[r.category]?.name || r.category}"`,
      `"${r.branch}"`,
      `"${r.requesterName}"`,
      `"${r.payee.replace(/"/g, '""')}"`,
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
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
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
              <option value="all">All Branches</option>
              <option value="Bole Medhanialem Flagship">Bole Medhanialem</option>
              <option value="Piassa Kids Corner">Piassa Kids Corner</option>
              <option value="Kazanchis Atelier">Kazanchis Atelier</option>
              <option value="Head Office / Warehouse">Head Office</option>
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

      {/* Main Birr Spend Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Birr Spent */}
        <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-amber-200 font-bold">
            Total Petty Cash Spent ({getMonthLabel(selectedMonth).split(' ')[0]})
          </div>
          <div className="text-3xl font-black font-mono mt-2">
            {formatBirr(totalBirrSpent)}
          </div>
          <div className="text-xs text-amber-100/90 mt-2 flex items-center gap-1">
            <span>Across {filteredDisbursed.length} disbursed cash vouchers</span>
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

        {/* Highest Spend Category */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs uppercase tracking-wider text-stone-500 font-bold">
            Top Spending Category
          </div>
          <div className="text-lg font-bold text-stone-900 mt-2 truncate">
            {categoryStats[0]
              ? CATEGORY_DETAILS[categoryStats[0].category]?.name
              : 'None'}
          </div>
          <div className="text-xs text-amber-700 font-semibold font-mono mt-1">
            {categoryStats[0] ? formatBirr(categoryStats[0].total) : 'Br 0.00'} (
            {categoryStats[0]?.percent.toFixed(1)}% of total)
          </div>
        </div>
      </div>

      {/* Breakdown Section: Categories & Branches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-600" />
              Expenditure by Expense Category
            </h2>
            <span className="text-xs text-stone-400 font-mono font-medium">In Birr (ETB)</span>
          </div>

          <div className="space-y-3.5">
            {categoryStats.map((item) => {
              const meta = CATEGORY_DETAILS[item.category];
              return (
                <div key={item.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-800">
                      {meta?.name || item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500">{item.count} bills</span>
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
                      className="h-full bg-amber-600 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Branch / Location Breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
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
                    className="h-full bg-stone-800 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method split */}
          <div className="mt-6 pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
              Payment Method Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              {paymentStats.map((p) => (
                <div key={p.method} className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <div className="text-[11px] font-medium text-stone-500">{p.method}</div>
                  <div className="text-xs font-bold text-stone-900 font-mono mt-0.5">
                    {formatBirr(p.total)}
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                    {p.percent.toFixed(0)}%
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
                <span className="text-xs font-mono font-bold text-amber-900">
                  {r.voucherNumber}
                </span>
                <span className="text-sm font-extrabold text-stone-900 font-mono">
                  {formatBirr(r.amount)}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-stone-800 mt-1">{r.title}</h3>
              <div className="text-[11px] text-stone-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                <span>{CATEGORY_DETAILS[r.category]?.name}</span>
                <span>·</span>
                <span>{r.branch.split(' ')[0]}</span>
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
                <th className="py-3 px-4">Expense Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Payee / Vendor</th>
                <th className="py-3 px-4 text-right">Amount (Birr)</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDisbursed.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedRequisition(r)}
                  className="hover:bg-stone-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-amber-900">
                    {r.voucherNumber}
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    {formatDate(r.updatedAt)}
                  </td>
                  <td className="py-3 px-4 font-medium text-stone-800 max-w-xs truncate">
                    {r.title}
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    {CATEGORY_DETAILS[r.category]?.name}
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    {r.branch.split(' ')[0]}
                  </td>
                  <td className="py-3 px-4 text-stone-700 whitespace-nowrap">{r.payee}</td>
                  <td className="py-3 px-4 font-mono font-bold text-stone-900 text-right whitespace-nowrap">
                    {formatBirr(r.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.receiptUrl ? (
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Attached
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-400">None</span>
                    )}
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
