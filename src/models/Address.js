const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String, required: true, trim: true },
    recipientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "" },
    country: { type: String, default: "Iraq" },
    postalCode: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
