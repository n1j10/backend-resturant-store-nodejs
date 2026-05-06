const express = require("express");
const {
  createPaymentForOrder,
  getPaymentStatus,
  cancelPayment,
  refundPayment,
  handlePaymentWebhook,
} = require("../controllers/paymentsController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/webhook", handlePaymentWebhook);

router.use(protect);
router.post("/create", createPaymentForOrder);
router.get("/:paymentId/status", getPaymentStatus);
router.post("/:paymentId/cancel", cancelPayment);
router.post("/:paymentId/refund", authorize("admin"), refundPayment);

module.exports = router;
