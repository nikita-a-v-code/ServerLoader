const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

// Получить улицы по населенному пункту
router.get("/by-settlement/:settlementId", async (req, res) => {
  const { settlementId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM "Enforce".streets WHERE settlement_id = $1 ORDER BY name', [
      settlementId,
    ]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новую улицу
router.post("/", async (req, res) => {
  const { name, settlement_id } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM "Enforce".streets WHERE name = $1 AND settlement_id = $2', [
      name,
      settlement_id,
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Улица уже существует в этом населенном пункте" });
    }

    const result = await pool.query('INSERT INTO "Enforce".streets (name, settlement_id) VALUES ($1, $2) RETURNING *', [
      name,
      settlement_id,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
