const express = require("express");
const nodemailer = require("nodemailer");
const pool = require("../../config/database");
const router = express.Router();

// Настройки SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    // auth: {
    //   user: process.env.SMTP_USER || 'your-email@gmail.com',
    //   pass: process.env.SMTP_PASS || 'your-app-password'
    // }
  });
};

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

// Импортируем функцию создания Excel из основного модуля
const createExcelWorkbook = require("./excelUtils");

// Маппинг типов форм на читаемые названия
const formTypeNames = {
  single_filling: "Заполнение по карточкам",
  section_filling: "Групповое заполнение",
  excel_import: "Валидированный Excel",
  loader: "Загрузчик",
};

// Маппинг типов форм на префиксы файлов
const formTypePrefixes = {
  single_filling: "Заполнение_по_карточкам",
  section_filling: "Групповое_заполнение",
  excel_import: "Валидированный_Excel",
  loader: "loader",
};

// POST /api/excel/send-email
router.post("/send-email", async (req, res) => {
  try {
    const { data, email, userId, formType = "loader" } = req.body;
    const ipAddress = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";

    if (!data || !email) {
      return res.status(400).json({ error: "Данные и email обязательны" });
    }

    // Получаем имя отправителя из базы данных
    const baseEmail = process.env.SMTP_USER || "askue@komenergo.kirov.ru";
    let senderEmail = baseEmail;
    if (userId) {
      try {
        const userResult = await pool.query('SELECT full_name FROM "Enforce".users WHERE id = $1', [userId]);
        if (userResult.rows.length > 0 && userResult.rows[0].full_name) {
          // Формат: "Имя Фамилия <email>"
          senderEmail = `"${userResult.rows[0].full_name}" <${baseEmail}>`;
        }
      } catch (error) {
        console.error("Ошибка получения имени пользователя:", error);
      }
    }

    // Создаем Excel файл используя существующую логику
    const buffer = await createExcelWorkbook(data);

    // Настраиваем транспортер
    const transporter = createTransporter();

    // Генерируем имя файла с учетом типа формы
    const prefix = formTypePrefixes[formType] || "loader";
    const fileName = `${prefix}_data_${new Date().toISOString().split("T")[0]}.xlsx`;

    // Получаем читаемое название формы
    const formName = formTypeNames[formType] || "Загрузчик";

    // Отправляем email
    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: `Excel файл - ${formName}`,
      text: `Во вложении находится Excel файл с данными (${formName}).`,
      html: `
        <h3>Excel файл - ${formName}</h3>
        <p>Во вложении находится Excel файл с данными, сгенерированный ${new Date().toLocaleString("ru-RU")}.</p>
        <p>Форма: <strong>${formName}</strong></p>
        <p>Количество записей: ${data.length}</p>
      `,
      attachments: [
        {
          filename: fileName,
          content: buffer,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Логируем успешную отправку
    await logAction(
      userId || null,
      "send_email",
      "excel",
      null,
      {
        "Отправлен на почту": email,
        "Имя файла": fileName,
        Форма: formName,
        "Количество строк": data.length,
      },
      ipAddress
    );

    res.json({
      success: true,
      message: `Файл успешно отправлен на ${email}`,
      fileName,
    });
  } catch (error) {
    console.error("Ошибка при отправке email:", error);

    // Логируем неудачную попытку отправки
    const { email, userId, data } = req.body;
    const ipAddress = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
    await logAction(
      userId || null,
      "send_email_failed",
      "excel",
      null,
      {
        email,
        error: error.message,
        recordsCount: data?.length || 0,
      },
      ipAddress
    );

    res.status(500).json({
      error: "Ошибка при отправке email",
      details: error.message,
    });
  }
});

module.exports = router;
