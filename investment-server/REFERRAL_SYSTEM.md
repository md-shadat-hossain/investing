# Multi-Level Referral System (7 Levels)

## Overview
This investment platform implements a 7-level multi-level marketing (MLM) referral commission system. When users refer others, they earn commissions not only from their direct referrals but also from up to 7 levels deep in their network.

## Commission Structure

| Level | Commission Rate | Description |
|-------|----------------|-------------|
| Level 1 | 8% | Direct referrals |
| Level 2 | 4% | Referrals of your referrals |
| Level 3 | 3% | Third level down |
| Level 4 | 2% | Fourth level down |
| Level 5 | 1% | Fifth level down |
| Level 6 | 1% | Sixth level down |
| Level 7 | 1% | Seventh level down |

**Total Maximum Commission: 20%** (8+4+3+2+1+1+1)

## How It Works

### 1. User Registration with Referral Code
When a new user registers using a referral code:
- The system creates referral relationships for all 7 levels up the chain
- Each level gets their respective commission rate assigned
- All referrals start with "pending" status

**Example:**
```
User A refers User B (Level 1 for A)
User B refers User C (Level 1 for B, Level 2 for A)
User C refers User D (Level 1 for C, Level 2 for B, Level 3 for A)
... and so on up to 7 levels
```

### 2. Commission Payment on Deposits
When a user makes a deposit:
- All 7 levels of referrers receive their commission
- Commissions are calculated based on the deposit amount
- Funds are added to referrer wallets immediately
- Transaction records are created for tracking

**Example Calculation:**
If User D deposits $1000:
- User C (Level 1) receives: $1000 × 8% = $80
- User B (Level 2) receives: $1000 × 4% = $40
- User A (Level 3) receives: $1000 × 3% = $30
- And so on up the chain...

### 3. First Deposit Bonus
- On the first deposit, referral status changes from "pending" to "active"
- First deposit amount and date are recorded
- Commissions are paid on all subsequent deposits as well

## API Endpoints

### Public Endpoints

#### Validate Referral Code
```
GET /api/v1/referrals/validate/:code
```
Validates if a referral code exists and is valid.

**Response:**
```json
{
  "code": 200,
  "message": "Valid referral code",
  "data": {
    "valid": true,
    "referrerName": "John Doe"
  }
}
```

#### Get Commission Rates
```
GET /api/v1/referrals/commission-rates
```
Returns the commission structure for all 7 levels.

**Response:**
```json
{
  "code": 200,
  "message": "Commission rates retrieved successfully",
  "data": [
    { "level": 1, "commissionRate": 8, "description": "Level 1 - 8%" },
    { "level": 2, "commissionRate": 4, "description": "Level 2 - 4%" },
    ...
  ]
}
```

### User Endpoints (Authenticated)

#### Get My Referrals
```
GET /api/v1/referrals/my
```
Returns paginated list of all your referrals (all levels).

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `sortBy` - Sort field

#### Get Referral Statistics
```
GET /api/v1/referrals/stats
```
Returns comprehensive statistics including level breakdown.

**Response:**
```json
{
  "code": 200,
  "message": "Referral statistics retrieved successfully",
  "data": {
    "referralCode": "john123abc",
    "referralLink": "https://wealthflow.com/register?ref=john123abc",
    "totalReferrals": 50,
    "activeReferrals": 45,
    "pendingReferrals": 5,
    "totalEarnings": 5000,
    "levelBreakdown": {
      "level1": {
        "count": 10,
        "active": 9,
        "pending": 1,
        "earnings": 2000,
        "commissionRate": 8
      },
      "level2": {
        "count": 15,
        "active": 14,
        "pending": 1,
        "earnings": 1500,
        "commissionRate": 4
      },
      ...
    }
  }
}
```

#### Get Team Network Structure
```
GET /api/v1/referrals/team-network
```
Returns hierarchical tree structure of your entire network.

**Response:**
```json
{
  "code": 200,
  "message": "Team network retrieved successfully",
  "data": {
    "networkTree": [
      {
        "id": "user123",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "level": 1,
        "status": "active",
        "earnings": 500,
        "children": [
          {
            "id": "user456",
            "name": "Bob Johnson",
            "level": 2,
            "children": [...]
          }
        ]
      }
    ],
    "teamStats": {
      "totalMembers": 50,
      "activeMembers": 45,
      "totalTeamEarnings": 5000,
      "levelCounts": {
        "level1": 10,
        "level2": 15,
        ...
      }
    }
  }
}
```

#### Get Commission Breakdown
```
GET /api/v1/referrals/commission-breakdown
```
Returns earnings breakdown by each level.

**Response:**
```json
{
  "code": 200,
  "message": "Commission breakdown retrieved successfully",
  "data": [
    {
      "level": 1,
      "commissionRate": 8,
      "totalMembers": 10,
      "activeMembers": 9,
      "totalEarnings": 2000
    },
    {
      "level": 2,
      "commissionRate": 4,
      "totalMembers": 15,
      "activeMembers": 14,
      "totalEarnings": 1500
    },
    ...
  ]
}
```

### Admin Endpoints

#### Get All Referrals
```
GET /api/v1/referrals/admin/all
```
Returns all referrals in the system with filters.

## Database Schema

### Referral Model
```javascript
{
  referrer: ObjectId,           // User who referred
  referred: ObjectId,           // User who was referred
  referralCode: String,         // Code used
  level: Number,                // 1-7
  commissionRate: Number,       // Percentage (1-8)
  totalEarnings: Number,        // Total earned from this referral
  status: String,               // "pending" | "active" | "inactive"
  firstDepositAmount: Number,   // Amount of first deposit
  firstDepositDate: Date,       // Date of first deposit
  createdAt: Date,
  updatedAt: Date
}
```

### User Model (Referral Fields)
```javascript
{
  referralCode: String,         // Unique code for this user
  referredBy: ObjectId,         // Direct referrer (Level 1)
  ...
}
```

## Technical Implementation

### Creating Referral Relationships
When a new user registers with a referral code:
1. Find the direct referrer (Level 1)
2. Create Level 1 referral record with 8% commission
3. Traverse up the chain to find Level 2-7 referrers
4. Create referral records for each level with respective commission rates
5. Stop at 7 levels or when no more upline exists

### Processing Commissions on Deposit
When a user makes a deposit:
1. Find all referral records where the user is the "referred"
2. For each referral (7 levels max):
   - Calculate commission: `depositAmount × commissionRate / 100`
   - Add commission to referrer's wallet
   - Create transaction record
   - Update referral earnings
   - If first deposit, update status to "active"

### Performance Considerations
- Indexed database queries on `referrer` and `referred` fields
- Efficient upline traversal with early termination at 7 levels
- Cached commission rates to avoid repeated calculations
- Batch processing for multiple level updates

## Security Features
- Unique referral codes per user
- Validation of referral code existence before registration
- Prevention of duplicate referral relationships
- Secure commission calculations
- Transaction audit trail

## Business Logic
- Commissions paid on every deposit (not just first)
- No minimum deposit requirement for commission eligibility
- Status changes to "active" after first deposit
- Inactive users don't affect upline commissions
- Deleted accounts don't break the referral chain

## Testing Scenarios

### Test Case 1: New User Registration
1. User A registers (generates referral code)
2. User B registers with A's code
3. Verify Level 1 referral created for A → B
4. User C registers with B's code
5. Verify Level 1 referral for B → C
6. Verify Level 2 referral for A → C

### Test Case 2: Deposit Commission Distribution
1. User at Level 7 makes $1000 deposit
2. Verify Level 1 receives $80 (8%)
3. Verify Level 2 receives $40 (4%)
4. Verify Level 3 receives $30 (3%)
5. Verify Level 4 receives $20 (2%)
6. Verify Level 5 receives $10 (1%)
7. Verify Level 6 receives $10 (1%)
8. Verify Level 7 receives $10 (1%)
9. Verify total commission: $200 (20%)

### Test Case 3: Network Structure
1. Create 7-level deep referral chain
2. Call `/team-network` endpoint
3. Verify hierarchical tree structure
4. Verify level counts in statistics

## Frontend Integration

### Display Referral Link
```javascript
// Get user's referral info
const response = await fetch('/api/v1/referrals/stats');
const { referralCode, referralLink } = response.data;

// Display shareable link
console.log(`Share: ${referralLink}`);
```

### Show Network Tree
```javascript
// Fetch team network
const response = await fetch('/api/v1/referrals/team-network');
const { networkTree, teamStats } = response.data;

// Render tree component
<NetworkTree data={networkTree} />
<TeamStats stats={teamStats} />
```

### Display Commission Breakdown
```javascript
// Get earnings by level
const response = await fetch('/api/v1/referrals/commission-breakdown');
const breakdown = response.data;

// Show as table or chart
breakdown.forEach(level => {
  console.log(`Level ${level.level}: $${level.totalEarnings}`);
});
```

## Configuration

Commission rates are defined in:
```
/src/services/referral.service.js
```

To modify commission rates, update the `COMMISSION_RATES` object:
```javascript
const COMMISSION_RATES = {
  1: 8,  // Level 1 - 8%
  2: 4,  // Level 2 - 4%
  3: 3,  // Level 3 - 3%
  4: 2,  // Level 4 - 2%
  5: 1,  // Level 5 - 1%
  6: 1,  // Level 6 - 1%
  7: 1,  // Level 7 - 1%
};
```

## Monitoring & Analytics

### Admin Dashboard Metrics
- Total referrals in system
- Active vs pending referrals
- Total commissions paid
- Top referrers by earnings
- Network depth distribution
- Conversion rates by level

### User Dashboard Metrics
- Personal referral count by level
- Total earnings
- Earnings breakdown by level
- Network growth over time
- Active vs inactive referrals

## Support & Troubleshooting

### Common Issues

**Issue:** Referral not created on registration
- **Solution:** Verify referral code exists and is valid
- Check user's `referredBy` field is set correctly

**Issue:** Commission not paid on deposit
- **Solution:** Check referral status is not "inactive"
- Verify transaction was approved by admin
- Check wallet service logs

**Issue:** Missing levels in network
- **Solution:** Verify upline chain is not broken
- Check for deleted or blocked accounts in chain

## Future Enhancements
- [ ] Real-time commission notifications
- [ ] Referral leaderboard
- [ ] Bonus tiers for high performers
- [ ] Team volume bonuses
- [ ] Rank/title system
- [ ] Spillover mechanisms
- [ ] Binary or matrix structures
- [ ] Commission caps/limits
- [ ] Auto-reinvestment options
