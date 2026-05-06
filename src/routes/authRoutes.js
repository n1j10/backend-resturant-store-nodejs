const express = require("express");
const {
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.patch("/password", protect, updatePassword);

module.exports = router;
