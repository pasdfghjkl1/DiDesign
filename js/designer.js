// ============================================
// КАБИНЕТ РАБОТНИКА (DESIGNER) - DI Studio
// ============================================

let currentUser = null;
let currentUserId = null;
let assignedProjects = [];
let currentChatProject = null;
let messagesListener = null;

// ============================================
// ПРОВЕРКА АВТОРИЗАЦИИ И ПРАВ
// ============================================

firebaseAuth.onAuthStateChanged(async (user) => {
    if (!user) {
        // Не авторизован - редирект на страницу входа
        window.location.href = 'client-login.html';
        return;
    }

    try {
        // Получаем ID пользователя (номер телефона без +)
        const userId = user.email.split('@')[0];
        currentUserId = userId;

        // Получаем данные пользователя из Firestore
        const userDoc = await firebaseDb.collection('clients').doc(userId).get();
        
        if (!userDoc.exists) {
            console.error('❌ Пользователь не найден в базе');
            alert('Ошибка: данные пользователя не найдены');
            await firebaseAuth.signOut();
            window.location.href = 'client-login.html';
            return;
        }

        const userData = userDoc.data();
        currentUser = userData;

        // ПРОВЕРКА РОЛИ
        if (userData.role !== 'designer') {
            console.log('⚠️ Пользователь не является работником');
            
            // Редирект в зависимости от роли
            if (userData.isAdmin || userData.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'client-dashboard.html';
            }
            return;
        }

        console.log('✅ Работник авторизован:', userData.personalInfo.name);

        // Инициализация интерфейса
        initializeDesignerDashboard(userData);

    } catch (error) {
        console.error('❌ Ошибка при проверке прав доступа:', error);
        alert('Ошибка загрузки данных. Попробуйте войти снова.');
        await firebaseAuth.signOut();
        window.location.href = 'client-login.html';
    }
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ КАБИНЕТА
// ============================================

async function initializeDesignerDashboard(userData) {
    try {
        // Обновляем UI с данными работника
        document.getElementById('userName').textContent = userData.personalInfo.name;
        const firstName = userData.personalInfo.name.split(' ')[0];
        document.getElementById('userAvatar').textContent = firstName[0].toUpperCase();

        // Загружаем назначенные проекты
        await loadAssignedProjects();

        // Скрываем загрузочный экран
        document.getElementById('authCheckLoader').style.display = 'none';

        console.log('✅ Кабинет работника загружен');

    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        document.getElementById('authCheckLoader').innerHTML = `
            <div style="text-align: center;">
                <p style="color: #dc3545; font-weight: 600;">Ошибка загрузки</p>
                <p style="color: #666;">Попробуйте обновить страницу</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 10px 20px; background: #2c5530; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Обновить
                </button>
            </div>
        `;
    }
}

// ============================================
// ЗАГРУЗКА НАЗНАЧЕННЫХ ПРОЕКТОВ
// ============================================

async function loadAssignedProjects() {
    try {
        console.log('🔄 Загрузка проектов...');

        // Получаем все проекты, где этот работник назначен
        const projectsSnapshot = await firebaseDb.collection('clients')
            .where('assignedDesigner', '==', currentUserId)
            .get();

        if (projectsSnapshot.empty) {
            console.log('⚠️ Назначенных проектов не найдено');
            displayNoProjects();
            return;
        }

        assignedProjects = [];
        projectsSnapshot.forEach(doc => {
            assignedProjects.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ Загружено проектов: ${assignedProjects.length}`);

        // Отображаем проекты
        displayProjects(assignedProjects);

        // Обновляем badge
        document.getElementById('projectsBadge').textContent = assignedProjects.length;

        // Загружаем список чатов
        loadChatList();

    } catch (error) {
        console.error('❌ Ошибка загрузки проектов:', error);
        document.getElementById('projectsGrid').innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #dc3545;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Ошибка загрузки проектов</p>
            </div>
        `;
    }
}

// ============================================
// ФИЛЬТРАЦИЯ ПРОЕКТОВ
// ============================================

let currentFilter = 'all';

function filterProjects(filterType) {
    currentFilter = filterType;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
    
    // Фильтруем проекты
    let filteredProjects = assignedProjects;
    
    if (filterType === 'active') {
        filteredProjects = assignedProjects.filter(p => 
            p.projectInfo?.status !== 'Завершён'
        );
    } else if (filterType === 'completed') {
        filteredProjects = assignedProjects.filter(p => 
            p.projectInfo?.status === 'Завершён'
        );
    }
    
    console.log(`Фильтр: ${filterType}, найдено проектов: ${filteredProjects.length}`);
    
    // Отображаем отфильтрованные проекты
    displayProjects(filteredProjects);
}

// ============================================
// ОТОБРАЖЕНИЕ ПРОЕКТОВ
// ============================================

function displayProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    
    if (projects.length === 0) {
        displayNoProjects();
        return;
    }

    grid.innerHTML = projects.map(project => {
        const info = project.projectInfo || {};
        const personal = project.personalInfo || {};
        const progress = info.progress || 0;
        const status = info.status || 'В работе';
        
        // Определяем срочность
        const deadline = info.deadline ? new Date(info.deadline) : null;
        const isUrgent = deadline && (deadline - new Date()) < 7 * 24 * 60 * 60 * 1000;

        return `
            <div class="project-card ${isUrgent ? 'urgent' : ''}" onclick="openChat('${project.id}')">
                <div class="project-header">
                    <div>
                        <div class="project-title">${info.title || 'Без названия'}</div>
                        <div class="project-client">
                            <i class="fas fa-user"></i> ${personal.name || 'Клиент'}
                        </div>
                    </div>
                    <span class="project-status ${status === 'Завершён' ? 'status-completed' : 'status-active'}">
                        ${status}
                    </span>
                </div>

                <div class="project-info">
                    <div class="info-item">
                        <i class="fas fa-ruler-combined"></i>
                        ${info.area || 'Не указано'}
                    </div>
                    ${deadline ? `
                        <div class="info-item">
                            <i class="fas fa-calendar-alt"></i>
                            ${formatDate(deadline)}
                        </div>
                    ` : ''}
                </div>

                <div class="project-progress">
                    <div class="progress-text">
                        <span>Прогресс</span>
                        <span><strong>${progress}%</strong></span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="project-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); openChat('${project.id}')">
                        <i class="fas fa-comments"></i> Чат
                    </button>
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); showProjectDetails('${project.id}')">
                        <i class="fas fa-info-circle"></i> Детали
                    </button>
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); showStages('${project.id}')">
                        <i class="fas fa-tasks"></i> Этапы
                    </button>
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); manageComments('${project.id}')">
                        <i class="fas fa-sticky-note"></i> Заметки
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function displayNoProjects() {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-light);">
            <i class="fas fa-folder-open" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
            <h3 style="margin-bottom: 0.5rem;">Нет назначенных проектов</h3>
            <p>Администратор назначит вам проекты для работы</p>
        </div>
    `;
}

// ============================================
// СИСТЕМА ЧАТА
// ============================================

function loadChatList() {
    const sidebar = document.getElementById('chatSidebar');
    
    if (assignedProjects.length === 0) {
        sidebar.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-light);">
                <i class="fas fa-comments" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>Нет активных чатов</p>
            </div>
        `;
        return;
    }

    sidebar.innerHTML = assignedProjects.map(project => {
        const personal = project.personalInfo || {};
        const chat = project.chat || {};
        const unread = chat.unreadByDesigner || 0;

        return `
            <div class="chat-list-item ${unread > 0 ? 'unread' : ''}" onclick="openChat('${project.id}')">
                <div class="chat-item-header">
                    <span class="chat-item-name">${personal.name || 'Клиент'}</span>
                    <span class="chat-item-time">${chat.lastMessageAt ? formatTime(chat.lastMessageAt.toDate()) : ''}</span>
                </div>
                <div class="chat-item-preview">
                    ${chat.lastMessageText || 'Нет сообщений'}
                </div>
                ${unread > 0 ? `<div style="color: var(--success); font-size: 0.75rem; margin-top: 0.25rem;"><strong>${unread} новых</strong></div>` : ''}
            </div>
        `;
    }).join('');
}

async function openChat(projectId) {
    try {
        // Переключаемся на таб чата
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('chat-content').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');

        // Находим проект
        const project = assignedProjects.find(p => p.id === projectId);
        if (!project) {
            console.error('Проект не найден');
            return;
        }

        currentChatProject = projectId;

        // Обновляем заголовок
        document.getElementById('chatClientName').textContent = project.personalInfo.name || 'Клиент';

        // Включаем поле ввода
        document.getElementById('chatInput').disabled = false;
        document.querySelector('.chat-send-btn').disabled = false;

        // Подсвечиваем активный чат
        document.querySelectorAll('.chat-list-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.closest('.chat-list-item')?.classList.add('active');

        // Загружаем сообщения
        await loadMessages(projectId);

        // Отмечаем сообщения как прочитанные
        await markMessagesAsRead(projectId);

    } catch (error) {
        console.error('Ошибка открытия чата:', error);
    }
}

async function loadMessages(projectId) {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Загрузка сообщений...</p></div>';

    try {
        console.log('🔄 Загрузка сообщений для проекта:', projectId);
        
        // Отписываемся от предыдущего слушателя
        if (messagesListener) {
            messagesListener();
        }

        // Слушаем сообщения в реальном времени
        messagesListener = firebaseDb.collection('messages')
            .where('projectId', '==', projectId)
            .onSnapshot(snapshot => {
                console.log('📨 Получено сообщений:', snapshot.size);
                if (snapshot.empty) {
                    messagesContainer.innerHTML = `
                        <div style="text-align: center; color: var(--text-light); padding: 3rem;">
                            <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                            <p>Начните переписку с клиентом</p>
                        </div>
                    `;
                    return;
                }

                const messages = [];
                snapshot.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                // Сортируем сообщения по времени
                messages.sort((a, b) => {
                    const timeA = a.timestamp ? a.timestamp.toDate() : new Date(0);
                    const timeB = b.timestamp ? b.timestamp.toDate() : new Date(0);
                    return timeA - timeB;
                });

                displayMessages(messages);
            });

    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
        messagesContainer.innerHTML = `
            <div style="text-align: center; color: #dc3545; padding: 3rem;">
                <p>Ошибка загрузки сообщений</p>
            </div>
        `;
    }
}

function displayMessages(messages) {
    const container = document.getElementById('chatMessages');
    
    container.innerHTML = messages.map(msg => {
        const isOutgoing = msg.senderRole === 'designer';
        const time = msg.timestamp ? formatTime(msg.timestamp.toDate()) : '';

        return `
            <div class="message ${isOutgoing ? 'outgoing' : ''}">
                <div class="message-avatar">
                    ${isOutgoing ? 'D' : 'C'}
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        ${msg.text}
                    </div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
    }).join('');

    // Скролл вниз
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();

    if (!text || !currentChatProject) {
        console.log('⚠️ Нет текста или проекта для отправки');
        return;
    }

    try {
        console.log('📤 Отправка сообщения...', {
            projectId: currentChatProject,
            text: text.substring(0, 20) + '...'
        });

        // Создаём структуру сообщения
        const messageData = {
            projectId: currentChatProject,
            senderId: currentUserId,
            senderRole: 'designer',
            senderName: currentUser?.personalInfo?.name || 'Работник',
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            isRead: false
        };

        // Отправляем в коллекцию messages
        const messageRef = await firebaseDb.collection('messages').add(messageData);
        console.log('✅ Сообщение добавлено в messages:', messageRef.id);

        // Обновляем информацию о чате в документе клиента
        await firebaseDb.collection('clients').doc(currentChatProject).set({
            chat: {
                lastMessageText: text,
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                unreadByClient: firebase.firestore.FieldValue.increment(1),
                unreadByDesigner: 0
            }
        }, { merge: true });

        console.log('✅ Чат обновлён в проекте');

        // Очищаем поле ввода
        input.value = '';
        
        // Прокручиваем вниз
        const container = document.getElementById('chatMessages');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }

        console.log('✅ Сообщение успешно отправлено');

    } catch (error) {
        console.error('❌ Ошибка отправки сообщения:', error);
        console.error('Детали ошибки:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        alert('❌ Ошибка отправки сообщения: ' + error.message);
    }
}

async function markMessagesAsRead(projectId) {
    try {
        // Получаем непрочитанные сообщения от клиента
        const unreadSnapshot = await firebaseDb.collection('messages')
            .where('projectId', '==', projectId)
            .where('senderRole', '==', 'client')
            .where('isRead', '==', false)
            .get();

        // Отмечаем как прочитанные
        const batch = firebaseDb.batch();
        unreadSnapshot.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });
        await batch.commit();

        // Обнуляем счётчик непрочитанных
        await firebaseDb.collection('clients').doc(projectId).update({
            'chat.unreadByDesigner': 0
        });

        // Обновляем badge
        updateChatBadge();

    } catch (error) {
        console.error('Ошибка отметки сообщений:', error);
    }
}

function updateChatBadge() {
    const totalUnread = assignedProjects.reduce((sum, project) => {
        return sum + (project.chat?.unreadByDesigner || 0);
    }, 0);

    const badge = document.getElementById('chatBadge');
    if (totalUnread > 0) {
        badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function formatDate(date) {
    return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showProjectDetails(projectId) {
    const project = assignedProjects.find(p => p.id === projectId);
    if (!project) return;

    alert('Детальная информация о проекте:\n\n' + 
          'Эта функция будет реализована в следующей версии');
}

// ============================================
// УПРАВЛЕНИЕ КОММЕНТАРИЯМИ (ЗАМЕТКАМИ)
// ============================================

async function manageComments(projectId) {
    const project = assignedProjects.find(p => p.id === projectId);
    if (!project) return;
    
    const comments = project.designerComments || [];
    
    // Показываем список комментариев
    let commentsList = '<h3>Мои заметки по проекту</h3>';
    
    if (comments.length === 0) {
        commentsList += '<p style="color: #666; margin: 1rem 0;">Заметок пока нет</p>';
    } else {
        commentsList += '<div style="max-height: 300px; overflow-y: auto; margin: 1rem 0;">';
        comments.forEach((comment, index) => {
            const date = comment.timestamp ? new Date(comment.timestamp.seconds * 1000).toLocaleString('ru-RU') : 'Дата неизвестна';
            commentsList += `
                <div style="background: #f8f9fa; padding: 1rem; margin-bottom: 0.5rem; border-radius: 8px; border-left: 3px solid #2c5530;">
                    <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">${date}</div>
                    <div style="color: #1a1a1a;">${comment.text}</div>
                    <button onclick="deleteComment('${projectId}', ${index})" style="margin-top: 0.5rem; padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            `;
        });
        commentsList += '</div>';
    }
    
    // Форма добавления комментария
    commentsList += `
        <div style="margin-top: 1rem;">
            <textarea id="newCommentText" placeholder="Напишите заметку..." 
                      style="width: 100%; padding: 0.75rem; border: 2px solid #e5e5e5; border-radius: 8px; 
                             min-height: 100px; font-family: 'Inter', sans-serif; resize: vertical;"></textarea>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button onclick="closeCommentModal()" 
                        style="padding: 8px 16px; background: #6c757d; color: white; border: none; 
                               border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Закрыть
                </button>
                <button onclick="addComment('${projectId}')" 
                        style="padding: 8px 16px; background: #2c5530; color: white; border: none; 
                               border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-plus"></i> Добавить заметку
                </button>
            </div>
        </div>
    `;
    
    // Создаём модальное окно
    const modal = document.createElement('div');
    modal.id = 'commentModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
        align-items: center; justify-content: center; padding: 2rem;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white; border-radius: 15px; padding: 2rem; 
        max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;
    `;
    modalContent.innerHTML = commentsList;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCommentModal();
        }
    });
}

async function addComment(projectId) {
    const textarea = document.getElementById('newCommentText');
    const text = textarea.value.trim();
    
    if (!text) {
        alert('⚠️ Введите текст заметки');
        return;
    }
    
    try {
        const project = assignedProjects.find(p => p.id === projectId);
        const comments = project.designerComments || [];
        
        // Добавляем новый комментарий
        comments.push({
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            author: currentUser.personalInfo.name
        });
        
        // Обновляем в Firestore
        await firebaseDb.collection('clients').doc(projectId).update({
            designerComments: comments
        });
        
        console.log('✅ Заметка добавлена');
        
        // Обновляем локальные данные
        project.designerComments = comments;
        
        // Закрываем и открываем заново для обновления
        closeCommentModal();
        setTimeout(() => manageComments(projectId), 100);
        
    } catch (error) {
        console.error('❌ Ошибка добавления заметки:', error);
        alert('Ошибка добавления заметки: ' + error.message);
    }
}

async function deleteComment(projectId, commentIndex) {
    if (!confirm('Удалить эту заметку?')) return;
    
    try {
        const project = assignedProjects.find(p => p.id === projectId);
        const comments = project.designerComments || [];
        
        // Удаляем комментарий
        comments.splice(commentIndex, 1);
        
        // Обновляем в Firestore
        await firebaseDb.collection('clients').doc(projectId).update({
            designerComments: comments
        });
        
        console.log('✅ Заметка удалена');
        
        // Обновляем локальные данные
        project.designerComments = comments;
        
        // Закрываем и открываем заново для обновления
        closeCommentModal();
        setTimeout(() => manageComments(projectId), 100);
        
    } catch (error) {
        console.error('❌ Ошибка удаления заметки:', error);
        alert('Ошибка удаления заметки: ' + error.message);
    }
}

function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    if (modal) {
        modal.remove();
    }
}

// Enter для отправки сообщений
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

console.log('✅ designer.js загружен');
