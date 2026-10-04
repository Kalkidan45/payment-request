export type Role = 'staff' | 'finance' | 'general_manager';

export type ExpenseCategory =
  | 'fabric_accessories'
  | 'packaging_tags'
  | 'local_courier'
  | 'refreshments'
  | 'cleaning_sanitation'
  | 'store_maintenance'
  | 'stationery_pos'
  | 'utilities_airtime'
  | 'other';

export type BranchLocation =
  | 'Bole Medhanialem Flagship'
  | 'Piassa Kids Corner'
  | 'Kazanchis Atelier'
  | 'CMC Kids Boutique'
  | 'Head Office / Warehouse';

export type RequisitionStatus =
  | 'pending_finance' // Stage 1: Submitted by Staff, awaiting Finance Check & Verification
  | 'pending_gm' // Stage 2: Checked by Finance, awaiting General Manager Approval
  | 'approved' // Stage 3: Approved by GM, returned to Finance for Payment
  | 'disbursed' // Stage 4: Paid & Disbursed by Finance
  | 'rejected'; // Declined by Finance or General Manager

export type PaymentMethod = 'Physical Cash' | 'Telebirr' | 'CBE Birr' | 'Amole / Awash';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: Role;
  roleTitle: string;
  department: string;
  branch: BranchLocation;
  phone: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface ApprovalStep {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: 'submitted' | 'verified_by_finance' | 'approved_by_gm' | 'disbursed' | 'rejected';
  comment?: string;
  timestamp: string;
}

export interface Requisition {
  id: string;
  voucherNumber: string; // e.g. PCV-2026-104
  title: string;
  category: ExpenseCategory;
  amount: number; // in Birr (ETB)
  branch: BranchLocation;
  payee: string; // Vendor or person receiving payment
  paymentMethod: PaymentMethod;
  paymentReference?: string; // e.g. Telebirr Txn ID or Safe receipt #
  description: string;
  urgency: 'Normal' | 'Urgent' | 'Emergency';
  status: RequisitionStatus;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  requesterPhone: string;
  createdAt: string;
  updatedAt: string;
  receiptUrl?: string;
  receiptName?: string;
  rejectionReason?: string;
  history: ApprovalStep[];
}

export interface PettyCashFund {
  id?: string;
  totalAllocated: number;
  currentBalance: number;
  monthAllocated: number;
}
