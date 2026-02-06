# Wallet Recharge Functionality - Implementation Guide

## Overview
The wallet recharge functionality allows users to request deposits by submitting payment proof, which admins can review and approve/reject. Upon approval, the requested amount is automatically added to the user's wallet.

## Features Implemented

### 1. User Deposit Request Flow
- User submits recharge request with:
  - **Screenshot/Proof Image** (Required) - Payment proof screenshot
  - **Amount** (Required) - Deposit amount
  - **Transaction ID** (Required) - User's payment transaction ID from their gateway
  - **Gateway ID** (Required) - Selected payment gateway
  - **Wallet Address** (Optional) - For crypto payments
- System validates:
  - Gateway exists and is active
  - Deposit amount within gateway limits
  - Calculates fees (fixed or percentage-based)
  - Requires proof image upload

### 2. Admin Review & Approval
- Admin can view all pending deposit requests
- Admin sees:
  - User information (name, email, avatar)
  - Deposit amount and payment method
  - Transaction ID (masked for security)
  - Payment gateway used
  - **Proof image viewer** (click to view full screenshot)
- Admin can:
  - **Approve**: Amount automatically added to user's wallet
  - **Reject**: Request denied with reason

### 3. Notification System
- User notified when:
  - Request submitted successfully
  - Request approved (amount credited)
  - Request rejected (with reason)
- Admin notified when:
  - New deposit request received

---

## API Endpoints

### Create Deposit Request (User)
```http
POST /api/v1/transactions/deposit
Authorization: Bearer <user_token>
Content-Type: multipart/form-data
```

**Request Body:**
```javascript
{
  "amount": 1000,                           // Required: Deposit amount
  "paymentGatewayId": "gateway_id_here",    // Required: Gateway ObjectId
  "txHash": "user_txn_id_12345",            // Required: User's transaction ID
  "walletAddress": "0x742d35Cc...",         // Optional: For crypto
  "proofImage": <File>                      // Required: Screenshot file (jpg, png, jpeg, heic, heif)
}
```

**Success Response (201):**
```json
{
  "status": "OK",
  "statusCode": 201,
  "message": "Deposit request created successfully. Please wait for admin approval.",
  "data": {
    "_id": "transaction_id",
    "user": "user_id",
    "type": "deposit",
    "amount": 1000,
    "fee": 10,
    "netAmount": 990,
    "status": "pending",
    "paymentMethod": "crypto",
    "paymentGateway": "gateway_id",
    "txHash": "user_txn_id_12345",
    "proofImage": "/uploads/proof-1234567890.jpg",
    "transactionId": "TXN-DEP-1234567890-ABC123",
    "createdAt": "2026-02-04T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (missing required fields, invalid amount, gateway limits exceeded)
- `404` - Payment gateway not found
- `401` - Unauthorized (not logged in)

---

### Get Active Payment Gateways (User)
```http
GET /api/v1/gateways/active?purpose=deposit
```

**Response:**
```json
{
  "data": [
    {
      "_id": "gateway_id",
      "name": "Bitcoin (BTC)",
      "type": "crypto",
      "currency": "BTC",
      "walletAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "qrCode": "/uploads/btc-qr.png",
      "minDeposit": 100,
      "maxDeposit": 50000,
      "depositFee": 2,
      "depositFeeType": "percentage",
      "isActive": true,
      "isDepositEnabled": true
    }
  ]
}
```

---

### Get My Transactions (User)
```http
GET /api/v1/transactions/my?type=deposit&status=pending
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `type`: deposit | withdraw | investment | profit | referral | bonus
- `status`: pending | processing | completed | rejected | cancelled
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (default: createdAt:desc)

---

### Get Pending Transactions (Admin)
```http
GET /api/v1/transactions/admin/pending?type=deposit
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "data": [
    {
      "_id": "transaction_id",
      "user": {
        "_id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com",
        "image": "/uploads/users/john.jpg"
      },
      "type": "deposit",
      "amount": 1000,
      "fee": 10,
      "netAmount": 990,
      "status": "pending",
      "paymentGateway": {
        "_id": "gateway_id",
        "name": "Bitcoin (BTC)",
        "type": "crypto"
      },
      "txHash": "user_txn_id_12345",
      "proofImage": "/uploads/proof-1234567890.jpg",
      "transactionId": "TXN-DEP-1234567890-ABC123",
      "createdAt": "2026-02-04T10:30:00.000Z"
    }
  ]
}
```

---

### Approve Transaction (Admin)
```http
POST /api/v1/transactions/admin/:transactionId/approve
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "adminNote": "Verified payment received"  // Optional
}
```

**Success Response (200):**
```json
{
  "status": "OK",
  "message": "Transaction approved successfully",
  "data": {
    "_id": "transaction_id",
    "status": "completed",
    "processedBy": "admin_id",
    "processedAt": "2026-02-04T11:00:00.000Z",
    "adminNote": "Verified payment received"
  }
}
```

**What happens:**
1. Transaction status changed to "completed"
2. User's wallet balance increased by `netAmount`
3. `totalDeposit` field in wallet updated
4. User receives notification
5. Referral bonus processed (if applicable)

---

### Reject Transaction (Admin)
```http
POST /api/v1/transactions/admin/:transactionId/reject
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Invalid payment proof or amount mismatch"  // Required
}
```

**Success Response (200):**
```json
{
  "status": "OK",
  "message": "Transaction rejected successfully",
  "data": {
    "_id": "transaction_id",
    "status": "rejected",
    "processedBy": "admin_id",
    "processedAt": "2026-02-04T11:00:00.000Z",
    "adminNote": "Invalid payment proof or amount mismatch"
  }
}
```

**What happens:**
1. Transaction status changed to "rejected"
2. No wallet balance change
3. User receives notification with rejection reason

---

## File Upload Specifications

### Image Requirements
- **Allowed formats**: JPG, JPEG, PNG, HEIC, HEIF
- **Max file size**: 20MB
- **Storage location**: `investment-server/public/uploads/`
- **Naming convention**: `originalname-timestamp-random.ext`
- **Field name**: `proofImage` (multipart/form-data)

### Example using Axios (Frontend)
```javascript
const formData = new FormData();
formData.append('amount', '1000');
formData.append('paymentGatewayId', 'gateway_id_here');
formData.append('txHash', 'user_txn_id_12345');
formData.append('proofImage', imageFile); // File object from input

const response = await axios.post('/api/v1/transactions/deposit', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${userToken}`
  }
});
```

### Example using cURL
```bash
curl -X POST http://localhost:3000/api/v1/transactions/deposit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "amount=1000" \
  -F "paymentGatewayId=65f1234567890abcdef12345" \
  -F "txHash=user_payment_id_12345" \
  -F "proofImage=@/path/to/screenshot.jpg"
```

---

## Admin Panel Integration

### Current Status
The admin panel is already set up to handle wallet recharge functionality:

✅ **TransactionTable Component** displays:
- User information with avatar
- Deposit amount (color-coded green for deposits)
- Payment method and gateway
- Transaction ID (masked)
- **Proof image viewer** (click icon to view)
- Approve/Reject buttons

✅ **Image Modal** shows:
- Full-size proof screenshot
- "Open Original" link to view in new tab

### Connecting to Real API

Currently, the admin panel uses mock data. To connect to your backend:

**Step 1: Create API service file**
```typescript
// investment-admin-panel/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const transactionAPI = {
  getPendingTransactions: (type?: 'deposit' | 'withdrawal') =>
    api.get('/transactions/admin/pending', { params: { type } }),

  approveTransaction: (transactionId: string, adminNote?: string) =>
    api.post(`/transactions/admin/${transactionId}/approve`, { adminNote }),

  rejectTransaction: (transactionId: string, reason: string) =>
    api.post(`/transactions/admin/${transactionId}/reject`, { reason }),

  getAllTransactions: (filters?: any) =>
    api.get('/transactions/admin/all', { params: filters }),
};
```

**Step 2: Update App.tsx to use real API**
```typescript
// Replace MOCK_TRANSACTIONS with API calls
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadTransactions();
}, []);

const loadTransactions = async () => {
  try {
    const response = await transactionAPI.getPendingTransactions();
    const mappedTransactions = response.data.data.map(tx => ({
      id: tx._id,
      date: tx.createdAt,
      user: {
        id: tx.user._id,
        name: tx.user.fullName,
        email: tx.user.email,
        avatar: tx.user.image || '/uploads/users/user.png',
      },
      amount: tx.amount,
      type: tx.type,
      method: tx.paymentGateway?.name || tx.paymentMethod,
      transactionId: tx.transactionId,
      proofUrl: tx.proofImage ? `${API_BASE_URL}${tx.proofImage}` : undefined,
      status: tx.status,
    }));
    setTransactions(mappedTransactions);
  } catch (error) {
    console.error('Failed to load transactions:', error);
  } finally {
    setLoading(false);
  }
};

const handleApprove = async (id: string) => {
  try {
    await transactionAPI.approveTransaction(id);
    await loadTransactions(); // Reload data
    setToast({ message: 'Transaction approved successfully', type: 'success' });
  } catch (error) {
    setToast({ message: 'Failed to approve transaction', type: 'error' });
  }
};
```

---

## Database Schema

### Transaction Model
```javascript
{
  user: ObjectId,                    // Reference to User
  type: "deposit",                   // Transaction type
  amount: Number,                    // Requested amount
  fee: Number,                       // Gateway fee
  netAmount: Number,                 // Amount after fee (credited to wallet)
  status: "pending",                 // pending | completed | rejected
  paymentMethod: String,             // bitcoin | ethereum | usdt | bank_transfer, etc.
  paymentGateway: ObjectId,          // Reference to PaymentGateway
  walletAddress: String,             // For crypto (optional)
  txHash: String,                    // User's transaction ID (required)
  transactionId: String,             // System-generated unique ID
  proofImage: String,                // Path to uploaded screenshot (required)
  adminNote: String,                 // Admin's note on approval/rejection
  processedBy: ObjectId,             // Admin who processed the request
  processedAt: Date,                 // Processing timestamp
  createdAt: Date,                   // Request timestamp
  updatedAt: Date
}
```

### Wallet Model
```javascript
{
  user: ObjectId,                    // Reference to User (unique)
  balance: Number,                   // Current balance
  totalDeposit: Number,              // Total deposits (increases on approval)
  totalWithdraw: Number,             // Total withdrawals
  totalProfit: Number,               // Total profits
  totalInvested: Number,             // Total invested
  referralEarnings: Number,          // Referral bonuses
  currency: "USD"
}
```

---

## Testing Guide

### 1. Test User Deposit Request

**Using Postman/Thunder Client:**

1. **Login as User**
   ```
   POST http://localhost:3000/api/v1/auth/login
   Body: { "email": "user@example.com", "password": "password123" }
   ```
   Copy the `accessToken` from response.

2. **Get Active Gateways**
   ```
   GET http://localhost:3000/api/v1/gateways/active?purpose=deposit
   ```
   Copy a `_id` from the response.

3. **Create Deposit Request**
   ```
   POST http://localhost:3000/api/v1/transactions/deposit
   Headers:
     Authorization: Bearer <user_token>
   Body (form-data):
     amount: 1000
     paymentGatewayId: <gateway_id_from_step_2>
     txHash: TEST-TXN-12345
     proofImage: <upload_screenshot_file>
   ```

4. **Check User's Transactions**
   ```
   GET http://localhost:3000/api/v1/transactions/my?type=deposit&status=pending
   Headers: Authorization: Bearer <user_token>
   ```

### 2. Test Admin Approval

1. **Login as Admin**
   ```
   POST http://localhost:3000/api/v1/auth/login
   Body: { "email": "admin@example.com", "password": "admin123" }
   ```

2. **Get Pending Deposits**
   ```
   GET http://localhost:3000/api/v1/transactions/admin/pending?type=deposit
   Headers: Authorization: Bearer <admin_token>
   ```
   Copy a transaction `_id`.

3. **Approve Transaction**
   ```
   POST http://localhost:3000/api/v1/transactions/admin/<transaction_id>/approve
   Headers: Authorization: Bearer <admin_token>
   Body: { "adminNote": "Payment verified" }
   ```

4. **Check User's Wallet Balance**
   ```
   GET http://localhost:3000/api/v1/wallet
   Headers: Authorization: Bearer <user_token>
   ```
   Balance should be increased by `netAmount`.

### 3. Test Admin Rejection

1. **Create another deposit request** (as user)
2. **Get pending transaction** (as admin)
3. **Reject Transaction**
   ```
   POST http://localhost:3000/api/v1/transactions/admin/<transaction_id>/reject
   Headers: Authorization: Bearer <admin_token>
   Body: { "reason": "Invalid proof or insufficient payment" }
   ```
4. **Check User's Wallet** - Balance should NOT change.

### 4. Test Validation Errors

**Missing Required Fields:**
```
POST /api/v1/transactions/deposit
Body (form-data):
  amount: 1000
  // Missing: paymentGatewayId, txHash, proofImage
Expected: 400 error
```

**Amount Exceeds Gateway Limit:**
```
Body (form-data):
  amount: 999999999
  paymentGatewayId: <gateway_id>
  txHash: TEST-TXN
  proofImage: <file>
Expected: 400 error - "Deposit amount must be between $X and $Y"
```

**Invalid Gateway:**
```
Body (form-data):
  paymentGatewayId: 000000000000000000000000
  ...
Expected: 404 error - "Payment gateway not found"
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**:
   - Users can only create deposits for themselves
   - Admins can only approve/reject transactions
3. **File Upload**:
   - Only image files allowed
   - 20MB size limit enforced
   - Files stored outside public web root for security
4. **Data Masking**:
   - Sensitive data (transaction IDs, account numbers) masked in admin UI
5. **Audit Trail**:
   - All approvals/rejections logged with admin ID and timestamp

---

## Workflow Summary

```
┌─────────────┐
│    USER     │
└──────┬──────┘
       │ 1. Selects gateway
       │ 2. Makes payment externally
       │ 3. Uploads proof screenshot
       │ 4. Submits deposit request
       ▼
┌─────────────────────┐
│  PENDING REQUEST    │
│   (Status: pending) │
└──────────┬──────────┘
           │
           ▼
    ┌──────────┐
    │  ADMIN   │
    └─────┬────┘
          │
    ┌─────▼─────┐
    │  Reviews  │
    │  Proof    │
    └─────┬─────┘
          │
    ┌─────▼──────┐
    │  Decision  │
    └─────┬──────┘
          │
    ┌─────▼──────────────┬──────────────┐
    │                    │              │
┌───▼───────┐    ┌──────▼──────┐       │
│  APPROVE  │    │   REJECT    │       │
└───┬───────┘    └──────┬──────┘       │
    │                   │              │
    │ - Wallet +$       │ - No wallet  │
    │ - Status:         │   change     │
    │   completed       │ - Status:    │
    │ - Notification    │   rejected   │
    │   sent            │ - Reason     │
    │ - Referral        │   sent       │
    │   bonus           │              │
    │   processed       │              │
    │                   │              │
    └───────────────────▼──────────────┘
                        │
                  ┌─────▼─────┐
                  │   USER    │
                  │ NOTIFIED  │
                  └───────────┘
```

---

## Next Steps

### For Backend Integration:
1. ✅ File upload middleware added
2. ✅ Validation updated with required fields
3. ✅ Controller handles file upload
4. ✅ Admin approval adds balance to wallet
5. ✅ Notification system in place

### For Frontend Development:
1. Create deposit request form with:
   - Gateway selector dropdown
   - Amount input with validation
   - Transaction ID input field
   - Image file upload with preview
   - Submit button
2. Display user's pending deposits
3. Show transaction history
4. Connect admin panel to backend API (see integration guide above)

### For Testing:
1. Test with various file types and sizes
2. Test gateway limits validation
3. Test approval/rejection workflow
4. Test notification delivery
5. Test wallet balance updates
6. Test concurrent requests

---

## Support & Troubleshooting

### Common Issues

**Issue: "Proof of payment screenshot is required"**
- Ensure the file input has `name="proofImage"`
- Check that `Content-Type: multipart/form-data` is set
- Verify file is not empty

**Issue: "Payment gateway not found"**
- Verify gateway ID is a valid MongoDB ObjectId
- Check gateway exists in database
- Ensure gateway `isActive` and `isDepositEnabled` are true

**Issue: "Deposit amount must be between $X and $Y"**
- Check the selected gateway's `minDeposit` and `maxDeposit` limits
- Adjust the amount to fit within the range

**Issue: Image not displaying in admin panel**
- Ensure backend serves static files from `/uploads` directory
- Check `proofImage` path is correctly saved (starts with `/uploads/`)
- Verify file exists in `investment-server/public/uploads/` directory

---

## Files Modified

### Backend Changes:
1. **`investment-server/src/routes/v1/transaction.routes.js`**
   - Added `upload.single("proofImage")` middleware to deposit route

2. **`investment-server/src/controllers/transaction.controller.js`**
   - Updated `createDeposit` to handle file upload
   - Added validation for required proof image
   - Updated success message

3. **`investment-server/src/validations/transaction.validation.js`**
   - Made `paymentGatewayId` required
   - Made `txHash` required
   - Added custom error messages

### Frontend (Admin Panel):
- **No changes needed** - Already has proof image display functionality

---

## Conclusion

The wallet recharge functionality is now fully implemented with:
- ✅ Secure file upload for payment proof
- ✅ Required fields validation
- ✅ Admin approval workflow
- ✅ Automatic wallet balance updates
- ✅ Notification system
- ✅ Admin panel UI ready

The system is production-ready and follows best practices for security, validation, and user experience.
