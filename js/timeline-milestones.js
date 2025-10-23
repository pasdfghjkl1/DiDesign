// ============================================
// TIMELINE УПРАВЛЕНИЕ ЭТАПАМИ - Gantt Chart
// ============================================

// Глобальные переменные для фильтров
let timelineFilters = {
    showCompleted: true,
    projectType: 'all', // all, viz, design, etc.
};

function showTimelineMilestones() {
    const tabContent = document.getElementById('milestones-content');
    
    if (!assignedProjects || assignedProjects.length === 0) {
        tabContent.innerHTML = `
            <div style="background: white; padding: 3rem; border-radius: 15px; box-shadow: var(--shadow); text-align: center;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <h2>Нет назначенных проектов</h2>
                <p style="color: var(--text-light);">Администратор назначит вам проекты для работы</p>
            </div>
        `;
        return;
    }

    // Получаем уникальные типы проектов для фильтра
    const projectTypes = getUniqueProjectTypes();
    
    // Создаём временную шкалу
    const timelineHTML = generateTimeline();
    
    tabContent.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: var(--shadow);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h2 style="margin: 0; color: var(--primary-color);">
                        <i class="fas fa-calendar-alt"></i> Управление этапами
                    </h2>
                    <p style="color: var(--text-light); margin: 0.5rem 0 0 0;">
                        Визуальная временная шкала всех проектов и этапов
                    </p>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" onclick="shiftTimelineLeft()">
                        <i class="fas fa-chevron-left"></i> Назад
                    </button>
                    <button class="btn btn-secondary" onclick="resetTimelineToToday()">
                        <i class="fas fa-calendar-day"></i> Сегодня
                    </button>
                    <button class="btn btn-secondary" onclick="shiftTimelineRight()">
                        Вперёд <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <!-- Панель фильтров -->
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border-left: 4px solid var(--primary-color);">
                <div style="display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;">
                    <div style="font-weight: 600; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-filter"></i>
                        Фильтры и сортировка:
                    </div>
                    
                    <!-- Фильтр по статусу -->
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 8px 12px; background: white; border-radius: 8px; border: 2px solid #e5e5e5; transition: all 0.3s ease;">
                            <input type="checkbox" id="showCompletedFilter" 
                                   ${timelineFilters.showCompleted ? 'checked' : ''}
                                   onchange="toggleCompletedFilter(this.checked)"
                                   style="cursor: pointer;">
                            <span style="font-weight: 500;">
                                <i class="fas fa-check-circle" style="color: var(--success);"></i>
                                Показывать завершённые
                            </span>
                        </label>
                    </div>
                    
                    <!-- Фильтр по типу проекта -->
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="font-weight: 500; color: var(--text-dark);">Тип проекта:</span>
                        <select id="projectTypeFilter" 
                                onchange="changeProjectTypeFilter(this.value)"
                                style="padding: 8px 12px; border: 2px solid #e5e5e5; border-radius: 8px; background: white; cursor: pointer; font-weight: 500; outline: none; transition: all 0.3s ease;">
                            <option value="all">Все типы</option>
                            ${projectTypes.map(type => `
                                <option value="${type}" ${timelineFilters.projectType === type ? 'selected' : ''}>
                                    ${type}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- Счётчик проектов -->
                    <div style="margin-left: auto; padding: 8px 16px; background: var(--primary-color); color: white; border-radius: 8px; font-weight: 600;">
                        <i class="fas fa-project-diagram"></i>
                        <span id="visibleProjectsCount">0</span> проектов
                    </div>
                </div>
            </div>

            ${timelineHTML}
        </div>

        <style>
            .timeline-date-cell.weekend {
                background: #f8f9fa;
            }
            
            .milestone-block {
                position: absolute;
                height: 60%;
                top: 20%;
                border-radius: 8px;
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            
            .milestone-block:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 100;
                height: 70%;
                top: 15%;
            }
            
            .milestone-block.completed {
                background: var(--success) !important;
                opacity: 0.7;
            }
            
            .project-start-marker,
            .project-end-marker {
                position: absolute;
                width: 3px;
                height: 100%;
                top: 0;
                z-index: 5;
            }
            
            .project-start-marker {
                background: #28a745;
                box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
            }
            
            .project-end-marker {
                background: #dc3545;
                box-shadow: 0 0 10px rgba(220, 53, 69, 0.5);
            }
            
            .gap-indicator {
                position: absolute;
                height: 30%;
                top: 35%;
                background: repeating-linear-gradient(
                    45deg,
                    #ffc107,
                    #ffc107 5px,
                    #fff3cd 5px,
                    #fff3cd 10px
                );
                border: 1px dashed #ffc107;
                border-radius: 4px;
                opacity: 0.6;
            }
            
            .project-row-hidden {
                display: none !important;
            }
            
            #showCompletedFilter:checked + span {
                color: var(--success);
            }
            
            label:has(#showCompletedFilter) {
                transition: all 0.3s ease;
            }
            
            label:has(#showCompletedFilter):hover {
                border-color: var(--success);
                background: #f0fff4;
            }
            
            #projectTypeFilter:focus,
            #projectTypeFilter:hover {
                border-color: var(--primary-color);
            }
        </style>
    `;
    
    // Обновляем счётчик видимых проектов
    updateVisibleProjectsCount();
}

function getUniqueProjectTypes() {
    const types = new Set();
    
    assignedProjects.forEach(project => {
        const type = project.projectInfo?.type || project.projectInfo?.projectType || 'Без типа';
        types.add(type);
    });
    
    return Array.from(types).sort();
}

function toggleCompletedFilter(showCompleted) {
    timelineFilters.showCompleted = showCompleted;
    applyFilters();
}

function changeProjectTypeFilter(type) {
    timelineFilters.projectType = type;
    applyFilters();
}

function applyFilters() {
    const projectRows = document.querySelectorAll('.timeline-project-row');
    let visibleCount = 0;
    
    projectRows.forEach(row => {
        const projectId = row.getAttribute('data-project-id');
        const project = assignedProjects.find(p => p.id === projectId);
        
        if (!project) return;
        
        let shouldShow = true;
        
        // Фильтр по статусу завершения
        if (!timelineFilters.showCompleted) {
            const status = project.projectInfo?.status || '';
            if (status === 'Завершён' || status === 'Завершен' || status === 'completed') {
                shouldShow = false;
            }
        }
        
        // Фильтр по типу проекта
        if (timelineFilters.projectType !== 'all') {
            const projectType = project.projectInfo?.type || project.projectInfo?.projectType || 'Без типа';
            if (projectType !== timelineFilters.projectType) {
                shouldShow = false;
            }
        }
        
        if (shouldShow) {
            row.classList.remove('project-row-hidden');
            visibleCount++;
        } else {
            row.classList.add('project-row-hidden');
        }
    });
    
    updateVisibleProjectsCount(visibleCount);
}

function updateVisibleProjectsCount(count) {
    const counter = document.getElementById('visibleProjectsCount');
    if (counter) {
        if (count === undefined) {
            // Подсчитываем видимые строки
            const visibleRows = document.querySelectorAll('.timeline-project-row:not(.project-row-hidden)');
            count = visibleRows.length;
        }
        counter.textContent = count;
    }
}

let timelineStartDate = new Date();

function generateTimeline() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Генерируем даты на месяц вперёд от текущей позиции
    const daysToShow = 30;
    const dates = [];
    
    for (let i = 0; i < daysToShow; i++) {
        const date = new Date(timelineStartDate);
        date.setDate(date.getDate() + i);
        dates.push(date);
    }

    // HTML для шкалы дат
    const dateHeaderHTML = dates.map(date => {
        const isToday = date.toDateString() === today.toDateString();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        return `
            <div class="timeline-date-cell ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}" 
                 style="min-width: 60px; padding: 0.5rem; text-align: center; border-right: 1px solid #e5e5e5; ${isToday ? 'background: #d4edda; font-weight: 700;' : ''}">
                <div style="font-size: 0.75rem; color: var(--text-light);">
                    ${['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'][date.getDay()]}
                </div>
                <div style="font-size: 1rem; font-weight: 600;">
                    ${date.getDate()}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-light);">
                    ${['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'][date.getMonth()]}
                </div>
            </div>
        `;
    }).join('');

    // HTML для каждого проекта
    const projectRowsHTML = assignedProjects.map(project => {
        return generateProjectRow(project, dates);
    }).join('');

    return `
        <div style="overflow-x: auto; overflow-y: visible;">
            <!-- Шапка с датами -->
            <div style="display: flex; position: sticky; top: 0; background: white; z-index: 10; border-bottom: 2px solid var(--primary-color); margin-bottom: 1rem;">
                <div style="min-width: 250px; padding: 1rem; font-weight: 700; background: #f8f9fa; border-right: 2px solid var(--primary-color);">
                    Проект / Клиент
                </div>
                <div style="display: flex; flex: 1;">
                    ${dateHeaderHTML}
                </div>
            </div>

            <!-- Строки проектов -->
            ${projectRowsHTML}
        </div>
    `;
}

function generateProjectRow(project, dates) {
    const info = project.projectInfo || {};
    const personal = project.personalInfo || {};
    const stages = project.stages || [];
    
    const projectStart = info.startDate ? new Date(info.startDate) : null;
    const projectEnd = info.deadline ? new Date(info.deadline) : null;
    
    // Определяем тип проекта для отображения
    const projectType = info.type || info.projectType || 'Без типа';
    
    // Вычисляем позиции этапов на шкале
    const milestonesHTML = stages.map((stage, index) => {
        if (!stage.deadline) return '';
        
        const stageDate = new Date(stage.deadline);
        const daysSinceStart = Math.floor((stageDate - dates[0]) / (1000 * 60 * 60 * 24));
        
        if (daysSinceStart < 0 || daysSinceStart >= dates.length) return '';
        
        const left = daysSinceStart * 60; // 60px на день
        const colors = ['#6c9c84', '#d4a574', '#9c7c6c', '#a5886c', '#8c9c6c'];
        const color = colors[index % colors.length];
        
        return `
            <div class="milestone-block ${stage.completed ? 'completed' : ''}" 
                 style="left: ${left}px; width: 55px; background: ${color};"
                 title="${stage.title} - ${formatDate(stageDate)}"
                 onclick="showStageDetails('${project.id}', ${index})">
                ${stage.title.substring(0, 10)}${stage.title.length > 10 ? '...' : ''}
            </div>
        `;
    }).join('');
    
    // Маркеры начала и конца проекта
    let startMarker = '';
    let endMarker = '';
    
    if (projectStart) {
        const daysSinceStart = Math.floor((projectStart - dates[0]) / (1000 * 60 * 60 * 24));
        if (daysSinceStart >= 0 && daysSinceStart < dates.length) {
            startMarker = `
                <div class="project-start-marker" 
                     style="left: ${daysSinceStart * 60}px;"
                     title="Начало проекта: ${formatDate(projectStart)}">
                </div>
            `;
        }
    }
    
    if (projectEnd) {
        const daysToEnd = Math.floor((projectEnd - dates[0]) / (1000 * 60 * 60 * 24));
        if (daysToEnd >= 0 && daysToEnd < dates.length) {
            endMarker = `
                <div class="project-end-marker" 
                     style="left: ${daysToEnd * 60}px;"
                     title="Дедлайн: ${formatDate(projectEnd)}">
                </div>
            `;
        }
    }
    
    // Индикаторы перерывов между этапами
    let gapsHTML = '';
    for (let i = 0; i < stages.length - 1; i++) {
        if (!stages[i].deadline || !stages[i + 1].deadline) continue;
        
        const stage1End = new Date(stages[i].deadline);
        const stage2Start = new Date(stages[i + 1].deadline);
        
        const gap = Math.floor((stage2Start - stage1End) / (1000 * 60 * 60 * 24));
        
        if (gap > 2) { // Показываем только если перерыв больше 2 дней
            const gapStartDays = Math.floor((stage1End - dates[0]) / (1000 * 60 * 60 * 24));
            const left = gapStartDays * 60;
            const width = gap * 60;
            
            if (left >= 0 && left < dates.length * 60) {
                gapsHTML += `
                    <div class="gap-indicator" 
                         style="left: ${left}px; width: ${width}px;"
                         title="Перерыв: ${gap} дн.">
                    </div>
                `;
            }
        }
    }

    return `
        <div class="timeline-project-row" 
             data-project-id="${project.id}"
             style="display: flex; border-bottom: 1px solid #e5e5e5; min-height: 80px;">
            <!-- Название проекта -->
            <div style="min-width: 250px; padding: 1rem; background: #f8f9fa; border-right: 1px solid #e5e5e5; display: flex; flex-direction: column; justify-content: center;">
                <div style="font-weight: 700; color: var(--primary-color); margin-bottom: 0.25rem;">
                    ${info.title || 'Без названия'}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-light);">
                    <i class="fas fa-user"></i> ${personal.name || 'Клиент'}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-light); margin-top: 0.25rem;">
                    <i class="fas fa-tag"></i> ${projectType}
                </div>
                <div style="margin-top: 0.5rem;">
                    <span class="project-status ${info.status === 'Завершён' || info.status === 'Завершен' ? 'status-completed' : 'status-active'}" 
                          style="font-size: 0.75rem; padding: 3px 8px;">
                        ${info.status || 'В работе'}
                    </span>
                </div>
            </div>

            <!-- Временная шкала -->
            <div style="flex: 1; position: relative; min-height: 80px;">
                ${startMarker}
                ${endMarker}
                ${gapsHTML}
                ${milestonesHTML}
            </div>
        </div>
    `;
}

function shiftTimelineLeft() {
    timelineStartDate.setDate(timelineStartDate.getDate() - 7);
    showTimelineMilestones();
}

function shiftTimelineRight() {
    timelineStartDate.setDate(timelineStartDate.getDate() + 7);
    showTimelineMilestones();
}

function resetTimelineToToday() {
    timelineStartDate = new Date();
    showTimelineMilestones();
}

function showStageDetails(projectId, stageIndex) {
    const project = assignedProjects.find(p => p.id === projectId);
    if (!project) return;
    
    const stage = project.stages[stageIndex];
    if (!stage) return;
    
    alert(`
📋 Этап: ${stage.title}

📅 Дедлайн: ${stage.deadline ? formatDate(new Date(stage.deadline)) : 'Не указан'}

📝 Описание: ${stage.description || 'Нет описания'}

✅ Статус: ${stage.completed ? 'Завершён ✓' : 'В работе'}

${stage.completedAt ? '🎉 Завершён: ' + formatDate(new Date(stage.completedAt)) : ''}
    `);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

console.log('✅ Timeline Milestones с фильтрами загружен');
