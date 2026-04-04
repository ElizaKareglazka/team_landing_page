# X5 Tech — Сайт команды разработки

Одностраничный сайт-визитка команды разработки X5 Tech. Статический сайт без серверной части, все данные хранятся в `data.json`.

## Быстрый старт

1. Клонируйте репозиторий
2. Откройте `index.html` через локальный сервер

```bash
# Любой статический сервер, например:
npx serve .
# или
python3 -m http.server 8000
```

> ⚠️ Открытие `index.html` напрямую через `file://` не сработает — браузер заблокирует `fetch('data.json')` из-за CORS. Используйте локальный сервер.

## Структура проекта

```
├── index.html              — HTML-разметка
├── data.json               — Все данные сайта (команда, проекты, roadmap)
├── SPEC.md                 — Спецификация проекта
├── css/
│   ├── main.css            — Переменные, reset, базовые стили
│   ├── components.css      — Карточки, кнопки, модалки
│   ├── sections.css        — Стили секций (hero, process)
│   ├── roadmap.css         — Диаграмма Ганта
│   └── admin.css           — Админ-панель (v1.1)
├── js/
│   ├── app.js              — Точка входа, загрузка данных
│   ├── render.js           — Рендеринг секций
│   ├── modal.js            — Модальные окна
│   ├── roadmap.js          — Диаграмма Ганта
│   ├── admin.js            — Админ-режим (v1.1)
│   └── utils.js            — Утилиты (scroll, аватары, иконки)
└── assets/
    ├── photos/             — Фото сотрудников
    ├── projects/           — Обложки проектов
    └── logo/               — Логотип
```

## Редактирование данных

Все данные сайта находятся в `data.json`. Для обновления:

1. Отредактируйте `data.json`
2. Закоммитьте изменения
3. GitHub Pages обновится автоматически

### Добавление сотрудника

1. Положите фото в `assets/photos/` (квадрат, ~200×200px)
2. Добавьте объект в массив `team` в `data.json`:

```json
{
  "name": "Имя Фамилия",
  "role": "Должность",
  "photo": "assets/photos/filename.jpg",
  "bio": "Описание",
  "skills": ["Навык 1", "Навык 2"],
  "contacts": [
    { "type": "email", "value": "email@x5.tech" },
    { "type": "telegram", "value": "@username" }
  ]
}
```

### Добавление проекта

1. (Опционально) положите обложку в `assets/projects/` (16:9, ~640×360px)
2. Добавьте объект в массив `projects` в `data.json`

### Обновление Roadmap

Добавьте/измените объекты в массив `roadmap`. Статусы: `planned`, `in_progress`, `done`.

## Деплой на GitHub Pages

1. Зайдите в Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main`, folder: `/ (root)`
4. Сайт будет доступен по адресу `https://<username>.github.io/<repo>/`

## Технологии

- HTML5, CSS3, JavaScript (vanilla)
- Шрифты: [Manrope](https://fonts.google.com/specimen/Manrope), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- Без зависимостей, сборщиков и npm

## Лицензия

Внутренний проект X5 Tech.
