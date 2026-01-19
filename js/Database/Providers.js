function updateTable() {
    const scrollOld = $('.table tbody').scrollTop();
    $.ajax({
        type: "POST",
        url: "api/code-obtain.php",
        data: "DataBase&Providers",
        cache: false,
        success: function (data) {
            $(document).find("table tbody").html(data);
            $(document).find("#qinput").trigger('keyup');
            $('.table tbody').scrollTop(scrollOld);
        }
    });
}

$(document).ready(function () {

    $(document).on("keyup", "#qinput", function () {
        var value = $(this).val().toLowerCase();
        $(document).find("table tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $(document).on("submit", '#newProvider', function (event) {
        event.preventDefault();
        var name = $("input[name='name']").val();
        var platform = $("select[name='platform']").val();
        var platformOther = $("input[name='platform_other']").val();
        var email = $("input[name='email']").val();
        var contact = $("input[name='contact']").val();

        if (!name || !platform || !email || !contact) {
            new messageTemp('Pines Jm', 'Rellene Todas Las Casillas', 'info');
            return;
        }

        // If platform is "other", platform_other is required
        if (platform === "other" && !platformOther) {
            new messageTemp('Pines Jm', 'Debe especificar la otra plataforma', 'info');
            return;
        }

        var form = $(this).serialize() + "&Provider";
        Swal.fire({
            title: "¿Quieres Crear El Proveedor?",
            text: name,
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    beforeSend: function () {
                        Swal.fire({
                            html: new sweet_loader().loader("Procesando"),
                            showDenyButton: false,
                            showCancelButton: false,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false
                        });
                    },
                    type: "POST",
                    url: "api/code-new.php",
                    data: form,
                    cache: false,
                    success: function (data) {
                        var res = JSON.parse(data);
                        if (res[0] == false) {
                            Swal.fire({
                                title: "Ups! Algo Salio Mal",
                                text: res[1],
                                icon: "error"
                            });
                            updateTable();
                            new modalPinesJM().close();
                            return;
                        }
                        updateTable();
                        new modalPinesJM().close();
                        Swal.fire({
                            title: "Operacion Exitosa",
                            text: "Proveedor Creado",
                            icon: "success"
                        }).then(() => {
                            // Show option to add provider codes
                            Swal.fire({
                                title: "¿Agregar códigos de proveedor?",
                                text: "¿Desea agregar códigos de proveedor ahora?",
                                showCancelButton: true,
                                confirmButtonText: "Sí, agregar códigos",
                                cancelButtonText: "No, más tarde",
                                icon: "question"
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    // Get the provider ID from the response or table
                                    // For now, we'll need to refresh the table and find the provider
                                    updateTable();
                                    // You can implement a more direct approach here
                                }
                            });
                        });
                    }
                });
            }
        });
    });

    $(document).on("submit", '#editProvider', function (event) {
        event.preventDefault();
        var name = $("input[name='name']").val();
        var platform = $("select[name='platform']").val();
        var platformOther = $("input[name='platform_other']").val();
        var email = $("input[name='email']").val();
        var contact = $("input[name='contact']").val();

        if (!name || !platform || !email || !contact) {
            new messageTemp('Pines Jm', 'Rellene Todas Las Casillas', 'info');
            return;
        }

        // If platform is "other", platform_other is required
        if (platform === "other" && !platformOther) {
            new messageTemp('Pines Jm', 'Debe especificar la otra plataforma', 'info');
            return;
        }

        var form = $(this).serialize() + "&Provider&Edit&" + $(this).attr('data-params-post');
        Swal.fire({
            title: "¿Quieres Editar El Proveedor?",
            text: name,
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    beforeSend: function () {
                        Swal.fire({
                            html: new sweet_loader().loader("Procesando"),
                            showDenyButton: false,
                            showCancelButton: false,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false
                        });
                    },
                    type: "POST",
                    url: "api/code-edit.php",
                    data: form,
                    cache: false,
                    success: function (data) {
                        var res = JSON.parse(data);
                        if (res[0] == false) {
                            Swal.fire({
                                title: "Ups! Algo Salio Mal",
                                text: res[1],
                                icon: "error"
                            });
                            updateTable();
                            new modalPinesJM().close();
                            return;
                        }
                        updateTable();
                        new modalPinesJM().close();
                        Swal.fire({
                            title: "Operacion Exitosa",
                            text: "Proveedor Editado",
                            icon: "success"
                        });
                    }
                });
            }
        });
    });

    $(document).on("click", '#delBtnProvider', function (event) {
        event.preventDefault();
        var trdiv = $(this).parent().parent();
        var btn = $(this);
        Swal.fire({
            title: "Quieres Eliminar Este Proveedor",
            text: trdiv.find('td').eq(1).text(), // Assuming name is in second column
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "SI",
            denyButtonText: "No"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    beforeSend: function () {
                        swal.fire({
                            html: new sweet_loader().loader('Procesando'),
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            allowEscapeKey: false
                        });
                    },
                    type: "POST",
                    url: "api/code-delete.php",
                    data: `Provider&ProviderId=${btn.attr('input-data')}`,
                    cache: false,
                    success: function (data) {
                        var json = JSON.parse(data);
                        if (json[0] == true) {
                            Swal.fire({
                                title: "Operacion Exitosa",
                                text: "Proveedor Eliminado",
                                icon: "success"
                            });
                            updateTable();
                        } else {
                            updateTable();
                            Swal.fire({
                                title: "Operacion Errada",
                                html: json[1],
                                icon: "error"
                            });
                        }
                    }
                });
            }
        });
    });

    // Modal: Provider Codes (moved from PHP inline)
    // Search items (debounced + abort in-flight + scanner-aware)
    // detect scanner typing speed
    $(document).on('keydown', '#itemSearch', function () {
        var now = Date.now();
        window._provKeyTimes = window._provKeyTimes || [];
        window._provKeyTimes.push(now);
        if (window._provKeyTimes.length > 12) window._provKeyTimes.shift();
        if (window._provKeyTimes.length > 1) {
            var diffs = [];
            for (var i = 1; i < window._provKeyTimes.length; i++) diffs.push(window._provKeyTimes[i] - window._provKeyTimes[i - 1]);
            var avg = diffs.reduce(function (a, b) { return a + b; }, 0) / diffs.length;
            window._provForceSearch = avg < 45; // very fast => scanner
        }
    });

    $(document).on('input', '#itemSearch', function () {
        var $inp = $(this);
        var searchTerm = $inp.val().toUpperCase();

        if (window._provSearchTimer) {
            clearTimeout(window._provSearchTimer);
            window._provSearchTimer = null;
        }

        if (searchTerm.length < 1) {
            $("#searchResults").empty().addClass('d-none').hide();
            return;
        }

        var delay = window._provForceSearch ? 60 : 200;
        window._provSearchTimer = setTimeout(function () {
            try { if (window._provSearchXhr && window._provSearchXhr.readyState && window._provSearchXhr.readyState !== 4) window._provSearchXhr.abort(); } catch (e) { }
            window._provSearchXhr = $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "DataBase&SearchItems&term=" + encodeURIComponent(searchTerm),
                success: function (data) {
                    window._provSearchXhr = null;
                    var results = [];
                    try { results = JSON.parse(data); } catch (e) { results = []; }
                    var html = "";
                    if (results.length > 0) {
                        results.forEach(function (item) {
                            html += '<button type="button" class="list-group-item list-group-item-action item-result" data-id="' + item.id + '" data-name="' + item.name + '"><div class="fw-bold">' + item.id + '</div><div class="text-truncate">' + item.name + '</div></button>';
                        });
                    } else {
                        html = '<div class="list-group-item text-muted">No se encontraron items</div>';
                    }
                    $("#searchResults").html(html)
                        .removeClass('d-none')
                        .css({
                            'display': 'block',
                            'position': 'absolute',
                            'z-index': 3000,
                            'background': '#ffffff',
                            'width': '100%',
                            'max-height': '240px',
                            'overflow-y': 'auto',
                            'box-shadow': '0 6px 18px rgba(0,0,0,0.08)',
                            'border': '1px solid #e9ecef',
                            'border-radius': '6px',
                            'padding': '0'
                        }).show();
                },
                error: function (xhr, status) {
                    if (status !== 'abort') {
                        window._provSearchXhr = null;
                    }
                }
            });
        }, delay);
    });

    // rebuild suggestions on focus if term still present
    $(document).on('focus', '#itemSearch', function () {
        var v = ($(this).val() || '').toUpperCase();
        if (v.length >= 3) $(this).trigger('input');
    });

    // Select item from results
    $(document).on('click', '.item-result', function () {
        var itemId = $(this).data('id');
        var itemName = $(this).data('name');
        $("#itemId").val(itemId);
        $("#itemName").val(itemName);
        $("#searchResults").empty().addClass('d-none').hide();
        $("#itemSearch").val(itemId);
    });

    // Keyboard navigation for provider item search (arrows + enter)
    $(document).on('keydown', '#itemSearch', function (e) {
        var $results = $('#searchResults');
        if (!$results.length || $results.is(':hidden')) return;

        var KEY = e.which || e.keyCode;
        // up/down
        if (KEY === 40 || KEY === 38) {
            e.preventDefault();
            var $current = $results.find('.item-result.active');
            if ($current.length === 0) {
                $current = (KEY === 40) ? $results.find('.item-result').first() : $results.find('.item-result').last();
                $current.addClass('active').siblings().removeClass('active');
                return;
            }
            var $next = (KEY === 40) ? $current.nextAll('.item-result').first() : $current.prevAll('.item-result').first();
            if ($next.length) {
                $current.removeClass('active');
                $next.addClass('active');
                // ensure visible
                var top = $next.position().top;
                $results.scrollTop($results.scrollTop() + top - 10);
            }
            return;
        }

        // enter -> select highlighted; if only one result, select it automatically
        if (KEY === 13) {
            var $sel = $results.find('.item-result.active').first();
            if ($sel.length === 0) {
                var $all = $results.find('.item-result');
                if ($all.length === 1) {
                    $sel = $all.first();
                }
            }
            if ($sel && $sel.length) {
                e.preventDefault();
                $sel.trigger('click');
            }
        }
    });

    // Dynamic costs UI
    $(document).on('click', '#addCostRow', function () {
        var idx = $('#additionalCosts .cost-row').length;
        var row = '<div class="input-group input-group-sm mb-2 cost-row">'
            + '<input type="text" class="form-control shadow-none cost-add-name" placeholder="Nombre del costo">'
            + '<input type="text" inputmode="decimal" class="form-control shadow-none cost-add-value" placeholder="0.00" oninput="numberInput(this, true);">'
            + '<button class="btn btn-outline-danger remove-cost-row" type="button"><i class="bi bi-x"></i></button>'
            + '</div>';
        $('#additionalCosts').append(row);
        updateFormTotal();
    });
    $(document).on('click', '.remove-cost-row', function () {
        $(this).closest('.cost-row').remove();
        updateFormTotal();
    });

    // Update form total display
    function parseNumber(val) {
        if (val === null || val === undefined) return 0;
        val = String(val).replace(/[^0-9\-,.]/g, '').replace(',', '.');
        var f = parseFloat(val);
        return isNaN(f) ? 0 : f;
    }

    function formatCurrency(n) {
        var v = parseFloat(n);
        if (isNaN(v)) v = 0;
        return v.toFixed(4);
    }

    function updateFormTotal() {
        var initial = parseNumber($('#costInitial').val());
        var sum = initial;
        $('#additionalCosts .cost-row').each(function () {
            var v = $(this).find('.cost-add-value').val();
            sum += parseNumber(v);
        });
        $('#formCostTotal').text(formatCurrency(sum));
    }

    // Update total on input changes
    $(document).on('input', '#costInitial', function () { updateFormTotal(); });
    $(document).on('input', '#additionalCosts .cost-add-value', function () { updateFormTotal(); });
    $(document).on('input', '#additionalCosts .cost-add-name', function () { /* names don't affect total */ });

    // Submit add/edit provider code
    $(document).on('submit', '#addProviderCode', function (e) {
        e.preventDefault();
        var formEl = $(this);
        var providerId = formEl.data('provider-id');
        var codeId = $('#codeId').val() || null;
        var itemId = $("#itemId").val();
        var providerCode = $("#providerCode").val();
        var notes = $("#notes").val();
        var initial = $("#costInitial").val();
        var additionals = [];
        $("#additionalCosts .cost-row").each(function () {
            var name = $(this).find('.cost-add-name').val();
            var value = $(this).find('.cost-add-value').val();
            if ((name !== '' || value !== '')) {
                additionals.push({ name: name || null, value: value || null });
            }
        });
        if (!itemId || !providerCode) {
            new messageTemp('Pines Jm', 'Debe completar el ID del item y el código del proveedor', 'info');
            return;
        }
        var cost = JSON.stringify({ initial: initial || null, additionals: additionals });

        var url = (codeId) ? 'api/code-edit.php' : 'api/code-new.php';
        var dataPayload = (codeId)
            ? ('ProviderCode&Edit&id=' + encodeURIComponent(codeId)
                + '&providerCode=' + encodeURIComponent(providerCode)
                + '&cost=' + encodeURIComponent(cost)
                + '&notes=' + encodeURIComponent(notes || ''))
            : ('ProviderCode&itemId=' + encodeURIComponent(itemId)
                + '&providerId=' + encodeURIComponent(providerId)
                + '&providerCode=' + encodeURIComponent(providerCode)
                + '&cost=' + encodeURIComponent(cost)
                + '&notes=' + encodeURIComponent(notes || ''));

        $.ajax({
            type: 'POST',
            url: url,
            data: dataPayload,
            success: function (data) {
                var res = [];
                try { res = JSON.parse(data); } catch (e) { }
                if (res[0]) {
                    new messageTemp('Pines Jm', (codeId ? 'Código actualizado' : 'Código agregado'), 'success');
                    resetForm();
                    loadProviderCodes(providerId);
                } else {
                    new messageTemp('Pines Jm', res[1] || 'Error desconocido', 'error');
                }
            }
        });
    });



    function loadProviderCodes(providerId) {
        $.ajax({
            type: 'POST',
            url: 'api/code-obtain.php',
            data: 'Provider&ProviderCodes&providerId=' + encodeURIComponent(providerId),
            success: function (data) {
                var codes = [];
                try { codes = JSON.parse(data); } catch (e) { }
                var html = '';
                if (codes.length > 0) {
                    codes.forEach(function (code) {
                        // store raw cost JSON and item name in data attributes for edit
                        var encodedCost = encodeURIComponent(code.cost || '');
                        var itemName = code.item_name || '';
                        // compute cost total and prepare details
                        var costTotal = 0;
                        var costDetails = '';
                        try {
                            var parsedCost = (code.cost) ? JSON.parse(code.cost) : null;
                            if (parsedCost) {
                                if (parsedCost.initial != null && parsedCost.initial !== '') {
                                    var ini = parseNumber(parsedCost.initial);
                                    costTotal += ini;
                                    costDetails += '<div><strong>Inicial:</strong> ' + formatCurrency(ini) + '</div>';
                                }
                                if (Array.isArray(parsedCost.additionals) && parsedCost.additionals.length) {
                                    parsedCost.additionals.forEach(function (v, i) {
                                        var val = 0;
                                        if (v && typeof v === 'object') {
                                            val = parseNumber(v.value);
                                            costDetails += '<div>' + (v.name ? $('<div/>').text(v.name).html() : ('Adicional ' + (i + 1))) + ': ' + formatCurrency(val) + '</div>';
                                        } else {
                                            val = parseNumber(v);
                                            costDetails += '<div>Adicional ' + (i + 1) + ': ' + formatCurrency(val) + '</div>';
                                        }
                                        costTotal += val;
                                    });
                                }
                            }
                        } catch (e) {
                            // ignore parse errors
                        }

                        var totalLabel = formatCurrency(costTotal);
                        html += '<tr>'
                            + '<td data-item-name="' + $('<div/>').text(itemName).html() + '" class="align-middle">' + code.item_id + '</td>'
                            + '<td class="align-middle">' + $('<div/>').text(code.provider_code).html() + '</td>'
                            + '<td class="align-middle text-nowrap" data-cost-json="' + encodedCost + '">' + totalLabel + '</td>'
                            + '<td class="text-center align-middle">'
                            + '<button type="button" class="btn btn-sm btn-outline-info me-1 show-costs" data-cost="' + encodedCost + '" data-notes="' + $('<div/>').text(code.notes || '').html() + '"><i class="bi bi-eye"></i></button>'
                            + '<button class="btn btn-sm btn-outline-secondary me-1 edit-provider-code" data-id="' + code.id + '"><i class="bi bi-pencil"></i></button>'
                            + '<button class="btn btn-sm btn-outline-danger delete-provider-code" data-id="' + code.id + '"><i class="bi bi-trash"></i></button>'
                            + '</td>'
                            + '</tr>';
                    });
                } else {
                    html = '<tr><td colspan="5" class="text-center text-muted">No hay códigos de proveedor registrados</td></tr>';
                }
                $('#providerCodesTable tbody').html(html);
            }
        });
    }

    // Hook to load codes when modal opens
    $(document).on('shown.bs.modal', '.modal', function () {
        var badge = $('#providerIdBadge');
        var providerId = badge.data('provider-id') || $('#addProviderCode').data('provider-id');
        if (providerId) loadProviderCodes(providerId);
    });

    // Show detailed costs in Swal when clicking the total button
    $(document).on('click', '.show-costs', function () {
        var encoded = $(this).attr('data-cost') || '';
        var costJson = '';
        try { costJson = decodeURIComponent(encoded); } catch (e) { costJson = encoded; }
        var details = '';
        var total = 0;
        // include notes if provided
        var notes = $(this).attr('data-notes') || '';
        try {
            var parsed = costJson ? JSON.parse(costJson) : null;
            if (notes && notes.length) {
                details += '<div><strong>Notas:</strong> ' + $('<div/>').text(notes).html() + '</div><hr>';
            }
            if (parsed) {
                if (parsed.initial != null && parsed.initial !== '') {
                    var ini = parseNumber(parsed.initial);
                    total += ini;
                    details += '<div><strong>Inicial:</strong> ' + formatCurrency(ini) + '</div>';
                }
                if (Array.isArray(parsed.additionals) && parsed.additionals.length) {
                    parsed.additionals.forEach(function (a, i) {
                        var v = parseNumber(a.value || a);
                        total += v;
                        var name = a.name || ('Adicional ' + (i + 1));
                        details += '<div>' + $('<div/>').text(name).html() + ': ' + formatCurrency(v) + '</div>';
                    });
                }
            }
        } catch (e) {
            details = '<div class="text-danger">Error al parsear costos</div>';
        }
        details += '<hr><div><strong>Total:</strong> ' + formatCurrency(total) + '</div>';
        Swal.fire({
            title: 'Mas Detalles',
            html: details,
            width: 500,
            confirmButtonText: 'Cerrar'
        });
    });

    // Delete provider code
    $(document).on('click', '.delete-provider-code', function () {
        var id = $(this).data('id');
        var badge = $('#providerIdBadge');
        var providerId = badge.data('provider-id') || $('#addProviderCode').data('provider-id');
        Swal.fire({
            title: '¿Eliminar código?',
            text: 'Esta acción no se puede deshacer',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: 'POST',
                    url: 'api/code-delete.php',
                    data: 'ProviderCode&codeId=' + id,
                    success: function (data) {
                        var res = [];
                        try { res = JSON.parse(data); } catch (e) { }
                        if (res[0]) {
                            Swal.fire({ title: 'Eliminado', text: 'Código de proveedor eliminado', icon: 'success' });
                            if (providerId) loadProviderCodes(providerId);
                        } else {
                            Swal.fire({ title: 'Error', text: (res[1] || 'No se pudo eliminar'), icon: 'error' });
                        }
                    }
                });
            }
        });
    });

    // Edit provider code (load into form)
    $(document).on('click', '.edit-provider-code', function () {
        var id = $(this).data('id');
        var tr = $(this).closest('tr');
        var itemId = tr.find('td').eq(0).text().trim();
        var providerCode = tr.find('td').eq(1).text().trim();
        var costAttr = tr.find('td').eq(2).attr('data-cost-json') || '';
        var costJson = '';
        try { costJson = decodeURIComponent(costAttr); } catch (e) { costJson = costAttr; }
        var notes = tr.find('td').eq(3).text().trim();

        // Set form to edit mode
        $('#formModeTitle').text('Editar Código');
        $('#submitProviderCode').html('<i class="bi bi-save me-1"></i> Actualizar');
        $('#cancelEditCode').removeClass('d-none');
        $('#codeId').val(id);

        // Fill form with existing data
        $('#itemId').val(itemId);
        $('#itemName').val(tr.find('td').eq(0).attr('data-item-name') || '');
        $('#providerCode').val(providerCode);
        $('#notes').val(notes === 'N/A' ? '' : notes);

        // Parse and fill costs
        $('#costInitial').val('');
        $('#additionalCosts').empty();

        try {
            var costData = JSON.parse(costJson);
            if (costData) {
                if (costData.initial) $('#costInitial').val(costData.initial);
                if (Array.isArray(costData.additionals)) {
                    costData.additionals.forEach(function (cost) {
                        var row = '<div class="input-group input-group-sm mb-2 cost-row">'
                            + '<input type="text" class="form-control shadow-none cost-add-name" placeholder="Nombre del costo" value="' + (cost.name || '') + '">'
                            + '<input type="text" inputmode="decimal" class="form-control shadow-none cost-add-value" placeholder="0.00" value="' + (cost.value || '') + '">'
                            + '<button class="btn btn-outline-danger remove-cost-row" type="button"><i class="bi bi-x"></i></button>'
                            + '</div>';
                        $('#additionalCosts').append(row);
                    });
                }
            }
        } catch (e) {
            console.error('Error parsing cost JSON', e);
        }

        // Scroll to form
        $('.modal-body').animate({
            scrollTop: 0
        }, 300);
    });

    // Cancel edit mode
    $(document).on('click', '#cancelEditCode', function () {
        resetForm();
    });

    function resetForm() {
        $('#formModeTitle').text('Agregar Nuevo Código');
        $('#submitProviderCode').html('<i class="bi bi-save me-1"></i> Guardar');
        $('#cancelEditCode').addClass('d-none');
        $('#codeId').val('');
        $('#itemId').val('');
        $('#itemName').val('');
        $('#itemSearch').val('');
        $('#providerCode').val('');
        $('#notes').val('');
        $('#costInitial').val('');
        $('#additionalCosts').empty();
        updateFormTotal(); // Reset total when cancelling
        $('.modal-body').animate({
            scrollTop: 0
        }, 300);
    }

});
