const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================================================
// MIDDLEWARE
// =============================================================================
app.use(cors());
app.use(express.json());

// =============================================================================
// HEALTH CHECK
// =============================================================================
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected!", time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "DB connection failed: " + error.message });
  }
});

// =============================================================================
// ROUTES
// =============================================================================
app.use("/api/settlements", require("./routes/settlements/settlements"));
app.use("/api/streets", require("./routes/streets/streets"));
app.use("/api", require("./routes/consumers/consumers"));
app.use("/api", require("./routes/structure/structure"));
app.use("/api/", require("./routes/devices/devices"));
app.use("/api/", require("./routes/numberTP/numberTP"));
app.use("/api", require("./routes/connections/connections"));
app.use("/api/ports", require("./routes/ports/ports"));
app.use("/api/excel", require("./routes/excel/excel"));
app.use("/api/settings", require("./routes/settings/settings"));
app.use("/api/users", require("./routes/users/users"));
app.use("/api/action-logs", require("./routes/action-logs/action-logs"));

// =============================================================================
// STATIC FILES (React Frontend)
// =============================================================================
const path = require("path");

// Раздача статических файлов React (production build)
const staticPath = path.join(__dirname, "../Loader/build");
app.use(express.static(staticPath));

// Все остальные запросы (не /api/*) направляем на React SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// =============================================================================
// SERVER START
// =============================================================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Frontend: http://localhost:${PORT}`);
});
