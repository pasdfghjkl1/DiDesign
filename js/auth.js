// ============================================
// Логика авторизации клиентов
// ============================================

// Ждем загрузки Firebase
if (typeof firebase === 'undefined') {
    console.error('Firebase не загружен!');
    alert('Ошибка загрузки Firebase. Обновите страницу.');
}

// Текущий номер телефона (глобальная переменная)
let currentPhone = '';

// ============================================
// Инициализация после загрузки DOM
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Получаем все необходимые элементы формы
    const phoneStep = document.getElementById('phoneStep');
    const createPasswordStep = document.getElementById('createPasswordStep');
    const loginStep = document.getElementById('loginStep');

    const phoneInput = document.getElementById('phoneInput');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordInput = document.getElementById('password');

    const checkPhoneBtn = document.getElementById('checkPhoneBtn');
    const createPasswordBtn = document.getElementById('createPasswordBtn');
    const loginBtn = document.getElementById('loginBtn');

    // ============================================
    // Шаг 1: Проверка номера телефона
    // ============================================
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await checkPhone();
    });

    checkPhoneBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await checkPhone();
    });

    async function checkPhone() {
        const phone = phoneInput.value.replace(/\D/g, '');
        
        // Валидация номера
        if (phone.length !== 11) {
            showAlert('error', 'Пожалуйста, введите корректный номер телефона');
            return;
        }

        currentPhone = phone;
        
        // Показать загрузку
        setLoading(checkPhoneBtn, true);
        hideAllAlerts();

        try {
            // Проверяем, есть ли клиент с таким номером в базе
            const clientDoc = await window.firebaseDb.collection('clients').doc(phone).get();
            
            if (clientDoc.exists) {
                const clientData = clientDoc.data();
                
                // Проверяем, есть ли у клиента пароль
                if (clientData.hasPassword) {
                    // Клиент уже зарегистрирован - показываем форму входа
                    showLoginStep();
                } else {
                    // Клиент в базе, но пароль не создан - показываем форму создания пароля
                    showCreatePasswordStep();
                }
            } else {
                // Клиента нет в базе
                showAlert('error', 'Ваш номер телефона не найден в системе. Пожалуйста, свяжитесь с нами для получения доступа.');
            }
        } catch (error) {
            console.error('Ошибка проверки телефона:', error);
            showAlert('error', 'Произошла ошибка. Попробуйте позже.');
        } finally {
            setLoading(checkPhoneBtn, false);
        }
    }

    // ============================================
    // Шаг 2: Создание пароля (первый вход)
    // ============================================
    createPasswordBtn.addEventListener('click', async () => {
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Валидация
        if (password.length < 6) {
            showAlert('error', 'Пароль должен содержать минимум 6 символов');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('error', 'Пароли не совпадают');
            return;
        }

        setLoading(createPasswordBtn, true);
        hideAllAlerts();

        try {
            // Создаем email из номера телефона (для Firebase Authentication)
            const email = `${currentPhone}@di-studio.local`;
            
            // Создаем пользователя в Firebase Auth
            const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
            
            // Проверяем, является ли пользователь администратором
            const clientDoc = await window.firebaseDb.collection('clients').doc(currentPhone).get();
            const clientData = clientDoc.data();
            const isAdmin = clientData?.isAdmin || false;
            
            // Отладка
            console.log('📋 Данные клиента:', clientData);
            console.log('🔑 isAdmin:', isAdmin);
            console.log('📞 Телефон:', currentPhone);
            
            // Обновляем данные в Firestore
            await window.firebaseDb.collection('clients').doc(currentPhone).update({
                hasPassword: true,
                email: email,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            showAlert('success', 'Пароль успешно создан! Перенаправление...');
            
            // Перенаправляем в соответствующую панель через 2 секунды
            setTimeout(() => {
                console.log('🚀 Перенаправление... isAdmin =', isAdmin);
                if (isAdmin === true) {
                    console.log('➡️ Переход в админ-панель');
                    window.location.href = 'admin-dashboard.html';
                } else {
                    console.log('➡️ Переход в личный кабинет');
                    window.location.href = 'client-dashboard.html';
                }
            }, 2000);

        } catch (error) {
            console.error('Ошибка создания пароля:', error);
            
            if (error.code === 'auth/email-already-in-use') {
                showAlert('error', 'Этот аккаунт уже зарегистрирован. Попробуйте войти.');
                showLoginStep();
            } else {
                showAlert('error', 'Произошла ошибка при создании пароля. Попробуйте позже.');
            }
        } finally {
            setLoading(createPasswordBtn, false);
        }
    });

    // ============================================
    // Шаг 3: Вход с паролем
    // ============================================
    loginBtn.addEventListener('click', async () => {
        const password = passwordInput.value;

        if (!password) {
            showAlert('error', 'Пожалуйста, введите пароль');
            return;
        }

        setLoading(loginBtn, true);
        hideAllAlerts();

        try {
            // Создаем email из номера телефона
            const email = `${currentPhone}@di-studio.local`;
            
            // Вход через Firebase Auth
            const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
            
            // Проверяем, является ли пользователь администратором
            const clientDoc = await window.firebaseDb.collection('clients').doc(currentPhone).get();
            const clientData = clientDoc.data();
            const isAdmin = clientData?.isAdmin || false;
            
            // Отладка
            console.log('📋 Данные клиента при входе:', clientData);
            console.log('🔑 isAdmin при входе:', isAdmin);
            console.log('📞 Телефон при входе:', currentPhone);
            
            // Обновляем время последнего входа
            await window.firebaseDb.collection('clients').doc(currentPhone).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            showAlert('success', 'Вход выполнен успешно! Перенаправление...');
            
            // Перенаправляем в соответствующую панель
            setTimeout(() => {
                console.log('🚀 Перенаправление при входе... isAdmin =', isAdmin);
                if (isAdmin === true) {
                    console.log('➡️ Переход в админ-панель (вход)');
                    window.location.href = 'admin-dashboard.html';
                } else {
                    console.log('➡️ Переход в личный кабинет (вход)');
                    window.location.href = 'client-dashboard.html';
                }
            }, 1500);

        } catch (error) {
            console.error('Ошибка входа:', error);
            
            if (error.code === 'auth/wrong-password') {
                showAlert('error', 'Неверный пароль');
            } else if (error.code === 'auth/user-not-found') {
                showAlert('error', 'Пользователь не найден');
            } else if (error.code === 'auth/too-many-requests') {
                showAlert('error', 'Слишком много попыток входа. Попробуйте позже.');
            } else {
                showAlert('error', 'Произошла ошибка при входе. Попробуйте позже.');
            }
        } finally {
            setLoading(loginBtn, false);
        }
    });

    // ============================================
    // Вспомогательные функции (внутри DOMContentLoaded)
    // ============================================
    function showCreatePasswordStep() {
        phoneStep.style.display = 'none';
        createPasswordStep.style.display = 'block';
        loginStep.style.display = 'none';
        
        document.getElementById('formTitle').textContent = 'Создание пароля';
        document.getElementById('formSubtitle').textContent = 'Создайте пароль для доступа к вашему проекту';
        
        showAlert('info', 'Добро пожаловать! Создайте пароль для безопасного доступа.');
    }

    function showLoginStep() {
        phoneStep.style.display = 'none';
        createPasswordStep.style.display = 'none';
        loginStep.style.display = 'block';
        
        document.getElementById('formTitle').textContent = 'Вход в систему';
        document.getElementById('formSubtitle').textContent = 'Введите ваш пароль';
    }

    function setLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    function showAlert(type, message) {
        hideAllAlerts();
        
        const alertElement = document.getElementById(`${type}Alert`);
        if (alertElement) {
            alertElement.textContent = message;
            alertElement.style.display = 'block';
        }
    }

    function hideAllAlerts() {
        const errorAlert = document.getElementById('errorAlert');
        const successAlert = document.getElementById('successAlert');
        const infoAlert = document.getElementById('infoAlert');
        
        if (errorAlert) errorAlert.style.display = 'none';
        if (successAlert) successAlert.style.display = 'none';
        if (infoAlert) infoAlert.style.display = 'none';
    }

    // Делаем функцию backToPhone доступной для HTML
    window.backToPhone = function() {
        phoneStep.style.display = 'block';
        createPasswordStep.style.display = 'none';
        loginStep.style.display = 'none';
        
        document.getElementById('formTitle').textContent = 'Вход для клиентов';
        document.getElementById('formSubtitle').textContent = 'Введите ваш номер телефона для входа';
        
        hideAllAlerts();
        
        // Очищаем поля пароля
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
        if (passwordInput) passwordInput.value = '';
    };

    // Делаем функцию togglePassword доступной для HTML
    window.togglePassword = function(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const button = input.parentElement.querySelector('.toggle-password');
        if (!button) return;
        
        const icon = button.querySelector('i');
        if (!icon) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };

}); // Конец DOMContentLoaded

// ============================================
// Проверка авторизации (вне DOMContentLoaded)
// ============================================
if (window.firebaseAuth) {
    window.firebaseAuth.onAuthStateChanged((user) => {
        if (user && window.location.pathname.includes('client-login.html')) {
            // Пользователь уже авторизован, перенаправляем в кабинет
            window.location.href = 'client-dashboard.html';
        }
    });
}
