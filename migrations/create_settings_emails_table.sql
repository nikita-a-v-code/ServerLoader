-- Таблица email-адресов с отметкой по умолчанию
CREATE TABLE IF NOT EXISTS settings_emails (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE settings_emails IS 'Email-адреса для отправки отчетов';
COMMENT ON COLUMN settings_emails.email IS 'Email адрес';
COMMENT ON COLUMN settings_emails.is_default IS 'Флаг, что адрес выбран по умолчанию';
COMMENT ON COLUMN settings_emails.created_at IS 'Дата добавления записи';
