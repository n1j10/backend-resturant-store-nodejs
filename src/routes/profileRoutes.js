const express = require("express");
const {
  getProfile,
  updateProfile,
  toggleFavoriteDish,
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getProfile);
router.patch("/", updateProfile);
router.post("/favorites/:dishId", toggleFavoriteDish);

module.exports = router;
