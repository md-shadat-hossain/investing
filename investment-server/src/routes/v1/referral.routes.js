const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { referralValidation } = require("../../validations");
const { referralController } = require("../../controllers");

const router = express.Router();

// Public route - validate referral code
router.get("/validate/:code", validate(referralValidation.validateReferralCode), referralController.validateReferralCode);

// Public route - get commission rates info
router.get("/commission-rates", referralController.getCommissionRates);

// User routes
router.get("/my", auth("common"), validate(referralValidation.getMyReferrals), referralController.getMyReferrals);
router.get("/stats", auth("common"), referralController.getReferralStats);
router.get("/team-network", auth("common"), referralController.getTeamNetwork);
router.get("/commission-breakdown", auth("common"), referralController.getCommissionBreakdown);

// Admin routes
router.get("/admin/all", auth("commonAdmin"), validate(referralValidation.getAllReferrals), referralController.getAllReferrals);

module.exports = router;
