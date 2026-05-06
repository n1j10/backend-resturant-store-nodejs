const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Address = require("../models/Address");
const asyncHandler = require("../middleware/asyncHandler");

const createOrderFromCart = asyncHandler(async (req, res) => {
  const { addressId, note, deliveryFee = 0, discount = 0 } = req.body;
  if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
    res.status(400);
    throw new Error("Valid addressId is required");
  }

  const [cart, address] = await Promise.all([
    Cart.findOne({ user: req.user._id }).populate("items.dish"),
    Address.findOne({ _id: addressId, user: req.user._id }),
  ]);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }
  if (!cart || !cart.items.length) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const items = cart.items.map((item) => ({
    dish: item.dish._id,
    name: item.dish.name,
    quantity: item.quantity,
    price: item.priceSnapshot,
    lineTotal: Number((item.quantity * item.priceSnapshot).toFixed(3)),
  }));

  const subtotal = Number(
    items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(3)
  );
  const delivery = Number(deliveryFee || 0);
  const discountValue = Number(discount || 0);
  const total = Number((subtotal + delivery - discountValue).toFixed(3));

  const order = await Order.create({
    user: req.user._id,
    items,
    totals: {
      subtotal,
      deliveryFee: delivery,
      discount: discountValue,
      total,
    },
    addressSnapshot: {
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
    },
    note: note || "",
    status: "pending",
  });

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(201).json({
    success: true,
    message: "Order created",
    data: order,
  });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("items.dish", "name slug image");

  res.json({
    success: true,
    data: orders,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid order id");
  }

  const order = await Order.findById(id).populate("items.dish", "name slug image");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Forbidden");
  }

  res.json({
    success: true,
    data: order,
  });
});

const cancelMyOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid order id");
  }

  const order = await Order.findOne({ _id: id, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!["pending", "payment_created", "failed"].includes(order.status)) {
    res.status(400);
    throw new Error("Order cannot be cancelled in current state");
  }

  order.status = "cancelled";
  await order.save();

  res.json({
    success: true,
    message: "Order cancelled",
    data: order,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid order id");
  }
  if (!status) {
    res.status(400);
    throw new Error("Status is required");
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  await order.save();

  res.json({
    success: true,
    message: "Order status updated",
    data: order,
  });
});

module.exports = {
  createOrderFromCart,
  listMyOrders,
  getOrderById,
  cancelMyOrder,
  updateOrderStatus,
};
