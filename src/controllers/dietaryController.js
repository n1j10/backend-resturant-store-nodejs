const slugify = require("slugify");
const Dietary = require("../models/Dietary");
const asyncHandler = require("../middleware/asyncHandler");

const listDietary = asyncHandler(async (req, res) => {
  const items = await Dietary.find(req.query.active ? { active: true } : {})
    .sort({ name: 1 })
    .select("name slug description active");

  res.json({
    success: true,
    data: items,
  });
});

const createDietary = asyncHandler(async (req, res) => {
  const { name, description, active } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Name is required");
  }

  const exists = await Dietary.findOne({ slug: slugify(name, { lower: true, strict: true }) });
  if (exists) {
    res.status(409);
    throw new Error("Dietary tag already exists");
  }

  const item = await Dietary.create({ name, description, active });
  res.status(201).json({
    success: true,
    message: "Dietary tag created",
    data: item,
  });
});

const updateDietary = asyncHandler(async (req, res) => {
  const item = await Dietary.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Dietary tag not found");
  }

  Object.keys(req.body).forEach((key) => {
    item[key] = req.body[key];
  });
  if (req.body.name) {
    item.slug = slugify(req.body.name, { lower: true, strict: true });
  }

  await item.save();
  res.json({
    success: true,
    message: "Dietary tag updated",
    data: item,
  });
});

const deleteDietary = asyncHandler(async (req, res) => {
  const item = await Dietary.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Dietary tag not found");
  }
  await item.deleteOne();
  res.json({
    success: true,
    message: "Dietary tag deleted",
  });
});

module.exports = {
  listDietary,
  createDietary,
  updateDietary,
  deleteDietary,
};
