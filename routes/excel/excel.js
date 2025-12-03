const express = require("express");
const ExcelJS = require("exceljs");
const router = express.Router();

/* Выгрузка данных в Excel */
router.post("/export", async (req, res) => {
  try {
    const { data } = req.body;

    /* Создаем новую книгу Excel */
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Данные загрузчика");

    /* Определяем заголовки разделов */
    const groupHeaders = [
      "Организация", // Организация
      "Структура организации", // Подразделение, РКЭС, Мастерский участок
      "",
      "",
      "Адрес", // Населенный пункт до Квартиры
      "",
      "",
      "",
      "",
      "",
      "Потребитель", // Наименование потребителя до Номера договора
      "",
      "",
      "",
      "",
      "Код сети 13 знаков (Источник основного питания)", // Код ПС до Максимальной мощности
      "",
      "",
      "",
      "",
      "", // Опора и мощность
      "",
      "Прибор учета", // Модель счетчика до Номера пломбы на корпусе
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Трансформатор тока", // ТТ поля
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Трансформатор напряжения", // ТН поля
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Соединение", // Соединение
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    /* Определяем заголовки колонок */
    const headers = [
      "Организация",
      "Подразделение (МПЭС)",
      "РКЭС",
      "Мастерский участок",
      "Населенный пункт",
      "Микрорайон/квартал",
      "Улица",
      "Дом",
      "Корпус (литера)",
      "Квартира (офис)",
      "Наименование потребителя",
      "Наименование точки поставки",
      "Тип абонента",
      "Статус счета",
      "Номер договора (лицевой счет)",
      "Код ПС ((220)110/35-10(6)кВ",
      "Номер фидера 10(6)(3) кВ",
      "Номер ТП 10(6)/0,4 кВ",
      "Номер фидера 0,4 кВ",
      "Код потребителя 3х-значный",
      "Номер опоры 0,4 кВ",
      "Максимальная мощность, кВт",
      "Модель счетчика",
      "Кол-во фаз",
      "Заводской номер",
      "Дата поверки",
      "Межповерочный интервал, лет",
      "Дата установки",
      "Номер пломбы на клеммной крышке",
      "Номер пломбы на корпусе счетчика",
      "Тип ТТ",
      'Заводской номер ТТ "А"',
      'Заводской номер ТТ "В"',
      'Заводской номер ТТ "С"',
      'Дата поверки ТТ "А"',
      "Межповерочный интервал, лет",
      'Дата поверки ТТ "В"',
      "Межповерочный интервал, лет",
      'Дата поверки ТТ "С"',
      "Межповерочный интервал, лет",
      "Коэффициент трансформации ТТ",
      '№ пломбы ТТ "А"',
      '№ пломбы ТТ "В"',
      '№ пломбы ТТ "С"',
      "Тип ТН",
      'Заводской номер ТН "А"',
      'Заводской номер ТН "В"',
      'Заводской номер ТН "С"',
      'Дата поверки ТН "А"',
      "Межповерочный интервал, лет",
      'Дата поверки ТН "В"',
      "Межповерочный интервал, лет",
      'Дата поверки ТН "С"',
      "Межповерочный интервал, лет",
      "Коэффициент трансформации ТН",
      '№ пломбы ТН "А"',
      '№ пломбы ТН "В"',
      '№ пломбы ТН "С"',
      "Примечание",
      "Сетевой адрес",
      "Номер сим карты (полный)",
      "Номер сим карты (короткий)",
      "IP адрес",
      "Номер коммуникатора (для счетчиков РиМ)",
      "Пароль на конфигурирование",
      "Дополнительные параметры счетчика",
      "Номера ком портов (указываем через запятую пример 3,4,5)",
      "Порт",
      "Наименование соединения",
      "Коэффициент (итоговый)",
      "Запросы",
      "Протокол",
      "Наименование УСПД",
      "Тип УСПД",
      "Серийный номер УСПД",
      "Пользователь УСПД",
      "Пароль УСПД",
    ];
    /* Создаем колонки для разделов */
    worksheet.addRow(groupHeaders);
    /* Создаем колонки для заголовков */
    worksheet.addRow(headers);

    /* Объединяем ячейки для разделов */
    worksheet.mergeCells("A1:A2"); // Организация (объединяем по вертикали)
    worksheet.mergeCells("B1:D1"); // Структура организации
    worksheet.mergeCells("E1:J1"); // Адрес
    worksheet.mergeCells("K1:O1"); // Потребитель
    worksheet.mergeCells("P1:T1"); // Код сети
    worksheet.mergeCells("U1:V1"); // Опора и мощность
    worksheet.mergeCells("W1:AD1"); // Прибор учета
    worksheet.mergeCells("AE1:AR1"); // ТТ
    worksheet.mergeCells("AS1:BF1"); // ТН
    worksheet.mergeCells("BG1:BY1"); // Соединение

    /* Стилизуем разделы разными цветами */
    const groupHeaderRow = worksheet.getRow(1);
    groupHeaderRow.font = { name: "Times New Roman", bold: true, size: 12 };
    groupHeaderRow.alignment = { horizontal: "center", vertical: "middle" };

    /* Цветовая схема для каждого раздела (технические цвета) */
    const colors = {
      structure: "FF87CEEB", // Голубой
      address: "FF98FB98", // Светло-зеленый
      consumer: "FFFFD700", // Золотой
      network: "FFADD8E6", // Светло-бирюзовый
      support: "FFFFA07A", // Светло-лососевый
      device: "FFB0C4DE", // Светло-стальной
      tt: "FF87CEFA", // Небесно-голубой
      tn: "FFF0E68C", // Хаки
      connection: "FFD3D3D3", // Светло-серый
    };

    /* Применяем цвета к разделам */
    worksheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.structure } };
    worksheet.getCell("B1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.structure } };
    worksheet.getCell("E1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.address } };
    worksheet.getCell("K1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.consumer } };
    worksheet.getCell("P1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.network } };
    worksheet.getCell("U1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.support } };
    worksheet.getCell("W1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.device } };
    worksheet.getCell("AE1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.tt } };
    worksheet.getCell("AS1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.tn } };
    worksheet.getCell("BG1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.connection } };

    /* Стилизуем заголовки с соответствующими цветами разделов */
    const headerRow = worksheet.getRow(2);
    headerRow.font = { name: "Times New Roman", bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };

    /* Применяем цвета к заголовкам по группам */
    for (let col = 1; col <= headers.length; col++) {
      let color = "FFE0E0E0"; // Цвет по умолчанию

      if (col >= 1 && col <= 4) color = colors.structure; // Организация и Структура
      else if (col >= 5 && col <= 10) color = colors.address; // Адрес
      else if (col >= 11 && col <= 15) color = colors.consumer; // Потребитель
      else if (col >= 16 && col <= 20) color = colors.network; // Код сети
      else if (col >= 21 && col <= 22) color = colors.support; // Опора и мощность
      else if (col >= 23 && col <= 30) color = colors.device; // Прибор учета
      else if (col >= 31 && col <= 44) color = colors.tt; // ТТ
      else if (col >= 45 && col <= 58) color = colors.tn; // ТН
      else if (col >= 59) color = colors.connection; // Соединение

      worksheet.getCell(2, col).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: color },
      };
    }

    /* Добавляем границы ко всем ячейкам */
    const borderStyle = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    /* Применяем границы, шрифт и выравнивание только к заголовкам */
    const totalCols = headers.length;

    // Применяем стили к заголовкам (строки 1 и 2)
    for (let row = 1; row <= 2; row++) {
      for (let col = 1; col <= totalCols; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = borderStyle;
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
    }

    /* Автоматически подгоняем ширину колонок */
    worksheet.columns.forEach((column, index) => {
      let maxLength = 0;

      // Проверяем длину заголовка
      const headerLength = headers[index] ? headers[index].toString().length : 0;
      if (headerLength > maxLength) {
        maxLength = headerLength;
      }

      // Проверяем длину всех ячеек в колонке
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });

      // Устанавливаем ширину с достаточным запасом для полного отображения
      const width = Math.max(30, maxLength + 5);
      column.width = width;
    });

    /* Добавляем данные */
    data.forEach((item, index) => {
      /* Разделяем код сети на 5 частей */
      const networkCodeParts = (item.networkCode || "").split("-");
      const [psCode, feederCode, tpCode, feeder04Code, consumerCode] = [
        networkCodeParts[0] || "",
        networkCodeParts[1] || "",
        networkCodeParts[2] || "",
        networkCodeParts[3] || "",
        networkCodeParts[4] || "",
      ];

      const row = [
        'ОАО "Коммунэнерго"',
        item.mpes || "",
        item.rkes || "",
        item.masterUnit || "",
        item.settlement || "",
        item.microdistrict || "",
        item.street || "",
        item.house || "",
        item.building || "",
        item.apartment ? `, ${item.apartment}` : "",
        item.consumerName || "",
        item.deliveryPoint || "",
        item.subscriberType || "",
        item.accountStatus || "",
        item.contractNumber || "",
        psCode,
        feederCode,
        tpCode,
        feeder04Code,
        consumerCode,
        item.numberSupport04 || "",
        item.maxPower || "",
        item.deviceModel || "",
        item.numberPhases || "",
        item.serialNumber || "",
        item.verificationDate || "",
        item.verificationInterval || "",
        item.dateInstallation || "",
        item.numberTerminal || "",
        item.numberCasing || "",
        item.ttType || "",
        item.ttSerialA || "",
        item.ttSerialB || "",
        item.ttSerialC || "",
        item.ttDateA || "",
        item.ttIntervalA || "",
        item.ttDateB || "",
        item.ttIntervalB || "",
        item.ttDateC || "",
        item.ttIntervalC || "",
        item.ttCoeff || "1",
        item.ttSealA || "",
        item.ttSealB || "",
        item.ttSealC || "",
        item.tnType || "",
        item.tnSerialA || "",
        item.tnSerialB || "",
        item.tnSerialC || "",
        item.tnDateA || "",
        item.tnIntervalA || "",
        item.tnDateB || "",
        item.tnIntervalB || "",
        item.tnDateC || "",
        item.tnIntervalC || "",
        item.tnCoeff || "1",
        item.tnSealA || "",
        item.tnSealB || "",
        item.tnSealC || "",
        item.note || "",
        item.networkAddress || "",
        item.simCardFull || "",
        item.simCardShort || "",
        item.ipAddress || "",
        item.communicatorNumber || "",
        item.password || "",
        item.advSettings || "",
        item.comPorts || "",
        item.port || "",
        item.nameConnection || "",
        item.finalCoeff || "",
        item.requests || "",
        item.protocol || "",
        item.nameUSPD || "",
        item.typeUSPD || "",
        item.numberUSPD || "",
        item.userUSPD || "",
        item.passwordUSPD || "",
      ];
      const addedRow = worksheet.addRow(row);

      // Применяем границы и стили к добавленной строке с данными
      for (let col = 1; col <= totalCols; col++) {
        const cell = addedRow.getCell(col);
        cell.border = borderStyle;
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.font = { name: "Times New Roman" };
      }
    });

    /* Устанавливаем заголовки ответа */
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="loader_data_${new Date().toISOString().split("T")[0]}.xlsx"`
    );

    /* Отправляем файл */
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error creating Excel file:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
