import { Transaction, InvestmentPlan, Notification, User, PaymentGateway } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'William Fancyson', email: 'william@example.com', avatar: 'https://picsum.photos/id/1005/100/100', status: 'active', balance: 15400.50, joinedDate: '2023-01-15', plan: 'Diamond Legacy', phone: '+1 (555) 123-4567', country: 'United States' },
  { id: 'u2', name: 'Sarah Connor', email: 'sarah@example.com', avatar: 'https://picsum.photos/id/1011/100/100', status: 'active', balance: 2500.00, joinedDate: '2023-03-10', plan: 'Starter Gold', phone: '+1 (555) 987-6543', country: 'Canada' },
  { id: 'u3', name: 'John Doe', email: 'john@example.com', avatar: 'https://picsum.photos/id/1012/100/100', status: 'suspended', balance: 0.00, joinedDate: '2023-05-22', plan: 'None', phone: '+44 20 7946 0958', country: 'United Kingdom' },
  { id: 'u4', name: 'Emily Blunt', email: 'emily@example.com', avatar: 'https://picsum.photos/id/1027/100/100', status: 'active', balance: 45000.00, joinedDate: '2022-11-05', plan: 'Premium Platinum', phone: '+1 (555) 234-5678', country: 'United States' },
  { id: 'u5', name: 'Michael Ross', email: 'mike@example.com', avatar: 'https://picsum.photos/id/1005/100/100', status: 'active', balance: 1200.00, joinedDate: '2023-06-01', plan: 'Starter Gold', phone: '+1 (555) 876-5432', country: 'Australia' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-1001',
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    user: MOCK_USERS[0],
    amount: 5000.00,
    type: 'deposit',
    method: 'Bank Transfer',
    transactionId: 'BT-9928374102',
    proofUrl: 'https://picsum.photos/seed/proof1/400/600',
    status: 'pending',
    accountNumber: '9876543210'
  },
  {
    id: 'TX-1002',
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    user: MOCK_USERS[1],
    amount: 1250.50,
    type: 'withdrawal',
    method: 'USDT (TRC20)',
    transactionId: '0x9283...1234',
    status: 'pending',
    accountNumber: 'TWiCwN...8jKz'
  },
  {
    id: 'TX-1003',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    user: MOCK_USERS[2],
    amount: 200.00,
    type: 'deposit',
    method: 'Credit Card',
    transactionId: 'CC-11223344',
    proofUrl: 'https://picsum.photos/seed/proof2/400/600',
    status: 'approved',
    accountNumber: '424242424242'
  },
  {
    id: 'TX-1004',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    user: MOCK_USERS[3],
    amount: 10000.00,
    type: 'withdrawal',
    method: 'Bank Transfer',
    transactionId: 'BT-123123123',
    status: 'rejected',
    accountNumber: '1234567890'
  },
  {
    id: 'TX-1005',
    date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    user: MOCK_USERS[4],
    amount: 750.00,
    type: 'deposit',
    method: 'PayPal',
    transactionId: 'PP-88229911',
    proofUrl: 'https://picsum.photos/seed/proof3/400/600',
    status: 'pending',
    accountNumber: 'mike@paypal.com'
  }
];

export const MOCK_PLANS: InvestmentPlan[] = [
  { id: 'p1', name: 'Starter Gold', roi: 5, duration: 7, minDeposit: 100, maxDeposit: 1000, status: 'active' },
  { id: 'p2', name: 'Premium Platinum', roi: 12, duration: 30, minDeposit: 1000, maxDeposit: 10000, status: 'active' },
  { id: 'p3', name: 'Diamond Legacy', roi: 25, duration: 90, minDeposit: 10000, maxDeposit: 50000, status: 'active' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'New High Value Deposit', message: 'William Fancyson deposited $5,000 via Bank Transfer.', time: '30m ago', read: false, type: 'success' },
  { id: 'n2', title: 'System Update', message: 'Server maintenance scheduled for Sunday at 2 AM UTC.', time: '2h ago', read: false, type: 'info' },
  { id: 'n3', title: 'Suspicious Activity', message: 'Multiple failed login attempts detected for user ID #882.', time: '5h ago', read: true, type: 'warning' },
];

export const MOCK_GATEWAYS: PaymentGateway[] = [
  { id: 'g1', name: 'USDT (TRC20)', type: 'crypto', currency: 'USDT', accountDetails: 'TVj7...x8L2', status: 'active', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { id: 'g2', name: 'Bitcoin (BTC)', type: 'crypto', currency: 'BTC', accountDetails: 'bc1q...0w2j', status: 'active', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { id: 'g3', name: 'International Wire', type: 'fiat', currency: 'USD', accountDetails: 'IBAN: CH93 0000... SWIFT: UBSW...', status: 'active', logo: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' },
];

export const CHART_DATA = [
  { name: 'Mon', income: 4000, outflow: 2400 },
  { name: 'Tue', income: 3000, outflow: 1398 },
  { name: 'Wed', income: 2000, outflow: 9800 },
  { name: 'Thu', income: 2780, outflow: 3908 },
  { name: 'Fri', income: 1890, outflow: 4800 },
  { name: 'Sat', income: 2390, outflow: 3800 },
  { name: 'Sun', income: 3490, outflow: 4300 },
];