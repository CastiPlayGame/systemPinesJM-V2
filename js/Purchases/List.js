/**
 * Purchases List - Gestión de compras a proveedores
 */

/**
 * Renderiza un badge de estado con colores según el valor.
 * @param {string} status - El estado de la compra.
 * @returns {string} HTML del badge.
 */
function renderStatus(status) {
    let color = "secondary";
    let text = status;
    switch (status?.toLowerCase()) {
        case "completed": color = "success"; text = "Completado"; break;
        case "pending": color = "warning"; text = "Pendiente"; break;
        case "shipped": color = "info"; text = "Enviado"; break;
        case "received": color = "primary"; text = "Recibido"; break;
    }
    return `<span class="badge bg-${color} px-3 py-2">${text}</span>`;
}

/**
 * Formatea una fecha a formato legible
 * @param {string} dateStr - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Actualiza la tabla de compras obteniendo los datos desde la API.
 */
function updateTable() {
    const $tbody = $("table tbody");
    $tbody.html('<tr><td colspan="8" class="text-center"><div class="spinner-border text-primary" role="status"></div> Cargando...</td></tr>');

    $.ajax({
        type: "POST",
        url: "api/code-obtain.php",
        data: "Provider&ListBuys",
        dataType: "json",
        success: (data) => {
            if (!data || !data.length) {
                $tbody.html('<tr><td colspan="8" class="text-center text-muted"><i class="bi bi-inbox"></i> No hay compras registradas.</td></tr>');
                return;
            }

            const rows = data.map(purchase => `
                <tr>
                    <th class="col-2 col-md-1" scope="col">${purchase.id}</th>
                    <td class="col-3 d-none d-sm-none d-md-table-cell">${purchase.provider_name}</td>
                    <td class="col-6 d-sm-table-cell d-md-none">
                        <div><strong>${purchase.provider_name}</strong></div>
                        <small class="text-muted">${formatDate(purchase.created_at)}</small>
                    </td>
                    <td class="col-2 d-none d-sm-none d-md-table-cell">${formatDate(purchase.created_at)}</td>
                    <td class="col-2 d-none d-sm-none d-lg-table-cell">${formatDate(purchase.updated_at)}</td>
                    <td class="col-2 d-none d-sm-none d-md-table-cell">
                        <span class="text-success fw-bold">$${purchase.total_cost.toFixed(2)}</span>
                        <small class="text-muted d-block">${purchase.total_units} und.</small>
                    </td>
                    <td class="col-2 d-none d-sm-none d-lg-table-cell">${renderStatus(purchase.status)}</td>
                    <td class="col-4 col-md-2">
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 view-purchase-btn" data-id="${purchase.id}" data-uuid="${purchase.uuid}" title="Ver detalles">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 delete-purchase-btn" data-id="${purchase.id}" data-uuid="${purchase.uuid}" title="Eliminar">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            $tbody.html(rows);
        },
        error: () => $tbody.html('<tr><td colspan="8" class="text-center text-danger"><i class="bi bi-exclamation-triangle"></i> Error al cargar los datos.</td></tr>')
    });
}

// --- EJECUCIÓN INICIAL Y MANEJADORES DE EVENTOS ---
$(document).ready(() => {
    // Evento para el filtro de búsqueda
    $('#qinput').on('keyup', function () {
        const value = this.value.toLowerCase();
        $("table tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    // Ver detalles de compra
    $(document).on('click', '.view-purchase-btn', function () {
        const purchaseId = $(this).data('id');
        const purchaseUuid = $(this).data('uuid');

        new modalPinesJM().create(
            "Purchases&ListBuys&Mode=View&id=" + purchaseId + "&uuid=" + purchaseUuid,
            2
        );
    });

    // Eliminar compra
    $(document).on('click', '.delete-purchase-btn', function () {
        const purchaseId = $(this).data('id');
        const purchaseUuid = $(this).data('uuid');

        Swal.fire({
            title: '¿Eliminar Compra?',
            html: `¿Estás seguro de que quieres eliminar la compra <b>#${purchaseId}</b>?<br/><br/>Esta acción no se puede deshacer.`,
            icon: 'error',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "api/code-del.php",
                    data: "ProviderPurchase&uuid=" + purchaseUuid,
                    success: function (response) {
                        const result = JSON.parse(response);
                        if (result[0]) {
                            Swal.fire('¡Eliminado!', 'La compra ha sido eliminada.', 'success');
                            updateTable();
                        } else {
                            Swal.fire('Error', result[1] || 'No se pudo eliminar la compra.', 'error');
                        }
                    },
                    error: () => Swal.fire('Error', 'Error de conexión.', 'error')
                });
            }
        });
    });

    // Marcar como Enviado
    $(document).on('click', '#markShipped', function () {
        const uuid = $(this).data('uuid');
        updatePurchaseStatus(uuid, 'shipped', 'Enviado');
    });

    // Marcar como Recibido
    $(document).on('click', '#markReceived', function () {
        const uuid = $(this).data('uuid');
        updatePurchaseStatus(uuid, 'received', 'Recibido');
    });

    // Cerrar Compra (Completado)
    $(document).on('click', '#markCompleted', function () {
        const uuid = $(this).data('uuid');
        updatePurchaseStatus(uuid, 'completed', 'Completado');
    });

    // Toggle is_closed for a product
    $(document).on('change', '.toggle-is-closed', function () {
        const $toggle = $(this);
        const uuid = $toggle.data('uuid');
        const code = $toggle.data('code');
        const isClosed = $toggle.is(':checked');

        $.ajax({
            type: "POST",
            url: "api/code-edit.php",
            data: "Purchases&ToggleProductClosed&uuid=" + uuid + "&code=" + encodeURIComponent(code) + "&is_closed=" + isClosed,
            success: function (response) {
                const res = JSON.parse(response);
                if (res[0]) {
                    new messageTemp('Pines Jm', 'Producto ' + (isClosed ? 'cerrado' : 'abierto'), 'success');
                } else {
                    Swal.fire('Error', res[1] || 'No se pudo actualizar.', 'error');
                    // Revert toggle
                    $toggle.prop('checked', !isClosed);
                }
            },
            error: function () {
                Swal.fire('Error', 'Error de conexión.', 'error');
                // Revert toggle
                $toggle.prop('checked', !isClosed);
            }
        });
    });
});

/**
 * Actualiza el estado de una compra
 * @param {string} uuid - UUID de la compra
 * @param {string} status - Nuevo estado
 * @param {string} statusLabel - Etiqueta del estado para mostrar
 */
function updatePurchaseStatus(uuid, status, statusLabel) {
    Swal.fire({
        title: '¿Cambiar Estado?',
        html: `¿Marcar esta compra como <b>${statusLabel}</b>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: "api/code-edit.php",
                data: "Purchases&ChangeStatus&uuid=" + uuid + "&status=" + status,
                success: function (response) {
                    const res = JSON.parse(response);
                    if (res[0]) {
                        Swal.fire('¡Actualizado!', 'Estado cambiado a ' + statusLabel, 'success');
                        new modalPinesJM().close();
                        updateTable();
                    } else {
                        Swal.fire('Error', res[1] || 'No se pudo actualizar.', 'error');
                    }
                },
                error: () => Swal.fire('Error', 'Error de conexión.', 'error')
            });
        }
    });
}
