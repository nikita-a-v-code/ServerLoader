const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

// Получить все IP адреса
router.get("/ip", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".ip_addresses ORDER BY is_default DESC, address');
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

// Установить IP адрес по умолчанию
router.post("/ip/:id/default", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query('UPDATE "Enforce".ip_addresses SET is_default = false');
    const result = await client.query('UPDATE "Enforce".ip_addresses SET is_default = true WHERE id = $1 RETURNING *', [
      id,
    ]);
    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Сбросить IP по умолчанию (оставить без дефолта)
router.post("/ip/default/clear", async (_req, res) => {
  try {
    await pool.query('UPDATE "Enforce".ip_addresses SET is_default = false');
    res.json({ message: "Default IP cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все протоколы
router.get("/protocols", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".protocols ORDER BY is_default DESC, name');
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

// Установить протокол по умолчанию
router.post("/protocols/:id/default", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query('UPDATE "Enforce".protocols SET is_default = false');
    const result = await client.query('UPDATE "Enforce".protocols SET is_default = true WHERE id = $1 RETURNING *', [
      id,
    ]);
    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Сбросить протокол по умолчанию (оставить без дефолта)
router.post("/protocols/default/clear", async (_req, res) => {
  try {
    await pool.query('UPDATE "Enforce".protocols SET is_default = false');
    res.json({ message: "Default protocol cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
