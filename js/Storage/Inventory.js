var item;
var filters = {
    "operation": "",
    "filter": {}
};

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
        data: "Storage&Items&List&Filter=" + JSON.stringify(filters),
        cache: false,
        success: function (data) {
            $(document).find(".InventoryList tbody").html(data);
            $(document).find("#qinput").trigger('keyup');
            $("input[name=\'viewItem\'][value=" + temp + "]").prop("checked", "checked");
            $('.InventoryList tbody').scrollTop(scrollOld);
            if (Object.keys(filters["filter"]).length != 0) {
                $("#ItemCont").fadeOut(1000);
                $("#PreviewCont").addClass('d-flex');
            }
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
        const id = $("input[name=\'viewItem\']:checked").val();
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
            let sortedPackets = Object.keys(Quantity[depoSelect].Packets).reverse()
            contentList = '';
            $.each(sortedPackets, function (index, pack) {
                let nr = Quantity[depoSelect].Packets[pack];
                depoTotalItem += pack * nr;
                contentList += `
                    <tr>
                        <th class="col-4" scope="row">Paquete de (${pack})</th>
                        <td class="col-3">${nr}</td>
                        <td class="col-3">${pack * nr}</td>
                        <td class="col-2">
                            <button type="button" class="btn btn-outline-dark shadow-none" modal-data-locate="Inventory&Item&Mode=EditPacket&id=${id}&pack=${pack}&depo=${depoSelect}" id="modalBtn"><i class="bi bi-pencil-square"></i></button>
                            <button type="button" class="btn btn-outline-dark shadow-none" item-data="${pack}" id="deletePacket"><i class="bi bi-x-lg"></i></button>
                        </td>
                    </tr>
                `;
            });
            contentList += `
                <tr>
                    <th class="col-4" scope="row">Piezas Sueltas</th>
                    <td class="col-3">${Quantity[depoSelect].Pcs}</td>
                    <td class="col-3">${Quantity[depoSelect].Pcs}</td>
                    <td class="col-2">
                        <button type="button" class="btn btn-outline-dark shadow-none" modal-data-locate="Inventory&Item&Mode=EditPcs&id=${id}&depo=${depoSelect}" id="modalBtn"><i class="bi bi-pencil-square"></i></button>
                    </td>
                </tr>
            `;

            contentList += `
                <tr>
                    <td colspan="3">
                        <hr>
                    </td>
                </tr>
                <tr>
                    <th class="col-4" scope="row">Muestras</th>
                    <td class="col-3">${Quantity[depoSelect].Samples ?? 0}</td>
                    <td class="col-3">${Quantity[depoSelect].Samples ?? 0}</td>
                    <td class="col-2">
                        <button type="button" class="btn btn-outline-dark shadow-none" modal-data-locate="Inventory&Item&Mode=EditSamples&id=${id}&depo=${depoSelect}" id="modalBtn"><i class="bi bi-pencil-square"></i></button>
                    </td>
                </tr>
            `;

        }

        $("#titleDeposits h5").text("Cantidad Total: " + totalItem);
        $("#titleDeposits h6").text("Cantidad Deposito (" + depoSelect + "): " + depoTotalItem);
        $(document).find(".ItemList tbody").html(contentList);
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
                $(document).find(".ItemList tbody").html("");
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

function LoadFilters() {
    if (Object.keys(filters["filter"]).length != 0) {
        var cont = $(document).find('#filterPage' + filters["operation"])
        $('#FilterOption option[value="' + filters["operation"] + '"]').attr("selected", "selected").trigger("change");

        if (filters["operation"] != 3) {
            cont.find('input[type=radio][name=page' + filters["operation"] + 'Options][value="' + filters["filter"]["btn"] + '"]').prop("checked", true).trigger("change");
        }

        if (filters["operation"] == 1) {
            if (filters["filter"]["btn"] != 1) {
                var arr = filters["filter"][filters["filter"]["btn"]];
                $("input[type=checkbox][name=defineDepo]").each(function () {
                    if (arr.includes(this.value)) {
                        $(this).prop("checked", true);
                    }
                });
            }
        } else if (filters["operation"] == 2) {
            if (filters["filter"]["btn"] != 1) {
                cont.find("#Packets input").val(filters["filter"][filters["filter"]["btn"]]);
            } else {
                cont.find("#Total input").val(filters["filter"][filters["filter"]["btn"]]);
            }
        } else {
            cont.find("input").val(filters["filter"]['day']);
        }
    }
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
        url: urlAPI + 'item/img/upload',
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
                    url: urlAPI + 'item/img/delete',
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
                    $(document).find(".ItemList tbody").html("");
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
    $(document).on('change', 'input[type=radio][name=depositnr]', function () {
        updateItem();
    });
    $(document).on('click', '.operations button', function () {
        const temp = $("input[name=\'viewItem\']:checked").val();
        const btn = $(this);
        var dataSend = `Quantity&Pcs&${btn.attr('id')}&item=${temp}&deposit=${$("input[name=\'depositnr\']:checked").val()}&num=${$('#quantity').val()}`;
        if (btn.parent().attr('data-type') == "pack") {
            dataSend = `Quantity&Packet&${btn.attr('id')}&item=${temp}&deposit=${$("input[name=\'depositnr\']:checked").val()}&pack=${btn.parent().attr('data-packet-num')}&num=${$('#quantity').val()}`
        }
        if (btn.parent().attr('data-type') == "samples") {
            dataSend = `Quantity&Samples&${btn.attr('id')}&item=${temp}&deposit=${$("input[name=\'depositnr\']:checked").val()}&num=${$('#quantity').val()}`
        }
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
            data: dataSend,
            cache: false,
            success: function (data) {
                var res = JSON.parse(data);
                if (res[0] == false) {
                    Swal.fire({
                        title: "Ups! Algo Salio Mal",
                        text: res[1],
                        icon: "error"
                    });
                    updateItem();
                    return;
                }
                Swal.fire({
                    title: "Operacion Exitosa",
                    text: res[1],
                    icon: "success"
                });
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
        const temp = $("input[name=\'viewItem\']:checked").val();
        const btn = $(this);
        Swal.fire({
            title: "Quieres Eliminar El Paquete de " + btn.attr('item-data'),
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
                    data: `Quantity&Packet&del&item=${temp}&deposit=${$("input[name=\'depositnr\']:checked").val()}&pack=${btn.attr('item-data')}`,
                    cache: false,
                    success: function (data) {
                        var res = JSON.parse(data);
                        if (res[0] == false) {
                            Swal.fire({
                                title: "Ups! Algo Salio Mal",
                                text: res[1],
                                icon: "error"
                            });
                            updateItem();
                            return;
                        }
                        Swal.fire({
                            title: "Operacion Exitosa",
                            text: res[1],
                            icon: "success"
                        });
                        updateItem();
                    }
                });
            }
        });
    });
    $(document).on('click', '#createPacket', function () {
        const temp = $("input[name=\'viewItem\']:checked").val();
        const btn = $(this);
        Swal.fire({
            title: "¿Crear Paquete de " + $('#packet').val() + " Pz.?",
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
                    data: `Quantity&Packet&new&item=${temp}&deposit=${$("input[name=\'depositnr\']:checked").val()}&pack=${$('#packet').val()}`,
                    cache: false,
                    success: function (data) {
                        var res = JSON.parse(data);
                        if (res[0] == false) {
                            Swal.fire({
                                title: "Ups! Algo Salio Mal",
                                text: res[1],
                                icon: "error"
                            });
                            updateItem();
                            return;
                        }
                        Swal.fire({
                            title: "Operacion Exitosa",
                            text: res[1],
                            icon: "success"
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

    //Filter
    $(document).on('change', '#FilterOption', function () {
        var op = $(this).find("option:selected").val();
        $(document).find('.pageFilter').attr('hidden', true);
        var cont = $(document).find('#filterPage' + op)
        cont.attr('hidden', false);
    });
    $(document).on('change', 'input[type=radio][name=page1Options]', function () {
        if ($('input[type=radio][name=page1Options]:checked').val() == 1) {
            $(this).parent().parent().find('#Define').attr('hidden', true);
        } else {
            $(this).parent().parent().find('#Define').attr('hidden', false);
        }
    });
    $(document).on('change', 'input[type=radio][name=page2Options]', function () {
        if ($('input[type=radio][name=page2Options]:checked').val() == 1) {
            $(this).parent().parent().find('#Packets').attr('hidden', true);
            $(this).parent().parent().find('#Total').attr('hidden', false);
        } else {
            $(this).parent().parent().find('#Packets').attr('hidden', false);
            $(this).parent().parent().find('#Total').attr('hidden', true);
        }
    });
    $(document).on('click', '#resetFilters', function () {
        filters.filter = {}
        filters.operation = "";
        updateTable();
    });
    $(document).on('click', '#saveFilters', function () {
        var op = $("#FilterOption option:selected").val();
        var cont = $(document).find('#filterPage' + op)
        filters.operation = op;
        filters.filter = {}
        filters.filter["btn"] = cont.find('input[type=radio][name=page' + op + 'Options]:checked').val();
        if (op == 1) {
            filters.filter["2"] = cont.find("input[type=checkbox][name=defineDepo]:checked").map(function () { return $(this).val() }).get();
        } else if (op == 2) {
            filters.filter["1"] = cont.find("#Total input").val();
            filters.filter["2"] = cont.find("#Packets input").val();
        } else {
            filters.filter["day"] = cont.find("input").val();
        }
        updateTable();
    });

    //Report
    $(document).on('click', '#reportBtn', function () {
        $.ajax({
            beforeSend: function () {
                Swal.fire({
                    html: new sweet_loader().loader("Procesando"),
                    showDenyButton: false,
                    showCancelButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
            },
            type: "POST",
            url: "api/code-obtain.php",
            data: "Storage&Items&Report&Filter=" + JSON.stringify(filters),
            cache: false,
            xhrFields: {
                responseType: 'blob' // set the responseType to blob
            },
            success: function (data, textStatus, jqXHR) {
                const blob = new Blob([data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // set the MIME type to match the file type
                });

                // create a download link and click it to initiate the download
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                function generateUniqueExcelName() {
                    const currentDate = new Date();
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    const randomId = Math.floor(Math.random() * 1000000);

                    if (Object.keys(filters["filter"]).length != 0) {
                        return `${year}-${month}-${day}_${randomId}_filtros`;
                    }
                    return `${year}-${month}-${day}_${randomId}`;
                }
                link.download = generateUniqueExcelName() + '-report_Inventory.xlsx'; // replace with your desired file name
                link.click();
                Swal.fire({
                    title: "Operacion Exitosa",
                    icon: "success"
                });
            }
        });
    });

    //Providers
    $(document).on('click', '#saveProviders', function () {
        $.ajax({
            type: 'POST',
            url: 'api/code-edit.php',
            data: "Item&Provider&uuid=" + $("input[name=\'viewItem\']:checked").val()+ "&provider=" + JSON.stringify(provider),
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

    // Other field change handlers
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

    // Form submission
    $(document).on("submit", "#saveProviderInfo", function (e) {
        e.preventDefault();
        syncProviderFromUI();
        // Here you would save the provider data to the server
        alert("Datos del proveedor guardados");
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
