import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatBirr, formatDate, formatDateOnly } from '../utils/format';
import {
  FileText,
  Download,
  Calendar,
  CalendarDays,
  Building2,
  TrendingDown,
  FileSpreadsheet,
  Coins,
  CreditCard,
  Clock,
  Layers,
  Filter,
} from 'lucide-react';
import { BranchLocation, BRANCH_LOCATIONS } from '../types';

export type ReportFilterMode = 'month' | 'days' | 'all';

export const MonthlyReport: React.FC = () => {
  const { requisitions, depositRequests, pettyCashFund, setSelectedRequisition } = useApp();

  // Mode: 'month' (by calendar month), 'days' (date picker for single day or range), 'all' (all time)
  const [filterMode, setFilterMode] = useState<ReportFilterMode>('month');

  // Dynamic default current month and today strings
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const todayStr = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  // Dynamically compile available months from data + 12 recent months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthStr);

    // Add recent 12 months as presets
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      set.add(mKey);
    }

    // Add any months found in requisitions or depositRequests
    requisitions.forEach((r) => {
      if (r.updatedAt && r.updatedAt.length >= 7) set.add(r.updatedAt.slice(0, 7));
      if (r.createdAt && r.createdAt.length >= 7) set.add(r.createdAt.slice(0, 7));
    });
    depositRequests.forEach((d) => {
      if (d.updatedAt && d.updatedAt.length >= 7) set.add(d.updatedAt.slice(0, 7));
      if (d.createdAt && d.createdAt.length >= 7) set.add(d.createdAt.slice(0, 7));
    });

    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [requisitions, depositRequests, currentMonthStr]);

  const formatMonthName = (monthKey: string) => {
    try {
      const [yearStr, monthNumStr] = monthKey.split('-');
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthNumStr, 10) - 1;
      const d = new Date(year, monthNum, 1);
      const name = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (monthKey === currentMonthStr) {
        return `${name} (Current)`;
      }
      return name;
    } catch {
      return monthKey;
    }
  };

  // Date matching predicate for any transaction ISO date
  const matchesDateFilter = (isoDateStr?: string) => {
    if (!isoDateStr) return false;
    const day = isoDateStr.slice(0, 10); // 'YYYY-MM-DD'
    const month = isoDateStr.slice(0, 7); // 'YYYY-MM'

    if (filterMode === 'all') return true;

    if (filterMode === 'month') {
      if (selectedMonth === 'all') return true;
      return month === selectedMonth;
    }

    if (filterMode === 'days') {
      if (startDate && day < startDate) return false;
      if (endDate && day > endDate) return false;
      return true;
    }

    return true;
  };

  // Filter approved deposit requests (Money In requested by Finance to GM)
  const filteredDeposits = useMemo(() => {
    return depositRequests.filter((d) => {
      if (d.status !== 'approved_deposit') return false;
      return matchesDateFilter(d.updatedAt || d.createdAt);
    });
  }, [depositRequests, filterMode, selectedMonth, startDate, endDate]);

  const totalBirrDeposited = useMemo(() => {
    return filteredDeposits.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredDeposits]);

  // Filter disbursed requisitions by selected date filter and branch (Money Out)
  const filteredDisbursed = useMemo(() => {
    return requisitions.filter((r) => {
      if (r.status !== 'disbursed') return false;
      if (selectedBranch !== 'all' && r.branch !== selectedBranch) return false;
      return matchesDateFilter(r.updatedAt || r.createdAt);
    });
  }, [requisitions, selectedBranch, filterMode, selectedMonth, startDate, endDate]);

  // Pending requested amounts (Staff requests submitted, awaiting GM or payout)
  const filteredPending = useMemo(() => {
    return requisitions.filter((r) => {
      if (r.status !== 'pending_finance' && r.status !== 'pending_gm' && r.status !== 'approved') return false;
      if (selectedBranch !== 'all' && r.branch !== selectedBranch) return false;
      return matchesDateFilter(r.createdAt || r.updatedAt);
    });
  }, [requisitions, selectedBranch, filterMode, selectedMonth, startDate, endDate]);

  const totalRequestedPending = useMemo(() => {
    return filteredPending.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredPending]);

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

  // Friendly period description
  const periodDescription = useMemo(() => {
    if (filterMode === 'all') {
      return 'All Recorded History (All-Time)';
    }
    if (filterMode === 'month') {
      return formatMonthName(selectedMonth);
    }
    if (filterMode === 'days') {
      if (startDate === endDate) {
        return `Single Day: ${formatDateOnly(startDate)}`;
      }
      return `${formatDateOnly(startDate)} to ${formatDateOnly(endDate)}`;
    }
    return 'Custom Period';
  }, [filterMode, selectedMonth, startDate, endDate, currentMonthStr]);

  // Quick preset shortcuts for day filtering
  const handleSetPresetDays = (preset: 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth') => {
    setFilterMode('days');
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === 'last7') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 6);
      setStartDate(d7.toISOString().slice(0, 10));
      setEndDate(today);
    } else if (preset === 'last30') {
      const d30 = new Date();
      d30.setDate(d30.getDate() - 29);
      setStartDate(d30.toISOString().slice(0, 10));
      setEndDate(today);
    } else if (preset === 'thisMonth') {
      const startOfMonth = `${today.slice(0, 7)}-01`;
      setStartDate(startOfMonth);
      setEndDate(today);
    }
  };

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

    const fileSuffix =
      filterMode === 'month'
        ? `Month_${selectedMonth}`
        : filterMode === 'days'
        ? startDate === endDate
          ? `Day_${startDate}`
          : `Range_${startDate}_to_${endDate}`
        : 'All_Periods';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kurtta_Petty_Cash_Report_${fileSuffix}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-[#0284C7]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-stone-900">
              Petty Cash Expenditure & Inflow Report
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Official Birr financial breakdown for Kurtta Kids Clothes finance records · Filter by Month or Days
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-700 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer w-full sm:w-auto"
          title="Export CSV for Excel or Accounting"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Interactive Date & Filter Control Center */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00AEEF]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Report Timeframe & Branch Selector
            </h2>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-semibold self-start lg:self-auto">
            <button
              onClick={() => setFilterMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'month'
                  ? 'bg-white text-[#0284C7] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>By Month</span>
            </button>

            <button
              onClick={() => setFilterMode('days')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'days'
                  ? 'bg-white text-[#0284C7] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Date Picker (Days)</span>
            </button>

            <button
              onClick={() => setFilterMode('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-[#0284C7] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All History</span>
            </button>
          </div>
        </div>

        {/* Dynamic Controls based on selected mode */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Mode: BY MONTH */}
          {filterMode === 'month' && (
            <div className="md:col-span-8 flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs flex-1 sm:flex-initial">
                <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="text-stone-500 font-medium">Select Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent font-bold text-stone-900 focus:outline-hidden cursor-pointer"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {formatMonthName(m)}
                    </option>
                  ))}
                  <option value="all">All Months</option>
                </select>
              </div>

              {/* Direct Month Picker Input for custom year/month */}
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs">
                <span className="text-stone-500 text-[11px]">Picker:</span>
                <input
                  type="month"
                  value={selectedMonth !== 'all' ? selectedMonth : currentMonthStr}
                  onChange={(e) => {
                    if (e.target.value) setSelectedMonth(e.target.value);
                  }}
                  className="bg-transparent font-mono text-stone-800 text-xs focus:outline-hidden cursor-pointer"
                  title="Pick any month & year"
                />
              </div>

              {/* Quick shortcut to current month */}
              {selectedMonth !== currentMonthStr && (
                <button
                  onClick={() => setSelectedMonth(currentMonthStr)}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284C7] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Current Month
                </button>
              )}
            </div>
          )}

          {/* Mode: DATE PICKER (DAYS / RANGE) */}
          {filterMode === 'days' && (
            <div className="md:col-span-8 flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs">
                <span className="text-stone-500 font-medium">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent font-semibold font-mono text-stone-900 focus:outline-hidden cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs">
                <span className="text-stone-500 font-medium">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent font-semibold font-mono text-stone-900 focus:outline-hidden cursor-pointer"
                />
              </div>

              {/* Quick Day Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <button
                  onClick={() => handleSetPresetDays('today')}
                  className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                    startDate === todayStr && endDate === todayStr
                      ? 'bg-sky-500 text-white border-sky-600'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                  title="Create daily report for today"
                >
                  Today
                </button>
                <button
                  onClick={() => handleSetPresetDays('yesterday')}
                  className="px-2.5 py-1 rounded-lg border bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200 font-medium transition-all cursor-pointer"
                  title="Create daily report for yesterday"
                >
                  Yesterday
                </button>
                <button
                  onClick={() => handleSetPresetDays('last7')}
                  className="px-2.5 py-1 rounded-lg border bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200 font-medium transition-all cursor-pointer"
                  title="Report for the last 7 days"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => handleSetPresetDays('last30')}
                  className="px-2.5 py-1 rounded-lg border bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200 font-medium transition-all cursor-pointer"
                  title="Report for the last 30 days"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => handleSetPresetDays('thisMonth')}
                  className="px-2.5 py-1 rounded-lg border bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200 font-medium transition-all cursor-pointer"
                  title="Report for this month to date"
                >
                  This Month
                </button>
              </div>
            </div>
          )}

          {/* Mode: ALL HISTORY */}
          {filterMode === 'all' && (
            <div className="md:col-span-8 flex items-center gap-2">
              <span className="text-xs text-stone-600 bg-stone-100 px-3 py-2 rounded-xl font-medium">
                Reporting across all recorded months, dates, and historical vouchers without timeframe limit.
              </span>
            </div>
          )}

          {/* Branch / Shop Filter */}
          <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-2">
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs w-full sm:w-auto">
              <Building2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="text-stone-500 font-medium">Shop:</span>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent font-semibold text-stone-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Shops (Company-wide)</option>
                {BRANCH_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Current Active Report Filter Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-stone-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-stone-500">Active Report Scope:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-[#0284C7] font-bold border border-sky-200">
              {filterMode === 'days' ? <CalendarDays className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
              <span>{periodDescription}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-medium border border-stone-200">
              <Building2 className="w-3.5 h-3.5 text-stone-500" />
              <span>{selectedBranch === 'all' ? 'All 6 Shops / Locations' : selectedBranch}</span>
            </span>
          </div>

          <div className="text-[11px] font-mono text-stone-500">
            {filteredDisbursed.length} Disbursed Vouchers · {filteredDeposits.length} Approved Deposits
          </div>
        </div>
      </div>

      {/* Main Birr Cash Flow & Spend Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Funds Deposited (Money In) */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-emerald-100 font-bold flex items-center justify-between">
            <span>Fund Deposits (Money In)</span>
            <Coins className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-2">
            {formatBirr(totalBirrDeposited)}
          </div>
          <div className="text-xs text-emerald-100/90 mt-2 truncate">
            {filteredDeposits.length} GM-approved deposits for this period
          </div>
        </div>

        {/* Total Birr Spent (Money Out) */}
        <div className="bg-gradient-to-br from-[#0284C7] via-[#00AEEF] to-[#38BDF8] text-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-sky-100 font-bold flex items-center justify-between">
            <span>Disbursed (Money Out)</span>
            <TrendingDown className="w-4 h-4 text-sky-200" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-2">
            {formatBirr(totalBirrSpent)}
          </div>
          <div className="text-xs text-sky-100/90 mt-2 truncate">
            Across {filteredDisbursed.length} settled payouts in period
          </div>
        </div>

        {/* Pending Requested Amounts (Awaiting check, approval or payout) */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="text-xs uppercase tracking-wider text-amber-600 font-bold flex items-center justify-between">
            <span>Requested in Pipeline</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
              {filteredPending.length} items
            </span>
          </div>
          <div className="text-2xl font-black font-mono mt-2 text-amber-600">
            {formatBirr(totalRequestedPending)}
          </div>
          <div className="text-xs text-stone-500 mt-2 truncate">
            Staff requests awaiting GM or payout
          </div>
        </div>

        {/* Net Available Balance (Deposits minus All Disbursed & Pending) */}
        <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-xs border border-stone-800">
          <div className="text-xs uppercase tracking-wider text-stone-400 font-bold flex items-center justify-between">
            <span>Period Net Movement</span>
            <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded-full font-mono">
              Net Flow
            </span>
          </div>
          <div
            className={`text-2xl font-black font-mono mt-2 ${
              totalBirrDeposited - totalBirrSpent >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatBirr(totalBirrDeposited - totalBirrSpent)}
          </div>
          <div className="text-xs text-stone-400 mt-2 truncate">
            Deposits minus disbursements in period
          </div>
        </div>
      </div>

      {/* Cash Flow Balance Equation Strip */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-700 font-medium flex-wrap">
          <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">System Fund Equation:</span>
          <span className="font-mono text-emerald-700 font-bold">+{formatBirr(totalBirrDeposited)} (Deposited)</span>
          <span className="text-stone-400 font-bold">−</span>
          <span className="font-mono text-sky-700 font-bold">−{formatBirr(totalBirrSpent)} (Disbursed)</span>
          <span className="text-stone-400 font-bold">−</span>
          <span className="font-mono text-amber-700 font-bold">−{formatBirr(totalRequestedPending)} (Requested Pending)</span>
          <span className="text-stone-400 font-bold">=</span>
          <span className="font-mono font-black text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
            {formatBirr(totalBirrDeposited - totalBirrSpent - totalRequestedPending)} Period Available
          </span>
        </div>
        <div className="text-stone-500 font-mono text-[11px] shrink-0">
          Petty Cash Safe Balance: <strong className="text-stone-900">{formatBirr(pettyCashFund.currentBalance)}</strong>
        </div>
      </div>

      {/* Fund Deposits (Money In) Details Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-stone-900">
              Fund Deposit Requests (Finance to GM - Money In)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            {periodDescription} · {filteredDeposits.length} deposit{filteredDeposits.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="pb-3 px-3">Ref #</th>
                <th className="pb-3 px-3">Deposit Title</th>
                <th className="pb-3 px-3">Date Approved</th>
                <th className="pb-3 px-3">Requester (Finance)</th>
                <th className="pb-3 px-3">Channel</th>
                <th className="pb-3 px-3 text-right">Amount (Birr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-800">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400 font-medium">
                    No approved fund deposits recorded for this selected timeframe ({periodDescription}).
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-stone-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">{dep.referenceNumber}</td>
                    <td className="py-3 px-3 font-semibold">{dep.title}</td>
                    <td className="py-3 px-3 text-stone-600 whitespace-nowrap">{formatDate(dep.updatedAt || dep.createdAt)}</td>
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
            {branchStats.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">No disbursements in this period.</p>
            ) : (
              branchStats.map((item) => (
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
              ))
            )}
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
              {paymentStats.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">No payouts in this period.</p>
              ) : (
                paymentStats.map((p) => (
                  <div key={p.method} className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-900">{p.method}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {p.percent.toFixed(1)}% of period outflows
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-[#0284C7] font-mono">
                        {formatBirr(p.total)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Disbursed Vouchers Table for this Period */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-stone-900">
              Itemized Disbursement Register
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Showing {filteredDisbursed.length} authorized disbursements for {periodDescription}
            </p>
          </div>
        </div>

        {/* Mobile View: Card List */}
        <div className="block sm:hidden divide-y divide-stone-100">
          {filteredDisbursed.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No disbursed vouchers found for {periodDescription}.
            </div>
          ) : (
            filteredDisbursed.map((r) => (
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
                  <span>{formatDate(r.updatedAt || r.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-4">Date Disbursed</th>
                <th className="py-3 px-4">Expense Purpose</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4 text-right">Amount (Birr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDisbursed.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400 font-medium">
                    No authorized disbursements found for {periodDescription}.
                  </td>
                </tr>
              ) : (
                filteredDisbursed.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRequisition(r)}
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#0284C7]">
                      {r.voucherNumber}
                    </td>
                    <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                      {formatDate(r.updatedAt || r.createdAt)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
