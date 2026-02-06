const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { paymentGatewayValidation } = require("../../validations");
const { paymentGatewayController } = require("../../controllers");

const router = express.Router();

// Public/User routes
router.get("/active", validate(paymentGatewayValidation.getActiveGateways), paymentGatewayController.getActiveGateways);
router.get("/type/:type", auth("common"), validate(paymentGatewayValidation.getGatewaysByType), paymentGatewayController.getGatewaysByType);
router.get("/:gatewayId", auth("common"), validate(paymentGatewayValidation.getGateway), paymentGatewayController.getGateway);

// Admin routes
router.get("/", auth("commonAdmin"), validate(paymentGatewayValidation.getAllGateways), paymentGatewayController.getAllGateways);
router.post("/", auth("commonAdmin"), validate(paymentGatewayValidation.createGateway), paymentGatewayController.createGateway);
router.patch("/:gatewayId", auth("commonAdmin"), validate(paymentGatewayValidation.updateGateway), paymentGatewayController.updateGateway);
router.delete("/:gatewayId", auth("commonAdmin"), validate(paymentGatewayValidation.deleteGateway), paymentGatewayController.deleteGateway);
router.post("/:gatewayId/toggle", auth("commonAdmin"), validate(paymentGatewayValidation.toggleGatewayStatus), paymentGatewayController.toggleGatewayStatus);

module.exports = router;
