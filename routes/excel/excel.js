const express = require("express");
const createExcelWorkbook = require('./excelUtils');
const sendEmailRouter = require('./sendEmail');
const router = express.Router();

/* Выгрузка данных в Excel */
router.post("/export", async (req, res) => {
  try {
    const { data } = req.body;

    /* Создаем Excel файл используя утилиту */
    const buffer = await createExcelWorkbook(data);

    /* Устанавливаем заголовки ответа */
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="loader_data_${new Date().toISOString().split("T")[0]}.xlsx"`
    );

    /* Отправляем файл */
    res.send(buffer);
  } catch (error) {
    console.error("Error creating Excel file:", error);
    res.status(500).json({ error: error.message });
  }
});

// Подключаем роутер для отправки email
router.use('/', sendEmailRouter);

module.exports = router;