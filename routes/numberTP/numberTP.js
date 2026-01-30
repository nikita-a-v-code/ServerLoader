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

// Получить все номера ТП
router.get("/numberTP", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".number_tp ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новый номер ТП
router.post("/numberTP", async (req, res) => {
  const { name, userId, source } = req.body;
  const ipAddress = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
  try {
    console.log("Creating number TP with name:", name);
    const result = await pool.query('INSERT INTO "Enforce".number_tp (name) VALUES ($1) RETURNING *', [name]);
    console.log("Number TP created:", result.rows[0]);

    // Логируем создание номера ТП
    await logAction(
      userId || null,
      "create",
      "number_tp",
      result.rows[0].id,
      {
        "Номер ТП": name,
        "Источник": source || "admin_panel",
      },
      ipAddress
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating number TP:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Обновить номер ТП
router.put("/numberTP/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query('UPDATE "Enforce".number_tp SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить номер ТП
router.delete("/numberTP/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "Enforce".number_tp WHERE id = $1', [id]);
    res.json({ message: "Номер ТП успешно удален" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
