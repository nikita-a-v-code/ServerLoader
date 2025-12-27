const express = require("express");
const pool = require("../../config/database");
const router = express.Router();

const normalizeEmail = (email) => email.trim().toLowerCase();

const setDefaultEmailById = async (id, client) => {
  const db = client || (await pool.connect());
  const shouldRelease = !client;

  await db.query("BEGIN");
  try {
    await db.query('UPDATE "Enforce".settings_emails SET is_default = false');
    await db.query('UPDATE "Enforce".settings_emails SET is_default = true WHERE id = $1', [id]);
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    if (shouldRelease) db.release();
  }
};

const getDefaultEmailFromEmails = async () => {
  const { rows } = await pool.query('SELECT email FROM "Enforce".settings_emails WHERE is_default = true LIMIT 1');
  return rows[0]?.email || null;
};

// Возвращает дефолтный email для форм
router.get("/default-email", async (req, res) => {
  try {
    const fromEmails = await getDefaultEmailFromEmails();
    res.json({ defaultEmail: fromEmails || null });
  } catch (error) {
    console.error("Ошибка чтения default email:", error);
    res.status(500).json({ error: "Не удалось получить дефолтный email" });
  }
});

// Устанавливает дефолтный email для форм
router.post("/default-email", async (req, res) => {
  try {
    const { defaultEmail } = req.body || {};

    if (!defaultEmail || typeof defaultEmail !== "string" || !defaultEmail.includes("@")) {
      return res.status(400).json({ error: "Неверный email" });
    }

    const emailValue = normalizeEmail(defaultEmail);

    // Создаем/обновляем запись в таблице email и ставим её по умолчанию
    const { rows } = await pool.query(
      `INSERT INTO "Enforce".settings_emails (email) VALUES ($1)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [emailValue]
    );

    await setDefaultEmailById(rows[0].id);

    res.json({ defaultEmail: emailValue });
  } catch (error) {
    console.error("Ошибка сохранения default email:", error);
    res.status(500).json({ error: "Не удалось сохранить дефолтный email" });
  }
});

// Список email
router.get("/emails", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, is_default, created_at FROM "Enforce".settings_emails ORDER BY is_default DESC, created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error("Ошибка чтения emails:", error);
    res.status(500).json({ error: "Не удалось получить список email" });
  }
});

// Создать email
router.post("/emails", async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Неверный email" });
    }

    const emailValue = normalizeEmail(email);
    const { rows } = await pool.query(
      `INSERT INTO "Enforce".settings_emails (email) VALUES ($1)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, is_default, created_at`,
      [emailValue]
    );

    const inserted = rows[0];
    const targetId = inserted?.id
      ? inserted.id
      : (await pool.query('SELECT id FROM "Enforce".settings_emails WHERE email = $1', [emailValue])).rows[0]?.id;

    if (!targetId) {
      return res.status(500).json({ error: "Не удалось сохранить email" });
    }

    const hasDefault = await pool.query('SELECT 1 FROM "Enforce".settings_emails WHERE is_default = true LIMIT 1');
    if (!hasDefault.rowCount) {
      await setDefaultEmailById(targetId);
    }

    const { rows: refreshed } = await pool.query(
      'SELECT id, email, is_default, created_at FROM "Enforce".settings_emails WHERE id = $1',
      [targetId]
    );
    res.json(refreshed[0]);
  } catch (error) {
    console.error("Ошибка создания email:", error);
    res.status(500).json({ error: "Не удалось создать email" });
  }
});

// Обновить email
router.put("/emails/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Неверный email" });
    }

    const emailValue = normalizeEmail(email);
    const { rows } = await pool.query(
      `UPDATE "Enforce".settings_emails SET email = $1 WHERE id = $2
       RETURNING id, email, is_default, created_at`,
      [emailValue, id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Email не найден" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Ошибка обновления email:", error);
    res.status(500).json({ error: "Не удалось обновить email" });
  }
});

// Удалить email
router.delete("/emails/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { id } = req.params;

    const { rows: removed } = await client.query(
      'DELETE FROM "Enforce".settings_emails WHERE id = $1 RETURNING id, is_default',
      [id]
    );

    if (!removed[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Email не найден" });
    }

    const wasDefault = removed[0].is_default;

    if (wasDefault) {
      const { rows: fallback } = await client.query(
        'SELECT id FROM "Enforce".settings_emails ORDER BY created_at DESC LIMIT 1'
      );
      if (fallback[0]) {
        await setDefaultEmailById(fallback[0].id, client);
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Email удалён" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Ошибка удаления email:", error);
    res.status(500).json({ error: "Не удалось удалить email" });
  } finally {
    client.release();
  }
});

// Сделать email по умолчанию
router.post("/emails/:id/default", async (req, res) => {
  try {
    const { id } = req.params;
    await setDefaultEmailById(id);
    const { rows } = await pool.query(
      'SELECT id, email, is_default, created_at FROM "Enforce".settings_emails WHERE id = $1',
      [id]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Ошибка установки default email:", error);
    res.status(500).json({ error: "Не удалось установить email по умолчанию" });
  }
});

module.exports = router;
