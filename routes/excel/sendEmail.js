const express = require("express");
const nodemailer = require("nodemailer");
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

// Импортируем функцию создания Excel из основного модуля
const createExcelWorkbook = require("./excelUtils");

// POST /api/excel/send-email
router.post("/send-email", async (req, res) => {
  try {
    const { data, email } = req.body;

    if (!data || !email) {
      return res.status(400).json({ error: "Данные и email обязательны" });
    }

    // Создаем Excel файл используя существующую логику
    const buffer = await createExcelWorkbook(data);

    // Настраиваем транспортер
    const transporter = createTransporter();

    // Генерируем имя файла
    const fileName = `loader_data_${new Date().toISOString().split("T")[0]}.xlsx`;

    // Отправляем email
    const mailOptions = {
      from: process.env.SMTP_USER || "your-email@gmail.com",
      to: email,
      subject: "Excel файл с данными загрузчика",
      text: "Во вложении находится Excel файл с данными загрузчика.",
      html: `
        <h3>Excel файл с данными загрузчика</h3>
        <p>Во вложении находится Excel файл с данными загрузчика, сгенерированный ${new Date().toLocaleString(
          "ru-RU"
        )}.</p>
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

    res.json({
      success: true,
      message: `Файл успешно отправлен на ${email}`,
      fileName,
    });
  } catch (error) {
    console.error("Ошибка при отправке email:", error);
    res.status(500).json({
      error: "Ошибка при отправке email",
      details: error.message,
    });
  }
});

module.exports = router;
