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
        if(Session && Session.val && Session.val.items) {
            $.each(Session.val.items, function (key, item) {
                if (item && item.scannedInfo) {
                    delete item.scannedInfo;
                }
            });
            Session.Save();
        }
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
                <input class="form-control" type="text" placeholder="Codigo" id="inputItem" autocomplete="off" oninput="this.value = this.value.toUpperCase();">
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
        //$(`.CartList tbody tr#${row} #price input`).maskMoney();
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

        // Validar que cada item tenga al menos un pack con cantidad
        let hasEmptyPacks = false;
        $.each(Session.val.items, function (key, item) {
            if (!item.packs || Object.keys(item.packs).length === 0) {
                hasEmptyPacks = true;
                return false; // break the loop
            }
        });

        if (hasEmptyPacks) {
            Swal.fire({
                title: "!Error Critico¡",
                text: "Hay items sin cantidades seleccionadas",
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
            dataByMotor[1] = "Accounting&Make&pinesjm&additionals=" + JSON.stringify(additionals) + "&old=" + JSON.stringify(oldList) + "&list=" + JSON.stringify(Session.val) + "&uuid=" + new $_SESSION("modePoint").val['uuid'];
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
            case -1:
                return { "Reason": "noFound" };
            case 0:
                return { "Reason": "alreadyCheck" };
            case 1:
                return {
                    "Reason": "found",
                    "total": tempTotal,
                    "packs": packs,
                    "ttspq": packstts,
                    "id": id,
                    "base": base,
                    "dp": depo
                };
            default:
                return { "Reason": "unknownError" };
        }
    }

    updateVerify() {
        let fullyVerifiedCount = 0;
        let totalItems = Object.keys(Session.val.items).length;

        $.each(Session.val.items, function (key, item) {
            if (item.scannedInfo && item.scannedInfo.verified === true) {
                fullyVerifiedCount++;
            }
        });

        $(document).find("#codePassed").html(fullyVerifiedCount + " / " + totalItems);
        if (fullyVerifiedCount === totalItems && totalItems > 0) {
            $(document).find("#finishBuy").prop("disabled", false);
        } else {
            $(document).find("#finishBuy").prop("disabled", true);
        }
    }

    checkIfItemFullyVerified(itemId) {
        let itemData = Session.val.items[itemId];
        if (!itemData.scannedInfo) itemData.scannedInfo = {};
        
        let isComplete = true;
        $.each(itemData.packs, function(vol, reqQty) {
            let scanned = 0;
            if(itemData.scannedInfo[vol]) {
                itemData.scannedInfo[vol].forEach(s => scanned += parseInt(s.qty));
            }
            if(scanned < parseInt(reqQty)) {
                isComplete = false;
            }
        });

        if(isComplete) {
            itemData.scannedInfo.verified = true;
            itemData.scannedInfo.completedAt = new Date().toISOString();
        } else {
            itemData.scannedInfo.verified = false;
            delete itemData.scannedInfo.completedAt;
        }
        Session.Save();
    }

    updateTableCodes() {
        const grid = $(document).find('#verifyGrid');
        grid.empty();

        function itemStatus(item) {
            if (item.scannedInfo && item.scannedInfo.verified === true) return 2;
            if (!item.scannedInfo || !item.packs) return 0;
            let any = false;
            Object.keys(item.packs).forEach(vol => {
                if (item.scannedInfo[vol] && item.scannedInfo[vol].length > 0) any = true;
            });
            return any ? 1 : 0;
        }

        // Sort: pending(0) → partial(1) → verified(2)
        const sorted = Object.entries(Session.val.items).sort(([, a], [, b]) => itemStatus(a) - itemStatus(b));

        sorted.forEach(([key, item]) => {
            const status = itemStatus(item);
            const isVerified = status === 2;
            const isPartial  = status === 1;

            const borderColor = isVerified ? '#86efac' : isPartial ? '#fde68a' : '#d1d5db';
            const bgColor     = isVerified ? '#f0fdf4' : isPartial ? '#fffbeb' : '#f9fafb';

            // Per-pack progress bars (one per pack size)
            let packsHtml = '';
            if (item.packs) {
                Object.entries(item.packs).forEach(([vol, reqQty]) => {
                    let scanned = 0, hasQR = false, hasBar = false;
                    if (item.scannedInfo && item.scannedInfo[vol]) {
                        item.scannedInfo[vol].forEach(s => {
                            scanned += parseInt(s.qty);
                            if (s.type === 'qr') hasQR = true; else hasBar = true;
                        });
                    }
                    const req = parseInt(reqQty);
                    const pct = Math.min(100, Math.round((scanned / req) * 100));
                    const done = scanned >= req;
                    const barColor = done ? '#22c55e' : (scanned > 0 ? '#f59e0b' : '#9ca3af');
                    const icons = (hasQR  ? '<i class="bi bi-qr-code" style="font-size:.85rem;"></i>' : '')
                                + (hasBar ? '<i class="bi bi-upc-scan ms-1" style="font-size:.85rem;"></i>' : '');
                    packsHtml += `
                    <div class="mb-3" style="cursor:pointer;" onclick="new VerifyPass().showScanHistory('${key}','${vol}')" title="Ver historial x${vol}">
                        <div class="d-flex justify-content-between align-items-center mb-1" style="font-size:.95rem;">
                            <span style="color:#64748b;">×${vol} <strong style="color:${done?'#16a34a':'#1e293b'}">${scanned}/${req}</strong></span>
                            <span style="color:#94a3b8;">${icons}</span>
                        </div>
                        <div style="height:11px;background:#e2e8f0;border-radius:6px;overflow:hidden;">
                            <div style="height:100%;width:${pct}%;background:${barColor};border-radius:6px;transition:width .3s;"></div>
                        </div>
                    </div>`;
                });
            }

            const badge = isVerified
                ? `<span style="font-size:.85rem;padding:4px 10px;border-radius:10px;background:#dcfce7;color:#166534;white-space:nowrap;"><i class="bi bi-check-lg"></i> OK</span>`
                : isPartial
                ? `<span style="font-size:.85rem;padding:4px 10px;border-radius:10px;background:#fef3c7;color:#92400e;white-space:nowrap;"><i class="bi bi-hourglass-split"></i> Parcial</span>`
                : `<span style="font-size:.85rem;padding:4px 10px;border-radius:10px;background:#f3f4f6;color:#6b7280;white-space:nowrap;"><i class="bi bi-clock"></i> Pendiente</span>`;

            const revertBtn = isVerified
                ? `<button class="btn btn-outline-secondary w-100 mt-2" style="font-size:.9rem;"
                       onclick="new VerifyPass().removeVerifiedItem('${key}')">
                       <i class="bi bi-arrow-counterclockwise"></i> Revertir
                   </button>` : '';
            const manualBtn = !isVerified
                ? `<button class="btn btn-outline-primary w-100 mt-2" style="font-size:.85rem;"
                       onclick="new VerifyPass().openManualScan('${key}')">
                       <i class="bi bi-upc-scan"></i> Manual
                   </button>` : '';

            const $col = $(`<div class="col-2">
                <div class="h-100 d-flex flex-column p-4" style="background:${bgColor};border:2px solid ${borderColor};border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.09);transition:border .2s,background .2s;">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="fw-bold text-truncate" style="font-size:1.15rem;max-width:65%;color:#1e293b;" title="${item.code}">${item.code}</span>
                        ${badge}
                    </div>
                    <div class="flex-grow-1">${packsHtml}</div>
                    ${revertBtn}${manualBtn}
                </div>
            </div>`);

            grid.append($col);
        });
    }

    showScanHistory(itemKey, packVol) {
        const item = Session.val.items[itemKey];
        if (!item) return;

        const scans  = (item.scannedInfo && item.scannedInfo[packVol]) ? item.scannedInfo[packVol] : [];
        const reqQty = parseInt(item.packs[packVol] || 0);
        let totalScanned = 0;
        scans.forEach(s => totalScanned += parseInt(s.qty));

        let historyHtml = '';
        if (scans.length === 0) {
            historyHtml = `<div class="text-center text-muted py-3"><i class="bi bi-inbox d-block fs-4 mb-2"></i>Sin escaneos aun</div>`;
        } else {
            scans.forEach(scan => {
                const isQR = scan.type === 'qr';
                const timeStr = new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const codeTrunc = scan.code && scan.code.length > 18 ? scan.code.slice(0, 14) + '...' : scan.code;
                const qrBlock = isQR
                    ? `<div class="text-center mt-2"><img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(scan.code)}" style="border:1px solid #e5e7eb;border-radius:4px;" loading="lazy" alt="QR"></div>`
                    : '';
                historyHtml += `
                <div class="p-2 mb-2 rounded" style="background:${isQR?'#eff6ff':'#f9fafb'};border:1px solid ${isQR?'#bfdbfe':'#e5e7eb'};">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold" style="font-size:.78rem;">
                            ${isQR ? '<i class="bi bi-qr-code text-primary me-1"></i>QR' : '<i class="bi bi-upc-scan text-secondary me-1"></i>Barcode'}
                        </span>
                        <small class="text-muted">${timeStr}</small>
                    </div>
                    <div class="mt-1" style="font-size:.72rem;color:#6b7280;">
                        Cant: <strong>${scan.qty}</strong>${scan.buy ? ` &middot; Compra #${scan.buy}` : ''}
                    </div>
                    <div class="mt-1" style="font-size:.68rem;color:#9ca3af;word-break:break-all;">${codeTrunc}</div>
                    ${qrBlock}
                </div>`;
            });
        }

        const doneColor = totalScanned >= reqQty ? '#16a34a' : '#d97706';
        Swal.fire({
            title: `<span style="font-size:.95rem;">${item.code} &middot; Paq. x${packVol}</span>`,
            html: `
                <div class="d-flex justify-content-between px-1 mb-3">
                    <span style="font-size:.8rem;color:#6b7280;">Requerido: <strong>${reqQty}</strong></span>
                    <span style="font-size:.8rem;color:${doneColor};">Escaneado: <strong>${totalScanned}</strong></span>
                </div>
                <div style="max-height:340px;overflow-y:auto;text-align:left;">${historyHtml}</div>`,
            showConfirmButton: false,
            showCloseButton: true,
            width: 340
        });
    }

    removeVerifiedItem(itemId) {
        if (Session.val.items[itemId]) {
            delete Session.val.items[itemId].scannedInfo;
            Session.Save();
        }
        this.updateTableCodes();
        this.updateVerify();
    }

    async openManualScan(itemId) {
        const itemData = Session.val.items[itemId];
        if (!itemData) return;
        if (!itemData.scannedInfo) itemData.scannedInfo = {};
        const inputCode = itemData.code;

        const pendingPacks = [];
        $.each(itemData.packs, function(vol, reqQty) {
            let curr = 0;
            if (itemData.scannedInfo[vol]) itemData.scannedInfo[vol].forEach(s => curr += parseInt(s.qty));
            const rem = parseInt(reqQty) - curr;
            if (rem > 0) pendingPacks.push({ vol, remaining: rem });
        });

        if (pendingPacks.length === 0) {
            Swal.fire('Completado', 'El producto ya tiene todas las cajas verificadas.', 'info');
            return;
        }

        const steppersHtml = pendingPacks.map(p => `
            <div class="d-flex align-items-center justify-content-between mb-2 px-2 py-2 rounded"
                 style="background:#f8fafc;border:1.5px solid #e2e8f0;">
                <div>
                    <div class="fw-bold" style="font-size:.88rem;color:#1e293b;">\xD7${p.vol} pzs</div>
                    <div style="font-size:.7rem;color:#94a3b8;">Faltan: ${p.remaining}</div>
                </div>
                <div class="input-group input-group-sm" style="width:110px;">
                    <button class="btn verifyStepperBtn" type="button" data-action="subtract" data-vol="${p.vol}"
                            style="background:#1e293b;color:#fff;border:none;border-radius:6px 0 0 6px;">
                        <i class="bi bi-dash-lg"></i>
                    </button>
                    <input type="text" id="stepVol_${p.vol}" class="form-control text-center border-0 fw-bold"
                           style="background:#f1f5f9;font-size:.9rem;" value="0" min="0" max="${p.remaining}"
                           oninput="this.value=this.value.replace(/[^0-9]/g,'')">
                    <button class="btn verifyStepperBtn" type="button" data-action="add" data-vol="${p.vol}"
                            style="background:#1e293b;color:#fff;border:none;border-radius:0 6px 6px 0;">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                </div>
            </div>`).join('');

        let _khIdx = 0;
        const kh = function(ev) {
            const inputs = Array.from(document.querySelectorAll('[id^="stepVol_"]'));
            if (!inputs.length) return;
            const fi = _khIdx < inputs.length ? _khIdx : 0;
            if (ev.key === '+' || ev.key === '=') {
                ev.preventDefault();
                const t = inputs[fi];
                t.value = Math.min(parseInt(t.max), (parseInt(t.value) || 0) + 1);
            } else if (ev.key === '-') {
                ev.preventDefault();
                const t = inputs[fi];
                t.value = Math.max(0, (parseInt(t.value) || 0) - 1);
            } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
                ev.preventDefault();
                _khIdx = fi < inputs.length - 1 ? fi + 1 : 0;
                inputs[_khIdx].focus();
            } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
                ev.preventDefault();
                _khIdx = fi > 0 ? fi - 1 : inputs.length - 1;
                inputs[_khIdx].focus();
            }
        };

        const { value: entries } = await Swal.fire({
            title: `<span style="font-size:.95rem;">${inputCode} <span style="color:#94a3b8;font-weight:400;">— Manual</span></span>`,
            html: `<p class="text-muted mb-3" style="font-size:.78rem;">Indica cuántas cajas confirmas físicamente por tamaño</p>
                   <div style="max-height:300px;overflow-y:auto;">${steppersHtml}</div>`,
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            customClass: { confirmButton: 'btn btn-dark btn-sm rounded-pill px-4',
                           cancelButton:  'btn btn-outline-secondary btn-sm rounded-pill px-3' },
            didOpen: () => {
                _khIdx = 0;
                document.querySelectorAll('.verifyStepperBtn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const vol = this.dataset.vol, act = this.dataset.action;
                        const inp = document.getElementById(`stepVol_${vol}`);
                        inp.value = act === 'add' ? Math.min(parseInt(inp.max), (parseInt(inp.value)||0)+1)
                                                  : Math.max(0, (parseInt(inp.value)||0)-1);
                    });
                });
                Array.from(document.querySelectorAll('[id^="stepVol_"]')).forEach((inp, i) => {
                    inp.addEventListener('focus', () => { _khIdx = i; });
                });
                setTimeout(() => { const f = document.querySelector('[id^="stepVol_"]'); if (f) f.focus(); }, 50);
                document.addEventListener('keydown', kh, true);
            },
            willClose: () => { document.removeEventListener('keydown', kh, true); },
            preConfirm: () => {
                const result = []; let valid = true;
                pendingPacks.forEach(p => {
                    const inp = document.getElementById(`stepVol_${p.vol}`);
                    const qty = parseInt(inp.value) || 0;
                    if (qty > p.remaining) { Swal.showValidationMessage(`Máximo ${p.remaining} cajas de \xD7${p.vol}`); valid = false; }
                    if (qty > 0) result.push({ vol: p.vol, qty });
                });
                if (!valid) return false;
                if (result.length === 0) { Swal.showValidationMessage('Ingresa al menos 1 caja en algún paquete'); return false; }
                return result;
            }
        });

        if (entries) {
            const fresh = Session.val.items[itemId];
            if (!fresh.scannedInfo) fresh.scannedInfo = {};
            entries.forEach(e => {
                if (!fresh.scannedInfo[e.vol]) fresh.scannedInfo[e.vol] = [];
                fresh.scannedInfo[e.vol].push({ buy: null, qty: e.qty, code: inputCode, type: 'old_bar', timestamp: Date.now() });
            });
            Session.Save();
            ttsClass.hablar([{ role: 'speak', content: 'Aceptado manual.' }]);
            Swal.fire({ position: 'top-end', icon: 'success', title: 'Aceptado: ' + inputCode,
                        html: `<b>Cajas:</b> ${entries.map(e => `${e.qty}\xD7${e.vol}`).join(', ')}`,
                        showConfirmButton: false, timer: 1500, toast: true, backdrop: false });
            new VerifyPass().checkIfItemFullyVerified(itemId);
            new VerifyPass().updateTableCodes();
            new VerifyPass().updateVerify();
        }
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
    const CoreFunc = new Core();
    $(document).find('#sidebar').css('z-index', '1090');

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
    // Autocomplete / search suggestions for inputItem (like Providers codes)
    // track fast key intervals to detect barcode scanners
    $(document).on('keydown', '#inputItem', function (e) {
        const now = Date.now();
        window._pointKeyTimes = window._pointKeyTimes || [];
        window._pointKeyTimes.push(now);
        if (window._pointKeyTimes.length > 12) window._pointKeyTimes.shift();
        if (window._pointKeyTimes.length > 1) {
            const diffs = [];
            for (let i = 1; i < window._pointKeyTimes.length; i++) diffs.push(window._pointKeyTimes[i] - window._pointKeyTimes[i-1]);
            const avg = diffs.reduce((a,b)=>a+b,0)/diffs.length;
            // if average keystroke interval is very small, treat as scanner
            window._pointForceSearch = avg < 45;
        }
    });

    $(document).on('input', '#inputItem', function (e) {
        const $input = $(this);
        window._lastPointInput = $input; // store for later when clicking result
        const term = $input.val().toUpperCase();

        // clear previous timer
        if (window._pointSearchTimer) {
            clearTimeout(window._pointSearchTimer);
            window._pointSearchTimer = null;
        }

        $('.item-search-results').remove();

        // don't search for very short terms
        if (!term || term.length < 2) {
            return;
        }

        // debounce network calls to avoid race when typing fast (scanner)
        var delay = window._pointForceSearch ? 60 : 180;
        window._pointSearchTimer = setTimeout(function () {
            // abort previous in-flight search to avoid duplicate boxes/race
            try { if (window._pointSearchXhr && window._pointSearchXhr.readyState && window._pointSearchXhr.readyState !== 4) window._pointSearchXhr.abort(); } catch(e){}
            window._pointSearchXhr = $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "DataBase&SearchItems&term=" + encodeURIComponent(term),
                success: function (data) {
                    // clear ref to finished request
                    window._pointSearchXhr = null;
                    // ensure only one results container
                    $('.item-search-results').remove();
                    var results = [];
                    try { results = JSON.parse(data); } catch (e) { results = []; }

                    var $results = $('<div class="list-group position-absolute item-search-results shadow-lg" style="z-index:3000;background:#fff;border:1px solid #e9ecef;border-radius:6px;max-height:240px;overflow-y:auto;padding:0"></div>');

                    if (results.length > 0) {
                        results.forEach(function (item) {
                            var $btn = $('<button type="button" class="list-group-item list-group-item-action item-result-point" data-id="' + item.id + '" data-name="' + item.name + '"><div class="fw-bold">' + item.id + '</div><div class="text-truncate small">' + item.name + '</div></button>');
                            $results.append($btn);
                        });
                    } else {
                        $results.append('<div class="list-group-item text-muted small">No se encontraron items</div>');
                    }

                    // append and position
                    $('body').append($results);
                    const off = $input.offset();
                    $results.css({ top: off.top + $input.outerHeight(), left: off.left, width: $input.outerWidth() });
                },
                error: function(xhr, status, err) {
                    // ignore abort errors silently
                    if (status !== 'abort') console.error('Search items error', err);
                    window._pointSearchXhr = null;
                }
            });
        }, delay);
    });

    // when regaining focus, rebuild suggestions if there is a valid term
    $(document).on('focus', '#inputItem', function () {
        const $input = $(this);
        const term = ($input.val() || '').toUpperCase();
        if (term && term.length >= 3) {
            // trigger the same debounced search flow
            $input.trigger('input');
        }
    });

    // click on suggestion: set input, mark selectedItem and trigger change
    $(document).on('click', '.item-result-point', function (e) {
        e.preventDefault();
        const code = $(this).data('id');
        const name = $(this).data('name');
        $('.item-search-results').remove();

        const $input = $(window._lastPointInput || document.activeElement);
        if ($input && $input.length) {
            $input.data('selectedItem', { id: code, name: name });
            $input.val(code);
            $input.trigger('change');
        }
    });

    // keyboard navigation for suggestions (arrows + enter)
    $(document).on('keydown', '#inputItem', function (e) {
        const $results = $('.item-search-results');
        if ($results.length === 0) return;

        const KEY = e.which || e.keyCode;
        // down or up
        if (KEY === 40 || KEY === 38) {
            e.preventDefault();
            let $current = $results.find('.item-result-point.active');
            if ($current.length === 0) {
                $current = (KEY === 40) ? $results.find('.item-result-point').first() : $results.find('.item-result-point').last();
                $current.addClass('active').siblings().removeClass('active');
                return;
            }

            const $next = (KEY === 40) ? $current.nextAll('.item-result-point').first() : $current.prevAll('.item-result-point').first();
            if ($next.length) {
                $current.removeClass('active');
                $next.addClass('active');
                const top = $next.position().top;
                $results.scrollTop($results.scrollTop() + top - 20);
            }
            return;
        }

        // enter -> if only one result, select it; else require an active selection
        if (KEY === 13) {
            const $all = $results.find('.item-result-point');
            let $sel = $results.find('.item-result-point.active').first();
            if ($all.length === 1) {
                $sel = $all.first();
            }
            if ($sel && $sel.length) {
                e.preventDefault();
                $sel.trigger('click');
            }
        }
    });

    // click outside to close suggestions
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.item-search-results, #inputItem').length) {
            $('.item-search-results').remove();
        }
    });

    // Note: all verification logic lives inside the change handler below.

    // central change handler: all verification and swal logic centralised here
    $(document).on('change', '#inputItem', async function (e) {
        const inp = $(this);

        // prevent re-entrancy
        if (inp.data('processing')) return;
        inp.data('processing', true);

        let selected = inp.data('selectedItem');

        // If no selectedItem, but there's exactly one search result visible, auto-select it
        if (!selected || !selected.id) {
            const $results = $('.item-search-results');
            if ($results.length) {
                const $items = $results.find('.item-result-point');
                if ($items.length === 1) {
                    const $it = $items.first();
                    const id = $it.data('id');
                    const name = $it.data('name');
                    inp.data('selectedItem', { id: id, name: name });
                    inp.val(id);
                    selected = inp.data('selectedItem');
                }
            }
        }

        // remove suggestion overlay (and cancel any pending search request)
        $('.item-search-results').remove();
        try { if (window._pointSearchXhr && window._pointSearchXhr.readyState && window._pointSearchXhr.readyState !== 4) window._pointSearchXhr.abort(); } catch(e){}

        // reuse variables from previous implementation
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



            // if no selection resolved and there are multiple results, stop here gracefully
            if (!selected || !selected.id) {
                inp.data('processing', false);
                if ((inp.val() || '').length >= 3) {
                    // rebuild suggestions
                    inp.trigger('input');
                }
                return;
            }

            let imgUrl = '';
            try { imgUrl = await new VerifyPass().getImage(selected.id); } catch (err) { imgUrl = './resc/img/No-Image-Placeholder.png'; }

            // Mejor diseño: modal más limpio, imagen grande, info clara, colores neutros y botones grandes
            // guard: close any previous swal to avoid stale popups
            try { if (Swal.isVisible()) { Swal.close(); } } catch(e){}
            // create a unique token for this cycle to ignore stale confirms
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

            // ignore if a new cycle started while this swal was open
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


            // perform verify AJAX (same body as previous performVerify)
            $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "Storage&Items&VerifyItem&id=" + inp.val() + "&list=" + JSON.stringify(list) + "&userid=" + Session.val.client[0],
                cache: false,
                success: function (data) {
                    const i = JSON.parse(data);
                    if (i[0] == false) {
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
                    }

                    const j = JSON.parse(i[5]) ?? [];
                    console.log(j)

                    if (j.length != 0) {
                        j.unshift("Usar el mismo codigo")
                        Swal.fire({
                            title: 'Ups este Producto Tiene Otra Alternativas',
                            input: 'select',
                            inputOptions: j,
                            inputPlaceholder: 'Seleccione una Alternativa',
                            showCancelButton: true,
                            cancelButtonText: 'Cancelar',
                            inputValidator: (value) => {
                                return new Promise((resolve) => {
                                    if (value === '' || value.length === 0) {
                                        resolve(value);
                                    } else {
                                        resolve(false);
                                    }
                                });
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                inp.val(j[result.value]);
                                inp.trigger("change");
                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                inp.attr('disabled', true);
                                cont.find('h1').text(inp.val())
                                cont.find('#price input').val(i[2])

                                cont.find('#deleteRow,#selectOrigin').attr('hidden', false);
                                cont.find('#selectOrigin').html(CoreFunc.loadDeposit(i[1]));
                                cont.find('input#item_discount').val(i[3]);
                                cont.find('input#item_discountP').prop("checked", i[4]);
                                if (i[1].length === 1) {
                                    const rowId = cont.attr('id');
                                    cont.find('#selectOrigin').val(i[1][0][0]).attr('disabled', true);
                                    cont.find('#itemDisc').attr('hidden', false);
                                    Session.val.items[rowId] = {
                                        'code': inp.val(),
                                        'depo': i[1][0][0],
                                        'packs': {},
                                        'price': cont.find('#price input').val(),
                                        'discount': [cont.find('input#item_discount').val(), cont.find('input#item_discountP').is(':checked')]
                                    };
                                    Session.Save();
                                    CoreFunc.loadPackets(rowId);
                                    CoreFunc.newRow();
                                    if (Object.keys(Session.val.items).length) $('#clearList').attr('disabled', false);
                                    $('.buyBtn').attr('disabled', true);
                                    $('.buyBtn i').attr('class', 'bi bi-send-slash h4');
                                } else {
                                    cont.find('#selectOrigin').focus();
                                }
                                return;
                            }
                        });
                    } else {
                        if (i[0] == true) {
                            inp.attr('disabled', true);
                            cont.find('h1').text(inp.val())
                            cont.find('#price input').val(i[2])

                            cont.find('#deleteRow,#selectOrigin').attr('hidden', false);
                            cont.find('#selectOrigin').html(CoreFunc.loadDeposit(i[1]));
                            cont.find('input#item_discount').val(i[3]);
                            cont.find('input#item_discountP').prop("checked", i[4]);
                            if (i[1].length === 1) {
                                const rowId = cont.attr('id');
                                cont.find('#selectOrigin').val(i[1][0][0]).attr('disabled', true);
                                cont.find('#itemDisc').attr('hidden', false);
                                Session.val.items[rowId] = {
                                    'code': inp.val(),
                                    'depo': i[1][0][0],
                                    'packs': {},
                                    'price': cont.find('#price input').val(),
                                    'discount': [cont.find('input#item_discount').val(), cont.find('input#item_discountP').is(':checked')]
                                };
                                Session.Save();
                                CoreFunc.loadPackets(rowId);
                                CoreFunc.newRow();
                                if (Object.keys(Session.val.items).length) $('#clearList').attr('disabled', false);
                                $('.buyBtn').attr('disabled', true);
                                $('.buyBtn i').attr('class', 'bi bi-send-slash h4');
                            } else {
                                cont.find('#selectOrigin').focus();
                            }
                            return;
                        }
                    }
                },
                error: function (xhr, status, error) {
                    Swal.fire({
                        title: "Operaccion Errada",
                        html: error,
                        icon: "error"
                    });
                    inp.data('processing', false);
                }
            });
            // ensure processing flag cleared once ajax handled in success path above; for safety set timeout
            setTimeout(function(){ inp.data('processing', false); }, 1200);
        }
    });

    $(document).on('click', 'label[for="dateCredit"]', function () {
        const today = new Date();
        today.setDate(today.getDate() + 1);

        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Enero es 0!
        const yyyy = today.getFullYear();

        const currentDate = yyyy + '-' + mm + '-' + dd;

        $(this).parent().find('input#dateCredit')[0].setAttribute('min', currentDate);
        $(this).parent().find('input#dateCredit')[0].showPicker();
    });

    $(document).on('change', 'input#dateCredit', function () {
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
            } else if (motor == "pinesjm" && $(document).find('input#JMcredit').val() == "") {
                new messageTemp('Pines Jm', 'Rellene Todas Las Casillas', 'info');
                return;
            }
            start_Reset.clearVerifyItems();
            new VerifyPass().updateTableCodes();

            cont.closest('.modal-dialog').addClass('modal-fullscreen').removeClass('modal-xl');

            btns.find("#backToMain").prop("hidden", false);
            cont.find("#verifyList").removeClass("d-none").addClass("d-flex");
            cont.find("#main").prop("hidden", true);
            cont.find("#codePassed").html("0 / " + Object.keys(Session.val.items).length);
            
            // Scroll to top and focus
            $('.modal').animate({ scrollTop: 0 }, 'fast');
            setTimeout(() => cont.find('#codeV').focus(), 100);

            $(document).find("#finishBuy").prop("disabled", true);


            cont.find("#codeV").focus();
            $(this).attr("step", 1);
            $(this).find("span").text("Finalizar");
            $('#sidebar').css('z-index', 40);
        } else if ($(this).attr("step") == 1) {
            start_Reset.stopInterval();
            CoreFunc.completeBuy();
            $(document).find('#sidebar').css('z-index', '1090');
        }
    });

    $(document).on('click', "#backToMain", function () {
        $('#sidebar').css('z-index', '1090');
        ttsClass.detener();
        start_Reset.clearVerifyItems();
        const btns = $(this).parent();
        const cont = $(this).parent().parent();
        btns.find("#finishBuy").attr("step", 0);
        btns.find("#finishBuy span").text("Siguiente");
        btns.find("#finishBuy").prop("disabled", false);

        btns.find("#backToMain").prop("hidden", true);
        cont.find("#main").prop("hidden", false);
        cont.find("#verifyList").addClass("d-none").removeClass("d-flex");
        cont.closest('.modal-dialog').removeClass('modal-fullscreen').addClass('modal-xl');
    });

    // ── Unified verify scanner ──────────────────────────────────────────────────
    // Handles barcode/QR scanner (auto-timeout 400ms) + manual SKIP+Enter.
    // No detectInputType, no listener accumulation.
    var _verifyCallbackRunning = false;
    var _verifyTimer = null;

    var _verifyCallback = async function(inputCode) {
        if (_verifyCallbackRunning) return;
        _verifyCallbackRunning = true;
        var item = $('#codeV');
        try {
            if (inputCode.trim().toUpperCase() === 'SKIP') {
                item.val("");
                $.each(Session.val.items, function(itemId, itemData) {
                    if (itemData.scannedInfo && itemData.scannedInfo.verified === true) return;
                    if (!itemData.scannedInfo) itemData.scannedInfo = {};
                    $.each(itemData.packs, function(vol, reqQty) {
                        let currentScanned = 0;
                        if (itemData.scannedInfo[vol]) {
                            itemData.scannedInfo[vol].forEach(s => currentScanned += parseInt(s.qty));
                        }
                        const remaining = parseInt(reqQty) - currentScanned;
                        if (remaining > 0) {
                            if (!itemData.scannedInfo[vol]) itemData.scannedInfo[vol] = [];
                            itemData.scannedInfo[vol].push({
                                buy: null,
                                qty: remaining,
                                code: 'SKIP',
                                type: 'old_bar',
                                timestamp: Date.now()
                            });
                        }
                    });
                    itemData.scannedInfo.verified = true;
                    itemData.scannedInfo.completedAt = new Date().toISOString();
                });
                Session.Save();
                new VerifyPass().updateTableCodes();
                new VerifyPass().updateVerify();
                ttsClass.hablar([{ role: 'speak', content: 'Verificación omitida. Todos los productos marcados.' }]);
                return;
            }

            let codeToSearch = inputCode;
            let qrAmount = null;
            let isQR = false;
            let qrDataId = null;
            let qrBuyNum = null;

            if (inputCode.length > 30) {
                isQR = true;
                try {
                    Swal.fire({
                        title: 'Verificando Código QR...',
                        allowOutsideClick: false,
                        didOpen: () => { Swal.showLoading(); }
                    });
                    
                    const response = await fetch(urlAPI + "label/verify", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + apiKey
                        },
                        body: JSON.stringify({ "token": inputCode })
                    });
                    
                    const data = await response.json();
                    if (data && data.id) {
                        codeToSearch = data.id;
                        qrDataId = data.id;
                        qrAmount = data.amount;
                        qrBuyNum = data.purchase_number || null;
                    } else {
                        throw new Error("Invalid Token");
                    }
                } catch (error) {
                    Swal.fire('Error', 'QR inválido o irreconocible', 'error');
                    item.val("");
                    return;
                }
            }

            const checkCode = await new VerifyPass().itemExist(codeToSearch);

            if (checkCode.Reason === "noExist" || checkCode.Reason === "noFound") {
                if (isQR) Swal.close();
                ttsClass.hablar([{ "role": "speak", "content": `El código ${codeToSearch}, no se encuentra en la lista` }]);
                item.val("");
            } else if (checkCode.Reason === "alreadyCheck") {
                if (isQR) Swal.close();
                ttsClass.hablar([{ "role": "speak", "content": `El código ${codeToSearch}, ya está verificado` }]);
                item.val("");
            } else if (checkCode.Reason === "found") {
                const itemId = checkCode.id;
                const itemData = Session.val.items[itemId];
                if (!itemData.scannedInfo) itemData.scannedInfo = {};
                
                if (isQR) {
                    if (!itemData.packs[qrAmount]) {
                        Swal.fire('Error', 'Este paquete de ' + qrAmount + ' no fue solicitado.', 'error');
                        ttsClass.hablar([{ role: "speak", content: "Denegado. Paquete no requerido." }]);
                        item.val("");
                        return;
                    }

                    let maxAllowed = parseInt(itemData.packs[qrAmount] || 0);
                    let currentScanned = 0;
                    if (itemData.scannedInfo[qrAmount]) {
                        itemData.scannedInfo[qrAmount].forEach(s => currentScanned += parseInt(s.qty));
                    }

                    if (currentScanned + 1 > maxAllowed) {
                        Swal.fire('Denegado', 'Ya escaneaste todos los paquetes requeridos de ' + qrAmount + '.', 'error');
                        ttsClass.hablar([{ role: "speak", content: "Denegado. Paquetes excedidos." }]);
                        item.val("");
                        return;
                    }

                    const tokenDuplicate = itemData.scannedInfo[qrAmount] &&
                        itemData.scannedInfo[qrAmount].some(s => s.code === inputCode);
                    if (tokenDuplicate) {
                        Swal.fire('Duplicado', 'Este código QR ya fue registrado anteriormente.', 'warning');
                        ttsClass.hablar([{ role: "speak", content: "Código QR duplicado." }]);
                        item.val("");
                        return;
                    }

                    if (!itemData.scannedInfo[qrAmount]) itemData.scannedInfo[qrAmount] = [];
                    itemData.scannedInfo[qrAmount].push({
                        buy: qrBuyNum,
                        qty: 1,
                        code: inputCode,
                        type: "qr",
                        timestamp: Date.now()
                    });

                    item.val("");
                    ttsClass.hablar([{ "role": "speak", "content": "Paquete QR Aceptado." }]);
                    Swal.fire({
                        position: 'top-end', icon: 'success', title: 'Aceptado: ' + codeToSearch,
                        html: `<b>Caja:</b> ${qrAmount}`,
                        showConfirmButton: false, timer: 1500, toast: true, backdrop: false
                    });

                    new VerifyPass().checkIfItemFullyVerified(itemId);
                    new VerifyPass().updateTableCodes();
                    new VerifyPass().updateVerify();

                    const cardTarget = $(document).find(`h6[title="${codeToSearch}"]`).closest('.card');
                    if (cardTarget.length) {
                        const gridCont = $(document).find('#verifyGrid').parent();
                        gridCont.animate({ scrollTop: gridCont.scrollTop() + cardTarget.position().top - 20 }, 300);
                    }

                } else {
                    // OLD BARCODE — stepper por paquete
                    const pendingPacks = [];
                    $.each(itemData.packs, function(vol, reqQty) {
                        let currScanned = 0;
                        if (itemData.scannedInfo[vol]) {
                            itemData.scannedInfo[vol].forEach(s => currScanned += parseInt(s.qty));
                        }
                        const remaining = parseInt(reqQty) - currScanned;
                        if (remaining > 0) pendingPacks.push({ vol, remaining });
                    });

                    if (pendingPacks.length === 0) {
                        Swal.fire('Completado', 'El producto ya tiene todas las cajas verificadas.', 'info');
                        item.val("");
                        setTimeout(() => item.focus(), 300);
                        return;
                    }

                    item.val("");

                    let _sshIdx = 0;
                    const _swalStepperKeyHandler = function(ev) {
                        const inputs = Array.from(document.querySelectorAll('[id^="stepVol_"]'));
                        if (!inputs.length) return;
                        const fi = _sshIdx < inputs.length ? _sshIdx : 0;
                        if (ev.key === '+' || ev.key === '=') {
                            ev.preventDefault();
                            inputs[fi].value = Math.min(parseInt(inputs[fi].max), (parseInt(inputs[fi].value) || 0) + 1);
                        } else if (ev.key === '-') {
                            ev.preventDefault();
                            inputs[fi].value = Math.max(0, (parseInt(inputs[fi].value) || 0) - 1);
                        } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
                            ev.preventDefault();
                            _sshIdx = fi < inputs.length - 1 ? fi + 1 : 0;
                            inputs[_sshIdx].focus();
                        } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
                            ev.preventDefault();
                            _sshIdx = fi > 0 ? fi - 1 : inputs.length - 1;
                            inputs[_sshIdx].focus();
                        }
                    };

                    let steppersHtml = pendingPacks.map(p => `
                        <div class="d-flex align-items-center justify-content-between mb-2 px-2 py-2 rounded"
                             style="background:#f8fafc;border:1.5px solid #e2e8f0;">
                            <div>
                                <div class="fw-bold" style="font-size:.88rem;color:#1e293b;">\xD7${p.vol} pzs</div>
                                <div style="font-size:.7rem;color:#94a3b8;">Faltan: ${p.remaining}</div>
                            </div>
                            <div class="input-group input-group-sm" style="width:110px;">
                                <button class="btn verifyStepperBtn" type="button"
                                        data-action="subtract" data-vol="${p.vol}"
                                        style="background:#1e293b;color:#fff;border:none;border-radius:6px 0 0 6px;">
                                    <i class="bi bi-dash-lg"></i>
                                </button>
                                <input type="text" id="stepVol_${p.vol}"
                                       class="form-control text-center border-0 fw-bold"
                                       style="background:#f1f5f9;font-size:.9rem;"
                                       value="0" min="0" max="${p.remaining}"
                                       oninput="this.value=this.value.replace(/[^0-9]/g,'')">
                                <button class="btn verifyStepperBtn" type="button"
                                        data-action="add" data-vol="${p.vol}"
                                        style="background:#1e293b;color:#fff;border:none;border-radius:0 6px 6px 0;">
                                    <i class="bi bi-plus-lg"></i>
                                </button>
                            </div>
                        </div>`).join('');

                    const { value: entries } = await Swal.fire({
                        title: `<span style="font-size:.95rem;">${codeToSearch} <span style="color:#94a3b8;font-weight:400;">— Barcode</span></span>`,
                        html: `
                            <p class="text-muted mb-3" style="font-size:.78rem;">Indica cuántas cajas confirmas físicamente por tamaño</p>
                            <div style="max-height:300px;overflow-y:auto;">${steppersHtml}</div>`,
                        showCancelButton: true,
                        confirmButtonText: "Confirmar",
                        cancelButtonText: "Cancelar",
                        customClass: { confirmButton: 'btn btn-dark btn-sm rounded-pill px-4',
                                       cancelButton:  'btn btn-outline-secondary btn-sm rounded-pill px-3' },
                        didOpen: () => {
                            _sshIdx = 0;
                            document.querySelectorAll('.verifyStepperBtn').forEach(btn => {
                                btn.addEventListener('click', function() {
                                    const vol  = this.dataset.vol;
                                    const act  = this.dataset.action;
                                    const inp  = document.getElementById(`stepVol_${vol}`);
                                    const max  = parseInt(inp.max);
                                    let   val  = parseInt(inp.value) || 0;
                                    inp.value  = act === 'add' ? Math.min(max, val + 1) : Math.max(0, val - 1);
                                });
                            });
                            Array.from(document.querySelectorAll('[id^="stepVol_"]')).forEach((inp, i) => {
                                inp.addEventListener('focus', () => { _sshIdx = i; });
                            });
                            setTimeout(() => { const f = document.querySelector('[id^="stepVol_"]'); if (f) f.focus(); }, 50);
                            document.addEventListener('keydown', _swalStepperKeyHandler, true);
                        },
                        willClose: () => { document.removeEventListener('keydown', _swalStepperKeyHandler, true); },
                        preConfirm: () => {
                            const result = [];
                            let valid = true;
                            pendingPacks.forEach(p => {
                                const inp = document.getElementById(`stepVol_${p.vol}`);
                                const qty = parseInt(inp.value) || 0;
                                if (qty > p.remaining) {
                                    Swal.showValidationMessage(`Máximo ${p.remaining} cajas de \xD7${p.vol}`);
                                    valid = false;
                                }
                                if (qty > 0) result.push({ vol: p.vol, qty });
                            });
                            if (!valid) return false;
                            if (result.length === 0) {
                                Swal.showValidationMessage('Ingresa al menos 1 caja en algún paquete');
                                return false;
                            }
                            return result;
                        }
                    });

                    if (entries) {
                        const freshItemData = Session.val.items[itemId];
                        if (!freshItemData.scannedInfo) freshItemData.scannedInfo = {};
                        entries.forEach(e => {
                            if (!freshItemData.scannedInfo[e.vol]) freshItemData.scannedInfo[e.vol] = [];
                            freshItemData.scannedInfo[e.vol].push({
                                buy: null,
                                qty: e.qty,
                                code: inputCode,
                                type: "old_bar",
                                timestamp: Date.now()
                            });
                        });
                        Session.Save();

                        item.val("");
                        ttsClass.hablar([{ role: "speak", content: "Aceptado manual." }]);
                        const summary = entries.map(e => `${e.qty}\xD7${e.vol}`).join(', ');
                        Swal.fire({
                            position: 'top-end', icon: 'success', title: 'Aceptado: ' + codeToSearch,
                            html: `<b>Cajas:</b> ${summary}`,
                            showConfirmButton: false, timer: 1500, toast: true, backdrop: false
                        });

                        new VerifyPass().checkIfItemFullyVerified(itemId);
                        new VerifyPass().updateTableCodes();
                        new VerifyPass().updateVerify();
                        setTimeout(() => item.focus(), 200);
                    } else {
                        item.val("");
                        setTimeout(() => item.focus(), 200);
                    }
                }
            }
        } finally {
            _verifyCallbackRunning = false;
        }
    };

    $(document).on('keydown.verifyScanner', function(e) {
        if (!$('#modal').hasClass('show') || $('#verifyList').hasClass('d-none')) return;
        if (typeof Swal !== 'undefined' && Swal.isVisible() && !document.querySelector('.swal2-toast')) return;

        var codeV = document.getElementById('codeV');
        if (!codeV) return;

        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(_verifyTimer);
            var val = (codeV.value || '').trim().toUpperCase();
            codeV.value = '';
            if (val) _verifyCallback(val);
            return;
        }

        if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;

        if (document.activeElement !== codeV) {
            e.preventDefault();
            codeV.focus();
            codeV.value += e.key.toUpperCase();
            clearTimeout(_verifyTimer);
            _verifyTimer = setTimeout(function() {
                var val = (codeV.value || '').trim().toUpperCase();
                if (val && val !== 'SKIP') {
                    codeV.value = '';
                    _verifyCallback(val);
                }
            }, 400);
        }
    });






    $(document).on('hidden.bs.modal', '#modal', function() {
        clearTimeout(_verifyTimer);
        _verifyTimer = null;
        _verifyCallbackRunning = false;
        const finishBtn = $(document).find('#finishBuy');
        if (finishBtn.attr('step') == 1) {
            finishBtn.attr('step', 0).prop('disabled', false).find('span').text('Siguiente');
            $(document).find('#backToMain').prop('hidden', true);
            $(document).find('#verifyList').addClass('d-none').removeClass('d-flex');
            $(document).find('#main').prop('hidden', false);
            $(document).find('.modal-dialog').removeClass('modal-fullscreen').addClass('modal-xl');
            $('#sidebar').css('z-index', '1090');
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
