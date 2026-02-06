# Daily Profit Distribution System

## Overview
The investment platform automatically distributes daily profits to users based on their active investments. Admin can control, adjust, pause, and customize profit rates for specific users, investments, or plans.

## How It Works

### Automatic Distribution
- **Frequency**: Every day at midnight (00:00)
- **Process**: Cron job runs automatically
- **Calculation**: Based on investment amount and plan's ROI
- **Delivery**: Profits added directly to user's wallet

### Profit Calculation

#### Example 1: Daily ROI Plan
```
Investment: $10,000
Plan ROI: 10% (daily)
Duration: 30 days

Daily Profit = $10,000 × 10% = $1,000/day
Total Profit over 30 days = $30,000
```

#### Example 2: Total ROI Plan
```
Investment: $10,000
Plan ROI: 10% (total)
Duration: 30 days

Total Profit = $10,000 × 10% = $1,000
Daily Profit = $1,000 / 30 = $33.33/day
```

#### Example 3: Monthly ROI Plan
```
Investment: $10,000
Plan ROI: 10% (monthly)
Duration: 60 days

Monthly Profit = $10,000 × 10% = $1,000
Daily Profit = $1,000 / 30 = $33.33/day
```

## Admin Controls

### 1. Profit Rate Adjustments

Admin can create custom profit rates for:
- **Global**: Affects all investments
- **Specific User**: All investments of a user
- **Specific Investment**: Single investment
- **Specific Plan**: All investments in a plan

#### Adjustment Types

**a) Percentage Adjustment**
```
Original Daily Rate: 10%
Adjustment: 5%
New Daily Profit = Amount × 5% (replaces original 10%)
```

**b) Fixed Amount**
```
Original: Calculated based on plan
Adjustment: $50 fixed daily
Daily Profit = $50 (regardless of amount)
```

**c) Multiplier**
```
Original Daily Profit: $100
Multiplier: 1.5
New Daily Profit = $100 × 1.5 = $150
```

### 2. Pause/Resume Investments

Admin can pause profit distribution for any investment:
- Paused investments skip daily distribution
- Can be resumed anytime
- Reason for pause is recorded
- User is notified

### 3. Manual Profit Distribution

Admin can manually add profits outside the schedule:
- One-time bonus payments
- Compensation for missed days
- Special promotions

## Database Schema

### ProfitDistribution Model
```javascript
{
  investment: ObjectId,           // Investment reference
  user: ObjectId,                 // User reference
  amount: Number,                 // Profit amount distributed
  originalRate: Number,           // Original ROI % from plan
  appliedRate: Number,            // Actual rate applied (with adjustments)
  adjustedBy: ObjectId,           // Admin who made adjustment
  adjustmentReason: String,       // Why adjusted
  distributionDate: Date,         // When distributed
  status: String,                 // completed, pending, failed
  transactionId: String,          // Transaction reference
  createdAt: Date,
  updatedAt: Date
}
```

### ProfitAdjustment Model
```javascript
{
  type: String,                   // global, user, investment, plan
  targetUser: ObjectId,           // If type = user
  targetInvestment: ObjectId,     // If type = investment
  targetPlan: ObjectId,           // If type = plan
  adjustmentType: String,         // percentage, fixed_amount, multiplier
  adjustmentValue: Number,        // The adjustment value
  startDate: Date,                // When it starts
  endDate: Date,                  // When it ends (null = forever)
  isActive: Boolean,              // Can be toggled
  priority: Number,               // Higher = applied first
  reason: String,                 // Why this adjustment
  createdBy: ObjectId,            // Admin who created
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Investment Model (Updated Fields)
```javascript
{
  // ... existing fields
  dailyProfitAmount: Number,      // Calculated daily profit
  nextProfitDate: Date,           // When next profit is due
  lastProfitDate: Date,           // Last distribution date
  totalProfitDistributions: Number, // Count of distributions
  isPaused: Boolean,              // Is profit distribution paused
  pausedBy: ObjectId,             // Admin who paused
  pausedAt: Date,                 // When paused
  pauseReason: String,            // Why paused
}
```

## API Endpoints

### User Endpoints

#### Get My Profit History
```http
GET /api/v1/profits/my-history?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Profit history retrieved successfully",
  "data": {
    "results": [
      {
        "investment": "...",
        "amount": 33.33,
        "originalRate": 10,
        "appliedRate": 10,
        "distributionDate": "2024-01-15T00:00:00.000Z",
        "status": "completed"
      }
    ],
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalResults": 50
  }
}
```

#### Get Investment Profit History
```http
GET /api/v1/profits/investment/:investmentId/history
Authorization: Bearer <token>
```

### Admin Endpoints

#### Run Manual Distribution (All Investments)
```http
POST /api/v1/profits/admin/run-distribution
Authorization: Bearer <admin_token>
```

Manually triggers profit distribution for all active investments.

**Response:**
```json
{
  "code": 200,
  "message": "Profit distribution completed",
  "data": {
    "total": 150,
    "successful": 145,
    "failed": 2,
    "skipped": 3,
    "details": [...]
  }
}
```

#### Distribute Profit for Single Investment
```http
POST /api/v1/profits/admin/investment/:investmentId/distribute
Authorization: Bearer <admin_token>
```

#### Pause Investment
```http
POST /api/v1/profits/admin/investment/:investmentId/pause
Authorization: Bearer <admin_token>

Body:
{
  "reason": "Under investigation"
}
```

#### Resume Investment
```http
POST /api/v1/profits/admin/investment/:investmentId/resume
Authorization: Bearer <admin_token>
```

#### Manual Profit Distribution
```http
POST /api/v1/profits/admin/investment/:investmentId/manual-distribution
Authorization: Bearer <admin_token>

Body:
{
  "amount": 100,
  "reason": "Bonus payment"
}
```

#### Create Profit Adjustment
```http
POST /api/v1/profits/admin/adjustments
Authorization: Bearer <admin_token>

Body:
{
  "type": "user",                    // global, user, investment, plan
  "targetUser": "user_id",           // Required for type=user
  "adjustmentType": "percentage",    // percentage, fixed_amount, multiplier
  "adjustmentValue": 15,             // 15% daily profit
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",           // null = indefinite
  "reason": "VIP user bonus",
  "priority": 10,
  "notes": "Special promotion"
}
```

**Adjustment Examples:**

1. **Boost All Investments by 50%**
```json
{
  "type": "global",
  "adjustmentType": "multiplier",
  "adjustmentValue": 1.5,
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "reason": "New Year promotion"
}
```

2. **Set Fixed Daily Profit for VIP User**
```json
{
  "type": "user",
  "targetUser": "vip_user_id",
  "adjustmentType": "fixed_amount",
  "adjustmentValue": 500,
  "startDate": "2024-01-01",
  "endDate": null,
  "reason": "VIP tier benefits"
}
```

3. **Reduce Rate for Risky Investment**
```json
{
  "type": "investment",
  "targetInvestment": "investment_id",
  "adjustmentType": "percentage",
  "adjustmentValue": 3,
  "startDate": "2024-01-15",
  "endDate": null,
  "reason": "Market conditions"
}
```

#### Get All Adjustments
```http
GET /api/v1/profits/admin/adjustments?page=1&limit=10
Authorization: Bearer <admin_token>
```

#### Update Adjustment
```http
PATCH /api/v1/profits/admin/adjustments/:adjustmentId
Authorization: Bearer <admin_token>

Body:
{
  "adjustmentValue": 20,
  "isActive": false
}
```

#### Toggle Adjustment
```http
POST /api/v1/profits/admin/adjustments/:adjustmentId/toggle
Authorization: Bearer <admin_token>
```

Activates/deactivates the adjustment.

#### Delete Adjustment
```http
DELETE /api/v1/profits/admin/adjustments/:adjustmentId
Authorization: Bearer <admin_token>
```

#### Get All Profit Distributions
```http
GET /api/v1/profits/admin/all?page=1&limit=10&status=completed
Authorization: Bearer <admin_token>
```

## Workflow Examples

### Scenario 1: User Makes Investment

**Step 1: User Creates Investment**
```
POST /api/v1/investments
{
  "planId": "plan_xyz",
  "amount": 10000
}
```

**Backend Process:**
1. Deduct $10,000 from wallet
2. Create investment record
3. Calculate daily profit:
   - If plan is 10% total over 30 days = $33.33/day
4. Set `nextProfitDate` = Tomorrow at 00:00
5. Set `dailyProfitAmount` = $33.33

**Step 2: Next Day at Midnight**
```
Cron job runs automatically:
1. Find investment with nextProfitDate <= Today
2. Check if paused → No
3. Check for admin adjustments → None
4. Calculate profit = $33.33
5. Add $33.33 to user's wallet
6. Create ProfitDistribution record
7. Update investment:
   - earnedProfit += $33.33
   - lastProfitDate = Today
   - totalProfitDistributions += 1
   - nextProfitDate = Tomorrow
8. Send notification to user
```

**Step 3: Repeat Daily**
- Continues until `earnedProfit >= expectedProfit`
- Or until `endDate` is reached
- Investment status changes to "completed"

### Scenario 2: Admin Adjusts Profit Rate

**Original Situation:**
```
User has 3 active investments:
- Investment A: $5,000 at 10% daily = $500/day
- Investment B: $10,000 at 8% daily = $800/day
- Investment C: $3,000 at 12% daily = $360/day
Total daily profit: $1,660/day
```

**Admin Creates Adjustment:**
```http
POST /api/v1/profits/admin/adjustments
{
  "type": "user",
  "targetUser": "user_id",
  "adjustmentType": "percentage",
  "adjustmentValue": 5,
  "startDate": "2024-01-15",
  "endDate": "2024-01-31",
  "reason": "Temporary rate reduction",
  "priority": 100
}
```

**Result:**
```
All user's investments now earn 5% daily (instead of original rates):
- Investment A: $5,000 at 5% = $250/day
- Investment B: $10,000 at 5% = $500/day
- Investment C: $3,000 at 5% = $150/day
Total daily profit: $900/day

Reduction: $1,660 - $900 = $760/day saved
```

**Profit Distribution Records:**
```
Each distribution shows:
- originalRate: 10%, 8%, 12% (from plans)
- appliedRate: 5% (from adjustment)
- adjustedBy: admin_id
- adjustmentReason: "Temporary rate reduction"
```

### Scenario 3: Pause Investment

**Admin Pauses Investment:**
```http
POST /api/v1/profits/admin/investment/inv123/pause
{
  "reason": "Suspicious activity detected"
}
```

**Result:**
1. Investment.isPaused = true
2. Investment.pausedBy = admin_id
3. Investment.pausedAt = Now
4. Investment.pauseReason = "Suspicious activity detected"
5. User receives notification
6. Daily cron job skips this investment

**Admin Resumes:**
```http
POST /api/v1/profits/admin/investment/inv123/resume
```

**Result:**
1. Investment.isPaused = false
2. Clears pause fields
3. User receives notification
4. Next day: profit distribution resumes

### Scenario 4: Manual Bonus Payment

**Admin Wants to Give Bonus:**
```http
POST /api/v1/profits/admin/investment/inv123/manual-distribution
{
  "amount": 1000,
  "reason": "Loyalty bonus - 1 year anniversary"
}
```

**Result:**
1. $1,000 added to user's wallet immediately
2. Investment.earnedProfit += $1,000
3. ProfitDistribution record created:
   - amount: 1000
   - originalRate: 0
   - appliedRate: calculated
   - adjustedBy: admin_id
   - adjustmentReason: "Loyalty bonus - 1 year anniversary"
4. Transaction record created
5. User notification sent

## Cron Job Schedule

### Daily Profit Distribution
- **Time**: Every day at 00:00 (midnight)
- **Function**: `profitDistributionService.distributeAllProfits()`
- **Process**:
  1. Find all active investments where `nextProfitDate <= today`
  2. For each investment:
     - Check if paused → skip
     - Check if ended → mark completed
     - Get applicable admin adjustments
     - Calculate profit (with adjustments)
     - Add to wallet
     - Create distribution record
     - Update investment
     - Send notification
  3. Log results (successful, failed, skipped)

### Manual Trigger
Admin can manually run:
```http
POST /api/v1/profits/admin/run-distribution
```

## Profit Adjustment Priority System

When multiple adjustments apply to an investment, the system uses priority:

```
Investment belongs to:
- User ID: 123
- Plan ID: 456
- Investment ID: 789

Active Adjustments:
1. Global: 5% (priority: 0)
2. Plan 456: 7% (priority: 50)
3. User 123: 10% (priority: 80)
4. Investment 789: 15% (priority: 100)

Applied: Investment 789 adjustment (highest priority: 100)
Result: 15% daily profit
```

## Notifications

Users receive notifications for:
- ✅ Daily profit received
- ✅ Investment paused by admin
- ✅ Investment resumed
- ✅ Manual bonus received
- ✅ Investment completed

## Transaction Records

Every profit distribution creates:
1. **ProfitDistribution** record (detailed tracking)
2. **Transaction** record (wallet history)
3. **Wallet** update (balance increase)

## Dashboard Statistics

### User Dashboard
- Total profits earned (all time)
- Today's profit
- This month's profit
- Profit history chart
- Active investments earning profit

### Admin Dashboard
- Total profit distributed today
- Total profit distributed this month
- Number of active investments
- Paused investments count
- Active adjustments count
- Failed distributions (if any)

## Error Handling

### Failed Distributions
If a profit distribution fails:
1. Error is logged
2. Distribution status = "failed"
3. Admin is notified (if critical)
4. Will retry next day

### Common Issues
- **Wallet insufficient balance**: Should not happen (adding funds)
- **Investment not found**: Logged and skipped
- **Calculation error**: Logged, admin notified

## Security & Audit

### Audit Trail
Every admin action is tracked:
- Who created/modified adjustments
- When investments were paused/resumed
- Manual distributions with reasons
- All profit distributions with rates applied

### Access Control
- Only admins can create adjustments
- Only admins can pause/resume investments
- Only admins can run manual distributions
- Users can only view their own profit history

## Performance Considerations

### Optimization
- Indexed database queries
- Batch processing for large numbers
- Efficient date calculations
- Caching of adjustment rules

### Scalability
- Process in batches if > 1000 investments
- Queue system for very large platforms
- Async processing with notifications

## Testing Scenarios

### Test 1: Basic Distribution
1. Create investment with 10% daily ROI
2. Wait for cron (or trigger manually)
3. Verify wallet increased
4. Check ProfitDistribution record created

### Test 2: Admin Adjustment
1. Create global 5% adjustment
2. Run distribution
3. Verify all investments got 5% (not original rates)
4. Check distribution records show adjustment

### Test 3: Pause/Resume
1. Pause investment
2. Run distribution
3. Verify no profit added
4. Resume investment
5. Run distribution
6. Verify profit added

### Test 4: Multiple Adjustments
1. Create multiple adjustments (different priorities)
2. Run distribution
3. Verify highest priority applied
4. Check distribution records

## Best Practices

### For Admins
1. **Document Adjustments**: Always provide clear reasons
2. **Test First**: Create short-term adjustments to test
3. **Monitor Impact**: Check distribution logs regularly
4. **Use Priorities**: Higher priority for more specific adjustments
5. **Pause Carefully**: Only pause when necessary, always resume

### For Developers
1. **Backup Before**: Backup database before major changes
2. **Test Cron**: Test distribution logic thoroughly
3. **Monitor Logs**: Watch for failed distributions
4. **Optimize Queries**: Index properly for performance
5. **Error Handling**: Gracefully handle all errors

## Future Enhancements

### Potential Features
- [ ] Compound interest option
- [ ] Auto-reinvestment toggle
- [ ] Tiered profit rates (more invested = higher rate)
- [ ] Weekend/holiday profit suspension
- [ ] Profit distribution history export (CSV)
- [ ] Real-time profit tracking dashboard
- [ ] SMS/Email profit notifications
- [ ] Profit withdrawal limits
- [ ] Bonus milestones (100th distribution, etc.)
- [ ] Referral profit sharing

---

## Quick Reference

### Key Formulas

**Daily Profit (Daily ROI)**
```
dailyProfit = amount × (dailyROI / 100)
```

**Daily Profit (Total ROI)**
```
dailyProfit = amount × (totalROI / 100) / duration
```

**With Percentage Adjustment**
```
adjustedProfit = amount × (adjustmentValue / 100)
```

**With Fixed Adjustment**
```
adjustedProfit = adjustmentValue
```

**With Multiplier**
```
adjustedProfit = baseProfit × multiplier
```

### Important Dates
- `startDate`: When investment begins
- `endDate`: When investment ends
- `nextProfitDate`: Next distribution date
- `lastProfitDate`: Last distribution date

### Status Values
- **Investment**: active, completed, cancelled, paused
- **Distribution**: pending, completed, failed, cancelled

---

**For support or questions, contact the development team.**
