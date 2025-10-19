", date: null}
      ]
```

### Подколлекция `files`

```
clients/79991234567/files/
  fileId1/
    name: "Гостиная_v2.jpg"
    type: "render" | "drawing" | "document"
    room: "Гостиная"
    version: 2
    uploadDate: timestamp
    url: "https://storage.googleapis.com/..."
    thumbnailUrl: "https://storage.googleapis.com/..."
    notes: "Исправлен цвет стен"
```

### Подколлекция `documents`

```
clients/79991234567/documents/
  docId1/
    type: "invoice" | "contract" | "act"
    number: "СЧ-2024-101"
    date: timestamp
    amount: 150000
    status: "paid" | "pending" | "overdue"
    url: "https://storage.googleapis.com/..."
```

### Поле `specifications` (в основном документе)

```
specifications:
  materials: [
    {name: "Паркет дубовый", article: "PAR-001", qty: 25, price: 3500, link: "https://..."}
  ]
  lighting: [
    {name: "Люстра Crystal", article: "LUX-205", qty: 1, price: 45000, link: "https://..."}
  ]
  furniture: [
    {name: "Диван IKEA KIVIK", article: "KIVIK-3", qty: 1, price: 65000, link: "https://..."}
  ]
```

---

## ➕ Добавление клиентов

### Способ 1: Через консоль Firebase (Рекомендуется для начала)

1. Откройте **Firestore Database** в консоли Firebase
2. Нажмите **"Start collection"**
3. Collection ID: `clients`
4. Document ID: введите номер телефона (например: `79991234567`)
5. Добавьте поля:

```
Field: personalInfo        Type: Map
  └─ name: "Иван Петров"   (string)
  └─ phone: "+7 (999) 123-45-67"  (string)
  └─ email: "ivan@mail.com"  (string)
  └─ registeredAt: (timestamp - нажмите "Use current date and time")

Field: hasPassword         Type: boolean
Value: false               ← ВАЖНО!

Field: project             Type: Map
  └─ title: "Квартира в ЖК Новый"  (string)
  └─ area: "65 м²"  (string)
  └─ status: "В работе"  (string)
  └─ progress: 45  (number)
  └─ startDate: "2024-10-01"  (string)
  └─ deadline: "2025-01-15"  (string)
  └─ stages: (array)
      └─ [0] (map)
          └─ name: "Обмеры" (string)
          └─ status: "completed" (string)
          └─ date: "2024-10-05" (string)
      └─ [1] (map)
          └─ name: "Планировка" (string)
          └─ status: "in_progress" (string)
          └─ date: null
      └─ [2] (map)
          └─ name: "Визуализация" (string)
          └─ status: "pending" (string)
          └─ date: null
```

6. Нажмите **"Save"**

### Способ 2: Через скрипт (для массового добавления)

Создайте файл `add-client.html` в корне проекта:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Добавить клиента</title>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
    <script src="js/firebase-config.js"></script>
</head>
<body>
    <h1>Добавление клиента</h1>
    <button onclick="addTestClient()">Добавить тестового клиента</button>
    
    <script>
        async function addTestClient() {
            const phone = '79991234567';
            
            try {
                await db.collection('clients').doc(phone).set({
                    personalInfo: {
                        name: 'Тестовый Клиент',
                        phone: '+7 (999) 123-45-67',
                        email: 'test@mail.com',
                        registeredAt: firebase.firestore.FieldValue.serverTimestamp()
                    },
                    hasPassword: false,
                    project: {
                        title: 'Квартира 65м²',
                        area: '65 м²',
                        status: 'В работе',
                        progress: 45,
                        startDate: '2024-10-01',
                        deadline: '2025-01-15',
                        stages: [
                            {name: 'Обмеры', status: 'completed', date: '2024-10-05'},
                            {name: 'Планировка', status: 'in_progress', date: null},
                            {name: 'Визуализация', status: 'pending', date: null}
                        ]
                    }
                });
                
                alert('Клиент добавлен! Телефон: +7 (999) 123-45-67');
            } catch (error) {
                alert('Ошибка: ' + error.message);
            }
        }
    </script>
</body>
</html>
```

---

## 📤 Загрузка файлов

### Через консоль Firebase Storage

1. Откройте **Storage** в консоли Firebase
2. Создайте структуру папок: `clients/79991234567/renders/`
3. Загрузите файл (например, `gostinaya_v1.jpg`)
4. Нажмите на файл и скопируйте "Download URL"

### Добавление записи о файле в Firestore

1. Откройте **Firestore Database**
2. Перейдите к документу клиента: `clients/79991234567`
3. Создайте подколлекцию `files`
4. Добавьте документ с автоматическим ID
5. Добавьте поля:

```
name: "Гостиная v1"  (string)
type: "render"  (string)
room: "Гостиная"  (string)
version: 1  (number)
uploadDate: (timestamp - current)
url: "ВАШ_DOWNLOAD_URL"  (string)
notes: "Первая версия рендера"  (string)
```

---

## 🧪 Тестирование

### Шаг 1: Локальное тестирование

1. Откройте `index.html` в браузере
2. Нажмите кнопку "Войти" в правом верхнем углу
3. Введите номер телефона тестового клиента: `+7 (999) 123-45-67`
4. При первом входе создайте пароль (минимум 6 символов)
5. Вы должны попасть в личный кабинет

### Шаг 2: Проверка функционала

- ✅ Отображается имя клиента и название проекта
- ✅ Видна карточка с прогрессом
- ✅ Отображаются файлы (если загружены)
- ✅ Работает навигация по разделам
- ✅ Можно скачать файлы
- ✅ Кнопка "Выход" работает

### Шаг 3: Проверка безопасности

1. Выйдите из системы
2. Попробуйте открыть `client-dashboard.html` напрямую
3. Вас должно перенаправить на страницу входа
4. Попробуйте войти с несуществующим номером
5. Должна показаться ошибка "Номер не найден"

---

## 🚀 Деплой на GitHub Pages

### Шаг 1: Закоммитьте изменения

```bash
cd /d C:\Users\pa8hka\Desktop\site

git add .
git commit -m "Добавлена система авторизации клиентов"
git push origin main
```

### Шаг 2: Проверка на GitHub Pages

1. Откройте ваш сайт: https://pasdfghjkl1.github.io/DiDesign/
2. Нажмите кнопку "Войти"
3. Проверьте, что всё работает

### Шаг 3: Настройка домена Firebase (опционально)

1. В консоли Firebase перейдите в **Build → Authentication → Settings**
2. В разделе "Authorized domains" добавьте:
   - `pasdfghjkl1.github.io`
   - Ваш кастомный домен (если есть)

---

## 🔒 Безопасность

### Важные моменты:

1. **Номера телефонов** - основной идентификатор клиента
2. **hasPassword: false** - обязательно при создании нового клиента
3. **Правила Firestore** - клиент видит только свои данные
4. **Правила Storage** - клиент скачивает только свои файлы
5. **Email формат** - используется `{phone}@di-studio.local`

### Что НЕ нужно делать:

❌ Не храните пароли в Firestore (Firebase Auth делает это автоматически)
❌ Не давайте клиентам права на запись в базу
❌ Не используйте общедоступные правила безопасности
❌ Не храните конфиденциальные данные в открытом виде

---

## 📱 Создание админ-панели (следующий этап)

Для удобного управления клиентами создайте файл `admin-panel.html`:

### Функции админ-панели:
- Добавление новых клиентов
- Загрузка файлов для клиентов
- Обновление прогресса проекта
- Добавление документов и спецификаций
- Управление этапами проекта

**Доступ к админ-панели:**
- Создайте отдельную коллекцию `admins` в Firestore
- Добавьте свой email как администратора
- Проверяйте права доступа при входе в админ-панель

---

## 🐛 Устранение неполадок

### Проблема: "Ошибка подключения к серверу"

**Решение:**
- Проверьте, что Firebase конфигурация скопирована правильно
- Откройте консоль браузера (F12) и проверьте ошибки
- Убедитесь, что включены Authentication и Firestore

### Проблема: "Номер телефона не найден"

**Решение:**
- Проверьте, что клиент добавлен в Firestore
- ID документа должен быть номером без пробелов: `79991234567`
- Поле `hasPassword` должно быть `false` для нового клиента

### Проблема: Файлы не загружаются

**Решение:**
- Проверьте URL файлов в Firestore
- Убедитесь, что файлы загружены в правильную папку Storage
- Проверьте правила безопасности Storage

### Проблема: После входа показывается пустая страница

**Решение:**
- Откройте консоль браузера (F12)
- Проверьте наличие ошибок JavaScript
- Убедитесь, что у клиента есть данные проекта в Firestore

---

## 📊 Мониторинг использования

### Firebase Console - Usage & Billing

Следите за лимитами бесплатного тарифа:
- **Firestore**: 50,000 чтений/день
- **Storage**: 5GB хранилища
- **Authentication**: Неограниченно

При превышении лимитов можно перейти на платный тарифFire Blaze (pay-as-you-go).

---

## 📝 Контрольный чек-лист

### Настройка Firebase:
- [ ] Создан проект Firebase
- [ ] Добавлено веб-приложение
- [ ] Конфигурация вставлена в `firebase-config.js`
- [ ] Включен Email/Password в Authentication
- [ ] Создана Firestore Database
- [ ] Настроены правила безопасности Firestore
- [ ] Создан Cloud Storage
- [ ] Настроены правила безопасности Storage

### Добавление тестового клиента:
- [ ] Создан документ клиента с номером телефона
- [ ] Добавлены personalInfo, project, hasPassword: false
- [ ] (Опционально) Загружены тестовые файлы

### Тестирование:
- [ ] Локально открывается страница входа
- [ ] Создание пароля работает
- [ ] Вход с паролем работает
- [ ] Личный кабинет отображается корректно
- [ ] Выход из системы работает

### Деплой:
- [ ] Изменения закоммичены в Git
- [ ] Изменения отправлены на GitHub
- [ ] Сайт работает на GitHub Pages
- [ ] Домен добавлен в Authorized domains Firebase

---

## 🎉 Готово!

Ваша система авторизации клиентов настроена и готова к работе!

### Следующие шаги:

1. **Создайте админ-панель** для управления клиентами
2. **Добавьте уведомления** по email при загрузке новых файлов
3. **Реализуйте комментарии** к файлам для обратной связи
4. **Добавьте онлайн-оплату** счетов через Stripe/Yookassa

### Полезные ссылки:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)

---

**Версия документа**: 1.0  
**Дата**: 12.10.2025  
**Автор**: DI Studio Development Team

---

## 💡 Дополнительные советы

### Для производства:
1. Настройте email-уведомления через Firebase Functions
2. Добавьте логирование действий клиентов
3. Реализуйте резервное копирование базы данных
4. Настройте мониторинг ошибок (Sentry)
5. Добавьте Google Analytics для отслеживания активности

### Для улучшения UX:
1. Добавьте прогресс-индикатор при загрузке файлов
2. Реализуйте просмотр изображений в модальном окне
3. Добавьте поиск по файлам
4. Реализуйте push-уведомления о новых файлах
5. Добавьте возможность оставлять комментарии

**Удачи в разработке! 🚀**
