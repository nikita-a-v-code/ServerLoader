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

// Обновить список улиц
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Enforce".streets SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить улицу по населенному пункту
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".streets WHERE id = $1', [id]);
    res.json({ message: "Streets deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
