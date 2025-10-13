// ============================================
// Конфигурация Firebase
// ============================================
// 
// ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:
// 
// 1. Зайдите на https://console.firebase.google.com/
// 2. Создайте новый проект (название: "DI Studio Client Portal" или любое другое)
// 3. Добавьте веб-приложение (Web App)
// 4. Скопируйте конфигурационные данные сюда
// 5. Включите следующие сервисы в проекте Firebase:
//    - Authentication (Email/Password)
//    - Cloud Firestore Database
//    - Cloud Storage (для загрузки файлов)
//
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyAEaE8Xk-daG4hlqUSPwxRH-VSHNRoktgU",
    authDomain: "di-studio-client-portal.firebaseapp.com",
    projectId: "di-studio-client-portal",
    storageBucket: "di-studio-client-portal.firebasestorage.app",
    messagingSenderId: "276119117705",
    appId: "1:276119117705:web:d8677e8b10ab287434cb58",
    measurementId: "G-7PTYPQ71C1"
};

// Инициализация Firebase
let app, auth, db, storage;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    console.log('✅ Firebase успешно инициализирован');
} catch (error) {
    console.error('❌ Ошибка инициализации Firebase:', error);
    alert('Ошибка подключения к серверу. Пожалуйста, обновите страницу.');
}

// Экспорт для использования в других файлах
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
