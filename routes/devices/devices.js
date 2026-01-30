const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

// Получить все типы устройств
router.get("/device", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".device_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новую модель счетчика
router.post("/device", async (req, res) => {
  const { name, password, requests, adv_settings } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO "Enforce".device_types (name, password, requests, adv_settings) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, password, requests || "", adv_settings || ""]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить модель счетчика и пароль
router.put("/device/:id", async (req, res) => {
  const { id } = req.params;
  const { name, password, requests, adv_settings } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Enforce".device_types SET name = $1, password = $2, requests = $3, adv_settings = $4 WHERE id = $5 RETURNING *',
      [name, password, requests || "", adv_settings || "", id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить модель счетчика и пароль
router.delete("/device/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".device_types WHERE id = $1', [id]);
    res.json({ message: "Abonent type deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
