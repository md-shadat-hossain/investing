const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { adminValidation } = require("../../validations");
const { adminController } = require("../../controllers");

const router = express.Router();

// All routes require admin authentication
router.use(auth("commonAdmin"));

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);
router.get("/activities", validate(adminValidation.getRecentActivities), adminController.getRecentActivities);

// User management
router.get("/users", validate(adminValidation.getAllUsers), adminController.getAllUsers);
router.get("/users/:userId", validate(adminValidation.getUserDetails), adminController.getUserDetails);
router.post("/users/:userId/block", validate(adminValidation.toggleUserBlock), adminController.toggleUserBlock);
router.post("/users/:userId/kyc", validate(adminValidation.updateKycStatus), adminController.updateKycStatus);
router.post("/users/:userId/add-balance", validate(adminValidation.addUserBalance), adminController.addUserBalance);
router.post("/users/:userId/deduct-balance", validate(adminValidation.deductUserBalance), adminController.deductUserBalance);
router.patch("/users/:userId", validate(adminValidation.updateUserProfile), adminController.updateUserProfile);
router.post("/users/:userId/reset-password", validate(adminValidation.resetUserPassword), adminController.resetUserPassword);
router.delete("/users/:userId", validate(adminValidation.deleteUser), adminController.deleteUser);

module.exports = router;
