const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { generateToken } = require("../utils/jwt");

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("Email already in use");
  }

  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id);
  res.json({
    success: true,
    message: "Logged in successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "avatar"];
  const updates = {};

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json({
    success: true,
    message: "Profile updated",
    data: updatedUser,
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required");
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password updated successfully",
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
};
