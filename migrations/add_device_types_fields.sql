-- Миграция: добавление полей requests и adv_settings в таблицу device_types
-- Дата: 2026-01-30

-- Добавляем поле для запросов
ALTER TABLE "Enforce".device_types 
ADD COLUMN IF NOT EXISTS requests VARCHAR(500) DEFAULT '';

-- Добавляем поле для дополнительных параметров
ALTER TABLE "Enforce".device_types 
ADD COLUMN IF NOT EXISTS adv_settings VARCHAR(500) DEFAULT '';

-- Комментарии к полям
COMMENT ON COLUMN "Enforce".device_types.requests IS 'Запросы для модели счетчика';
COMMENT ON COLUMN "Enforce".device_types.adv_settings IS 'Дополнительные параметры для модели счетчика';
