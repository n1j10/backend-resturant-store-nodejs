require("dotenv").config({ quiet: true });

const app = require("../src/app");
const connectDB = require("../src/config/db");

let connectionPromise = null;

module.exports = async (req, res) => {
  const pathname = req.url.split("?")[0];

  if (pathname === "/" || pathname === "/api" || pathname === "/health") {
    return app(req, res);
  }

  if (!connectionPromise) {
    connectionPromise = connectDB();
  }

  try {
    await connectionPromise;
    return app(req, res);
  } catch (error) {
    connectionPromise = null;
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
};
