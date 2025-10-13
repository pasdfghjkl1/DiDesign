// ============================================
// Логика личного кабинета клиента
// ============================================

let currentUser = null;
let currentUserPhone = null;
let clientData = null;

// Проверка авторизации при загрузке страницы
firebaseAuth.onAuthStateChanged(async (user) => {
    if (!user) {
        // Пользователь не авторизован - перенаправляем на страницу входа
        window.location.href = 'client-login.html';
        return;
    }

    currentUser = user;
    // Извлекаем номер телефона из email
    currentUserPhone = user.email.replace('@di-studio.local', '');

    // ВАЖНО: Проверяем, не является ли пользователь администратором
    try {
        const clientDoc = await db.collection('clients').doc(currentUserPhone).get();
        if (clientDoc.exists) {
            const isAdmin = clientDoc.data()?.isAdmin || false;
            
            console.log('🔍 Проверка в dashboard.js:');
            console.log('📞 Телефон:', currentUserPhone);
            console.log('🔑 isAdmin:', isAdmin);
            
            if (isAdmin === true) {
                console.log('⚠️ Администратор пытается зайти в личный кабинет! Перенаправление...');
                window.location.href = 'admin-dashboard.html';
                return;
            }
        }
    } catch (error) {
        console.error('Ошибка проверки прав:', error);
    }

    // Загружаем данные клиента
    await loadClientData();
});

// ============================================
// Загрузка данных клиента
// ============================================
async function loadClientData() {
    try {
        const clientDoc = await db.collection('clients').doc(currentUserPhone).get();
        
        if (!clientDoc.exists) {
            alert('Данные клиента не найдены');
            firebaseAuth.signOut();
            return;
        }

        clientData = clientDoc.data();

        // Обновляем UI
        updateUserInfo();
        updateProjectInfo();
        loadOverviewData();
        loadAllFiles();
        loadVersions();
        loadTimeline();
        loadDocuments();
        loadSpecifications();

    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showError('Ошибка загрузки данных. Попробуйте обновить страницу.');
    }
}

// ============================================
// Обновление информации о пользователе
// ============================================
function updateUserInfo() {
    const userName = clientData.personalInfo?.name || 'Клиент';
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    document.getElementById('userName').textContent = userName;
    document.getElementById('userAvatar').textContent = initials;
}

// ============================================
// Обновление информации о проекте
// ============================================
function updateProjectInfo() {
    const projectTitle = clientData.project?.title || 'Проект';
    document.getElementById('projectTitle').textContent = projectTitle;
}

// ============================================
// Загрузка данных для раздела "Обзор"
// ============================================
async function loadOverviewData() {
    try {
        // Прогресс проекта
        const progress = clientData.project?.progress || 0;
        document.getElementById('progressValue').textContent = progress + '%';
        document.getElementById('progressBar').style.width = progress + '%';

        // Ближайший дедлайн
        const deadline = clientData.project?.deadline;
        if (deadline) {
            const deadlineDate = new Date(deadline);
            const today = new Date();
            const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
            
            document.getElementById('deadlineValue').textContent = daysLeft + ' дней';
            document.getElementById('deadlineLabel').textContent = deadlineDate.toLocaleDateString('ru-RU');
        } else {
            document.getElementById('deadlineValue').textContent = 'Не указан';
            document.getElementById('deadlineLabel').textContent = '';
        }

        // Количество файлов
        const filesSnapshot = await db.collection('clients').doc(currentUserPhone)
            .collection('files').get();
        
        document.getElementById('filesCount').textContent = filesSnapshot.size;

        // Последние файлы
        await loadRecentFiles();

    } catch (error) {
        console.error('Ошибка загрузки данных обзора:', error);
    }
}

// ============================================
// Загрузка последних файлов
// ============================================
async function loadRecentFiles() {
    try {
        const filesSnapshot = await db.collection('clients').doc(currentUserPhone)
            .collection('files')
            .orderBy('uploadDate', 'desc')
            .limit(5)
            .get();

        const container = document.getElementById('recentFiles');

        if (filesSnapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Файлы еще не добавлены</p></div>';
            return;
        }

        container.innerHTML = '';
        filesSnapshot.forEach(doc => {
            const file = doc.data();
            container.appendChild(createFileItem(file, doc.id));
        });

    } catch (error) {
        console.error('Ошибка загрузки последних файлов:', error);
    }
}

// ============================================
// Загрузка всех файлов
// ============================================
async function loadAllFiles() {
    try {
        const container = document.getElementById('allFiles');
        container.innerHTML = '<div class="loader"><div class="spinner-large"></div></div>';

        let query = db.collection('clients').doc(currentUserPhone).collection('files');

        // Применяем фильтр
        if (currentFilter !== 'all') {
            query = query.where('type', '==', currentFilter);
        }

        const filesSnapshot = await query.orderBy('uploadDate', 'desc').get();

        if (filesSnapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>Файлов не найдено</p></div>';
            return;
        }

        container.innerHTML = '';
        filesSnapshot.forEach(doc => {
            const file = doc.data();
            container.appendChild(createFileItem(file, doc.id));
        });

    } catch (error) {
        console.error('Ошибка загрузки файлов:', error);
        document.getElementById('allFiles').innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Ошибка загрузки файлов</p></div>';
    }
}

// ============================================
// Создание элемента файла
// ============================================
function createFileItem(file, fileId) {
    const item = document.createElement('div');
    item.className = 'file-item';

    // Определяем иконку и класс
    let iconClass = 'image';
    let icon = 'fa-image';

    if (file.type === 'drawing') {
        iconClass = 'dwg';
        icon = 'fa-drafting-compass';
    } else if (file.type === 'document') {
        iconClass = 'pdf';
        icon = 'fa-file-pdf';
    }

    // Форматируем дату
    const uploadDate = file.uploadDate?.toDate ? 
        file.uploadDate.toDate().toLocaleDateString('ru-RU') : 
        'Дата неизвестна';

    item.innerHTML = `
        <div class="file-info">
            <div class="file-icon ${iconClass}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">
                    ${file.room || 'Общее'} • Версия ${file.version || 1} • ${uploadDate}
                    ${file.notes ? '<br>' + file.notes : ''}
                </div>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-icon btn-view" onclick="viewFile('${fileId}')" title="Просмотр">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon btn-download" onclick="downloadFile('${fileId}')" title="Скачать">
                <i class="fas fa-download"></i>
            </button>
        </div>
    `;

    return item;
}

// ============================================
// Просмотр файла
// ============================================
async function viewFile(fileId) {
    try {
        const fileDoc = await db.collection('clients').doc(currentUserPhone)
            .collection('files').doc(fileId).get();
        
        if (!fileDoc.exists) {
            alert('Файл не найден');
            return;
        }

        const file = fileDoc.data();
        
        if (file.url) {
            window.open(file.url, '_blank');
        } else {
            alert('URL файла не найден');
        }

    } catch (error) {
        console.error('Ошибка просмотра файла:', error);
        alert('Ошибка при открытии файла');
    }
}

// ============================================
// Скачивание файла
// ============================================
async function downloadFile(fileId) {
    try {
        const fileDoc = await db.collection('clients').doc(currentUserPhone)
            .collection('files').doc(fileId).get();
        
        if (!fileDoc.exists) {
            alert('Файл не найден');
            return;
        }

        const file = fileDoc.data();
        
        if (file.url) {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('URL файла не найден');
        }

    } catch (error) {
        console.error('Ошибка скачивания файла:', error);
        alert('Ошибка при скачивании файла');
    }
}

// ============================================
// Загрузка версий файлов
// ============================================
async function loadVersions() {
    try {
        const container = document.getElementById('versionsContent');
        container.innerHTML = '<div class="loader"><div class="spinner-large"></div></div>';

        // Группируем файлы по помещениям
        const filesSnapshot = await db.collection('clients').doc(currentUserPhone)
            .collection('files')
            .orderBy('room')
            .orderBy('version', 'desc')
            .get();

        if (filesSnapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>История версий пуста</p></div>';
            return;
        }

        // Группируем файлы по помещениям
        const roomGroups = {};
        filesSnapshot.forEach(doc => {
            const file = doc.data();
            const room = file.room || 'Общее';
            
            if (!roomGroups[room]) {
                roomGroups[room] = [];
            }
            roomGroups[room].push({id: doc.id, ...file});
        });

        // Создаем UI для каждого помещения
        container.innerHTML = '';
        Object.keys(roomGroups).forEach(room => {
            const roomSection = document.createElement('div');
            roomSection.className = 'files-list';
            roomSection.style.marginBottom = '2rem';
            
            let html = `<h3 style="margin-bottom: 1rem;">${room}</h3>`;
            
            roomGroups[room].forEach(file => {
                const uploadDate = file.uploadDate?.toDate ? 
                    file.uploadDate.toDate().toLocaleDateString('ru-RU') : 
                    'Дата неизвестна';
                
                html += `
                    <div class="file-item">
                        <div class="file-info">
                            <div class="file-details">
                                <div class="file-name">Версия ${file.version}: ${file.name}</div>
                                <div class="file-meta">${uploadDate} ${file.notes ? '• ' + file.notes : ''}</div>
                            </div>
                        </div>
                        <div class="file-actions">
                            <button class="btn-icon btn-view" onclick="viewFile('${file.id}')" title="Просмотр">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon btn-download" onclick="downloadFile('${file.id}')" title="Скачать">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            roomSection.innerHTML = html;
            container.appendChild(roomSection);
        });

    } catch (error) {
        console.error('Ошибка загрузки версий:', error);
        document.getElementById('versionsContent').innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Ошибка загрузки истории</p></div>';
    }
}

// ============================================
// Загрузка таймлайна проекта
// ============================================
async function loadTimeline() {
    try {
        const container = document.getElementById('projectTimeline');
        container.innerHTML = '<div class="loader"><div class="spinner-large"></div></div>';

        const stages = clientData.project?.stages || [];

        if (stages.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>Этапы проекта еще не добавлены</p></div>';
            return;
        }

        container.innerHTML = '';
        stages.forEach(stage => {
            const item = document.createElement('div');
            item.className = `timeline-item ${stage.status}`;
            
            let statusText = 'Ожидается';
            let statusClass = 'status-pending';
            
            if (stage.status === 'completed') {
                statusText = 'Завершен';
                statusClass = 'status-completed';
            } else if (stage.status === 'in_progress') {
                statusText = 'В работе';
                statusClass = 'status-in-progress';
            }

            const date = stage.date ? new Date(stage.date).toLocaleDateString('ru-RU') : '';

            item.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-title">${stage.name}</div>
                    ${date ? `<div class="timeline-date">${date}</div>` : ''}
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            `;

            container.appendChild(item);
        });

    } catch (error) {
        console.error('Ошибка загрузки таймлайна:', error);
        document.getElementById('projectTimeline').innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Ошибка загрузки этапов</p></div>';
    }
}

// ============================================
// Загрузка документов
// ============================================
async function loadDocuments() {
    try {
        const container = document.getElementById('documentsContent');
        container.innerHTML = '<div class="loader"><div class="spinner-large"></div></div>';

        const docsSnapshot = await db.collection('clients').doc(currentUserPhone)
            .collection('documents')
            .orderBy('date', 'desc')
            .get();

        if (docsSnapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-file-invoice"></i><p>Документы еще не добавлены</p></div>';
            return;
        }

        container.innerHTML = '';
        docsSnapshot.forEach(doc => {
            const document = doc.data();
            const item = createDocumentItem(document, doc.id);
            container.appendChild(item);
        });

    } catch (error) {
        console.error('Ошибка загрузки документов:', error);
        document.getElementById('documentsContent').innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Ошибка загрузки документов</p></div>';
    }
}

// ============================================
// Создание элемента документа
// ============================================
function createDocumentItem(document, docId) {
    const item = document.createElement('div');
    item.className = 'file-item';

    let statusText = 'Ожидает оплаты';
    let statusClass = 'status-pending';
    
    if (document.status === 'paid') {
        statusText = 'Оплачен';
        statusClass = 'status-completed';
    } else if (document.status === 'overdue') {
        statusText = 'Просрочен';
        statusClass = 'status-in-progress';
    }

    const date = document.date?.toDate ? 
        document.date.toDate().toLocaleDateString('ru-RU') : 
        'Дата неизвестна';

    const amount = document.amount ? 
        new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB'}).format(document.amount) : 
        '';

    item.innerHTML = `
        <div class="file-info">
            <div class="file-icon pdf">
                <i class="fas fa-file-invoice"></i>
            </div>
            <div class="file-details">
                <div class="file-name">${document.type === 'invoice' ? 'Счет' : document.type === 'contract' ? 'Договор' : 'Акт'} №${document.number}</div>
                <div class="file-meta">
                    ${date} ${amount ? '• ' + amount : ''}
                    <span class="status-badge ${statusClass}" style="margin-left: 10px;">${statusText}</span>
                </div>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-icon btn-view" onclick="viewDocument('${docId}')" title="Просмотр">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon btn-download" onclick="downloadDocument('${docId}')" title="Скачать">
                <i class="fas fa-download"></i>
            </button>
        </div>
    `;

    return item;
}

// ============================================
// Просмотр документа
// ============================================
async function viewDocument(docId) {
    try {
        const docRef = await db.collection('clients').doc(currentUserPhone)
            .collection('documents').doc(docId).get();
        
        if (!docRef.exists) {
            alert('Документ не найден');
            return;
        }

        const document = docRef.data();
        
        if (document.url) {
            window.open(document.url, '_blank');
        } else {
            alert('URL документа не найден');
        }

    } catch (error) {
        console.error('Ошибка просмотра документа:', error);
        alert('Ошибка при открытии документа');
    }
}

// ============================================
// Скачивание документа
// ============================================
async function downloadDocument(docId) {
    try {
        const docRef = await db.collection('clients').doc(currentUserPhone)
            .collection('documents').doc(docId).get();
        
        if (!docRef.exists) {
            alert('Документ не найден');
            return;
        }

        const document = docRef.data();
        
        if (document.url) {
            const link = document.createElement('a');
            link.href = document.url;
            link.download = `Документ_${document.number}.pdf`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('URL документа не найден');
        }

    } catch (error) {
        console.error('Ошибка скачивания документа:', error);
        alert('Ошибка при скачивании документа');
    }
}

// ============================================
// Загрузка спецификаций
// ============================================
async function loadSpecifications() {
    try {
        const container = document.getElementById('specificationsContent');
        container.innerHTML = '<div class="loader"><div class="spinner-large"></div></div>';

        const specifications = clientData.specifications || {};

        if (!specifications.materials && !specifications.lighting && !specifications.furniture) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-list-alt"></i><p>Спецификации еще не добавлены</p></div>';
            return;
        }

        let html = '';

        // Материалы
        if (specifications.materials && specifications.materials.length > 0) {
            html += createSpecificationTable('Материалы', specifications.materials);
        }

        // Освещение
        if (specifications.lighting && specifications.lighting.length > 0) {
            html += createSpecificationTable('Освещение', specifications.lighting);
        }

        // Мебель
        if (specifications.furniture && specifications.furniture.length > 0) {
            html += createSpecificationTable('Мебель', specifications.furniture);
        }

        container.innerHTML = html;

    } catch (error) {
        console.error('Ошибка загрузки спецификаций:', error);
        document.getElementById('specificationsContent').innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Ошибка загрузки спецификаций</p></div>';
    }
}

// ============================================
// Создание таблицы спецификации
// ============================================
function createSpecificationTable(title, items) {
    let html = `
        <div class="files-list" style="margin-bottom: 2rem; overflow-x: auto;">
            <h3 style="margin-bottom: 1rem;">${title}</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-light); text-align: left;">
                        <th style="padding: 12px; border-bottom: 2px solid #e5e5e5;">Название</th>
                        <th style="padding: 12px; border-bottom: 2px solid #e5e5e5;">Артикул</th>
                        <th style="padding: 12px; border-bottom: 2px solid #e5e5e5;">Кол-во</th>
                        <th style="padding: 12px; border-bottom: 2px solid #e5e5e5;">Цена</th>
                        <th style="padding: 12px; border-bottom: 2px solid #e5e5e5;">Ссылка</th>
                    </tr>
                </thead>
                <tbody>
    `;

    items.forEach(item => {
        const price = item.price ? 
            new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB'}).format(item.price) : 
            '-';

        html += `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${item.name || '-'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${item.article || '-'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${item.qty || '-'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${price}</td>
                <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
                    ${item.link ? `<a href="${item.link}" target="_blank" style="color: var(--primary-color);">Открыть</a>` : '-'}
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    return html;
}

// ============================================
// Вспомогательные функции
// ============================================
function showError(message) {
    alert(message);
}

console.log('✅ Dashboard script loaded');
