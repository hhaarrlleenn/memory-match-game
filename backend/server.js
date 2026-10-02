const express = require("express");
const cors = require("cors");

const gameRoutes = require("./routes/gameRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

// Initialize database
require("./config/database");

const app = express();

const PORT = 5001;

// Allow frontend requests
app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json());

app.use("/api", gameRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});