var row = 1;
var Session = new $_SESSION("listPurchasesProvider");
var oldList;

class Core {
    updateRowAndFooter() {
        let total = 0;
        let cost = 0;

        let emptyCart = false;

        if (Object.keys(Session.val.items).length == 0) {
            $('.buyBtn').prop('disabled', true);
            $('.buyBtn i').attr('class', "bi bi-send-slash h4");
        } else {
            $.each(Session.val.items, (index, item) => {
                const rowId = `#${index}`;
                const totalPLabel = $(document).find(`${rowId} #totalP`);
                const totalQLabel = $(document).find(`${rowId} #totalQ`);
                const priceLabel = $(document).find(`${rowId} #priceLabel`);
                const providerCosts = item.price || { initial: null, additionals: [] };
                let priceTotal = parseFloat(providerCosts.initial || 0);

                if (providerCosts.additionals && Array.isArray(providerCosts.additionals)) {
                    providerCosts.additionals.forEach(function (add) {
                        priceTotal += parseFloat(add.value || 0);
                    });
                }

                totalPLabel.text(Number(priceTotal) * Number(item.quantity));
                totalQLabel.text(Number(item.quantity));
                priceLabel.text('$' + Number(priceTotal));

                total += Number(item.quantity);
                cost += priceTotal * Number(item.quantity);

                if (priceTotal == 0 || Number(item.quantity) == 0) emptyCart = true;
            });


            if (emptyCart) {
                $('.buyBtn').prop('disabled', true);
                $('.buyBtn i').attr('class', "bi bi-send-slash h4");
            } else {
                $('.buyBtn').prop('disabled', false);
                $('.buyBtn i').attr('class', "bi bi-send h4");
            }
        }

        $(document).find('#lblBuyTotal').text(`Total: ${total}`);
        $(document).find('#lblBuyCost').text(`Costo: $${cost.toFixed(6)}`);
    }
    newRow() {
        const rowClass = row % 2 === 0 ? 'row-even' : 'row-odd';
        $('.CartList tbody').append(`
        <tr id="${row}" class="item-row ${rowClass}">
            <th class="col-stv-1" scope="col">
                <button type="button" class="btn btn-dark btn-sm" id="deleteRow" hidden><i class="bi bi-trash"></i></button>  
                ${row}
            </th>
            <td class="col-stv-2" scope="col">
                <h1 hidden></h1>
                <div class="input-group flex-nowrap">
                    <input class="form-control" type="text" placeholder="Codigo" id="inputItem" autocomplete="off" oninput="this.value = this.value.toUpperCase();">
                    <span class="input-group-text" id="providerCode" hidden></span>
                </div>
            </td>
            <td class="col-stv-2" scope="col" id="inventory">
                <span class="badge bg-secondary fs-6 px-3 py-2" id="inventoryLabel" hidden>0</span>
            </td>
            <td class="col-stv-2" scope="col" id="onTheWay">
                <span class="badge bg-warning text-dark" id="onTheWayLabel" hidden>0</span>
            </td>
            <td class="col-stv-2" scope="col" id="quantity">
                <input class="form-control" type="text" id="quantityInput" autocomplete="off" pattern="[0-9+\\-]+" onkeypress="return /[0-9+\\-]/.test(event.key)" hidden>
            </td>
            <td class="col-stv-2" scope="col" id="price">
                <div class="d-flex align-items-center gap-2">
                    <button type="button" class="btn btn-success btn-sm shadow-none" id="priceBtn" hidden>
                        <i class="bi bi-cash-stack"></i>
                    </button>
                    <span class="badge bg-success fs-6 px-3 py-2" id="priceLabel" hidden style="min-width: 80px;">$0.0000</span>
                </div>
            </td>
            <td class="col-stv-2" scope="col" id="totalP">
            </td>
            <td class="col-stv-2" scope="col" id="totalQ">
            </td>
            <td class="col-stv-2" scope="col" id="actions">
                <button type="button" class="btn btn-outline-secondary btn-sm toggleRowBtn" hidden>
                    <i class="bi bi-chevron-down"></i>
                </button>
            </td>
        </tr>
        <tr id="charts-${row}" class="charts-row ${rowClass}" style="display: none;">
            <td colspan="9" class="charts-cell">
                <div class="charts-container d-flex flex-wrap gap-4 justify-content-center">
                    <div class="chart-box" style="flex: 1; min-width: 30vw; max-width: 33vw; background: white; border-radius: 12px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="m-0" style="color: #495057;"><i class="bi bi-graph-up me-2"></i>Ventas</h6>
                            <select class="form-select form-select-sm monthsSelector salesMonths" data-row="${row}" data-chart="sales" style="width: auto; min-width: 90px;">
                                <option value="3" selected>3 meses</option>
                                <option value="6">6 meses</option>
                            </select>
                        </div>
                        <div style="position: relative; height: 180px; width: 100%;">
                            <canvas id="salesChart-${row}"></canvas>
                        </div>
                    </div>
                    <div class="chart-box" style="flex: 1; min-width: 30vw; max-width: 33vw; background: white; border-radius: 12px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="m-0" style="color: #495057;"><i class="bi bi-people me-2"></i>Top 5 Clientes</h6>
                            <select class="form-select form-select-sm monthsSelector customersMonths" data-row="${row}" data-chart="customers" style="width: auto; min-width: 90px;">
                                <option value="3" selected>3 meses</option>
                                <option value="6">6 meses</option>
                            </select>
                        </div>
                        <div style="position: relative; height: 180px; width: 100%;">
                            <canvas id="customersChart-${row}"></canvas>
                        </div>
                    </div>
                    <div class="chart-box" style="flex: 1; min-width: 30vw; max-width: 33vw; background: white; border-radius: 12px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="m-0" style="color: #495057;"><i class="bi bi-calendar3 me-2"></i>Compras Mes/Cliente</h6>
                            <select class="form-select form-select-sm monthsSelector monthlyMonths" data-row="${row}" data-chart="monthly" style="width: auto; min-width: 90px;">
                                <option value="3" selected>3 meses</option>
                                <option value="6">6 meses</option>
                            </select>
                        </div>
                        <div style="position: relative; height: 180px; width: 100%;">
                            <canvas id="customerMonthlyChart-${row}"></canvas>
                        </div>
                    </div>
                </div>
                <div class="charts-loading text-center py-4" style="display: none;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2 text-muted">Cargando estadísticas...</p>
                </div>
            </td>
        </tr>
        `);
        row++;
    }
}

function getImage(code) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Storage&Items&Item&id=" + code,
            cache: false,
            success: function (data) {
                const obj = JSON.parse(data);
                if (obj[1] == "NAN") {
                    reject();
                    return;
                }

                const pictures = JSON.parse(obj[1]['photos']);

                if (pictures && pictures.length > 0) {
                    const firstPic = pictures[0];
                    const uuid = obj[1]["uuid"];

                    $.ajax({
                        url: `${urlAPI}item/img/${uuid}/${firstPic['name']}`,
                        type: 'GET',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`
                        },
                        xhrFields: {
                            responseType: 'blob'
                        },
                        success: function (blob) {
                            const imgUrl = URL.createObjectURL(blob);
                            resolve(imgUrl);
                        },
                        error: function (xhr, status, error) {
                            reject("Error al cargar la imagen: " + error);
                        }
                    });
                } else {
                    resolve("");
                }
            },
            error: function (xhr, status, error) {
                reject("Error en la solicitud inicial: " + error);
            }
        });
    });
}

$(document).ready(function () {
    const CoreFunc = new Core();

    $(document).on("keyup", "#qinputProvider", function () {
        var value = $(this).val().toLowerCase();
        $(document).find("table tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $(document).on("change", 'input[type=radio][name="providerlist"]', function () {
        $("#setProvider").removeClass("disabled");
    });

    $(document).on('click', "#clearList", function () {
        oldList = null;
        row = 1;
        new $_SESSION("listPurchasesProvider").Del();
        $('.CartList tbody').html('');
        new modalPinesJM().create("Purchases&Create&Mode=ShowProviders", 2);
        CoreFunc.updateRowAndFooter();
    });

    $(document).on("click", "#setProvider", function () {
        Session.val = { "provider": ["", ""], "items": {} };
        Session.val.provider[0] = $(document).find('input[name="providerlist"]:checked').val();
        Session.val.provider[1] = $(document).find('input[name="providerlist"]:checked').attr("data-name");
        Session.Save();
        const providerNameLabel = $(document).find('#lblProviderName');
        providerNameLabel.text(`Proveedor: ${Session.val.provider[1]}`);

        CoreFunc.newRow()
        CoreFunc.updateRowAndFooter();
    });


    //Mode
    if (!new $_SESSION("listPurchasesProvider").Exists()) {
        new modalPinesJM().create("Purchases&Create&Mode=ShowProviders", 2);
    } else {
        //new Core().loadsRows()
        //new Core().updateRowAndFooter()
    }

    new modalPinesJM().create("Purchases&Create&Mode=ShowProviders", 2);

    $(document).on('input', '#inputItem', function () {
        const $input = $(this);
        window._lastPurchaseInput = $input;
        const term = ($input.val() || '').toUpperCase();

        if (window._purchaseSearchTimer) {
            clearTimeout(window._purchaseSearchTimer);
            window._purchaseSearchTimer = null;
        }
        $('.item-search-results-provider').remove();

        if (!Session.val || !Session.val.provider || !Session.val.provider[0]) {
            return;
        }

        if (!term || term.length < 2) {
            return;
        }

        const delay = window._purchaseForceSearch ? 60 : 200;
        window._purchaseSearchTimer = setTimeout(function () {
            try {
                if (window._purchaseSearchXhr && window._purchaseSearchXhr.readyState && window._purchaseSearchXhr.readyState !== 4) {
                    window._purchaseSearchXhr.abort();
                }
            } catch (e) { }

            window._purchaseSearchXhr = $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "Provider&SearchItemsProvider&term=" + encodeURIComponent(term) + "&providerId=" + encodeURIComponent(Session.val.provider[0]),
                success: function (data) {
                    window._purchaseSearchXhr = null;
                    $('.item-search-results-provider').remove();
                    let results = [];
                    try { results = JSON.parse(data); } catch (e) { results = []; }

                    const $results = $('<div class="list-group position-absolute item-search-results-provider shadow-lg" style="z-index:3000;background:#fff;border:1px solid #e9ecef;border-radius:6px;max-height:240px;overflow-y:auto;padding:0"></div>');

                    if (results.length > 0) {
                        results.forEach(function (item) {
                            const providerCodeDisplay = item.provider_code ? ' <span class="badge bg-secondary">' + item.provider_code + '</span>' : '';
                            const $btn = $('<button type="button" class="list-group-item list-group-item-action item-result-purchase" data-id="' + item.id + '" data-provider-code="' + (item.provider_code || '') + '" data-name="' + item.name + '"><div class="fw-bold">' + item.id + providerCodeDisplay + '</div><div class="text-truncate small">' + item.name + '</div></button>');
                            $results.append($btn);
                        });
                    } else {
                        $results.append('<div class="list-group-item text-muted small">No se encontraron items para este proveedor</div>');
                    }

                    $('body').append($results);
                    const off = $input.offset();
                    $results.css({ top: off.top + $input.outerHeight(), left: off.left, width: $input.outerWidth() });
                },
                error: function (xhr, status, err) {
                    if (status !== 'abort') {
                        console.error('Search provider items error', err);
                    }
                    window._purchaseSearchXhr = null;
                }
            });
        }, delay);
    });

    $(document).on('click', '.item-result-purchase', function (e) {
        e.preventDefault();
        const code = $(this).data('id');
        const name = $(this).data('name');
        const providerCode = $(this).data('provider-code');
        $('.item-search-results-provider').remove();

        const $input = $(window._lastPurchaseInput || document.activeElement);
        if ($input && $input.length) {
            $input.data('selectedItem', { id: code, name: name, provider_code: providerCode });
            $input.val(code);
            $input.trigger('change');
        }
    });

    $(document).on('keydown', '#inputItem', function (e) {
        const $results = $('.item-search-results-provider');
        if ($results.length === 0) return;

        const KEY = e.which || e.keyCode;
        if (KEY === 40 || KEY === 38) { // down / up
            e.preventDefault();
            let $current = $results.find('.item-result-purchase.active');
            if ($current.length === 0) {
                $current = (KEY === 40) ? $results.find('.item-result-purchase').first() : $results.find('.item-result-purchase').last();
                $current.addClass('active').siblings().removeClass('active');
                return;
            }

            const $next = (KEY === 40)
                ? $current.nextAll('.item-result-purchase').first()
                : $current.prevAll('.item-result-purchase').first();
            if ($next.length) {
                $current.removeClass('active');
                $next.addClass('active');
                const top = $next.position().top;
                $results.scrollTop($results.scrollTop() + top - 20);
            }
            return;
        }

        if (KEY === 13) { // enter
            const $all = $results.find('.item-result-purchase');
            let $sel = $results.find('.item-result-purchase.active').first();
            if ($all.length === 1) {
                $sel = $all.first();
            }
            if ($sel && $sel.length) {
                e.preventDefault();
                $sel.trigger('click');
            }
        }
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.item-search-results-provider, #inputItem').length) {
            $('.item-search-results-provider').remove();
        }
    });

    $(document).on('change', '#inputItem', async function (e) {
        const inp = $(this);

        if (inp.data('processing')) return;
        inp.data('processing', true);

        let selected = inp.data('selectedItem');

        if (!selected || !selected.id) {
            const $results = $('.item-search-results');
            if ($results.length) {
                const $items = $results.find('.item-result-point');
                if ($items.length === 1) {
                    const $it = $items.first();
                    inp.data('selectedItem', { id: $it.data('id'), name: $it.data('name'), provider_code: $it.data('provider-code') });
                    inp.val($it.data('id'));

                    selected = inp.data('selectedItem');
                }
            }
        }

        $('.item-search-results').remove();
        try { if (window._pointSearchXhr && window._pointSearchXhr.readyState && window._pointSearchXhr.readyState !== 4) window._pointSearchXhr.abort(); } catch (e) { }

        const cont = inp.parent().parent().parent();
        if (inp.val() != '') {


            if (!selected || !selected.id) {
                inp.data('processing', false);
                if ((inp.val() || '').length >= 3) {
                    inp.trigger('input');
                }
                return;
            }

            let imgUrl = '';
            try { imgUrl = await getImage(selected.id); } catch (err) { imgUrl = './resc/img/No-Image-Placeholder.png'; }

            try { if (Swal.isVisible()) { Swal.close(); } } catch (e) { }
            const swalToken = Date.now().toString() + Math.random().toString(36).slice(2);
            inp.data('swalToken', swalToken);
            const swalRes = await Swal.fire({
                html: `
                        <div class="d-flex flex-column align-items-center p-2">
                            <div class="mb-2" style="width: 100%; text-align: center;">
                                <img id="swal-item-img" src="${imgUrl}" style="max-width:220px;max-height:220px;border-radius:10px;box-shadow:0 2px 12px #0001;">
                            </div>
                            <div class="mb-2 w-100 text-center">
                                <span class="fw-bold fs-5" style="color:var(--secondary_text_color)">${selected.id}</span>
                                ${selected.name ? `<span class="ms-2 fs-6" style="color:var(--secondary_text_color)">${selected.name}</span>` : ''}
                            </div>
                            <div class="mb-2 w-100 text-center">
                                <span class="text-muted small">Presione <kbd>ENTER</kbd> para aceptar o <kbd>BORRAR</kbd> para quitar.</span>
                            </div>
                        </div>
                    `,
                showCancelButton: true,
                confirmButtonText: '<span style="font-size:1.1rem;padding:0.5rem 1.5rem;">Aceptar</span>',
                cancelButtonText: '<span style="font-size:1.1rem;padding:0.5rem 1.5rem;">Cancelar</span>',
                customClass: {
                    popup: 'rounded-4',
                    confirmButton: 'btn btn-dark btn-lg rounded-pill px-4',
                    cancelButton: 'btn btn-outline-secondary btn-lg rounded-pill px-4'
                },
                background: '#f8f9fa',
                allowOutsideClick: false,
                didOpen: () => {
                    $(document).on('keydown.pointSwal', function (ev) {
                        if (ev.which === 13) { // Enter
                            ev.preventDefault();
                            Swal.clickConfirm();
                        } else if (ev.which === 8 || ev.which === 46) { // Backspace or Delete
                            ev.preventDefault();
                            inp.val('');
                            inp.data('selectedItem', null);
                            inp.focus();
                            Swal.close();
                        }
                    });
                },
                willClose: () => { $(document).off('keydown.pointSwal'); }
            });

            if (inp.data('swalToken') !== swalToken) {
                inp.data('processing', false);
                return;
            }

            if (!swalRes || !swalRes.isConfirmed) {
                inp.data('selectedItem', null);
                inp.val('');
                inp.data('processing', false);
                return;
            }


            const itemId = selected.id;

            $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "Provider&VerifyProviderCode&providerId=" + Session.val.provider[0] + "&providerCode=" + itemId,
                cache: false,
                success: function (data) {
                    const response = JSON.parse(data);

                    if (response[0] == true) {
                        inp.attr('disabled', true);

                        console.log(response[0] == true, cont);

                        cont.find('#price #priceLabel').text('$0');
                        cont.find('#deleteRow').attr('hidden', false);
                        cont.find('#priceBtn').attr('hidden', false);
                        cont.find('#priceLabel').attr('hidden', false);
                        cont.find('.toggleRowBtn').attr('hidden', false);
                        cont.find('#quantityInput').attr('hidden', false);

                        cont.find('#quantityInput').focus();

                        cont.find('#inventoryLabel').attr('hidden', false);
                        cont.find('#inventoryLabel').text(response[1].inventory);

                        cont.find('#providerCode').attr('hidden', false);
                        cont.find('#providerCode').text(selected.provider_code);

                        Session.val.items[cont.attr('id')] = {
                            'code': cont.find('#inputItem').val(),
                            'quantity': 0,
                            'price': {
                                'initial': response[1].costs.initial || 0,
                                'additionals': response[1].costs.additionals || []
                            },
                            'price_default': {
                                'initial': response[1].costs.initial || 0,
                                'additionals': response[1].costs.additionals || []
                            }
                        }
                        Session.Save();
                        CoreFunc.newRow();
                        CoreFunc.updateRowAndFooter();

                        return;
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: response[1],
                            confirmButtonText: 'OK'
                        });
                        return;
                    }

                },
                error: function (xhr, status, error) {
                    console.error("Error obteniendo costos del proveedor:", error);
                }
            });


            setTimeout(function () { inp.data('processing', false); }, 1200);
        }
    });

    $(document).on('change', '#quantityInput', function () {
        const cont = $(this).parent().parent();
        const quantity = Number($(this).val());

        Session.val.items[cont.attr('id')].quantity = quantity;

        Session.Save();
        CoreFunc.updateRowAndFooter();

    });

    $(document).on('click', '#deleteRow', function () {
        const cont = $(this).parent().parent();

        delete Session.val.items[cont.attr('id')];
        Session.Save();
        cont.remove();
        CoreFunc.updateRowAndFooter();

    });

    $(document).on('click', '#priceBtn', function () {
        const cont = $(this).closest('tr');
        const rowId = cont.attr('id');

        const itemData = Session.val.items[rowId];
        if (!itemData || !itemData.price) {
            Swal.fire({
                title: 'Sin costos',
                text: 'No hay información de costos disponible para este item.',
                icon: 'info',
                confirmButtonText: 'Cerrar'
            });
            return;
        }

        const costs = itemData.price;
        const defaultCosts = itemData.price_default || costs;

        function calculateTotal() {
            let total = parseFloat($('#swalCostInitial').val()) || 0;
            $('#swalAdditionalCosts .swal-cost-row').each(function () {
                total += parseFloat($(this).find('.swal-cost-value').val()) || 0;
            });
            $('#swalCostTotal').text(total.toFixed(4));
        }

        function additionalRowHtml(name, value) {
            return `
                <div class="input-group input-group-sm mb-2 swal-cost-row">
                    <input type="text" class="form-control shadow-none swal-cost-name" placeholder="Nombre del costo" value="${name || ''}">
                    <input type="text" inputmode="decimal" class="form-control shadow-none swal-cost-value" placeholder="0.00" value="${value || ''}">
                    <button class="btn btn-outline-danger swal-remove-cost" type="button"><i class="bi bi-x"></i></button>
                </div>
            `;
        }

        let additionalsHtml = '';
        if (costs.additionals && Array.isArray(costs.additionals)) {
            costs.additionals.forEach(function (add) {
                additionalsHtml += additionalRowHtml(add.name || '', add.value || '');
            });
        }

        const formHtml = `
            <div style="text-align: left;">
                <div class="mb-3">
                    <label class="form-label fw-bold">Costo Inicial</label>
                    <input type="text" inputmode="decimal" class="form-control shadow-none" id="swalCostInitial" value="${costs.initial || ''}" placeholder="0.00">
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Costos Adicionales</label>
                    <div id="swalAdditionalCosts">
                        ${additionalsHtml}
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary" id="swalAddCostRow">
                        <i class="bi bi-plus"></i> Agregar Costo
                    </button>
                </div>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold">Total:</span>
                    <span class="fw-bold fs-5" id="swalCostTotal">0.0000</span>
                </div>
            </div>
        `;

        Swal.fire({
            title: 'Costos del Proveedor',
            html: formHtml,
            width: 500,
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: '<i class="bi bi-save"></i> Guardar',
            denyButtonText: '<i class="bi bi-arrow-counterclockwise"></i> Reset',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'btn btn-success me-2',
                denyButton: 'btn btn-warning me-2',
                cancelButton: 'btn btn-secondary'
            },
            buttonsStyling: false,
            didOpen: () => {
                calculateTotal();

                $(document).on('click.swalCosts', '#swalAddCostRow', function () {
                    $('#swalAdditionalCosts').append(additionalRowHtml('', ''));
                });

                $(document).on('click.swalCosts', '.swal-remove-cost', function () {
                    $(this).closest('.swal-cost-row').remove();
                    calculateTotal();
                });

                $(document).on('input.swalCosts', '#swalCostInitial, .swal-cost-value', function () {
                    calculateTotal();
                });
            },
            willClose: () => {
                $(document).off('click.swalCosts');
                $(document).off('input.swalCosts');
            },
            preConfirm: () => {
                const initial = $('#swalCostInitial').val();
                const additionals = [];
                $('#swalAdditionalCosts .swal-cost-row').each(function () {
                    const name = $(this).find('.swal-cost-name').val();
                    const value = $(this).find('.swal-cost-value').val();
                    if (name || value) {
                        additionals.push({ name: name || null, value: value || null });
                    }
                });
                return { initial, additionals };
            },
            preDeny: () => {
                $('#swalCostInitial').val(defaultCosts.initial || '');
                $('#swalAdditionalCosts').empty();
                if (defaultCosts.additionals && Array.isArray(defaultCosts.additionals)) {
                    defaultCosts.additionals.forEach(function (add) {
                        $('#swalAdditionalCosts').append(additionalRowHtml(add.name || '', add.value || ''));
                    });
                }
                calculateTotal();
                return false;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                Session.val.items[rowId].price = {
                    initial: result.value.initial,
                    additionals: result.value.additionals
                };
                Session.Save();
                CoreFunc.updateRowAndFooter();
                new messageTemp('Pines Jm', 'Costos actualizados', 'success');
            }
        });
    });

    // Toggle row expansion - solo una fila expandida a la vez
    // Almacenar instancias de charts
    window._purchaseCharts = window._purchaseCharts || {};

    $(document).on('click', '.toggleRowBtn', function () {
        const $btn = $(this);
        const $row = $btn.closest('tr');
        const $icon = $btn.find('i');
        const rowId = $row.attr('id');
        const isExpanded = $row.hasClass('row-expanded');

        // Colapsar todas las filas expandidas y destruir sus charts
        $('.CartList tbody tr.row-expanded').each(function () {
            const $otherRow = $(this);
            const $otherIcon = $otherRow.find('.toggleRowBtn i');
            const otherRowId = $otherRow.attr('id');
            const $otherChartsRow = $(`#charts-${otherRowId}`);

            $otherRow.removeClass('row-expanded');
            $otherIcon.removeClass('bi-chevron-up').addClass('bi-chevron-down');

            // Animación suave de colapso con overflow
            $otherChartsRow.removeClass('expanding').addClass('collapsing');
            setTimeout(() => {
                $otherChartsRow.hide().removeClass('collapsing');
            }, 400);

            // Destruir charts de la fila colapsada
            if (window._purchaseCharts[otherRowId]) {
                if (window._purchaseCharts[otherRowId].sales) {
                    window._purchaseCharts[otherRowId].sales.destroy();
                }
                if (window._purchaseCharts[otherRowId].customers) {
                    window._purchaseCharts[otherRowId].customers.destroy();
                }
                if (window._purchaseCharts[otherRowId].customerMonthly) {
                    window._purchaseCharts[otherRowId].customerMonthly.destroy();
                }
                delete window._purchaseCharts[otherRowId];
            }
        });

        // Si no estaba expandida, expandirla y cargar charts
        if (!isExpanded) {
            $row.addClass('row-expanded');
            $icon.removeClass('bi-chevron-down').addClass('bi-chevron-up');

            const $chartsRow = $(`#charts-${rowId}`);
            const $loading = $chartsRow.find('.charts-loading');
            const $container = $chartsRow.find('.charts-container');

            // Mostrar la fila de charts con animación suave de overflow
            $chartsRow.removeClass('collapsing').addClass('expanding').show();
            $loading.show();
            $container.hide();

            // Obtener el código del item
            const itemData = Session.val.items[rowId];
            const itemCode = itemData ? itemData.code : '';

            if (!itemCode) {
                $loading.html('<p class="text-warning">No hay código de item</p>');
                return;
            }

            // Obtener los meses seleccionados
            const selectedMonths = $chartsRow.find('.monthsSelector').val() || 3;

            // Llamar al endpoint Stat9
            $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "Statistics&Stat9&itemId=" + encodeURIComponent(itemCode) + "&months=" + selectedMonths,
                cache: false,
                success: function (data) {
                    try {
                        const response = JSON.parse(data);

                        $loading.hide();
                        $container.show();

                        // Inicializar objeto de charts para esta fila
                        window._purchaseCharts[rowId] = {};

                        // Chart de ventas (Line chart)
                        const salesCtx = document.getElementById(`salesChart-${rowId}`);
                        if (salesCtx) {
                            const salesGradient = salesCtx.getContext('2d').createLinearGradient(0, 0, 0, 180);
                            salesGradient.addColorStop(0, 'rgba(54, 162, 235, 0.5)');
                            salesGradient.addColorStop(1, 'rgba(54, 162, 235, 0.0)');

                            window._purchaseCharts[rowId].sales = new Chart(salesCtx, {
                                type: 'line',
                                data: {
                                    labels: response.sales.labels,
                                    datasets: [{
                                        label: 'Unidades Vendidas',
                                        data: response.sales.data,
                                        borderColor: 'rgb(54, 162, 235)',
                                        backgroundColor: salesGradient,
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointRadius: 6,
                                        pointBackgroundColor: 'rgb(54, 162, 235)',
                                        pointBorderColor: '#fff',
                                        pointBorderWidth: 2
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: 'rgba(0,0,0,0.05)' }
                                        },
                                        x: {
                                            grid: { display: false }
                                        }
                                    }
                                }
                            });
                        }

                        // Chart de clientes (Bar chart horizontal)
                        const customersCtx = document.getElementById(`customersChart-${rowId}`);
                        if (customersCtx) {
                            const colors = [
                                'rgba(255, 99, 132, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 206, 86, 0.8)',
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(153, 102, 255, 0.8)'
                            ];

                            window._purchaseCharts[rowId].customers = new Chart(customersCtx, {
                                type: 'bar',
                                data: {
                                    labels: response.customers.labels,
                                    datasets: [{
                                        label: 'Cantidad Comprada',
                                        data: response.customers.data,
                                        backgroundColor: colors.slice(0, response.customers.labels.length),
                                        borderRadius: 6,
                                        borderSkipped: false
                                    }]
                                },
                                options: {
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            grid: { color: 'rgba(0,0,0,0.05)' }
                                        },
                                        y: {
                                            grid: { display: false }
                                        }
                                    }
                                }
                            });
                        }

                        // Chart de compras mensuales por cliente (Line chart múltiple)
                        const customerMonthlyCtx = document.getElementById(`customerMonthlyChart-${rowId}`);
                        if (customerMonthlyCtx && response.customers.monthlyData && response.customers.monthlyData.length > 0) {
                            const lineColors = [
                                'rgb(255, 99, 132)',
                                'rgb(54, 162, 235)',
                                'rgb(255, 206, 86)',
                                'rgb(75, 192, 192)',
                                'rgb(153, 102, 255)'
                            ];

                            const datasets = response.customers.labels.map((label, idx) => ({
                                label: label,
                                data: response.customers.monthlyData[idx],
                                borderColor: lineColors[idx % lineColors.length],
                                backgroundColor: lineColors[idx % lineColors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
                                borderWidth: 2,
                                tension: 0.3,
                                pointRadius: 4,
                                fill: false
                            }));

                            window._purchaseCharts[rowId].customerMonthly = new Chart(customerMonthlyCtx, {
                                type: 'line',
                                data: {
                                    labels: response.customers.monthlyLabels,
                                    datasets: datasets
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'bottom',
                                            labels: {
                                                boxWidth: 12,
                                                font: { size: 10 }
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: { color: 'rgba(0,0,0,0.05)' }
                                        },
                                        x: {
                                            grid: { display: false }
                                        }
                                    }
                                }
                            });
                        }

                    } catch (e) {
                        console.error('Error parsing stats:', e);
                        $loading.html('<p class="text-danger">Error al cargar estadísticas</p>');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error fetching stats:', error);
                    $loading.html('<p class="text-danger">Error al cargar estadísticas</p>');
                }
            });
        }
    });

    // Handler para completar compra de proveedor
    $(document).on('click', '#completBuy', function () {
        if (!Session.val || !Session.val.provider || Object.keys(Session.val.items).length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin items',
                text: 'No hay items para guardar.',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Abrir modal de confirmación usando modalPinesJM
        new modalPinesJM().create(
            "Purchases&Create&Mode=ConfirmOrder&providerId=" + Session.val.provider[0] + "&providerName=" + encodeURIComponent(Session.val.provider[1]),
            2
        );
    });

    // Handler para confirmar el pedido desde el modal
    $(document).on('click', '#confirmProviderOrder', function () {
        // Mostrar loader
        Swal.fire({
            html: new sweet_loader().loader("Procesando"),
            showDenyButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false
        });

        // Preparar summary array
        const summaryArr = [];
        $.each(Session.val.items, (index, item) => {
            summaryArr.push({
                code: item.code,
                inship: false,
                shipped_amount: 0
            });
        });

        // Preparar datos para enviar (content solo tiene items)
        const dataToSend = {
            providerId: Session.val.provider[0],
            content: JSON.stringify(Session.val.items),
            summary: JSON.stringify(summaryArr)
        };

        $.ajax({
            type: "POST",
            url: "api/code-new.php",
            data: "ProviderPurchase&" + $.param(dataToSend),
            cache: false,
            success: function (response) {
                const result = JSON.parse(response);

                if (result[0]) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Pedido Guardado!',
                        text: 'La compra ha sido registrada exitosamente.',
                        confirmButtonText: 'OK',
                        customClass: {
                            confirmButton: 'btn btn-success'
                        },
                        buttonsStyling: false
                    }).then(() => {
                        // Cerrar modal y limpiar
                        new modalPinesJM().close();
                        oldList = null;
                        row = 1;
                        new $_SESSION("listPurchasesProvider").Del();
                        $('.CartList tbody').html('');
                        new modalPinesJM().create("Purchases&Create&Mode=ShowProviders", 2);
                        CoreFunc.updateRowAndFooter();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: result[1] || 'Error al guardar el pedido',
                        confirmButtonText: 'OK'
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error de conexión: ' + error,
                    confirmButtonText: 'OK'
                });
            }
        });
    });

    // Evento para cambiar los meses de cualquier chart
    $(document).on('change', '.monthsSelector', function () {
        const $select = $(this);
        const rowId = $select.data('row');
        const months = $select.val();
        const chartType = $select.data('chart');

        const itemData = Session.val.items[rowId];
        const itemCode = itemData ? itemData.code : '';

        if (!itemCode) return;

        // Recargar el chart correspondiente
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Statistics&Stat9&itemId=" + encodeURIComponent(itemCode) + "&months=" + months,
            cache: false,
            success: function (data) {
                try {
                    const response = JSON.parse(data);

                    const colors = [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ];
                    const lineColors = [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 206, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(153, 102, 255)'
                    ];

                    if (chartType === 'sales') {
                        // Destruir y recrear chart de ventas
                        if (window._purchaseCharts[rowId] && window._purchaseCharts[rowId].sales) {
                            window._purchaseCharts[rowId].sales.destroy();
                        }
                        const salesCtx = document.getElementById(`salesChart-${rowId}`);
                        if (salesCtx) {
                            const salesGradient = salesCtx.getContext('2d').createLinearGradient(0, 0, 0, 180);
                            salesGradient.addColorStop(0, 'rgba(54, 162, 235, 0.5)');
                            salesGradient.addColorStop(1, 'rgba(54, 162, 235, 0.0)');

                            window._purchaseCharts[rowId].sales = new Chart(salesCtx, {
                                type: 'line',
                                data: {
                                    labels: response.sales.labels,
                                    datasets: [{
                                        label: 'Unidades Vendidas',
                                        data: response.sales.data,
                                        borderColor: 'rgb(54, 162, 235)',
                                        backgroundColor: salesGradient,
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointRadius: 6,
                                        pointBackgroundColor: 'rgb(54, 162, 235)',
                                        pointBorderColor: '#fff',
                                        pointBorderWidth: 2
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                                        x: { grid: { display: false } }
                                    }
                                }
                            });
                        }
                    } else if (chartType === 'customers') {
                        // Destruir y recrear chart de clientes
                        if (window._purchaseCharts[rowId] && window._purchaseCharts[rowId].customers) {
                            window._purchaseCharts[rowId].customers.destroy();
                        }
                        const customersCtx = document.getElementById(`customersChart-${rowId}`);
                        if (customersCtx) {
                            window._purchaseCharts[rowId].customers = new Chart(customersCtx, {
                                type: 'bar',
                                data: {
                                    labels: response.customers.labels,
                                    datasets: [{
                                        label: 'Cantidad Comprada',
                                        data: response.customers.data,
                                        backgroundColor: colors.slice(0, response.customers.labels.length),
                                        borderRadius: 6,
                                        borderSkipped: false
                                    }]
                                },
                                options: {
                                    indexAxis: 'y',
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                                        y: { grid: { display: false } }
                                    }
                                }
                            });
                        }
                    } else if (chartType === 'monthly') {
                        // Destruir y recrear chart mensual por cliente
                        if (window._purchaseCharts[rowId] && window._purchaseCharts[rowId].customerMonthly) {
                            window._purchaseCharts[rowId].customerMonthly.destroy();
                        }
                        const monthlyCtx = document.getElementById(`customerMonthlyChart-${rowId}`);
                        if (monthlyCtx && response.customers.monthlyData && response.customers.monthlyData.length > 0) {
                            const datasets = response.customers.labels.map((label, idx) => ({
                                label: label,
                                data: response.customers.monthlyData[idx],
                                borderColor: lineColors[idx % lineColors.length],
                                backgroundColor: lineColors[idx % lineColors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
                                borderWidth: 2,
                                tension: 0.3,
                                pointRadius: 4,
                                fill: false
                            }));

                            window._purchaseCharts[rowId].customerMonthly = new Chart(monthlyCtx, {
                                type: 'line',
                                data: {
                                    labels: response.customers.monthlyLabels,
                                    datasets: datasets
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'bottom',
                                            labels: { boxWidth: 12, font: { size: 10 } }
                                        }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                                        x: { grid: { display: false } }
                                    }
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.error('Error updating chart:', e);
                }
            }
        });
    });

});
