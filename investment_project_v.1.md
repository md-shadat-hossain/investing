# Investment Platform - Version 1.0

## Project Documentation

**Project Name:** WealthFlow Premier - Investment Platform
**Version:** 1.0
**Author:** Md. Shadat Hossain

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Backend (investment-server)](#backend-investment-server)
4. [Admin Panel (investment-admin-panel)](#admin-panel-investment-admin-panel)
5. [Website (investment-website)](#website-investment-website)
6. [API Endpoints Summary](#api-endpoints-summary)
7. [Features Summary](#features-summary)

---

## Tech Stack

### Backend (investment-server)
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM (Object Data Modeling) |
| JWT (jsonwebtoken) | Authentication tokens |
| Passport.js | Authentication middleware |
| Socket.IO | Real-time notifications |
| Multer | File upload handling |
| Joi | Request validation |
| Nodemailer | Email sending (SMTP) |
| Winston | Logging |
| Morgan | HTTP request logging |
| Bcrypt.js | Password hashing |
| Helmet | Security headers |
| CORS | Cross-origin requests |
| express-rate-limit | Rate limiting |
| xss-clean | XSS protection |
| express-mongo-sanitize | NoSQL injection protection |
| heic-convert | HEIC to PNG image conversion |
| Swagger (jsdoc + ui-express) | API documentation |

### Admin Panel (investment-admin-panel)
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Redux Toolkit (RTK Query) | State management & API calls |
| React Router DOM 7 | Client-side routing |
| Recharts | Charts & data visualization |
| Lucide React | Icon library |
| Tailwind CSS (CDN) | Styling |

### Website (investment-website)
| Technology | Purpose |
|------------|---------|
| Next.js 14 | Full-stack React framework (App Router) |
| React 18 | UI framework |
| TypeScript | Type safety |
| Redux Toolkit (RTK Query) | State management & API calls |
| Recharts | Charts & data visualization |
| Lucide React | Icon library |
| Tailwind CSS | Styling |

---

## Project Structure

```
Investment Project/
├── investment-server/          # Backend API server
├── investment-admin-panel/     # Admin dashboard (React + Vite)
├── investment-website/         # User-facing website (Next.js)
└── investment_project_v.1.md   # This documentation
```

---

## Backend (investment-server)

### Directory Structure

```
investment-server/
├── src/
│   ├── index.js                # App entry point (server start, DB connect, cron jobs)
│   ├── app.js                  # Express app configuration
│   ├── config/                 # Configuration files
│   │   ├── config.js           # Environment variables
│   │   ├── roles.js            # Role permissions
│   │   ├── tokens.js           # Token types
│   │   ├── passport.js         # JWT strategy
│   │   ├── logger.js           # Winston logger
│   │   ├── morgan.js           # HTTP logging
│   │   └── response.js         # Response formatting
│   ├── models/                 # Mongoose models (18 models)
│   │   ├── plugins/            # Mongoose plugins
│   │   │   ├── toJSON.plugin.js
│   │   │   └── paginate.plugin.js
│   │   ├── user.model.js
│   │   ├── token.model.js
│   │   ├── wallet.model.js
│   │   ├── transaction.model.js
│   │   ├── investment.model.js
│   │   ├── investmentPlan.model.js
│   │   ├── paymentGateway.model.js
│   │   ├── referral.model.js
│   │   ├── profitDistribution.model.js
│   │   ├── profitAdjustment.model.js
│   │   ├── supportTicket.model.js
│   │   ├── notification.model.js
│   │   ├── settings.model.js
│   │   ├── aboutUs.model.js
│   │   ├── privacyPolicy.model.js
│   │   ├── termsConditions.model.js
│   │   └── support.model.js
│   ├── controllers/            # Route controllers
│   ├── services/               # Business logic (17 services)
│   ├── routes/v1/              # API routes
│   ├── middlewares/            # Custom middlewares
│   ├── validations/            # Joi validation schemas
│   └── utils/                  # Utility functions
├── public/uploads/             # Uploaded files storage
└── package.json
```

### Models (18 Total)

#### 1. User
- Fields: firstName, lastName, fullName, email, password, image, role (user/admin/superAdmin), phone, NID, address, DOB
- Features: Email verification, KYC (idFront, idBack, selfie, proofOfAddress), referral code (auto-generated), block/unblock, security settings, FCM token
- Methods: isEmailTaken, isPhoneNumberTaken, isPasswordMatch, findByReferralCode

#### 2. Token
- Fields: token, user, type (refresh/resetPassword/verifyEmail), expires, blacklisted

#### 3. Wallet
- Fields: user (unique), balance, totalDeposit, totalWithdraw, totalProfit, totalInvested, referralEarnings, currency (USD)

#### 4. Transaction
- Fields: user, type (deposit/withdraw/investment/profit/referral/bonus/fee), amount, fee, netAmount, status (pending/processing/completed/rejected/cancelled), paymentMethod, paymentGateway, walletAddress, txHash, bankDetails, transactionId (auto: TXN-TYPE-timestamp-random), reference, description, adminNote, processedBy, processedAt, proofImage

#### 5. Investment
- Fields: user, plan, amount, expectedProfit, earnedProfit, roi, startDate, endDate, nextProfitDate, lastProfitDate, totalProfitDistributions, dailyProfitAmount, status (active/completed/cancelled/paused), isPaused, pausedBy, pausedAt, pauseReason, autoReinvest, transactionId (auto: INV-timestamp-random)

#### 6. InvestmentPlan
- Fields: name, description, minDeposit, maxDeposit, roi, roiType (daily/weekly/monthly/total), duration, durationType (hours/days/weeks/months), referralBonus, isPopular, isActive, features[], totalInvestors, totalInvested

#### 7. PaymentGateway
- Fields: name, type (crypto/bank/payment_processor), currency, symbol, walletAddress, qrCode, bankDetails (bankName/accountNumber/accountName/routingNumber/swiftCode), minDeposit, maxDeposit, minWithdraw, maxWithdraw, depositFee, depositFeeType (fixed/percentage), withdrawFee, withdrawFeeType, processingTime, instructions, icon, isActive, isDepositEnabled, isWithdrawEnabled, sortOrder

#### 8. Referral
- Fields: referrer, referred, referralCode, level (1-7), commissionRate, totalEarnings, status (pending/active/inactive), firstDepositAmount, firstDepositDate

#### 9. ProfitDistribution
- Fields: investment, user, amount, originalRate, appliedRate, adjustedBy, adjustmentReason, distributionDate, status (pending/completed/failed/cancelled), transactionId

#### 10. ProfitAdjustment
- Fields: type (global/user/investment/plan), targetUser, targetInvestment, targetPlan, adjustmentType (percentage/fixed_amount/multiplier), adjustmentValue, startDate, endDate, isActive, priority, reason, createdBy, notes

#### 11. SupportTicket
- Fields: user, ticketId (auto: TKT-timestamp-random), subject, category (deposit/withdrawal/investment/account/technical/other), priority (low/normal/high/urgent), status (open/in_progress/waiting_reply/resolved/closed), messages[] (sender, senderRole, message, attachments[], isRead), assignedTo, resolvedAt, closedAt, rating (1-5), feedback

#### 12. Notification
- Fields: userId, sendBy, transactionId, role, title, content, icon, image, devStatus, status (unread/read), type, priority (low/medium/high)

#### 13. Settings
- Fields: key (unique), value (mixed), category (general/payment/referral/notification/security/email), description
- Methods: getSetting(key, default), setSetting(key, value, category, description)

#### 14-17. Content Models
- AboutUs, PrivacyPolicy, TermsConditions, Support - each with `content` field

### Services (17 Total)

| Service | Purpose |
|---------|---------|
| authService | Login, logout, token management, password reset |
| tokenService | Generate/verify JWT tokens, manage refresh tokens |
| emailService | Send emails via SMTP (verification, reset, notifications) |
| userService | User CRUD, profile management |
| walletService | Wallet operations, balance management |
| transactionService | Deposit/withdrawal processing, admin approval/rejection |
| investmentService | Create investments, track status, calculate profits |
| investmentPlanService | Plan CRUD, activation/deactivation |
| paymentGatewayService | Gateway CRUD, configuration |
| referralService | Referral tracking, commission calculation, 7-level network |
| notificationService | Send notifications, real-time via Socket.IO |
| supportTicketService | Ticket management, messages, assignment |
| profitDistributionService | Profit distribution, calculation with adjustments |
| profitAdjustmentService | Manage custom profit adjustments |
| cronService | Scheduled tasks (profit distribution every 8 hours) |
| tasksService | Background task management |

### Middlewares (8 Total)

| Middleware | Purpose |
|-----------|---------|
| auth.js | JWT authentication via Passport, role-based access (common/user/admin/commonAdmin/superAdmin) |
| validate.js | Joi validation for request body, params, query |
| error.js | Error converter + global error handler |
| fileUpload.js | Multer config (20MB max, JPG/PNG/JPEG/HEIC/HEIF) |
| converter.js | HEIC to PNG image conversion |
| messageFileUpload.js | File upload for chat attachments |
| fileVerification.js | File verification logic |
| rateLimiter.js | Rate limiting for auth endpoints |

### Validations (13 Total)

- auth.validation.js (register, login, logout, verifyEmail, forgotPassword, resetPassword, changePassword, deleteMe, refreshTokens)
- user.validation.js (updateUser)
- admin.validation.js (getAllUsers, getUserDetails, toggleUserBlock, updateKycStatus, addUserBalance, deductUserBalance, deleteUser, getRecentActivities)
- wallet.validation.js
- transaction.validation.js (createDeposit, createWithdrawal, getMyTransactions, getAllTransactions, getPendingTransactions, getTransaction, approveTransaction, rejectTransaction)
- investment.validation.js (createInvestment, getMyInvestments, getAllInvestments, getInvestment)
- investmentPlan.validation.js (createPlan, updatePlan, getPlans, getPlan, deletePlan)
- paymentGateway.validation.js (createGateway, updateGateway, getActiveGateways, getAllGateways, getGateway, getGatewaysByType, deleteGateway, toggleGatewayStatus)
- referral.validation.js (validateReferralCode, getMyReferrals, getAllReferrals)
- notification.validation.js (getMyNotifications, markAsRead, deleteNotification, sendToUser, sendToAllUsers)
- supportTicket.validation.js (createTicket, getMyTickets, getAllTickets, getTicket, addReply, updateTicketStatus, assignTicket, rateTicket)
- profitDistribution.validation.js
- custom.validation.js (objectId, password validators)

### Mongoose Plugins

- **toJSON.plugin.js** - Converts `_id` to `id`, removes `__v`, removes sensitive fields (fcmToken, isDeleted, etc.)
- **paginate.plugin.js** - Pagination with sorting, filtering, populate. Returns: results, page, limit, totalPages, totalResults

### Roles & Permissions

| Role | Permissions |
|------|------------|
| user | common, user |
| admin | common, commonAdmin, admin |
| superAdmin | common, commonAdmin, superAdmin |

### Cron Jobs
- **Profit Distribution**: Runs every 8 hours (production mode)
- Initial run on startup after 5-second delay
- Processes all active investments for profit distribution

### Environment Variables

```
NODE_ENV=development|production
PORT=3000
MONGODB_URL=mongodb://...
JWT_SECRET=secret_key
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=user@example.com
SMTP_PASSWORD=password
EMAIL_FROM=noreply@example.com
BACKEND_IP=http://localhost:3000
```

---

## Admin Panel (investment-admin-panel)

### Directory Structure

```
investment-admin-panel/
├── App.tsx                     # Main app with routing & Dashboard component
├── index.html                  # Entry point with Tailwind CDN
├── index.css                   # Custom scrollbar styles
├── types.ts                    # TypeScript type definitions
├── constants.ts                # Mock data constants
├── vite.config.ts              # Vite configuration
├── components/                 # UI Components (15+)
│   ├── Layout.tsx              # Sidebar + Header layout
│   ├── Login.tsx               # Admin login page
│   ├── UserManagement.tsx      # User management (CRUD, block, balance, KYC)
│   ├── InvestmentPlans.tsx     # Plan management (CRUD, features, toggle)
│   ├── PaymentGateways.tsx     # Gateway management (crypto/bank/processor)
│   ├── TransactionTable.tsx    # Pending transactions with approve/reject
│   ├── TransactionHistory.tsx  # Full transaction history with filters
│   ├── TransactionDetail.tsx   # Single transaction detail view
│   ├── ProfitDistribution.tsx  # Profit distribution management
│   ├── ReferralManagement.tsx  # Referral system overview & stats
│   ├── SupportTickets.tsx      # Ticket management, replies, assignment
│   ├── Analytics.tsx           # Charts, KPIs, revenue & growth analytics
│   ├── Notifications.tsx       # Send/broadcast notifications
│   ├── SettingsPanelNew.tsx    # Admin profile, password, image settings
│   └── ui/
│       ├── Toast.tsx           # Toast notification component
│       └── MaskedData.tsx      # Sensitive data masking component
├── store/
│   ├── store.ts                # Redux store configuration
│   ├── slices/
│   │   └── authSlice.ts        # Auth state (user, isAuthenticated)
│   └── api/                    # RTK Query API modules (10)
│       ├── baseApi.ts          # Base API with token refresh
│       ├── authApi.ts          # Login, logout, changePassword, getProfile
│       ├── userApi.ts          # User CRUD, block, KYC, balance, profile image
│       ├── transactionApi.ts   # Transactions, approve/reject, stats
│       ├── investmentPlanApi.ts # Plan CRUD
│       ├── paymentGatewayApi.ts # Gateway CRUD, toggle
│       ├── referralApi.ts      # All referrals, commission rates
│       ├── ticketApi.ts        # Tickets, replies, assign, stats
│       ├── notificationApi.ts  # Notifications, send, broadcast
│       └── analyticsApi.ts     # Dashboard stats, activities, analytics data
└── services/
    └── api.ts                  # Legacy API service (unused)
```

### Pages & Features

#### 1. Dashboard (/)
- 8 stat cards: Net Balance, Pending Deposits, Pending Withdrawals, Total Users, Total Deposits, Total Withdrawals, Active Investments, Open Tickets
- 7-day cashflow chart (deposits vs withdrawals by day)
- Quick actions: Emergency Stop, Generate Report, Manage Roles
- Platform summary: Total Users, Active Investments, Pending Tickets
- Recent user registrations list
- Recent support tickets list

#### 2. User Management (/users)
- User list table with search & pagination
- User detail view with profile editor
- Add/deduct balance with reason
- Block/unblock users
- KYC status management
- Delete user
- View user stats (balance, plan, status, joined date)

#### 3. Investment Plans (/plans)
- Grid display of plan cards
- Create/edit plan modal with full configuration:
  - Name, description, ROI, ROI type (daily/weekly/monthly/total)
  - Duration, deposit limits, referral bonus, features list
  - Popular flag, active status
- Toggle plan active/inactive
- Delete plans

#### 4. Payment Gateways (/gateways)
- Card-based gateway display
- Create/edit gateways (crypto/bank/payment_processor)
- Configure: wallet address, QR code, bank details
- Set deposit/withdraw fees (fixed/percentage)
- Set min/max limits
- Toggle gateway active status

#### 5. Deposits (/deposits)
- Pending deposit requests table
- View proof images
- Approve/reject with admin notes

#### 6. Withdrawals (/withdrawals)
- Pending withdrawal requests table
- Approve/reject with admin notes

#### 7. Transaction History (/history)
- Complete transaction list with filters (status, type, date)
- Transaction detail modal
- Export functionality

#### 8. Transaction Detail (/history/:id)
- Full transaction information
- User details, payment gateway info
- Admin actions and notes

#### 9. Profit Distribution (/profits)
- Manual profit distribution interface
- Distribution history
- Profit adjustment management

#### 10. Referral Management (/referrals)
- Stats cards: Total Referrals, Active, Total Commission, Top Referrer
- Commission rate structure display
- Three tabs: All Referrals, By Level, Commission Breakdown
- Server-side pagination with status & level filters
- CSV export

#### 11. Support Tickets (/tickets)
- Ticket list with status/priority/category filters
- Ticket detail with conversation thread
- Reply to tickets
- Update ticket status
- Assign to admin

#### 12. Analytics & Reports (/analytics)
- Revenue trend chart (monthly deposits vs withdrawals)
- User growth chart (weekly new registrations)
- Investment distribution pie chart (by plan)
- KPIs: User Active Rate, Avg Deposit, Investment Active Rate, Open Tickets
- Recent transactions & registrations activity
- JSON report export

#### 13. Notifications (/notifications)
- Admin notification center
- Send notification to specific user
- Broadcast to all users
- Mark as read, delete

#### 14. Settings (/settings)
- Admin profile information editor
- Profile image upload/change/delete
- Change password

### Design System

- **Primary Colors**: Navy 900/800 (#0F172A, #1E293B)
- **Accent**: Gold 500/600 (#F59E0B, #D97706)
- **Success**: Emerald 500 (#10B981)
- **Danger**: Rose 600 (#E11D48)
- **Fonts**: Inter (body), Poppins (headings)
- **Layout**: Fixed sidebar (272px) + scrollable main content
- **Mobile**: Responsive with collapsible sidebar

---

## Website (investment-website)

### Directory Structure

```
investment-website/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with ReduxProvider
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles
│   ├── login/page.tsx           # Login page
│   ├── register/page.tsx        # Registration page
│   ├── verify-email/page.tsx    # OTP email verification
│   ├── forgot-password/page.tsx # Forgot password
│   ├── reset-password/page.tsx  # Reset password
│   └── dashboard/               # Protected dashboard routes
│       ├── layout.tsx           # Dashboard layout (sidebar + topbar)
│       ├── page.tsx             # Dashboard home
│       ├── deposit/page.tsx
│       ├── deposit/history/page.tsx
│       ├── withdraw/page.tsx
│       ├── withdraw/history/page.tsx
│       ├── plans/invest/page.tsx
│       ├── plans/my-plans/page.tsx
│       ├── plans/history/page.tsx
│       ├── transactions/page.tsx
│       ├── transactions/[id]/page.tsx
│       ├── profits/history/page.tsx
│       ├── profits/investment/[id]/page.tsx
│       ├── referrals/page.tsx
│       ├── referrals/network/page.tsx
│       ├── support/page.tsx
│       ├── support/tickets/page.tsx
│       ├── support/tickets/[id]/page.tsx
│       ├── wallet/stats/page.tsx
│       ├── investments/[id]/page.tsx
│       ├── notifications/page.tsx
│       └── settings/page.tsx
├── components/                   # React components (27)
│   ├── DashboardLayout.tsx      # Dashboard layout with sidebar & topbar
│   ├── Navbar.tsx               # Landing page navigation
│   ├── Footer.tsx               # Landing page footer
│   ├── Hero.tsx                 # Hero section
│   ├── About.tsx                # About us section
│   ├── Plans.tsx                # Plans showcase section
│   ├── Calculator.tsx           # ROI calculator
│   ├── Contact.tsx              # Contact form
│   ├── Login.tsx                # Login form
│   ├── Register.tsx             # Registration form
│   ├── ProtectedRoute.tsx       # Auth route guard
│   ├── DashboardHome.tsx        # Dashboard home
│   ├── AddFunds.tsx             # Deposit page
│   ├── WithdrawRequest.tsx      # Withdrawal page
│   ├── WithdrawHistory.tsx      # Withdrawal history
│   ├── DepositHistory.tsx       # Deposit history
│   ├── InvestPlans.tsx          # Browse investment plans
│   ├── MyPlans.tsx              # My active investments
│   ├── InvestmentHistory.tsx    # Investment history
│   ├── Transactions.tsx         # Transaction history
│   ├── Referrals.tsx            # Referral dashboard
│   ├── SupportTicket.tsx        # Create support ticket
│   ├── Toast.tsx                # Toast notifications
│   ├── NotificationsDropdown.tsx # Notifications dropdown
│   ├── ReduxProvider.tsx        # Redux provider wrapper
│   ├── Settings.tsx             # Settings page (old)
│   └── SettingsNew.tsx          # Settings page (new)
├── store/
│   ├── store.ts                 # Redux store config
│   ├── slices/
│   │   └── authSlice.ts         # Auth state
│   └── api/                     # RTK Query API modules (12)
│       ├── baseApi.ts           # Base API with token refresh
│       ├── authApi.ts           # Auth endpoints
│       ├── userApi.ts           # Profile endpoints
│       ├── walletApi.ts         # Wallet endpoints
│       ├── transactionApi.ts    # Transaction endpoints
│       ├── investmentApi.ts     # Investment endpoints
│       ├── investmentPlanApi.ts # Plan endpoints
│       ├── profitApi.ts         # Profit endpoints
│       ├── referralApi.ts       # Referral endpoints
│       ├── ticketApi.ts         # Ticket endpoints
│       ├── notificationApi.ts   # Notification endpoints
│       └── paymentGatewayApi.ts # Gateway endpoints
├── types.ts                     # TypeScript definitions
└── tailwind.config.js           # Tailwind configuration
```

### Public Pages

#### Landing Page (/)
- Hero section with CTA buttons
- About us section
- Investment plans showcase
- ROI calculator
- Contact form section

#### Authentication Pages
- **Login** (/login) - Email/password login
- **Register** (/register) - Full registration with optional referral code from `?ref=` URL param
- **Verify Email** (/verify-email) - 6-digit OTP code input with auto-focus navigation
- **Forgot Password** (/forgot-password) - Request password reset via email
- **Reset Password** (/reset-password) - Set new password with token

### Dashboard Pages (Protected)

#### 1. Dashboard Home (/dashboard)
- 5 stat cards: Balance, Total Deposit, Total Withdraw, Total Profit, Today's Profit
- Sparkline chart for balance trend
- Quick action buttons (Deposit/Withdraw)
- Recent transactions table (last 5)
- Real-time wallet balance in header

#### 2. Deposit (/dashboard/deposit)
- Payment gateway selection (Crypto/Bank)
- Gateway details display (QR code, wallet address, bank details)
- Amount input with validation
- File upload for payment proof (required)
- Transaction hash input

#### 3. Deposit History (/dashboard/deposit/history)
- All deposit transactions table
- Status badges and amount display

#### 4. Withdraw (/dashboard/withdraw)
- Amount input with available balance check
- Payment method selection
- Wallet address or bank details input
- Fee calculation display
- Net amount calculation

#### 5. Withdraw History (/dashboard/withdraw/history)
- All withdrawal transactions table

#### 6. Investment Plans (/dashboard/plans/invest)
- Browse all active plans
- Plan details (ROI, duration, min/max deposit)
- Popular plan badge
- Invest modal with amount input

#### 7. My Plans (/dashboard/plans/my-plans)
- Active investments list
- Investment progress tracking

#### 8. Investment History (/dashboard/plans/history)
- All investments history table

#### 9. Investment Details (/dashboard/investments/[id])
- Single investment full details
- Profit tracking

#### 10. Transactions (/dashboard/transactions)
- All transactions with type/status filters
- Search functionality
- Pagination
- Type badges with color coding

#### 11. Transaction Details (/dashboard/transactions/[id])
- Complete transaction information
- Payment details and status

#### 12. Profit History (/dashboard/profits/history)
- All profit distribution records

#### 13. Investment Profit History (/dashboard/profits/investment/[id])
- Profit distributions for a specific investment

#### 14. Referrals (/dashboard/referrals)
- Referral link with copy button
- Referral statistics
- Commission breakdown by level (1-7)
- Referral list with user details

#### 15. Referral Network (/dashboard/referrals/network)
- 7-level network tree visualization

#### 16. Support - Create Ticket (/dashboard/support)
- Create ticket form (subject, category, priority, message)

#### 17. Ticket List (/dashboard/support/tickets)
- All tickets with status indicators

#### 18. Ticket Details (/dashboard/support/tickets/[id])
- Ticket conversation with replies
- Add reply functionality
- Rate ticket after resolution

#### 19. Wallet Stats (/dashboard/wallet/stats)
- Balance trend chart
- Income/expense chart
- Transaction distribution pie chart
- Income breakdown by category
- Time range filter

#### 20. Notifications (/dashboard/notifications)
- All notifications list
- Mark as read/unread
- Delete notifications

#### 21. Settings (/dashboard/settings)
- Profile information editor
- Profile image upload/change/delete
- Change password
- Delete account

### Authentication Flow
1. User registers with email, password, names, optional referral code
2. OTP code sent to email
3. User enters 6-digit OTP on verify-email page
4. On success, redirected to login page
5. User logs in, gets access + refresh tokens stored in localStorage
6. Protected routes check authentication via Redux state
7. Token auto-refresh on 401 errors
8. Logout clears tokens and redirects to login

### Design System
- **Theme**: Dark slate-950 background
- **Accent**: Gold-400/500 (#FACC15, #EAB308)
- **Fonts**: Inter (sans), Playfair Display (serif)
- **Effects**: Glass morphism, backdrop blur, gradient backgrounds
- **Color Coding**: Green (deposits/success), Red (withdrawals/error), Gold (profits), Blue (investments), Purple (referrals), Amber (pending)

---

## API Endpoints Summary

**Base URL:** `/api/v1`
**Total Endpoints:** 90

### Authentication (10 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/verify-email | Public | Verify email with OTP |
| POST | /auth/login | Public | User login |
| POST | /auth/logout | Public | Logout |
| POST | /auth/refresh-tokens | Public | Refresh access token |
| POST | /auth/send-verification-email | User | Resend verification email |
| POST | /auth/forgot-password | Public | Request password reset |
| POST | /auth/reset-password | Public | Reset password with token |
| POST | /auth/change-password | User | Change password |
| POST | /auth/delete-me | User | Delete own account |

### User Profile (2 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /users/self/in | User | Get own profile |
| PATCH | /users/self/update | User | Update profile (with image upload) |

### Wallet (2 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /wallet | User | Get wallet balance |
| GET | /wallet/stats | User | Get wallet statistics |

### Transactions (9 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /transactions/deposit | User | Create deposit (with proof image) |
| POST | /transactions/withdraw | User | Create withdrawal |
| GET | /transactions/my | User | Get my transactions |
| GET | /transactions/stats | User | Get transaction stats |
| GET | /transactions/:transactionId | User | Get transaction details |
| GET | /transactions/admin/all | Admin | Get all transactions |
| GET | /transactions/admin/pending | Admin | Get pending transactions |
| POST | /transactions/admin/:transactionId/approve | Admin | Approve transaction |
| POST | /transactions/admin/:transactionId/reject | Admin | Reject transaction |

### Investment Plans (6 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /plans/active | Public | Get active plans |
| GET | /plans | User | Get all plans |
| GET | /plans/:planId | User | Get plan details |
| POST | /plans | Admin | Create plan |
| PATCH | /plans/:planId | Admin | Update plan |
| DELETE | /plans/:planId | Admin | Delete plan |

### Investments (6 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /investments | User | Create investment |
| GET | /investments/my | User | Get my investments |
| GET | /investments/active | User | Get active investments |
| GET | /investments/stats | User | Get investment stats |
| GET | /investments/:investmentId | User | Get investment details |
| GET | /investments/admin/all | Admin | Get all investments |

### Referral System (7 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /referrals/validate/:code | Public | Validate referral code |
| GET | /referrals/commission-rates | Public | Get commission rates |
| GET | /referrals/my | User | Get my referrals |
| GET | /referrals/stats | User | Get referral stats |
| GET | /referrals/team-network | User | Get 7-level team network |
| GET | /referrals/commission-breakdown | User | Get commission breakdown |
| GET | /referrals/admin/all | Admin | Get all referrals |

### Payment Gateways (8 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /gateways/active | Public | Get active gateways |
| GET | /gateways/type/:type | User | Get gateways by type |
| GET | /gateways/:gatewayId | User | Get gateway details |
| GET | /gateways | Admin | Get all gateways |
| POST | /gateways | Admin | Create gateway |
| PATCH | /gateways/:gatewayId | Admin | Update gateway |
| DELETE | /gateways/:gatewayId | Admin | Delete gateway |
| POST | /gateways/:gatewayId/toggle | Admin | Toggle gateway status |

### Support Tickets (9 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /tickets | User | Create ticket |
| GET | /tickets/my | User | Get my tickets |
| GET | /tickets/:ticketId | User | Get ticket details |
| POST | /tickets/:ticketId/reply | User | Reply to ticket |
| POST | /tickets/:ticketId/rate | User | Rate ticket |
| GET | /tickets/admin/all | Admin | Get all tickets |
| GET | /tickets/admin/stats | Admin | Get ticket stats |
| PATCH | /tickets/admin/:ticketId/status | Admin | Update ticket status |
| POST | /tickets/admin/:ticketId/assign | Admin | Assign ticket |

### Notifications (8 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /notifications | User | Get my notifications |
| GET | /notifications/unread-count | User | Get unread count |
| POST | /notifications/:notificationId/read | User | Mark as read |
| POST | /notifications/mark-all-read | User | Mark all as read |
| DELETE | /notifications/:notificationId | User | Delete notification |
| DELETE | /notifications | User | Delete all notifications |
| POST | /notifications/admin/send | Admin | Send to specific user |
| POST | /notifications/admin/broadcast | Admin | Broadcast to all users |

### Admin Dashboard (9 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /admin/dashboard | Admin | Get dashboard stats |
| GET | /admin/activities | Admin | Get recent activities |
| GET | /admin/users | Admin | Get all users |
| GET | /admin/users/:userId | Admin | Get user details |
| POST | /admin/users/:userId/block | Admin | Block/unblock user |
| POST | /admin/users/:userId/kyc | Admin | Update KYC status |
| POST | /admin/users/:userId/add-balance | Admin | Add balance to wallet |
| POST | /admin/users/:userId/deduct-balance | Admin | Deduct balance from wallet |
| DELETE | /admin/users/:userId | Admin | Delete user |

### Profit Distribution (14 endpoints)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /profits/my-history | User | Get my profit history |
| GET | /profits/investment/:investmentId/history | User | Get investment profit history |
| POST | /profits/admin/run-distribution | Admin | Run profit distribution (all) |
| POST | /profits/admin/investment/:investmentId/distribute | Admin | Distribute for single investment |
| POST | /profits/admin/investment/:investmentId/pause | Admin | Pause investment |
| POST | /profits/admin/investment/:investmentId/resume | Admin | Resume investment |
| POST | /profits/admin/investment/:investmentId/manual-distribution | Admin | Manual profit distribution |
| GET | /profits/admin/all | Admin | Get all distributions |
| POST | /profits/admin/adjustments | Admin | Create adjustment |
| GET | /profits/admin/adjustments | Admin | Get all adjustments |
| GET | /profits/admin/adjustments/:adjustmentId | Admin | Get adjustment |
| PATCH | /profits/admin/adjustments/:adjustmentId | Admin | Update adjustment |
| POST | /profits/admin/adjustments/:adjustmentId/toggle | Admin | Toggle adjustment |
| DELETE | /profits/admin/adjustments/:adjustmentId | Admin | Delete adjustment |

---

## Features Summary

### User Features
- Registration with email verification (OTP)
- Login with JWT authentication (auto token refresh)
- Password reset via email
- Profile management with image upload
- Wallet balance tracking & statistics
- Deposit funds with payment proof upload
- Withdraw funds with fee calculation
- Browse and invest in investment plans
- Track investments and earned profits
- View profit distribution history
- Referral system with unique referral link
- 7-level referral network visualization
- Commission tracking per level
- Create support tickets
- Real-time ticket conversation
- Rate support experience
- Notification center with read/unread status
- Transaction history with filters
- Delete account

### Admin Features
- Admin login with role verification
- Dashboard with real-time platform statistics
- Cashflow chart (7-day deposits vs withdrawals)
- User management (view, block, KYC, balance adjustment, delete)
- Investment plan CRUD (create, edit, delete, toggle)
- Payment gateway management (crypto/bank/processor)
- Transaction approval/rejection workflow
- Transaction history with all filters
- Profit distribution management (auto + manual)
- Profit adjustment system (global/user/investment/plan level)
- Referral network overview and commission tracking
- Support ticket management with assignment
- Send/broadcast notifications
- Analytics & reports with export
- Emergency stop system
- Admin profile and password management

### System Features
- JWT authentication with access + refresh tokens
- Role-based access control (user/admin/superAdmin)
- Real-time notifications via Socket.IO
- Automated profit distribution (every 8 hours via cron)
- File upload system (Multer, 20MB max)
- HEIC to PNG image conversion
- Request validation (Joi)
- API rate limiting
- XSS protection
- NoSQL injection protection
- Security headers (Helmet)
- CORS support
- Structured logging (Winston)
- Error handling middleware
- Pagination with sorting and filtering
- Auto-generated transaction IDs
- Auto-generated referral codes
- KYC verification workflow

### Security Features
- Password hashing (bcrypt)
- JWT token-based authentication
- Automatic token refresh on expiry
- Rate limiting on auth endpoints
- XSS protection (xss-clean)
- NoSQL injection protection (express-mongo-sanitize)
- Security headers (Helmet)
- CORS configuration
- Input validation on all endpoints
- Role-based route protection

---

## API Response Format

**Success Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "attributes": { ... }
  }
}
```

**Paginated Response:**
```json
{
  "results": [...],
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "totalResults": 50
}
```

**Error Response:**
```json
{
  "code": 400,
  "message": "Error message"
}
```

---

## Postman Collection

A complete Postman collection is available at:
`investment-server/Investment Platform API.postman_collection.json`

- 90 endpoints across 12 folders
- Pre-configured with Bearer Token authentication
- Variables: `baseUrl`, `accessToken`, `refreshToken`
- Auto-saves tokens on login via test scripts
- Sample request bodies for all POST/PATCH endpoints

---

*Document generated for Investment Platform Version 1.0*
