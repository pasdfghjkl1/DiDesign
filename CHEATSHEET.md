:
1. Backup Excel файла
2. Анализ статистики
3. Обработка заявок

---

## 📞 ДОКУМЕНТАЦИЯ

```
stats/QUICK_START.md      ← Начни с этого! (5 мин)
stats/README.md           ← Полное руководство
INTEGRATION_GUIDE.html    ← Как интегрировать
CHECKLIST.md              ← Пошаговый план
PROJECT_COMPLETE.md       ← Итоги проекта
```

---

## 🔥 ЧАСТЫЕ КОМАНДЫ

### Тестовая заявка
```bash
python stats/add_lead.py --name "Тест" --phone "+7 111 222-33-44" --email "test@test.com"
```

### Сегодняшняя аналитика
```bash
python stats/add_analytics.py --date "12.10.2025" --visitors 10 --views 50 --avgtime 3
```

### Посмотреть все
```bash
python stats/view_data.py --leads --limit 999
python stats/view_data.py --analytics --limit 999
```

---

## ⚠️ ВАЖНО

- ❌ НЕ открывай Excel при запуске скриптов
- ✅ Делай backup каждую неделю
- ✅ Проверяй заявки каждый день
- ✅ Собирай аналитику каждый вечер

---

## 🚀 БЫСТРЫЙ СТАРТ

```bash
# 1. Тест
python stats/add_lead.py --name "Тест" --phone "+7..." --email "test@test.com"
python stats/view_data.py --leads

# 2. Интеграция
# Добавь в <head>:
<script src="js/analytics.js"></script>
<link rel="stylesheet" href="css/contact-form.css">
<script src="js/contact-form.js"></script>

# 3. Загрузка
git add .
git commit -m "Analytics system"
git push origin main

# 4. Готово! 🎉
```

---

## 💡 ПОЛЕЗНЫЕ ССЫЛКИ

- GitHub: https://github.com/pasdfghjkl1/DiDesign
- Документация: `C:\Users\pa8hka\Desktop\site\stats\`
- Excel: `C:\Users\pa8hka\Desktop\site\stats\Контент план.xlsx`

---

## 🎯 ЦЕЛИ

- 📊 Собирать аналитику каждый день
- 📝 Обрабатывать заявки вовремя
- 💾 Делать backup еженедельно
- 📈 Анализировать конверсию

---

**Создано**: 12.10.2025
**Версия**: 1.0

✅ **ВСЕ ГОТОВО К РАБОТЕ!**
