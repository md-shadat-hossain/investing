const express = require("express");
const auth = require("../../middlewares/auth");
const { profitDistributionController } = require("../../controllers");

const router = express.Router();

// ==================== User Routes ====================

// Get my profit history
router.get("/my-history", auth("common"), profitDistributionController.getMyProfitHistory);

// Get profit history for specific investment
router.get(
  "/investment/:investmentId/history",
  auth("common"),
  profitDistributionController.getInvestmentProfitHistory
);

// ==================== Admin Routes ====================

// Run profit distribution manually for all investments
router.post("/admin/run-distribution", auth("commonAdmin"), profitDistributionController.runProfitDistribution);

// Distribute profit for single investment
router.post(
  "/admin/investment/:investmentId/distribute",
  auth("commonAdmin"),
  profitDistributionController.distributeSingleProfit
);

// Pause investment
router.post(
  "/admin/investment/:investmentId/pause",
  auth("commonAdmin"),
  profitDistributionController.pauseInvestment
);

// Resume investment
router.post(
  "/admin/investment/:investmentId/resume",
  auth("commonAdmin"),
  profitDistributionController.resumeInvestment
);

// Manual profit distribution
router.post(
  "/admin/investment/:investmentId/manual-distribution",
  auth("commonAdmin"),
  profitDistributionController.manualProfitDistribution
);

// Get all profit distributions
router.get("/admin/all", auth("commonAdmin"), profitDistributionController.getAllProfitDistributions);

// ==================== Profit Adjustment Routes (Admin) ====================

// Create profit adjustment
router.post("/admin/adjustments", auth("commonAdmin"), profitDistributionController.createAdjustment);

// Get all adjustments
router.get("/admin/adjustments", auth("commonAdmin"), profitDistributionController.getAllAdjustments);

// Get adjustment by ID
router.get("/admin/adjustments/:adjustmentId", auth("commonAdmin"), profitDistributionController.getAdjustment);

// Update adjustment
router.patch(
  "/admin/adjustments/:adjustmentId",
  auth("commonAdmin"),
  profitDistributionController.updateAdjustment
);

// Toggle adjustment status
router.post(
  "/admin/adjustments/:adjustmentId/toggle",
  auth("commonAdmin"),
  profitDistributionController.toggleAdjustment
);

// Delete adjustment
router.delete(
  "/admin/adjustments/:adjustmentId",
  auth("commonAdmin"),
  profitDistributionController.deleteAdjustment
);

module.exports = router;
