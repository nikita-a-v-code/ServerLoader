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
  const { name, password, ip_address, requests, adv_settings } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO "Enforce".device_types (name, password, ip_address, requests, adv_settings) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, password, ip_address || "", requests || "", adv_settings || ""]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить модель счетчика и пароль
router.put("/device/:id", async (req, res) => {
  const { id } = req.params;
  const { name, password, ip_address, requests, adv_settings } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Enforce".device_types SET name = $1, password = $2, ip_address = $3, requests = $4, adv_settings = $5 WHERE id = $6 RETURNING *',
      [name, password, ip_address || "", requests || "", adv_settings || "", id]
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
    res.json({ message: "Device type deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
