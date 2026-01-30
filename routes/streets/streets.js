const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

// Функция логирования действий
const logAction = async (userId, action, entityType, entityId, details, ipAddress) => {
  try {
    await pool.query(
      `INSERT INTO "Enforce".action_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entityType, entityId, details ? JSON.stringify(details) : null, ipAddress]
    );
  } catch (error) {
    console.error("Ошибка записи в журнал:", error);
  }
};

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
  const { name, settlement_id, userId } = req.body;
  const ipAddress = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
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

    // Получаем название населенного пункта для лога
    const settlementResult = await pool.query('SELECT name FROM "Enforce".settlements WHERE id = $1', [settlement_id]);
    const settlementName = settlementResult.rows[0]?.name || "Неизвестный";

    // Логируем создание улицы
    await logAction(
      userId || null,
      "create",
      "street",
      result.rows[0].id,
      {
        "Создана улица": name,
        "Для населенного пункта": settlementName,
      },
      ipAddress
    );

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
    const result = await pool.query('UPDATE "Enforce".streets SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
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
