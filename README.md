# ServerLoader Backend

Backend сервер для приложения ImEnforce.

## Установка

```bash
npm install
```

## Настройка

1. Скопируйте `.env` файл и настройте параметры базы данных
2. Убедитесь, что PostgreSQL запущен и база данных создана

## Запуск

```bash
# Разработка
npm run dev

# Продакшн
npm start
```

## API Endpoints

### Населенные пункты
- `GET /api/settlements` - получить все населенные пункты
- `POST /api/settlements` - создать новый населенный пункт
- `GET /api/settlements/:id/streets` - получить улицы населенного пункта

### Улицы
- `GET /api/streets` - получить все улицы
- `POST /api/streets` - создать новую улицу
- `GET /api/streets/by-settlement/:settlementId` - получить улицы по ID населенного пункта

### Excel
- `POST /api/excel/generate` - генерация Excel файла

## Структура проекта

```
ServerLoader/
├── config/          # Конфигурация БД
├── controllers/     # Контроллеры
├── models/          # Модели данных
├── routes/          # Маршруты API
└── server.js        # Основной файл сервера
```