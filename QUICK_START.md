# ⚡ БЫСТРЫЙ СТАРТ - 30 минут до запуска

## 🎯 Цель: Запустить систему авторизации клиентов

---

## ⏱️ Шаг 1: Firebase (15 минут)

### 1.1 Создайте проект (2 минуты)
1. Откройте https://console.firebase.google.com/
2. Нажмите **"Добавить проект"**
3. Название: `DI Studio Client Portal`
4. Отключите Google Analytics
5. Нажмите **"Создать проект"**

### 1.2 Добавьте веб-приложение (2 минуты)
1. На главной странице проекта нажмите иконку **Web** (`</>`)
2. Nickname: `DI Studio Web`
3. НЕ включайте Firebase Hosting
4. Нажмите **"Зарегистрировать приложение"**
5. **СКОПИРУЙТЕ** конфигурацию (apiKey, authDomain, и т.д.)

### 1.3 Вставьте конфигурацию (1 минута)
1. Откройте файл `js/firebase-config.js`
2. Замените плейсхолдеры на ваши данные:

```javascript
const firebaseConfig = {
    apiKey: "AIza...ваш_ключ",
    authDomain: "di-studio-xxxxx.firebaseapp.com",
    projectId: "di-studio-xxxxx",
    storageBucket: "di-studio-xxxxx.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

3. Сохраните файл

### 1.4 Включите Authentication (2 минуты)
1. В консоли Firebase: **Build → Authentication**
2. Нажмите **"Get Started"**
3. Вкладка **"Sign-in method"**
4. Включите **"Email/Password"**
5. Нажмите **"Enable"** и **"Save"**

### 1.5 Создайте Firestore (3 минуты)
1. В консоли Firebase: **Build → Firestore Database**
2. Нажмите **"Create database"**
3. Выберите **"Start in production mode"**
4. Регион: `europe-west3` (или ближайший)
5. Нажмите **"Enable"**

### 1.6 Настройте правила Firestore (2 минуты)
1. Вкладка **"Rules"**
2. Вставьте эти правила:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{phone} {
      allow read: if request.auth != null && 
                     request.auth.token.email == phone + '@di-studio.local';
      allow write: if false;
      
      match /{subcollection=**} {
        allow read: if request.auth != null && 
                       request.auth.token.email == phone + '@di-studio.local';
        allow write: if false;
      }
    }
  }
}
```

3. Нажмите **"Publish"**

### 1.7 Создайте Storage (3 минуты)
1. В консоли Firebase: **Build → Storage**
2. Нажмите **"Get Started"**
3. Выберите **"Start in production mode"**
4. Нажмите **"Next"** и **"Done"**
5. Вкладка **"Rules"**
6. Вставьте:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /clients/{phone}/{allPaths=**} {
      allow read: if request.auth != null && 
                     request.auth.token.email == phone + '@di-studio.local';
      allow write: if false;
    }
  }
}
```

7. Нажмите **"Publish"**

---

## 👤 Шаг 2: Тестовый клиент (5 минут)

### 2.1 Создайте клиента в Firestore
1. Откройте **Firestore Database**
2. Нажмите **"Start collection"**
3. Collection ID: `clients`
4. Document ID: `79991234567` (номер телефона)
5. Добавьте поля:

```
Field: personalInfo          Type: map
  └─ name                    string: "Тест Тестов"
  └─ phone                   string: "+7 (999) 123-45-67"
  └─ email                   string: "test@mail.com"
  └─ registeredAt            timestamp: [Use current date and time]

Field: hasPassword           boolean: false

Field: project               Type: map
  └─ title                   string: "Тестовая квартира"
  └─ area                    string: "50 м²"
  └─ status                  string: "В работе"
  └─ progress                number: 30
  └─ startDate               string: "2024-10-01"
  └─ deadline                string: "2025-01-15"
  └─ stages                  array:
      └─ [0]                 map:
          └─ name            string: "Обмеры"
          └─ status          string: "completed"
          └─ date            string: "2024-10-05"
      └─ [1]                 map:
          └─ name            string: "Планировка"
          └─ status          string: "in_progress"
          └─ date            null
```

6. Нажмите **"Save"**

---

## 🧪 Шаг 3: Тестирование (5 минут)

### 3.1 Локальный тест
1. Откройте файл `index.html` в браузере
2. Нажмите кнопку **"Войти"** (справа вверху)
3. Введите номер: `+7 (999) 123-45-67`
4. Нажмите **"Продолжить"**
5. Система предложит создать пароль
6. Создайте пароль (минимум 6 символов)
7. Подтвердите пароль
8. Нажмите **"Создать пароль и войти"**
9. Вы попадёте в личный кабинет! ✅

### 3.2 Проверьте разделы
- Откройте каждый раздел меню слева
- Убедитесь, что отображается информация
- Проверьте кнопку "Выход"

---

## 🚀 Шаг 4: Деплой на GitHub (5 минут)

### 4.1 Закоммитьте изменения

```bash
cd /d C:\Users\pa8hka\Desktop\site

git status
git add .
git commit -m "Добавлена система авторизации клиентов"
git push origin main
```

### 4.2 Проверьте на GitHub Pages
1. Откройте https://pasdfghjkl1.github.io/DiDesign/
2. Обновите страницу (Ctrl + F5)
3. Нажмите "Войти"
4. Проверьте, что всё работает

### 4.3 Добавьте домен в Firebase
1. В консоли Firebase: **Build → Authentication → Settings**
2. Раздел **"Authorized domains"**
3. Добавьте: `pasdfghjkl1.github.io`
4. Нажмите **"Add"**

---

## ✅ Готово!

Система авторизации запущена и работает!

---

## 📝 Что дальше?

### Добавьте реального клиента:
1. Создайте документ в Firestore (как в Шаге 2)
2. ID документа = номер телефона клиента (без пробелов)
3. `hasPassword: false`
4. Отправьте клиенту ссылку на сайт и номер телефона

### Загрузите файлы для клиента:
1. Откройте **Storage** в Firebase
2. Создайте папку: `clients/79991234567/renders/`
3. Загрузите изображение
4. Скопируйте **Download URL**
5. В **Firestore** создайте подколлекцию `files` у клиента
6. Добавьте документ с полями:
   - name: "Гостиная v1"
   - type: "render"
   - room: "Гостиная"
   - version: 1
   - url: "скопированный URL"
   - uploadDate: timestamp
   - notes: "Первая версия"

### Создайте админ-панель (опционально):
- Для удобного добавления клиентов
- Для загрузки файлов через интерфейс
- Для управления проектами

---

## 🆘 Проблемы?

### "Ошибка подключения к серверу"
→ Проверьте `firebase-config.js`, правильно ли скопирована конфигурация

### "Номер телефона не найден"
→ Проверьте, что клиент добавлен в Firestore с правильным ID

### "Ошибка авторизации"
→ Проверьте, что Email/Password включен в Authentication

### Файлы не загружаются
→ Проверьте правила безопасности Storage

---

## 📚 Полная документация

- **SETUP_INSTRUCTIONS.md** - Подробная инструкция (400+ строк)
- **CLIENT_AUTH_README.md** - Краткий обзор
- **SYSTEM_MAP.md** - Визуальные схемы системы

---

## ⏱️ Итого времени:

- ✅ Firebase: 15 минут
- ✅ Тестовый клиент: 5 минут
- ✅ Тестирование: 5 минут
- ✅ Деплой: 5 минут

**Всего: 30 минут** ⚡

---

**Статус**: 🟢 Готово к использованию  
**Дата**: 12.10.2025  
**Версия**: 1.0

🎉 **Поздравляем с запуском!**
