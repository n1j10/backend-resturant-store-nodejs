require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
