const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const ExcelJS = require("exceljs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || "Loader",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "qwe!76593",
});

app.use(cors());
app.use(express.json());

// Тестовый маршрут
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// Тест подключения к БД
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected!", time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "DB connection failed: " + error.message });
  }
});

// Населенные пункты
app.get("/api/settlements", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".settlements ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/settlements", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO "Enforce".settlements (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Улицы
app.get("/api/streets", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT s.*, st.name as settlement_name FROM "Enforce".streets s JOIN "Enforce".settlements st ON s.settlement_id = st.id ORDER BY st.name, s.name'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Получить список всех типов абонентов */
app.get("/api/abonent-types", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".abonent_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Получить список всех типов статусов */
app.get("/api/statuses", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".statuses ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить список всех МПЭС
app.get("/api/mpes", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enforce".mpes ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить РКЭС по МПЭС
app.get("/api/rkes/by-mpes/:mpesId", async (req, res) => {
  const { mpesId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM "Enforce".rkes WHERE mpes_id = $1 ORDER BY name', [mpesId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить МУ по РКЭС
app.get("/api/master-units/by-rkes/:rkesId", async (req, res) => {
  const { rkesId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM "Enforce".master_units WHERE rkes_id = $1 ORDER BY name', [rkesId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/streets", async (req, res) => {
  const { name, settlement_id } = req.body;
  try {
    const result = await pool.query('INSERT INTO "Enforce".streets (name, settlement_id) VALUES ($1, $2) RETURNING *', [
      name,
      settlement_id,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/streets/by-settlement/:settlementId", async (req, res) => {
  const { settlementId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM "Enforce".streets WHERE settlement_id = $1 ORDER BY name', [
      settlementId,
    ]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Excel генерация
app.post("/api/excel/generate", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
