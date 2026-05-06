const express = require("express");
const {
  listDietary,
  createDietary,
  updateDietary,
  deleteDietary,
} = require("../controllers/dietaryController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", listDietary);
router.post("/", protect, authorize("admin"), createDietary);
router.patch("/:id", protect, authorize("admin"), updateDietary);
router.delete("/:id", protect, authorize("admin"), deleteDietary);

module.exports = router;
