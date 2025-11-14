const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

// Получить все IP адреса
router.get("/ip", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".ip_addresses ORDER BY address');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все протоколы
router.get("/protocols", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".protocols ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;