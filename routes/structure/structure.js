const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

// Получить все МПЭС
router.get("/mpes", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".mpes ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить РКЭС по МПЭС
router.get("/rkes/by-mpes/:mpesId", async (req, res) => {
  const { mpesId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM "Enforce".rkes WHERE mpes_id = $1 ORDER BY name', [mpesId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить мастерские участки по РКЭС
router.get("/master-units/by-rkes/:rkesId", async (req, res) => {
  const { rkesId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM "Enforce".master_units WHERE rkes_id = $1 ORDER BY name', [rkesId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;