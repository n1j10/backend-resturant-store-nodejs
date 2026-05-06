const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    dish: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceSnapshot: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cartSchema.methods.recalculateTotal = function recalculateTotal() {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.quantity * item.priceSnapshot,
    0
  );
};

module.exports = mongoose.model("Cart", cartSchema);
