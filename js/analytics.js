// ============================================
// СИСТЕМА АНАЛИТИКИ ДЛЯ САЙТА DI STUDIO
// ============================================

(function() {
    'use strict';
    
    // Конфигурация
    const CONFIG = {
        apiEndpoint: '/api/analytics', // Эндпоинт для отправки данных
        sessionKey: 'di_session_' + Date.now(),
        storagePrefix: 'di_analytics_'
    };
    
    // Объект для хранения данных сессии
    const sessionData = {
        sessionId: generateSessionId(),
        startTime: Date.now(),
        pageViews: [],
        currentPage: {
            url: window.location.pathname,
            title: document.title,
            startTime: Date.now()
        }
    };
    
    // Генерация уникального ID сессии
    function generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Определение страницы
    function getPageName(pathname) {
        const pages = {
            '/': 'Главная',
            '/index.html': 'Главная',
            '/portfolio.html': 'Портфолио',
            '/services-page.html': 'Услуги',
            '/drawings-page.html': 'Чертежи',
            '/about-page.html': 'О нас'
        };
        return pages[pathname] || 'Другая';
    }
    
    // Сохранение времени на странице
    function savePageTime() {
        const timeSpent = Math.floor((Date.now() - sessionData.currentPage.startTime) / 1000);
        
        sessionData.pageViews.push({
            page: getPageName(sessionData.currentPage.url),
            url: sessionData.currentPage.url,
            title: sessionData.currentPage.title,
            timeSpent: timeSpent,
            timestamp: new Date().toISOString()
        });
    }
    
    // Отправка данных на сервер
    function sendAnalytics() {
        savePageTime();
        
        const analyticsData = {
            sessionId: sessionData.sessionId,
            date: new Date().toISOString().split('T')[0],
            totalTime: Math.floor((Date.now() - sessionData.startTime) / 1000),
            pageViews: sessionData.pageViews,
            referrer: document.referrer || 'Прямой заход',
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`
        };
        
        // Сохраняем в localStorage для резервной копии
        try {
            localStorage.setItem(
                CONFIG.storagePrefix + sessionData.sessionId, 
                JSON.stringify(analyticsData)
            );
        } catch(e) {
            console.warn('LocalStorage недоступен:', e);
        }
        
        // Отправляем на сервер
        if (navigator.sendBeacon) {
            navigator.sendBeacon(CONFIG.apiEndpoint, JSON.stringify(analyticsData));
        } else {
            // Fallback для старых браузеров
            fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(analyticsData),
                keepalive: true
            }).catch(err => console.warn('Ошибка отправки аналитики:', err));
        }
    }
    
    // Обработка смены страницы
    function handlePageChange() {
        savePageTime();
        sessionData.currentPage = {
            url: window.location.pathname,
            title: document.title,
            startTime: Date.now()
        };
    }
    
    // Инициализация отслеживания
    function init() {
        console.log('DI Analytics initialized. Session:', sessionData.sessionId);
        
        // Отправка при закрытии страницы
        window.addEventListener('beforeunload', sendAnalytics);
        
        // Отправка при переходе на другую страницу (для SPA)
        window.addEventListener('popstate', handlePageChange);
        
        // Отправка каждые 30 секунд (для длительных сессий)
        setInterval(sendAnalytics, 30000);
        
        // Отслеживание видимости вкладки
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                sendAnalytics();
            } else {
                sessionData.currentPage.startTime = Date.now();
            }
        });
    }
    
    // Запуск при загрузке страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Экспорт API для внешнего использования
    window.DIAnalytics = {
        trackEvent: function(eventName, eventData) {
            console.log('Event tracked:', eventName, eventData);
            // Можно расширить для отслеживания кастомных событий
        },
        getSessionId: function() {
            return sessionData.sessionId;
        }
    };
    
})();

// Вывод информации в консоль
console.log('%c DI Studio Analytics Loaded ', 'background: #2c5530; color: #fff; padding: 5px 10px; border-radius: 3px;');
