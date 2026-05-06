const Dish = require("../models/Dish");
const Dietary = require("../models/Dietary");
const asyncHandler = require("../middleware/asyncHandler");

const buildDishFilters = async (query) => {
  const filters = { available: true };

  if (query.category) {
    filters.category = new RegExp(`^${query.category}$`, "i");
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
  }

  if (query.dietary) {
    const slugs = String(query.dietary)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const tags = await Dietary.find({ slug: { $in: slugs } }).select("_id");
    filters.dietaryTags = { $in: tags.map((tag) => tag._id) };
  }

  if (query.search) {
    filters.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { category: { $regex: query.search, $options: "i" } },
    ];
  }

  return filters;
};

const getMenu = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  const skip = (page - 1) * limit;
  const sort = req.query.sort || "-createdAt";

  const filters = await buildDishFilters(req.query);
  const [items, total] = await Promise.all([
    Dish.find(filters)
      .populate("dietaryTags", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Dish.countDocuments(filters),
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getMenuCategories = asyncHandler(async (req, res) => {
  const categories = await Dish.aggregate([
    { $match: { available: true } },
    { $group: { _id: "$category", dishesCount: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, category: "$_id", dishesCount: 1 } },
  ]);

  res.json({
    success: true,
    data: categories,
  });
});

const getMenuByCategory = asyncHandler(async (req, res) => {
  const category = req.params.category;
  const dishes = await Dish.find({
    category: new RegExp(`^${category}$`, "i"),
    available: true,
  }).populate("dietaryTags", "name slug");

  res.json({
    success: true,
    data: dishes,
  });
});

module.exports = {
  getMenu,
  getMenuCategories,
  getMenuByCategory,
};
