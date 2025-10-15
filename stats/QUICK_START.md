# ⚡ БЫСТРЫЙ СТАРТ - СИСТЕМА АНАЛИТИКИ DI STUDIO

## 🚀 За 5 минут

### 1. Проверка текущего состояния

```bash
# Просмотр заявок
python stats/view_data.py --leads --limit 5

# Просмотр аналитики
python stats/view_data.py --analytics --limit 7
```

---

### 2. Добавление тестовой заявки

```bash
python stats/add_lead.py \
    --name "Тест" \
    --phone "+7 999 000-00-00" \
    --email "test@test.com" \
    --type "Консультация" \
    --message "Тестовое сообщение"
```

---

### 3. Добавление аналитики за сегодня

```bash
python stats/add_analytics.py \
    --date "12.10.2025" \
    --visitors 10 \
    --views 50 \
    --avgtime 3 \
    --home 10 \
    --portfolio 15 \
    --services 10 \
    --drawings 8 \
    --about 7
```

---

### 4. Интеграция на сайт

**Шаг 1:** Добавить в `<head>` всех страниц:

```html
<script src="js/analytics.js"></script>
<link rel="stylesheet" href="css/contact-form.css">
<script src="js/contact-form.js"></script>
```

**Шаг 2:** Скопировать содержимое `contact-form.html` перед `</body>`

**Шаг 3:** Добавить кнопку где угодно:

```html
<button onclick="openContactForm()">Оставить заявку</button>
```

---

## 📊 Основные команды

### Работа с заявками

```bash
# Добавить заявку
python stats/add_lead.py --name "Имя" --phone "+7..." --email "email@..."

# Посмотреть последние 10 заявок
python stats/view_data.py --leads --limit 10

# Посмотреть все заявки
python stats/view_data.py --leads --limit 999
```

### Работа с аналитикой

```bash
# Добавить данные за день
python stats/add_analytics.py --date "12.10.2025" --visitors 25 --views 100 --avgtime 5

# Посмотреть последнюю неделю
python stats/view_data.py --analytics --limit 7

# Посмотреть весь месяц
python stats/view_data.py --analytics --limit 30
```

---

## 🔧 Отладка

### Проверить localStorage в браузере

Откройте консоль (F12) и выполните:

```javascript
// Посмотреть все заявки
DIForms.exportLeads()

// Очистить заявки
DIForms.clearLeads()

// Открыть форму
DIForms.openForm()

// Проверить ID сессии аналитики
DIAnalytics.getSessionId()
```

---

## 📂 Важные файлы

```
stats/
├── Контент план.xlsx          ← ОСНОВНОЙ ФАЙЛ
├── add_lead.py                ← Добавить заявку
├── add_analytics.py           ← Добавить аналитику
├── view_data.py               ← Посмотреть данные
└── README.md                  ← Полная документация

js/
├── analytics.js               ← Трекер (подключить на сайт)
└── contact-form.js            ← Форма (подключить на сайт)

css/
└── contact-form.css           ← Стили (подключить на сайт)
```

---

## ⚠️ Частые проблемы

### Excel файл не обновляется
- Закройте Excel перед запуском скриптов
- Проверьте права доступа к файлу

### Форма не открывается
- Проверьте что все JS файлы подключены
- Откройте консоль (F12) и посмотрите ошибки

### Кириллица в консоли Windows
- Это нормально для PowerShell
- Данные в Excel сохраняются правильно

---

## 💡 Советы

1. **Делайте backup** Excel файла каждую неделю
2. **Проверяйте заявки** минимум раз в день
3. **Собирайте аналитику** в конце каждого дня
4. **Используйте фильтры** в Excel для анализа

---

## 📞 Помощь

- **Полная документация**: `stats/README.md`
- **Итоговый отчет**: `stats/FINAL_REPORT.md`
- **GitHub**: https://github.com/pasdfghjkl1/DiDesign

---

**Версия**: 1.0
**Создано**: 12.10.2025
