// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let days = [];
    let usedDays = [];
    
    // Elementos del DOM
    const daysCountElement = document.getElementById('days-count');
    const exercisesCountElement = document.getElementById('exercises-count');
    const videosCountElement = document.getElementById('videos-count');
    const daysContainer = document.getElementById('days-container');
    const addDayBtn = document.getElementById('add-day-btn');
    const dayModal = document.getElementById('day-modal');
    const dayModalTitle = document.getElementById('day-modal-title');
    const dayForm = document.getElementById('day-form');
    const closeDayModal = document.getElementById('close-day-modal');
    const cancelDayBtn = document.getElementById('cancel-day-btn');
    const exerciseModal = document.getElementById('exercise-modal');
    const exerciseModalTitle = document.getElementById('exercise-modal-title');
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
    const closeClientModal = document.getElementById('close-client-modal');
    const confirmClientBtn = document.getElementById('confirm-client-btn');
    const cancelClientBtn = document.getElementById('cancel-client-btn');
    const bottomPreviewBtn = document.getElementById('bottom-preview-btn');
    const bottomGenerateBtn = document.getElementById('bottom-generate-btn');
    
    // Variables para edición
    let isEditingDay = false;
    let editingDayIndex = null;
    let isEditingExercise = false;
    let editingExerciseDayIndex = null;
    let editingExerciseIndex = null;
    
    // Días de la semana
    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
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
        
        dayModal.classList.remove('hidden');
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
        } else {
            // Nuevo día
            dayData.id = Date.now() + Math.random();
            dayData.exercises = [];
            days.push(dayData);
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
        
        dayModal.classList.remove('hidden');
    }
    
    function removeDay(index) {
        const day = days[index];
        
        if (confirm(`¿Eliminar el día "${day.name}" y todos sus ejercicios?`)) {
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
        }
    }
    
    // ========== FUNCIONES PARA MANEJAR EJERCICIOS ==========
    
    function addExerciseToDay(dayIndex) {
        const day = days[dayIndex];
        
        exerciseModalTitle.textContent = "Nuevo Ejercicio";
        document.getElementById('modal-day-index').value = dayIndex;
        document.getElementById('modal-exercise-index').value = '';
        exerciseForm.reset();
        document.getElementById('exercise-sets').value = '3';
        document.getElementById('exercise-rest').value = '60';
        
        isEditingExercise = false;
        editingExerciseDayIndex = null;
        editingExerciseIndex = null;
        
        exerciseModal.classList.remove('hidden');
    }
    
    function editExercise(dayIndex, exerciseIndex) {
        const day = days[dayIndex];
        const exercise = day.exercises[exerciseIndex];
        
        exerciseModalTitle.textContent = "Editar Ejercicio";
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
        
        exerciseModal.classList.remove('hidden');
    }
    
    function saveExercise(exerciseData) {
        const dayIndex = parseInt(document.getElementById('modal-day-index').value);
        
        if (isEditingExercise && editingExerciseDayIndex !== null && editingExerciseIndex !== null) {
            // Editar ejercicio
            days[editingExerciseDayIndex].exercises[editingExerciseIndex] = exerciseData;
        } else {
            // Nuevo ejercicio
            days[dayIndex].exercises.push(exerciseData);
        }
        
        updateDaysList();
        updateStats();
        saveData();
        closeExerciseModalFunc();
    }
    
    function deleteExercise(dayIndex, exerciseIndex) {
        const exercise = days[dayIndex].exercises[exerciseIndex];
        
        if (confirm(`¿Eliminar el ejercicio "${exercise.name}"?`)) {
            // Eliminar ejercicio
            days[dayIndex].exercises.splice(exerciseIndex, 1);
            
            updateDaysList();
            updateStats();
            saveData();
        }
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
            alert('Selecciona un día');
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
            alert('Nombre del ejercicio requerido');
            return;
        }
        
        if (!exerciseData.sets || exerciseData.sets < 1) {
            alert('Mínimo 1 serie');
            return;
        }
        
        if (!exerciseData.reps) {
            alert('Repeticiones requeridas');
            return;
        }
        
        if (exerciseData.video && !isValidUrl(exerciseData.video)) {
            alert('URL de video inválida');
            return;
        }
        
        saveExercise(exerciseData);
    });
    
    // ========== MANEJO DE MODALES ==========
    
    function closeDayModalFunc() {
        dayModal.classList.add('hidden');
        isEditingDay = false;
        editingDayIndex = null;
    }
    
    function closeExerciseModalFunc() {
        exerciseModal.classList.add('hidden');
        isEditingExercise = false;
        editingExerciseDayIndex = null;
        editingExerciseIndex = null;
    }
    
    function closeClientModalFunc() {
        clientModal.classList.add('hidden');
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
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-calendar-plus fa-3x"></i>
                    </div>
                    <h3>No hay días en la rutina</h3>
                    <p>Presiona "Agregar Día" para comenzar</p>
                </div>
            `;
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
                    <div class="no-exercises">
                        <i class="fas fa-dumbbell"></i>
                        <p>No hay ejercicios. Agrega el primero.</p>
                    </div>
                `;
            } else {
                day.exercises.forEach((exercise, exIndex) => {
                    let videoLink = '';
                    if (exercise.video) {
                        videoLink = `
                            <a href="${exercise.video}" target="_blank" class="video-link">
                                <i class="fab fa-youtube"></i> Ver video
                            </a>
                        `;
                    }
                    
                    exercisesHTML += `
                        <div class="exercise-card" data-exercise-index="${exIndex}">
                            <div class="exercise-header">
                                <div class="exercise-title">
                                    <div class="exercise-number">${exIndex + 1}</div>
                                    <div class="exercise-name">${exercise.name}</div>
                                    ${exercise.muscle ? `<span class="exercise-muscle">${getMuscleLabel(exercise.muscle)}</span>` : ''}
                                </div>
                                <div class="exercise-actions">
                                    <button class="exercise-action-btn edit-exercise-btn" 
                                            data-day-index="${dayIndex}" 
                                            data-exercise-index="${exIndex}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="exercise-action-btn delete-exercise-btn"
                                            data-day-index="${dayIndex}"
                                            data-exercise-index="${exIndex}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="exercise-details">
                                <div class="detail-item">
                                    <span class="detail-label">Series:</span>
                                    <span class="detail-value">${exercise.sets}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Reps:</span>
                                    <span class="detail-value">${exercise.reps}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Descanso:</span>
                                    <span class="detail-value">${exercise.rest || '60'} seg</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Video:</span>
                                    <div class="detail-value">
                                        ${exercise.video ? videoLink : '<span style="color:#999">-</span>'}
                                    </div>
                                </div>
                            </div>
                            ${exercise.notes ? `
                            <div class="exercise-notes">
                                <span class="detail-label">Notas:</span>
                                <div class="detail-value">${exercise.notes}</div>
                            </div>
                            ` : ''}
                        </div>
                    `;
                });
            }
            
            // HTML del día
            dayCard.innerHTML = `
                <div class="day-header">
                    <div class="day-badge">
                        <i class="fas fa-calendar-day"></i> ${day.name}
                    </div>
                    <div class="day-info">
                        <div class="day-name">${day.focus || 'Entrenamiento'}</div>
                        <div class="day-focus">${day.exercises.length} ejercicio${day.exercises.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="day-actions">
                        <button class="day-action-btn add-exercise-btn" data-day-index="${dayIndex}">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="day-action-btn edit-day-btn" data-day-index="${dayIndex}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="day-action-btn remove-day-btn" data-day-index="${dayIndex}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${day.notes ? `
                <div class="day-notes">
                    <p>${day.notes}</p>
                </div>
                ` : ''}
                <div class="exercises-container">
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
        document.querySelectorAll('.day-action-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const dayIndex = parseInt(this.dataset.dayIndex);
                
                if (this.classList.contains('add-exercise-btn')) {
                    addExerciseToDay(dayIndex);
                } else if (this.classList.contains('edit-day-btn')) {
                    editDay(dayIndex);
                } else if (this.classList.contains('remove-day-btn')) {
                    removeDay(dayIndex);
                }
            });
        });
        
        // Botones de ejercicios
        document.querySelectorAll('.exercise-action-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const dayIndex = parseInt(this.dataset.dayIndex);
                const exerciseIndex = parseInt(this.dataset.exerciseIndex);
                
                if (this.classList.contains('edit-exercise-btn')) {
                    editExercise(dayIndex, exerciseIndex);
                } else if (this.classList.contains('delete-exercise-btn')) {
                    deleteExercise(dayIndex, exerciseIndex);
                }
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
            alert('Agrega al menos un día');
            return;
        }
        
        const hasExercises = days.some(day => day.exercises.length > 0);
        if (!hasExercises) {
            alert('Agrega ejercicios a los días');
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
    
    bottomPreviewBtn.addEventListener('click', showPreview);
    
    function updatePdfPreview() {
        pdfPreview.innerHTML = '';
        
        days.forEach(day => {
            if (day.exercises.length === 0) return;
            
            const daySection = document.createElement('div');
            daySection.className = 'pdf-day-preview';
            
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
                <div class="pdf-day-header">
                    <h3><i class="fas fa-calendar-day"></i> ${day.name} ${day.focus ? `(${day.focus})` : ''}</h3>
                    ${day.notes ? `<p class="pdf-day-notes">${day.notes}</p>` : ''}
                </div>
                <table class="pdf-table">
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
            alert('Agrega al menos un día');
            return;
        }
        
        const hasExercises = days.some(day => day.exercises.length > 0);
        if (!hasExercises) {
            alert('Agrega ejercicios a los días');
            return;
        }
        
        // Mostrar modal de cliente
        clientModal.classList.remove('hidden');
    }
    
    bottomGenerateBtn.addEventListener('click', generatePDF);
    
    confirmClientBtn.addEventListener('click', function() {
        const clientName = clientNameInput.value.trim() || 'Cliente de Luciana Gala';
        const routineName = routineNameInput.value.trim() || 'Rutina Personalizada';
        
        closeClientModalFunc();
        
        // Generar PDF
        createAndDownloadPDF(clientName, routineName);
    });
    
    downloadPdfBtn.addEventListener('click', function() {
        const clientName = clientNameInput.value.trim() || 'Cliente de Luciana Gala';
        const routineName = routineNameInput.value.trim() || 'Rutina Personalizada';
        
        createAndDownloadPDF(clientName, routineName);
    });
    
    editRoutineBtn.addEventListener('click', function() {
        previewSection.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });
    
    function createAndDownloadPDF(clientName, routineName) {
        // Crear contenido HTML
        const pdfContent = createPDFContent(clientName, routineName);
        
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
        }).catch(error => {
            console.error('Error al generar PDF:', error);
            alert('Error al generar PDF');
        });
    }
    
    function createPDFContent(clientName, routineName) {
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
            }
        } catch (e) {
            console.error('Error al cargar datos:', e);
        }
    }
    
    // ========== INICIALIZACIÓN ==========
    
    loadSavedData();
    
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
});