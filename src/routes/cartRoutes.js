const express = require("express");
const {
  getMyCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getMyCart);
router.post("/items", addCartItem);
router.patch("/items/:dishId", updateCartItem);
router.delete("/items/:dishId", removeCartItem);
router.delete("/", clearCart);

module.exports = router;
