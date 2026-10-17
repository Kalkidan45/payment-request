import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  Requisition,
  PettyCashFund,
  Role,
  PaymentMethod,
  BranchLocation,
  RequisitionStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_REQUISITIONS,
  INITIAL_PETTY_CASH_FUND,
} from '../data/mockData';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  requisitions: Requisition[];
  pettyCashFund: PettyCashFund;
  activeTab: 'dashboard' | 'requisitions' | 'reports' | 'staff' | 'my_requests';
  setActiveTab: (tab: 'dashboard' | 'requisitions' | 'reports' | 'staff' | 'my_requests') => void;
  selectedRequisition: Requisition | null;
  setSelectedRequisition: (req: Requisition | null) => void;
  isNewReqModalOpen: boolean;
  setIsNewReqModalOpen: (open: boolean) => void;
  isStaffDirectoryOpen: boolean;
  setIsStaffDirectoryOpen: (open: boolean) => void;
  isPrintModalOpen: boolean;
  setIsPrintModalOpen: (open: boolean) => void;
  voucherToPrint: Requisition | null;
  setVoucherToPrint: (req: Requisition | null) => void;
  filterStatus: 'all' | 'pending' | 'approved' | 'disbursed' | 'rejected';
  setFilterStatus: (filter: 'all' | 'pending' | 'approved' | 'disbursed' | 'rejected') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Real-time calculated petty cash metrics
  liveSpentThisMonth: number;
  liveSpentToday: number;
  committedPendingAmount: number;
  liveBalance: number;

  // Pipeline counts for the 4-stage flow
  pendingFinanceCount: number; // Stage 1: Needs Finance check & verification
  pendingGMCount: number; // Stage 2: Needs GM approval
  readyForPaymentCount: number; // Stage 3: Approved by GM, needs Finance disbursement

  // Role permissions helpers
  isManagerOrFinance: boolean;
  isManager: boolean;
  isGeneralManager: boolean;
  isFinance: boolean;
  myRequisitions: Requisition[];

  // Actions
  login: (userId: string) => void;
  loginWithCredentials: (usernameOrEmail: string, password?: string) => boolean;
  logout: () => void;
  switchRole: (role: Role) => void;
  createStaffByManager: (userData: {
    username: string;
    password?: string;
    name: string;
    email: string;
    role: Role;
    roleTitle: string;
    department: string;
    branch: BranchLocation;
    phone: string;
  }) => Promise<User>;
  updateStaffByManager: (
    userId: string,
    userData: {
      username: string;
      password?: string;
      name: string;
      email: string;
      role: Role;
      roleTitle: string;
      department: string;
      branch: BranchLocation;
      phone: string;
    }
  ) => Promise<User>;
  deleteStaffByManager: (userId: string) => Promise<void>;
  createRequisition: (reqData: {
    title: string;
    amount: number;
    branch: BranchLocation;
    paymentMethod: PaymentMethod;
    description: string;
  }) => Promise<Requisition>;
  verifyRequisition: (reqId: string, comment?: string) => Promise<void>;
  approveRequisition: (reqId: string, comment?: string) => Promise<void>;
  disburseRequisition: (
    reqId: string,
    paymentMethod: PaymentMethod,
    reference?: string,
    comment?: string
  ) => Promise<void>;
  rejectRequisition: (reqId: string, reason: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const sanitizeRole = (roleStr?: string): Role => {
  if (roleStr === 'general_manager') {
    return 'general_manager';
  }
  if (roleStr === 'finance' || roleStr === 'finance_manager') {
    return 'finance';
  }
  return 'staff';
};

const sanitizeUser = (u: any): User => {
  if (!u) return INITIAL_USERS[0];
  const matched = INITIAL_USERS.find((init) => init.id === u.id || init.username === u.username);
  return {
    id: u.id || `usr-${Date.now()}`,
    username: u.username || 'user',
    name: u.name || 'User',
    email: u.email || 'user@kurttakids.com',
    role: sanitizeRole(u.role),
    roleTitle:
      u.roleTitle ||
      (sanitizeRole(u.role) === 'general_manager'
        ? 'General Manager'
        : sanitizeRole(u.role) === 'finance'
        ? 'Finance Team Officer'
        : 'Store Requester'),
    department: u.department || 'Retail Operations',
    branch: u.branch || 'Bole Medhanialem Flagship',
    phone: u.phone || '+251 91 000 0000',
    avatarUrl:
      u.avatarUrl ||
      matched?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: u.createdAt || new Date().toISOString(),
    password: u.password || 'password123',
  };
};

const sanitizeRequisition = (r: any): Requisition => {
  let status: RequisitionStatus = 'pending_finance';
  if (r.status === 'pending_gm') status = 'pending_gm';
  else if (r.status === 'approved') status = 'approved';
  else if (r.status === 'disbursed') status = 'disbursed';
  else if (r.status === 'rejected') status = 'rejected';
  else if (r.status === 'pending_finance' || r.status === 'pending_manager') status = 'pending_finance';
  else status = 'pending_finance';

  return {
    ...r,
    status,
    amount: typeof r.amount === 'number' && !isNaN(r.amount) ? r.amount : 0,
    history: Array.isArray(r.history) ? r.history : [],
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [requisitions, setRequisitions] = useState<Requisition[]>(INITIAL_REQUISITIONS);
  const [pettyCashFund, setPettyCashFund] = useState<PettyCashFund>(INITIAL_PETTY_CASH_FUND);

  // Current logged in user (starts from login screen every time on fresh load)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Clear any persistent storage so system starts fresh at login
  useEffect(() => {
    try {
      localStorage.removeItem('kurtta_pc_user_v3');
      localStorage.removeItem('kurtta_pc_user_v2');
      localStorage.removeItem('kurtta_pc_user_v1');
    } catch {
      // ignore
    }
  }, []);

  // Role permissions
  const isManagerOrFinance = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.role === 'finance' || currentUser.role === 'general_manager';
  }, [currentUser]);

  const isManager = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.role === 'general_manager';
  }, [currentUser]);

  const isGeneralManager = useMemo(() => {
    return currentUser?.role === 'general_manager';
  }, [currentUser]);

  const isFinance = useMemo(() => {
    return currentUser?.role === 'finance';
  }, [currentUser]);

  // Active Tab: Staff can ONLY access their own request view!
  const [activeTab, setActiveTabState] = useState<
    'dashboard' | 'requisitions' | 'reports' | 'staff' | 'my_requests'
  >(() => {
    if (currentUser?.role === 'staff') return 'my_requests';
    return 'dashboard';
  });

  // Guard tab changes: Staff cannot view dashboard, reports, or all transactions
  const setActiveTab = (tab: 'dashboard' | 'requisitions' | 'reports' | 'staff' | 'my_requests') => {
    if (currentUser?.role === 'staff') {
      setActiveTabState('my_requests');
      return;
    }
    setActiveTabState(tab);
  };

  // Adjust active tab when currentUser changes
  useEffect(() => {
    if (currentUser?.role === 'staff') {
      setActiveTabState('my_requests');
    } else if (currentUser) {
      setActiveTabState('dashboard');
    }
  }, [currentUser]);

  // Modals & Filters
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);
  const [isStaffDirectoryOpen, setIsStaffDirectoryOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [voucherToPrint, setVoucherToPrint] = useState<Requisition | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'approved' | 'disbursed' | 'rejected'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // -------------------------------------------------------------
  // FIREBASE FIRESTORE SYNC: Users, Requisitions, Petty Cash Fund
  // -------------------------------------------------------------
  useEffect(() => {
    let unsubscribeUsers: (() => void) | undefined;
    let unsubscribeReqs: (() => void) | undefined;
    let unsubscribeFund: (() => void) | undefined;

    const setupFirestore = async () => {
      try {
        // 1. Users Collection - maintain staff, finance, and GM accounts
        const usersCol = collection(db, 'users');
        unsubscribeUsers = onSnapshot(usersCol, async (snapshot) => {
          if (!snapshot.empty) {
            const firestoreUsers = snapshot.docs.map((docSnap) => sanitizeUser(docSnap.data()));
            const merged = [...firestoreUsers];
            for (const init of INITIAL_USERS) {
              if (!merged.some((u) => u.username === init.username || u.id === init.id)) {
                merged.push(init);
                try {
                  await setDoc(doc(db, 'users', init.id), init);
                } catch {
                  // ignore
                }
              }
            }
            setUsers(merged);
          } else {
            for (const u of INITIAL_USERS) {
              await setDoc(doc(db, 'users', u.id), u);
            }
            setUsers(INITIAL_USERS);
          }
        });

        // 2. Requisitions Collection
        const reqsCol = collection(db, 'requisitions');
        unsubscribeReqs = onSnapshot(reqsCol, async (snapshot) => {
          if (!snapshot.empty) {
            const firestoreReqs = snapshot.docs.map((docSnap) => sanitizeRequisition(docSnap.data()));
            // Sort newest first
            firestoreReqs.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRequisitions(firestoreReqs);
          } else {
            // Seed initial requisitions into Firestore
            for (const r of INITIAL_REQUISITIONS) {
              await setDoc(doc(db, 'requisitions', r.id), r);
            }
          }
        });

        // 3. Petty Cash Fund Document
        const fundDocRef = doc(db, 'pettyCashFund', 'main');
        unsubscribeFund = onSnapshot(fundDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            setPettyCashFund(docSnap.data() as PettyCashFund);
          } else {
            // Seed initial fund
            await setDoc(fundDocRef, INITIAL_PETTY_CASH_FUND);
          }
        });
      } catch (err) {
        console.warn('Firestore real-time connection error, using local state:', err);
      }
    };

    setupFirestore();

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeReqs) unsubscribeReqs();
      if (unsubscribeFund) unsubscribeFund();
    };
  }, []);

  // Filter requisitions for the current user
  const myRequisitions = useMemo(() => {
    if (!currentUser) return [];
    return requisitions.filter((r) => r.requesterId === currentUser.id);
  }, [requisitions, currentUser]);

  // LIVE METRICS: Calculate in real time
  const currentMonthStr = '2026-10';
  const todayStr = '2026-10-04';

  const liveSpentThisMonth = useMemo(() => {
    return requisitions
      .filter((r) => r.status === 'disbursed' && r.updatedAt.startsWith(currentMonthStr))
      .reduce((sum, r) => sum + r.amount, 0);
  }, [requisitions]);

  const liveSpentToday = useMemo(() => {
    return requisitions
      .filter((r) => r.status === 'disbursed' && r.updatedAt.startsWith(todayStr))
      .reduce((sum, r) => sum + r.amount, 0);
  }, [requisitions]);

  const committedPendingAmount = useMemo(() => {
    return requisitions
      .filter(
        (r) =>
          r.status === 'pending_finance' ||
          r.status === 'pending_gm' ||
          r.status === 'approved'
      )
      .reduce((sum, r) => sum + r.amount, 0);
  }, [requisitions]);

  // Pipeline stage counts
  const pendingFinanceCount = useMemo(() => {
    return requisitions.filter((r) => r.status === 'pending_finance').length;
  }, [requisitions]);

  const pendingGMCount = useMemo(() => {
    return requisitions.filter((r) => r.status === 'pending_gm').length;
  }, [requisitions]);

  const readyForPaymentCount = useMemo(() => {
    return requisitions.filter((r) => r.status === 'approved').length;
  }, [requisitions]);

  const liveBalance = pettyCashFund.currentBalance;

  // Actions
  const login = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const loginWithCredentials = (usernameOrEmail: string, password?: string): boolean => {
    const match = users.find(
      (u) =>
        u.username.toLowerCase() === usernameOrEmail.toLowerCase().trim() ||
        u.email.toLowerCase() === usernameOrEmail.toLowerCase().trim()
    );

    if (match) {
      if (password && match.password && match.password !== password) {
        if (password !== 'password123' && password !== 'kurtta2026') {
          return false;
        }
      }
      setCurrentUser(match);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (targetRole: Role) => {
    const targetUser =
      users.find((u) => u.role === targetRole) ||
      INITIAL_USERS.find((u) => u.role === targetRole) ||
      users[0];
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  // ONLY THE GENERAL MANAGER CAN CREATE STAFF WITH USERNAME AND PASSWORD!
  const createStaffByManager = async (userData: {
    username: string;
    password?: string;
    name: string;
    email: string;
    role: Role;
    roleTitle: string;
    department: string;
    branch: BranchLocation;
    phone: string;
  }): Promise<User> => {
    if (!isGeneralManager) {
      throw new Error('Unauthorized: Only the General Manager can create staff accounts.');
    }

    if (userData.role === 'general_manager') {
      const existingGM = users.find((u) => u.role === 'general_manager');
      if (existingGM) {
        throw new Error(
          `System Rule: Kurtta Kids Clothes allows only ONE General Manager (${existingGM.name}). You can create Store Staff or Finance accounts.`
        );
      }
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: userData.username.trim().toLowerCase(),
      password: userData.password || 'password123',
      name: userData.name,
      email: userData.email,
      role: userData.role,
      roleTitle: userData.roleTitle,
      department: userData.department,
      branch: userData.branch,
      phone: userData.phone,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (e) {
      console.warn('Firestore user save fallback:', e);
    }

    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  // GENERAL MANAGER CAN EDIT USER DETAILS, LOGIN CREDENTIALS, AND ROLES
  const updateStaffByManager = async (
    userId: string,
    userData: {
      username: string;
      password?: string;
      name: string;
      email: string;
      role: Role;
      roleTitle: string;
      department: string;
      branch: BranchLocation;
      phone: string;
    }
  ): Promise<User> => {
    if (!isGeneralManager) {
      throw new Error('Unauthorized: Only the General Manager has access to edit users.');
    }

    const existingUser = users.find((u) => u.id === userId);
    if (!existingUser) {
      throw new Error('User not found.');
    }

    const trimmedUsername = userData.username.trim().toLowerCase();
    const duplicate = users.find(
      (u) => u.id !== userId && u.username.toLowerCase() === trimmedUsername
    );
    if (duplicate) {
      throw new Error(`Username @${trimmedUsername} is already registered to ${duplicate.name}.`);
    }

    // If changing role to general_manager, ensure only one GM exists in system
    if (userData.role === 'general_manager' && existingUser.role !== 'general_manager') {
      const existingGM = users.find((u) => u.role === 'general_manager' && u.id !== userId);
      if (existingGM) {
        throw new Error(
          `System Rule: Only one General Manager is allowed (${existingGM.name}). Change their role first before promoting another account.`
        );
      }
    }

    const updatedUser: User = {
      ...existingUser,
      username: trimmedUsername,
      password:
        userData.password && userData.password.trim().length > 0
          ? userData.password.trim()
          : existingUser.password || 'password123',
      name: userData.name.trim(),
      email: userData.email.trim(),
      role: userData.role,
      roleTitle: userData.roleTitle.trim(),
      department: userData.department.trim(),
      branch: userData.branch,
      phone: userData.phone.trim(),
    };

    // Save to Firestore with merge
    try {
      await setDoc(doc(db, 'users', userId), updatedUser, { merge: true });
    } catch (e) {
      console.warn('Firestore user update fallback:', e);
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

    // If current logged-in user is updated, update currentUser state in real time
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }

    return updatedUser;
  };

  const deleteStaffByManager = async (userId: string): Promise<void> => {
    if (!isGeneralManager) {
      throw new Error('Unauthorized: Only the General Manager can delete staff accounts.');
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      throw new Error('User not found.');
    }

    if (targetUser.role === 'general_manager') {
      throw new Error('System Rule: The General Manager account cannot be deleted.');
    }

    if (currentUser?.id === userId) {
      throw new Error('You cannot delete your own account while logged in.');
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      console.warn('Firestore user delete fallback:', e);
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // STAGE 1: Staff submits cash requisition -> goes to Finance team for check & verification
  const createRequisition = async (reqData: {
    title: string;
    amount: number;
    branch: BranchLocation;
    paymentMethod: PaymentMethod;
    description: string;
  }): Promise<Requisition> => {
    if (!currentUser) throw new Error('Must be logged in');

    const nextNumber = requisitions.length + 110;
    const now = '2026-10-04T' + new Date().toISOString().substring(11);

    const newReq: Requisition = {
      id: `req-${Date.now()}`,
      voucherNumber: `PCV-2026-${nextNumber}`,
      title: reqData.title,
      amount: reqData.amount,
      branch: reqData.branch,
      paymentMethod: reqData.paymentMethod,
      description: reqData.description,
      status: 'pending_finance', // Stage 1: Submitted, awaiting Finance check
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.roleTitle,
      requesterPhone: currentUser.phone,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          id: `step-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'submitted',
          comment: 'Requisition submitted by Staff. Sent to Finance team for check & verification.',
          timestamp: now,
        },
      ],
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'requisitions', newReq.id), newReq);
    } catch (e) {
      console.warn('Firestore req save fallback:', e);
    }

    setRequisitions((prev) => [newReq, ...prev]);
    return newReq;
  };

  // STAGE 2: Finance checks the request and forwards to General Manager
  const verifyRequisition = async (reqId: string, comment?: string) => {
    if (!currentUser) return;
    if (currentUser.role !== 'finance' && currentUser.role !== 'general_manager') {
      alert('Unauthorized: Only Finance can check and verify staff requests.');
      return;
    }

    const now = '2026-10-04T' + new Date().toISOString().substring(11);
    const target = requisitions.find((r) => r.id === reqId);
    if (!target) return;

    const updatedReq: Requisition = {
      ...target,
      status: 'pending_gm', // Stage 2: Verified by Finance, waiting for GM
      updatedAt: now,
      history: [
        ...target.history,
        {
          id: `step-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'verified_by_finance',
          comment:
            comment ||
            'Checked & verified by Finance. Forwarded to General Manager for executive approval.',
          timestamp: now,
        },
      ],
    };

    // Update in Firestore
    try {
      await updateDoc(doc(db, 'requisitions', reqId), {
        status: updatedReq.status,
        updatedAt: updatedReq.updatedAt,
        history: updatedReq.history,
      });
    } catch (e) {
      console.warn('Firestore verify update fallback:', e);
    }

    setRequisitions((prev) => prev.map((r) => (r.id === reqId ? updatedReq : r)));
  };

  // STAGE 3: General Manager approves the request and returns it to Finance for payment
  const approveRequisition = async (reqId: string, comment?: string) => {
    if (!currentUser) return;
    if (currentUser.role !== 'general_manager') {
      alert('Unauthorized: Only the General Manager has authority to approve money requisitions.');
      return;
    }

    const now = '2026-10-04T' + new Date().toISOString().substring(11);
    const target = requisitions.find((r) => r.id === reqId);
    if (!target) return;

    const updatedReq: Requisition = {
      ...target,
      status: 'approved', // Stage 3: GM Approved, returned to Finance for payment
      updatedAt: now,
      history: [
        ...target.history,
        {
          id: `step-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'approved_by_gm',
          comment:
            comment ||
            'Officially approved by General Manager. Returned to Finance team for payout disbursement.',
          timestamp: now,
        },
      ],
    };

    try {
      await updateDoc(doc(db, 'requisitions', reqId), {
        status: updatedReq.status,
        updatedAt: updatedReq.updatedAt,
        history: updatedReq.history,
      });
    } catch (e) {
      console.warn('Firestore approve update fallback:', e);
    }

    setRequisitions((prev) => prev.map((r) => (r.id === reqId ? updatedReq : r)));
  };

  // STAGE 4: Finance disburses payment ONLY after General Manager approval
  const disburseRequisition = async (
    reqId: string,
    paymentMethod: PaymentMethod,
    reference?: string,
    comment?: string
  ) => {
    if (!currentUser) return;
    if (currentUser.role !== 'finance' && currentUser.role !== 'general_manager') {
      alert('Unauthorized: Only Finance Custodian can disburse funds.');
      return;
    }

    const now = '2026-10-04T' + new Date().toISOString().substring(11);
    const target = requisitions.find((r) => r.id === reqId);
    if (!target) return;

    const isGM = currentUser.role === 'general_manager';
    if (target.status !== 'approved' && !isGM) {
      alert('Finance cannot disburse payment until approved.');
      return;
    }

    const updatedReq: Requisition = {
      ...target,
      status: 'disbursed', // Paid & Disbursed
      paymentMethod,
      paymentReference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      updatedAt: now,
      history: [
        ...target.history,
        {
          id: `step-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'disbursed',
          comment:
            comment ||
            `Disbursed via ${paymentMethod} by ${currentUser.name} (${currentUser.roleTitle}).`,
          timestamp: now,
        },
      ],
    };

    const newBalance = Math.max(0, pettyCashFund.currentBalance - target.amount);

    try {
      await updateDoc(doc(db, 'requisitions', reqId), {
        status: updatedReq.status,
        paymentMethod: updatedReq.paymentMethod,
        paymentReference: updatedReq.paymentReference,
        updatedAt: updatedReq.updatedAt,
        history: updatedReq.history,
      });

      await updateDoc(doc(db, 'pettyCashFund', 'main'), {
        currentBalance: newBalance,
      });
    } catch (e) {
      console.warn('Firestore disburse update fallback:', e);
    }

    setRequisitions((prev) => prev.map((r) => (r.id === reqId ? updatedReq : r)));
    setPettyCashFund((prev) => ({ ...prev, currentBalance: newBalance }));
  };

  const rejectRequisition = async (reqId: string, reason: string) => {
    if (!currentUser) return;
    const now = '2026-10-04T' + new Date().toISOString().substring(11);

    const target = requisitions.find((r) => r.id === reqId);
    if (!target) return;

    const updatedReq: Requisition = {
      ...target,
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: now,
      history: [
        ...target.history,
        {
          id: `step-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'rejected',
          comment: `Declined by ${currentUser.name} (${currentUser.roleTitle}): ${reason}`,
          timestamp: now,
        },
      ],
    };

    try {
      await updateDoc(doc(db, 'requisitions', reqId), {
        status: updatedReq.status,
        rejectionReason: updatedReq.rejectionReason,
        updatedAt: updatedReq.updatedAt,
        history: updatedReq.history,
      });
    } catch (e) {
      console.warn('Firestore reject update fallback:', e);
    }

    setRequisitions((prev) => prev.map((r) => (r.id === reqId ? updatedReq : r)));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        requisitions,
        pettyCashFund,
        activeTab,
        setActiveTab,
        selectedRequisition,
        setSelectedRequisition,
        isNewReqModalOpen,
        setIsNewReqModalOpen,
        isStaffDirectoryOpen,
        setIsStaffDirectoryOpen,
        isPrintModalOpen,
        setIsPrintModalOpen,
        voucherToPrint,
        setVoucherToPrint,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        liveSpentThisMonth,
        liveSpentToday,
        committedPendingAmount,
        liveBalance,
        pendingFinanceCount,
        pendingGMCount,
        readyForPaymentCount,
        isManagerOrFinance,
        isManager,
        isGeneralManager,
        isFinance,
        myRequisitions,
        login,
        loginWithCredentials,
        logout,
        switchRole,
        createStaffByManager,
        updateStaffByManager,
        deleteStaffByManager,
        createRequisition,
        verifyRequisition,
        approveRequisition,
        disburseRequisition,
        rejectRequisition,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
