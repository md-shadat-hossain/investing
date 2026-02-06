const httpStatus = require("http-status");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const { transactionService, notificationService, referralService } = require("../services");
const response = require("../config/response");
const ApiError = require("../utils/ApiError");

// User: Create deposit
const createDeposit = catchAsync(async (req, res) => {
  // Handle uploaded proof image
  const depositData = {
    ...req.body,
    proofImage: req.file ? `/uploads/transactions/${req.file.filename}` : null,
  };

  // Validate that proof image was uploaded
  if (!depositData.proofImage) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Proof of payment screenshot is required");
  }

  const transaction = await transactionService.createDeposit(req.user._id, depositData);

  // Notify admins
  await notificationService.sendToAdmins(
    "New Deposit Request",
    `User ${req.user.fullName || req.user.email} has requested a deposit of $${req.body.amount}.`,
    "transaction",
    { transactionId: transaction.transactionId }
  );

  res.status(httpStatus.CREATED).json(
    response({
      message: "Deposit request created successfully. Please wait for admin approval.",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: transaction,
    })
  );
});

// User: Create withdrawal
const createWithdrawal = catchAsync(async (req, res) => {
  const transaction = await transactionService.createWithdrawal(req.user._id, req.body);

  // Notify admins
  await notificationService.sendToAdmins(
    "New Withdrawal Request",
    `User ${req.user.fullName || req.user.email} has requested a withdrawal of $${req.body.amount}.`,
    "transaction",
    { transactionId: transaction.transactionId }
  );

  res.status(httpStatus.CREATED).json(
    response({
      message: "Withdrawal request created successfully",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: transaction,
    })
  );
});

// User: Get my transactions
const getMyTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["type", "status"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await transactionService.getTransactionsByUser(req.user._id, filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Transactions retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Get transaction by id
const getTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Transaction retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: transaction,
    })
  );
});

// Admin: Get all transactions
const getAllTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["type", "status", "user", "paymentMethod"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await transactionService.queryTransactions(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "All transactions retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Admin: Get pending transactions
const getPendingTransactions = catchAsync(async (req, res) => {
  const { type } = req.query;
  const transactions = await transactionService.getPendingTransactions(type);
  res.status(httpStatus.OK).json(
    response({
      message: "Pending transactions retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: transactions,
    })
  );
});

// Admin: Approve transaction
const approveTransaction = catchAsync(async (req, res) => {
  const { adminNote } = req.body;
  const transaction = await transactionService.approveTransaction(
    req.params.transactionId,
    req.user._id,
    adminNote
  );

  // Notify user
  const template = transaction.type === "deposit"
    ? notificationService.templates.depositApproved(transaction.amount)
    : notificationService.templates.withdrawalApproved(transaction.amount);

  await notificationService.sendToUser(
    transaction.user,
    template.title,
    template.content,
    template.type
  );

  // Process referral bonus if this is a deposit
  if (transaction.type === "deposit") {
    await referralService.processReferralOnDeposit(transaction.user, transaction.netAmount);
  }

  res.status(httpStatus.OK).json(
    response({
      message: "Transaction approved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: transaction,
    })
  );
});

// Admin: Reject transaction
const rejectTransaction = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const transaction = await transactionService.rejectTransaction(
    req.params.transactionId,
    req.user._id,
    reason
  );

  // Notify user
  const template = transaction.type === "deposit"
    ? notificationService.templates.depositRejected(transaction.amount, reason)
    : notificationService.templates.withdrawalRejected(transaction.amount, reason);

  await notificationService.sendToUser(
    transaction.user,
    template.title,
    template.content,
    template.type
  );

  res.status(httpStatus.OK).json(
    response({
      message: "Transaction rejected successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: transaction,
    })
  );
});

// Get transaction statistics
const getTransactionStats = catchAsync(async (req, res) => {
  const userId = req.query.userId || (req.user.role === "user" ? req.user._id : null);
  const stats = await transactionService.getTransactionStats(userId);
  res.status(httpStatus.OK).json(
    response({
      message: "Transaction statistics retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: stats,
    })
  );
});

module.exports = {
  createDeposit,
  createWithdrawal,
  getMyTransactions,
  getTransaction,
  getAllTransactions,
  getPendingTransactions,
  approveTransaction,
  rejectTransaction,
  getTransactionStats,
};
