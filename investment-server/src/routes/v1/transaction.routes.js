const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { transactionValidation } = require("../../validations");
const { transactionController } = require("../../controllers");
const fileUploadMiddleware = require("../../middlewares/fileUpload");

// Configure upload folder for transaction proofs
const UPLOADS_FOLDER = "./public/uploads/transactions";
const upload = fileUploadMiddleware(UPLOADS_FOLDER);

const router = express.Router();

// User routes
router.post("/deposit", auth("common"), upload.single("proofImage"), validate(transactionValidation.createDeposit), transactionController.createDeposit);
router.post("/withdraw", auth("common"), validate(transactionValidation.createWithdrawal), transactionController.createWithdrawal);
router.get("/my", auth("common"), validate(transactionValidation.getMyTransactions), transactionController.getMyTransactions);
router.get("/stats", auth("common"), transactionController.getTransactionStats);
router.get("/:transactionId", auth("common"), validate(transactionValidation.getTransaction), transactionController.getTransaction);

// Admin routes
router.get("/admin/all", auth("commonAdmin"), validate(transactionValidation.getAllTransactions), transactionController.getAllTransactions);
router.get("/admin/pending", auth("commonAdmin"), validate(transactionValidation.getPendingTransactions), transactionController.getPendingTransactions);
router.post("/admin/:transactionId/approve", auth("commonAdmin"), validate(transactionValidation.approveTransaction), transactionController.approveTransaction);
router.post("/admin/:transactionId/reject", auth("commonAdmin"), validate(transactionValidation.rejectTransaction), transactionController.rejectTransaction);

module.exports = router;
