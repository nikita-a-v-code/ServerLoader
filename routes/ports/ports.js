const express = require("express");
const router = express.Router();
const pool = require("../../config/database");

/**
 * GET /api/ports/next
 * Получить следующий доступный номер порта
 * Возвращает последний использованный порт + 1
 */
router.get("/next", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT MAX(CAST(port_number AS INTEGER)) as max_port FROM \"Enforce\".ports WHERE port_number ~ '^[0-9]+$'"
    );

    const maxPort = result.rows[0].max_port || 10000; // Начинаем с 10000, если портов нет
    const nextPort = maxPort + 1;

    res.json({ nextPort });
  } catch (error) {
    console.error("Error getting next port:", error);
    res.status(500).json({ error: "Failed to get next port number" });
  }
});

/**
 * POST /api/ports
 * Сохранить использованный порт в базу данных
 * Body: { portNumber: "10001", description: "optional description" }
 */
router.post("/", async (req, res) => {
  const { portNumber, description } = req.body;

  if (!portNumber) {
    return res.status(400).json({ error: "Port number is required" });
  }

  try {
    // Выполняем UPSERT: если порт уже есть — обновляем описание (если передали),
    // это предотвращает ошибку UNIQUE при параллельных запросах.
    const upsertQuery = `
      INSERT INTO "Enforce".ports (port_number, description, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (port_number) DO UPDATE
        SET description = COALESCE(EXCLUDED.description, "Enforce".ports.description)
      RETURNING *
    `;

    const result = await pool.query(upsertQuery, [portNumber, description || null]);

    // Всегда возвращаем вставленную/существующую запись
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating port:", error);
    res.status(500).json({ error: "Failed to create port", details: error.message });
  }
});

/**
 * GET /api/ports
 * Получить все порты
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".ports ORDER BY CAST(port_number AS INTEGER) DESC');
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting ports:", error);
    res.status(500).json({ error: "Failed to get ports" });
  }
});

module.exports = router;
