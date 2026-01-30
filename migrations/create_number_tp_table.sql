-- Создание таблицы для хранения номеров трансформаторных подстанций (ТП)
CREATE TABLE IF NOT EXISTS "Enforce".number_tp (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Создание индекса для быстрого поиска по имени
CREATE INDEX IF NOT EXISTS idx_number_tp_name ON "Enforce".number_tp(name);

-- Комментарии к таблице
COMMENT ON TABLE "Enforce".number_tp IS 'Таблица для хранения номеров трансформаторных подстанций';
COMMENT ON COLUMN "Enforce".number_tp.name IS 'Номер ТП (например: ТП-146, КТП-102, ТП-85)';
COMMENT ON COLUMN "Enforce".number_tp.created_at IS 'Дата создания записи';

-- Вставка начальных данных
INSERT INTO "Enforce".number_tp (name) VALUES 
  ('ТП-146'),
  ('КТП-102'),
  ('ТП-85')
ON CONFLICT (name) DO NOTHING;
