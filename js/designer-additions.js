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
            <div class="modal-content" style="max-width: 700px;">
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
                        <button class="btn btn-primary" onclick="addNewStage('${projectId}')">
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

async function addNewStage(projectId) {
    const title = prompt('Введите название этапа:');
    if (!title || !title.trim()) return;

    const description = prompt('Описание этапа (необязательно):');

    try {
        const project = assignedProjects.find(p => p.id === projectId);
        const stages = project.stages || [];
        
        stages.push({
            title: title.trim(),
            description: description?.trim() || '',
            completed: false,
            createdAt: new Date().toISOString()
        });

        await firebaseDb.collection('clients').doc(projectId).update({
            stages: stages
        });

        alert('✅ Этап добавлен!');
        closeStages();
        await loadProjects();
        showStages(projectId);

    } catch (error) {
        console.error('Ошибка добавления этапа:', error);
        alert('❌ Ошибка добавления этапа');
    }
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

        await loadProjects();
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
        await loadProjects();
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

console.log('✅ Дополнительные функции designer.js загружены');
