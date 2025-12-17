// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let days = [];
    let usedDays = [];
    let currentSwipeTarget = null;
    let swipeProgress = 0;
    let isSwiping = false;
    
    // Elementos del DOM para móvil
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const closeInfoBtn = document.getElementById('close-info');
    const infoPanel = document.querySelector('.info-panel.mobile-info');
    const daysCountElement = document.getElementById('days-count');
    const exercisesCountElement = document.getElementById('exercises-count');
    const videosCountElement = document.getElementById('videos-count');
    const floatingAddDay = document.getElementById('floating-add-day');
    const floatingPreview = document.getElementById('floating-preview');
    const floatingGenerate = document.getElementById('floating-generate');
    const emptyAddDay = document.getElementById('empty-add-day');
    const expandAllBtn = document.getElementById('expand-all');
    const daysContainer = document.getElementById('days-container');
    const addDayBtn = document.getElementById('add-day-btn');
    const previewBtn = document.getElementById('preview-btn');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    const dayModal = document.getElementById('day-modal');
    const dayModalTitle = document.getElementById('day-modal-title');
    const dayForm = document.getElementById('day-form');
    const closeDayModal = document.getElementById('close-day-modal');
    const cancelDayBtn = document.getElementById('cancel-day-btn');
    const exerciseModal = document.getElementById('exercise-modal');
    const exerciseModalTitle = document.getElementById('exercise-modal-title');
    const exerciseModalSubtitle = document.getElementById('exercise-modal-subtitle');
    const exerciseForm = document.getElementById('exercise-form');
    const closeExerciseModal = document.getElementById('close-exercise-modal');
    const cancelExerciseBtn = document.getElementById('cancel-exercise-btn');
    const previewSection = document.getElementById('preview-section');
    const closePreviewBtn = document.getElementById('close-preview');
    const pdfPreview = document.getElementById('pdf-preview');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const editRoutineBtn = document.getElementById('edit-routine-btn');
    const clientModal = document.getElementById('client-modal');
    const clientNameInput = document.getElementById('client-name');
    const routineNameInput = document.getElementById('routine-name');
    const routineNotesInput = document.getElementById('routine-notes');
    const closeClientModal = document.getElementById('close-client-modal');
    const confirmClientBtn = document.getElementById('confirm-client-btn');
    const cancelClientBtn = document.getElementById('cancel-client-btn');
    const mainFab = document.getElementById('main-fab');
    const fabOptions = document.querySelector('.fab-options');
    const fabAddDay = document.getElementById('fab-add-day');
    const fabQuickExercise = document.getElementById('fab-quick-exercise');
    const fabPreview = document.getElementById('fab-preview');
    const toast = document.getElementById('toast');
    
    // Variables para edición
    let isEditingDay = false;
    let editingDayIndex = null;
    let isEditingExercise = false;
    let editingExerciseDayIndex = null;
    let editingExerciseIndex = null;
    
    // Días de la semana
    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    // ========== INICIALIZACIÓN ==========
    
    // Ocultar panel de información después de 10 segundos
    setTimeout(() => {
        infoPanel.classList.add('hidden');
    }, 10000);
    
    // Cargar datos guardados (si existen)
    loadSavedData();
    
    // ========== MANEJO DE INTERFAZ MÓVIL ==========
    
    // Menú hamburguesa
    mobileMenuBtn.addEventListener('click', function() {
        mainNav.classList.toggle('hidden');
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-times');
    });
    
    // Cerrar panel de información
    closeInfoBtn.addEventListener('click', function() {
        infoPanel.classList.add('hidden');
    });
    
    // Botones flotantes
    floatingAddDay.addEventListener('click', addDay);
    floatingPreview.addEventListener('click', showPreview);
    floatingGenerate.addEventListener('click', generatePDF);
    emptyAddDay.addEventListener('click', addDay);
    
    // Expandir/contraer todos los días
    expandAllBtn.addEventListener('click', function() {
        const dayCards = document.querySelectorAll('.day-card');
        const isExpanded = this.querySelector('i').classList.contains('fa-expand-alt');
        
        dayCards.forEach(card => {
            const exercises = card.querySelector('.exercises-container-mobile');
            if (exercises) {
                if (isExpanded) {
                    exercises.style.display = 'block';
                } else {
                    exercises.style.display = 'none';
                }
            }
        });
        
        this.querySelector('i').classList.toggle('fa-expand-alt');
        this.querySelector('i').classList.toggle('fa-compress-alt');
    });
    
    // FAB (Floating Action Button)
    mainFab.addEventListener('click', function() {
        this.classList.toggle('active');
        fabOptions.classList.toggle('show');
    });
    
    fabAddDay.addEventListener('click', function() {
        addDay();
        mainFab.classList.remove('active');
        fabOptions.classList.remove('show');
    });
    
    fabQuickExercise.addEventListener('click', function() {
        // Agregar ejercicio al último día o crear uno nuevo
        if (days.length > 0) {
            const lastDayIndex = days.length - 1;
            addExerciseToDay(lastDayIndex);
        } else {
            showToast('Primero agrega un día', 'warning');
        }
        mainFab.classList.remove('active');
        fabOptions.classList.remove('show');
    });
    
    fabPreview.addEventListener('click', function() {
        showPreview();
        mainFab.classList.remove('active');
        fabOptions.classList.remove('show');
    });
    
    // Cerrar FAB al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.fab-container')) {
            mainFab.classList.remove('active');
            fabOptions.classList.remove('show');
        }
    });
    
    // ========== FUNCIONES PARA MANEJAR DÍAS ==========
    
    function addDay() {
        dayModalTitle.textContent = "Nuevo Día";
        document.getElementById('modal-day-index').value = '';
        dayForm.reset();
        
        // Filtrar días disponibles
        const daySelect = document.getElementById('day-name');
        daySelect.innerHTML = '<option value="">Seleccionar día...</option>';
        
        weekDays.forEach(day => {
            if (!usedDays.includes(day)) {
                const option = document.createElement('option');
                option.value = day;
                option.textContent = day;
                daySelect.appendChild(option);
            }
        });
        
        // Abrir modal con animación
        dayModal.classList.remove('hidden');
        setTimeout(() => {
            dayModal.querySelector('.mobile-modal-content').classList.add('slide-in-up');
        }, 10);
    }
    
    function saveDay(dayData) {
        if (isEditingDay && editingDayIndex !== null) {
            // Liberar nombre anterior
            const oldDayName = days[editingDayIndex].name;
            const oldIndex = usedDays.indexOf(oldDayName);
            if (oldIndex > -1) {
                usedDays.splice(oldIndex, 1);
            }
            
            // Actualizar día
            dayData.id = days[editingDayIndex].id;
            days[editingDayIndex] = dayData;
            
            showToast(`Día "${dayData.name}" actualizado`, 'success');
        } else {
            // Nuevo día
            dayData.id = Date.now() + Math.random();
            dayData.exercises = [];
            days.push(dayData);
            
            showToast(`Día "${dayData.name}" agregado`, 'success');
        }
        
        // Agregar a días usados
        if (!usedDays.includes(dayData.name)) {
            usedDays.push(dayData.name);
        }
        
        // Ordenar días
        days.sort((a, b) => {
            const aIndex = weekDays.indexOf(a.name);
            const bIndex = weekDays.indexOf(b.name);
            if (aIndex > -1 && bIndex > -1) return aIndex - bIndex;
            if (aIndex > -1) return -1;
            if (bIndex > -1) return 1;
            return 0;
        });
        
        updateDaysList();
        updateStats();
        saveData();
        closeDayModalFunc();
    }
    
    function editDay(index) {
        const day = days[index];
        
        // Cargar datos
        document.getElementById('modal-day-index').value = index;
        document.getElementById('day-name').value = day.name;
        document.getElementById('day-focus').value = day.focus || '';
        document.getElementById('day-notes').value = day.notes || '';
        
        // Configurar modal
        dayModalTitle.textContent = `Editar: ${day.name}`;
        
        // Filtrar días disponibles
        const daySelect = document.getElementById('day-name');
        daySelect.innerHTML = '<option value="">Seleccionar día...</option>';
        
        // Agregar opción actual
        const currentOption = document.createElement('option');
        currentOption.value = day.name;
        currentOption.textContent = day.name;
        currentOption.selected = true;
        daySelect.appendChild(currentOption);
        
        // Otras opciones
        weekDays.forEach(dayName => {
            if (!usedDays.includes(dayName) || dayName === day.name) {
                const option = document.createElement('option');
                option.value = dayName;
                option.textContent = dayName;
                daySelect.appendChild(option);
            }
        });
        
        isEditingDay = true;
        editingDayIndex = index;
        
        // Abrir modal
        dayModal.classList.remove('hidden');
        setTimeout(() => {
            dayModal.querySelector('.mobile-modal-content').classList.add('slide-in-up');
        }, 10);
    }
    
    function removeDay(index) {
        const day = days[index];
        
        // Mostrar confirmación con swipe
        showSwipeConfirm(() => {
            // Eliminar día
            days.splice(index, 1);
            
            // Liberar nombre
            const dayIndex = usedDays.indexOf(day.name);
            if (dayIndex > -1) {
                usedDays.splice(dayIndex, 1);
            }
            
            updateDaysList();
            updateStats();
            saveData();
            showToast(`Día "${day.name}" eliminado`, 'info');
        });
    }
    
    // ========== FUNCIONES PARA MANEJAR EJERCICIOS ==========
    
    function addExerciseToDay(dayIndex) {
        const day = days[dayIndex];
        
        exerciseModalTitle.textContent = "Nuevo Ejercicio";
        exerciseModalSubtitle.textContent = `Día: ${day.name}`;
        document.getElementById('modal-day-index').value = dayIndex;
        document.getElementById('modal-exercise-index').value = '';
        exerciseForm.reset();
        document.getElementById('exercise-sets').value = '3';
        document.getElementById('exercise-rest').value = '60';
        
        isEditingExercise = false;
        editingExerciseDayIndex = null;
        editingExerciseIndex = null;
        
        // Abrir modal
        exerciseModal.classList.remove('hidden');
        setTimeout(() => {
            exerciseModal.querySelector('.mobile-modal-content').classList.add('slide-in-up');
        }, 10);
    }
    
    function editExercise(dayIndex, exerciseIndex) {
        const day = days[dayIndex];
        const exercise = day.exercises[exerciseIndex];
        
        exerciseModalTitle.textContent = "Editar Ejercicio";
        exerciseModalSubtitle.textContent = `Día: ${day.name}`;
        document.getElementById('modal-day-index').value = dayIndex;
        document.getElementById('modal-exercise-index').value = exerciseIndex;
        
        // Cargar datos
        document.getElementById('exercise-name').value = exercise.name;
        document.getElementById('exercise-muscle').value = exercise.muscle || '';
        document.getElementById('exercise-sets').value = exercise.sets;
        document.getElementById('exercise-reps').value = exercise.reps;
        document.getElementById('exercise-rest').value = exercise.rest || '60';
        document.getElementById('exercise-video').value = exercise.video || '';
        document.getElementById('exercise-notes').value = exercise.notes || '';
        
        isEditingExercise = true;
        editingExerciseDayIndex = dayIndex;
        editingExerciseIndex = exerciseIndex;
        
        // Abrir modal
        exerciseModal.classList.remove('hidden');
        setTimeout(() => {
            exerciseModal.querySelector('.mobile-modal-content').classList.add('slide-in-up');
        }, 10);
    }
    
    function saveExercise(exerciseData) {
        const dayIndex = parseInt(document.getElementById('modal-day-index').value);
        
        if (isEditingExercise && editingExerciseDayIndex !== null && editingExerciseIndex !== null) {
            // Editar ejercicio
            days[editingExerciseDayIndex].exercises[editingExerciseIndex] = exerciseData;
            showToast(`Ejercicio "${exerciseData.name}" actualizado`, 'success');
        } else {
            // Nuevo ejercicio
            days[dayIndex].exercises.push(exerciseData);
            showToast(`Ejercicio "${exerciseData.name}" agregado`, 'success');
        }
        
        updateDaysList();
        updateStats();
        saveData();
        closeExerciseModalFunc();
    }
    
    function deleteExercise(dayIndex, exerciseIndex) {
        const exercise = days[dayIndex].exercises[exerciseIndex];
        
        // Mostrar confirmación con swipe
        showSwipeConfirm(() => {
            // Eliminar ejercicio
            days[dayIndex].exercises.splice(exerciseIndex, 1);
            
            updateDaysList();
            updateStats();
            saveData();
            showToast(`Ejercicio "${exercise.name}" eliminado`, 'info');
        });
    }
    
    // ========== MANEJO DE FORMULARIOS ==========
    
    dayForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const dayData = {
            name: document.getElementById('day-name').value,
            focus: document.getElementById('day-focus').value.trim(),
            notes: document.getElementById('day-notes').value.trim()
        };
        
        if (!dayData.name) {
            showToast('Selecciona un día', 'error');
            return;
        }
        
        saveDay(dayData);
    });
    
    exerciseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const exerciseData = {
            name: document.getElementById('exercise-name').value.trim(),
            muscle: document.getElementById('exercise-muscle').value,
            sets: document.getElementById('exercise-sets').value,
            reps: document.getElementById('exercise-reps').value.trim(),
            rest: document.getElementById('exercise-rest').value || '60',
            video: document.getElementById('exercise-video').value.trim(),
            notes: document.getElementById('exercise-notes').value.trim()
        };
        
        // Validaciones
        if (!exerciseData.name) {
            showToast('Nombre del ejercicio requerido', 'error');
            return;
        }
        
        if (!exerciseData.sets || exerciseData.sets < 1) {
            showToast('Mínimo 1 serie', 'error');
            return;
        }
        
        if (!exerciseData.reps) {
            showToast('Repeticiones requeridas', 'error');
            return;
        }
        
        if (exerciseData.video && !isValidUrl(exerciseData.video)) {
            showToast('URL de video inválida', 'error');
            return;
        }
        
        saveExercise(exerciseData);
    });
    
    // ========== MANEJO DE MODALES ==========
    
    function closeDayModalFunc() {
        dayModal.querySelector('.mobile-modal-content').classList.remove('slide-in-up');
        dayModal.querySelector('.mobile-modal-content').classList.add('slide-out-down');
        
        setTimeout(() => {
            dayModal.classList.add('hidden');
            dayModal.querySelector('.mobile-modal-content').classList.remove('slide-out-down');
        }, 300);
        
        isEditingDay = false;
        editingDayIndex = null;
    }
    
    function closeExerciseModalFunc() {
        exerciseModal.querySelector('.mobile-modal-content').classList.remove('slide-in-up');
        exerciseModal.querySelector('.mobile-modal-content').classList.add('slide-out-down');
        
        setTimeout(() => {
            exerciseModal.classList.add('hidden');
            exerciseModal.querySelector('.mobile-modal-content').classList.remove('slide-out-down');
        }, 300);
        
        isEditingExercise = false;
        editingExerciseDayIndex = null;
        editingExerciseIndex = null;
    }
    
    function closeClientModalFunc() {
        clientModal.querySelector('.mobile-modal-content').classList.remove('slide-in-up');
        clientModal.querySelector('.mobile-modal-content').classList.add('slide-out-down');
        
        setTimeout(() => {
            clientModal.classList.add('hidden');
            clientModal.querySelector('.mobile-modal-content').classList.remove('slide-out-down');
        }, 300);
    }
    
    // Event listeners para cerrar modales
    closeDayModal.addEventListener('click', closeDayModalFunc);
    cancelDayBtn.addEventListener('click', closeDayModalFunc);
    
    closeExerciseModal.addEventListener('click', closeExerciseModalFunc);
    cancelExerciseBtn.addEventListener('click', closeExerciseModalFunc);
    
    closeClientModal.addEventListener('click', closeClientModalFunc);
    cancelClientBtn.addEventListener('click', closeClientModalFunc);
    
    // Cerrar modal al tocar fuera
    [dayModal, exerciseModal, clientModal].forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this === dayModal) closeDayModalFunc();
                if (this === exerciseModal) closeExerciseModalFunc();
                if (this === clientModal) closeClientModalFunc();
            }
        });
    });
    
    // ========== ACTUALIZACIÓN DE INTERFAZ ==========
    
    function updateDaysList() {
        daysContainer.innerHTML = '';
        
        if (days.length === 0) {
            daysContainer.innerHTML = `
                <div class="empty-state-mobile">
                    <div class="empty-icon">
                        <i class="fas fa-calendar-plus fa-3x"></i>
                    </div>
                    <h3>No hay días en la rutina</h3>
                    <p>Toca el botón "Agregar Día" para comenzar</p>
                    <button id="empty-add-day" class="btn-primary btn-empty">
                        <i class="fas fa-calendar-plus"></i> Agregar mi primer día
                    </button>
                </div>
            `;
            
            document.getElementById('empty-add-day').addEventListener('click', addDay);
            return;
        }
        
        days.forEach((day, dayIndex) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.dataset.dayId = day.id;
            
            // Crear HTML de ejercicios
            let exercisesHTML = '';
            if (day.exercises.length === 0) {
                exercisesHTML = `
                    <div class="no-exercises-mobile">
                        <i class="fas fa-dumbbell"></i>
                        <p>No hay ejercicios. Agrega el primero.</p>
                    </div>
                `;
            } else {
                day.exercises.forEach((exercise, exIndex) => {
                    let videoLink = '';
                    if (exercise.video) {
                        videoLink = `
                            <a href="${exercise.video}" target="_blank" class="video-link-mobile">
                                <i class="fab fa-youtube"></i> Ver video
                            </a>
                        `;
                    }
                    
                    exercisesHTML += `
                        <div class="exercise-card-mobile" data-exercise-index="${exIndex}">
                            <div class="exercise-header-mobile">
                                <div class="exercise-title-mobile">
                                    <div class="exercise-number-mobile">${exIndex + 1}</div>
                                    <div class="exercise-name-mobile">${exercise.name}</div>
                                    ${exercise.muscle ? `<span class="exercise-muscle-mobile">${getMuscleLabel(exercise.muscle)}</span>` : ''}
                                </div>
                                <div class="exercise-actions-mobile">
                                    <button class="exercise-action-btn-mobile edit-exercise-btn-mobile" 
                                            data-day-index="${dayIndex}" 
                                            data-exercise-index="${exIndex}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="exercise-action-btn-mobile delete-exercise-btn-mobile"
                                            data-day-index="${dayIndex}"
                                            data-exercise-index="${exIndex}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="exercise-details-mobile">
                                <div class="detail-item-mobile">
                                    <span class="detail-label-mobile">Series:</span>
                                    <span class="detail-value-mobile">${exercise.sets}</span>
                                </div>
                                <div class="detail-item-mobile">
                                    <span class="detail-label-mobile">Reps:</span>
                                    <span class="detail-value-mobile">${exercise.reps}</span>
                                </div>
                                <div class="detail-item-mobile">
                                    <span class="detail-label-mobile">Descanso:</span>
                                    <span class="detail-value-mobile">${exercise.rest || '60'} seg</span>
                                </div>
                                <div class="detail-item-mobile">
                                    <span class="detail-label-mobile">Video:</span>
                                    <div class="detail-value-mobile">
                                        ${exercise.video ? videoLink : '<span style="color:#999">-</span>'}
                                    </div>
                                </div>
                            </div>
                            ${exercise.notes ? `
                            <div class="exercise-notes-mobile">
                                <span class="detail-label-mobile">Notas:</span>
                                <div class="detail-value-mobile">${exercise.notes}</div>
                            </div>
                            ` : ''}
                        </div>
                    `;
                });
            }
            
            // HTML del día
            dayCard.innerHTML = `
                <div class="day-header-mobile">
                    <div class="day-badge-mobile">
                        <i class="fas fa-calendar-day"></i> ${day.name}
                    </div>
                    <div class="day-info-mobile">
                        <div class="day-name-mobile">${day.focus || 'Entrenamiento'}</div>
                        <div class="day-focus-mobile">${day.exercises.length} ejercicio${day.exercises.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="day-actions-mobile">
                        <button class="day-action-btn-mobile add-exercise-btn-mobile" data-day-index="${dayIndex}">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="day-action-btn-mobile edit-day-btn-mobile" data-day-index="${dayIndex}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="day-action-btn-mobile remove-day-btn-mobile" data-day-index="${dayIndex}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${day.notes ? `
                <div class="day-notes-mobile">
                    <p>${day.notes}</p>
                </div>
                ` : ''}
                <div class="exercises-container-mobile">
                    ${exercisesHTML}
                </div>
            `;
            
            daysContainer.appendChild(dayCard);
        });
        
        // Agregar event listeners
        attachDayEventListeners();
    }
    
    function attachDayEventListeners() {
        // Botones de días
        document.querySelectorAll('.day-action-btn-mobile').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const dayIndex = parseInt(this.dataset.dayIndex);
                
                if (this.classList.contains('add-exercise-btn-mobile')) {
                    addExerciseToDay(dayIndex);
                } else if (this.classList.contains('edit-day-btn-mobile')) {
                    editDay(dayIndex);
                } else if (this.classList.contains('remove-day-btn-mobile')) {
                    removeDay(dayIndex);
                }
            });
        });
        
        // Botones de ejercicios
        document.querySelectorAll('.exercise-action-btn-mobile').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const dayIndex = parseInt(this.dataset.dayIndex);
                const exerciseIndex = parseInt(this.dataset.exerciseIndex);
                
                if (this.classList.contains('edit-exercise-btn-mobile')) {
                    editExercise(dayIndex, exerciseIndex);
                } else if (this.classList.contains('delete-exercise-btn-mobile')) {
                    deleteExercise(dayIndex, exerciseIndex);
                }
            });
        });
        
        // Swipe para eliminar en ejercicios
        document.querySelectorAll('.exercise-card-mobile').forEach(card => {
            let startX = 0;
            let currentX = 0;
            let isSwipingCard = false;
            
            card.addEventListener('touchstart', function(e) {
                startX = e.touches[0].clientX;
                isSwipingCard = true;
            });
            
            card.addEventListener('touchmove', function(e) {
                if (!isSwipingCard) return;
                
                currentX = e.touches[0].clientX;
                const diff = startX - currentX;
                
                if (diff > 0) { // Swipe izquierda
                    this.style.transform = `translateX(-${Math.min(diff, 80)}px)`;
                }
            });
            
            card.addEventListener('touchend', function() {
                if (!isSwipingCard) return;
                
                const diff = startX - currentX;
                if (diff > 50) { // Swipe significativo
                    const dayIndex = parseInt(this.closest('.day-card').querySelector('.add-exercise-btn-mobile').dataset.dayIndex);
                    const exerciseIndex = parseInt(this.dataset.exerciseIndex);
                    deleteExercise(dayIndex, exerciseIndex);
                } else {
                    this.style.transform = 'translateX(0)';
                }
                
                isSwipingCard = false;
            });
        });
    }
    
    function updateStats() {
        const totalExercises = days.reduce((sum, day) => sum + day.exercises.length, 0);
        const totalVideos = days.reduce((sum, day) => {
            return sum + day.exercises.filter(ex => ex.video).length;
        }, 0);
        
        daysCountElement.textContent = days.length;
        exercisesCountElement.textContent = totalExercises;
        videosCountElement.textContent = totalVideos;
    }
    
    // ========== VISTA PREVIA Y PDF ==========
    
    function showPreview() {
        if (days.length === 0) {
            showToast('Agrega al menos un día', 'warning');
            return;
        }
        
        const hasExercises = days.some(day => day.exercises.length > 0);
        if (!hasExercises) {
            showToast('Agrega ejercicios a los días', 'warning');
            return;
        }
        
        updatePdfPreview();
        previewSection.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    closePreviewBtn.addEventListener('click', function() {
        previewSection.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });
    
    function updatePdfPreview() {
        pdfPreview.innerHTML = '';
        
        days.forEach(day => {
            if (day.exercises.length === 0) return;
            
            const daySection = document.createElement('div');
            daySection.className = 'pdf-day-preview-mobile';
            
            let tableRows = '';
            day.exercises.forEach((exercise, index) => {
                let videoCell = '<td>-</td>';
                if (exercise.video) {
                    const shortUrl = exercise.video.length > 25 ? 
                        exercise.video.substring(0, 25) + '...' : exercise.video;
                    
                    videoCell = `
                        <td>
                            <a href="${exercise.video}" target="_blank" style="color: #2196f3; text-decoration: underline; font-size: 0.8rem;">
                                ${shortUrl}
                            </a>
                        </td>
                    `;
                }
                
                tableRows += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${exercise.name}</strong></td>
                        <td>${getMuscleLabel(exercise.muscle) || '-'}</td>
                        <td>${exercise.sets}</td>
                        <td>${exercise.reps}</td>
                        <td>${exercise.rest || '60'}s</td>
                        ${videoCell}
                        <td>${exercise.notes || '-'}</td>
                    </tr>
                `;
            });
            
            daySection.innerHTML = `
                <div class="pdf-day-header-mobile">
                    <h3><i class="fas fa-calendar-day"></i> ${day.name} ${day.focus ? `(${day.focus})` : ''}</h3>
                    ${day.notes ? `<p class="pdf-day-notes-mobile">${day.notes}</p>` : ''}
                </div>
                <table class="pdf-table-mobile">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Ejercicio</th>
                            <th>Grupo</th>
                            <th>Series</th>
                            <th>Reps</th>
                            <th>Desc</th>
                            <th>Video</th>
                            <th>Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            `;
            
            pdfPreview.appendChild(daySection);
        });
    }
    
    // ========== GENERACIÓN DE PDF ==========
    
    function generatePDF() {
        if (days.length === 0) {
            showToast('Agrega al menos un día', 'warning');
            return;
        }
        
        const hasExercises = days.some(day => day.exercises.length > 0);
        if (!hasExercises) {
            showToast('Agrega ejercicios a los días', 'warning');
            return;
        }
        
        // Mostrar modal de cliente
        clientModal.classList.remove('hidden');
        setTimeout(() => {
            clientModal.querySelector('.mobile-modal-content').classList.add('slide-in-up');
        }, 10);
    }
    
    confirmClientBtn.addEventListener('click', function() {
        const clientName = clientNameInput.value.trim() || 'Cliente de Luciana Gala';
        const routineName = routineNameInput.value.trim() || 'Rutina Personalizada';
        const routineNotes = routineNotesInput.value.trim();
        
        closeClientModalFunc();
        
        // Generar PDF
        createAndDownloadPDF(clientName, routineName, routineNotes);
    });
    
    downloadPdfBtn.addEventListener('click', function() {
        const clientName = clientNameInput.value.trim() || 'Cliente de Luciana Gala';
        const routineName = routineNameInput.value.trim() || 'Rutina Personalizada';
        const routineNotes = routineNotesInput.value.trim();
        
        createAndDownloadPDF(clientName, routineName, routineNotes);
    });
    
    editRoutineBtn.addEventListener('click', function() {
        previewSection.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });
    
    function createAndDownloadPDF(clientName, routineName, routineNotes) {
        showToast('Generando PDF...', 'info');
        
        // Crear contenido HTML
        const pdfContent = createPDFContent(clientName, routineName, routineNotes);
        
        // Crear elemento temporal
        const tempElement = document.createElement('div');
        tempElement.style.cssText = `
            width: 210mm;
            padding: 15mm;
            background: white;
            font-family: 'Poppins', sans-serif;
            font-size: 10px;
            position: fixed;
            left: -10000px;
            top: -10000px;
        `;
        tempElement.innerHTML = pdfContent;
        document.body.appendChild(tempElement);
        
        // Generar PDF
        html2canvas(tempElement, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            document.body.removeChild(tempElement);
            
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            pdf.addImage(canvas, 'PNG', 0, 0, imgWidth, imgHeight);
            
            // Manejar múltiples páginas
            let heightLeft = imgHeight;
            let position = 0;
            
            while (heightLeft >= pageHeight) {
                position = heightLeft - pageHeight;
                pdf.addPage();
                pdf.addImage(canvas, 'PNG', 0, -position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Guardar PDF
            const fileName = `Rutina_${routineName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
            pdf.save(fileName);
            
            showToast('PDF descargado', 'success');
        }).catch(error => {
            console.error('Error al generar PDF:', error);
            showToast('Error al generar PDF', 'error');
        });
    }
    
    function createPDFContent(clientName, routineName, routineNotes) {
        let daysSections = '';
        
        days.forEach(day => {
            if (day.exercises.length === 0) return;
            
            let tableRows = '';
            day.exercises.forEach((exercise, index) => {
                let videoCell = '<td>-</td>';
                if (exercise.video) {
                    const shortUrl = exercise.video.length > 20 ? 
                        exercise.video.substring(0, 20) + '...' : exercise.video;
                    
                    videoCell = `<td><a href="${exercise.video}" style="color: #2196f3; text-decoration: underline;">${shortUrl}</a></td>`;
                }
                
                tableRows += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${exercise.name}</strong></td>
                        <td>${getMuscleLabel(exercise.muscle) || '-'}</td>
                        <td>${exercise.sets}</td>
                        <td>${exercise.reps}</td>
                        <td>${exercise.rest || '60'}s</td>
                        ${videoCell}
                        <td>${exercise.notes || '-'}</td>
                    </tr>
                `;
            });
            
            daysSections += `
                <div style="margin-bottom: 15px; page-break-inside: avoid;">
                    <div style="background: #e1bee7; padding: 8px 10px; border-radius: 5px; margin-bottom: 10px; border-left: 3px solid #ba68c8;">
                        <div style="font-weight: 600; font-size: 11px;">
                            <span style="color: #ba68c8;">📅</span> ${day.name}
                            ${day.focus ? `<span style="font-size: 10px; color: #666; margin-left: 5px;">(${day.focus})</span>` : ''}
                        </div>
                        ${day.notes ? `
                        <div style="background: rgba(255,255,255,0.7); border-radius: 3px; padding: 5px; margin-top: 5px; font-size: 9px;">
                            <strong>Notas:</strong> ${day.notes}
                        </div>
                        ` : ''}
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
                        <thead style="background: #f8bbd9;">
                            <tr>
                                <th style="padding: 6px; border-bottom: 1px solid #f06292;">#</th>
                                <th style="padding: 6px; border-bottom: 1px solid #f06292;">Ejercicio</th>
                                <th style="padding: 6px; border-bottom: 1px solid #f06292;">Grupo</th>
                                <th style="padding: 6px; border-bottom: 1px solid #f06292;">Series</th>
                                <th style="padding: 6px; border-bottom: 1px solid #f06292;">Reps</th>
                                <th style="padding: 6px; border-bottom: 1px solid #f06292;">Desc</th>
                                <th style="padding: 6px; border-bottom: 1px solid #f06292;">Video</th>
                                <th style="padding: 6px; border-bottom: 1px solid #f06292;">Notas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            `;
        });
        
        return `
            <div style="font-family: 'Poppins', sans-serif; color: #333;">
                <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #ba68c8;">
                    <div style="text-align: center;">
                        <h1 style="color: #ba68c8; margin: 0 0 5px 0; font-size: 16px;">
                            🏋️ Luciana Gala
                        </h1>
                        <p style="color: #666; margin: 0; font-size: 11px;">Personal Trainer - Rutina Personalizada</p>
                    </div>
                    <div style="margin-top: 10px;">
                        <h3 style="margin: 0 0 3px 0; font-size: 13px;">RUTINA: <span style="color: #ba68c8;">${routineName}</span></h3>
                        <h4 style="margin: 0 0 5px 0; font-size: 12px;">PARA: <span style="color: #2196f3;">${clientName}</span></h4>
                        <p style="color: #666; margin: 0; font-size: 10px;">Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
                    </div>
                </div>
                
                ${daysSections}
                
                ${routineNotes ? `
                <div style="background: #f5f5f5; border-radius: 5px; padding: 10px; margin-top: 15px; border-left: 3px solid #2196f3;">
                    <h3 style="color: #2196f3; margin: 0 0 8px 0; font-size: 11px;">Notas Generales</h3>
                    <div style="white-space: pre-line; font-size: 9px;">
                        ${routineNotes}
                    </div>
                </div>
                ` : ''}
                
                <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #e0e0e0; font-size: 9px;">
                    <div style="text-align: center;">
                        <p style="margin: 0 0 10px 0;">_________________________</p>
                        <p style="margin: 0 0 3px 0; font-weight: bold;">Luciana Gala</p>
                        <p style="margin: 0 0 3px 0;">Personal Trainer</p>
                        <p style="margin: 0;">Contacto: +54 3472 55-8896</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ========== FUNCIONES UTILITARIAS ==========
    
    function getMuscleLabel(muscleKey) {
        const muscles = {
            'piernas': 'Piernas',
            'pecho': 'Pecho',
            'espalda': 'Espalda',
            'hombros': 'Hombros',
            'brazos': 'Brazos',
            'abdomen': 'Abdomen'
        };
        return muscles[muscleKey] || muscleKey;
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    function showToast(message, type = 'info') {
        const toastIcon = toast.querySelector('.toast-icon');
        
        // Configurar icono según tipo
        switch(type) {
            case 'success':
                toastIcon.className = 'toast-icon fas fa-check-circle';
                break;
            case 'error':
                toastIcon.className = 'toast-icon fas fa-exclamation-circle';
                break;
            case 'warning':
                toastIcon.className = 'toast-icon fas fa-exclamation-triangle';
                break;
            case 'info':
                toastIcon.className = 'toast-icon fas fa-info-circle';
                break;
        }
        
        toast.querySelector('.toast-message').textContent = message;
        toast.className = `toast ${type} show`;
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    function showSwipeConfirm(callback) {
        const swipeConfirm = document.getElementById('swipe-confirm');
        const swipeProgress = document.querySelector('.swipe-progress');
        
        swipeConfirm.classList.add('show');
        
        let startX = 0;
        let currentX = 0;
        let progress = 0;
        
        function handleTouchStart(e) {
            startX = e.touches[0].clientX;
            isSwiping = true;
        }
        
        function handleTouchMove(e) {
            if (!isSwiping) return;
            
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            
            if (diff > 0) {
                progress = Math.min(diff / 200, 1);
                swipeProgress.style.width = `${progress * 100}%`;
            }
        }
        
        function handleTouchEnd() {
            if (!isSwiping) return;
            
            if (progress >= 0.8) {
                callback();
                swipeConfirm.classList.remove('show');
            } else {
                swipeProgress.style.width = '0%';
            }
            
            isSwiping = false;
            progress = 0;
            
            // Remover event listeners
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        }
        
        // Agregar event listeners
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        
        // Ocultar después de 5 segundos si no se usa
        setTimeout(() => {
            if (isSwiping) return;
            swipeConfirm.classList.remove('show');
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        }, 5000);
    }
    
    // ========== ALMACENAMIENTO LOCAL ==========
    
    function saveData() {
        const data = {
            days: days,
            usedDays: usedDays,
            clientName: clientNameInput.value,
            routineName: routineNameInput.value
        };
        
        try {
            localStorage.setItem('lucianaRutinaData', JSON.stringify(data));
        } catch (e) {
            console.error('Error al guardar datos:', e);
        }
    }
    
    function loadSavedData() {
        try {
            const savedData = localStorage.getItem('lucianaRutinaData');
            if (savedData) {
                const data = JSON.parse(savedData);
                days = data.days || [];
                usedDays = data.usedDays || [];
                
                if (data.clientName) clientNameInput.value = data.clientName;
                if (data.routineName) routineNameInput.value = data.routineName;
                
                updateDaysList();
                updateStats();
                showToast('Datos cargados', 'info');
            }
        } catch (e) {
            console.error('Error al cargar datos:', e);
        }
    }
    
    // ========== EVENT LISTENERS GLOBALES ==========
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (!event.target.closest('header') && !mainNav.classList.contains('hidden')) {
            mainNav.classList.add('hidden');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
        }
    });
    
    // Guardar datos al salir
    window.addEventListener('beforeunload', saveData);
    
    // Manejar tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (!dayModal.classList.contains('hidden')) closeDayModalFunc();
            if (!exerciseModal.classList.contains('hidden')) closeExerciseModalFunc();
            if (!clientModal.classList.contains('hidden')) closeClientModalFunc();
            if (!previewSection.classList.contains('hidden')) {
                previewSection.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        }
    });
    
    // ========== INICIALIZACIÓN FINAL ==========
    
    console.log('Sistema de rutinas móvil cargado');
    showToast('¡Bienvenida Luciana!', 'info');
    
    // Ejemplo inicial (opcional)
    /*
    setTimeout(() => {
        if (days.length === 0) {
            // Agregar días de ejemplo
            const exampleDays = [
                {
                    name: 'Lunes',
                    focus: 'Piernas',
                    notes: 'Enfocarse en técnica',
                    exercises: [
                        {
                            name: "Sentadillas",
                            muscle: "piernas",
                            sets: "3",
                            reps: "10-12",
                            rest: "60",
                            video: "https://youtube.com/watch?v=aclHkVaku9U",
                            notes: "Espalda recta"
                        }
                    ]
                }
            ];
            
            exampleDays.forEach(day => {
                usedDays.push(day.name);
                day.id = Date.now() + Math.random();
                days.push(day);
            });
            
            updateDaysList();
            updateStats();
            showToast('Ejemplo cargado', 'info');
        }
    }, 1000);
    */
});