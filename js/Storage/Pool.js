
let poolUpdateInterval = null;


/**
 * Renderiza un badge de estado con colores según el valor.
 * @param {string} status - El estado del trabajo.
 * @returns {string} HTML del badge.
 */
function renderStatus(status) {
    let color = "secondary";
    switch (status?.toLowerCase()) {
        case "completed": case "completado": color = "success"; break;
        case "pending": case "pendiente": color = "warning"; break;
        case "failed": case "fallido": case "cancelled": color = "danger"; break;
        case "processing": case "procesando": color = "info"; break;
    }
    return `<span class="badge bg-${color} px-3 py-2">${status || '-'}</span>`;
}

/**
 * Renderiza el monto con un ícono y color.
 * @param {number|string} amount - El monto a renderizar.
 * @returns {string} HTML del monto formateado.
 */
function renderLoadAmount(amount) {
    if (typeof amount !== "number" && isNaN(amount)) return `<span class="text-muted">-</span>`;
    const numAmount = Number(amount);
    let color = "secondary", icon = "dash-circle";
    if (numAmount > 0) { color = "success"; icon = "arrow-up-circle-fill"; }
    else if (numAmount < 0) { color = "danger"; icon = "arrow-down-circle-fill"; }
    return `<span class="fw-bold text-${color}"><i class="bi bi-${icon}"></i> ${numAmount}</span>`;
}

/**
 * Renderiza un badge para la prioridad.
 * @param {number} priority - 0 para Baja, 1 para Alta.
 * @returns {string} HTML del badge de prioridad.
 */
function renderPriority(priority) {
    return priority == 1 ? '<span class="badge bg-danger">ALTA</span>' : '<span class="badge bg-secondary">Baja</span>';
}

// --- LÓGICA DE LA TABLA Y PROCESAMIENTO ---

/** Deshabilita la interacción con la tabla y la atenúa. */
function disablePoolTable() {
    $('#Pool tbody').css({ 'opacity': 0.5, 'pointer-events': 'none' });
}

/** Habilita la interacción con la tabla y restaura su opacidad. */
function enablePoolTable() {
    $('#Pool tbody').css({ 'opacity': 1, 'pointer-events': 'auto' });
}

/** Detiene la actualización automática de la tabla. */
function stopPoolUpdates() {
    if (poolUpdateInterval) clearInterval(poolUpdateInterval);
}

/** Inicia la actualización automática de la tabla cada `updateSLong` segundos. */
function startPoolUpdates() {
    stopPoolUpdates(); // Previene intervalos duplicados
    poolUpdateInterval = setInterval(updatePoolTable, updateTime * 1000);
}

/** Actualiza la tabla de trabajos obteniendo los datos desde la API. */
function updatePoolTable() {
    const $tbody = $("#Pool tbody");
    $tbody.html('<tr><td colspan="8" class="text-center"><div class="spinner-border text-primary" role="status"></div> Cargando...</td></tr>');
    $.ajax({
        type: "GET",
        url: `${urlAPI}batch_jobs`,
        headers: { 'Authorization': `Bearer ${apiKey}` },
        dataType: "json",
        success: (data) => {
            const jobs = data?.response?.jobs || [];
            if (!jobs.length) {
                $tbody.html('<tr><td colspan="8" class="text-center text-muted"><i class="bi bi-inbox"></i> No hay trabajos en la cola.</td></tr>');
                return;
            }
            const rows = jobs.map(job => `
                <tr>
                    <th>${job.id}</th>
                    <td>${renderPriority(job.priority)}</td>
                    <td>${job.code || '-'}</td>
                    <td>${renderLoadAmount(job.load_amount)}</td>
                    <td>${formatDate(job.created_at)}</td>
                    <td>${formatDate(job.completed_at)}</td>
                    <td>${renderStatus(job.status)}</td>
                    <td>
                        <button type="button" class="btn btn-outline-dark shadow-none edit-priority-btn" data-id="${job.id}" data-priority="${job.priority}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-dark shadow-none delete-job-btn" data-id="${job.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            $tbody.html(rows);
        },
        error: () => $tbody.html('<tr><td colspan="8" class="text-center text-danger"><i class="bi bi-exclamation-triangle"></i> Error al cargar los datos.</td></tr>')
    });
}


// --- LÓGICA DE ACCIONES DE USUARIO ---

/** Muestra una alerta para confirmar el cambio de prioridad. */
function handleChangePriority(jobId, currentPriority) {
    const newPriority = currentPriority === 1 ? 0 : 1;
    Swal.fire({
        title: 'Confirmar Cambio',
        html: `¿Cambiar la prioridad del trabajo <b>#${jobId}</b> de ${renderPriority(currentPriority)} a ${renderPriority(newPriority)}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) updateJobPriorityApi(jobId, newPriority);
    });
}

/** Realiza la llamada PATCH para actualizar la prioridad. */
function updateJobPriorityApi(jobId, newPriority) {
    $.ajax({
        type: "PATCH",
        url: `${urlAPI}batch_jobs/${jobId}`,
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        data: JSON.stringify({ priority: newPriority }),
        success: () => {
            Swal.fire('¡Éxito!', 'La prioridad ha sido cambiada.', 'success');
            updatePoolTable();
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar la prioridad.', 'error')
    });
}

/** Muestra una alerta de confirmación para cancelar un trabajo. */
function handleCancelJob(jobId) {
    Swal.fire({
        title: '¿Cancelar Trabajo?',
        html: `¿Estás seguro de que quieres cancelar el trabajo <b>#${jobId}</b>? <br/><br/>Esta acción no se puede deshacer.`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar trabajo',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) cancelJobApi(jobId);
    });
}

/** Realiza la llamada PATCH para actualizar el estado a "cancelled". */
function cancelJobApi(jobId) {
    $.ajax({
        type: "PATCH",
        url: `${urlAPI}batch_jobs/${jobId}`,
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        data: JSON.stringify({ "status": "cancelled" }),
        success: () => {
            Swal.fire('¡Cancelado!', 'El trabajo ha sido cancelado.', 'success');
            updatePoolTable();
        },
        error: () => Swal.fire('Error', 'No se pudo cancelar el trabajo.', 'error')
    });
}


// --- LÓGICA DE LA CUENTA REGRESIVA DEL LOTE (BATCH) ---

const BATCH_WINDOWS = [
    { hour: 12, minute: 0, duration: 2 }, // 12:00 - 12:02
    { hour: 15, minute: 58, duration: 2 } // 15:58 - 16:00
];

/** Obtiene la próxima ventana de lote, indicando si está activa. */
function getNextBatchTime(now = new Date()) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const window of BATCH_WINDOWS) {
        const windowStartMinutes = window.hour * 60 + window.minute;
        const windowEndMinutes = windowStartMinutes + window.duration;
        const target = new Date(now);
        target.setHours(window.hour, window.minute, 0, 0);

        if (currentMinutes >= windowStartMinutes && currentMinutes < windowEndMinutes) {
            return { target, isActive: true, activeWindow: window };
        }
        if (currentMinutes < windowStartMinutes) {
            return { target, isActive: false };
        }
    }
    const nextWindow = BATCH_WINDOWS[0];
    const target = new Date(now);
    target.setDate(target.getDate() + 1);
    target.setHours(nextWindow.hour, nextWindow.minute, 0, 0);
    return { target, isActive: false };
}

/** Actualiza el contador y gestiona el bloqueo de la tabla durante el procesamiento. */
function updateCountdownPoolBatch() {
    const el = document.getElementById('countdownPoolBatch');
    if (!el) return;

    const { target, isActive, activeWindow } = getNextBatchTime();
    
    if (isActive) {
        // Estado de PROCESAMIENTO ACTIVO
        stopPoolUpdates();
        disablePoolTable();

        const endTime = target.getTime() + activeWindow.duration * 60 * 1000;
        const secondsLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        
        if (secondsLeft > 0) {
            const minutes = Math.floor(secondsLeft / 60);
            const seconds = secondsLeft % 60;
            el.textContent = `Procesando la pool... Tiempo restante: ${minutes}m ${seconds.toString().padStart(2, '0')}s`;
            el.className = 'alert alert-danger';
        } else {
            // El tiempo de procesamiento acaba de terminar en este ciclo
            enablePoolTable();
            updatePoolTable(); // Actualiza la tabla inmediatamente
            startPoolUpdates(); // Reanuda la actualización automática
        }
    } else {
        // Estado NORMAL de espera
        enablePoolTable(); // Asegura que la tabla esté habilitada
        const secondsLeft = Math.max(0, Math.floor((target - Date.now()) / 1000));
        const label = target.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const hours = Math.floor(secondsLeft / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;
        const timeString = `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`;

        el.textContent = `Próximo lote de baja prioridad: ${label} en ${timeString}`;
        el.className = 'alert alert-info';
    }
}


// --- EJECUCIÓN INICIAL Y MANEJADORES DE EVENTOS ---
$(document).ready(() => {
    // Inicia la cuenta regresiva si el elemento existe
    if ($('#countdownPoolBatch').length) {
        updateCountdownPoolBatch();
        setInterval(updateCountdownPoolBatch, 1000);
    }
    
    // Carga la tabla de trabajos si el elemento existe
    if ($('#Pool').length) {
        updatePoolTable();
        startPoolUpdates();
    }
    
    // Evento para el filtro de búsqueda
    $('#qinput').on('keyup', function() {
        const value = this.value.toLowerCase();
        $("#Pool tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    // Eventos delegados para los botones de acción en la tabla
    $(document).on('click', '.edit-priority-btn', function() {
        const jobId = $(this).data('id');
        const currentPriority = parseInt($(this).data('priority'), 10);
        handleChangePriority(jobId, currentPriority);
    });

    $(document).on('click', '.delete-job-btn', function() {
        const jobId = $(this).data('id');
        handleCancelJob(jobId);
    });
});