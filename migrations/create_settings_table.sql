-- Таблица для хранения ключ-значение настроек
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE settings IS 'Произвольные настройки приложения';
COMMENT ON COLUMN settings.key IS 'Ключ настройки (уникальный)';
COMMENT ON COLUMN settings.value IS 'Значение настройки';
COMMENT ON COLUMN settings.updated_at IS 'Дата последнего обновления записи';
