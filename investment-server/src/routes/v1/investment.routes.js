const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { investmentValidation } = require("../../validations");
const { investmentController } = require("../../controllers");

const router = express.Router();

// User routes
router.post("/", auth("common"), validate(investmentValidation.createInvestment), investmentController.createInvestment);
router.get("/my", auth("common"), validate(investmentValidation.getMyInvestments), investmentController.getMyInvestments);
router.get("/active", auth("common"), investmentController.getActiveInvestments);
router.get("/stats", auth("common"), investmentController.getInvestmentStats);
router.get("/:investmentId", auth("common"), validate(investmentValidation.getInvestment), investmentController.getInvestment);

// Admin routes
router.get("/admin/all", auth("commonAdmin"), validate(investmentValidation.getAllInvestments), investmentController.getAllInvestments);

module.exports = router;
