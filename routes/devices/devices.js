const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

// Получить все типы устройств
router.get("/", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".device_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;