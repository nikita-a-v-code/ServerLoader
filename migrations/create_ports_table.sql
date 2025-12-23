-- Создание таблицы для хранения портов
CREATE TABLE IF NOT EXISTS ports (
  id SERIAL PRIMARY KEY,
  port_number VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Создание индекса для быстрого поиска максимального номера
CREATE INDEX IF NOT EXISTS idx_ports_number ON ports(port_number);

-- Комментарии к таблице
COMMENT ON TABLE ports IS 'Таблица для хранения использованных номеров портов';
COMMENT ON COLUMN ports.port_number IS 'Номер порта (строка для гибкости)';
COMMENT ON COLUMN ports.description IS 'Описание использования порта';
COMMENT ON COLUMN ports.created_at IS 'Дата создания записи';
