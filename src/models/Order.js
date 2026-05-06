const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    dish: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totals: {
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "payment_created",
        "paid",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
        "failed",
      ],
      default: "pending",
    },
    payment: {
      provider: { type: String, default: "qicard" },
      requestId: { type: String, default: "" },
      paymentId: { type: String, default: "" },
      status: { type: String, default: "" },
      formUrl: { type: String, default: "" },
      raw: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    addressSnapshot: {
      label: String,
      recipientName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    note: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
