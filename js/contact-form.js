// ============================================
// ОБРАБОТЧИК ФОРМЫ ОБРАТНОЙ СВЯЗИ
// ============================================

// Открытие формы
function openContactForm() {
    document.getElementById('contactFormWrapper').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Закрытие формы
function closeContactForm() {
    document.getElementById('contactFormWrapper').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Сброс формы
    document.getElementById('contactForm').reset();
    document.getElementById('formSuccess').style.display = 'none';
    document.getElementById('formError').style.display = 'none';
}

// Закрытие при клике вне формы
document.addEventListener('DOMContentLoaded', function() {
    const wrapper = document.getElementById('contactFormWrapper');
    if (wrapper) {
        wrapper.addEventListener('click', function(e) {
            if (e.target === wrapper) {
                closeContactForm();
            }
        });
    }
});

// Обработка отправки формы
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Показываем индикатор загрузки
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    // Собираем данные формы
    const formData = {
        name: form.name.value,
        phone: form.phone.value,
        email: form.email.value || '',
        leadType: form.leadType.value,
        message: form.message.value || '',
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        sessionId: window.DIAnalytics ? window.DIAnalytics.getSessionId() : 'unknown'
    };
    
    try {
        // ВАРИАНТ 1: Отправка на сервер (если есть backend)
        // const response = await fetch('/api/submit-lead', {
        //     method: 'POST',
        //     headers: {'Content-Type': 'application/json'},
        //     body: JSON.stringify(formData)
        // });
        
        // ВАРИАНТ 2: Сохранение в localStorage (временное решение)
        saveLeadLocally(formData);
        
        // Показываем сообщение об успехе
        form.style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
        
        // Отправляем событие в аналитику
        if (window.DIAnalytics) {
            window.DIAnalytics.trackEvent('form_submit', {
                type: formData.leadType,
                page: formData.page
            });
        }
        
        // Закрываем форму через 3 секунды
        setTimeout(() => {
            closeContactForm();
            form.style.display = 'block';
        }, 3000);
        
    } catch (error) {
        console.error('Form submission error:', error);
        
        // Показываем сообщение об ошибке
        form.style.display = 'none';
        document.getElementById('formError').style.display = 'block';
        
        setTimeout(() => {
            form.style.display = 'block';
            document.getElementById('formError').style.display = 'none';
        }, 3000);
        
    } finally {
        // Возвращаем кнопку в исходное состояние
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// Сохранение заявки в localStorage
function saveLeadLocally(formData) {
    const leads = JSON.parse(localStorage.getItem('di_leads') || '[]');
    leads.push(formData);
    localStorage.setItem('di_leads', JSON.stringify(leads));
    
    console.log('Lead saved locally:', formData);
}

// Экспорт заявок (для отладки)
function exportLeads() {
    const leads = JSON.parse(localStorage.getItem('di_leads') || '[]');
    console.log('Total leads:', leads.length);
    console.table(leads);
    return leads;
}

// Очистка заявок
function clearLeads() {
    localStorage.removeItem('di_leads');
    console.log('Leads cleared');
}

// Добавляем функции в глобальную область для отладки
window.DIForms = {
    exportLeads: exportLeads,
    clearLeads: clearLeads,
    openForm: openContactForm
};

console.log('%c DI Studio Contact Form Loaded ', 'background: #2c5530; color: #fff; padding: 5px 10px; border-radius: 3px;');
console.log('Use DIForms.exportLeads() to see saved leads');
