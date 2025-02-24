var row = 1;
var VerifyItems;
var mode = null;
var Session = new $_SESSION("listSold");
var oldList;
var verifyItemsPass = [];

class ResetAndStart {
    resetStateVariables() {
        clearInterval(VerifyItems);
        VerifyItems = null;
        oldList = null;
        mode = null;
        verifyItemsPass = [];
        row = 1;
    }

    clearCart() {
        new $_SESSION("listSold").Del();
        $('.CartList tbody').html('');
    }

    resetFinish() {
        this.resetStateVariables();
        this.clearCart();
        this.clearFooter();
        new modalPinesJM().create("DataBase&Users&Mode=ShowClients", 2);
        new $_SESSION("modePoint").Del();
        $('.titlePoint').text('Ventas');
    }
    resetComplete() {
        this.clearCart();
        this.clearFooter();
        if (mode === 1) {
            new $_SESSION("modePoint").Del();
        }
        $('.titlePoint').text('Ventas');
        new modalPinesJM().create("DataBase&Users&Mode=ShowClients", 2);
        this.resetStateVariables();
    }
    clearVerifyItems() {
        verifyItemsPass = [];
    }

    clearFooter() {
        $(document).find('#lblBuyTotal').text("Total: 0");
        $(document).find('#lblBuyCost').html("Costo: 0.00$");
        $(document).find('#lblClientName').text("Cliente: ");

    }
    startInterval() {
        VerifyItems = setInterval(new Core().verifyItemsAll, updateTime * 1000);
    }
    stopInterval() {
        clearInterval(VerifyItems);
    }
}
const start_Reset = new ResetAndStart();

class Core {
    updateRowAndFooter() {
        let total = 0;
        let cost = 0;
        let cost1 = 0;


        if (Object.keys(Session.val.items).length == 0) {
            $('.buyBtn').prop('disabled', true);
            $('.buyBtn i').attr('class', "bi bi-send-slash h4");
        } else {
            $.each(Session.val.items, (index, item) => {
                const rowId = `#${index}`;
                const totalPLabel = $(document).find(`${rowId} #totalP`);
                const totalQLabel = $(document).find(`${rowId} #totalQ`);

                if (!item.depo || !Object.keys(item.packs).length) {
                    $('.buyBtn').prop('disabled', true);
                    $('.buyBtn i').attr('class', "bi bi-send-slash h4");
                    totalPLabel.text("");
                    totalQLabel.text("");
                    return true;
                }

                $('.buyBtn i').attr('class', "bi bi-send-check h4");
                $('.buyBtn').prop('disabled', false);

                let tempTotal = 0;
                $.each(item.packs, (pack, quantity) => {
                    total += pack * quantity;
                    tempTotal += pack * quantity;
                });

                let tempCost = 0;
                let textCost = 0;

                const discount = item.discount[0];
                const price = item.price
                tempCost = tempTotal * price;
                cost1 += tempCost;

                if (discount) {
                    tempCost = item.discount[1] ? tempCost - (tempCost * (discount / 100)) : tempCost - discount;
                }

                textCost = discount ? `<s>${(tempTotal * price).toFixed(2)}$</s>\n${tempCost.toFixed(2)}$` : `${tempCost.toFixed(2)}$`;

                totalPLabel.html(textCost);
                totalQLabel.text(tempTotal > 0 ? tempTotal : "");

                cost += tempCost;
            });
        }

        $(document).find('#lblBuyTotal').text(`Total: ${total}`);
        $(document).find('#lblBuyCost').html(`Costo: ${(cost.toFixed(2) != cost1.toFixed(2)) ? `<s>${cost1.toFixed(2)}</s> -> ${cost.toFixed(2)}` : cost.toFixed(2)}$`);
    }
    newRow() {
        $('.CartList tbody').append(`
        <tr id="${row}">
            <th class="col-stv-2" scope="col">
                <button type="button" class="btn btn-dark" id="deleteRow" hidden><i class="bi bi-trash"></i></button>  
                ${row}
            </th>
            <td class="col-stv-3" scope="col">
                <h1 hidden></h1>
                <input class="form-control" type="text" placeholder="Codigo" id="inputItem" oninput="this.value = this.value.toUpperCase();">
            </td>
            <td class="col-stv-4" scope="col">
                <select class="form-select" id="selectOrigin" hidden>
                </select>
            </th>
            <td class="col-stv-14" scope="col">
                <div class="row" id="quantity" style="padding: 0 .5rem 0 .8rem;">
                </div>
            </td>
            <td class="col-stv-3" scope="col" id="price">
                <input class="form-control" type="text" placeholder="Auto" data-precision="3" hidden>
            </td>
            <td class="col-stv-4" scope="col">
                <div class="input-group flex-nowrap" id="itemDisc" hidden>
                    <input type="text" class="form-control" placeholder="Ninguno" oninput="numberInput(this)" id="item_discount" autocomplete="off" data-precision="2">
                    <span class="input-group-text" id="basic-addon1">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="item_discountP">
                            <label class="form-check-label" for="item_discountP">
                                %
                            </label>
                        </div>
                    </span>
                </div>
            </td>
            <td class="col-stv-2" scope="col" id="totalP">
            </td>
            <td class="col-stv-2" scope="col" id="totalQ">
            </td>
        </tr>
        `);
        $(`.CartList tbody tr#${row} #price input`).maskMoney();
        row++;
    }
    loadsRows() {
        if (Object.keys(Session.val.items).length != 0) {
            $.each(Session.val.items, function (key, value) {
                row = key;
                new Core().newRow();
                const cont = $(`.CartList tbody tr#${key}`)
                cont.find('#inputItem').val(value['code']);
                cont.find('#inputItem').attr('disabled', true);
                cont.find('h1').text(value['code'])
                cont.find('#deleteRow, #selectOrigin').attr('hidden', false);
                cont.find('#itemDisc').attr('hidden', false);
                cont.find('#price input').attr('hidden', false);
                $.ajax({
                    type: "POST",
                    url: "api/code-obtain.php",
                    data: "Storage&Items&GetItem&id=" + value['code'] + "&depo=" + value['depo'],
                    cache: false,
                    success: function (data) {
                        const i = JSON.parse(data);
                        if (i[0] == true) {
                            var n = 0;
                            $.each(i[1], function (key, value) {
                                n += key * value;
                            });
                            cont.find('#selectOrigin').html(new Core().loadDeposit(Array(Array(value['depo'], n))));
                            cont.find('#selectOrigin option[value="' + value['depo'] + '"]').prop('selected', true)
                            cont.find('#selectOrigin').attr('disabled', true);
                            cont.find('#price input').val(value['price']);
                            cont.find('input#item_discount').val(value['discount'][0]);
                            cont.find('input#item_discountP').prop("checked", value['discount'][1]);
                            new Core().loadPackets(key);
                        }
                    },
                    error: function (xhr, status, error) {
                        Swal.fire({
                            title: "Operaccion Errada",
                            html: error,
                            icon: "error"
                        });
                    }
                });


            });
            $('#clearList').attr('disabled', false);
            this.updateRowAndFooter();
            this.newRow();
        } else {
            this.newRow();
        }
    }
    loadDeposit(listAvaible) {
        var deposit = '<option value="" hidden selected>Depositos</option>';

        $.each(listAvaible, function (i, a) {
            deposit += '<option value="' + a[0] + '">Dp. ' + a[0] + ' (' + a[1] + ')</option>';
        });
        return deposit
    }
    loadPackets(id) {
        var packs = "";
        if (typeof id === "object") {
            var changes = 0;
            const sessionPacks = Session.val.items[id['key']]["packs"];
            const idPacks = id['packs'];




            for (const p in sessionPacks) {
                if (!idPacks.hasOwnProperty(p) || idPacks[p] <= 0) {
                    delete sessionPacks[p];
                    changes++;
                }
                if (idPacks.hasOwnProperty(p) && sessionPacks[p] > idPacks[p]) {
                    Session.val.items[id['key']]["packs"][p] = idPacks[p]
                }
            }

            for (const p in idPacks) {
                const n = idPacks[p];
                const inputElement = $(`#${id['key']} #quantity input#${p}`);

                // Si el pack no existe en sessionPacks o el max es diferente, hay un cambio
                if (!inputElement.length || inputElement.length && inputElement.attr('max') != n) {
                    changes++;
                }
                console.log(Session.val.items[id['key']]["code"], inputElement.attr('max'), n)
            }

            $(`#${id['key']} #quantity input`).each(function () {
                if (idPacks[$(this).attr("id")] === undefined) {
                    changes++;
                }
            });


            if (changes == 0) {
                return;
            }

            for (const p in idPacks) {
                const n = idPacks[p];
                if (n === 0) continue;

                const valueTemp = sessionPacks[p] || "";

                packs += `
                <div class="col-6 col-lg-4 ps-0 pe-0">
                    <div class="input-group pe-1">
                        <span class="input-group-text">${p} (${n})</span>
                        <input type="text" class="form-control" id="${p}" max="${n}" value="${valueTemp}" autocomplete="off" pattern="[0-9+-]+" onkeypress="return /[0-9+-]/.test(event.key)">
                    </div>
                </div>`;
            }

            if (changes > 0) {
                Session.Save();
                $(`#${id['key']} #quantity`).html(packs);
            }
            return;
        }
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Storage&Items&GetItem&id=" + Session.val.items[id]['code'] + "&depo=" + Session.val.items[id]['depo'],
            cache: false,
            async: false,
            timeout: 30000,
            success: function (response) {
                const json = JSON.parse(response);
                if (json[0] == false) {
                    Swal.fire({
                        text: "  ",
                        title: "Producto No Existe",
                        timer: 1000,
                        icon: "error",
                        showCancelButton: false,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    });
                    delete Session.val.items[$(this).parent().parent().attr('id')];
                    Session.Save();
                    $(this).parent().parent().remove();
                    return;
                }

                var mergedJson = json[1];


                if (mode == 1) {
                    $.each(oldList, function (k, v) {
                        if (v["code"] == Session.val.items[id]['code'] && v["depo"] == Session.val.items[id]['depo']) {
                            mergedJson = mergeObjectValues(json[1], v['packs']);
                            return false;
                        }
                    });
                }




                $.each(mergedJson, function (p, n) {
                    var valueTemp = "";
                    if (Session.val.items[id]["packs"].hasOwnProperty(p)) {
                        valueTemp = Session.val.items[id]["packs"][p];
                    }
                    if (n == 0) {
                        return;
                    }
                    packs += `
                    <div class="col-6 col-lg-4 ps-0 pe-0">
                        <div class="input-group pe-1">
                            <span class="input-group-text">${p} (${n})</span>
                            <input type="text" class="form-control" id="${p}" max="${n}" value="${valueTemp}" autocomplete="off" pattern="[0-9+-]+" onkeypress="return /[0-9+-]/.test(event.key)">
                        </div>
                    </div>`;

                });
                $.each(Session.val.items[id]["packs"], function (p, n) {
                    if (!mergedJson.hasOwnProperty(p) || n <= 0) {
                        delete Session.val.items[id]["packs"][p];
                    }
                });
                $(`#${id} #quantity`).html(packs);
                Session.Save();
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    title: "Operaccion Errada",
                    html: error,
                    icon: "error"
                });
            }
        });
    }
    verifyQuantity(id, input) {
        const func = this;
        if (input.val() == '' || Number(input.val()) == 0) {
            input.val("")
            if (Session.val.items[id]['packs'].hasOwnProperty(input.attr('id'))) {
                delete Session.val.items[id]['packs'][input.attr('id')];
                Session.Save();
            }
            func.updateRowAndFooter();
            return;
        }
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Storage&Items&GetItem&id=" + Session.val.items[id]['code'] + "&depo=" + Session.val.items[id]['depo'],
            cache: false,
            success: function (response) {
                const json = JSON.parse(response);
                if (json[0] == false) {
                    Swal.fire({
                        text: "  ",
                        title: "Producto No Existe",
                        timer: 1000,
                        icon: "error",
                        showCancelButton: false,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    });
                    delete Session.val.items[$(this).parent().parent().attr('id')];
                    $(this).parent().parent().remove();
                    Session.Save();
                    return;
                }
                var mergedJson = json[1];
                if (mode == 1 && oldList.hasOwnProperty(id)) {
                    mergedJson = mergeObjectValues(json[1], oldList[id]['packs']);
                }

                if (input.val() <= mergedJson[input.attr('id')]) {
                    Session.val.items[id]['packs'][input.attr('id')] = input.val();
                    Session.Save();
                } else {
                    if (Session.val.items[id]['packs'].hasOwnProperty(input.attr('id'))) {
                        delete Session.val.items[id]['packs'][input.attr('id')]
                    }
                    input.val('');
                    new messageTemp("Stock Insuficiente", "La Cantidad Colocada Excede La Existencia", "warning");
                    func.loadPackets(id);
                    Session.Save();
                }
                func.updateRowAndFooter();
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    title: "Operaccion Errada",
                    html: error,
                    icon: "error"
                });
            }
        });
    }
    verifyItemsAll() {
        if (Object.keys(Session.val.items).length == 0) {
            return;
        }
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Storage&Ship&VerifyPacketsAndItem&list=" + JSON.stringify(Session.val.items) + "&client=" + Session.val.client[0] + "&mode=" + mode + "&old=" + JSON.stringify(oldList),
            cache: false,
            success: function (data) {
                const result = JSON.parse(data);
                if (Object.keys(result['error']).length != 0) {
                    new modalPinesJM().create('ShowErrors&Cart&logs=' + JSON.stringify(result['error']));
                }
                $.each(result['success'], function (a, b) {
                    console.time("Optimized Code");
                    new Core().loadPackets({ "key": a, "packs": b["packets"] });
                    console.timeEnd("Optimized Code");
                });
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    title: "Operaccion Errada",
                    html: error,
                    icon: "error"
                });
            }
        });
    }
    loopWaitingForHost(id, rule = "budget") {
        Swal.fire({
            html: new sweet_loader().loader("Buscando Host"),
            showDenyButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false
        });
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
                        clearInterval(loop);
                        new Core().loopWaitingFinish(id, rule);
                        return;
                    }
                    Swal.fire({
                        title: "Ups La Venta No Existe",
                        icon: "error"
                    });
                    clearInterval(loop);
                },
                error: function (xhr, status, error) {
                    Swal.fire({
                        title: "Operaccion Errada",
                        html: error,
                        icon: "error"
                    });
                }
            });
        }, verifyCheck * 1000);
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
                        if (rule == 'budget') {
                            Swal.fire({
                                title: "¿Quieres Pasarlo A Nota?",
                                text: "Preosupuesto Creado id: " + json[1],
                                showDenyButton: true,
                                showCancelButton: false,
                                confirmButtonText: "Si",
                                denyButtonText: `No`
                            }).then((result) => {
                                /* Read more about isConfirmed, isDenied below */
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
                                        data: "Accounting&Note&chrystal&uuid=" + json[2],
                                        cache: false,
                                        success: function (data) {
                                            const jsonNew = JSON.parse(data)
                                            if (jsonNew.success) {
                                                new Core().loopWaitingForHost(jsonNew.id, "note");
                                                return;
                                            }
                                            Swal.fire({
                                                title: "!Ups No Se Pudo Dar Entrada Al Sistema¡",
                                                icon: "error"
                                            });
                                        },
                                        error: function (xhr, status, error) {
                                            Swal.fire({
                                                title: "Operaccion Errada",
                                                html: error,
                                                icon: "error"
                                            });
                                        }
                                    });
                                }
                            });
                        } else if (rule == 'note') {
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
                },
                error: function (xhr, status, error) {
                    Swal.fire({
                        title: "Operaccion Errada",
                        html: error,
                        icon: "error"
                    });
                }
            });
        }, verifyCheck * 1000);
    }
    completeBuy() {
        var additionals = {
            "credit": "",
            "discount": ['', false],
            "coment": ""
        }

        if (Object.keys(Session.val.items).length == 0) {
            Swal.fire({
                title: "!Error Critico¡",
                text: "Su Lista Esta Vacia",
                icon: "warning"
            });
            return;
        }

        const motor = $(document).find('input[name="motorBase"]:checked').val();
        var dataByMotor = ["code-new.php", ""]
        if (motor == 'chrystal') {
            additionals.discount[0] = $(document).find('input#Crydiscount').val();
            additionals.discount[1] = $(document).find('#CrydiscountPercent').is(':checked');
            additionals.credit = $(document).find('input#Crycredit').val();
            additionals.coment = $(document).find('input#Crycoment').val();

            dataByMotor[1] = "Accounting&Budget&chrystal&id=" + new $_SESSION("modePoint").val['uuid'] + "&additionals=" + JSON.stringify(additionals) + "&old=" + JSON.stringify(oldList) + "&list=" + JSON.stringify(Session.val);
        } else if (motor == 'pinesjm') {
            additionals.discount[0] = $(document).find('input#JMdiscount').val();
            additionals.discount[1] = $(document).find('#JMdiscountPercent').is(':checked');
            additionals.credit = $(document).find('input#JMcredit').val();
            additionals.coment = $(document).find('input#JMcoment').val();
            dataByMotor[1] = "Accounting&Make&pinesjm&nr=" + $('#nrdocument').val() + "&type=" + $('#typedocument option:selected').val() + "&additionals=" + JSON.stringify(additionals) + "&old=" + JSON.stringify(oldList) + "&list=" + JSON.stringify(Session.val) + "&uuid=" + new $_SESSION("modePoint").val['uuid'];
        } else if (motor == 'pedding') {
            dataByMotor[0] = "code-edit.php";
            dataByMotor[1] = "Point&retainedSave&coment=" + $('textarea#coment ').val() + "&status=" + $('#status option:selected').val() + "&old=" + JSON.stringify(oldList) + "&uuid=" + new $_SESSION("modePoint").val['uuid'] + "&list=" + JSON.stringify(Session.val);
        }

        start_Reset.resetFinish();

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
                const json = JSON.parse(data)
                if (json.success == true) {
                    if (motor == 'chrystal') {
                        new Core().loopWaitingForHost(json.id);
                        return;
                    } else if (motor == 'pinesjm') {
                        Swal.fire({
                            title: "Creado Exitosamente",
                            icon: "success",
                            willClose: () => {
                                start_Reset.resetFinish();
                            }
                        });
                    } else if (motor == 'pedding') {
                        Swal.fire({
                            title: "Actualizado Con Exito",
                            text: $('#status option:selected').text(),
                            icon: "success",
                            willClose: () => {
                                start_Reset.resetFinish();
                            }
                        });
                        return;
                    }
                    return;
                }
                Swal.fire({
                    title: "!Ups No Se Pudo Dar Entrada Al Sistema¡",
                    text: json.message,
                    icon: "error"
                });
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    title: "Operaccion Errada",
                    html: error,
                    icon: "error"
                });
            }
        });
    }
}

function updateTable() {
    const scrollOld = $('table tbody').scrollTop();
    $.ajax({
        type: "POST",
        url: "api/code-obtain.php",
        data: "Accounting&Movements",
        cache: false,
        success: function (data) {
            $(document).find("table tbody").html(data);
            $(document).find("#qinput").trigger('keyup');
            $('table tbody').scrollTop(scrollOld);
        },
        error: function (xhr, status, error) {
            Swal.fire({
                title: "Operaccion Errada",
                html: error,
                icon: "error"
            });
        }
    });
}

function detectInputType(inputElement, verifyCallback) {
    const state = {
        keyPresses: [],
        machineDetected: false,
        humanListener: null,
        verifyTimer: null,
        machineMessageSent: false,
        lastInputTime: 0,
        machineInputCompleteTimeout: null,
        initialized: false,
        isProcessing: false
    };

    function resetDetection() {
        state.keyPresses = [];
        state.machineDetected = false;
        state.machineMessageSent = false;
        state.lastInputTime = 0;
        state.isProcessing = false;

        // Eliminar todos los eventos previos asociados al input
        if (state.humanListener) {
            $(inputElement).off('keydown', state.humanListener);
            state.humanListener = null;
        }

        if (state.verifyTimer) {
            clearTimeout(state.verifyTimer);
            state.verifyTimer = null;
        }

        if (state.machineInputCompleteTimeout) {
            clearTimeout(state.machineInputCompleteTimeout);
            state.machineInputCompleteTimeout = null;
        }
    }

    function processCode() {
        if (state.isProcessing) {
            return;
        }
        state.isProcessing = true;

        const currentCode = $(inputElement).val().trim();
        if (!currentCode) {
            state.isProcessing = false;
            return;
        }

        if (verifyCallback) {
            console.log("Procesando código:", currentCode);
            verifyCallback(currentCode);
        }

        resetDetection();
    }

    function startDetection() {
        if (state.initialized) {
            console.log("Detector ya inicializado. Evitando duplicación.");
            return;
        }

        state.initialized = true;
        resetDetection();

        // Limpiar eventos previos antes de añadir nuevos
        $(inputElement).off('keydown');
        $(inputElement).off('input');

        $(inputElement).on('keydown', function (e) {
            const currentTime = new Date().getTime();
            state.keyPresses.push(currentTime);
            state.lastInputTime = currentTime;

            if (state.keyPresses.length > 10) {
                state.keyPresses.shift();
            }

            if (state.keyPresses.length > 1) {
                const intervals = [];
                for (let i = 1; i < state.keyPresses.length; i++) {
                    intervals.push(state.keyPresses[i] - state.keyPresses[i - 1]);
                }

                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

                if (avgInterval < 50 && !state.machineDetected) {
                    state.machineDetected = true;

                    if (!state.machineMessageSent) {
                        state.machineMessageSent = true;
                    }

                    if (state.machineInputCompleteTimeout) {
                        clearTimeout(state.machineInputCompleteTimeout);
                    }

                    state.machineInputCompleteTimeout = setTimeout(() => {
                        if (new Date().getTime() - state.lastInputTime > 300) {
                            processCode();
                        }
                    }, 350);

                    return;
                }

                if (!state.machineDetected) {
                    // Cambio: Listener dentro del elemento de entrada
                    state.humanListener = function (event) {
                        if (event.which === 13 || event.which === 108) {
                            if (state.verifyTimer) {
                                clearTimeout(state.verifyTimer);
                            }

                            state.verifyTimer = setTimeout(() => {
                                processCode();
                                $(inputElement).off('keydown', state.humanListener);
                                state.humanListener = null;
                                state.verifyTimer = null;
                            }, 500);
                        }
                    };

                    $(inputElement).on('keydown', state.humanListener);
                }
            }
        });

        $(inputElement).on('input', function () {
            if (state.verifyTimer) {
                clearTimeout(state.verifyTimer);
                state.verifyTimer = null;
            }
        });
    }

    startDetection();

    return {
        reset: resetDetection
    };
}


class VerifyPass {
    async itemExist(code) {
        let find = -1;
        let tempTotal = 0;
        let packs = "";
        let packstts = [];
        let id;
        let base;
        let depo;
        let imgUrl = "";

        try {
            imgUrl = await this.getImage(code);
        } catch (error) {
            find = -2;
        }

        $.each(Session.val.items, function (k, v) {
            if (code == v["code"]) {
                base = v["code"] + "_" + v["depo"];
                depo = v.depo;
                if (!verifyItemsPass.includes(base)) {
                    find = 1;
                    id = k;
                    $.each(v.packs, (pack, quantity) => {
                        tempTotal += pack * quantity;
                        packstts.push("Paquetes de " + pack + " hay " + quantity);
                        packs += `
                        <div class="col ps-0 pe-0">
                            <div class="input-group pe-1">
                                <span class="input-group-text">${pack}</span>
                                <input type="text" class="form-control" value="${quantity}" autocomplete="off">
                            </div>
                        </div>`;
                    });
                    return false;
                } else {
                    find = 0;
                    return false;
                }
            }
        });

        switch (find) {
            case -2:
                return {
                    "Reason": "noExist",
                };
            case -1:
                return {
                    "Reason": "noFound",
                    "imgUrl": imgUrl
                };
            case 0:
                return {
                    "Reason": "alreadyCheck",
                    "imgUrl": imgUrl
                };
            case 1:
                return {
                    "Reason": "found",
                    "total": tempTotal,
                    "packs": packs,
                    "ttspq": packstts,
                    "id": id,
                    "base": base,
                    "dp": depo,
                    "imgUrl": imgUrl
                };
            default:
                return { "Reason": "unknownError" };
        }
    }

    updateVerify() {
        const cont = $(document).find("#verifyList")
        cont.find("#codePassed").html("Productos Revisados<br>" + verifyItemsPass.length + " / " + Object.keys(Session.val.items).length);
        if (verifyItemsPass.length == Object.keys(Session.val.items).length) {
            cont.parent().find("#finishBuy").prop("disabled", false);
        } else {
            cont.parent().find("#finishBuy").prop("disabled", true);
        }
    }

    updateTableCodes() {
        const tbody = $(document).find('#verifyList tbody');
        tbody.empty();

        Object.values(Session.val.items).forEach((item) => {
            const base = `${item.code}_${item.depo}`;

            const isVerified = verifyItemsPass.includes(base);

            const $row = $(`
                <tr>
                    <td class="px-3">${item.code}</td>
                    <td class="px-3">
                        <span class="badge ${isVerified ? 'bg-success' : 'bg-danger'} text-light">
                            <i class="bi ${isVerified ? 'bi-check-circle' : 'bi-x-circle'} me-1 text-light"></i>
                            ${isVerified ? 'Verificado' : 'Pendiente'}
                        </span>
                    </td>
                    <td class="px-3">
                        ${isVerified ? `
                            <button class="btn btn-sm btn-danger text-light" onclick="new VerifyPass().removeVerifiedItem('${base}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `);
            tbody.append($row);
        });
    }

    removeVerifiedItem(base) {
        const index = verifyItemsPass.indexOf(base);
        if (index > -1) {
            verifyItemsPass.splice(index, 1);
        }
        this.updateTableCodes();
        this.updateVerify();
    }

    getImage(code) {
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
}

$(document).ready(async function () {
    $('#sidebar').css('z-index', '1090');
    const CoreFunc = new Core();


    $(document).on("keyup", "#qinputClient", function () {
        var value = $(this).val().toLowerCase();
        $(document).find("table tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
    $(document).on("keyup", "#qinput", function () {
        var value = $(this).val().toLowerCase();
        $(document).find("table.CartList tbody tr").filter(function () {
            var rowText = $(this).find("td h1").text().toLowerCase();
            if (rowText === "") { // <--- Add this check
                return true; // Keep the row visible if h1 is empty
            }
            $(this).toggle(rowText.indexOf(value) > -1);
        });
    });
    $(document).on("change", 'input[type=radio][name="clientlist"]', function () {
        $("#setClient").removeClass("disabled");
    });
    $(document).on("click", "#setClient", function () {
        mode = 0;
        Session.val = { "client": ["", [], ""], "items": {} };
        Session.val.client[0] = $(document).find('input[name="clientlist"]:checked').val();
        Session.val.client[1][0] = $(document).find('input[name="clientlist"]:checked').attr("data-type-ident");
        Session.val.client[1][1] = $(document).find('input[name="clientlist"]:checked').attr("data-ident");
        Session.val.client[2] = $(document).find('input[name="clientlist"]:checked').attr("data-name");
        Session.Save();
        const clientNameLabel = $(document).find('#lblClientName');
        clientNameLabel.text(`Cliente: ${Session.val.client[2]}`);


        start_Reset.startInterval();
        CoreFunc.updateRowAndFooter()
        CoreFunc.newRow()
    });
    $(document).on('change', '#inputItem', await function () {
        const inp = $(this);
        const cont = inp.parent().parent();
        var list = [];
        if (inp.val() != '') {
            if (Object.keys(Session.val.items).length != 0) {
                $.each(Session.val.items, function (key, value) {
                    if (value['code'] == inp.val()) {
                        list.push(value['depo']);
                    }
                });
            }
            $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "Storage&Items&VerifyItem&id=" + inp.val() + "&list=" + JSON.stringify(list) + "&userid=" + Session.val.client[0],
                cache: false,
                success: function (data) {
                    const i = JSON.parse(data);
                    if (i[0] == true) {
                        inp.attr('disabled', true);
                        cont.find('h1').text(inp.val())
                        cont.find('#price input').val(i[2])

                        cont.find('#deleteRow,#selectOrigin').attr('hidden', false);
                        cont.find('#selectOrigin').html(CoreFunc.loadDeposit(i[1]));
                        cont.find('input#item_discount').val(i[3]);
                        cont.find('input#item_discountP').prop("checked", i[4]);
                        cont.find('#selectOrigin').focus();
                        return;
                    }
                    Swal.fire({
                        title: i[1],
                        text: " ",
                        icon: "error",
                        timer: 1100,
                        showCancelButton: false,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    });
                    inp.val('');

                },
                error: function (xhr, status, error) {
                    Swal.fire({
                        title: "Operaccion Errada",
                        html: error,
                        icon: "error"
                    });
                }
            });
        }
    });

    $(document).on('click', 'label[for="dateCredit"]', function() {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Enero es 0!
        const yyyy = today.getFullYear();
        
        const currentDate = yyyy + '-' + mm + '-' + dd;
        
        $(this).parent().find('input#dateCredit')[0].setAttribute('min', currentDate);
        $(this).parent().find('input#dateCredit')[0].showPicker();
    });

    $(document).on('change', 'input#dateCredit', function() {
        const selectedDate = new Date($(this).val());
        const today = new Date();
        if (isNaN(selectedDate.getTime())) {
            return;
        }
        const difference = selectedDate - today;
        const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

        $(this).parent().find('input[type="text"]').val(days)
    });


    $(document).on('change', "#selectOrigin", await function () {
        const cont = $(this).parent().parent();
        CoreFunc.newRow();
        $(this).attr('disabled', true);
        cont.find('#itemDisc').attr('hidden', false);
        cont.find('#price input').attr('hidden', false);

        Session.val.items[cont.attr('id')] = {
            'code': cont.find('#inputItem').val(),
            'depo': cont.find("#selectOrigin option:selected").val(),
            'packs': {},
            'price': cont.find('#price input').val(),
            'discount': [
                cont.find('input#item_discount').val(),
                cont.find('input#item_discountP').is(':checked')
            ]
        };
        Session.Save();
        CoreFunc.loadPackets(cont.attr('id'));
        if (Object.keys(Session.val.items).length != 0) {
            $('#clearList').attr('disabled', false);
        }
        $('.buyBtn').attr('disabled', true);
        $('.buyBtn i').attr('class', "bi bi-send-slash h4");
    });
    $(document).on('click', '#deleteRow', function () {
        const cont = $(this).parent().parent();
        if (!cont.find("#selectOrigin option:selected").val()) {
            cont.find('#deleteRow,#selectOrigin').attr('hidden', true);
            cont.find('#itemDisc').attr('hidden', true);
            cont.find('#price input').attr('hidden', true);
            cont.find('#inputItem').val('');
            cont.find('#selectOrigin').html('');
            cont.find('#inputItem').attr('disabled', false);
            cont.find('h1').text('')
            cont.find('#price input').val('');
            return;
        }
        delete Session.val.items[cont.attr('id')];
        cont.remove();
        Session.Save();
        CoreFunc.updateRowAndFooter();
    });
    $(document).on('change', "#quantity input", function () {
        var text = $(this).val().replace(/ /g, '');
        const cont = $(this).parent().parent().parent().parent().parent()
        if ($(this).val().includes("-")) {
            const operation = text.split("-");
            $(this).val(parseInt(operation[0]) - parseInt(operation[1]));
        } else if ($(this).val().includes("+")) {
            const operation = text.split("+");
            $(this).val(parseInt(operation[0]) + parseInt(operation[1]));
        }
        CoreFunc.verifyQuantity(cont.attr("id"), $(this));
    });
    $(document).on('change', "#price input", function () {
        const cont = $(this).parent().parent();
        Session.val.items[cont.attr("id")]['price'] = $(this).val();
        Session.Save();
        CoreFunc.updateRowAndFooter();
    });

    $(document).on('change', "input#item_discount", function () {
        const cont = $(this).parent().parent().parent();

        Session.val.items[cont.attr("id")]['discount'][0] = ($(this).val() > 0) ? $(this).val() : "";
        Session.Save();
        CoreFunc.updateRowAndFooter();
    });
    $(document).on('change', "input#item_discountP", function () {
        const cont = $(this).parent().parent().parent().parent().parent();
        Session.val.items[cont.attr("id")]['discount'][1] = $(this).is(':checked')
        Session.Save();
        CoreFunc.updateRowAndFooter();
    });

    $(document).on('click', "#completBuy", function () {
        if (Object.keys(Session.val.items).length == 0) {
            Swal.fire({
                title: "!Error Critico¡",
                text: "Su Lista Esta Vacia",
                icon: "warning"
            });
            return;
        }

        if (mode == 0) {
            Swal.fire({
                title: "Quieres Crear Este Pedido",
                text: "Este Pedido Se Creara En Estado de Espera",
                showCancelButton: true,
                confirmButtonText: "Si",
                cancelButtonText: `No`,
                input: 'text',
                inputLabel: "Nombre Del Pedido",
            }).then((result) => {
                if (result.isConfirmed) {
                    const name = result.value;
                    clearInterval(VerifyItems);
                    $.ajax({
                        type: "POST",
                        url: "api/code-obtain.php",
                        data: "Storage&Ship&VerifyPacketsAndItem&list=" + JSON.stringify(Session.val.items) + "&mode=" + mode + "&old=" + JSON.stringify(oldList),
                        cache: false,
                        success: function (data) {
                            const result = JSON.parse(data);
                            if (Object.keys(result['error']).length != 0) {
                                $.each(result['error'], function (key, value) {
                                    switch (value[1]) {
                                        case 100:
                                            delete Session.val.items[key];
                                            $(document).find(".CartList tbody #" + key).remove();
                                            break;

                                        case 130:
                                            delete Session.val.items[key]["packs"][value[2]];
                                            new Core().loadPackets({ "key": key, "packs": value["packets"] });
                                            break;
                                        case 150:
                                            delete Session.val.items[key];
                                            $(document).find(".CartList tbody #" + key).remove();
                                            break;

                                        case 200:
                                            Session.val.items[key]["packs"][value[2]] = value["packets"][value[2]];
                                            new Core().loadPackets({ "key": key, "packs": value["packets"] });
                                            break;
                                    }

                                });
                                Session.Save();
                                new Core().updateRowAndFooter();
                            }
                            $.each(result['success'], function (a, b) {
                                new Core().loadPackets({ "key": a, "packs": b["packets"] });
                            });

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
                                data: "Accounting&Pedding&list=" + JSON.stringify(Session.val) + "&name=" + name,
                                cache: false,
                                success: function (data) {
                                    var json = JSON.parse(data);
                                    if (json.success) {
                                        $('#clearList').click();
                                        Swal.fire({
                                            title: "Operaccion Exitosa",
                                            text: "Su Compra Esta En Espera",
                                            icon: "success"
                                        });
                                        return;
                                    }
                                    Swal.fire({
                                        title: "!Ups. Algo Salio Mal",
                                        text: json.message,
                                        icon: "error"
                                    });
                                },
                                error: function (xhr, status, error) {
                                    Swal.fire({
                                        title: "Operaccion Errada",
                                        html: error,
                                        icon: "error"
                                    });
                                }
                            });
                            return;

                        },
                        error: function (xhr, status, error) {
                            Swal.fire({
                                title: "Operaccion Errada",
                                html: error,
                                icon: "error"
                            });
                        }
                    });
                }
            });
        } else if (mode == 1) {
            new modalPinesJM().create('FinishBuy&mode=1&uuid=' + new $_SESSION("modePoint").val['uuid'], 2);
        }
    });
    $(document).on('click', "#finishBuy", function () {
        const btns = $(this).parent();
        const cont = $(this).parent().parent();
        ttsClass.detener();

        const motor = $(document).find('input[name="motorBase"]:checked').val();
        if (mode == 1 && motor == 'pedding') {
            clearInterval(VerifyItems);

            $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "Storage&Ship&VerifyPacketsAndItem&list=" + JSON.stringify(Session.val.items) + "&mode=" + mode + "&old=" + JSON.stringify(oldList),
                cache: false,
                success: function (data) {
                    const result = JSON.parse(data);
                    if (Object.keys(result['error']).length != 0) {
                        $.each(result['error'], function (key, value) {
                            switch (value[1]) {
                                case 100:
                                    delete Session.val.items[key];
                                    $(document).find(".CartList tbody #" + key).remove();
                                    break;

                                case 130:
                                    delete Session.val.items[key]["packs"][value[2]];
                                    new Core().loadPackets({ "key": key, "packs": value["packets"] });
                                    break;
                                case 150:
                                    delete Session.val.items[key];
                                    $(document).find(".CartList tbody #" + key).remove();
                                    break;

                                case 200:
                                    Session.val.items[key]["packs"][value[2]] = value["packets"][value[2]];
                                    new Core().loadPackets({ "key": key, "packs": value["packets"] });
                                    break;
                            }

                        });
                        Session.Save();
                        new Core().updateRowAndFooter();
                    }
                    $.each(result['success'], function (a, b) {
                        new Core().loadPackets({ "key": a, "packs": b["packets"] });
                    });
                    CoreFunc.completeBuy();
                },
                error: function (xhr, status, error) {
                    Swal.fire({
                        title: "Operaccion Errada",
                        html: error,
                        icon: "error"
                    });
                }
            });
            return;
        }
        if ($(this).attr("step") == 0) {

            if (motor == "chrystal" && $(document).find('input#Crycredit').val() == "") {
                new messageTemp('Pines Jm', 'Rellene Todas Las Casillas', 'info');
                return;
            } else if (motor == "pinesjm" && ($(document).find('#nrdocument').val() == "" || $(document).find('input#JMcredit').val() == "")) {
                new messageTemp('Pines Jm', 'Rellene Todas Las Casillas', 'info');
                return;
            }
            new VerifyPass().updateTableCodes();

            btns.find("#skipVerify").prop("hidden", false);
            btns.find("#backToMain").prop("hidden", false);
            cont.find("#verifyList").prop("hidden", false);
            cont.find("#main").prop("hidden", true);
            cont.find("#codePassed").html("Productos Revisados<br>" + verifyItemsPass.length + " / " + Object.keys(Session.val.items).length);

            if(verifyItemsPass.length != Object.keys(Session.val.items).length){
                $(this).prop("disabled", true);
            }


            cont.find("#codeV").focus();
            $(this).attr("step", 1);
            $(this).text("Finalizar");
        } else if ($(this).attr("step") == 1) {
            start_Reset.clearVerifyItems();
            start_Reset.stopInterval();
            CoreFunc.completeBuy();
        }
    });

    /* VERIFICACION DE CODIGOS */
    $(document).on('click', "#skipVerify", function () {
        start_Reset.clearVerifyItems();
        start_Reset.stopInterval();
        CoreFunc.completeBuy();
    });

    $(document).on('click', "#backToMain", function () {
        ttsClass.detener();
        start_Reset.clearVerifyItems();
        const btns = $(this).parent();
        const cont = $(this).parent().parent();
        btns.find("#finishBuy").attr("step", 0);
        btns.find("#finishBuy").text("Siguiente");
        btns.find("#finishBuy").prop("disabled", false);

        btns.find("#skipVerify").prop("hidden", true);
        btns.find("#backToMain").prop("hidden", true);
        cont.find("#main").prop("hidden", false);
        cont.find("#verifyList").prop("hidden", true);
    });


    $(document).on('input', '#verifyList #codeV', function () {
        const cont = $("#verifyList");
        const item = $(this);
        const img = $(document).find('#verifyList img');
    
        const verifyCallback = async (code) => {
            const checkCode = await new VerifyPass().itemExist(code);
            $(item).data('detectorInitialized', false);

            if (checkCode.Reason === "noExist") {
                ttsClass.hablar([
                    { "role": "speak", "content": `El código ${code}, no existe en la base de datos` },
                ]);
                item.val("");
            } else if (checkCode.Reason === "noFound") {
                img.attr('src', checkCode.imgUrl);
                setTimeout(() => {
                    img.attr('src', './resc/img/No-Image-Placeholder.png');
                }, 3000);
                ttsClass.hablar([
                    { "role": "speak", "content": `El código ${code}, no se encuentra en la lista` },
                ]);
                item.val("");
            } else if (checkCode.Reason === "alreadyCheck") {
                img.attr('src', checkCode.imgUrl);
                setTimeout(() => {
                    img.attr('src', './resc/img/No-Image-Placeholder.png');
                }, 3000);
                ttsClass.hablar([
                    { "role": "speak", "content": `El código ${code}, ya está verificado` },
                ]);
                item.val("");
            } else if (checkCode.Reason === "found") {
                img.attr('src', checkCode.imgUrl);
                cont.find("#quantityTotalV").text("Cantidad Requerida: " + checkCode.total);
                cont.find("#depositV").text("Depósito: " + checkCode.dp);
                cont.find("#quantityV").html(checkCode.packs);
                ttsClass.hablar([
                    { "role": "speak", "content": "Código: " + code },
                    { "role": "speak", "content": "Cantidad Requerida de " + checkCode.total },
                    { "role": "speak", "content": "Contenido " + checkCode.ttspq.join(", ") }
                ]);
    
                let isKeyPressRegistered = false;
    
                const handleKeyPress = function (e) {
                    if (!isKeyPressRegistered) {
                        isKeyPressRegistered = true;
    
                        if (e.which === 13) {
                            item.val("");
                            cont.find("#quantityTotalV").text("Cantidad Requerida:");
                            cont.find("#depositV").text("Depósito:");
                            cont.find("#quantityV").html("");
                            ttsClass.hablar([
                                { "role": "speak", "content": "Aceptado" }
                            ]);
                            verifyItemsPass.push(checkCode.base);
                            new VerifyPass().updateVerify();
                            img.attr('src', './resc/img/No-Image-Placeholder.png');
                            new VerifyPass().updateTableCodes();
                           
                        } else if (e.which === 8) {
                            item.val("");
                            cont.find("#quantityTotalV").text("Cantidad Requerida:");
                            cont.find("#depositV").text("Depósito:");
                            cont.find("#quantityV").html("");
                            ttsClass.hablar([
                                { "role": "speak", "content": "Denegado" }
                            ]);
                            img.attr('src', './resc/img/No-Image-Placeholder.png');
                            new VerifyPass().updateVerify();
                        }
    
                        $(document).off('keydown', handleKeyPress);
                        isKeyPressRegistered = false;
                    }
                };
    
                $(document).on('keydown', handleKeyPress);
            }
        };

        if (!$(item).data('detectorInitialized')) {
            $(item).data('detectorInitialized', true);
            detectInputType(this, async (code) => {
                await verifyCallback(code);
            });
        }
    });
    
    




    $(document).on('click', "#clearList", function () {
        start_Reset.resetComplete();
    });

    $(document).on("change", 'input[type=radio][name="motorBase"]', function () {
        $(".tab-motor").hide();
        $("." + $(this).val()).show();
        const cont = $(this).parent().parent().parent().parent().parent().parent().parent();
        console.log(cont.attr("class"))
        if ($(this).val() == "pedding") {
            cont.find("#finishBuy span").text("Guardar");
            return;
        }
        cont.find("#finishBuy span").text("Siguiente");
    });


    //Mode
    if (new $_SESSION("modePoint").Exists()) {
        console.log(new $_SESSION("listSold").val)

        var id = new $_SESSION("modePoint").val['uuid'];
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Accounting&Retained&Buy&uuid=" + id,
            cache: false,
            success: function (data) {
                var json = JSON.parse(data);
                if (json[0] != true || json[1]['event'] > 3) {
                    Swal.fire({
                        title: "!Ups. Algo Salio Mal",
                        text: "Compra Pediente No Existe",
                        icon: "error",
                        didClose: () => {
                            row = 1;
                            if (mode == 0) {
                                new $_SESSION("listSold").Del();
                                $('.CartList tbody').html('');
                                new modalPinesJM().create("DataBase&Users&Mode=ShowClients", 2);
                            } else {
                                new $_SESSION("listSold").Del();
                                new $_SESSION("modePoint").Del();
                                oldList = null;
                                document.location = "index.php?Accounting&Point&mode=Pedding";
                            }
                        }
                    });

                    return;
                }
                oldList = JSON.parse(json[1]['buy']);

                $('.titlePoint').text('Ventas (Modo Ediccion)');
                mode = 1;
                start_Reset.startInterval();

                new Core().loadsRows()
                new Core().updateRowAndFooter()
                const clientNameLabel = $(document).find('#lblClientName');
                clientNameLabel.text(`Cliente: ${Session.val.client[2]}`);
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    title: "Operaccion Errada",
                    html: error,
                    icon: "error"
                });
            }
        });
    } else {
        if (!new $_SESSION("listSold").Exists()) {
            new modalPinesJM().create("DataBase&Users&Mode=ShowClients", 2);
        } else {
            start_Reset.startInterval();
            new Core().loadsRows()
            new Core().updateRowAndFooter()
            const clientNameLabel = $(document).find('#lblClientName');
            clientNameLabel.text(`Cliente: ${Session.val.client[2]}`);
        }
        mode = 0;
    }
});