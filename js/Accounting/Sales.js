var filters = { "type": "", "client": "", "total": { "method": "", "input": "" }, "date": { "start": "", "end": "" }, "status": "", "price": { "method": "", "input": "" }, "due": "" };

function updateTable() {
    const scrollOld = $('.Sales tbody').scrollTop();
    $.ajax({
        type: "POST",
        url: "api/code-obtain.php",
        data: "Accounting&Sales&filters=" + JSON.stringify(filters),
        cache: false,
        success: function (data) {
            $(document).find(".Sales tbody").html(data);
            $(document).find("#qinput").trigger('keyup');
            $('.Sales tbody').scrollTop(scrollOld);
        }
    });
}

class Core {
    loopWaitingForHost(id, rule = "note") {
        Swal.fire({
            html: new sweet_loader().loader("Buscando Host"),
            showDenyButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false
        });
        var loop = setInterval(function () {
            $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "Accounting&SearchHost&id=" + id,
                cache: false,
                success: function (data) {
                    const json = JSON.parse(data)

                    if (json[0] == true) {
                        if (json[1] == '') {
                            return;
                        }
                        Swal.fire({
                            html: new sweet_loader().loader("Host: <br> " + json[1]),
                            showDenyButton: false,
                            showCancelButton: false,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false
                        });
                        new Core().loopWaitingFinish(id, rule);
                        clearInterval(loop);
                        return;
                    }
                    Swal.fire({
                        title: "Ups La Venta No Existe",
                        icon: "error"
                    });
                    clearInterval(loop);
                }
            });
        }, 5 * 1000);
    }
    loopWaitingFinish(id, rule) {
        var num = 0;
        var loop = setInterval(function () {
            num++;
            if (num > 70) {
                Swal.fire({
                    title: "!Ups Execedio El Tiempo Limite de Espera",
                    icon: "error"
                });
                clearInterval(loop);
                return;
            }
            $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "Accounting&Finish&id=" + id,
                cache: false,
                success: function (data) {
                    const json = JSON.parse(data)
                    if (json[0] == true) {
                        if (json[1] == '0' || !json[1]) {
                            return;
                        }
                        clearInterval(loop);
                        if (rule == 'note') {
                            Swal.fire({
                                title: "Nota Creada id: " + json[1],
                                icon: "success"
                            });
                        } else if (rule == 'delete') {
                            Swal.fire({
                                title: "Nota Anulada",
                                icon: "success"
                            });
                        }
                        return;
                    }
                    Swal.fire({
                        title: "Ups La Venta No Existe",
                        icon: "error"
                    });
                    clearInterval(loop);
                }
            });
        }, 5 * 1000);
    }
}


function loadFilters() {
    const doc = $(document);
    doc.find('#filter-type option[value="' + filters.type + '"]').prop('selected', true);
    doc.find('#filter-client option[value="' + filters.client + '"]').prop('selected', true);
    doc.find('#filter-status option[value="' + filters.status + '"]').prop('selected', true);

    if (filters.total.method) {
        doc.find('input[name="filter-total-lessThan-greaterThan"][value="' + filters.total.method + '"]').prop('checked', true);
    } else {
        doc.find('input[name="filter-total-lessThan-greaterThan"]').prop('checked', false);
    }
    doc.find('#filter-total').val(filters.total.input);

    if (filters.date.start) {
        doc.find('#filter-date-start').val(filters.date.start);
    }
    if (filters.date.end) {
        doc.find('#filter-date-end').val(filters.date.end);
    } else {
        doc.find('#filter-date-end').val('');
    }

    doc.find('#isPaid').prop('checked', filters.isPaid);

    if (filters.price.method) {
        doc.find('input[name="filter-price-lessThan-greaterThan"][value="' + filters.price.method + '"]').prop('checked', true);
    } else {
        doc.find('input[name="filter-price-lessThan-greaterThan"]').prop('checked', false);
    }
    doc.find('#filter-price').val(filters.price.input);

    doc.find('#no-paid input').val(filters.due);
}

$(document).ready(function () {
    const CoreFunc = new Core();

    $(document).on('click', "#cancelBuy", function () {
        const vars = $(this).parent();
        var buy = { "buyID": vars.attr('buy-id'), "buyType": ["", vars.attr('buy-type')], "buyNr": vars.attr('buy-nr') };
        buy['buyType'][0] = (buy['buyType'][1] == "Nota") ? "Esta " : "Este ";

        var swalconf = {
            title: "¿Estas Seguro?",
            text: "Quieres Anular " + buy['buyType'][0] + buy['buyType'][1] + " / Nr: " + buy['buyNr'],
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si Anulalo",
            cancelButtonText: "No"
        };

        if (buy['buyType'][1] == "Nota") {
            var note = {
                input: 'radio',
                inputOptions: {
                    chrystal: 'Chrystal',
                    pinesjm: 'PinesJM'
                },
                inputValidator: function (value) {
                    if (!value) {
                        return 'Escoje un Motor';
                    }
                }
            };
            swalconf = { ...swalconf, ...note };
        }
        Swal.fire(swalconf).then((result) => {
            if (result.isConfirmed) {
                var dataByMotor = (result.value == 'chrystal') ? ["code-new.php", "Accounting&Null&chrystal&id=" + buy['buyID']] : ["code-edit.php", "Movements&Null&uuid=" + buy['buyID']];
                buy['buyType'][0] = (buy['buyType'][1] == "Nota") ? " Anulada " : " Anulado";

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
                    url: "api/" + dataByMotor[0],
                    data: dataByMotor[1],
                    cache: false,
                    success: function (data) {
                        const json = JSON.parse(data);
                        if (!json.success) {
                            Swal.fire({
                                title: "!Ups. Algo Salio Mal¡",
                                text: json.message,
                                icon: "error"
                            });
                            return;
                        }
                        if (result.value == 'chrystal') {
                            CoreFunc.loopWaitingForHost(json.id, 'delete');
                            return;
                        }
                        if (json[3] == json[2]) {
                            Swal.fire({
                                title: "Anulación Existosa",
                                text: buy['buyType'][1] + buy['buyType'][0] + ", Item Devueltos A Sus Depositos",
                                icon: "success"
                            });
                            updateTable();
                            return;
                        }
                    }
                });
            }
        });




    });
    $(document).on('click', "#goToNote", function () {
        const vars = $(this).parent();
        new modalPinesJM().create("Sales&Note&uuid=" + vars.attr('buy-id'));
    });
    $(document).on('click', "#passToNote", function () {
        const vars = $(this)
        const motor = $(document).find('input[name="motorBase"]:checked').val();
        var dataByMotor = (motor == 'chrystal') ? ["code-new.php", "Accounting&Note&chrystal&uuid=" + vars.attr('buy-id')] : (motor == 'pinesjm') ? ["code-edit.php", "Movements&ToNote&uuid=" + vars.attr('buy-id') + "&nr=" + $('#nrdocument').val()] : "";

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
            url: "api/" + dataByMotor[0],
            data: dataByMotor[1],
            cache: false,
            success: function (data) {
                const json = JSON.parse(data);
                if (json.success) {

                    if (motor == 'chrystal') {
                        CoreFunc.loopWaitingForHost(json.id);
                    } else if (motor == 'pinesjm') {
                        Swal.fire({
                            title: "Nota Creada",
                            icon: "success"
                        });
                    }

                    return;
                }
                var textError = (motor == 'chrystal') ? "No Se Pudo Dar Entrada Al Sistema" : (motor == 'pinesjm') ? json.message : "";
                Swal.fire({
                    title: "!Ups Algo Salio Mal",
                    text: textError,
                    icon: "error"
                });
            }
        });
    });
    $(document).on("change", 'input[type=radio][name="motorBase"]', function () {
        $(".tab-motor").hide();
        $("." + $(this).val()).show();
    });
    $(document).on('click', "#nav-tab button", function () {
        if ($(this).attr('id') == 'nav-info-tab' && $(this).attr('aria-selected') == 'true') {
            $('#saveStatus').fadeIn(300);
        } else {
            $('#saveStatus').fadeOut(300);
        }
        console.log($(this).attr('id'))
        if (($(this).attr('id') == 'nav-accounting-tab' || $(this).attr('id') == 'nav-pay-tab') && $('#nav-accounting').find('#nav-pay-tab').attr('aria-selected') == 'true') {
            $(document).find('#addPay').fadeIn(300);
        } else {
            $(document).find('#addPay').fadeOut(300);
        }
    });
    $(document).on('click', "#saveStatus", function () {
        const uuid = $(this).attr('doc-uuid');

        if ($('#statusSaleChange option:selected').val() == 'null') {
            new messageTemp('Pines Jm', 'Selecciona un Estado', 'info');
            return false;
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
            data: `Point&saleChange&uuid=${uuid}&coment=${$('textarea#coment').val()}&event=${$('#statusSaleChange option:selected').val()}`,
            cache: false,
            success: function (data) {
                new modalPinesJM().close()

                const json = JSON.parse(data);
                if (json[0] == true) {
                    Swal.fire({
                        title: "Operacion Exitosa",
                        text: "El Estado Ha Sido Cambiado",
                        icon: "success"
                    });
                    return;
                }
                Swal.fire({
                    title: "!Ups Algo Salio Mal",
                    text: json[1],
                    icon: "error"
                });
            }
        });
    });
    $(document).on('click', "#reportBuy", function () {
        const vars = $(this).parent();
        // Crea un modal con checkbox de Bootstrap en una cuadrícula de 2x2
        Swal.fire({
            title: 'Seleccione los reportes',
            html: `
        <div class="row">
            <div class="col-md-6">
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" id="chk1" name="rp">
                    <label class="form-check-label" for="chk1">Cliente</label>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" id="chk2" name="rp" disabled>
                    <label class="form-check-label" for="chk2">Administrativa</label>
                </div>
            </div>
        </div>
        `,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            preConfirm: () => {
                const opcion1 = document.getElementById('chk1').checked;
                const opcion2 = document.getElementById('chk2').checked;

                if (!opcion1 && !opcion2) {
                    Swal.showValidationMessage('¡Debes seleccionar al menos un reporte!');
                    return false;
                }

                return { opcion1, opcion2 };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                if (result.value.opcion1) {
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
                        url: urlAPI + "document/view/pdf/fnz",
                        data: JSON.stringify({
                            "type": "note",
                            "uuid": vars.attr("buy-id"),
                            "update": false
                        }),
                        headers: {
                            'Authorization': `Bearer ${apiKey}`
                        },
                        contentType: "application/json",
                        cache: false,
                        success: function (data) {
                            Swal.close();
                            var result = JSON.parse(data);
                    
                            // Decodificar la cadena base64
                            var binaryString = atob(result["response"]);
                    
                            // Crear un array de bytes
                            var len = binaryString.length;
                            var bytes = new Uint8Array(len);
                            for (var i = 0; i < len; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                    
                            // Crear un Blob a partir del array de bytes
                            var blob = new Blob([bytes], { type: 'application/pdf' });
                    
                            // Crear una URL para el Blob
                            var url = URL.createObjectURL(blob);
                    
                            // Abrir una nueva pestaña con la URL del Blob
                            window.open(url, '_blank');

                        },
                        error: function (xhr, status, error) {
                            Swal.fire({
                                title: "Operación Errada",
                                html: error,
                                icon: "error"
                            });
                        }
                    });
                }
            }
        });
    });
    //PAGOS
    $(document).on('click', "#addPay", function () {
        var isEmpty = false;
        const payInput = [
            $('#ammountPay').val(), $('#methodPay option:selected').val()
        ];

        $.each(payInput, function (key, value) {
            if (!value) {
                new messageTemp('Pines Jm', 'Rellene Todas Las Casillas', 'info');
                isEmpty = true;
                return false;
            }
        });
        if (isEmpty == true) { return; }

        const uuid = $(this).attr('doc-uuid');
        var file = $('#refferencePicPay')[0].files[0];
        var img = (!$('#refferencePicPay').val()) ? `Ninguna` : `${file.name} / Tamaño: ${format_bytes(file.size)} / Tipo: ${file.type}`
        Swal.fire({
            title: "¿Quieres Registrar Este Pago?",
            html: `
            Monto: ${$('#ammountPay').val()}$<br>
            Metodo: ${$('#methodPay option:selected').val()}<br>
            Referencia: ${$('#refferencePay').val()}<br>
            Comentarios: ${$('textarea#descriptionPay').val()}<br>
            Imagen: ${img}`,
            showCancelButton: true,
            width: '850px',
            confirmButtonText: "Si",
            cancelButtonText: `No`
        }).then((result) => {
            if (result.isConfirmed) {
                var form_data = new FormData();
                form_data.append('uuid', uuid)
                form_data.append('Point', "");
                form_data.append('saleNewPay', '');
                form_data.append('ammount', $('#ammountPay').val());
                form_data.append('refference', $('#refferencePay').val());
                form_data.append('method', $('#methodPay option:selected').val());
                form_data.append('coment', $('textarea#descriptionPay').val());
                form_data.append('pic', file);

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
                    data: form_data,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        var result = JSON.parse(data);
                        if (result.success) {
                            Swal.fire({
                                title: "Operacion Exitosa",
                                text: "Pago Registrado",
                                icon: "success"
                            });
                            new modalPinesJM().create('Sales&View&newPay&uuid=' + uuid, 3);
                            return;
                        }
                        Swal.fire({
                            title: "!Ups Algo Salio Mal",
                            text: result.error,
                            icon: "error"
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        Swal.fire({
                            title: httpErrorCodes[jqXHR.status],
                            text: 'Error: ' + textStatus + ' - ' + errorThrown,
                            icon: "error"
                        });
                    }
                });
            }
        });
    });
    $(document).on('change', '#refferencePicPay', function () {
        var files = $(this)[0].files;

        var file_bytes = files.size;
        var limit_bytes = 10 * 1024 * 1024;
        if (file_bytes > limit_bytes) {
            new messageTemp('Archivo Muy Pesado', 'El archivo ' + file.name + ' pesa más de ' + format_bytes(limit_bytes), 'error');
            $(this).val("");
            return;
        }

        if (files.length > 0) {
            var validExtensions = ['jpg', 'jpeg', 'png'];

            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var fileExtension = file.name.split('.').pop().toLowerCase();

                if (validExtensions.indexOf(fileExtension) === -1) {
                    new messageTemp('Extesion Incorrecta', 'Las Extensiones Admitidas Son <br>[ ' + validExtensions.join(", ") + ' ]', 'warning');
                    $(this).val('');
                    return;
                }
            }
        }
    });
    $(document).on('click', "#viewPicPay", function () {
        var file = $('#refferencePicPay')[0].files[0];
        if (!$('#refferencePicPay').val()) {
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
                title: "Referencia De Fotografica",
                html: "Nombre: " + file.name + "<br>Tamaño: " + format_bytes(file.size) + "<br>Tipo: " + file.type,
                imageUrl: event.target.result,
                imageHeight: 200,
                imageAlt: "Imagen del archivo",
            })
        });
        reader.readAsDataURL(file);
    });
    $(document).on('click', "#viewPay", function () {
        const img = $(this).attr('data-img-locate');
        Swal.fire({
            text: "Referencia De Fotografica",
            imageUrl: 'resc/screenshot/' + img,
            imageHeight: 400,
            imageAlt: "Imagen del archivo",
        })

    });


    //Filter
    $(document).on('change', '#filter-status', function () {
        if ($(this).find(":selected").val() == 2 || $(this).find(":selected").val() == '') {
            $('.accountancy').prop('hidden', false);
        } else {
            $('.accountancy').prop('hidden', true);
        }
    });
    $(document).on('change', '#isPaid', function () {
        if ($(this).is(':checked')) {
            $("#no-paid").prop('hidden', true);
        } else {
            $("#no-paid").prop('hidden', false);
        }
    });
    $(document).on('click', '#saveFilters', function () {
        const doc = $(document);
        filters.type = doc.find('#filter-type option:selected').val();
        filters.client = doc.find('#filter-client option:selected').val();
        filters.status = doc.find('#filter-status option:selected').val();
        filters.total.method = doc.find('input[name="filter-total-lessThan-greaterThan"]:checked').val();
        filters.total.input = doc.find('#filter-total').val();
        filters.date.start = doc.find('#filter-date-start').val();
        filters.date.end = doc.find('#filter-date-end').val();
        filters.isPaid = doc.find('#isPaid:checked').prop('checked');
        filters.price.method = doc.find('input[name="filter-price-lessThan-greaterThan"]:checked').val();
        filters.price.input = doc.find('#filter-price').val();
        filters.due = doc.find('#no-paid input').val();
        updateTable()
    });
    $(document).on('click', '#resetFilters', function () {
        filters = { "type": "", "client": "", "total": { "method": "", "input": "" }, "date": { "start": "", "end": "" }, "status": "", "price": { "method": "", "input": "" }, "due": "" };
    });
});