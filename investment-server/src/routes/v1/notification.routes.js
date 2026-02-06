const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { notificationValidation } = require("../../validations");
const { notificationController } = require("../../controllers");

const router = express.Router();

// User routes
router.get("/", auth("common"), validate(notificationValidation.getMyNotifications), notificationController.getMyNotifications);
router.get("/unread-count", auth("common"), notificationController.getUnreadCount);
router.post("/mark-all-read", auth("common"), notificationController.markAllAsRead);
router.post("/:notificationId/read", auth("common"), validate(notificationValidation.markAsRead), notificationController.markAsRead);
router.delete("/:notificationId", auth("common"), validate(notificationValidation.deleteNotification), notificationController.deleteNotification);
router.delete("/", auth("common"), notificationController.deleteAllNotifications);

// Admin routes
router.post("/admin/send", auth("commonAdmin"), validate(notificationValidation.sendToUser), notificationController.sendToUser);
router.post("/admin/broadcast", auth("commonAdmin"), validate(notificationValidation.sendToAllUsers), notificationController.sendToAllUsers);

module.exports = router;
