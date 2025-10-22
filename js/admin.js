// ============================================
// АДМИН-ПАНЕЛЬ С УПРАВЛЕНИЕМ РАБОТНИКАМИ
// ============================================

let allClients = [];
let allDesigners = [];
let currentEditingClient = null;
let currentEditingDesigner = null;

// ============================================
// ПРОВЕРКА АВТОРИЗАЦИИ
// ============================================

firebaseAuth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'client-login.html';
        return;
    }

    try {
        const userId = user.email.split('@')[0];
        const userDoc = await firebaseDb.collection('clients').doc(userId).get();
        
        if (!userDoc.exists) {
            console.error('Пользователь не найден');
            await firebaseAuth.signOut();
            window.location.href = 'client-login.html';
            return;
        }

        const userData = userDoc.data();
        const isAdmin = userData.isAdmin || userData.role === 'admin';

        if (!isAdmin) {
            console.log('Нет прав администратора');
            if (userData.role === 'designer') {
                window.location.href = 'designer-dashboard.html';
            } else {
                window.location.href = 'client-dashboard.html';
            }
            return;
        }

        // Инициализация админ-панели
        document.getElementById('adminName').textContent = userData.personalInfo.name;
        await loadAllData();

    } catch (error) {
        console.error('Ошибка авторизации:', error);
        alert('Ошибка загрузки данных');
        await firebaseAuth.signOut();
        window.location.href = 'client-login.html';
    }
});

// ============================================
// ЗАГРУЗКА ВСЕХ ДАННЫХ
// ============================================

async function loadAllData() {
    try {
        // Загружаем всех пользователей
        const snapshot = await firebaseDb.collection('clients').get();
        
        allClients = [];
        allDesigners = [];
        
        snapshot.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };
            
            if (data.role === 'designer') {
                allDesigners.push(data);
            } else if (!data.isAdmin && data.role !== 'admin') {
                allClients.push(data);
            }
        });

        console.log(`✅ Загружено: ${allClients.length} клиентов, ${allDesigners.length} работников`);

        // Обновляем интерфейс
        updateStatistics();
        displayClients();
        displayDesigners();

    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showAlert('error', 'Ошибка загрузки данных из базы');
    }
}

// ============================================
// СТАТИСТИКА
// ============================================

function updateStatistics() {
    // Общее количество клиентов
    document.getElementById('totalClients').textContent = allClients.length;
    
    // Активные проекты
    const activeProjects = allClients.filter(c => 
        c.projectInfo?.status === 'В работе'
    ).length;
    document.getElementById('activeProjects').textContent = activeProjects;
    
    // Завершённые проекты
    const completedProjects = allClients.filter(c => 
        c.projectInfo?.status === 'Завершён'
    ).length;
    document.getElementById('completedProjects').textContent = completedProjects;

    // Количество работников
    document.getElementById('totalDesigners').textContent = allDesigners.length;

    // === НОВЫЕ МЕТРИКИ ===

    // Проекты в этом месяце
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const projectsThisMonth = allClients.filter(c => {
        const startDate = c.projectInfo?.startDate;
        if (!startDate) return false;
        const date = new Date(startDate);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
    document.getElementById('projectsThisMonth').textContent = projectsThisMonth;

    // Средний срок проекта
    const completedWithDates = allClients.filter(c => 
        c.projectInfo?.status === 'Завершён' && 
        c.projectInfo?.startDate && 
        c.projectInfo?.completedDate
    );
    if (completedWithDates.length > 0) {
        const totalDays = completedWithDates.reduce((sum, c) => {
            const start = new Date(c.projectInfo.startDate);
            const end = new Date(c.projectInfo.completedDate);
            const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
            return sum + days;
        }, 0);
        const avgDays = Math.round(totalDays / completedWithDates.length);
        document.getElementById('avgDuration').textContent = `${avgDays} дней`;
    } else {
        document.getElementById('avgDuration').textContent = '-';
    }

    // Проектов на работника
    if (allDesigners.length > 0) {
        const avg = (allClients.length / allDesigners.length).toFixed(1);
        document.getElementById('avgProjectsPerDesigner').textContent = avg;
    } else {
        document.getElementById('avgProjectsPerDesigner').textContent = '-';
    }

    // Просроченные проекты
    const overdueProjects = allClients.filter(c => {
        const deadline = c.projectInfo?.deadline;
        if (!deadline || c.projectInfo?.status === 'Завершён') return false;
        return new Date(deadline) < new Date();
    }).length;
    document.getElementById('overdueProjects').textContent = overdueProjects;

    // === ФИНАНСОВЫЕ МЕТРИКИ ===

    let totalRevenue = 0;
    let receivedPayments = 0;
    let pendingPayments = 0;

    allClients.forEach(c => {
        const finance = c.projectInfo?.finance || {};
        const total = parseFloat(finance.totalCost) || 0;
        const paid = parseFloat(finance.paidAmount) || 0;
        
        totalRevenue += total;
        receivedPayments += paid;
        pendingPayments += (total - paid);
    });

    document.getElementById('totalRevenue').textContent = formatMoney(totalRevenue);
    document.getElementById('receivedPayments').textContent = formatMoney(receivedPayments);
    document.getElementById('pendingPayments').textContent = formatMoney(pendingPayments);
    
    const avgCheck = allClients.length > 0 ? totalRevenue / allClients.length : 0;
    document.getElementById('averageCheck').textContent = formatMoney(avgCheck);
}

// Форматирование денег
function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₽';
}

// ============================================
// ТАБЫ
// ============================================

function showTab(tabName) {
    // Скрываем все табы
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Показываем выбранный
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// ============================================
// КЛИЕНТЫ
// ============================================

function displayClients() {
    const tbody = document.getElementById('clientsTableBody');
    
    if (allClients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    Клиентов пока нет. Добавьте первого клиента!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = allClients.map(client => {
        const personal = client.personalInfo || {};
        const project = client.projectInfo || {};
        const progress = project.progress || 0;
        const designer = allDesigners.find(d => d.id === client.assignedDesigner);
        const designerName = designer ? designer.personalInfo?.name : 'Не назначен';

        return `
            <tr>
                <td><strong>${personal.name || 'Без имени'}</strong></td>
                <td>${personal.phone || '-'}</td>
                <td>${personal.email || '-'}</td>
                <td>${project.title || 'Без названия'}</td>
                <td><span class="status-badge ${project.status === 'Завершён' ? 'completed' : 'active'}">${project.status || 'В работе'}</span></td>
                <td>
                    <div class="progress-bar" style="width: 100px;">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </td>
                <td>${designerName}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editClient('${client.id}')" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteClient('${client.id}')" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddClientModal() {
    currentEditingClient = null;
    document.getElementById('modalTitle').textContent = 'Добавить клиента';
    document.getElementById('clientId').value = '';
    document.getElementById('clientForm').reset();
    
    // Заполняем список работников
    updateDesignerSelect();
    
    document.getElementById('clientModal').classList.add('active');
}

function updateDesignerSelect() {
    const select = document.getElementById('assignedDesigner');
    select.innerHTML = '<option value="">Не назначен</option>' + 
        allDesigners.map(d => 
            `<option value="${d.id}">${d.personalInfo?.name || d.id}</option>`
        ).join('');
}

async function editClient(clientId) {
    const client = allClients.find(c => c.id === clientId);
    if (!client) return;

    currentEditingClient = clientId;
    document.getElementById('modalTitle').textContent = 'Редактировать клиента';
    
    // Заполняем форму
    document.getElementById('clientId').value = clientId;
    document.getElementById('clientName').value = client.personalInfo?.name || '';
    document.getElementById('clientPhone').value = client.personalInfo?.phone || '';
    document.getElementById('clientEmail').value = client.personalInfo?.email || '';
    document.getElementById('projectTitle').value = client.projectInfo?.title || '';
    document.getElementById('projectArea').value = client.projectInfo?.area || '';
    document.getElementById('projectStatus').value = client.projectInfo?.status || 'В работе';
    document.getElementById('projectProgress').value = client.projectInfo?.progress || 0;
    document.getElementById('projectStartDate').value = client.projectInfo?.startDate || '';
    document.getElementById('projectDeadline').value = client.projectInfo?.deadline || '';
    
    // Финансовые поля
    const finance = client.projectInfo?.finance || {};
    document.getElementById('projectTotalCost').value = finance.totalCost || '';
    document.getElementById('projectPaidAmount').value = finance.paidAmount || '';
    document.getElementById('projectPaymentStatus').value = finance.paymentStatus || 'Не оплачено';
    
    updateDesignerSelect();
    document.getElementById('assignedDesigner').value = client.assignedDesigner || '';

    document.getElementById('clientModal').classList.add('active');
}

async function deleteClient(clientId) {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) return;

    try {
        await firebaseDb.collection('clients').doc(clientId).delete();
        showAlert('success', 'Клиент успешно удалён');
        await loadAllData();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showAlert('error', 'Ошибка удаления клиента');
    }
}

// ============================================
// РАБОТНИКИ
// ============================================

function displayDesigners() {
    const tbody = document.getElementById('designersTableBody');
    
    if (allDesigners.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-light);">
                    Работников пока нет. Добавьте первого работника!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = allDesigners.map(designer => {
        const personal = designer.personalInfo || {};
        const projectCount = designer.assignedProjects?.length || 0;
        const isActive = designer.isActive !== false;

        return `
            <tr>
                <td><strong>${personal.name || 'Без имени'}</strong></td>
                <td>${personal.phone || '-'}</td>
                <td>${personal.email || '-'}</td>
                <td>${projectCount}</td>
                <td><span class="status-badge ${isActive ? 'active' : 'pending'}">${isActive ? 'Активен' : 'Неактивен'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editDesigner('${designer.id}')" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteDesigner('${designer.id}')" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddDesignerModal() {
    currentEditingDesigner = null;
    document.getElementById('designerModalTitle').textContent = 'Добавить работника';
    document.getElementById('designerId').value = '';
    document.getElementById('designerForm').reset();
    
    // Заполняем список проектов
    updateProjectsCheckboxes();
    
    document.getElementById('designerModal').classList.add('active');
}

function updateProjectsCheckboxes() {
    const container = document.getElementById('designerProjects');
    
    if (allClients.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">Нет доступных проектов</p>';
        return;
    }

    container.innerHTML = allClients.map(client => {
        const checked = currentEditingDesigner && 
            allDesigners.find(d => d.id === currentEditingDesigner)?.assignedProjects?.includes(client.id);
        
        return `
            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;">
                <input type="checkbox" name="project" value="${client.id}" ${checked ? 'checked' : ''}>
                <span>${client.personalInfo?.name || 'Без имени'} - ${client.projectInfo?.title || 'Без названия'}</span>
            </label>
        `;
    }).join('');
}

async function editDesigner(designerId) {
    const designer = allDesigners.find(d => d.id === designerId);
    if (!designer) return;

    currentEditingDesigner = designerId;
    document.getElementById('designerModalTitle').textContent = 'Редактировать работника';
    
    // Заполняем форму
    document.getElementById('designerId').value = designerId;
    document.getElementById('designerName').value = designer.personalInfo?.name || '';
    document.getElementById('designerPhone').value = designer.personalInfo?.phone || '';
    document.getElementById('designerEmail').value = designer.personalInfo?.email || '';
    
    updateProjectsCheckboxes();
    
    document.getElementById('designerModal').classList.add('active');
}

async function deleteDesigner(designerId) {
    if (!confirm('Вы уверены, что хотите удалить этого работника?')) return;

    try {
        // Проверяем, есть ли назначенные проекты
        const designer = allDesigners.find(d => d.id === designerId);
        if (designer.assignedProjects && designer.assignedProjects.length > 0) {
            if (!confirm('У этого работника есть назначенные проекты. Продолжить удаление?')) {
                return;
            }
            
            // Убираем связи с проектами
            const batch = firebaseDb.batch();
            designer.assignedProjects.forEach(projectId => {
                const ref = firebaseDb.collection('clients').doc(projectId);
                batch.update(ref, { assignedDesigner: firebaseDb.FieldValue.delete() });
            });
            await batch.commit();
        }

        await firebaseDb.collection('clients').doc(designerId).delete();
        showAlert('success', 'Работник успешно удалён');
        await loadAllData();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showAlert('error', 'Ошибка удаления работника');
    }
}

// ============================================
// СОХРАНЕНИЕ КЛИЕНТА
// ============================================

document.getElementById('clientForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = document.getElementById('clientPhone').value.replace(/\D/g, '');
    
    if (phone.length !== 11) {
        showAlert('error', 'Введите корректный номер телефона');
        return;
    }

    const clientData = {
        personalInfo: {
            name: document.getElementById('clientName').value,
            phone: document.getElementById('clientPhone').value,
            email: document.getElementById('clientEmail').value
        },
        projectInfo: {
            title: document.getElementById('projectTitle').value,
            area: document.getElementById('projectArea').value,
            status: document.getElementById('projectStatus').value,
            progress: parseInt(document.getElementById('projectProgress').value) || 0,
            startDate: document.getElementById('projectStartDate').value,
            deadline: document.getElementById('projectDeadline').value,
            // Финансовая информация
            finance: {
                totalCost: parseFloat(document.getElementById('projectTotalCost').value) || 0,
                paidAmount: parseFloat(document.getElementById('projectPaidAmount').value) || 0,
                paymentStatus: document.getElementById('projectPaymentStatus').value
            }
        },
        role: 'client',
        hasPassword: false,
        isAdmin: false,
        assignedDesigner: document.getElementById('assignedDesigner').value || null,
        createdAt: currentEditingClient ? undefined : firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (currentEditingClient) {
            // Обновление
            await firebaseDb.collection('clients').doc(phone).update(clientData);
            showAlert('success', 'Клиент успешно обновлён');
        } else {
            // Создание
            await firebaseDb.collection('clients').doc(phone).set(clientData);
            showAlert('success', 'Клиент успешно создан');
        }

        // Обновляем связь с работником
        const designerId = clientData.assignedDesigner;
        if (designerId) {
            const designerDoc = await firebaseDb.collection('clients').doc(designerId).get();
            if (designerDoc.exists) {
                const assignedProjects = designerDoc.data().assignedProjects || [];
                if (!assignedProjects.includes(phone)) {
                    assignedProjects.push(phone);
                    await firebaseDb.collection('clients').doc(designerId).update({
                        assignedProjects: assignedProjects
                    });
                }
            }
        }

        closeModal();
        await loadAllData();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showAlert('error', 'Ошибка сохранения клиента');
    }
});

// ============================================
// СОХРАНЕНИЕ РАБОТНИКА
// ============================================

document.getElementById('designerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = document.getElementById('designerPhone').value.replace(/\D/g, '');
    
    if (phone.length !== 11) {
        showAlert('error', 'Введите корректный номер телефона');
        return;
    }

    // Получаем выбранные проекты
    const selectedProjects = Array.from(
        document.querySelectorAll('#designerProjects input[name="project"]:checked')
    ).map(cb => cb.value);

    const designerData = {
        personalInfo: {
            name: document.getElementById('designerName').value,
            phone: document.getElementById('designerPhone').value,
            email: document.getElementById('designerEmail').value
        },
        role: 'designer',
        hasPassword: false,
        isAdmin: false,
        isActive: true,
        assignedProjects: selectedProjects,
        createdAt: currentEditingDesigner ? undefined : firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (currentEditingDesigner) {
            // Обновление
            await firebaseDb.collection('clients').doc(phone).update(designerData);
            showAlert('success', 'Работник успешно обновлён');
        } else {
            // Создание
            await firebaseDb.collection('clients').doc(phone).set(designerData);
            showAlert('success', 'Работник успешно создан');
        }

        // Обновляем связи с проектами
        const batch = firebaseDb.batch();
        selectedProjects.forEach(projectId => {
            const ref = firebaseDb.collection('clients').doc(projectId);
            batch.update(ref, { assignedDesigner: phone });
        });
        await batch.commit();

        closeDesignerModal();
        await loadAllData();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showAlert('error', 'Ошибка сохранения работника');
    }
});

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function closeModal() {
    document.getElementById('clientModal').classList.remove('active');
}

function closeDesignerModal() {
    document.getElementById('designerModal').classList.remove('active');
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        firebaseAuth.signOut().then(() => {
            window.location.href = 'client-login.html';
        });
    }
}

function showAlert(type, message) {
    // Простое уведомление (можно улучшить)
    if (type === 'error') {
        alert('❌ ' + message);
    } else {
        alert('✅ ' + message);
    }
}

function openFinancialSettings() {
    alert('💡 Настройки финансов будут доступны в следующей версии!\n\nЗдесь можно будет настроить:\n- Шаблоны цен\n- Налоги\n- Способы оплаты\n- Напоминания об оплате');
}

// ============================================
// ПОИСК
// ============================================

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#clientsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
});

console.log('✅ admin.js загружен (обновлённая версия с работниками)');
