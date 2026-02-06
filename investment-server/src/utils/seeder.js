const mongoose = require("mongoose");
require("dotenv").config();
const {
  User,
  InvestmentPlan,
  PaymentGateway,
  Settings,
  Wallet,
} = require("../models");

const usersData = [
  {
    fullName: "Super Admin",
    firstName: "Super",
    lastName: "Admin",
    email: "admin@wealthflow.com",
    phoneNumber: "01735566789",
    password: "$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO", // password: 1qazxsw2
    role: "superAdmin",
    isEmailVerified: true,
    isProfileCompleted: true,
  },
  {
    fullName: "Admin User",
    firstName: "Admin",
    lastName: "User",
    email: "admin@gmail.com",
    phoneNumber: "01735566790",
    password: "$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO",
    role: "admin",
    isEmailVerified: true,
    isProfileCompleted: true,
  },
  {
    fullName: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "user@gmail.com",
    phoneNumber: "01734456873",
    password: "$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO",
    role: "user",
    isEmailVerified: true,
    isProfileCompleted: true,
  },
];

const plansData = [
  {
    name: "Starter Plan",
    description:
      "Perfect for beginners looking to start their investment journey",
    minDeposit: 100,
    maxDeposit: 999,
    roi: 2.5,
    roiType: "daily",
    duration: 7,
    durationType: "days",
    referralBonus: 5,
    isPopular: false,
    isActive: true,
    features: ["Daily returns", "24/7 Support", "Instant withdrawals"],
  },
  {
    name: "Silver Plan",
    description: "Ideal for intermediate investors seeking better returns",
    minDeposit: 1000,
    maxDeposit: 4999,
    roi: 3.5,
    roiType: "daily",
    duration: 14,
    durationType: "days",
    referralBonus: 5,
    isPopular: true,
    isActive: true,
    features: [
      "Higher ROI",
      "Priority support",
      "Weekly bonuses",
      "VIP access",
    ],
  },
  {
    name: "Gold Plan",
    description: "For serious investors looking for maximum returns",
    minDeposit: 5000,
    maxDeposit: 19999,
    roi: 5,
    roiType: "daily",
    duration: 21,
    durationType: "days",
    referralBonus: 7,
    isPopular: false,
    isActive: true,
    features: [
      "Maximum ROI",
      "Dedicated manager",
      "Daily payouts",
      "Exclusive events",
    ],
  },
  {
    name: "Platinum Plan",
    description: "Elite plan for high-net-worth investors",
    minDeposit: 20000,
    maxDeposit: 100000,
    roi: 7,
    roiType: "daily",
    duration: 30,
    durationType: "days",
    referralBonus: 10,
    isPopular: false,
    isActive: true,
    features: [
      "Premium ROI",
      "Personal account manager",
      "Compound interest",
      "Private consultations",
    ],
  },
];

const gatewaysData = [
  {
    name: "Bitcoin",
    type: "crypto",
    currency: "BTC",
    symbol: "₿",
    walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    minDeposit: 50,
    maxDeposit: 100000,
    minWithdraw: 50,
    maxWithdraw: 50000,
    depositFee: 0,
    withdrawFee: 1,
    withdrawFeeType: "percentage",
    processingTime: "10-60 minutes",
    instructions:
      "Send BTC to the wallet address above. Transaction will be confirmed after 2 network confirmations.",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Ethereum",
    type: "crypto",
    currency: "ETH",
    symbol: "Ξ",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD73",
    minDeposit: 50,
    maxDeposit: 100000,
    minWithdraw: 50,
    maxWithdraw: 50000,
    depositFee: 0,
    withdrawFee: 1,
    withdrawFeeType: "percentage",
    processingTime: "5-30 minutes",
    instructions:
      "Send ETH to the wallet address above. Make sure to use the Ethereum mainnet.",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "USDT (TRC20)",
    type: "crypto",
    currency: "USDT",
    symbol: "₮",
    walletAddress: "TJYsXvW3FZv7v4TbQi6v3D1y8TqQZfR2K9",
    minDeposit: 10,
    maxDeposit: 100000,
    minWithdraw: 10,
    maxWithdraw: 50000,
    depositFee: 0,
    withdrawFee: 1,
    withdrawFeeType: "fixed",
    processingTime: "1-10 minutes",
    instructions:
      "Send USDT using TRC20 network only. Other networks will not be credited.",
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Bank Transfer",
    type: "bank",
    currency: "USD",
    symbol: "$",
    bankDetails: {
      bankName: "Example Bank",
      accountNumber: "1234567890",
      accountName: "WealthFlow Investment Ltd",
      routingNumber: "021000021",
      swiftCode: "EXBKUS33",
    },
    minDeposit: 100,
    maxDeposit: 50000,
    minWithdraw: 100,
    maxWithdraw: 25000,
    depositFee: 0,
    withdrawFee: 25,
    withdrawFeeType: "fixed",
    processingTime: "1-3 business days",
    instructions:
      "Use the reference code provided in your transaction details when making the transfer.",
    isActive: true,
    sortOrder: 4,
  },
];

const settingsData = [
  {
    key: "referral_commission_rate",
    value: 5,
    category: "referral",
    description: "Default referral commission percentage",
  },
  {
    key: "min_withdrawal",
    value: 10,
    category: "payment",
    description: "Minimum withdrawal amount",
  },
  {
    key: "max_withdrawal",
    value: 50000,
    category: "payment",
    description: "Maximum withdrawal amount",
  },
  {
    key: "min_deposit",
    value: 10,
    category: "payment",
    description: "Minimum deposit amount",
  },
  {
    key: "welcome_bonus",
    value: 0,
    category: "general",
    description: "Welcome bonus for new users",
  },
  {
    key: "support_email",
    value: "support@wealthflow.com",
    category: "general",
    description: "Support email address",
  },
  {
    key: "site_name",
    value: "WealthFlow Premier",
    category: "general",
    description: "Website name",
  },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

const dropDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log("Database dropped successfully!");
  } catch (err) {
    console.error("Error dropping database:", err);
  }
};

const seedUsers = async () => {
  try {
    await User.deleteMany();
    const users = await User.insertMany(usersData);
    console.log("Users seeded successfully!");

    // Create wallets for users
    for (const user of users) {
      if (user.role === "user") {
        await Wallet.create({
          user: user._id,
          balance: 10000, // Demo balance
          totalDeposit: 10000,
        });
      }
    }
    console.log("User wallets created!");
  } catch (err) {
    console.error("Error seeding users:", err);
  }
};

const seedPlans = async () => {
  try {
    await InvestmentPlan.deleteMany();
    await InvestmentPlan.insertMany(plansData);
    console.log("Investment plans seeded successfully!");
  } catch (err) {
    console.error("Error seeding plans:", err);
  }
};

const seedGateways = async () => {
  try {
    await PaymentGateway.deleteMany();
    await PaymentGateway.insertMany(gatewaysData);
    console.log("Payment gateways seeded successfully!");
  } catch (err) {
    console.error("Error seeding gateways:", err);
  }
};

const seedSettings = async () => {
  try {
    await Settings.deleteMany();
    await Settings.insertMany(settingsData);
    console.log("Settings seeded successfully!");
  } catch (err) {
    console.error("Error seeding settings:", err);
  }
};

const seedDatabase = async () => {
  await connectDB();
  await dropDatabase();
  await seedUsers();
  await seedPlans();
  await seedGateways();
  await seedSettings();
  console.log("\n========================================");
  console.log("Database seeding completed!");
  console.log("========================================");
  console.log("\nTest Accounts:");
  console.log("- Super Admin: admin@wealthflow.com / 1qazxsw2");
  console.log("- Admin: admin@gmail.com / 1qazxsw2");
  console.log("- User: user@gmail.com / 1qazxsw2 (with $10,000 balance)");
  console.log("========================================\n");
  mongoose.disconnect();
};

seedDatabase();
