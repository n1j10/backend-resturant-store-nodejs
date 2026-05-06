const mongoose = require("mongoose");
const User = require("../models/User");
const Dish = require("../models/Dish");
const asyncHandler = require("../middleware/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const profile = await User.findById(req.user._id)
    .select("-password")
    .populate("favorites", "name slug price image category available");

  res.json({
    success: true,
    data: profile,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "avatar"];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const updated = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json({
    success: true,
    message: "Profile updated",
    data: updated,
  });
});

const toggleFavoriteDish = asyncHandler(async (req, res) => {
  const { dishId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(dishId)) {
    res.status(400);
    throw new Error("Invalid dish id");
  }

  const dish = await Dish.findById(dishId);
  if (!dish) {
    res.status(404);
    throw new Error("Dish not found");
  }

  const user = await User.findById(req.user._id);
  const exists = user.favorites.some((fav) => fav.toString() === dishId);

  if (exists) {
    user.favorites = user.favorites.filter((fav) => fav.toString() !== dishId);
  } else {
    user.favorites.push(dishId);
  }

  await user.save();
  const updated = await User.findById(user._id)
    .select("-password")
    .populate("favorites", "name slug price image");

  res.json({
    success: true,
    message: exists ? "Dish removed from favorites" : "Dish added to favorites",
    data: updated,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  toggleFavoriteDish,
};
