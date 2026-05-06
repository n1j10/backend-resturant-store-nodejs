const Dish = require("../models/Dish");
const Dietary = require("../models/Dietary");
const asyncHandler = require("../middleware/asyncHandler");

const getHome = asyncHandler(async (req, res) => {
  const featured = await Dish.find({ available: true })
    .sort({ rating: -1, reviewsCount: -1, createdAt: -1 })
    .limit(8)
    .select("name slug price image category rating reviewsCount");

  const newest = await Dish.find({ available: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .select("name slug price image category");

  const categories = await Dish.aggregate([
    { $match: { available: true } },
    { $group: { _id: "$category", dishesCount: { $sum: 1 } } },
    { $sort: { dishesCount: -1, _id: 1 } },
    { $project: { _id: 0, category: "$_id", dishesCount: 1 } },
  ]);

  const dietary = await Dietary.find({ active: true })
    .sort({ name: 1 })
    .select("name slug description");

  res.json({
    success: true,
    data: {
      featured,
      newest,
      categories,
      dietary,
    },
  });
});

module.exports = { getHome };
