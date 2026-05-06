const mongoose = require("mongoose");
const slugify = require("slugify");

const dietarySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

dietarySchema.pre("save", function makeSlug(next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Dietary", dietarySchema);
