const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Dish = require("../models/Dish");
const asyncHandler = require("../middleware/asyncHandler");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    "items.dish",
    "name slug price image available"
  );
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
    cart = await cart.populate("items.dish", "name slug price image available");
  }
  return cart;
};

const getMyCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json({
    success: true,
    data: cart,
  });
});

const addCartItem = asyncHandler(async (req, res) => {
  const { dishId, quantity = 1 } = req.body;
  if (!dishId || !mongoose.Types.ObjectId.isValid(dishId)) {
    res.status(400);
    throw new Error("Valid dishId is required");
  }

  const dish = await Dish.findById(dishId);
  if (!dish || !dish.available) {
    res.status(404);
    throw new Error("Dish not found or unavailable");
  }

  const cart = await getOrCreateCart(req.user._id);
  const foundItem = cart.items.find((item) => item.dish._id.toString() === dishId);

  if (foundItem) {
    foundItem.quantity += Number(quantity);
    foundItem.priceSnapshot = dish.price;
  } else {
    cart.items.push({
      dish: dish._id,
      quantity: Number(quantity),
      priceSnapshot: dish.price,
    });
  }

  cart.recalculateTotal();
  await cart.save();
  await cart.populate("items.dish", "name slug price image available");

  res.json({
    success: true,
    message: "Item added to cart",
    data: cart,
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { dishId } = req.params;
  const { quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(dishId)) {
    res.status(400);
    throw new Error("Invalid dish id");
  }
  if (!quantity || Number(quantity) < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((entry) => entry.dish._id.toString() === dishId);
  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  item.quantity = Number(quantity);
  cart.recalculateTotal();
  await cart.save();
  await cart.populate("items.dish", "name slug price image available");

  res.json({
    success: true,
    message: "Cart item updated",
    data: cart,
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const { dishId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(dishId)) {
    res.status(400);
    throw new Error("Invalid dish id");
  }

  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => item.dish._id.toString() !== dishId);
  cart.recalculateTotal();
  await cart.save();
  await cart.populate("items.dish", "name slug price image available");

  res.json({
    success: true,
    message: "Item removed from cart",
    data: cart,
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.json({
    success: true,
    message: "Cart cleared",
    data: cart,
  });
});

module.exports = {
  getMyCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
