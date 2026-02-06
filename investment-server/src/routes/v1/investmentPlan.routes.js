const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { investmentPlanValidation } = require("../../validations");
const { investmentPlanController } = require("../../controllers");

const router = express.Router();

// Public routes
router.get("/active", investmentPlanController.getActivePlans);

// Protected routes
router.get("/", auth("common"), validate(investmentPlanValidation.getPlans), investmentPlanController.getPlans);
router.get("/:planId", auth("common"), validate(investmentPlanValidation.getPlan), investmentPlanController.getPlan);

// Admin routes
router.post("/", auth("commonAdmin"), validate(investmentPlanValidation.createPlan), investmentPlanController.createPlan);
router.patch("/:planId", auth("commonAdmin"), validate(investmentPlanValidation.updatePlan), investmentPlanController.updatePlan);
router.delete("/:planId", auth("commonAdmin"), validate(investmentPlanValidation.deletePlan), investmentPlanController.deletePlan);

module.exports = router;
