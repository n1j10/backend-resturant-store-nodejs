const mongoose = require("mongoose");
const slugify = require("slugify");

const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    gallery: [{ type: String }],
    category: { type: String, required: true, trim: true },
    dietaryTags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dietary" }],
    spicyLevel: {
      type: String,
      enum: ["none", "mild", "medium", "hot"],
      default: "none",
    },
    prepMinutes: { type: Number, default: 20, min: 0 },
    available: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

dishSchema.pre("save", function makeSlug(next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Dish", dishSchema);
