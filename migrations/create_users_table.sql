-- Таблица ролей пользователей
CREATE TABLE IF NOT EXISTS "Enforce".user_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE "Enforce".user_roles IS 'Роли пользователей системы';
COMMENT ON COLUMN "Enforce".user_roles.name IS 'Название роли';
COMMENT ON COLUMN "Enforce".user_roles.description IS 'Описание роли';
COMMENT ON COLUMN "Enforce".user_roles.permissions IS 'JSON с правами доступа';

-- Вставка базовых ролей
INSERT INTO "Enforce".user_roles (name, description, permissions) VALUES
  ('admin', 'Администратор', '{"all": true}'),
  ('operator', 'Оператор', '{"view": true, "edit": true, "excel_import": true}'),
  ('viewer', 'Просмотр', '{"view": true}')
ON CONFLICT (name) DO NOTHING;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS "Enforce".users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  login VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES "Enforce".user_roles(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE "Enforce".users IS 'Пользователи системы';
COMMENT ON COLUMN "Enforce".users.full_name IS 'ФИО пользователя';
COMMENT ON COLUMN "Enforce".users.login IS 'Логин для входа';
COMMENT ON COLUMN "Enforce".users.password IS 'Пароль пользователя';
COMMENT ON COLUMN "Enforce".users.role_id IS 'Ссылка на роль пользователя';
COMMENT ON COLUMN "Enforce".users.is_active IS 'Активен ли пользователь';

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_login ON "Enforce".users(login);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON "Enforce".users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON "Enforce".users(is_active);

-- Таблица журнала действий (для будущего использования)
CREATE TABLE IF NOT EXISTS "Enforce".action_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES "Enforce".users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE "Enforce".action_logs IS 'Журнал действий пользователей';
COMMENT ON COLUMN "Enforce".action_logs.user_id IS 'Пользователь, выполнивший действие';
COMMENT ON COLUMN "Enforce".action_logs.action IS 'Тип действия (create, update, delete, login и т.д.)';
COMMENT ON COLUMN "Enforce".action_logs.entity_type IS 'Тип сущности (users, consumers и т.д.)';
COMMENT ON COLUMN "Enforce".action_logs.entity_id IS 'ID сущности';
COMMENT ON COLUMN "Enforce".action_logs.details IS 'Дополнительные данные действия';
COMMENT ON COLUMN "Enforce".action_logs.ip_address IS 'IP адрес пользователя';

-- Индексы для журнала
CREATE INDEX IF NOT EXISTS idx_action_logs_user_id ON "Enforce".action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_created_at ON "Enforce".action_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_action_logs_action ON "Enforce".action_logs(action);
CREATE INDEX IF NOT EXISTS idx_action_logs_entity ON "Enforce".action_logs(entity_type, entity_id);
