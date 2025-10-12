// Конфигурация для отправки форм
const FORM_CONFIG = {
    // Получите ваш Access Key на https://web3forms.com
    accessKey: 'YOUR_ACCESS_KEY_HERE', // ⚠️ ЗАМЕНИТЕ НА ВАШ КЛЮЧ!
    successMessage: 'Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.',
    errorMessage: 'Произошла ошибка при отправке. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.'
};

// Функция отправки формы
async function submitForm(formData) {
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: FORM_CONFIG.accessKey,
                ...formData
            })
        });

        const result = await response.json();
        
        if (result.success) {
            return { success: true, message: FORM_CONFIG.successMessage };
        } else {
            return { success: false, message: FORM_CONFIG.errorMessage };
        }
    } catch (error) {
        console.error('Ошибка отправки формы:', error);
        return { success: false, message: FORM_CONFIG.errorMessage };
    }
}

// Показать уведомление
function showNotification(message, type = 'success') {
    // Создаём элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Добавляем в body
    document.body.appendChild(notification);
    
    // Показываем с анимацией
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Инициализация обработчика формы
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Проверяем, что Access Key установлен
            if (FORM_CONFIG.accessKey === 'YOUR_ACCESS_KEY_HERE') {
                showNotification('⚠️ Ошибка: Access Key не настроен! Получите ключ на https://web3forms.com', 'error');
                return;
            }
            
            // Блокируем кнопку отправки
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            
            // Собираем данные формы
            const formData = {
                name: contactForm.querySelector('input[type="text"]').value,
                phone: contactForm.querySelector('input[type="tel"]').value,
                email: contactForm.querySelector('input[type="email"]').value,
                message: contactForm.querySelector('textarea').value,
                // Добавляем дополнительные поля для удобства
                subject: 'Новая заявка с сайта DI Studio',
                from_name: contactForm.querySelector('input[type="text"]').value
            };
            
            // Отправляем форму
            const result = await submitForm(formData);
            
            // Показываем уведомление
            showNotification(result.message, result.success ? 'success' : 'error');
            
            // Если успешно, очищаем форму
            if (result.success) {
                contactForm.reset();
            }
            
            // Разблокируем кнопку
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
    }
});
