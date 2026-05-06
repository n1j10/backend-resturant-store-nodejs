const mongoose = require("mongoose");
const Address = require("../models/Address");
const asyncHandler = require("../middleware/asyncHandler");

const listAddresses = asyncHandler(async (req, res) => {
  const items = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  res.json({
    success: true,
    data: items,
  });
});

const createAddress = asyncHandler(async (req, res) => {
  const required = ["label", "recipientName", "phone", "street", "city"];
  const missing = required.filter((field) => !req.body[field]);
  if (missing.length) {
    res.status(400);
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({
    ...req.body,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Address created",
    data: address,
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid address id");
  }

  const address = await Address.findOne({ _id: id, user: req.user._id });
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  Object.keys(req.body).forEach((key) => {
    address[key] = req.body[key];
  });
  await address.save();

  res.json({
    success: true,
    message: "Address updated",
    data: address,
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid address id");
  }

  const address = await Address.findOne({ _id: id, user: req.user._id });
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  await address.deleteOne();
  res.json({
    success: true,
    message: "Address deleted",
  });
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid address id");
  }

  const address = await Address.findOne({ _id: id, user: req.user._id });
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  await Address.updateMany({ user: req.user._id }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  res.json({
    success: true,
    message: "Default address updated",
    data: address,
  });
});

module.exports = {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
