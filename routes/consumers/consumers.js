const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

// Получить все типы абонентов
router.get("/abonent-types", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".abonent_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все статусы
router.get("/statuses", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".statuses ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;