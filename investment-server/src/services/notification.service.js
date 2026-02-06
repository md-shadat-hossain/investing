const httpStatus = require("http-status");
const { Notification } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a notification
 * @param {Object} notificationData
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationData) => {
  return Notification.create(notificationData);
};

/**
 * Send notification to user
 * @param {ObjectId} userId
 * @param {string} title
 * @param {string} content
 * @param {string} type
 * @param {Object} options
 * @returns {Promise<Notification>}
 */
const sendToUser = async (userId, title, content, type = "system", options = {}) => {
  const notification = await Notification.create({
    userId,
    title,
    content,
    type,
    role: "user",
    priority: options.priority || "medium",
    icon: options.icon || null,
    image: options.image || null,
    transactionId: options.transactionId || null,
    sendBy: options.sendBy || null,
  });

  return notification;
};

/**
 * Send notification to all admins
 * @param {string} title
 * @param {string} content
 * @param {string} type
 * @param {Object} options
 * @returns {Promise<Notification[]>}
 */
const sendToAdmins = async (title, content, type = "system", options = {}) => {
  const { User } = require("../models");
  const admins = await User.find({ role: { $in: ["admin", "superAdmin"] }, isDeleted: false });

  const notifications = await Promise.all(
    admins.map(admin =>
      Notification.create({
        userId: admin._id,
        title,
        content,
        type,
        role: admin.role,
        priority: options.priority || "medium",
        icon: options.icon || null,
        transactionId: options.transactionId || null,
        sendBy: options.sendBy || null,
      })
    )
  );

  return notifications;
};

/**
 * Get notifications for user
 * @param {ObjectId} userId
 * @param {Object} options
 * @returns {Promise<Notification[]>}
 */
const getNotificationsByUser = async (userId, options = {}) => {
  const { limit = 20, skip = 0, status } = options;

  const filter = { userId };
  if (status) filter.status = status;

  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Get unread count
 * @param {ObjectId} userId
 * @returns {Promise<number>}
 */
const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, status: "unread" });
};

/**
 * Mark notification as read
 * @param {ObjectId} notificationId
 * @param {ObjectId} userId
 * @returns {Promise<Notification>}
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });

  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }

  notification.status = "read";
  await notification.save();
  return notification;
};

/**
 * Mark all notifications as read
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, status: "unread" },
    { status: "read" }
  );
  return { modifiedCount: result.modifiedCount };
};

/**
 * Delete notification
 * @param {ObjectId} notificationId
 * @param {ObjectId} userId
 * @returns {Promise<Notification>}
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });

  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }

  await notification.deleteOne();
  return notification;
};

/**
 * Delete all notifications for user
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const deleteAllNotifications = async (userId) => {
  const result = await Notification.deleteMany({ userId });
  return { deletedCount: result.deletedCount };
};

// Notification templates for common events
const templates = {
  depositPending: (amount) => ({
    title: "Deposit Pending",
    content: `Your deposit of $${amount.toLocaleString()} is being processed.`,
    type: "transaction",
  }),
  depositApproved: (amount) => ({
    title: "Deposit Approved",
    content: `Your deposit of $${amount.toLocaleString()} has been approved and added to your wallet.`,
    type: "transaction",
  }),
  depositRejected: (amount, reason) => ({
    title: "Deposit Rejected",
    content: `Your deposit of $${amount.toLocaleString()} was rejected. Reason: ${reason}`,
    type: "transaction",
  }),
  withdrawalPending: (amount) => ({
    title: "Withdrawal Pending",
    content: `Your withdrawal request of $${amount.toLocaleString()} is being processed.`,
    type: "transaction",
  }),
  withdrawalApproved: (amount) => ({
    title: "Withdrawal Approved",
    content: `Your withdrawal of $${amount.toLocaleString()} has been processed successfully.`,
    type: "transaction",
  }),
  withdrawalRejected: (amount, reason) => ({
    title: "Withdrawal Rejected",
    content: `Your withdrawal of $${amount.toLocaleString()} was rejected. Reason: ${reason}. The amount has been refunded to your wallet.`,
    type: "transaction",
  }),
  investmentCreated: (planName, amount) => ({
    title: "Investment Started",
    content: `You have successfully invested $${amount.toLocaleString()} in ${planName}.`,
    type: "investment",
  }),
  investmentCompleted: (planName, profit) => ({
    title: "Investment Completed",
    content: `Your investment in ${planName} has completed. Total profit: $${profit.toLocaleString()}.`,
    type: "investment",
  }),
  profitReceived: (amount) => ({
    title: "Profit Received",
    content: `You have received $${amount.toLocaleString()} profit from your investment.`,
    type: "profit",
  }),
  referralBonus: (amount) => ({
    title: "Referral Bonus",
    content: `You have earned $${amount.toLocaleString()} from your referral.`,
    type: "referral",
  }),
  welcomeBonus: (amount) => ({
    title: "Welcome Bonus",
    content: `Welcome! You have received a $${amount.toLocaleString()} welcome bonus.`,
    type: "bonus",
  }),
  kycApproved: () => ({
    title: "KYC Verified",
    content: "Your identity verification has been approved. You now have full access to all features.",
    type: "security",
  }),
  kycRejected: (reason) => ({
    title: "KYC Rejected",
    content: `Your identity verification was rejected. Reason: ${reason}. Please resubmit your documents.`,
    type: "security",
  }),
};

module.exports = {
  createNotification,
  sendToUser,
  sendToAdmins,
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  templates,
};
