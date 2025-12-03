const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

// Получить все населенные пункты
router.get("/", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".settlements ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новый населенный пункт
router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM "Enforce".settlements WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Населенный пункт уже существует" });
    }

    const result = await pool.query('INSERT INTO "Enforce".settlements (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить населенный пункт
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Enforce".settlements SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить населенный пункт
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".settlements WHERE id = $1', [id]);
    res.json({ message: "Settlements deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
