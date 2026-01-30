const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

// Получить все записи журнала с пагинацией и фильтрами
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, action, user_id, entity_type, date_from, date_to } = req.query;

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (action) {
      whereConditions.push(`al.action = $${paramIndex++}`);
      params.push(action);
    }

    if (user_id) {
      whereConditions.push(`al.user_id = $${paramIndex++}`);
      params.push(user_id);
    }

    if (entity_type) {
      whereConditions.push(`al.entity_type = $${paramIndex++}`);
      params.push(entity_type);
    }

    if (date_from) {
      whereConditions.push(`al.created_at >= $${paramIndex++}`);
      params.push(date_from);
    }

    if (date_to) {
      whereConditions.push(`al.created_at <= $${paramIndex++}`);
      params.push(date_to);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Получаем общее количество записей
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM "Enforce".action_logs al 
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Получаем записи с пагинацией
    const dataQuery = `
      SELECT 
        al.id,
        al.user_id,
        u.full_name as user_name,
        u.login as user_login,
        al.action,
        al.entity_type,
        al.entity_id,
        al.details,
        al.ip_address,
        al.created_at
      FROM "Enforce".action_logs al
      LEFT JOIN "Enforce".users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const { rows } = await pool.query(dataQuery, [...params, limit, offset]);

    res.json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Ошибка получения журнала:", error);
    res.status(500).json({ error: "Не удалось получить журнал действий" });
  }
});

// Получить уникальные типы действий для фильтра
router.get("/actions", async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT DISTINCT action FROM "Enforce".action_logs ORDER BY action');
    res.json(rows.map((r) => r.action));
  } catch (error) {
    console.error("Ошибка получения типов действий:", error);
    res.status(500).json({ error: "Не удалось получить типы действий" });
  }
});

// Получить уникальные типы сущностей для фильтра
router.get("/entity-types", async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT DISTINCT entity_type FROM "Enforce".action_logs WHERE entity_type IS NOT NULL ORDER BY entity_type'
    );
    res.json(rows.map((r) => r.entity_type));
  } catch (error) {
    console.error("Ошибка получения типов сущностей:", error);
    res.status(500).json({ error: "Не удалось получить типы сущностей" });
  }
});

// Создать запись в журнале
router.post("/", async (req, res) => {
  try {
    const { user_id, action, entity_type, entity_id, details } = req.body;

    // Получаем IP адрес из заголовков
    const ip_address =
      req.headers["x-forwarded-for"] || req.connection?.remoteAddress || req.socket?.remoteAddress || "unknown";

    const { rows } = await pool.query(
      `
      INSERT INTO "Enforce".action_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [user_id, action, entity_type, entity_id, details ? JSON.stringify(details) : null, ip_address]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Ошибка создания записи в журнале:", error);
    res.status(500).json({ error: "Не удалось создать запись в журнале" });
  }
});

module.exports = router;
