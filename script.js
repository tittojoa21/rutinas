document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let days = [];
    let usedDays = [];
    
    // Elementos del DOM
    const elements = {
        daysContainer: document.getElementById('days-container'),
        daysCount: document.getElementById('days-count'),
        addDayBtn: document.getElementById('add-day-btn'),
        previewBtn: document.getElementById('preview-btn'),
        dayModal: document.getElementById('day-modal'),
        dayModalTitle: document.getElementById('day-modal-title'),
        dayForm: document.getElementById('day-form'),
        cancelDayBtn: document.getElementById('cancel-day-btn'),
        closeDayModal: document.getElementById('close-day-modal'),
        exerciseModal: document.getElementById('exercise-modal'),
        exerciseModalTitle: document.getElementById('exercise-modal-title'),
        exerciseModalSubtitle: document.getElementById('exercise-modal-subtitle'),
        exerciseForm: document.getElementById('exercise-form'),
        cancelExerciseBtn: document.getElementById('cancel-exercise-btn'),
        closeExerciseModal: document.getElementById('close-exercise-modal'),
        previewSection: document.querySelector('.preview-section'),
        closePreviewBtn: document.getElementById('close-preview'),
        pdfContent: document.getElementById('pdf-content'),
        clientModal: document.getElementById('client-modal'),
        clientNameInput: document.getElementById('client-name'),
        routineNameInput: document.getElementById('routine-name'),
        routineNotesInput: document.getElementById('routine-notes'),
        confirmClientBtn: document.getElementById('confirm-client-btn'),
        cancelClientBtn: document.getElementById('cancel-client-btn'),
        closeClientModal: document.getElementById('close-client-modal'),
        downloadPdfBtn: document.getElementById('download-pdf-btn'),
        editRoutineBtn: document.getElementById('edit-routine-btn'),
        scrollTopBtn: document.getElementById('scroll-top-btn'),
        mobileGenerateBtn: document.getElementById('mobile-generate-btn'),
        currentDatePreview: document.getElementById('current-date-preview'),
        routineDaysPreview: document.getElementById('routine-days-preview'),
        routineNamePreview: document.getElementById('routine-name-preview'),
        clientNamePreview: document.getElementById('client-name-preview')
    };
    
    // Variables para edición
    let isEditingDay = false;
    let editingDayIndex = null;
    let isEditingExercise = false;
    let editingExerciseDayIndex = null;
    let editingExerciseIndex = null;
    
    // Inicializar
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    elements.currentDatePreview.textContent = formattedDate;
    
    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    // ========== FUNCIONES PARA DÍAS ==========
    
    function addDay() {
        elements.dayModalTitle.textContent = "Agregar Día";
        document.getElementById('modal-day-index').value = '';
        elements.dayForm.reset();
        
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
        
        for (let i = 1; i <= 5; i++) {
            const dayName = `Día ${i}`;
            if (!usedDays.includes(dayName)) {
                const option = document.createElement('option');
                option.value = dayName;
                option.textContent = dayName;
                daySelect.appendChild(option);
            }
        }
        
        elements.dayModal.classList.remove('hidden');
    }
    
    function saveDay(dayData) {
        if (isEditingDay && editingDayIndex !== null) {
            const oldDayName = days[editingDayIndex].name;
            const oldIndex = usedDays.indexOf(oldDayName);
            if (oldIndex > -1) {
                usedDays.splice(oldIndex, 1);
            }
            
            dayData.id = days[editingDayIndex].id;
            dayData.exercises = days[editingDayIndex].exercises;
            days[editingDayIndex] = dayData;
            
            showNotification(`Día "${dayData.name}" actualizado`, 'success');
        } else {
            dayData.id = Date.now() + Math.random();
            dayData.exercises = [];
            days.push(dayData);
            
            showNotification(`Día "${dayData.name}" agregado`, 'success');
        }
        
        if (!usedDays.includes(dayData.name)) {
            usedDays.push(dayData.name);
        }
        
        days.sort((a, b) => {
            const aIndex = weekDays.indexOf(a.name);
            const bIndex = weekDays.indexOf(b.name);
            
            if (aIndex > -1 && bIndex > -1) return aIndex - bIndex;
            if (aIndex > -1) return -1;
            if (bIndex > -1) return 1;
            
            const aNum = parseInt(a.name.replace('Día ', '')) || 0;
            const bNum = parseInt(b.name.replace('Día ', '')) || 0;
            return aNum - bNum;
        });
        
        updateDaysList();
        updateDaysCounter();
        elements.dayModal.classList.add('hidden');
        isEditingDay = false;
        editingDayIndex = null;
    }
    
    function editDay(index) {
        const day = days[index];
        
        document.getElementById('modal-day-index').value = index;
        document.getElementById('day-name').value = day.name;
        document.getElementById('day-focus').value = day.focus || '';
        document.getElementById('day-notes').value = day.notes || '';
        
        elements.dayModalTitle.textContent = `Editar Día: ${day.name}`;
        
        const daySelect = document.getElementById('day-name');
        daySelect.innerHTML = '<option value="">Seleccionar día...</option>';
        
        const currentOption = document.createElement('option');
        currentOption.value = day.name;
        currentOption.textContent = day.name;
        currentOption.selected = true;
        daySelect.appendChild(currentOption);
        
        weekDays.forEach(dayName => {
            if (!usedDays.includes(dayName) || dayName === day.name) {
                const option = document.createElement('option');
                option.value = dayName;
                option.textContent = dayName;
                daySelect.appendChild(option);
            }
        });
        
        for (let i = 1; i <= 5; i++) {
            const dayName = `Día ${i}`;
            if (!usedDays.includes(dayName) || dayName === day.name) {
                const option = document.createElement('option');
                option.value = dayName;
                option.textContent = dayName;
                daySelect.appendChild(option);
            }
        }
        
        isEditingDay = true;
        editingDayIndex = index;
        elements.dayModal.classList.remove('hidden');
    }
    
    function removeDay(index) {
        if (!confirm(`¿Eliminar el día "${days[index].name}" y todos sus ejercicios?`)) return;
        
        const day = days[index];
        days.splice(index, 1);
        
        const dayIndex = usedDays.indexOf(day.name);
        if (dayIndex > -1) {
            usedDays.splice(dayIndex, 1);
        }
        
        updateDaysList();
        updateDaysCounter();
        showNotification(`Día "${day.name}" eliminado`, 'info');
    }
    
    function updateDaysList() {
        elements.daysContainer.innerHTML = '';
        
        if (days.length === 0) {
            elements.daysContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-day fa-3x"></i>
                    <h3>No hay días en la rutina</h3>
                    <p>Comienza agregando un día usando el botón "Agregar Día".</p>
                </div>
            `;
            return;
        }
        
        days.forEach((day, dayIndex) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.dataset.dayId = day.id;
            dayCard.dataset.dayIndex = dayIndex;
            
            let exercisesHTML = '';
            if (day.exercises.length === 0) {
                exercisesHTML = `
                    <div class="no-exercises">
                        <i class="fas fa-dumbbell"></i>
                        <p>No hay ejercicios en este día. Agrega el primero.</p>
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
                        <div class="exercise-card">
                            <div class="exercise-header">
                                <div class="exercise-title">
                                    <div class="exercise-number">${exIndex + 1}</div>
                                    <div class="exercise-name">${exercise.name}</div>
                                    ${exercise.muscle ? `<span class="exercise-muscle">${getMuscleLabel(exercise.muscle)}</span>` : ''}
                                </div>
                                <div class="exercise-actions">
                                    <button class="exercise-action-btn edit-exercise-btn" data-day-index="${dayIndex}" data-exercise-index="${exIndex}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="exercise-action-btn delete-exercise-btn" data-day-index="${dayIndex}" data-exercise-index="${exIndex}">
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
                                    <span class="detail-label">Repeticiones:</span>
                                    <span class="detail-value">${exercise.reps}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Descanso:</span>
                                    <span class="detail-value">${exercise.rest || '60'} seg.</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Video:</span>
                                    <div class="detail-value">
                                        ${exercise.video ? videoLink : '<span style="color:#999">No especificado</span>'}
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
            
            dayCard.innerHTML = `
                <div class="day-header">
                    <div class="day-title">
                        <div class="day-badge">
                            <i class="fas fa-calendar-day"></i> ${day.name}
                        </div>
                        <div class="day-info">
                            <div class="day-name">${day.focus ? `Enfoque: ${day.focus}` : 'Entrenamiento del día'}</div>
                            <div class="day-focus">${day.exercises.length} ejercicio${day.exercises.length !== 1 ? 's' : ''}</div>
                        </div>
                    </div>
                    <div class="day-actions">
                        <button class="day-action-btn add-exercise-btn" data-day-index="${dayIndex}">
                            <i class="fas fa-plus"></i> Ejercicio
                        </button>
                        <button class="day-action-btn edit-day-btn" data-day-index="${dayIndex}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="day-action-btn remove-day-btn" data-day-index="${dayIndex}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
                ${day.notes ? `
                <div class="day-notes">
                    <p><strong>Notas:</strong> ${day.notes}</p>
                </div>
                ` : ''}
                <div class="exercises-container">
                    ${exercisesHTML}
                </div>
            `;
            
            elements.daysContainer.appendChild(dayCard);
        });
        
        // Event listeners para botones de días
        document.querySelectorAll('.day-actions button').forEach(button => {
            button.addEventListener('click', function() {
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
        
        // Event listeners para botones de ejercicios
        document.querySelectorAll('.exercise-actions button').forEach(button => {
            button.addEventListener('click', function() {
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
    
    function updateDaysCounter() {
        elements.daysCount.textContent = days.length;
        elements.routineDaysPreview.textContent = days.length;
    }
    
    // ========== FUNCIONES PARA EJERCICIOS ==========
    
    function addExerciseToDay(dayIndex) {
        const day = days[dayIndex];
        
        elements.exerciseModalTitle.textContent = "Agregar Ejercicio";
        elements.exerciseModalSubtitle.textContent = `Día: ${day.name}${day.focus ? ` (${day.focus})` : ''}`;
        document.getElementById('modal-day-index').value = dayIndex;
        document.getElementById('modal-exercise-index').value = '';
        elements.exerciseForm.reset();
        document.getElementById('exercise-sets').value = '3';
        document.getElementById('exercise-rest').value = '60';
        
        isEditingExercise = false;
        editingExerciseDayIndex = null;
        editingExerciseIndex = null;
        
        elements.exerciseModal.classList.remove('hidden');
    }
    
    function editExercise(dayIndex, exerciseIndex) {
        const day = days[dayIndex];
        const exercise = day.exercises[exerciseIndex];
        
        elements.exerciseModalTitle.textContent = "Editar Ejercicio";
        elements.exerciseModalSubtitle.textContent = `Día: ${day.name} - ${exercise.name}`;
        document.getElementById('modal-day-index').value = dayIndex;
        document.getElementById('modal-exercise-index').value = exerciseIndex;
        
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
        
        elements.exerciseModal.classList.remove('hidden');
    }
    
    function saveExercise(exerciseData) {
        const dayIndex = parseInt(document.getElementById('modal-day-index').value);
        
        if (isEditingExercise && editingExerciseDayIndex !== null && editingExerciseIndex !== null) {
            days[editingExerciseDayIndex].exercises[editingExerciseIndex] = exerciseData;
            showNotification(`Ejercicio "${exerciseData.name}" actualizado`, 'success');
        } else {
            days[dayIndex].exercises.push(exerciseData);
            showNotification(`Ejercicio "${exerciseData.name}" agregado`, 'success');
        }
        
        updateDaysList();
        elements.exerciseModal.classList.add('hidden');
        
        // Desplazar al día
        setTimeout(() => {
            const dayElement = document.querySelector(`[data-day-index="${dayIndex}"]`);
            if (dayElement) {
                dayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }
    
    function deleteExercise(dayIndex, exerciseIndex) {
        const exercise = days[dayIndex].exercises[exerciseIndex];
        
        if (!confirm(`¿Eliminar el ejercicio "${exercise.name}"?`)) return;
        
        days[dayIndex].exercises.splice(exerciseIndex, 1);
        updateDaysList();
        showNotification(`Ejercicio "${exercise.name}" eliminado`, 'info');
    }
    
    // ========== MANEJO DE FORMULARIOS ==========
    
    elements.dayForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const dayData = {
            name: document.getElementById('day-name').value,
            focus: document.getElementById('day-focus').value.trim(),
            notes: document.getElementById('day-notes').value.trim()
        };
        
        if (!dayData.name) {
            showNotification('Selecciona un día', 'error');
            return;
        }
        
        saveDay(dayData);
    });
    
    elements.exerciseForm.addEventListener('submit', function(e) {
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
        
        if (!exerciseData.name) {
            showNotification('Nombre del ejercicio requerido', 'error');
            return;
        }
        
        if (!exerciseData.sets || exerciseData.sets < 1) {
            showNotification('Mínimo 1 serie', 'error');
            return;
        }
        
        if (!exerciseData.reps) {
            showNotification('Repeticiones requeridas', 'error');
            return;
        }
        
        if (exerciseData.video && !isValidUrl(exerciseData.video)) {
            showNotification('URL de video inválida', 'error');
            return;
        }
        
        saveExercise(exerciseData);
    });
    
    // ========== VISTA PREVIA Y PDF ==========
    
    elements.previewBtn.addEventListener('click', function() {
        if (days.length === 0) {
            showNotification('Agrega al menos un día a la rutina', 'warning');
            return;
        }
        
        const hasExercises = days.some(day => day.exercises.length > 0);
        if (!hasExercises) {
            showNotification('Agrega al menos un ejercicio', 'warning');
            return;
        }
        
        updatePdfPreview();
        elements.previewSection.classList.remove('hidden');
        elements.previewSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    elements.closePreviewBtn.addEventListener('click', function() {
        elements.previewSection.classList.add('hidden');
    });
    
    function updatePdfPreview() {
        elements.pdfContent.innerHTML = '';
        
        days.forEach(day => {
            if (day.exercises.length === 0) return;
            
            const daySection = document.createElement('div');
            daySection.className = 'pdf-day-section';
            
            let tableRows = '';
            day.exercises.forEach((exercise, index) => {
                let videoCell = '<td>-</td>';
                if (exercise.video) {
                    const shortUrl = exercise.video.length > 20 ? 
                        exercise.video.substring(0, 20) + '...' : exercise.video;
                    
                    videoCell = `
                        <td class="video-cell">
                            <a href="${exercise.video}" target="_blank" title="Ver video de ${exercise.name}">
                                <i class="fas fa-video"></i> ${shortUrl}
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
                        <td>${exercise.rest || '60'} seg.</td>
                        ${videoCell}
                        <td>${exercise.notes || '-'}</td>
                    </tr>
                `;
            });
            
            daySection.innerHTML = `
                <div class="pdf-day-header">
                    <div class="pdf-day-title">
                        <i class="fas fa-calendar-day"></i> ${day.name}
                        ${day.focus ? `<span style="font-size: 0.9rem; color: #666; margin-left: 10px;">(${day.focus})</span>` : ''}
                    </div>
                    ${day.notes ? `
                    <div class="pdf-day-notes">
                        <strong>Notas del día:</strong> ${day.notes}
                    </div>
                    ` : ''}
                </div>
                <table class="pdf-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Ejercicio</th>
                            <th>Grupo Muscular</th>
                            <th>Series</th>
                            <th>Repeticiones</th>
                            <th>Descanso</th>
                            <th>Video</th>
                            <th>Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            `;
            
            elements.pdfContent.appendChild(daySection);
        });
        
        const generalNotes = elements.routineNotesInput.value.trim();
        if (generalNotes) {
            const notesSection = document.createElement('div');
            notesSection.className = 'pdf-routine-notes';
            notesSection.innerHTML = `
                <h3><i class="fas fa-clipboard-check"></i> Notas Generales</h3>
                <p>${generalNotes.replace(/\n/g, '<br>')}</p>
            `;
            elements.pdfContent.appendChild(notesSection);
        }
    }
    
    // ========== GENERACIÓN DE PDF ==========
    
    function openClientModal() {
        if (days.length === 0) {
            showNotification('Agrega al menos un día a la rutina', 'warning');
            return;
        }
        
        const hasExercises = days.some(day => day.exercises.length > 0);
        if (!hasExercises) {
            showNotification('Agrega al menos un ejercicio', 'warning');
            return;
        }
        
        elements.clientModal.classList.remove('hidden');
    }
    
    elements.confirmClientBtn.addEventListener('click', function() {
        const clientName = elements.clientNameInput.value.trim() || 'Cliente de Luciana Gala';
        const routineName = elements.routineNameInput.value.trim() || 'Rutina Personalizada';
        const routineNotes = elements.routineNotesInput.value.trim();
        
        elements.clientModal.classList.add('hidden');
        elements.clientNamePreview.textContent = clientName;
        elements.routineNamePreview.textContent = routineName;
        
        generatePdf(clientName, routineName, routineNotes);
    });
    
    elements.downloadPdfBtn.addEventListener('click', function() {
        const clientName = elements.clientNamePreview.textContent;
        const routineName = elements.routineNamePreview.textContent;
        const routineNotes = elements.routineNotesInput.value.trim();
        
        generatePdf(clientName, routineName, routineNotes);
    });
    
    function generatePdf(clientName, routineName, routineNotes) {
        showNotification('Generando PDF...', 'info');
        
        const pdfContentHtml = createPdfContent(clientName, routineName, routineNotes);
        
        const tempElement = document.createElement('div');
        tempElement.style.width = '210mm';
        tempElement.style.padding = '20mm';
        tempElement.style.backgroundColor = 'white';
        tempElement.style.fontFamily = "'Poppins', sans-serif";
        tempElement.style.fontSize = '12px';
        tempElement.innerHTML = pdfContentHtml;
        
        document.body.appendChild(tempElement);
        
        html2canvas(tempElement, {
            scale: 2,
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
            
            const imgData = canvas.toDataURL('image/png');
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            const fileName = `Rutina_${routineName.replace(/\s+/g, '_')}_${formattedDate.replace(/\//g, '-')}.pdf`;
            pdf.save(fileName);
            
            showNotification(`PDF "${fileName}" descargado`, 'success');
        }).catch(error => {
            console.error('Error:', error);
            showNotification('Error al generar PDF', 'error');
        });
    }
    
    function createPdfContent(clientName, routineName, routineNotes) {
        let daysSections = '';
        days.forEach(day => {
            if (day.exercises.length === 0) return;
            
            let tableRows = '';
            day.exercises.forEach((exercise, index) => {
                let videoCell = '<td>-</td>';
                if (exercise.video) {
                    const shortUrl = exercise.video.length > 25 ? 
                        exercise.video.substring(0, 25) + '...' : exercise.video;
                    
                    videoCell = `<td><a href="${exercise.video}" style="color: #2196f3; text-decoration: underline;">${shortUrl}</a></td>`;
                }
                
                tableRows += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${exercise.name}</strong></td>
                        <td>${getMuscleLabel(exercise.muscle) || '-'}</td>
                        <td>${exercise.sets}</td>
                        <td>${exercise.reps}</td>
                        <td>${exercise.rest || '60'} seg.</td>
                        ${videoCell}
                        <td>${exercise.notes || '-'}</td>
                    </tr>
                `;
            });
            
            daysSections += `
                <div style="margin-bottom: 25px; page-break-inside: avoid;">
                    <div style="background-color: #e1bee7; color: #333; padding: 12px 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ba68c8;">
                        <div style="font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                            <span style="color: #ba68c8;">📅</span> ${day.name}
                            ${day.focus ? `<span style="font-size: 12px; color: #666; margin-left: 10px;">(${day.focus})</span>` : ''}
                        </div>
                        ${day.notes ? `
                        <div style="background-color: rgba(255, 255, 255, 0.7); border-radius: 6px; padding: 8px; margin-top: 8px; font-size: 11px; border-left: 3px solid #f06292;">
                            <strong>Notas del día:</strong> ${day.notes}
                        </div>
                        ` : ''}
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead style="background-color: #f8bbd9;">
                            <tr>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #f06292;">#</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #f06292;">Ejercicio</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #f06292;">Grupo Muscular</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #f06292;">Series</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #f06292;">Repeticiones</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #f06292;">Descanso</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #f06292;">Video</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #f06292;">Notas</th>
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
            <div style="font-family: 'Poppins', sans-serif; color: #333; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #ba68c8; flex-wrap: wrap;">
                    <div>
                        <h1 style="color: #ba68c8; margin: 0 0 5px 0; font-size: 22px; display: flex; align-items: center;">
                            <span style="margin-right: 10px;">🏋️</span> Luciana Gala
                        </h1>
                        <p style="color: #666; margin: 0; font-size: 13px;">Personal Trainer - Rutina Personalizada</p>
                    </div>
                    <div style="text-align: right;">
                        <h3 style="margin: 0 0 5px 0; font-size: 15px;">RUTINA: <span style="color: #ba68c8;">${routineName}</span></h3>
                        <h4 style="margin: 0 0 5px 0; font-size: 14px;">PARA: <span style="color: #2196f3;">${clientName}</span></h4>
                        <p style="color: #666; margin: 0; font-size: 12px;">Fecha: ${formattedDate}</p>
                        <p style="color: #666; margin: 0; font-size: 12px;">Días: ${days.length}</p>
                    </div>
                </div>
                
                ${daysSections}
                
                ${routineNotes ? `
                <div style="background-color: #f5f5f5; border-radius: 8px; padding: 18px; margin-top: 25px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
                    <h3 style="color: #2196f3; margin: 0 0 12px 0; font-size: 14px; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">📝</span> Notas Generales
                    </h3>
                    <div style="white-space: pre-line; line-height: 1.5;">
                        ${routineNotes}
                    </div>
                </div>
                ` : ''}
                
                <div style="display: flex; justify-content: space-between; padding-top: 25px; margin-top: 25px; border-top: 1px solid #e0e0e0; font-size: 11px; flex-wrap: wrap;">
                    <div style="text-align: center; width: 40%; min-width: 200px;">
                        <p style="margin: 0 0 20px 0;">_________________________</p>
                        <p style="margin: 0 0 5px 0; font-weight: bold;">Luciana Gala</p>
                        <p style="margin: 0 0 5px 0;">Personal Trainer</p>
                        <p style="margin: 0;">Contacto: +54 3472 55-8896</p>
                    </div>
                    <div style="width: 55%; min-width: 250px;">
                        <h4 style="color: #ba68c8; margin: 0 0 10px 0; font-size: 12px; display: flex; align-items: center;">
                            <span style="margin-right: 8px;">💡</span> Consejos:
                        </h4>
                        <ul style="margin: 0; padding-left: 20px; color: #666;">
                            <li>Calentar 5-10 minutos antes</li>
                            <li>Mantener buena hidratación</li>
                            <li>Enfocarse en la técnica</li>
                            <li>Descansar cuando sea necesario</li>
                        </ul>
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
            'abdomen': 'Abdomen',
            'cardio': 'Cardio',
            'full-body': 'Full Body',
            'otros': 'Otros'
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
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // ========== EVENT LISTENERS ==========
    
    elements.addDayBtn.addEventListener('click', addDay);
    elements.mobileGenerateBtn.addEventListener('click', openClientModal);
    elements.cancelDayBtn.addEventListener('click', () => elements.dayModal.classList.add('hidden'));
    elements.closeDayModal.addEventListener('click', () => elements.dayModal.classList.add('hidden'));
    elements.cancelExerciseBtn.addEventListener('click', () => elements.exerciseModal.classList.add('hidden'));
    elements.closeExerciseModal.addEventListener('click', () => elements.exerciseModal.classList.add('hidden'));
    elements.cancelClientBtn.addEventListener('click', () => elements.clientModal.classList.add('hidden'));
    elements.closeClientModal.addEventListener('click', () => elements.clientModal.classList.add('hidden'));
    elements.editRoutineBtn.addEventListener('click', () => {
        elements.previewSection.classList.add('hidden');
        document.querySelector('.days-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    });
    
    // Scroll top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            elements.scrollTopBtn.classList.add('visible');
        } else {
            elements.scrollTopBtn.classList.remove('visible');
        }
    });
    
    elements.scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Prevenir zoom en inputs en iOS
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('touchstart', function() {
            this.style.fontSize = '16px';
        });
        
        el.addEventListener('blur', function() {
            this.style.fontSize = '';
        });
    });
    
    // Cargar ejemplo inicial (opcional)
    setTimeout(() => {
        // Puedes descomentar esto para cargar un ejemplo
        /*
        const exampleDays = [
            {
                name: 'Lunes',
                focus: 'Piernas y Abdomen',
                notes: 'Calentar 10 minutos antes de comenzar',
                exercises: [
                    {
                        name: "Sentadillas",
                        muscle: "piernas",
                        sets: "4",
                        reps: "10-12",
                        rest: "60",
                        video: "https://www.youtube.com/watch?v=aclHkVaku9U",
                        notes: "Mantener la espalda recta"
                    },
                    {
                        name: "Press de Banca",
                        muscle: "pecho",
                        sets: "3",
                        reps: "8-10",
                        rest: "90",
                        video: "https://www.youtube.com/watch?v=vc1E5CfRfos",
                        notes: "Controlar el movimiento"
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
        updateDaysCounter();
        
        showNotification("Ejemplo cargado. Edítalo o agrega más días.", "info");
        */
    }, 1000);
});