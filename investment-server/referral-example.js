/**
 * MULTI-LEVEL REFERRAL SYSTEM - EXAMPLE SCENARIO
 *
 * This file demonstrates how the 7-level referral system works
 */

// ============================================
// SCENARIO: 7-LEVEL REFERRAL CHAIN
// ============================================

/**
 * User Structure:
 *
 * User A (Level 1 for all below)
 *   └── User B (Level 2 for C-G, Level 1 for A)
 *       └── User C (Level 3 for D-G, Level 2 for B, Level 1 for C)
 *           └── User D (Level 4 for E-G, Level 3 for C, Level 2 for B, Level 1 for D)
 *               └── User E (Level 5 for F-G, Level 4 for D, Level 3 for C, Level 2 for B, Level 1 for E)
 *                   └── User F (Level 6 for G, Level 5 for E, Level 4 for D, Level 3 for C, Level 2 for B, Level 1 for F)
 *                       └── User G (Level 7 for all above)
 */

// ============================================
// REGISTRATION FLOW
// ============================================

/**
 * 1. User A registers (no referral code)
 *    - Generates referral code: "userA123"
 *
 * 2. User B registers with User A's code
 *    - Referral records created:
 *      - A → B (Level 1, 8% commission)
 *
 * 3. User C registers with User B's code
 *    - Referral records created:
 *      - B → C (Level 1, 8% commission)
 *      - A → C (Level 2, 4% commission)
 *
 * 4. User D registers with User C's code
 *    - Referral records created:
 *      - C → D (Level 1, 8% commission)
 *      - B → D (Level 2, 4% commission)
 *      - A → D (Level 3, 3% commission)
 *
 * 5. User E registers with User D's code
 *    - Referral records created:
 *      - D → E (Level 1, 8% commission)
 *      - C → E (Level 2, 4% commission)
 *      - B → E (Level 3, 3% commission)
 *      - A → E (Level 4, 2% commission)
 *
 * 6. User F registers with User E's code
 *    - Referral records created:
 *      - E → F (Level 1, 8% commission)
 *      - D → F (Level 2, 4% commission)
 *      - C → F (Level 3, 3% commission)
 *      - B → F (Level 4, 2% commission)
 *      - A → F (Level 5, 1% commission)
 *
 * 7. User G registers with User F's code
 *    - Referral records created:
 *      - F → G (Level 1, 8% commission)
 *      - E → G (Level 2, 4% commission)
 *      - D → G (Level 3, 3% commission)
 *      - C → G (Level 4, 2% commission)
 *      - B → G (Level 5, 1% commission)
 *      - A → G (Level 6, 1% commission)
 */

// ============================================
// DEPOSIT & COMMISSION CALCULATION
// ============================================

/**
 * When User G deposits $1,000:
 */

const depositAmount = 1000;

const commissions = {
  "User F (Level 1)": depositAmount * 0.08,  // $80
  "User E (Level 2)": depositAmount * 0.04,  // $40
  "User D (Level 3)": depositAmount * 0.03,  // $30
  "User C (Level 4)": depositAmount * 0.02,  // $20
  "User B (Level 5)": depositAmount * 0.01,  // $10
  "User A (Level 6)": depositAmount * 0.01,  // $10
};

console.log("\n=== COMMISSION DISTRIBUTION ===");
console.log(`User G Deposit: $${depositAmount}`);
console.log("\nCommissions Paid:");
Object.entries(commissions).forEach(([user, amount]) => {
  console.log(`  ${user}: $${amount}`);
});

const totalCommission = Object.values(commissions).reduce((a, b) => a + b, 0);
console.log(`\nTotal Commission Paid: $${totalCommission}`);
console.log(`User G Net Deposit: $${depositAmount - totalCommission}`);

// ============================================
// EXAMPLE API CALLS
// ============================================

/**
 * Frontend Integration Examples:
 */

// 1. Register with Referral Code
const registerExample = {
  method: "POST",
  url: "/api/v1/auth/register",
  body: {
    email: "userg@example.com",
    password: "Password123",
    fullName: "User G",
    referralCode: "userF123"  // User F's code
  }
};

// 2. Get Your Referral Stats
const getStatsExample = {
  method: "GET",
  url: "/api/v1/referrals/stats",
  headers: {
    Authorization: "Bearer <token>"
  },
  response: {
    referralCode: "userA123",
    totalReferrals: 6,
    totalEarnings: 190,
    levelBreakdown: {
      level1: { count: 1, earnings: 80 },   // User B
      level2: { count: 1, earnings: 40 },   // User C
      level3: { count: 1, earnings: 30 },   // User D
      level4: { count: 1, earnings: 20 },   // User E
      level5: { count: 1, earnings: 10 },   // User F
      level6: { count: 1, earnings: 10 },   // User G
    }
  }
};

// 3. Get Team Network Tree
const getNetworkExample = {
  method: "GET",
  url: "/api/v1/referrals/team-network",
  headers: {
    Authorization: "Bearer <token>"
  },
  response: {
    networkTree: [
      {
        name: "User B",
        level: 1,
        earnings: 80,
        children: [
          {
            name: "User C",
            level: 2,
            earnings: 40,
            children: [
              // ... nested structure continues
            ]
          }
        ]
      }
    ],
    teamStats: {
      totalMembers: 6,
      activeMembers: 6,
      totalTeamEarnings: 190
    }
  }
};

// 4. Get Commission Breakdown
const getBreakdownExample = {
  method: "GET",
  url: "/api/v1/referrals/commission-breakdown",
  headers: {
    Authorization: "Bearer <token>"
  },
  response: [
    { level: 1, commissionRate: 8, totalMembers: 1, totalEarnings: 80 },
    { level: 2, commissionRate: 4, totalMembers: 1, totalEarnings: 40 },
    { level: 3, commissionRate: 3, totalMembers: 1, totalEarnings: 30 },
    { level: 4, commissionRate: 2, totalMembers: 1, totalEarnings: 20 },
    { level: 5, commissionRate: 1, totalMembers: 1, totalEarnings: 10 },
    { level: 6, commissionRate: 1, totalMembers: 1, totalEarnings: 10 },
    { level: 7, commissionRate: 1, totalMembers: 0, totalEarnings: 0 },
  ]
};

// ============================================
// TESTING CHECKLIST
// ============================================

/**
 * Manual Testing Steps:
 *
 * 1. ✓ Register 7 users in a chain using referral codes
 * 2. ✓ Verify referral records created for all levels
 * 3. ✓ Make a deposit from the bottom user (User G)
 * 4. ✓ Verify commissions credited to all 6 upline users
 * 5. ✓ Check wallet balances updated correctly
 * 6. ✓ Verify transaction records created
 * 7. ✓ Test /stats endpoint shows correct breakdown
 * 8. ✓ Test /team-network shows hierarchical structure
 * 9. ✓ Test /commission-breakdown shows earnings by level
 * 10. ✓ Make another deposit, verify commissions paid again
 */

// ============================================
// DATABASE QUERIES FOR VERIFICATION
// ============================================

/**
 * MongoDB Queries to Verify Implementation:
 */

// Find all referrals for a specific user
// db.referrals.find({ referred: ObjectId("userId") }).sort({ level: 1 })

// Count referrals by level
// db.referrals.aggregate([
//   { $group: { _id: "$level", count: { $sum: 1 } } },
//   { $sort: { _id: 1 } }
// ])

// Get total earnings by level for a user
// db.referrals.aggregate([
//   { $match: { referrer: ObjectId("userId") } },
//   { $group: { _id: "$level", totalEarnings: { $sum: "$totalEarnings" } } },
//   { $sort: { _id: 1 } }
// ])

// Find all transactions for referral commissions
// db.transactions.find({ type: "referral" }).sort({ createdAt: -1 })

console.log("\n=== See REFERRAL_SYSTEM.md for full documentation ===\n");

module.exports = {
  depositAmount,
  commissions,
  totalCommission,
};
