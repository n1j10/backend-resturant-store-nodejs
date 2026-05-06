const express = require("express");
const {
  getMenu,
  getMenuCategories,
  getMenuByCategory,
} = require("../controllers/menuController");

const router = express.Router();

router.get("/", getMenu);
router.get("/categories", getMenuCategories);
router.get("/categories/:category", getMenuByCategory);

module.exports = router;
