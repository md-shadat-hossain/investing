# Postman Collection - Usage Guide

## 📥 Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **Investment-Platform-API.postman_collection.json**
4. Click **Import**

## ⚙️ Setup Environment Variables

The collection uses variables that are automatically set during authentication:

### Collection Variables (Auto-set):
- `baseUrl` - API base URL (default: http://localhost:5000/api/v1)
- `accessToken` - JWT access token (set after login)
- `refreshToken` - JWT refresh token (set after login)
- `userId` - Current user ID (set after login)
- `referralCode` - Current user's referral code (set after login/verify-email)

### Manual Configuration:
1. Click on the collection name
2. Go to **Variables** tab
3. Update `baseUrl` if your API runs on a different URL
4. Save

## 🚀 Quick Start - Testing Flow

### Step 1: Register User A
```
1. Go to: Authentication → Register
2. Body:
   {
     "email": "userA@test.com",
     "password": "Password123",
     "fullName": "User A"
   }
3. Send
4. Response: User created, verification email sent
```

### Step 2: Verify Email
```
1. Go to: Authentication → Verify Email
2. Body:
   {
     "email": "userA@test.com",
     "oneTimeCode": "123456"
   }
3. Send
4. ✅ Tokens automatically saved to variables
5. ✅ referralCode automatically saved
```

### Step 3: Check Referral Code
```
1. Go to: Referral System → User → Get Referral Statistics
2. Send (uses auto-saved accessToken)
3. Copy the referralCode from response
```

### Step 4: Register User B with A's Code
```
1. Go to: Authentication → Register
2. Body:
   {
     "email": "userB@test.com",
     "password": "Password123",
     "fullName": "User B",
     "referralCode": "userA123abc"  ← User A's code
   }
3. Send
4. Verify User B's email
5. ✅ Referral relationship created (Level 1)
```

### Step 5: Continue Chain (C, D, E, F, G)
```
Repeat Step 4 for Users C, D, E, F, G using previous user's code
Result: 7-level referral chain
```

### Step 6: Make Deposit (User G)
```
1. Login as User G
2. Go to: Transactions → Create Deposit Request
3. Body:
   {
     "amount": 1000,
     "paymentMethod": "gateway_id",
     "paymentProof": "https://example.com/proof.jpg"
   }
4. Send
```

### Step 7: Approve Deposit (Admin)
```
1. Login as admin
2. Go to: Transactions → Get Pending Transactions
3. Copy transactionId
4. Go to: Transactions → Approve Transaction
5. Update :transactionId in URL
6. Send
7. ✅ All 7 levels receive commissions automatically!
```

### Step 8: Verify Commissions
```
1. Login as User A (Level 6 from G)
2. Go to: Wallet → Get My Wallet
3. Check balance increased by $10 (1%)
4. Go to: Referral System → Get Commission Breakdown
5. See earnings from all levels
```

## 📊 Testing the 7-Level Referral System

### Test Scenario 1: Validate Referral Code (Public)
```
Endpoint: GET /referrals/validate/:code
Auth: None
Steps:
  1. Go to: Referral System → Public → Validate Referral Code
  2. Replace :code with actual referral code
  3. Send
Expected: {"valid": true, "referrerName": "User A"}
```

### Test Scenario 2: Get Commission Rates (Public)
```
Endpoint: GET /referrals/commission-rates
Auth: None
Steps:
  1. Go to: Referral System → Public → Get Commission Rates
  2. Send
Expected: Array with 7 levels showing commission rates
```

### Test Scenario 3: View Your Referral Stats
```
Endpoint: GET /referrals/stats
Auth: Required
Steps:
  1. Login as any user with referrals
  2. Go to: Referral System → User → Get Referral Statistics
  3. Send
Expected:
  - referralCode
  - totalReferrals
  - totalEarnings
  - levelBreakdown (level1 through level7)
```

### Test Scenario 4: View Network Tree
```
Endpoint: GET /referrals/team-network
Auth: Required
Steps:
  1. Login as User A (top of chain)
  2. Go to: Referral System → User → Get Team Network Tree
  3. Send
Expected:
  - Hierarchical tree structure
  - All 6 downline members visible
  - Nested children showing the chain
```

### Test Scenario 5: Commission Breakdown
```
Endpoint: GET /referrals/commission-breakdown
Auth: Required
Steps:
  1. Login as User A
  2. Go to: Referral System → User → Get Commission Breakdown
  3. Send
Expected: Array showing earnings for each level (1-7)
```

## 🔐 Authentication Flow

### For Each Test User:

**Method 1: Register → Verify → Auto-Login**
```
1. POST /auth/register
2. POST /auth/verify-email
   ✅ Tokens saved automatically
```

**Method 2: Login Existing User**
```
1. POST /auth/login
   ✅ Tokens saved automatically
```

**Switch Between Users:**
```
1. Logout current user (optional)
2. Login as different user
3. Tokens automatically updated
```

## 📁 Collection Structure

```
Investment Platform API
├── Authentication (8 endpoints)
│   ├── Register
│   ├── Verify Email
│   ├── Login ← Saves tokens automatically
│   ├── Logout
│   ├── Forgot Password
│   ├── Reset Password
│   ├── Change Password
│   └── Delete Account
│
├── User Profile (2 endpoints)
│   ├── Get My Profile
│   └── Update Profile
│
├── Wallet (2 endpoints)
│   ├── Get My Wallet
│   └── Get Wallet Stats
│
├── Investment Plans (6 endpoints)
│   ├── Get Active Plans (Public)
│   ├── Get All Plans
│   ├── Get Plan by ID
│   ├── Create Plan (Admin)
│   ├── Update Plan (Admin)
│   └── Delete Plan (Admin)
│
├── Investments (6 endpoints)
│   ├── Create Investment
│   ├── Get My Investments
│   ├── Get Active Investments
│   ├── Get Investment Stats
│   ├── Get Investment by ID
│   └── Get All Investments (Admin)
│
├── Transactions (9 endpoints)
│   ├── Create Deposit Request
│   ├── Create Withdrawal Request
│   ├── Get My Transactions
│   ├── Get Transaction by ID
│   ├── Get Transaction Stats
│   ├── Get All Transactions (Admin)
│   ├── Get Pending Transactions (Admin)
│   ├── Approve Transaction (Admin) ← Triggers 7-level commissions
│   └── Reject Transaction (Admin)
│
├── Referral System (7-Level MLM) (7 endpoints)
│   ├── Public
│   │   ├── Validate Referral Code
│   │   └── Get Commission Rates
│   ├── User
│   │   ├── Get My Referrals
│   │   ├── Get Referral Statistics ← Level breakdown
│   │   ├── Get Team Network Tree ← Hierarchical view
│   │   └── Get Commission Breakdown ← Earnings by level
│   └── Admin
│       └── Get All Referrals
│
├── Payment Gateways (8 endpoints)
│   ├── Get Active Gateways (Public)
│   ├── Get Gateways by Type
│   ├── Get Gateway by ID
│   ├── Get All Gateways (Admin)
│   ├── Create Gateway (Admin)
│   ├── Update Gateway (Admin)
│   ├── Toggle Gateway Status (Admin)
│   └── Delete Gateway (Admin)
│
├── Support Tickets (9 endpoints)
│   ├── Create Ticket
│   ├── Get My Tickets
│   ├── Get Ticket by ID
│   ├── Add Reply to Ticket
│   ├── Rate Ticket
│   ├── Get All Tickets (Admin)
│   ├── Get Ticket Stats (Admin)
│   ├── Update Ticket Status (Admin)
│   └── Assign Ticket (Admin)
│
├── Notifications (8 endpoints)
│   ├── Get My Notifications
│   ├── Get Unread Count
│   ├── Mark as Read
│   ├── Mark All as Read
│   ├── Delete Notification
│   ├── Delete All Notifications
│   ├── Send to User (Admin)
│   └── Broadcast to All (Admin)
│
└── Admin Dashboard (9 endpoints)
    ├── Get Dashboard Stats
    ├── Get Recent Activities
    ├── Get All Users
    ├── Get User Details
    ├── Block/Unblock User
    ├── Update KYC Status
    ├── Add User Balance
    ├── Deduct User Balance
    └── Delete User
```

**Total: 75+ API Endpoints**

## 🧪 Complete 7-Level Testing Workflow

### Create Test Users
```bash
# User A (Top Level)
POST /auth/register → email: userA@test.com
POST /auth/verify-email
Copy referralCode

# User B (A's direct referral)
POST /auth/register → referralCode: userA's code
POST /auth/verify-email
Copy referralCode

# User C (B's referral, A's Level 2)
POST /auth/register → referralCode: userB's code
POST /auth/verify-email
Copy referralCode

# User D (C's referral, B's Level 2, A's Level 3)
POST /auth/register → referralCode: userC's code
POST /auth/verify-email
Copy referralCode

# User E (D's referral, C's L2, B's L3, A's L4)
POST /auth/register → referralCode: userD's code
POST /auth/verify-email
Copy referralCode

# User F (E's referral, D's L2, C's L3, B's L4, A's L5)
POST /auth/register → referralCode: userE's code
POST /auth/verify-email
Copy referralCode

# User G (F's referral, E's L2, D's L3, C's L4, B's L5, A's L6)
POST /auth/register → referralCode: userF's code
POST /auth/verify-email
```

### Verify Referral Chain
```bash
# Login as User A
POST /auth/login

# Check network
GET /referrals/team-network
Expected: See all 6 users in tree

GET /referrals/stats
Expected: levelBreakdown shows:
  - level1: 1 user (B)
  - level2: 1 user (C)
  - level3: 1 user (D)
  - level4: 1 user (E)
  - level5: 1 user (F)
  - level6: 1 user (G)
```

### Test Commission Distribution
```bash
# Login as User G (bottom of chain)
POST /auth/login

# Create deposit
POST /transactions/deposit
Body: { amount: 1000, paymentMethod: "gateway_id" }

# Login as Admin
POST /auth/login (admin credentials)

# Approve deposit
GET /transactions/admin/pending
Copy transactionId

POST /transactions/admin/:transactionId/approve
Body: { adminNote: "Verified" }

# Verify commissions paid
Login as each user A-F and check:
GET /wallet → Check balance
GET /referrals/stats → Check totalEarnings
GET /referrals/commission-breakdown → See level earnings

Expected:
- User F: +$80 (8% of $1000)
- User E: +$40 (4% of $1000)
- User D: +$30 (3% of $1000)
- User C: +$20 (2% of $1000)
- User B: +$10 (1% of $1000)
- User A: +$10 (1% of $1000)
```

## 💡 Pro Tips

### 1. Use Environment Variables
```
Instead of: "http://localhost:5000/api/v1/users/123"
Use: "{{baseUrl}}/users/{{userId}}"
```

### 2. Test Scripts Auto-Save Tokens
The collection includes test scripts that automatically:
- Save access tokens after login
- Save refresh tokens
- Save user ID
- Save referral code

### 3. Pre-Request Scripts
Some endpoints have pre-request scripts that:
- Check if token exists
- Auto-refresh expired tokens
- Validate required variables

### 4. Organize Testing
Create separate environments for:
- **Development** (localhost:5000)
- **Staging** (staging.yoursite.com)
- **Production** (api.yoursite.com)

### 5. Use Postman Folders
Test systematically:
1. ✓ Authentication flow
2. ✓ User operations
3. ✓ Referral system
4. ✓ Transactions
5. ✓ Admin operations

## 🐛 Troubleshooting

### Error: Unauthorized (401)
**Solution:**
```
1. Check if token is set: {{accessToken}}
2. Re-login: Authentication → Login
3. Verify token saved in Variables tab
```

### Error: Token expired
**Solution:**
```
1. Use refresh token endpoint (if available)
2. Or re-login to get new tokens
```

### Error: Referral code invalid
**Solution:**
```
1. GET /referrals/stats to get valid code
2. Or use Validate Referral Code endpoint
```

### Variables not saving
**Solution:**
```
1. Check test scripts are enabled
2. Manually set in Variables tab
3. Re-import collection
```

## 📝 Notes

- All requests with 🔒 require authentication (Bearer token)
- Public endpoints work without authentication
- Admin endpoints require admin role
- File uploads use `multipart/form-data`
- Most endpoints return standardized response format:
  ```json
  {
    "code": 200,
    "message": "Success message",
    "status": "OK",
    "statusCode": 200,
    "data": { ... }
  }
  ```

## 📚 Additional Resources

- Full API Documentation: See `REFERRAL_SYSTEM.md`
- Example Scenarios: See `referral-example.js`
- Postman Documentation: https://learning.postman.com/

---

**Happy Testing! 🚀**

For issues or questions, check the console logs or server response details.
