const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { notificationService } = require("../services");
const response = require("../config/response");

// Get my notifications
const getMyNotifications = catchAsync(async (req, res) => {
  const { limit, skip, status } = req.query;
  const notifications = await notificationService.getNotificationsByUser(req.user._id, {
    limit: parseInt(limit) || 20,
    skip: parseInt(skip) || 0,
    status,
  });
  res.status(httpStatus.OK).json(
    response({
      message: "Notifications retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: notifications,
    })
  );
});

// Get unread count
const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "Unread count retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { count },
    })
  );
});

// Mark notification as read
const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.notificationId,
    req.user._id
  );
  res.status(httpStatus.OK).json(
    response({
      message: "Notification marked as read",
      status: "OK",
      statusCode: httpStatus.OK,
      data: notification,
    })
  );
});

// Mark all as read
const markAllAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "All notifications marked as read",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Delete notification
const deleteNotification = catchAsync(async (req, res) => {
  await notificationService.deleteNotification(req.params.notificationId, req.user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "Notification deleted successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

// Delete all notifications
const deleteAllNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.deleteAllNotifications(req.user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "All notifications deleted successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Admin: Send notification to user
const sendToUser = catchAsync(async (req, res) => {
  const { userId, title, content, type, priority } = req.body;
  const notification = await notificationService.sendToUser(
    userId,
    title,
    content,
    type,
    { priority, sendBy: req.user._id }
  );
  res.status(httpStatus.CREATED).json(
    response({
      message: "Notification sent successfully",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: notification,
    })
  );
});

// Admin: Send notification to all users
const sendToAllUsers = catchAsync(async (req, res) => {
  const { title, content, type, priority } = req.body;
  const { User } = require("../models");
  const users = await User.find({ isDeleted: false, role: "user" });

  const notifications = await Promise.all(
    users.map(user =>
      notificationService.sendToUser(
        user._id,
        title,
        content,
        type,
        { priority, sendBy: req.user._id }
      )
    )
  );

  res.status(httpStatus.CREATED).json(
    response({
      message: "Notifications sent successfully",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: { count: notifications.length },
    })
  );
});

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendToUser,
  sendToAllUsers,
};
