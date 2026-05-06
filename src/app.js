const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { apiLimiter } = require("./middleware/rateLimitMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const menuRoutes = require("./routes/menuRoutes");
const dishesRoutes = require("./routes/dishesRoutes");
const dietaryRoutes = require("./routes/dietaryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const profileRoutes = require("./routes/profileRoutes");
const addressesRoutes = require("./routes/addressesRoutes");
const paymentsRoutes = require("./routes/paymentsRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(apiLimiter);

app.get(["/", "/api"], (req, res) => {
  res.json({
    success: true,
    message: "Italian Store API",
    health: "/health",
    apiBase: "/api/v1",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/home", homeRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/dishes", dishesRoutes);
app.use("/api/v1/dietary", dietaryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", ordersRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/addresses", addressesRoutes);
app.use("/api/v1/payments", paymentsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
