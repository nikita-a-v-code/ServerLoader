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

// Создать новый тип абонента
router.post("/abonent-types", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO "Enforce".abonent_types (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить тип абонента
router.put("/abonent-types/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query('UPDATE "Enforce".abonent_types SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить тип абонента
router.delete("/abonent-types/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".abonent_types WHERE id = $1', [id]);
    res.json({ message: "Abonent type deleted successfully" });
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

// Создать новый статус
router.post("/statuses", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO "Enforce".statuses (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить статус
router.put("/statuses/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query('UPDATE "Enforce".statuses SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить статус
router.delete("/statuses/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".statuses WHERE id = $1', [id]);
    res.json({ message: "Status deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;