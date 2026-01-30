const ExcelJS = require("exceljs");

// Функция создания Excel файла (вынесена из excel.js для переиспользования)
const createExcelWorkbook = async (data) => {
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
    "", // Номер ТП, опора и мощность
    "",
    "",
    "",
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
    "Номер трансформаторной подстанции",
    "Номер опоры 0,4 кВ",
    "Максимальная мощность, кВт",
    "Номер сим карты (полный)",
    "Номер сим карты (короткий)",
    "Модель счетчика",
    "Кол-во фаз",
    "Заводской номер",
    "Дата поверки",
    "Межповерочный интервал, лет",
    "Дата установки",
    "Номер пломбы на клеммной крышке",
    "Номер пломбы на корпусе счетчика",
    "Номер коммуникатора (для счетчиков РиМ)",
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
    "IP адрес",
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
  worksheet.mergeCells("U1:Y1"); // ТП опора и мощность
  worksheet.mergeCells("Z1:AH1"); // Прибор учета
  worksheet.mergeCells("AI1:AV1"); // ТТ
  worksheet.mergeCells("AW1:BJ1"); // ТН
  worksheet.mergeCells("BK1:BZ1"); // Соединение

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
  worksheet.getCell("Z1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.device } };
  worksheet.getCell("AI1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.tt } };
  worksheet.getCell("AW1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.tn } };
  worksheet.getCell("BK1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.connection } };

  /* Стилизуем заголовки с соответствующими цветами разделов */
  const headerRow = worksheet.getRow(2);
  headerRow.font = { name: "Times New Roman", bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  /* Применяем цвета к заголовкам по группам */
  for (let col = 1; col <= headers.length; col++) {
    let color = "FFE0E0E0"; // Цвет по умолчанию

    if (col >= 1 && col <= 4)
      color = colors.structure; // Организация и Структура
    else if (col >= 5 && col <= 10)
      color = colors.address; // Адрес
    else if (col >= 11 && col <= 15)
      color = colors.consumer; // Потребитель
    else if (col >= 16 && col <= 20)
      color = colors.network; // Код сети
    else if (col >= 21 && col <= 25)
      color = colors.support; // Опора и мощность
    else if (col >= 26 && col <= 34)
      color = colors.device; // Прибор учета
    else if (col >= 35 && col <= 48)
      color = colors.tt; // ТТ
    else if (col >= 49 && col <= 62)
      color = colors.tn; // ТН
    else if (col >= 63) color = colors.connection; // Соединение
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

  // Маппинг русских заголовков на английские ключи
  const headerToApiKey = {
    Организация: "organization",
    "Подразделение (МПЭС)": "mpes",
    РКЭС: "rkes",
    "Мастерский участок": "masterUnit",
    "Населенный пункт": "settlement",
    "Микрорайон/квартал": "microdistrict",
    Улица: "street",
    Дом: "house",
    "Корпус (литера)": "building",
    "Квартира (офис)": "apartment",
    "Наименование потребителя": "consumerName",
    "Наименование точки поставки": "deliveryPoint",
    "Тип абонента": "subscriberType",
    "Статус счета": "accountStatus",
    "Номер договора (лицевой счет)": "contractNumber",
    "Код ПС ((220)110/35-10(6)кВ": "psCode",
    "Номер фидера 10(6)(3) кВ": "feederCode",
    "Номер ТП 10(6)/0,4 кВ": "tpCode",
    "Номер фидера 0,4 кВ": "feeder04Code",
    "Код потребителя 3х-значный": "consumerCode",
    "Номер трансформаторной подстанции": "transformerSubstationNumber",
    "Номер опоры 0,4 кВ": "numberSupport04",
    "Максимальная мощность, кВт": "maxPower",
    "Номер сим карты (полный)": "simCardFull",
    "Номер сим карты (короткий)": "simCardShort",
    "Модель счетчика": "deviceModel",
    "Кол-во фаз": "numberPhases",
    "Заводской номер": "serialNumber",
    "Дата поверки": "verificationDate",
    "Межповерочный интервал, лет": "verificationInterval",
    "Дата установки": "dateInstallation",
    "Номер пломбы на клеммной крышке": "numberTerminal",
    "Номер пломбы на корпусе счетчика": "numberCasing",
    "Номер коммуникатора (для счетчиков РиМ)": "communicatorNumber",
    "Тип ТТ": "ttType",
    'Заводской номер ТТ "А"': "ttSerialA",
    'Заводской номер ТТ "В"': "ttSerialB",
    'Заводской номер ТТ "С"': "ttSerialC",
    'Дата поверки ТТ "А"': "ttDateA",
    'Дата поверки ТТ "В"': "ttDateB",
    'Дата поверки ТТ "С"': "ttDateC",
    "Коэффициент трансформации ТТ": "ttCoeff",
    '№ пломбы ТТ "А"': "ttSealA",
    '№ пломбы ТТ "В"': "ttSealB",
    '№ пломбы ТТ "С"': "ttSealC",
    "Тип ТН": "tnType",
    'Заводской номер ТН "А"': "tnSerialA",
    'Заводской номер ТН "В"': "tnSerialB",
    'Заводской номер ТН "С"': "tnSerialC",
    'Дата поверки ТН "А"': "tnDateA",
    'Дата поверки ТН "В"': "tnDateB",
    'Дата поверки ТН "С"': "tnDateC",
    "Коэффициент трансформации ТН": "tnCoeff",
    '№ пломбы ТН "А"': "tnSealA",
    '№ пломбы ТН "В"': "tnSealB",
    '№ пломбы ТН "С"': "tnSealC",
    Примечание: "note",
    "Сетевой адрес": "networkAddress",
    "IP адрес": "ipAddress",
    "Пароль на конфигурирование": "password",
    "Дополнительные параметры счетчика": "advSettings",
    "Номера ком портов (указываем через запятую пример 3,4,5)": "comPorts",
    Порт: "port",
    "Наименование соединения": "nameConnection",
    "Коэффициент (итоговый)": "finalCoeff",
    Запросы: "requests",
    Протокол: "protocol",
    "Наименование УСПД": "nameUSPD",
    "Тип УСПД": "typeUSPD",
    "Серийный номер УСПД": "numberUSPD",
    "Пользователь УСПД": "userUSPD",
    "Пароль УСПД": "passwordUSPD",
  };

  // Функция нормализации данных - преобразует русские заголовки в английские ключи
  const normalizeItem = (item) => {
    // Если объект уже содержит английские ключи (например, mpes), возвращаем как есть
    if (item.mpes !== undefined || item.deviceModel !== undefined) {
      return item;
    }

    // Преобразуем русские заголовки в английские ключи
    const normalized = {};
    Object.keys(item).forEach((key) => {
      const apiKey = headerToApiKey[key];
      if (apiKey) {
        normalized[apiKey] = item[key];
      } else {
        // Если ключ не найден в маппинге, оставляем как есть
        normalized[key] = item[key];
      }
    });

    return normalized;
  };

  /* Добавляем данные */
  data.forEach((item, index) => {
    // Нормализуем данные - преобразуем русские заголовки в английские ключи, если нужно
    const normalizedItem = normalizeItem(item);

    /* Разделяем код сети на 5 частей */
    const networkCodeParts = (normalizedItem.networkCode || "").split("-");
    const [psCode, feederCode, tpCode, feeder04Code, consumerCode] = [
      networkCodeParts[0] || "",
      networkCodeParts[1] || "",
      networkCodeParts[2] || "",
      networkCodeParts[3] || "",
      networkCodeParts[4] || "",
    ];

    const row = [
      'ОАО "Коммунэнерго"',
      normalizedItem.mpes || "",
      normalizedItem.rkes || "",
      normalizedItem.masterUnit || "",
      normalizedItem.settlement || "",
      normalizedItem.microdistrict || "",
      normalizedItem.street || "",
      normalizedItem.house || "",
      normalizedItem.building || "",
      normalizedItem.apartment ? `, ${normalizedItem.apartment}` : "",
      normalizedItem.consumerName || "",
      normalizedItem.deliveryPoint || "",
      normalizedItem.subscriberType || "",
      normalizedItem.accountStatus || "",
      normalizedItem.contractNumber || "",
      psCode,
      feederCode,
      tpCode,
      feeder04Code,
      consumerCode,
      normalizedItem.transformerSubstationNumber || "",
      normalizedItem.numberSupport04 || "",
      normalizedItem.maxPower || "",
      normalizedItem.simCardFull || "",
      normalizedItem.simCardShort || "",
      normalizedItem.deviceModel || "",
      normalizedItem.numberPhases || "",
      normalizedItem.serialNumber || "",
      normalizedItem.verificationDate || "",
      normalizedItem.verificationInterval || "",
      normalizedItem.dateInstallation || "",
      normalizedItem.numberTerminal || "",
      normalizedItem.numberCasing || "",
      normalizedItem.communicatorNumber || "",
      normalizedItem.ttType || "",
      normalizedItem.ttSerialA || "",
      normalizedItem.ttSerialB || "",
      normalizedItem.ttSerialC || "",
      normalizedItem.ttDateA || "",
      normalizedItem.ttIntervalA || "",
      normalizedItem.ttDateB || "",
      normalizedItem.ttIntervalB || "",
      normalizedItem.ttDateC || "",
      normalizedItem.ttIntervalC || "",
      normalizedItem.ttCoeff || "1",
      normalizedItem.ttSealA || "",
      normalizedItem.ttSealB || "",
      normalizedItem.ttSealC || "",
      normalizedItem.tnType || "",
      normalizedItem.tnSerialA || "",
      normalizedItem.tnSerialB || "",
      normalizedItem.tnSerialC || "",
      normalizedItem.tnDateA || "",
      normalizedItem.tnIntervalA || "",
      normalizedItem.tnDateB || "",
      normalizedItem.tnIntervalB || "",
      normalizedItem.tnDateC || "",
      normalizedItem.tnIntervalC || "",
      normalizedItem.tnCoeff || "1",
      normalizedItem.tnSealA || "",
      normalizedItem.tnSealB || "",
      normalizedItem.tnSealC || "",
      normalizedItem.note || "",
      normalizedItem.networkAddress || "",
      normalizedItem.ipAddress || "",
      normalizedItem.password || "",
      normalizedItem.advSettings || "",
      normalizedItem.comPorts || "",
      normalizedItem.port || "",
      normalizedItem.nameConnection || "",
      normalizedItem.finalCoeff || "",
      normalizedItem.requests || "",
      normalizedItem.protocol || "",
      normalizedItem.nameUSPD || "",
      normalizedItem.typeUSPD || "",
      normalizedItem.numberUSPD || "",
      normalizedItem.userUSPD || "",
      normalizedItem.passwordUSPD || "",
    ];

    const addedRow = worksheet.addRow(row);
    for (let col = 1; col <= totalCols; col++) {
      const cell = addedRow.getCell(col);
      cell.border = borderStyle;
      cell.alignment = { horizontal: "left", vertical: "middle" };
      cell.font = { name: "Times New Roman" };
    }
  });

  return workbook.xlsx.writeBuffer();
};

module.exports = createExcelWorkbook;
