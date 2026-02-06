export type TransactionStatus = 'pending' | 'approved' | 'rejected';
export type TransactionType = 'deposit' | 'withdrawal';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status?: 'active' | 'suspended';
  balance?: number;
  joinedDate?: string;
  plan?: string;
  phone?: string;
  country?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  user: User;
  amount: number;
  type: TransactionType;
  method: string; // e.g., "Bank Transfer", "BTC", "USDT"
  transactionId: string; // External TxID
  proofUrl?: string; // For deposits
  status: TransactionStatus;
  accountNumber?: string; // Sensitive data to mask
}

export interface Stats {
  totalBalance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  todayVolume: number;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  roi: number; // Percentage
  duration: number; // Days
  minDeposit: number;
  maxDeposit: number;
  status: 'active' | 'inactive';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string; // Relative time string for UI
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'fiat' | 'crypto';
  currency: string;
  accountDetails: string; // Wallet Address or IBAN
  status: 'active' | 'maintenance';
  logo: string; // URL or placeholder
}