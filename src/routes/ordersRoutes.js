const express = require("express");
const {
  createOrderFromCart,
  listMyOrders,
  getOrderById,
  cancelMyOrder,
  updateOrderStatus,
} = require("../controllers/ordersController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createOrderFromCart);
router.get("/", listMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelMyOrder);
router.patch("/:id/status", authorize("admin"), updateOrderStatus);

module.exports = router;
