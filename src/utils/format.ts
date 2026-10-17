import { Role, RequisitionStatus } from '../types';

export const formatBirr = (amount: number, showSymbol: boolean = true): string => {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('en-ET', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  return showSymbol ? `Br ${formatted}` : formatted;
};

export const formatBirrShort = (amount: number): string => {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  if (safeAmount >= 1000000) {
    return `Br ${(safeAmount / 1000000).toFixed(1)}M`;
  }
  if (safeAmount >= 1000) {
    return `Br ${(safeAmount / 1000).toFixed(1)}k`;
  }
  return `Br ${safeAmount.toFixed(0)}`;
};

export const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || 'N/A';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr || 'N/A';
  }
};

export const formatDateOnly = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || 'N/A';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr || 'N/A';
  }
};

export const getRoleDisplay = (
  role?: Role | string | null
): { title: string; color: string; bg: string; border: string } => {
  switch (role) {
    case 'staff':
    case 'requester':
      return {
        title: 'Store Requester',
        color: 'text-sky-800',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
      };
    case 'finance':
    case 'finance_manager':
      return {
        title: 'Finance Team',
        color: 'text-emerald-800',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
      };
    case 'general_manager':
      return {
        title: 'General Manager',
        color: 'text-indigo-800',
        bg: 'bg-indigo-50',
        border: 'border-indigo-300',
      };
    default:
      return {
        title: 'Store Requester',
        color: 'text-stone-700',
        bg: 'bg-stone-100',
        border: 'border-stone-200',
      };
  }
};

export const getStatusDisplay = (
  status?: RequisitionStatus | string | null
): {
  label: string;
  color: string;
  bg: string;
  dotColor: string;
} => {
  switch (status) {
    case 'pending_finance':
    case 'pending_manager':
      return {
        label: 'Pending Finance Check',
        color: 'text-amber-800',
        bg: 'bg-amber-50 border-amber-300',
        dotColor: 'bg-amber-500',
      };
    case 'pending_gm':
      return {
        label: 'Pending GM Approval',
        color: 'text-indigo-800',
        bg: 'bg-indigo-50 border-indigo-300',
        dotColor: 'bg-indigo-500',
      };
    case 'approved':
      return {
        label: 'Approved (Pending Payment)',
        color: 'text-emerald-800',
        bg: 'bg-emerald-50 border-emerald-300',
        dotColor: 'bg-emerald-500',
      };
    case 'disbursed':
      return {
        label: 'Paid & Disbursed',
        color: 'text-[#0284C7]',
        bg: 'bg-sky-50 border-sky-300',
        dotColor: 'bg-[#00AEEF]',
      };
    case 'rejected':
      return {
        label: 'Declined',
        color: 'text-rose-800',
        bg: 'bg-rose-50 border-rose-300',
        dotColor: 'bg-rose-500',
      };
    default:
      return {
        label: 'Awaiting Review',
        color: 'text-amber-800',
        bg: 'bg-amber-50 border-amber-200',
        dotColor: 'bg-amber-500',
      };
  }
};
