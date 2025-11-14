const express = require("express");
const ExcelJS = require("exceljs");
const router = express.Router();

// Генерация Excel файла
router.post("/generate", async (req, res) => {
  try {
    const { data } = req.body;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SectionFilling");

    worksheet.columns = [
      { header: "МПЭС", key: "mpes", width: 20 },
      { header: "РКЭС", key: "rkes", width: 20 },
      { header: "Мастерский участок", key: "masterUnit", width: 25 },
      { header: "Подстанция", key: "substation", width: 30 },
      { header: "Населенный пункт", key: "settlement", width: 25 },
      { header: "Улица", key: "street", width: 25 },
      { header: "Дом", key: "house", width: 10 },
      { header: "Квартира", key: "apartment", width: 10 },
      { header: "Тип абонента", key: "abonentType", width: 15 },
      { header: "Статус", key: "status", width: 15 },
      { header: "Номер точки учета", key: "pointNumber", width: 20 },
      { header: "Тип устройства", key: "deviceType", width: 20 },
      { header: "Серийный номер", key: "serialNumber", width: 15 },
      { header: "IP адрес", key: "ipAddress", width: 15 },
      { header: "Порт", key: "port", width: 10 },
      { header: "Протокол", key: "protocol", width: 10 },
    ];

    data.forEach((item) => worksheet.addRow(item));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=section_filling.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;