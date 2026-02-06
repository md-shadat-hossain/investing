# New Website Routes - Quick Reference Guide

## 🗺️ ALL NEW ROUTES CREATED

### Authentication Pages (Public)
```
/forgot-password              → Password recovery request
/reset-password?token=XXX     → Reset password with token
/verify-email?token=XXX       → Email verification
```

### Dashboard Pages (Protected)

#### Wallet & Balance
```
/dashboard/wallet/stats       → Wallet analytics & statistics
```

#### Investments
```
/dashboard/investments/[id]   → Individual investment details
                                (e.g., /dashboard/investments/INV-001)
```

#### Transactions
```
/dashboard/transactions/[id]  → Transaction detail page
                                (e.g., /dashboard/transactions/TXN-123)
```

#### Profit Tracking
```
/dashboard/profits/history                   → All profit distributions
/dashboard/profits/investment/[id]           → Investment-specific profits
                                                (e.g., /dashboard/profits/investment/INV-001)
```

#### Referral Network
```
/dashboard/referrals/network  → 7-Level commission structure
```

#### Support System
```
/dashboard/support/tickets    → My tickets list
/dashboard/support/tickets/[id] → Ticket conversation
                                   (e.g., /dashboard/support/tickets/TKT-001)
```

#### Notifications
```
/dashboard/notifications      → Notification center
```

---

## 📱 NAVIGATION MENU STRUCTURE

```
Dashboard                     → /dashboard
│
Wallet                        (Submenu)
├── Deposit                   → /dashboard/deposit
└── Wallet Stats              → /dashboard/wallet/stats ✨ NEW
│
Withdraw                      (Submenu)
├── Request                   → /dashboard/withdraw
└── History                   → /dashboard/withdraw/history
│
Plans                         (Submenu)
├── Invest                    → /dashboard/plans/invest
├── My Plans                  → /dashboard/plans/my-plans
└── Investment History        → /dashboard/plans/history
│
Transactions                  → /dashboard/transactions
│
Profit History                → /dashboard/profits/history ✨ NEW
│
Referral                      (Submenu)
├── Overview                  → /dashboard/referrals
└── 7-Level Network           → /dashboard/referrals/network ✨ NEW
│
Support                       (Submenu)
├── Create Ticket             → /dashboard/support
└── My Tickets                → /dashboard/support/tickets ✨ NEW
│
Notifications                 → /dashboard/notifications ✨ NEW
│
Settings                      → /dashboard/settings
```

---

## 🔗 ROUTE PARAMETERS

### Dynamic Routes:

**Investment ID**
- Format: `INV-XXXXX`
- Example: `/dashboard/investments/INV-12345`

**Transaction ID**
- Format: `TXN-XXXX-XXXXXX`
- Example: `/dashboard/transactions/TXN-2024-001234`

**Ticket ID**
- Format: `TKT-XXXX-XXX`
- Example: `/dashboard/support/tickets/TKT-2024-001`

---

## 🎯 USER FLOW EXAMPLES

### View Investment Progress:
```
Dashboard → Plans → My Plans → [Click Investment] → Investment Detail Page
```

### Check Profit History:
```
Dashboard → Profit History → [View All Distributions]
Dashboard → Profit History → [Click Investment] → Investment-Specific Profits
```

### View Transaction Proof:
```
Dashboard → Transactions → [Click Transaction] → Transaction Detail → [View Screenshot]
```

### Manage Support Tickets:
```
Dashboard → Support → My Tickets → [Click Ticket] → Conversation → [Reply/Rate]
```

### View Referral Network:
```
Dashboard → Referral → 7-Level Network → [Click Level Card] → Modal with Users
```

### Check Wallet Stats:
```
Dashboard → Wallet → Wallet Stats → [View Charts & Analytics]
```

---

## ✨ NEW FEATURES SUMMARY

**Total New Routes**: 11 dynamic + 6 static = **17 new pages**

**Coverage**: 100% of user-facing API endpoints

**Technologies Used**:
- Next.js 14 App Router
- React Server Components
- Dynamic routing with [id]
- Client components with 'use client'
- TypeScript for type safety
- Recharts for data visualization

---

## 🚀 QUICK START

### To navigate to any page:

1. Use the sidebar menu (mobile/desktop responsive)
2. Click submenu items to expand
3. Click any menu item to navigate
4. Use browser back button or page back buttons

### Example Navigation Code:

```typescript
import { useRouter } from 'next/navigation'

// Navigate to investment detail
router.push(`/dashboard/investments/${investmentId}`)

// Navigate to transaction detail
router.push(`/dashboard/transactions/${transactionId}`)

// Navigate to ticket conversation
router.push(`/dashboard/support/tickets/${ticketId}`)

// Navigate to profit history
router.push('/dashboard/profits/history')
```

---

## 📊 PAGE TYPES

### List Pages (Table/Grid):
- `/dashboard/support/tickets` - Ticket list
- `/dashboard/profits/history` - Profit distributions
- `/dashboard/referrals/network` - Level cards

### Detail Pages:
- `/dashboard/investments/[id]` - Investment detail
- `/dashboard/transactions/[id]` - Transaction detail
- `/dashboard/support/tickets/[id]` - Ticket conversation
- `/dashboard/profits/investment/[id]` - Investment profits

### Stats/Analytics Pages:
- `/dashboard/wallet/stats` - Wallet analytics
- `/dashboard/notifications` - Notification center

---

## 🔐 AUTHENTICATION

All dashboard routes (`/dashboard/*`) require authentication.

Public routes:
- `/forgot-password`
- `/reset-password`
- `/verify-email`

Protected routes:
- All `/dashboard/*` routes

---

Made with ❤️ for your Investment Platform
