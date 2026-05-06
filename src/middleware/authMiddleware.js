const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, invalid token");
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error("Forbidden");
  }
  next();
};

module.exports = { protect, authorize };
