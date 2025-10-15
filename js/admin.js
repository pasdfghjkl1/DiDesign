// ============================================
// Логика админ-панели
// ============================================

// Проверка авторизации администратора
document.addEventListener('DOMContentLoaded', async function() {
    // Проверяем, авторизован ли пользователь
    window.firebaseAuth.onAuthStateChanged(async (user) => {
        if (!user) {
            // Пользователь не авторизован - перенаправляем на страницу входа
            window.location.href = 'client-login.html';
            return;
        }

        // Получаем номер телефона из email
        const phone = user.email.split('@')[0];
        
        // Проверяем, является ли пользователь администратором
        try {
            const clientDoc = await window.firebaseDb.collection('clients').doc(phone).get();
            
            if (!clientDoc.exists || !clientDoc.data().isAdmin) {
                // Это не администратор - перенаправляем в обычный кабинет
                alert('У вас нет прав администратора');
                window.location.href = 'client-dashboard.html';
                return;
            }

            // Загружаем данные
            loadClients();
        } catch (error) {
            console.error('Ошибка проверки прав:', error);
            alert('Ошибка проверки прав доступа');
            window.location.href = 'client-login.html';
        }
    });
});

// Глобальная переменная для хранения всех клиентов
let allClients = [];

// ============================================
// Загрузка списка клиентов
// ============================================
async function loadClients() {
    try {
        // Временно загружаем ВСЕХ клиентов для отладки
        const clientsSnapshot = await window.firebaseDb.collection('clients').get();
        
        allClients = [];
        clientsSnapshot.forEach(doc => {
            const data = doc.data();
            // Фильтруем администраторов на клиенте
            if (!data.isAdmin) {
                allClients.push({
                    id: doc.id,
                    ...data
                });
            }
        });

        console.log('✅ Загружено клиентов:', allClients.length);
        console.log('📋 Клиенты:', allClients);

        // Обновляем статистику
        updateStatistics();

        // Отображаем таблицу
        renderClientsTable(allClients);
    } catch (error) {
        console.error('❌ Ошибка загрузки клиентов:', error);
        document.getElementById('tableContent').innerHTML = `
            <div class="loading">
                <p style="color: var(--danger);">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Ошибка загрузки данных: ${error.message}
                </p>
            </div>
        `;
    }
}

// ============================================
// Обновление статистики
// ============================================
function updateStatistics() {
    const totalClients = allClients.length;
    const activeProjects = allClients.filter(c => c.project?.status === 'В работе').length;
    const completedProjects = allClients.filter(c => c.project?.status === 'Завершён').length;

    document.getElementById('totalClients').textContent = totalClients;
    document.getElementById('activeProjects').textContent = activeProjects;
    document.getElementById('completedProjects').textContent = completedProjects;
}

// ============================================
// Отображение таблицы клиентов
// ============================================
function renderClientsTable(clients) {
    const tableContent = document.getElementById('tableContent');
    
    if (clients.length === 0) {
        tableContent.innerHTML = `
            <div class="loading">
                <p><i class="fas fa-inbox"></i> Клиенты не найдены</p>
            </div>
        `;
        return;
    }

    let html = `
        <table class="clients-table">
            <thead>
                <tr>
                    <th>Имя</th>
                    <th>Телефон</th>
                    <th>Проект</th>
                    <th>Статус</th>
                    <th>Прогресс</th>
                    <th>Дедлайн</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;

    clients.forEach(client => {
        const name = client.personalInfo?.name || 'Не указано';
        const phone = client.personalInfo?.phone || 'Не указано';
        const projectTitle = client.project?.title || 'Нет проекта';
        const status = client.project?.status || 'Неизвестно';
        const progress = client.project?.progress || 0;
        const deadline = client.project?.deadline || '-';

        // Определяем класс статуса
        let statusClass = 'pending';
        if (status === 'В работе') statusClass = 'active';
        if (status === 'Завершён') statusClass = 'completed';

        html += `
            <tr>
                <td><strong>${name}</strong></td>
                <td>${phone}</td>
                <td>${projectTitle}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <small>${progress}%</small>
                </td>
                <td>${deadline}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewClient('${client.id}')" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editClient('${client.id}')" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteClient('${client.id}', '${name}')" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    tableContent.innerHTML = html;
}

// ============================================
// Поиск клиентов
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            if (!searchTerm) {
                renderClientsTable(allClients);
                return;
            }

            const filtered = allClients.filter(client => {
                const name = (client.personalInfo?.name || '').toLowerCase();
                const phone = (client.personalInfo?.phone || '').toLowerCase();
                const project = (client.project?.title || '').toLowerCase();
                
                return name.includes(searchTerm) || 
                       phone.includes(searchTerm) || 
                       project.includes(searchTerm);
            });

            renderClientsTable(filtered);
        });
    }
});

// ============================================
// Открыть модальное окно добавления клиента
// ============================================
function openAddClientModal() {
    document.getElementById('modalTitle').textContent = 'Добавить клиента';
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
    
    // Установить текущую дату по умолчанию
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('projectStartDate').value = today;
    
    document.getElementById('clientModal').classList.add('active');
}

// ============================================
// Редактировать клиента
// ============================================
async function editClient(clientId) {
    try {
        const clientDoc = await window.firebaseDb.collection('clients').doc(clientId).get();
        
        if (!clientDoc.exists) {
            alert('Клиент не найден');
            return;
        }

        const data = clientDoc.data();
        
        document.getElementById('modalTitle').textContent = 'Редактировать клиента';
        document.getElementById('clientId').value = clientId;
        document.getElementById('clientName').value = data.personalInfo?.name || '';
        document.getElementById('clientPhone').value = data.personalInfo?.phone || '';
        document.getElementById('clientEmail').value = data.personalInfo?.email || '';
        document.getElementById('projectTitle').value = data.project?.title || '';
        document.getElementById('projectArea').value = data.project?.area || '';
        document.getElementById('projectStatus').value = data.project?.status || 'В работе';
        document.getElementById('projectProgress').value = data.project?.progress || 0;
        document.getElementById('projectStartDate').value = data.project?.startDate || '';
        document.getElementById('projectDeadline').value = data.project?.deadline || '';
        
        document.getElementById('clientModal').classList.add('active');
    } catch (error) {
        console.error('Ошибка загрузки данных клиента:', error);
        alert('Ошибка загрузки данных клиента');
    }
}

// ============================================
// Просмотр клиента
// ============================================
async function viewClient(clientId) {
    try {
        const clientDoc = await window.firebaseDb.collection('clients').doc(clientId).get();
        
        if (!clientDoc.exists) {
            alert('Клиент не найден');
            return;
        }

        const data = clientDoc.data();
        
        alert(`
📋 Информация о клиенте

👤 Имя: ${data.personalInfo?.name || 'Не указано'}
📞 Телефон: ${data.personalInfo?.phone || 'Не указано'}
📧 Email: ${data.personalInfo?.email || 'Не указано'}

🏠 Проект: ${data.project?.title || 'Нет проекта'}
📏 Площадь: ${data.project?.area || '-'}
📊 Статус: ${data.project?.status || '-'}
⏳ Прогресс: ${data.project?.progress || 0}%
📅 Начало: ${data.project?.startDate || '-'}
🎯 Дедлайн: ${data.project?.deadline || '-'}
        `);
    } catch (error) {
        console.error('Ошибка загрузки данных клиента:', error);
        alert('Ошибка загрузки данных клиента');
    }
}

// ============================================
// Удалить клиента
// ============================================
async function deleteClient(clientId, clientName) {
    if (!confirm(`Вы уверены, что хотите удалить клиента "${clientName}"?\n\nЭто действие нельзя отменить!`)) {
        return;
    }

    try {
        // Удаляем клиента из Firestore
        await window.firebaseDb.collection('clients').doc(clientId).delete();
        
        alert('Клиент успешно удалён');
        
        // Перезагружаем список
        loadClients();
    } catch (error) {
        console.error('Ошибка удаления клиента:', error);
        alert('Ошибка удаления клиента');
    }
}

// ============================================
// Закрыть модальное окно
// ============================================
function closeModal() {
    document.getElementById('clientModal').classList.remove('active');
}

// Закрывать модальное окно при клике вне его
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('clientModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});

// ============================================
// Сохранение клиента (добавление/редактирование)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const clientForm = document.getElementById('clientForm');
    if (clientForm) {
        clientForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const clientId = document.getElementById('clientId').value;
            const name = document.getElementById('clientName').value.trim();
            const phone = document.getElementById('clientPhone').value.trim();
            const email = document.getElementById('clientEmail').value.trim();
            const projectTitle = document.getElementById('projectTitle').value.trim();
            const projectArea = document.getElementById('projectArea').value.trim();
            const projectStatus = document.getElementById('projectStatus').value;
            const projectProgress = parseInt(document.getElementById('projectProgress').value);
            const projectStartDate = document.getElementById('projectStartDate').value;
            const projectDeadline = document.getElementById('projectDeadline').value;

            // Валидация
            if (!name || !phone || !email || !projectTitle) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }

            // Получаем номер телефона без форматирования для ID
            const phoneId = phone.replace(/\D/g, '');
            
            if (phoneId.length !== 11) {
                alert('Неверный формат номера телефона');
                return;
            }

            try {
                const clientData = {
                    personalInfo: {
                        name: name,
                        phone: phone,
                        email: email
                    },
                    project: {
                        title: projectTitle,
                        area: projectArea,
                        status: projectStatus,
                        progress: projectProgress,
                        startDate: projectStartDate,
                        deadline: projectDeadline
                    },
                    hasPassword: false,
                    isAdmin: false,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (clientId) {
                    // Редактирование существующего клиента
                    await window.firebaseDb.collection('clients').doc(clientId).update(clientData);
                    alert('Клиент успешно обновлён');
                } else {
                    // Добавление нового клиента
                    clientData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await window.firebaseDb.collection('clients').doc(phoneId).set(clientData);
                    alert('Клиент успешно добавлен');
                }

                // Закрываем модальное окно
                closeModal();
                
                // Перезагружаем список клиентов
                loadClients();
            } catch (error) {
                console.error('Ошибка сохранения клиента:', error);
                alert('Ошибка сохранения данных клиента');
            }
        });
    }
});

// ============================================
// Выход из админ-панели
// ============================================
async function logout() {
    if (!confirm('Вы уверены, что хотите выйти?')) {
        return;
    }

    try {
        await window.firebaseAuth.signOut();
        window.location.href = 'client-login.html';
    } catch (error) {
        console.error('Ошибка выхода:', error);
        alert('Ошибка выхода из системы');
    }
}

// ============================================
// Маска для телефона
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('clientPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0 && value[0] !== '7') {
                value = '7' + value;
            }
            
            let formattedValue = '';
            if (value.length > 0) {
                formattedValue = '+7';
                if (value.length > 1) {
                    formattedValue += ' (' + value.substring(1, 4);
                }
                if (value.length >= 4) {
                    formattedValue += ') ' + value.substring(4, 7);
                }
                if (value.length >= 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }
                if (value.length >= 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }
            }
            
            e.target.value = formattedValue;
        });
    }
});
