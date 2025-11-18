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

// Получить все РКЭС
router.get("/rkes", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".rkes ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все МУ
router.get("/master-units", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".master_units ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новый МПЭС
router.post("/mpes", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO "Enforce".mpes (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить МПЭС
router.put("/mpes/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query('UPDATE "Enforce".mpes SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить МПЭС
router.delete("/mpes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".mpes WHERE id = $1', [id]);
    res.json({ message: "MPES deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новый РКЭС
router.post("/rkes", async (req, res) => {
  const { name, mpes_id } = req.body;
  try {
    const result = await pool.query('INSERT INTO "Enforce".rkes (name, mpes_id) VALUES ($1, $2) RETURNING *', [name, mpes_id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить РКЭС
router.put("/rkes/:id", async (req, res) => {
  const { id } = req.params;
  const { name, mpes_id } = req.body;
  try {
    const result = await pool.query('UPDATE "Enforce".rkes SET name = $1, mpes_id = $2 WHERE id = $3 RETURNING *', [name, mpes_id, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить РКЭС
router.delete("/rkes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".rkes WHERE id = $1', [id]);
    res.json({ message: "RKES deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новый мастерский участок
router.post("/master-units", async (req, res) => {
  const { name, rkes_id } = req.body;
  try {
    const result = await pool.query('INSERT INTO "Enforce".master_units (name, rkes_id) VALUES ($1, $2) RETURNING *', [name, rkes_id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить мастерский участок
router.put("/master-units/:id", async (req, res) => {
  const { id } = req.params;
  const { name, rkes_id } = req.body;
  try {
    const result = await pool.query('UPDATE "Enforce".master_units SET name = $1, rkes_id = $2 WHERE id = $3 RETURNING *', [name, rkes_id, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить мастерский участок
router.delete("/master-units/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".master_units WHERE id = $1', [id]);
    res.json({ message: "Master unit deleted successfully" });
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
