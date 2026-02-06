export interface Plan {
  id: number;
  name: string;
  roi: number;
  duration: number; // in days
  minDeposit: number;
  isPopular?: boolean;
}

export interface Transaction {
  id: string;
  type: 'Deposit' | 'Withdraw' | 'Investment' | 'Profit';
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface UserStats {
  balance: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalProfit: number;
}

export interface MenuItem {
  label: string;
  icon: any;
  path?: string;
  subItems?: { label: string; path: string }[];
}