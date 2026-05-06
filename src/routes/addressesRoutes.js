const express = require("express");
const {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressesController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", listAddresses);
router.post("/", createAddress);
router.patch("/:id", updateAddress);
router.delete("/:id", deleteAddress);
router.patch("/:id/default", setDefaultAddress);

module.exports = router;
