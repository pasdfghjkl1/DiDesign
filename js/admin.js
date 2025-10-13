 data.project?.startDate || '';
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
        
        // Если у клиента есть аккаунт в Authentication, удаляем его
        // (Это требует серверной функции, пока пропустим)
        
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
