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

// Создать новый IP адрес
router.post("/ip", async (req, res) => {
  const { address } = req.body;
  try {
    const result = await pool.query('INSERT INTO "Enforce".ip_addresses (address) VALUES ($1::inet) RETURNING *', [
      address,
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить IP адрес
router.put("/ip/:id", async (req, res) => {
  const { id } = req.params;
  const { address } = req.body;
  try {
    const result = await pool.query('UPDATE "Enforce".ip_addresses SET address = $1::inet WHERE id = $2 RETURNING *', [
      address,
      id,
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить IP адрес
router.delete("/ip/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".ip_addresses WHERE id = $1', [id]);
    res.json({ message: "Abonent type deleted successfully" });
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

// Создать новый тип протокола
router.post("/protocols", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO "Enforce".protocols (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить тип протокола
router.put("/protocols/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query('UPDATE "Enforce".protocols SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить тип протокола
router.delete("/protocols/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".protocols WHERE id = $1', [id]);
    res.json({ message: "Abonent type deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
