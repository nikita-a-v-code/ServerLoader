const express = require("express");
const pool = require("../../config/database");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Секретный ключ для JWT (в реальном проекте хранить в .env)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Токен действует 7 дней

// ============================================================================
// АВТОРИЗАЦИЯ
// ============================================================================

// Логин пользователя
router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ success: false, error: "Введите логин и пароль" });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        u.id, 
        u.full_name, 
        u.login, 
        u.role_id,
        r.name as role_name,
        r.description as role_description,
        r.permissions,
        u.is_active
      FROM "Enforce".users u
      LEFT JOIN "Enforce".user_roles r ON u.role_id = r.id
      WHERE u.login = $1 AND u.password = $2
    `,
      [login, password]
    );

    if (!rows[0]) {
      return res.status(401).json({ success: false, error: "Неверный логин или пароль" });
    }

    if (!rows[0].is_active) {
      return res.status(403).json({ success: false, error: "Учетная запись заблокирована" });
    }

    // Данные пользователя для токена и ответа
    const user = {
      id: rows[0].id,
      full_name: rows[0].full_name,
      login: rows[0].login,
      role_id: rows[0].role_id,
      role_name: rows[0].role_name,
      role_description: rows[0].role_description,
      permissions: rows[0].permissions,
    };

    // Генерируем JWT токен
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ success: true, token, user });
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(500).json({ success: false, error: "Ошибка сервера" });
  }
});

// Получить текущего пользователя по токену
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Токен не предоставлен" });
    }

    const token = authHeader.split(" ")[1];

    // Проверяем токен
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: "Недействительный токен" });
    }

    // Получаем данные пользователя из БД
    const { rows } = await pool.query(
      `
      SELECT 
        u.id, 
        u.full_name, 
        u.login, 
        u.role_id,
        r.name as role_name,
        r.description as role_description,
        r.permissions,
        u.is_active
      FROM "Enforce".users u
      LEFT JOIN "Enforce".user_roles r ON u.role_id = r.id
      WHERE u.id = $1
    `,
      [decoded.userId]
    );

    if (!rows[0]) {
      return res.status(401).json({ success: false, error: "Пользователь не найден" });
    }

    if (!rows[0].is_active) {
      return res.status(403).json({ success: false, error: "Учетная запись заблокирована" });
    }

    const user = {
      id: rows[0].id,
      full_name: rows[0].full_name,
      login: rows[0].login,
      role_id: rows[0].role_id,
      role_name: rows[0].role_name,
      role_description: rows[0].role_description,
      permissions: rows[0].permissions,
    };

    res.json({ success: true, user });
  } catch (error) {
    console.error("Ошибка получения пользователя:", error);
    res.status(500).json({ success: false, error: "Ошибка сервера" });
  }
});

// ============================================================================
// РОЛИ
// ============================================================================

// Получить все роли
router.get("/roles", async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, description, permissions FROM "Enforce".user_roles ORDER BY id'
    );
    res.json(rows);
  } catch (error) {
    console.error("Ошибка получения ролей:", error);
    res.status(500).json({ error: "Не удалось получить список ролей" });
  }
});

// ============================================================================
// ПОЛЬЗОВАТЕЛИ
// ============================================================================

// Получить всех пользователей
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.id, 
        u.full_name, 
        u.login, 
        u.role_id,
        r.name as role_name,
        r.description as role_description,
        u.is_active,
        u.created_at,
        u.updated_at
      FROM "Enforce".users u
      LEFT JOIN "Enforce".user_roles r ON u.role_id = r.id
      ORDER BY u.id
    `);
    res.json(rows);
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    res.status(500).json({ error: "Не удалось получить список пользователей" });
  }
});

// Получить пользователя по ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `
      SELECT 
        u.id, 
        u.full_name, 
        u.login, 
        u.role_id,
        r.name as role_name,
        u.is_active,
        u.created_at,
        u.updated_at
      FROM "Enforce".users u
      LEFT JOIN "Enforce".user_roles r ON u.role_id = r.id
      WHERE u.id = $1
    `,
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Ошибка получения пользователя:", error);
    res.status(500).json({ error: "Не удалось получить пользователя" });
  }
});

// Создать пользователя
router.post("/", async (req, res) => {
  try {
    const { full_name, login, password, role_id, is_active = true } = req.body;

    // Валидация
    if (!full_name || !login || !password || !role_id) {
      return res.status(400).json({ error: "Все поля обязательны для заполнения" });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "Пароль должен содержать минимум 4 символа" });
    }

    // Проверка уникальности логина
    const existingUser = await pool.query('SELECT id FROM "Enforce".users WHERE login = $1', [login]);
    if (existingUser.rows[0]) {
      return res.status(400).json({ error: "Пользователь с таким логином уже существует" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO "Enforce".users (full_name, login, password, role_id, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, login, role_id, is_active, created_at
    `,
      [full_name, login, password, role_id, is_active]
    );

    // Получаем данные с названием роли
    const { rows: userWithRole } = await pool.query(
      `
      SELECT 
        u.id, u.full_name, u.login, u.role_id,
        r.name as role_name,
        u.is_active, u.created_at
      FROM "Enforce".users u
      LEFT JOIN "Enforce".user_roles r ON u.role_id = r.id
      WHERE u.id = $1
    `,
      [rows[0].id]
    );

    res.status(201).json(userWithRole[0]);
  } catch (error) {
    console.error("Ошибка создания пользователя:", error);
    res.status(500).json({ error: "Не удалось создать пользователя" });
  }
});

// Обновить пользователя
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, login, password, role_id, is_active } = req.body;

    // Валидация
    if (!full_name || !login || !role_id) {
      return res.status(400).json({ error: "ФИО, логин и роль обязательны для заполнения" });
    }

    // Проверка уникальности логина (исключая текущего пользователя)
    const existingUser = await pool.query('SELECT id FROM "Enforce".users WHERE login = $1 AND id != $2', [login, id]);
    if (existingUser.rows[0]) {
      return res.status(400).json({ error: "Пользователь с таким логином уже существует" });
    }

    let query;
    let params;

    if (password) {
      // Обновление с паролем
      if (password.length < 4) {
        return res.status(400).json({ error: "Пароль должен содержать минимум 4 символа" });
      }
      query = `
        UPDATE "Enforce".users 
        SET full_name = $1, login = $2, password = $3, role_id = $4, is_active = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING id
      `;
      params = [full_name, login, password, role_id, is_active, id];
    } else {
      // Обновление без пароля
      query = `
        UPDATE "Enforce".users 
        SET full_name = $1, login = $2, role_id = $3, is_active = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING id
      `;
      params = [full_name, login, role_id, is_active, id];
    }

    const { rows } = await pool.query(query, params);

    if (!rows[0]) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Получаем обновленные данные с названием роли
    const { rows: userWithRole } = await pool.query(
      `
      SELECT 
        u.id, u.full_name, u.login, u.role_id,
        r.name as role_name,
        u.is_active, u.created_at, u.updated_at
      FROM "Enforce".users u
      LEFT JOIN "Enforce".user_roles r ON u.role_id = r.id
      WHERE u.id = $1
    `,
      [id]
    );

    res.json(userWithRole[0]);
  } catch (error) {
    console.error("Ошибка обновления пользователя:", error);
    res.status(500).json({ error: "Не удалось обновить пользователя" });
  }
});

// Удалить пользователя
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query('DELETE FROM "Enforce".users WHERE id = $1 RETURNING id', [id]);

    if (!rows[0]) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json({ message: "Пользователь удален", id: rows[0].id });
  } catch (error) {
    console.error("Ошибка удаления пользователя:", error);
    res.status(500).json({ error: "Не удалось удалить пользователя" });
  }
});

module.exports = router;
