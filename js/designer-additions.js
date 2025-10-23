// ============================================
// ОБНОВЛЕНИЯ ДЛЯ designer.js
// ============================================

// Добавить после существующих функций в designer.js

// ============================================
// ДЕТАЛИ ПРОЕКТА (ПОЛНАЯ РЕАЛИЗАЦИЯ)
// ============================================

function showProjectDetails(projectId) {
    const project = assignedProjects.find(p => p.id === projectId);
    if (!project) {
        alert('❌ Проект не найден');
        return;
    }

    const personal = project.personalInfo || {};
    const projectInfo = project.projectInfo || {};
    const finance = projectInfo.finance || {};
    
    const totalCost = parseFloat(finance.totalCost) || 0;
    const paidAmount = parseFloat(finance.paidAmount) || 0;
    const remaining = totalCost - paidAmount;

    const modalHTML = `
        <div class="modal active" id="projectDetailsModal" onclick="if(event.target === this) closeProjectDetails()">
            <div class="modal-content" style="max-width: 1200px; width: 90%;">
                <div class="modal-header">
                    <h2><i class="fas fa-info-circle"></i> Детали проекта</h2>
                    <button class="close-modal" onclick="closeProjectDetails()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div style="padding: 1.5rem 0;">
                    <!-- Основная информация -->
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: var(--primary-color); margin-bottom: 1rem; font-size: 1.1rem;">
                            <i class="fas fa-clipboard-list"></i> Основная информация
                        </h3>
                        <div style="display: grid; gap: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Название:</span>
                                <strong>${projectInfo.title || 'Не указано'}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Площадь:</span>
                                <strong>${projectInfo.area || 'Не указана'}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Статус:</span>
                                <span class="status-badge ${projectInfo.status === 'Завершён' ? 'completed' : 'active'}">
                                    ${projectInfo.status || 'В работе'}
                                </span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Прогресс:</span>
                                <strong>${projectInfo.progress || 0}%</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Даты -->
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: var(--primary-color); margin-bottom: 1rem; font-size: 1.1rem;">
                            <i class="fas fa-calendar"></i> Сроки
                        </h3>
                        <div style="display: grid; gap: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Начало:</span>
                                <strong>${projectInfo.startDate ? formatDate(new Date(projectInfo.startDate)) : 'Не указано'}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Дедлайн:</span>
                                <strong style="color: ${isOverdue(projectInfo.deadline) ? 'var(--danger)' : 'inherit'}">
                                    ${projectInfo.deadline ? formatDate(new Date(projectInfo.deadline)) : 'Не указан'}
                                    ${isOverdue(projectInfo.deadline) ? ' ⚠️ Просрочен' : ''}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <!-- Финансы -->
                    <div style="margin-bottom: 2rem;">
                        <h3 style="color: var(--primary-color); margin-bottom: 1rem; font-size: 1.1rem;">
                            <i class="fas fa-ruble-sign"></i> Финансовая информация
                        </h3>
                        <div style="display: grid; gap: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Общая стоимость:</span>
                                <strong>${formatMoney(totalCost)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Оплачено:</span>
                                <strong style="color: var(--success)">${formatMoney(paidAmount)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Остаток:</span>
                                <strong style="color: ${remaining > 0 ? 'var(--danger)' : 'var(--success)'}">
                                    ${formatMoney(remaining)}
                                </strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Статус оплаты:</span>
                                <span class="status-badge ${finance.paymentStatus === 'Оплачено' ? 'completed' : 'pending'}">
                                    ${finance.paymentStatus || 'Не оплачено'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Клиент -->
                    <div style="margin-bottom: 1rem;">
                        <h3 style="color: var(--primary-color); margin-bottom: 1rem; font-size: 1.1rem;">
                            <i class="fas fa-user"></i> Информация о клиенте
                        </h3>
                        <div style="display: grid; gap: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Имя:</span>
                                <strong>${personal.name || 'Не указано'}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Телефон:</span>
                                <a href="tel:${personal.phone}" style="color: var(--primary-color); text-decoration: none;">
                                    <strong>${personal.phone || 'Не указан'}</strong>
                                </a>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                                <span style="color: var(--text-light);">Email:</span>
                                <a href="mailto:${personal.email}" style="color: var(--primary-color); text-decoration: none;">
                                    ${personal.email || 'Не указан'}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeProjectDetails()">
                        <i class="fas fa-check"></i> Понятно
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeProjectDetails() {
    const modal = document.getElementById('projectDetailsModal');
    if (modal) {
        modal.remove();
    }
}

function isOverdue(deadline) {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
}

function formatMoney(amount) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₽';
}

// ============================================
// УПРАВЛЕНИЕ ЭТАПАМИ (ПОЛНАЯ РЕАЛИЗАЦИЯ)
// ============================================

async function showStages(projectId) {
    const project = assignedProjects.find(p => p.id === projectId);
    if (!project) {
        alert('❌ Проект не найден');
        return;
    }

    // Загружаем этапы из Firebase
    const stages = project.stages || [];

    const modalHTML = `
        <div class="modal active" id="stagesModal" onclick="if(event.target === this) closeStages()">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2><i class="fas fa-tasks"></i> Этапы проекта</h2>
                    <button class="close-modal" onclick="closeStages()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div style="padding: 1.5rem 0;">
                    <div style="margin-bottom: 1.5rem;">
                        <button class="btn btn-primary" onclick="openAddStageModal('${projectId}')">
                            <i class="fas fa-plus"></i> Добавить этап
                        </button>
                    </div>

                    <div id="stagesList">
                        ${stages.length === 0 ? 
                            '<p style="text-align: center; color: var(--text-light); padding: 2rem;">Этапов пока нет. Добавьте первый этап!</p>' : 
                            renderStages(stages, projectId)
                        }
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeStages()">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function renderStages(stages, projectId) {
    return stages.map((stage, index) => `
        <div style="background: white; border-radius: 10px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" 
                                   ${stage.completed ? 'checked' : ''} 
                                   onchange="toggleStage('${projectId}', ${index})"
                                   style="width: 20px; height: 20px; cursor: pointer;">
                        </label>
                        <h3 style="margin: 0; font-size: 1.1rem; ${stage.completed ? 'text-decoration: line-through; color: var(--text-light);' : ''}">
                            ${stage.title}
                        </h3>
                    </div>
                    ${stage.description ? `<p style="color: var(--text-light); margin-left: 2.5rem;">${stage.description}</p>` : ''}
                    ${stage.deadline ? `
                        <p style="color: var(--primary-color); font-size: 0.9rem; margin-left: 2.5rem; margin-top: 0.5rem;">
                            <i class="fas fa-calendar-alt"></i> Дедлайн: ${formatDate(new Date(stage.deadline))}
                        </p>
                    ` : ''}
                    ${stage.completedAt ? `<p style="color: var(--success); font-size: 0.9rem; margin-left: 2.5rem; margin-top: 0.5rem;"><i class="fas fa-check"></i> Завершено ${formatDate(new Date(stage.completedAt))}</p>` : ''}
                </div>
                <button onclick="deleteStage('${projectId}', ${index})" 
                        style="background: var(--danger); color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// МОДАЛЬНОЕ ОКНО ДЛЯ ДОБАВЛЕНИЯ ЭТАПА
// ============================================

function openAddStageModal(projectId) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const modalHTML = `
        <div class="modal active" id="addStageModal" onclick="if(event.target === this) closeAddStageModal()" style="z-index: 1001;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2><i class="fas fa-plus-circle"></i> Добавить новый этап</h2>
                    <button class="close-modal" onclick="closeAddStageModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Название этапа -->
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-dark);">
                            <i class="fas fa-heading"></i> Название этапа *
                        </label>
                        <input type="text" 
                               id="stageTitle" 
                               placeholder="Например: Разработка дизайн-проекта"
                               style="width: 100%; padding: 12px; border: 2px solid #e5e5e5; border-radius: 10px; font-size: 1rem; outline: none; transition: all 0.3s ease;"
                               onfocus="this.style.borderColor='var(--primary-color)'"
                               onblur="this.style.borderColor='#e5e5e5'">
                    </div>

                    <!-- Описание -->
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-dark);">
                            <i class="fas fa-align-left"></i> Описание (необязательно)
                        </label>
                        <textarea 
                            id="stageDescription" 
                            placeholder="Подробное описание этапа..."
                            rows="4"
                            style="width: 100%; padding: 12px; border: 2px solid #e5e5e5; border-radius: 10px; font-size: 1rem; outline: none; resize: vertical; font-family: inherit; transition: all 0.3s ease;"
                            onfocus="this.style.borderColor='var(--primary-color)'"
                            onblur="this.style.borderColor='#e5e5e5'"></textarea>
                    </div>

                    <!-- Дедлайн -->
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-dark);">
                            <i class="fas fa-calendar-alt"></i> Дедлайн (необязательно)
                        </label>
                        
                        <!-- Выбранная дата -->
                        <div id="selectedDateDisplay" style="padding: 12px; background: #f8f9fa; border-radius: 10px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
                            <span style="color: var(--text-light);" id="selectedDateText">Дата не выбрана</span>
                            <button onclick="clearSelectedDate()" id="clearDateBtn" style="display: none; background: var(--danger); color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.85rem;">
                                <i class="fas fa-times"></i> Очистить
                            </button>
                        </div>

                        <!-- Календарь -->
                        <div style="background: white; border: 2px solid #e5e5e5; border-radius: 10px; padding: 1rem;">
                            <!-- Заголовок календаря -->
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <button onclick="changeMonth(-1)" class="btn btn-secondary" style="padding: 8px 12px;">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <h3 id="calendarMonthYear" style="margin: 0; color: var(--primary-color); font-size: 1.1rem;">
                                    ${getMonthName(currentMonth)} ${currentYear}
                                </h3>
                                <button onclick="changeMonth(1)" class="btn btn-secondary" style="padding: 8px 12px;">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>

                            <!-- Дни недели -->
                            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-bottom: 0.5rem;">
                                ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => `
                                    <div style="text-align: center; font-weight: 600; color: var(--text-light); font-size: 0.85rem; padding: 5px;">
                                        ${day}
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Дни календаря -->
                            <div id="calendarDays" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
                                ${generateCalendarDays(currentMonth, currentYear)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeAddStageModal()">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                    <button class="btn btn-primary" onclick="saveNewStage('${projectId}')">
                        <i class="fas fa-check"></i> Добавить этап
                    </button>
                </div>
            </div>
        </div>

        <style>
            .calendar-day {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
                border: 2px solid transparent;
            }
            
            .calendar-day:hover:not(.other-month):not(.selected) {
                background: #e8f5e9;
                border-color: var(--primary-light);
            }
            
            .calendar-day.today {
                border-color: var(--primary-color);
                font-weight: 700;
            }
            
            .calendar-day.selected {
                background: var(--primary-color);
                color: white;
                font-weight: 700;
            }
            
            .calendar-day.other-month {
                color: #ccc;
                cursor: default;
            }
            
            .calendar-day.weekend:not(.selected) {
                color: var(--danger);
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

let selectedDate = null;
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

function generateCalendarDays(month, year) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    // Понедельник = 1, Воскресенье = 0
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let daysHTML = '';
    
    // Дни предыдущего месяца
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevLastDay.getDate() - i;
        daysHTML += `
            <div class="calendar-day other-month">
                ${day}
            </div>
        `;
    }
    
    // Дни текущего месяца
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);
        
        const isToday = currentDate.getTime() === today.getTime();
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
        const isSelected = selectedDate && selectedDate.getTime() === currentDate.getTime();
        
        const classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (isWeekend) classes.push('weekend');
        if (isSelected) classes.push('selected');
        
        daysHTML += `
            <div class="${classes.join(' ')}" onclick="selectDate(${year}, ${month}, ${day})">
                ${day}
            </div>
        `;
    }
    
    // Дни следующего месяца для заполнения сетки
    const totalCells = firstDayOfWeek + lastDay.getDate();
    const remainingCells = 7 - (totalCells % 7);
    
    if (remainingCells < 7) {
        for (let day = 1; day <= remainingCells; day++) {
            daysHTML += `
                <div class="calendar-day other-month">
                    ${day}
                </div>
            `;
        }
    }
    
    return daysHTML;
}

function changeMonth(delta) {
    calendarMonth += delta;
    
    if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    } else if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    }
    
    document.getElementById('calendarMonthYear').textContent = 
        `${getMonthName(calendarMonth)} ${calendarYear}`;
    
    document.getElementById('calendarDays').innerHTML = 
        generateCalendarDays(calendarMonth, calendarYear);
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Обновляем отображение выбранной даты
    const dateText = formatDate(selectedDate);
    document.getElementById('selectedDateText').textContent = dateText;
    document.getElementById('selectedDateText').style.color = 'var(--primary-color)';
    document.getElementById('selectedDateText').style.fontWeight = '600';
    document.getElementById('clearDateBtn').style.display = 'block';
    
    // Обновляем календарь
    document.getElementById('calendarDays').innerHTML = 
        generateCalendarDays(calendarMonth, calendarYear);
}

function clearSelectedDate() {
    selectedDate = null;
    document.getElementById('selectedDateText').textContent = 'Дата не выбрана';
    document.getElementById('selectedDateText').style.color = 'var(--text-light)';
    document.getElementById('selectedDateText').style.fontWeight = 'normal';
    document.getElementById('clearDateBtn').style.display = 'none';
    
    // Обновляем календарь
    document.getElementById('calendarDays').innerHTML = 
        generateCalendarDays(calendarMonth, calendarYear);
}

function getMonthName(month) {
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month];
}

async function saveNewStage(projectId) {
    const title = document.getElementById('stageTitle').value.trim();
    const description = document.getElementById('stageDescription').value.trim();
    
    if (!title) {
        alert('⚠️ Введите название этапа!');
        document.getElementById('stageTitle').focus();
        return;
    }

    try {
        const project = assignedProjects.find(p => p.id === projectId);
        const stages = project.stages || [];
        
        const newStage = {
            title: title,
            description: description || '',
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // Добавляем дедлайн если выбран
        if (selectedDate) {
            newStage.deadline = selectedDate.toISOString();
        }
        
        stages.push(newStage);

        await firebaseDb.collection('clients').doc(projectId).update({
            stages: stages
        });

        alert('✅ Этап добавлен!');
        closeAddStageModal();
        closeStages();
        await loadAssignedProjects();
        showStages(projectId);

    } catch (error) {
        console.error('Ошибка добавления этапа:', error);
        alert('❌ Ошибка добавления этапа');
    }
}

function closeAddStageModal() {
    const modal = document.getElementById('addStageModal');
    if (modal) {
        modal.remove();
    }
    // Сбрасываем выбранную дату
    selectedDate = null;
    calendarMonth = new Date().getMonth();
    calendarYear = new Date().getFullYear();
}

async function toggleStage(projectId, index) {
    try {
        const project = assignedProjects.find(p => p.id === projectId);
        const stages = project.stages || [];
        
        stages[index].completed = !stages[index].completed;
        
        if (stages[index].completed) {
            stages[index].completedAt = new Date().toISOString();
        } else {
            delete stages[index].completedAt;
        }

        await firebaseDb.collection('clients').doc(projectId).update({
            stages: stages
        });

        // Обновляем прогресс проекта
        const completedCount = stages.filter(s => s.completed).length;
        const progress = Math.round((completedCount / stages.length) * 100);
        
        await firebaseDb.collection('clients').doc(projectId).update({
            'projectInfo.progress': progress
        });

        await loadAssignedProjects();
        closeStages();
        showStages(projectId);

    } catch (error) {
        console.error('Ошибка обновления этапа:', error);
        alert('❌ Ошибка обновления этапа');
    }
}

async function deleteStage(projectId, index) {
    if (!confirm('Удалить этот этап?')) return;

    try {
        const project = assignedProjects.find(p => p.id === projectId);
        const stages = project.stages || [];
        
        stages.splice(index, 1);

        await firebaseDb.collection('clients').doc(projectId).update({
            stages: stages
        });

        alert('✅ Этап удалён!');
        closeStages();
        await loadAssignedProjects();
        showStages(projectId);

    } catch (error) {
        console.error('Ошибка удаления этапа:', error);
        alert('❌ Ошибка удаления этапа');
    }
}

function closeStages() {
    const modal = document.getElementById('stagesModal');
    if (modal) {
        modal.remove();
    }
}

console.log('✅ Дополнительные функции designer.js с модальным окном этапов загружены');
