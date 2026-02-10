const httpStatus = require("http-status");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const { User, Wallet, Transaction, Investment, Referral, SupportTicket } = require("../models");
const { walletService, notificationService } = require("../services");
const response = require("../config/response");
const ApiError = require("../utils/ApiError");

// Get dashboard statistics
const getDashboardStats = catchAsync(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalDeposits,
    totalWithdrawals,
    pendingDeposits,
    pendingWithdrawals,
    totalInvestments,
    activeInvestments,
    openTickets,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false, role: "user" }),
    User.countDocuments({ isDeleted: false, role: "user", isEmailVerified: true }),
    Transaction.aggregate([
      { $match: { type: "deposit", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { type: "withdraw", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.countDocuments({ type: "deposit", status: "pending" }),
    Transaction.countDocuments({ type: "withdraw", status: "pending" }),
    Investment.countDocuments(),
    Investment.countDocuments({ status: "active" }),
    SupportTicket.countDocuments({ status: { $in: ["open", "in_progress", "waiting_reply"] } }),
  ]);

  const stats = {
    users: {
      total: totalUsers,
      active: activeUsers,
    },
    transactions: {
      totalDeposits: totalDeposits[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      pendingDeposits,
      pendingWithdrawals,
    },
    investments: {
      total: totalInvestments,
      active: activeInvestments,
    },
    support: {
      openTickets,
    },
  };

  res.status(httpStatus.OK).json(
    response({
      message: "Dashboard statistics retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: stats,
    })
  );
});

// Get all users
const getAllUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["role", "isEmailVerified", "isBlocked", "kycStatus"]);
  filter.isDeleted = false;

  const options = pick(req.query, ["sortBy", "limit", "page"]);
  options.select = "-password";

  const users = await User.paginate(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Users retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: users,
    })
  );
});

// Get user by ID with full details
const getUserDetails = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId).select("-password");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const wallet = await walletService.getWalletByUserId(user._id);
  const transactions = await Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);
  const investments = await Investment.find({ user: user._id }).populate("plan");
  const referrals = await Referral.find({ referrer: user._id }).populate("referred", "fullName email");

  res.status(httpStatus.OK).json(
    response({
      message: "User details retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {
        user,
        wallet,
        recentTransactions: transactions,
        investments,
        referrals,
      },
    })
  );
});

// Block/Unblock user
const toggleUserBlock = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.isBlocked = !user.isBlocked;
  user.blockReason = user.isBlocked ? reason : null;
  await user.save();

  // Notify user
  await notificationService.sendToUser(
    user._id,
    user.isBlocked ? "Account Blocked" : "Account Unblocked",
    user.isBlocked
      ? `Your account has been blocked. Reason: ${reason}`
      : "Your account has been unblocked. You can now access all features.",
    "security"
  );

  res.status(httpStatus.OK).json(
    response({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

// Update user KYC status
const updateKycStatus = catchAsync(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.kycStatus = status;
  if (status === "rejected") {
    user.kycRejectionReason = rejectionReason;
  } else {
    user.kycRejectionReason = null;
  }

  if (status === "verified") {
    user.isNIDVerified = true;
  }

  await user.save();

  // Notify user
  if (status === "verified") {
    await notificationService.sendToUser(
      user._id,
      notificationService.templates.kycApproved().title,
      notificationService.templates.kycApproved().content,
      "security"
    );
  } else if (status === "rejected") {
    await notificationService.sendToUser(
      user._id,
      notificationService.templates.kycRejected(rejectionReason).title,
      notificationService.templates.kycRejected(rejectionReason).content,
      "security"
    );
  }

  res.status(httpStatus.OK).json(
    response({
      message: "KYC status updated successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

// Add balance to user (manual adjustment)
const addUserBalance = catchAsync(async (req, res) => {
  const { amount, reason } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  await walletService.updateBalance(user._id, amount, "add");

  // Create transaction record
  const { transactionService } = require("../services");
  await transactionService.createInternalTransaction(user._id, {
    type: "bonus",
    amount,
    description: reason || "Admin balance adjustment",
  });

  // Notify user
  await notificationService.sendToUser(
    user._id,
    "Balance Added",
    `$${amount.toLocaleString()} has been added to your wallet. ${reason || ""}`,
    "transaction"
  );

  const wallet = await walletService.getWalletByUserId(user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "Balance added successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: wallet,
    })
  );
});

// Deduct balance from user
const deductUserBalance = catchAsync(async (req, res) => {
  const { amount, reason } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  await walletService.updateBalance(user._id, amount, "subtract");

  // Notify user
  await notificationService.sendToUser(
    user._id,
    "Balance Deducted",
    `$${amount.toLocaleString()} has been deducted from your wallet. Reason: ${reason || "Admin adjustment"}`,
    "transaction"
  );

  const wallet = await walletService.getWalletByUserId(user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "Balance deducted successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: wallet,
    })
  );
});

// Delete user (soft delete)
const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.isDeleted = true;
  await user.save();

  res.status(httpStatus.OK).json(
    response({
      message: "User deleted successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

// Get recent activities
const getRecentActivities = catchAsync(async (req, res) => {
  const { limit = 20 } = req.query;

  const [recentTransactions, recentUsers, recentTickets] = await Promise.all([
    Transaction.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit)),
    User.find({ isDeleted: false })
      .select("fullName email createdAt")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit)),
    SupportTicket.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit)),
  ]);

  res.status(httpStatus.OK).json(
    response({
      message: "Recent activities retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {
        recentTransactions,
        recentUsers,
        recentTickets,
      },
    })
  );
});

// Update user profile (admin)
const updateUserProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const { firstName, lastName, email, phoneNumber, callingCode, address } = req.body;

  // Check email uniqueness if email is being changed
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email is already taken");
    }
    user.email = email;
  }

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (callingCode !== undefined) user.callingCode = callingCode;
  if (address !== undefined) user.address = address;

  await user.save();

  // Notify user
  await notificationService.sendToUser(
    user._id,
    "Profile Updated",
    "Your profile has been updated by an administrator.",
    "security"
  );

  res.status(httpStatus.OK).json(
    response({
      message: "User profile updated successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

// Reset user password (admin)
const resetUserPassword = catchAsync(async (req, res) => {
  const { newPassword } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.password = newPassword;
  await user.save();

  // Notify user
  await notificationService.sendToUser(
    user._id,
    "Password Reset",
    "Your password has been reset by an administrator. Please contact support if you did not request this change.",
    "security"
  );

  res.status(httpStatus.OK).json(
    response({
      message: "User password reset successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  toggleUserBlock,
  updateKycStatus,
  addUserBalance,
  deductUserBalance,
  deleteUser,
  getRecentActivities,
  updateUserProfile,
  resetUserPassword,
};
