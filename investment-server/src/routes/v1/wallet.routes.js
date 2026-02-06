const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { walletValidation } = require("../../validations");
const { walletController } = require("../../controllers");

const router = express.Router();

router.get("/", auth("common"), walletController.getWallet);
router.get("/stats", auth("common"), walletController.getWalletStats);

module.exports = router;
