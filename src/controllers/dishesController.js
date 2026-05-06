const mongoose = require("mongoose");
const slugify = require("slugify");
const Dish = require("../models/Dish");
const asyncHandler = require("../middleware/asyncHandler");

const listDishes = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const skip = (page - 1) * limit;

  const filters = {};
  if (req.query.available !== undefined) {
    filters.available = req.query.available === "true";
  }
  if (req.query.category) {
    filters.category = new RegExp(`^${req.query.category}$`, "i");
  }
  if (req.query.search) {
    filters.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Dish.find(filters)
      .populate("dietaryTags", "name slug")
      .sort(req.query.sort || "-createdAt")
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

const getDishDetails = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = mongoose.Types.ObjectId.isValid(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const dish = await Dish.findOne(query).populate("dietaryTags", "name slug");
  if (!dish) {
    res.status(404);
    throw new Error("Dish not found");
  }

  res.json({
    success: true,
    data: dish,
  });
});

const createDish = asyncHandler(async (req, res) => {
  const required = ["name", "price", "category"];
  const missing = required.filter((field) => req.body[field] === undefined);
  if (missing.length) {
    res.status(400);
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  const payload = {
    ...req.body,
    slug: slugify(req.body.name, { lower: true, strict: true }),
  };

  const dish = await Dish.create(payload);
  res.status(201).json({
    success: true,
    message: "Dish created",
    data: dish,
  });
});

const updateDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) {
    res.status(404);
    throw new Error("Dish not found");
  }

  Object.keys(req.body).forEach((key) => {
    dish[key] = req.body[key];
  });

  if (req.body.name) {
    dish.slug = slugify(req.body.name, { lower: true, strict: true });
  }

  const updated = await dish.save();
  res.json({
    success: true,
    message: "Dish updated",
    data: updated,
  });
});

const deleteDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) {
    res.status(404);
    throw new Error("Dish not found");
  }

  await dish.deleteOne();
  res.json({
    success: true,
    message: "Dish deleted",
  });
});

module.exports = {
  listDishes,
  getDishDetails,
  createDish,
  updateDish,
  deleteDish,
};
