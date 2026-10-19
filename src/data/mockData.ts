import { User, Requisition, PettyCashFund, DepositRequest } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'almaz',
    password: 'password123',
    name: 'Almaz Tadesse',
    email: 'almaz@kurttakids.com',
    role: 'staff',
    roleTitle: 'Store Requester',
    department: 'Retail Sales & Storefront',
    branch: 'Shop 1',
    phone: '+251 91 124 5892',
    createdAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'usr-2',
    username: 'bethelhem',
    password: 'password123',
    name: 'Bethelhem Desta',
    email: 'bethelhem@kurttakids.com',
    role: 'finance',
    roleTitle: 'Finance Team Officer',
    department: 'Finance & Accounts',
    branch: 'Head Office',
    phone: '+251 91 234 5678',
    createdAt: '2026-04-15T09:00:00Z',
  },
  {
    id: 'usr-3',
    username: 'solomon',
    password: 'password123',
    name: 'Solomon Girma',
    email: 'solomon@kurttakids.com',
    role: 'general_manager',
    roleTitle: 'General Manager',
    department: 'Executive Leadership',
    branch: 'Head Office',
    phone: '+251 91 456 8901',
    createdAt: '2026-01-01T09:00:00Z',
  },
];

export const INITIAL_PETTY_CASH_FUND: PettyCashFund = {
  id: 'fund-main',
  totalAllocated: 0,
  currentBalance: 0,
  monthAllocated: 0,
};

export const INITIAL_DEPOSIT_REQUESTS: DepositRequest[] = [];

export const INITIAL_REQUISITIONS: Requisition[] = [];

