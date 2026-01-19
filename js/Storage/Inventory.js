var item;
var mode = null;
var providerBuyID = null;
var providerBuyNr = null;
var providerBuyOrdered = 0;
var providerBuyShipped = 0;
var lastScanBuyID = null;
var scannerBuffer = "";
var scannerTimeout = null;
var scannedPackets = {}; // Track what was scanned/removed in current session
var listEdit = {

}


let provider = {
    name: undefined,
    contact: undefined,
    cost: undefined,
    code: undefined,
    summary: []
};
// Initialize the UI with provider data
function initializeUI() {
    $("#additionalCostsTable tbody").empty();
    renderProviderData();

    // Add cost rows for each item in provider.summary
    if (provider.summary && provider.summary.length > 0) {
        provider.summary.forEach(cost => renderCostRow(cost.name, cost.cost));
    }
    updateTotalCost();
}

// Render main provider data to UI
function renderProviderData() {
    $("input[name='provName']").val(provider.name || "");
    $("input[name='provContact']").val(provider.contact || "");
    $("input[name='provCode']").val(provider.code || "");

    // Format the provider cost correctly for display
    const formattedCost = provider.cost ? provider.cost.toString() : "0";
    $("input[name='providerCost']").val(formattedCost);
}

// Render a single cost row
function renderCostRow(name = "", cost = 0) {
    const rowCount = $("#additionalCostsTable tbody tr").length + 1;
    const formattedCost = cost.toString();

    const newRow = `
        <tr>
            <td class="col-1">${rowCount}</td>
            <td class="col-5">
                <input type="text" class="form-control shadow-none" value="${name}" 
                       data-name="costName"  placeholder="Nombre del costo">
            </td>
            <td class="col-3">
                <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input id="costValues" type="text" class="form-control cost-input" value="${formattedCost}" 
                           data-name="costValue" data-precision="6" placeholder="0.000000">
                </div>
            </td>
            <td class="col-3">
                <button type="button" class="btn btn-danger remove-cost-row">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
        `;
    $("#additionalCostsTable tbody").append(newRow);
}

// Sync provider object from UI inputs
function syncProviderFromUI() {
    provider.name = $("input[name='provName']").val() || "Proveedor Desconocido";
    provider.contact = $("input[name='provContact']").val() || "Contacto Desconocido";
    provider.code = $("input[name='provCode']").val() || "Código Desconocido";

    // Parse provider cost correctly from the input
    const providerCostInput = $("input[name='providerCost']");
    provider.cost = parseFloat(providerCostInput.val().replace(/,/g, '')) || 0;

    // Update the summary costs
    provider.summary = [];
    $("#additionalCostsTable tbody tr").each(function () {
        const name = $(this).find("[data-name='costName']").val() || "Sin nombre";
        const valueInput = $(this).find("[data-name='costValue']");
        const value = parseFloat(valueInput.val().replace(/,/g, '')) || 0;

        if (value > 0 || name !== "Sin nombre") {
            provider.summary.push({ name, cost: value });
        }
    });
}

// Update total cost and UI summary
function updateTotalCost() {
    let total = parseFloat(provider.cost) || 0;

    // Format provider cost display in summary
    $("#providerCostSummary").text("$" + (provider.cost ? provider.cost.toFixed(6) : "0.000000"));

    // Clear and rebuild the additional costs summary
    $("#additionalCostsSummary").empty();

    const hasAdditionalCosts = provider.summary && provider.summary.length > 0;

    if (hasAdditionalCosts) {
        provider.summary.forEach(item => {
            total += parseFloat(item.cost) || 0;
            $("#additionalCostsSummary").append(`
                    <li class="list-group-item d-flex justify-content-between align-items-center bg-light">
                        ${item.name}
                        <span class="badge bg-primary rounded-pill">$${item.cost.toFixed(6)}</span>
                    </li>
                `);
        });
    } else {
        $("#additionalCostsSummary").append(`
                <li class="list-group-item text-center bg-light" id="noCostsMessage">
                    No hay costos adicionales
                </li>
            `);
    }

    // Update total cost display
    $("input[name='totalCost']").val(total.toFixed(6));
    $("#totalCostSummary").text("$" + total.toFixed(6));
}
function updateTable() {
    const temp = $("input[name=\'viewItem\']:checked").val();
    const scrollOld = $('.InventoryList tbody').scrollTop();
    $.ajax({
        type: "POST",
        url: "api/code-obtain.php",
        data: "Storage&Items&List",
        cache: false,
        success: function (data) {
            $(document).find(".InventoryList tbody").html(data);
            $(document).find("#qinput").trigger('keyup');
            $("input[name=\'viewItem\'][value=" + temp + "]").prop("checked", "checked");
            $('.InventoryList tbody').scrollTop(scrollOld);
        }
    });
}

function updatePhotosId() {
    var a = [];
    $("ul.pictures li").each(function (index) {
        $(this).find(".card-title").text("Foto " + (index + 1));
        a[index] = $(this).attr('id').split('_').pop();
    });
    return a;
}

function updateItem() {
    if (!$(document).find('input[name="viewItem"]:checked').val()) {
        return;
    }
    function LoadDeposit(Quantity) {
        let contentList = "Deposito Vacio";
        const id = $("input[name='viewItem']:checked").val();

        // Check for open purchase orders to toggle Query button
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: {
                Provider: true,
                ProviderPurchaseOrders: true,
                item_id: id
            },
            dataType: "json",
            success: function (data) {
                const buyBtn = $(document).find("[data-mode='buy']");
                if (data && data.length > 0) {
                    buyBtn.prop("hidden", false);
                } else {
                    buyBtn.prop("hidden", true);
                }
            }
        });
        const depoSelect = $("input[name=\'depositnr\']:checked").val();
        let totalItem = 0;
        $.each(Quantity, function (depo, list) {
            totalItem += list.Pcs;
            $.each(list.Packets, function (pack, nr) {
                totalItem += pack * nr;
            });
        });

        let depoTotalItem = 0;
        if (Quantity.hasOwnProperty(depoSelect)) {
            depoTotalItem = Quantity[depoSelect].Pcs;
            let sortedPackets = Object.keys(Quantity[depoSelect].Packets).reverse();
            const createCard = (type, icon, title, content, summary, actions, extraData = "") => {
                const cardID = Array.isArray(type) ? type[1] : type;
                return `
                    <div id="${cardID}" class="d-flex align-items-stretch gap-3 w-100 pb-1 itemCard" style="min-height: 80px;">
                        <div class="card shadow-sm rounded-5 flex-grow-1" id="item" style="background: var(--secondary_color); border: 1px solid #e7e7e7ff;">
                            <div class="card-body d-flex align-items-center gap-3 pe-3 ps-3">
                                <div class="rounded-5 d-flex align-items-center justify-content-center shadow-sm" 
                                     style="width: 50px; height: 50px; background: var(--primary_color); color: var(--primary_text_color);">
                                    <i class="bi ${icon} h4 m-0"></i>
                                </div>
                                <div>
                                    <h6 class="m-0 fw-bold" style="color: var(--secondary_text_color);">${title}</h6>
                                    ${content}
                                </div>
                            </div>
                        </div>
                        <div class="card shadow-sm rounded-5" id="summary" style="background: var(--secondary_color); border: 1px solid #e7e7e7ff;" ${mode == null ? "hidden" : ""}>
                            <div class="card-body d-flex align-items-center justify-content-center px-4" style="min-width: 120px;">
                                ${summary}
                            </div>
                        </div>
                        <div class="card shadow-sm rounded-5" id="actions" style="background: var(--secondary_color); border: 1px solid #e7e7e7ff;" ${mode == null ? "hidden" : ""}>
                            <div class="card-body d-flex align-items-center justify-content-center pe-2 ps-3" id="${id}" data-type="${Array.isArray(type) ? type[0] : type}" data-depo="${depoSelect}" ${extraData}>
                                <div class="d-flex align-items-center gap-2">
                                    ${actions}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            };

            contentList = '';
            $.each(sortedPackets, function (index, pack) {
                listEdit[pack] = listEdit[pack] || 0;

                let nr = Quantity[depoSelect].Packets[pack];
                depoTotalItem += pack * nr;
                contentList += createCard(
                    ['packet', pack],
                    'bi-box-seam',
                    `Paquete ${pack}`,
                    `<div class="d-flex gap-2">
                        <span class="fs-6 fw-bold text-muted">Cantidad: ${nr}</span>
                        <span class="text-muted">|</span>
                        <span class="fs-6 fw-bold text-muted">Total: ${pack * nr}</span>
                    </div>`,
                    `<span class="fs-5 fw-bolder text-muted summary-text">${listEdit[pack] == 0 ? "-" : (listEdit[pack] > 0 ? "+" + listEdit[pack] : listEdit[pack])}</span>`,
                    `<div class="col-auto p-0">
                        <div class="input-group input-group-sm" id="Stepper" style="width: 100px;">
                            <button class="btn border-0" style="background-color: var(--primary_color); color: var(--primary_text_color);" type="button" data-action="subtract"><i class="bi bi-dash-lg"></i></button>
                            <input type="text" class="form-control text-center border-0 fw-bold" style="background-color: #f8f9fa;" value="${nr + listEdit[pack]}" id="StepperValue" oninput="this.value = this.value.replace(/[^0-9]/g, '');">
                            <button class="btn border-0" style="background-color: var(--primary_color); color: var(--primary_text_color);" type="button" data-action="add"><i class="bi bi-plus-lg"></i></button>
                        </div>
                    </div>
                    <div class="col-auto p-0" style="width: 45px;" >
                        <button type="button" class="btn btn-outline-danger shadow-none border-0" item-data="${pack}" id="deletePacket" ${nr == 0 ? "" : "hidden"}><i class="bi bi-x-lg"></i></button>
                    </div>`,
                    `data-pack="${pack}" data-initial-qty="${nr}"`
                );
            });

            listEdit["pcs"] = listEdit["pcs"] || 0;
            listEdit["samples"] = listEdit["samples"] || 0;


            contentList += createCard(
                'pcs',
                'bi-puzzle',
                'Piezas Sueltas',
                `<span class="fs-6 fw-bold text-muted">Total: ${Quantity[depoSelect].Pcs}</span>`,
                `<span class="fs-5 fw-bolder text-muted summary-text">${listEdit["pcs"] == 0 ? "-" : (listEdit["pcs"] > 0 ? "+" + listEdit["pcs"] : listEdit["pcs"])}</span>`,
                `<div class="col-auto p-0">
                    <div class="input-group input-group-sm" id="Stepper" style="width: 100px;">
                        <button class="btn border-0" style="background-color: var(--primary_color); color: var(--primary_text_color);" type="button" data-action="subtract"><i class="bi bi-dash-lg"></i></button>
                        <input type="text" class="form-control text-center border-0 fw-bold" style="background-color: #f8f9fa;" value="${Quantity[depoSelect].Pcs + listEdit["pcs"]}" id="StepperValue" oninput="this.value = this.value.replace(/[^0-9]/g, '');">
                        <button class="btn border-0" style="background-color: var(--primary_color); color: var(--primary_text_color);" type="button" data-action="add"><i class="bi bi-plus-lg"></i></button>
                    </div>
                </div>
                <div class="col-auto p-0" style="width: 45px;">
                </div>`,
                `data-initial-qty="${Quantity[depoSelect].Pcs}"`
            );

            contentList += createCard(
                'samples',
                'bi-eye',
                'Muestras',
                `<span class="fs-6 fw-bold text-muted">Total: ${Quantity[depoSelect].Samples ?? 0}</span>`,
                `<span class="fs-5 fw-bolder text-muted summary-text">${listEdit["samples"] == 0 ? "-" : (listEdit["samples"] > 0 ? "+" + listEdit["samples"] : listEdit["samples"])}</span>`,
                `<div class="col-auto p-0">
                    <div class="input-group input-group-sm" id="Stepper" style="width: 100px;">
                        <button class="btn border-0" style="background-color: var(--primary_color); color: var(--primary_text_color);" type="button" data-action="subtract"><i class="bi bi-dash-lg"></i></button>
                        <input type="text" class="form-control text-center border-0 fw-bold" style="background-color: #f8f9fa;" value="${(Quantity[depoSelect].Samples ?? 0) + listEdit["samples"]}" id="StepperValue" oninput="this.value = this.value.replace(/[^0-9]/g, '');">
                        <button class="btn border-0" style="background-color: var(--primary_color); color: var(--primary_text_color);" type="button" data-action="add"><i class="bi bi-plus-lg"></i></button>
                    </div>
                </div>
                <div class="col-auto p-0" style="width: 45px;">
                </div>`
            );

        }

        $("#titleDeposits h5").text("Cantidad Total: " + totalItem);
        $("#titleDeposits h6").text("Cantidad Deposito (" + depoSelect + "): " + depoTotalItem);

        let balance = 0;
        $.each(listEdit, function (k, v) {
            let mult = (k === 'pcs' || k === 'samples') ? 1 : parseInt(k);
            balance += v * mult;
        });

        let color = balance == 0 ? "text-success" : (balance < 0 ? "text-primary" : "text-danger");
        let text = balance == 0 ? "Balanceado" : (balance < 0 ? "Disponible: " + Math.abs(balance) : "Exceso: " + balance);

        if (mode === 'edit') {
            $("#balanceDisplay").prop("hidden", false);

            let hasChanges = false;
            $.each(listEdit, function (k, v) {
                if (v !== 0) hasChanges = true;
            });

            $("#balanceDisplay").text(text);
            $("#balanceDisplay").removeClass("text-success text-primary text-danger");
            $("#balanceDisplay").addClass(color);

            if (balance === 0 && hasChanges) {
                $("#saveStorageBtn").prop("disabled", false);
            } else {
                $("#saveStorageBtn").prop("disabled", true);
            }
        } else {
            $("#balanceDisplay").prop("hidden", true);
        }

        $(document).find(".ItemList").html(contentList);
    }

    function LoadPrices(prices) {
        $.each(prices, function (i, v) {
            if ($("#prices input[name='price" + (i + 1) + "']").length) {
                $("#prices input[name='price" + (i + 1) + "']").val(v);
            }
        });
    }

    function LoadDepartaments(depas) {
        let content = '<option selected hidden>Cambia Aqui</option>';
        $.each(depas, function (i, v) {
            content += `<option value="${v[0]}">${v[1]}</option>`;
        });
        $("select[name='depa']").html(content);
    }

    function LoadSuggestions(suggest) {
        let content = '';
        suggest.forEach((item, index) => {
            content += `
                <tr>
                    <td class="col-2 col-md-1">${index + 1}</td>
                    <td class="col-1">${item}</td>
                    <td class="col-4 col-md-2">
                        <button type="button" class="btn btn-outline-dark shadow-none delete-suggest-btn" data-id="${index}">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
        $(document).find("#nav-recomendation table tbody").html(content);
    }

    function LoadPictures(pic, uuid) {
        let content = '';
        $.each(pic, function (i, v) {
            // Fetch the image with AJAX
            $.ajax({
                url: `${urlAPI}item/img/${uuid}/${v['name']}`,
                type: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                xhrFields: {
                    responseType: 'blob' // Set the response type to blob
                },
                success: function (blob) {
                    // Create a Blob URL
                    const imgUrl = URL.createObjectURL(blob);

                    // Add the image to the content
                    content += `
                    <li id="pic_${i}" class="col-3">
                        <div class="card h-100">
                            <img src="${imgUrl}" alt="Image">
                            <div class="card-body p-2">
                                <h5 class="card-title m-0">Foto</h5>
                            </div>
                            <div class="card-footer">
                                <p class="card-text mb-1">Tamaño: ${format_bytes(v['size'])} <br>Tipo: ${v['type']}</p>
                                <button type="button" class="btn btn-dark shadow-none" id="deletePicture">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                        </div>
                    </li>
                    `;

                    // Update the pictures list once all images are fetched
                    if (i === pic.length - 1) {
                        $("ul.pictures").html(content);
                        initializeSortable(uuid);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Failed to load image:", error);
                    // Handle error, maybe show a placeholder image or an error message
                }
            });
        });
        if (content == '') {
            $(document).find('ul.pictures').html('');
        }
    }

    function LoadProvider(providerData, reference) {
        provider = {
            name: undefined,
            contact: undefined,
            cost: undefined,
            code: undefined,
            summary: []
        };

        provider = JSON.parse(JSON.stringify(providerData || {}));

        provider.name = provider.name || "";
        provider.contact = provider.contact || "";
        provider.code = reference || "";
        provider.cost = provider.cost || 0;
        provider.summary = provider.summary || [];

        initializeUI();
    }

    function initializeSortable(uuid) {
        $("#sortable").sortable({
            update: function () {
                $(document).find('#uploadStatus').prop("hidden", false);
                $(document).find('#readyStatus').prop("hidden", true);
                var listnew = updatePhotosId();
                $.ajax({
                    url: 'api/code-edit.php',
                    type: 'POST',
                    data: "Item&UpdateSort&uuid=" + uuid + "&sorted=" + JSON.stringify(listnew),
                    cache: false,
                    success: function (response) {
                        var result = JSON.parse(response);
                        if (result.success) {
                            $(document).find('#uploadStatus').prop("hidden", true);
                            $(document).find('#readyStatus').prop("hidden", false);
                        } else {
                            Swal.fire({
                                title: "Operaccion Errada",
                                html: result.error,
                                icon: "error"
                            });
                        }
                        updateItem();
                    },
                    error: function (xhr, status, error) {
                        Swal.fire({
                            title: "Operaccion Errada",
                            html: error,
                            icon: "error"
                        });
                        updateItem();
                    }
                });
            }
        });
        updatePhotosId();
    }

    $.ajax({
        type: "POST",
        url: "api/code-obtain.php",
        data: "Storage&Items&Item&id=" + $("input[name=\'viewItem\']:checked").val(),
        cache: false,
        success: function (data) {
            const obj = JSON.parse(data);
            if (obj[1] == "NAN") {
                Swal.fire({
                    icon: "error",
                    title: "Ups El Producto No Existe",
                    showConfirmButton: false,
                    timer: 1100
                });
                clearInterval(item);
                $("input[name=\'viewItem\']").removeAttr('checked')
                $("#titleDeposits h5").text("");
                $("#titleDeposits h6").text("");
                $(document).find(".ItemList").html("");
                $("#ItemCont").hide();
                $("#PreviewCont").show();
                $("#PreviewCont").addClass("d-flex");
                updateTable();
                return;
            }
            if ($("#nav-home-tab").attr("aria-selected") == "true") {
                const description = JSON.parse(obj[1]['info']);
                const advanced = JSON.parse(obj[1]['advanced']);
                const blackList = $(".excludes button").attr("modal-data-locate").split("=");

                LoadPrices(JSON.parse(obj[1]['prices']));
                LoadDepartaments(obj[2]);
                $("input[name='itemhide']").prop("checked", advanced['hide']);
                $("select[name='depa'] option[value='" + description['departament'] + "']").attr('selected', 'selected');
                $("input[name='code']").val($("input[name=\'viewItem\']:checked").val());
                $("input[name='desc']").val(description['desc']);
                $("input[name='brand']").val(description['brand']);

                $("input[name='model']").val(description['model']);
                $(".excludes button").attr("modal-data-locate", blackList[0] + "=" + $("input[name=\'viewItem\']:checked").val())
                $("form#saveInfo").attr("post-data", "&uuid=" + obj[1]["uuid"])
                $(".excludes input").val(JSON.stringify(advanced['views']))

                if (advanced['views'].length == 0) {
                    $(".excludes button").text(`Lista Negra`);
                } else {
                    $(".excludes button").text(`Lista Negra (${advanced['views'].length})`);
                }
            }
            if ($("#nav-storage-tab").attr("aria-selected") == "true") {
                LoadDeposit(JSON.parse(obj[1]['quantity']));
            }
            if ($("#nav-image-tab").attr("aria-selected") == "true") {
                const pictures = JSON.parse(obj[1]['photos']);
                $("form#saveChangesPic").attr("post-data", obj[1]["uuid"])
                LoadPictures(pictures, obj[1]["uuid"]);
            }
            if ($("#nav-recomendation-tab").attr("aria-selected") == "true") {
                LoadSuggestions(JSON.parse(obj[1]["suggestions"]) ?? []);
            }
            if ($("#nav-provider-tab").attr("aria-selected") == "true") {
                LoadProvider(JSON.parse(obj[1]["provider"]) ?? [], obj[1]["id_provider"] ?? "");
            }


        }
    });
}

function UploadPicture(file) {
    var form_data = new FormData();
    form_data.append('file', file);
    form_data.append('uuid', $("form#saveChangesPic").attr("post-data"))
    Swal.fire({
        html: new sweet_loader().loader("Procesando"),
        showDenyButton: false,
        showCancelButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false
    });
    $.ajax({
        url: urlAPI + 's/item/img/upload',
        type: 'POST',
        data: form_data,
        processData: false,
        contentType: false,
        headers: {
            'Authorization': `Bearer ${apiKey}`
        },
        success: function (response) {
            var result = JSON.parse(response);
            if (result.success) {
                Swal.fire({
                    title: "Operaccion Exitosa",
                    html: "El archivo " + file.name + " se ha subido correctamente. <br>Archivo: " + result.file,
                    icon: "success"
                });
            } else {
                Swal.fire({
                    title: "Operaccion Errada",
                    html: result.error,
                    icon: "error"
                });
            }
            $('#uploadPic').val("");
            updateItem();
        },
        error: function (xhr, status, error) {
            Swal.fire({
                title: "Operaccion Errada",
                html: error,
                icon: "error"
            });
            $('#uploadPic').val("");
            updateItem();
        }
    });

}

$(document).ready(function () {
    // Items

    $(document).find(".InventoryList tbody").html(new sweet_loader().loader("Cargando"));

    $(document).on('click', '.delete-suggest-btn', function () {
        var suggest = $(this).data("id");
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar!',
            cancelButtonText: 'No, cancelar!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: 'POST',
                    url: 'api/code-edit.php',
                    data: "Item&SuggestSub&suggest=" + suggest + "&itemId=" + $("input[name=\'viewItem\']:checked").val(),
                    success: function (response) {
                        const res = JSON.parse(response);
                        if (res[0]) {
                            Swal.fire({
                                title: 'Eliminado',
                                text: 'El elemento ha sido eliminado.',
                                icon: 'success'
                            });
                        }
                        updateItem();
                    },
                    error: function () {
                        Swal.fire({
                            title: 'Error',
                            text: 'Hubo un problema al agregar la sugerencia.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    });
    $(document).on('click', '.add-suggest-btn', function () {
        Swal.fire({
            title: 'Agregar Sugerencia',
            input: 'text',
            inputPlaceholder: 'Escribe tu sugerencia aquí...',
            showCancelButton: true,
            confirmButtonText: 'Agregar',
            inputAttributes: {
                style: 'text-transform: uppercase;' // This will transform the input text to uppercase
            },
            cancelButtonText: 'Cancelar',
            preConfirm: (inputValue) => {
                return new Promise((resolve) => {
                    if (!inputValue) {
                        Swal.showValidationMessage('El campo no puede estar vacío');
                        return;
                    }
                    $.ajax({
                        type: "POST",
                        url: "api/code-obtain.php",
                        data: "Storage&Items&VerifyItemSuggest&id=" + inputValue,
                        cache: false,
                        success: function (data) {
                            const i = JSON.parse(data);
                            if (!i[0]) {
                                Swal.showValidationMessage('El campo no puede estar vacío');
                                return;
                            }
                            resolve(inputValue.toUpperCase());
                        },
                        error: function (xhr, status, error) {
                            Swal.showValidationMessage('El campo no puede estar vacío');
                        }
                    });
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const suggestion = result.value;

                $.ajax({
                    type: 'POST',
                    url: 'api/code-edit.php',
                    data: "Item&SuggestAdd&suggest=" + suggestion + "&itemId=" + $("input[name=\'viewItem\']:checked").val(),
                    success: function (response) {
                        const res = JSON.parse(response);
                        if (res[0]) {
                            Swal.fire({
                                title: 'Sugerencia Agregada',
                                text: 'La sugerencia ha sido agregada exitosamente.',
                                icon: 'success'
                            });
                        }
                        updateItem();
                    },
                    error: function () {
                        Swal.fire({
                            title: 'Error',
                            text: 'Hubo un problema al agregar la sugerencia.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    });
    $(document).on("change", '#clientBlackList', function (event) {
        var clients = $("input#clientBlackList:checked").map(function () {
            return $(this).val();
        }).get();
        $("#clientTitle span").text(clients.length)
    });
    $(document).on("change", '#uploadPic', function (event) {
        var file = $(this)[0].files[0];
        // Check file size
        var file_bytes = file.size;
        var limit_bytes = 10 * 1024 * 1024;
        if (file_bytes > limit_bytes) {
            Swal.fire({
                title: "Archivo Muy Pesado",
                text: "El archivo " + file.name + " pesa más de " + format_bytes(limit_bytes),
                icon: "error"
            });
            $(this).val("");
            return;
        }
        Swal.fire({
            html: new sweet_loader().loader("Procesando"),
            showDenyButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false
        });
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            Swal.fire({
                title: "Quieres Subir Esta Imagen",
                html: "Nombre: " + file.name + "<br>Tamaño: " + format_bytes(file.size) + "<br>Tipo: " + file.type,
                imageUrl: event.target.result,
                imageHeight: 200,
                imageAlt: "Imagen del archivo",
                showCancelButton: true,
                confirmButtonText: `Si`,
                cancelButtonText: `No`
            }).then((result) => {
                if (result.isConfirmed) {
                    UploadPicture(file);
                }
            });
        });
        reader.readAsDataURL(file);
    });
    $(document).on("click", ".nav.nav-pills button", function () {
        if ($("#nav-home-tab").attr("aria-selected") == "true") {
            updateItem();
            clearInterval(item);
        }
        if ($("#nav-recomendation-tab").attr("aria-selected") == "true") {
            updateItem();
            clearInterval(item);
        }
        if ($("#nav-image-tab").attr("aria-selected") == "true") {
            updateItem();
            clearInterval(item);
        }
        if ($("#nav-storage-tab").attr("aria-selected") == "true") {
            updateItem();
            clearInterval(item);
            item = setInterval(updateItem, updateTime * 1000);
        }
        if ($("#nav-provider-tab").attr("aria-selected") == "true") {
            updateItem();
            clearInterval(item);
        }
    })
    $(document).on("click", "#saveBlackList", function () {
        var clients = $("input#clientBlackList:checked").map(function () {
            return $(this).val();
        }).get();
        $(".excludes input").val(JSON.stringify(clients));

        if (clients.length == 0) {
            $(".excludes button").text(`Lista Negra`);
            return;
        }
        $(".excludes button").text(`Lista Negra (${clients.length})`);
    });
    $(document).on("click", "#deletePicture", function () {
        const cont = $(this).parent().parent().parent()
        Swal.fire({
            title: "En Espera De Decision",
            html: "¿Quieres Eliminar Permanentemente esta Imagen?",
            imageUrl: cont.find('img').attr('src'),
            imageHeight: 200,
            imageAlt: "Imagen del archivo",
            showCancelButton: true,
            confirmButtonText: `Si`,
            cancelButtonText: `No`
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: urlAPI + 's/item/img/delete',
                    type: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    },
                    data: "uuid=" + $("form#saveChangesPic").attr("post-data") + "&img=" + cont.attr('id').split('_').pop(),
                    cache: false,
                    success: function (response) {
                        var result = JSON.parse(response);
                        if (result.success) {
                            Swal.fire({
                                title: "Operaccion Exitosa",
                                html: "Imagen Eliminada De Nuestros Sistemas",
                                icon: "success"
                            });
                        } else {
                            Swal.fire({
                                title: "Operaccion Errada",
                                html: result.error,
                                icon: "error"
                            });
                        }
                        updateItem();
                    },
                    error: function (xhr, status, error) {
                        Swal.fire({
                            title: "Operaccion Errada",
                            html: error,
                            icon: "error"
                        });
                        updateItem();
                    }
                });
            }
        });
    });
    $(document).on("submit", '#saveInfo', function (event) {
        event.preventDefault();
        var form = $(this).serialize() + $(this).attr("post-data") + "&Item&Info";
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
                    clearInterval(item);
                    $("input[name=\'viewItem\']").removeAttr('checked')
                    $("#titleDeposits h5").text("");
                    $("#titleDeposits h6").text("");
                    $(document).find(".ItemList").html("");
                    $("#ItemCont").hide();
                    $("#PreviewCont").show();
                    $("#PreviewCont").addClass("d-flex");
                    updateTable();
                    return;
                }
                updateTable();
                updateItem();
                Swal.fire({
                    title: "Operacion Exitosa",
                    text: "Item Actualizado",
                    icon: "success"
                });

            }
        });

    });
    $(document).on("keyup", "#qinput", function () {
        var value = $(this).val().toLowerCase();
        $(document).find(".InventoryList tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
    $(document).on("keyup", "#qinputClient", function () {
        var value = $(this).val().toLowerCase();
        $(document).find(".ClientList tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $(document).on('change', 'input[type=radio][name=viewItem]', function () {
        $("#ItemCont").hide();
        $("#ItemCont").fadeOut(500);
        $("#ItemCont").fadeIn(1000);
        $("#PreviewCont").hide();
        $("#PreviewCont").removeClass("d-flex");
        $("#ItemCont #nav-home-tab").click();
        $(document).find("input[type=radio][name=depositnr][value='1']").prop('checked', true).triggerHandler("change");
        updateItem();
    });
    /*
    $(document).on('change', 'input[type=radio][name=depositnr]', function () {
        updateItem();
    });
    */

    $(document).on('click', '.itemCard #Stepper button', function () {
        const action = $(this).data('action');
        const valueInput = $(this).closest('#Stepper').find('#StepperValue');
        let currentValue = parseInt(valueInput.val(), 10);
        const cont = $(this).closest('.itemCard');
        const actionsDiv = cont.find('#actions .card-body');
        const key = actionsDiv.data("pack") || actionsDiv.data("type");

        if (mode === 'buy') {
            if (action === 'subtract') {
                if (listEdit[key] > 0) { // Only allow subtracting if we added something (net positive)
                    currentValue -= 1;
                    listEdit[key] = (listEdit[key] || 0) - 1;
                }
            } else if (action === 'add') {
                currentValue += 1;
                listEdit[key] = (listEdit[key] || 0) + 1;
            }
        } else if (mode === 'discharge') {
            // Discharge mode: Only allow subtraction (negatives)
            if (action === 'subtract') {
                if (currentValue > 0) {
                    currentValue -= 1;
                    listEdit[key] = (listEdit[key] || 0) - 1;
                }
            } else if (action === 'add') {
                // Prevent going above initial value (cannot have positive delta)
                // listEdit[key] starts at 0. If it's negative, we can add back up to 0.
                if ((listEdit[key] || 0) < 0) {
                    currentValue += 1;
                    listEdit[key] = (listEdit[key] || 0) + 1;
                }
            }
        } else {
            // Edit mode (redistribution) logic
            const type = actionsDiv.data("type");

            if (action === 'subtract') {
                if (type === 'packet') {
                    // Packet Subtraction Logic
                    if ((listEdit[key] || 0) > 0) {
                        // 1. Undoing a manual redistribution addition (Always allowed)
                        currentValue -= 1;
                        listEdit[key] = (listEdit[key] || 0) - 1;
                    } else {
                        // 2. Subtracting ORIGINAL stock (Requires scan)
                        if (lastScanBuyID === null) {
                            new messageTemp('Acción bloqueada', 'Para restar paquetes del inventario original debe escanear el QR o usar el botón Manual.', 'info');
                            return;
                        }

                        if ((scannedPackets[key] || 0) > 0) {
                            // "Un-scanning" a packet (Restoring stock that was taken out)
                            currentValue += 1;
                            listEdit[key] = (listEdit[key] || 0) + 1;
                            scannedPackets[key] -= 1;
                            new messageTemp('Escaneo Deshecho', `Se restauró +1 al paquete de ${key}.`, 'info');
                        } else {
                            new messageTemp('Acción bloqueada', 'Los paquetes existentes solo pueden restarse escaneando su código QR (o usando el botón Manual).', 'warning');
                            return;
                        }
                    }
                } else {
                    // Pieces or Samples: Can be subtracted FREELY to create redistribution credit
                    if (currentValue > 0) {
                        currentValue -= 1;
                        listEdit[key] = (listEdit[key] || 0) - 1;
                    }
                }
            } else if (action === 'add') {
                // Rule: Cannot ADD (redistribute) if there is no "credit" (negative balance)
                let balance = 0;
                $.each(listEdit, function (k, v) {
                    let mult = (k === 'pcs' || k === 'samples') ? 1 : parseInt(k);
                    balance += v * mult;
                });

                const itemSize = (key === 'pcs' || key === 'samples') ? 1 : parseInt(key);
                if (balance + itemSize > 0) {
                    new messageTemp('Redistribución Bloqueada', `No hay suficiente "crédito" (Disponible: ${Math.abs(balance)} unidades) para agregar un item de tamaño ${itemSize}.`, 'warning');
                    return;
                }

                currentValue += 1;
                listEdit[key] = (listEdit[key] || 0) + 1;
            }
        }


        valueInput.val(currentValue);

        // Update Summary Text
        const summaryEl = cont.find('.summary-text');
        let val = listEdit[key];
        let summaryText = val == 0 ? "-" : (val > 0 ? "+" + val : val);
        summaryEl.text(summaryText);

        if (mode === 'buy') {
            // In buy mode, no balance logic needed, just updates.
            // Enable save if there are any positive changes
            let hasChanges = false;
            let allPositive = true;
            $.each(listEdit, function (k, v) {
                if (v !== 0) hasChanges = true;
                if (v < 0) allPositive = false;
            });

            if (hasChanges && allPositive) {
                $("#saveStorageBtn").prop("disabled", false);
            } else {
                $("#saveStorageBtn").prop("disabled", true);
            }

        } else if (mode === 'discharge') {
            // Discharge mode: Enable save if has changes and NO positives
            let hasChanges = false;
            let hasPositives = false;
            $.each(listEdit, function (k, v) {
                if (v !== 0) hasChanges = true;
                if (v > 0) hasPositives = true;
            });

            if (hasChanges && !hasPositives) {
                $("#saveStorageBtn").prop("disabled", false);
            } else {
                $("#saveStorageBtn").prop("disabled", true);
            }

        } else {
            // Edit mode balance logic
            let balance = 0;
            $.each(listEdit, function (k, v) {
                let mult = (k === 'pcs' || k === 'samples') ? 1 : parseInt(k);
                balance += v * mult;
            });

            let color = balance == 0 ? "text-success" : (balance < 0 ? "text-primary" : "text-danger");
            let text = balance == 0 ? "Balanceado" : (balance < 0 ? "Disponible: " + Math.abs(balance) : "Exceso: " + balance);

            let hasChanges = false;
            $.each(listEdit, function (k, v) {
                if (v !== 0) hasChanges = true;
            });

            $("#balanceDisplay").text(text);
            $("#balanceDisplay").removeClass("text-success text-primary text-danger");
            $("#balanceDisplay").addClass(color);

            if (balance === 0 && hasChanges) {
                $("#saveStorageBtn").prop("disabled", false);
            } else {
                $("#saveStorageBtn").prop("disabled", true);
            }
        }
    });


    $(document).on('click', '#storageBtns button', function () {
        lastScanBuyID = null; // Reset QR scanning session
        console.log("storageBtns");
        listEdit = {}; // Reset edits when entering mode
        mode = $(this).data('mode'); // edit, buy, discharge
        $(this).parent().attr("hidden", true);
        $(document).find(".itemCard input").prop("disabled", true);

        if (mode === 'buy') {
            const temp = $("input[name='viewItem']:checked").val();

            // Fetch purchase orders for this item
            $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: {
                    Provider: true,
                    ProviderPurchaseOrders: true,
                    item_id: temp
                },
                dataType: "json",
                success: function (data) {
                    let options = '<option value="" selected disabled>Seleccione una compra</option>';
                    if (data && data.length > 0) {
                        data.forEach(p => {
                            options += `<option value="${p.uuid}" data-nr="${p.id}" data-ordered="${p.ordered}" data-shipped="${p.shipped}">
                                ${p.provider_name} - Compra #${p.id} (Ordenado: ${p.ordered}, Recibido: ${p.shipped})
                            </option>`;
                        });
                    } else {
                        options = '<option value="" disabled>No hay compras pendientes para este item</option>';
                    }

                    Swal.fire({
                        title: 'Agregar a Inventario via Compra',
                        html: `
                            <div class="mb-3 text-start">
                                <label for="purchaseSelect" class="form-label">Seleccionar Orden de Compra</label>
                                <select class="form-select shadow-none" id="purchaseSelect">
                                    ${options}
                                </select>
                            </div>
                           <div class="mb-3 text-start" id="purchaseInfo" style="display:none;">
                                <div class="alert alert-info py-2 mb-2">
                                     <div class="d-flex justify-content-between">
                                        <small>Ordenado: <strong id="orderedQty">0</strong></small>
                                        <small>Recibido: <strong id="shippedQty">0</strong></small>
                                     </div>
                                </div>
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'Procesar Entrada',
                        cancelButtonText: 'Cancelar',
                        didOpen: () => {
                            const select = Swal.getPopup().querySelector('#purchaseSelect');
                            const infoDiv = Swal.getPopup().querySelector('#purchaseInfo');
                            const orderedEl = Swal.getPopup().querySelector('#orderedQty');
                            const shippedEl = Swal.getPopup().querySelector('#shippedQty');

                            select.addEventListener('change', () => {
                                const option = select.options[select.selectedIndex];
                                if (option.value) {
                                    orderedEl.textContent = option.dataset.ordered;
                                    shippedEl.textContent = option.dataset.shipped;
                                    infoDiv.style.display = 'block';
                                } else {
                                    infoDiv.style.display = 'none';
                                }
                            });
                        },
                        preConfirm: () => {
                            const select = Swal.getPopup().querySelector('#purchaseSelect');
                            const uuid = select.value;
                            if (!uuid) {
                                Swal.showValidationMessage('Debe seleccionar una compra');
                                return false;
                            }
                            // Get extra data
                            const option = select.options[select.selectedIndex];
                            const nr = option.dataset.nr;
                            const ordered = parseInt(option.dataset.ordered) || 0;
                            const shipped = parseInt(option.dataset.shipped) || 0;

                            return { uuid, nr, ordered, shipped };
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            providerBuyID = result.value.uuid;
                            providerBuyNr = result.value.nr;
                            providerBuyOrdered = result.value.ordered;
                            providerBuyShipped = result.value.shipped;

                            $(document).find(".itemCard #summary").removeAttr("hidden");
                            $(document).find(".itemCard #actions").removeAttr("hidden");
                            $(document).find("#storageOperationsBtn").removeAttr("hidden");
                            $(document).find("#saveStorageBtn").prop("disabled", true);
                            return;
                        }
                        mode = null;
                        $("#storageBtns").removeAttr("hidden");
                    });
                }
            });
            $(document).find(".itemCard #summary").attr("hidden", true);
            $(document).find(".itemCard #actions").attr("hidden", true);
            return;
        } else if (mode === 'edit') {
            $(document).find(".itemCard input").prop("disabled", false);
            $(document).find(".itemCard #summary").removeAttr("hidden");
            $(document).find(".itemCard #actions").removeAttr("hidden");
            $(document).find("#storageOperationsBtn").removeAttr("hidden");
            $(document).find("#balanceDisplay").prop("hidden", false);
            $(document).find("#saveStorageBtn").prop("disabled", true);
        } else {
            // Discharge mode
            $(document).find(".itemCard #summary").removeAttr("hidden");
            $(document).find(".itemCard #actions").removeAttr("hidden");
            $(document).find("#storageOperationsBtn").removeAttr("hidden");
            $(document).find("#balanceDisplay").prop("hidden", true);
            $(document).find("#saveStorageBtn").prop("disabled", true);
        }

        updateItem();
    });

    $(document).on('click', '#cancelStorageBtn', function () {
        $(this).parent().attr("hidden", true);
        $(document).find(".itemCard input").prop("disabled", true);
        $(document).find("#storageBtns").removeAttr("hidden");
        $(document).find(".itemCard #summary").attr("hidden", true);
        $(document).find(".itemCard #actions").attr("hidden", true);
        $(document).find("#balanceDisplay").prop("hidden", true);
        $(document).find(".summary-text").text("-");
        providerBuyID = null;
        providerBuyNr = null;
        providerBuyOrdered = 0;
        providerBuyShipped = 0;
        lastScanBuyID = null;
        scannedPackets = {};
        mode = null;
    });

    $(document).on('click', '#saveStorageBtn', async function () {
        const temp = $("input[name='viewItem']:checked").val();
        const deposit = $("input[name='depositnr']:checked").val();

        const operations = Object.entries(listEdit).filter(([key, value]) => value !== 0);

        if (operations.length === 0) return;

        // Construct HTML list of changes for confirmation
        let changesHtml = '<ul class="list-group text-start">';
        operations.forEach(([key, value]) => {
            let typeLabel = '';
            if (key === 'pcs') typeLabel = 'Piezas Sueltas';
            else if (key === 'samples') typeLabel = 'Muestras';
            else typeLabel = `Paquete de ${key}`;

            let actionColor = value > 0 ? 'text-success' : 'text-danger';
            let actionSign = value > 0 ? '+' : '';

            changesHtml += `<li class="list-group-item d-flex justify-content-between align-items-center">
                ${typeLabel}
                <span class="fw-bold ${actionColor}">${actionSign}${value}</span>
            </li>`;
        });
        changesHtml += '</ul>';

        // Buy Mode extra info
        if (providerBuyID) {
            let totalAdded = 0;
            operations.forEach(([key, value]) => {
                let mult = (key === 'pcs' || key === 'samples') ? 1 : parseInt(key);
                if (value > 0) totalAdded += value * mult;
            });

            changesHtml += `
            <div class="alert alert-info mt-3 text-start">
                <h6 class="alert-heading fw-bold"><i class="bi bi-info-circle"></i> Estado de la Orden de Compra</h6>
                <hr class="my-1">
                <div class="d-flex justify-content-between">
                    <span>Solicitado (Ordenado):</span>
                    <strong>${providerBuyOrdered}</strong>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Recibido (Antes):</span>
                    <strong>${providerBuyShipped}</strong>
                </div>
                <div class="d-flex justify-content-between text-success">
                    <span>Recibido (Ahora):</span>
                    <strong>${providerBuyShipped} + ${totalAdded} = ${providerBuyShipped + totalAdded}</strong>
                </div>
            </div>`;
        }

        const result = await Swal.fire({
            title: '¿Confirmar Cambios?',
            html: `Se realizarán los siguientes ajustes:<br><br>${changesHtml}
            ${providerBuyID ? `
                <div class="mt-3 form-check text-start">
                    <input class="form-check-input" type="checkbox" id="closePurchaseCheck">
                    <label class="form-check-label fw-bold" for="closePurchaseCheck">
                        Cerrar Compra para este item (Marcar como Recibido Completo)
                    </label>
                </div>` : ''}
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, Guardar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            preConfirm: () => {
                let isChecked = false;
                if (document.getElementById('closePurchaseCheck')) {
                    isChecked = document.getElementById('closePurchaseCheck').checked;
                }
                return { checked: isChecked };
            }
        });

        if (!result.isConfirmed) return;

        // Capture checkbox state from preConfirm result
        window.closePurchaseChecked = result.value ? result.value.checked : false;

        Swal.fire({
            html: new sweet_loader().loader("Procesando Cambios..."),
            showDenyButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false
        });

        try {
            for (const [key, value] of operations) {
                let operation_type = '';
                let packet_id = null;
                let quantity = Math.abs(value);
                let isAdd = value > 0;

                if (key === 'pcs') {
                    operation_type = isAdd ? 'add_pcs' : 'subtract_pcs';
                } else if (key === 'samples') {
                    operation_type = isAdd ? 'add_samples' : 'subtract_samples';
                } else {
                    packet_id = parseInt(key, 10);
                    operation_type = isAdd ? 'add_packs' : 'subtract_packs';
                }

                let body = {
                    deposit: deposit,
                    quantity: quantity,
                    operation_type: operation_type
                };

                if (providerBuyID) {
                    body.provider_purchase_uuid = providerBuyID;
                    body.close_purchase = window.closePurchaseChecked || false;

                    // Calculate shipped amount to add
                    let shippedToAdd = 0;
                    if (packet_id) {
                        shippedToAdd = quantity * packet_id;
                    } else {
                        // pcs or samples
                        shippedToAdd = quantity;
                    }
                    body.shipped_quantity = shippedToAdd;

                    // Update Purchase Order via dedicated backend endpoint
                    try {
                        await new Promise((resolve) => {
                            $.ajax({
                                url: "api/code-edit.php",
                                type: "POST",
                                data: {
                                    Purchases: true, // Required wrapper
                                    AddToProductShipped: true,
                                    uuid: providerBuyID,
                                    code: temp,
                                    quantity: shippedToAdd,
                                    close_purchase: window.closePurchaseChecked ? 'true' : 'false'
                                },
                                dataType: "json",
                                success: function (res) {
                                    if (!res[0]) console.warn("Purchase update warning:", res[1]);
                                    resolve(res);
                                },
                                error: function (err) {
                                    console.error("Purchase update failed:", err);
                                    resolve(null); // Proceed anyway to save inventory
                                }
                            });
                        });
                    } catch (e) {
                        console.error("Async error updating purchase:", e);
                    }
                }

                if (packet_id !== null) {
                    body.packet_id = packet_id;
                }

                await new Promise((resolve, reject) => {
                    $.ajax({
                        url: `${urlAPI}item/packets/quantity/${temp}`,
                        type: 'POST',
                        data: JSON.stringify(body),
                        contentType: 'application/json',
                        dataType: 'json',
                        headers: (typeof apiKey !== 'undefined') ? { 'Authorization': `Bearer ${apiKey}` } : {},
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            let errorMsg = errorThrown;
                            if (jqXHR.responseJSON && jqXHR.responseJSON.response) {
                                errorMsg = jqXHR.responseJSON.response;
                            } else if (jqXHR.responseText) {
                                try {
                                    const parsed = JSON.parse(jqXHR.responseText);
                                    errorMsg = parsed.response || errorMsg;
                                } catch (e) { }
                            }
                            reject(errorMsg);
                        }
                    });
                });

                // Label Printing Logic (Optional but requested for Buy mode and Packets)
                if (mode === 'buy' && packet_id !== null && isAdd) {
                    try {
                        await new Promise((resolve) => {
                            $.ajax({
                                url: `${urlAPI}label`,
                                type: "POST",
                                data: JSON.stringify({
                                    id: temp,
                                    amount: packet_id.toString(),
                                    purchase_number: providerBuyNr.toString(),
                                    copies: quantity
                                }),
                                contentType: "application/json",
                                headers: { 'Authorization': `Bearer ${apiKey}` },
                                success: function (res) {
                                    resolve(res);
                                },
                                error: function (err) {
                                    console.error("Label print failed:", err);
                                    resolve(null);
                                }
                            });
                        });
                    } catch (e) {
                        console.error("Label print error:", e);
                    }
                }
            }

            Swal.fire({
                title: "Operacion Exitosa",
                text: "Todos los cambios han sido guardados.",
                icon: "success"
            });

            // Reset UI
            $("#storageBtns").removeAttr("hidden");
            $(".itemCard #summary").attr("hidden", true);
            $(".itemCard #actions").attr("hidden", true);
            $(".itemCard input").prop("disabled", true);
            $("#storageOperationsBtn").attr("hidden", true);
            $("#balanceDisplay").prop("hidden", true);
            $(".summary-text").text("-");
            listEdit = {};
            mode = null;
            providerBuyID = null;
            providerBuyNr = null;
            providerBuyOrdered = 0;
            providerBuyShipped = 0;
            lastScanBuyID = null;
            scannedPackets = {};
            updateItem();
        } catch (error) {
            Swal.fire({
                title: "Error al guardar",
                text: "Hubo un problema: " + error,
                icon: "error"
            });
            updateItem();
        }
    });

    // QR SCANNER LOGIC FOR EDIT MODE
    $(window).on('keydown', function (e) {
        if (mode !== 'edit') {
            scannerBuffer = "";
            return;
        }

        // Avoid capturing when typing in actual inputs
        if ($(e.target).is('input, textarea')) return;

        if (e.key === 'Enter') {
            if (scannerBuffer.length > 5) {
                verifyQR(scannerBuffer);
            }
            scannerBuffer = "";
        } else if (e.key.length === 1) {
            scannerBuffer += e.key;
            clearTimeout(scannerTimeout);
            scannerTimeout = setTimeout(() => {
                scannerBuffer = "";
            }, 300); // 300ms timeout for scanner speed
        }
    });

    async function verifyQR(token) {
        const currentItemID = $("input[name='viewItem']:checked").val();
        if (!currentItemID) return;

        try {
            const response = await $.ajax({
                url: `${urlAPI}label/verify`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ token: token }),
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            if (response.data) {
                const data = response.data; // { i: "GC-100", b: 5, p: 100, n: 1 }

                console.log(data, currentItemID);
                // 1. Verify Item Match
                if (data.i !== currentItemID) {
                    new messageTemp('Error de Escaneo', `El QR es del producto ${data.i}, pero estás editando ${currentItemID}`, 'error');
                    return;
                }

                if (lastScanBuyID !== null && lastScanBuyID != data.b) {
                    new messageTemp('Error de Escaneo', `Este paquete es de la compra #${data.b}, pero ya escaneaste paquetes de la compra #${lastScanBuyID}. Deben ser del mismo lote.`, 'warning');
                    return;
                }

                const packetCard = $(`.itemCard[id="${data.p}"]`);
                if (packetCard.length === 0) {
                    new messageTemp('Error de Escaneo', `El paquete de ${data.p} no existe en el inventario actual de este producto.`, 'error');
                    return;
                }

                const initialQty = parseInt(packetCard.find('#actions .card-body').attr('data-initial-qty')) || 0;
                const currentChange = listEdit[data.p] || 0;
                if (initialQty + currentChange <= 0) {
                    new messageTemp('Error de Inventario', `No puedes restar más paquetes de ${data.p}. El inventario llegaría a 0.`, 'warning');
                    return;
                }

                if (lastScanBuyID === null) lastScanBuyID = data.b;

                scannedPackets[data.p] = (scannedPackets[data.p] || 0) + 1;
                listEdit[data.p] = (listEdit[data.p] || 0) - 1;


                packetCard.find('.summary-text').text(listEdit[data.p] == 0 ? "-" : (listEdit[data.p] > 0 ? "+" + listEdit[data.p] : listEdit[data.p]))
            } else {
                new messageTemp('QR Inválido', response.response || 'No se pudo verificar el código', 'error');
            }
        } catch (e) {
            console.error("QR Verification Error:", e);
            new messageTemp('Error de Servidor', 'No se pudo conectar con el verificador de QR', 'error');
        }
    }

    $(document).on('click', '#manualScanBtn', function () {
        if (mode !== 'edit') return;

        const currentItemID = $("input[name='viewItem']:checked").val();

        // Build select options from available packets (excluding pcs and samples)
        let packetOptions = '';
        $(`.itemCard`).each(function () {
            const cardId = $(this).attr('id');
            // Exclude pcs and samples
            if (cardId === 'pcs' || cardId === 'samples') return;

            const packSize = parseInt(cardId);
            if (isNaN(packSize)) return;

            const initialQty = parseInt($(this).find('#actions .card-body').attr('data-initial-qty')) || 0;
            const currentChange = listEdit[packSize] || 0;
            const availableStock = initialQty + currentChange;

            packetOptions += `<option value="${packSize}" data-stock="${availableStock}">Paquete de ${packSize} pz (Stock: ${availableStock})</option>`;
        });

        if (!packetOptions) {
            Swal.fire({
                title: 'Sin Paquetes',
                text: 'No hay paquetes disponibles para este producto.',
                icon: 'warning'
            });
            return;
        }

        // Show Swal with select and quantity input
        Swal.fire({
            title: 'Escaneo Manual (Sin QR)',
            html: `
                <p class="mb-3">Seleccione el paquete y la cantidad que desea retirar del inventario.</p>
                <div class="mb-3">
                    <label for="manualPacketSelect" class="form-label fw-bold">Paquete:</label>
                    <select id="manualPacketSelect" class="form-select">
                        ${packetOptions}
                    </select>
                </div>
                <div class="mb-3">
                    <label for="manualQtyInput" class="form-label fw-bold">Cantidad a retirar:</label>
                    <input type="number" id="manualQtyInput" class="form-control" value="1" min="1" step="1">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Registrar Retiro',
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                // Update max quantity based on selected packet
                const selectEl = document.getElementById('manualPacketSelect');
                const qtyInput = document.getElementById('manualQtyInput');

                const updateMaxQty = () => {
                    const selectedOption = selectEl.options[selectEl.selectedIndex];
                    const stock = parseInt(selectedOption.dataset.stock) || 0;
                    qtyInput.max = stock > 0 ? stock : 1;
                    if (parseInt(qtyInput.value) > stock) {
                        qtyInput.value = stock > 0 ? stock : 1;
                    }
                };

                selectEl.addEventListener('change', updateMaxQty);
                updateMaxQty();
            },
            preConfirm: () => {
                const select = document.getElementById('manualPacketSelect');
                const qtyInput = document.getElementById('manualQtyInput');

                const packSize = parseInt(select.value);
                const qty = parseInt(qtyInput.value);

                if (!packSize || isNaN(packSize)) {
                    Swal.showValidationMessage('Debe seleccionar un paquete');
                    return false;
                }

                if (!qty || qty < 1) {
                    Swal.showValidationMessage('Debe ingresar una cantidad válida (mínimo 1)');
                    return false;
                }

                // Check Inventory Limit
                const card = $(`.itemCard[id="${packSize}"]`);
                const initialQty = parseInt(card.find('#actions .card-body').attr('data-initial-qty')) || 0;
                const currentChange = listEdit[packSize] || 0;
                const availableStock = initialQty + currentChange;

                if (availableStock <= 0) {
                    Swal.showValidationMessage(`No hay stock disponible de paquetes de ${packSize}.`);
                    return false;
                }

                if (qty > availableStock) {
                    Swal.showValidationMessage(`Solo hay ${availableStock} paquete(s) de ${packSize} disponible(s).`);
                    return false;
                }

                return { packSize, qty };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { packSize, qty } = result.value;

                // Manual scan doesn't enforce same batch as QR, can be false
                if (lastScanBuyID === null) lastScanBuyID = false;

                // Track and Subtract for each unit
                scannedPackets[packSize] = (scannedPackets[packSize] || 0) + qty;
                listEdit[packSize] = (listEdit[packSize] || 0) - qty;

                new messageTemp('Retiro Manual Registrado', `Se restó -${qty} al paquete de ${packSize} (Ingreso Manual)`, 'success');
                updateItem();
            }
        });
    });

    $(document).on('click', '#deleteItem', function () {
        const btn = $(this);
        Swal.fire({
            title: "Quieres Eliminar El " + btn.attr('data-item'),
            showCancelButton: true,
            confirmButtonText: "Si",
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
                    url: "api/code-delete.php",
                    data: `Inventory&id=${btn.attr('data-item')}`,
                    cache: false,
                    success: function (data) {
                        var res = JSON.parse(data);
                        if (res[0] == false) {
                            Swal.fire({
                                title: "Ups! Algo Salio Mal",
                                text: res[1],
                                icon: "error"
                            });
                            clearInterval(item);
                            $(document).find(".ItemList tbody").html('');
                            $("#titleDeposits h5").text('');
                            $("#titleDeposits h6").text('');
                            updateTable();
                            return;
                        }
                        Swal.fire({
                            title: "Operacion Exitosa",
                            text: res[1],
                            icon: "success"
                        });
                        clearInterval(item);
                        $(document).find(".ItemList tbody").html('');
                        $("#titleDeposits h5").text('');
                        $("#titleDeposits h6").text('');
                        updateTable();
                    }
                });
            }
        });
    });

    $(document).on('click', '#deletePacket', function () {
        const temp = $("input[name='viewItem']:checked").val();
        const btn = $(this);
        const deposit = $("input[name='depositnr']:checked").val();
        const packet_id = btn.attr('item-data');
        Swal.fire({
            title: "Quieres Eliminar El Paquete de " + packet_id,
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    html: new sweet_loader().loader("Procesando"),
                    showDenyButton: false,
                    showCancelButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false
                });
                $.ajax({
                    url: `${urlAPI}item/packets/quantity/${temp}`,
                    type: 'POST',
                    data: JSON.stringify({
                        operation_type: 'delete_packet',
                        deposit: deposit,
                        packet_id: parseInt(packet_id, 10)
                    }),
                    contentType: 'application/json',
                    dataType: 'json',
                    headers: (typeof apiKey !== 'undefined') ? { 'Authorization': `Bearer ${apiKey}` } : {},
                    success: function (data) {
                        Swal.fire({
                            title: "Operacion Exitosa",
                            text: data.response,
                            icon: "success"
                        });
                        updateItem();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        let msg = "Ups! Algo Salio Mal";
                        let detail = "";
                        if (jqXHR.responseJSON && jqXHR.responseJSON.response) {
                            detail = jqXHR.responseJSON.response;
                        } else if (jqXHR.responseText) {
                            try {
                                const parsed = JSON.parse(jqXHR.responseText);
                                detail = parsed.response || jqXHR.statusText;
                            } catch (e) {
                                detail = jqXHR.statusText;
                            }
                        } else {
                            detail = errorThrown;
                        }
                        Swal.fire({
                            title: msg,
                            text: detail,
                            icon: "error"
                        });
                        updateItem();
                    }
                });
            }
        });
    });

    $(document).on('click', '#createPacket', function () {
        const temp = $("input[name='viewItem']:checked").val();
        const deposit = $("input[name='depositnr']:checked").val();
        const packet_id = $('#packet').val();
        Swal.fire({
            title: "¿Crear Paquete de " + packet_id + " Pz.?",
            showCancelButton: true,
            confirmButtonText: "Si",
            cancelButtonText: "No"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    html: new sweet_loader().loader("Procesando"),
                    showDenyButton: false,
                    showCancelButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false
                });
                $.ajax({
                    url: `${urlAPI}item/packets/quantity/${temp}`,
                    type: 'POST',
                    data: JSON.stringify({
                        operation_type: 'create_packet',
                        deposit: deposit,
                        packet_id: parseInt(packet_id, 10)
                    }),
                    contentType: 'application/json',
                    dataType: 'json',
                    headers: (typeof apiKey !== 'undefined') ? { 'Authorization': `Bearer ${apiKey}` } : {},
                    success: function (data) {
                        Swal.fire({
                            title: "Operacion Exitosa",
                            text: data.response,
                            icon: "success"
                        });
                        updateItem();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        let msg = "Ups! Algo Salio Mal";
                        let detail = "";
                        if (jqXHR.responseJSON && jqXHR.responseJSON.response) {
                            detail = jqXHR.responseJSON.response;
                        } else if (jqXHR.responseText) {
                            try {
                                const parsed = JSON.parse(jqXHR.responseText);
                                detail = parsed.response || jqXHR.statusText;
                            } catch (e) {
                                detail = jqXHR.statusText;
                            }
                        } else {
                            detail = errorThrown;
                        }
                        Swal.fire({
                            title: msg,
                            text: detail,
                            icon: "error"
                        });
                        updateItem();
                    }
                });
            }
        });
    });

    $(document).on('click', '#createItem', function () {
        var id = $('#itemCode').val();
        Swal.fire({
            title: "¿Crear " + id + "?",
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
                    data: `Inventory&item=${id}`,
                    cache: false,
                    success: function (data) {
                        var res = JSON.parse(data);
                        if (res[0] == false) {
                            if (res[1] == 1) {
                                Swal.fire({
                                    title: "Producto Existente",
                                    text: "Quieres Ver Este Producto " + $('#itemCode').val(),
                                    showCancelButton: true,
                                    confirmButtonText: "Si",
                                    cancelButtonText: "No"
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        $("#qinput").val(id).trigger('keyup')
                                        $("input[name=\'viewItem\'][value=" + id + "]").prop("checked", "checked").trigger('change');
                                        updateItem();
                                    }
                                });
                            } else {
                                Swal.fire({
                                    title: "Ups! Algo Salio Mal",
                                    text: res[2],
                                    icon: "error"
                                });
                                updateTable();
                            }
                            return;
                        }
                        Swal.fire({
                            title: "Operacion Exitosa",
                            text: res[2],
                            icon: "success"
                        });
                        updateTable();
                    }
                });
            }
        });
    });

    //Providers
    $(document).on('click', '#saveProviders', function () {
        console.log(provider)
        $.ajax({
            type: 'POST',
            url: 'api/code-edit.php',
            data: "Item&Provider&uuid=" + $("input[name=\'viewItem\']:checked").val() + "&provider=" + JSON.stringify(provider),
            success: function (response) {
                const res = JSON.parse(response);
                if (res[0]) {
                    Swal.fire({
                        title: 'Datos Actulizados',
                        text: 'El proveedor ha sido actualizado exitosamente.',
                        icon: 'success'
                    });
                }
                updateItem();
            },
            error: function () {
                Swal.fire({
                    title: 'Error',
                    text: 'Hubo un problema al proveedor el actualizar.',
                    icon: 'error'
                });
            }
        });
    });

    $(document).on("input", "input[name='providerCost']", function () {
        const value = $(this).val().replace(/[^\d.]/g, '');
        provider.cost = parseFloat(value) || 0;
        updateTotalCost();
    });

    $(document).on("input change", "input[name='provName']", function () {
        provider.name = $(this).val() || "Proveedor Desconocido";
    });

    $(document).on("input change", "input[name='provContact']", function () {
        provider.contact = $(this).val() || "Contacto Desconocido";
    });

    $(document).on("input change", "input[name='provCode']", function () {
        provider.code = $(this).val().toUpperCase() || "Código Desconocido";
        $(this).val(provider.code); // Ensure UI reflects uppercase
    });

    // Add cost row button
    $(document).on("click", "#addCostRow", function () {
        renderCostRow();
        syncProviderFromUI();
        updateTotalCost();
    });

    // Remove cost row button
    $(document).on("click", ".remove-cost-row", function () {
        $(this).closest("tr").remove();

        // Renumber rows
        $("#additionalCostsTable tbody tr").each((index, row) => {
            $(row).find("td:first").text(index + 1);
        });

        syncProviderFromUI();
        updateTotalCost();
    });

    // Cost input changes
    $(document).on("input change", "[data-name='costName'], [data-name='costValue']", function () {
        syncProviderFromUI();
        updateTotalCost();
    });

    // Load provider data from database
    function loadProviderData(providerData) {
        // Create a deep copy to avoid reference issues
        provider = JSON.parse(JSON.stringify(providerData || {}));

        // Set defaults if needed
        provider.name = provider.name || "";
        provider.contact = provider.contact || "";
        provider.code = provider.code || "";
        provider.cost = provider.cost || 0;
        provider.summary = provider.summary || [];

        initializeUI();
    }

})
