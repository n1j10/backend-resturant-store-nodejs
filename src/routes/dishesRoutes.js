const express = require("express");
const {
  listDishes,
  getDishDetails,
  createDish,
  updateDish,
  deleteDish,
} = require("../controllers/dishesController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", listDishes);
router.get("/:idOrSlug", getDishDetails);
router.post("/", protect, authorize("admin"), createDish);
router.patch("/:id", protect, authorize("admin"), updateDish);
router.delete("/:id", protect, authorize("admin"), deleteDish);

module.exports = router;
