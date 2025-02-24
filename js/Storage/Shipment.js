var row = 1;
var listShip = {};


class Core {
    newRow() {
        $('.ShipmentList tbody').append(`
        <tr id="${row}">
            <th class="col-1" scope="col">
                <button type="button" class="btn btn-dark" id="deleteRow" hidden><i class="bi bi-trash"></i></button>  
                ${row}
            </th>
            <td class="col-2" scope="col">
                <h1 hidden></h1>
                <input class="form-control" type="text" placeholder="Codigo" id="inputItem" oninput="this.value = this.value.toUpperCase();">
            </td>
            <td class="col-2" scope="col">
                <select class="form-select" id="selectOrigin" hidden>
                </select>
            </td>
            <td class="col-1" scope="col">
                <button type="button" class="btn btn-dark w-100" modal-data-locate="Ship&Packs&row=${row}" id="modalBtn" hidden><i class="bi bi-box"></i></button>
            </td>
            <td class="col-2" scope="col">
                <select class="form-select" id="selectDestiny" hidden>
                </select>
            </td>
            <td class="col-4" scope="col" id="total">
                <p class="h5"></p>

            </td>
        </tr>
        `);
        row++;
    }
    deposit(Operation, n) {
        var deposit = '<option value="" hidden selected>Depositos</option>';

        switch (Operation) {
            case 'Origin':
                for (let i = 1; i <= 4; i++) {
                    if (!n.includes(i)) {
                        continue;
                    }
                    deposit += '<option value="' + i + '">Deposito ' + i + '</option>';
                }
                return deposit
            case 'Destiny':
                for (let i = 1; i <= 4; i++) {
                    if (n == Number(i)) {
                        continue;
                    }
                    deposit += '<option value="' + i + '">Deposito ' + i + '</option>';
                }
                return deposit
        }


    }
    verify() {
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Storage&Ship&VerifyPacketsAndItem&list=" + JSON.stringify(listShip),
            cache: false,
            success: function (data) {
                const result = JSON.parse(data);
                if (Object.keys(result['error'].length) != 0) {
                    new modalPinesJM().create('ShowErrors&Ship&logs=' + JSON.stringify(result['error']));
                }
            }
        });
    }
    sendverify() {
        if (listShip && Object.keys(listShip).length === 0) {
            $('#Shipment').attr('disabled', true);
            $('#Shipment i').attr('class', "bi bi-send-slash h4");
            $('#clearList').attr('disabled', true);
            return;
        }
        $('#clearList').attr('disabled', false);
        $.each(listShip, function (key, value) {
            if (value['depoTo'] == '' || value['packs'] && Object.keys(value['packs']).length === 0) {
                $('#Shipment').attr('disabled', true);
                $('#Shipment i').attr('class', "bi bi-send-slash h4");
                return true;
            }
            $('#Shipment').attr('disabled', false);
            $('#Shipment i').attr('class', "bi bi-send-check h4");
        });
    }
    update() {
        var temptotal = 0;
        $.each(listShip, function (key, value) {
            if (value['packs'] && Object.keys(value['packs']).length !== 0) {
                $.each(value['packs'], function (pack, num) {
                    temptotal += pack * num;
                });
            }
        });
        $('#lblItemsTotal').text('Total Items: ' + Object.keys(listShip).length);
        $('#lblQuantitySend').text('Cantidad a Enviar: ' + temptotal);
    }
}

$(document).ready(function () {
    const CoreFunc = new Core();
    CoreFunc.newRow();
    CoreFunc.update();

    $(document).on('change', '#inputItem', function () {
        const inp = $(this);
        const cont = inp.parent().parent();
        var list = [];
        if (inp.val() != '') {
            $.each(listShip, function (key, value) {
                if (value['code'] == inp.val()) {
                    list.push(value['depo']);
                }
            });
            $.ajax({
                type: "POST",
                url: "api/code-obtain.php",
                data: "Storage&Ship&VerifyItem&id=" + inp.val() + "&list=" + JSON.stringify(list),
                cache: false,
                success: function (data) {
                    const i = JSON.parse(data);
                    if (i[0] == true) {
                        inp.attr('disabled', true);
                        cont.find('h1').text(inp.val())
                        cont.find('#deleteRow,#selectOrigin').attr('hidden', false);
                        cont.find('#selectOrigin').html(CoreFunc.deposit('Origin', i[1]));
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

                }
            });
        }
    });
    $(document).on('click', '#deleteRow', function () {
        if (!$(this).parent().parent().find("#selectOrigin option:selected").val()) {
            $(this).parent().parent().find('#deleteRow,#selectOrigin').attr('hidden', true);
            $(this).parent().parent().find('#inputItem').val('');
            $(this).parent().parent().find('#selectOrigin').html('');
            $(this).parent().parent().find('#inputItem').attr('disabled', false);
            $(this).parent().parent().find('h1').text('')
            return;
        }
        delete listShip[$(this).parent().parent().attr('id')];
        $(this).parent().parent().remove();
        CoreFunc.sendverify();
        CoreFunc.update();

    });
    $(document).on('change', "#selectOrigin", function () {
        const cont = $(this).parent().parent();
        CoreFunc.newRow();
        $(this).attr('disabled', true);
        listShip[cont.attr('id')] = { 'code': cont.find('#inputItem').val(), 'depo': cont.find("#selectOrigin option:selected").val(), 'depoTo': '', 'packs': {} };
        cont.find('#selectDestiny,#modalBtn').attr('hidden', false);
        cont.find('#selectDestiny').html(CoreFunc.deposit('Destiny', cont.find("#selectOrigin option:selected").val()));
        cont.find('#modalBtn').attr('modal-data-locate', cont.find('#modalBtn').attr('modal-data-locate') + '&id=' + cont.find('#inputItem').val() + '&depo=' + cont.find("#selectOrigin option:selected").val());
        CoreFunc.sendverify();
        CoreFunc.update();
    });
    $(document).on('change', "#selectDestiny", function () {
        const cont = $(this).parent().parent();
        listShip[cont.attr('id')]['depoTo'] = cont.find("#selectDestiny option:selected").val();
        CoreFunc.sendverify();
    });
    $(document).on('click', '#operationsPackets button', function () {
        var cont = $(this).parent();
        var num = ($(this).attr('data-operation') == "1") ? +1 : -1;
        if ((Number(cont.find("#amountPackets").val()) + num) > Number(cont.find("#amountPackets").attr('maxinp')) || (Number(cont.find("#amountPackets").val()) + num) < 0) {
            return;
        }
        cont.find("#amountPackets").val(Number(cont.find("#amountPackets").val()) + num);

    });
    $(document).on('change', "#amountPackets", function () {
        if (Number($(this).val()) > Number($(this).attr('maxinp'))) {
            $(this).val(Number($(this).attr('maxinp')));
            return;
        } else if (Number($(this).val()) < 0) {
            $(this).val(0);
            return;
        }
    });
    $(document).on('click', '#savePackets', function () {
        var btn = $(this);
        $(".PacketList tbody tr").each(function () {
            if ($(this).find("#amountPackets").val() != 0 && $(this).find("#amountPackets").val() != '') {
                listShip[btn.attr('data-row')]['packs'][String($(this).attr('id')).replace('Pack', '')] = $(this).find("#amountPackets").val();
            }
        });
        $('#' + btn.attr('data-row') + " p").text(JSON.stringify(listShip[btn.attr('data-row')]['packs']));
        CoreFunc.sendverify();
        CoreFunc.update();
    });
    $(document).on("keyup", "#qinput", function () {
        var value = $(this).val().toLowerCase();
        $(document).find(".ShipmentList tbody tr").filter(function () {
            var rowText = $(this).find("td h1").text().toLowerCase();
            if (rowText === "") { // <--- Add this check
                return true; // Keep the row visible if h1 is empty
            }
            $(this).toggle(rowText.indexOf(value) > -1);
        });
    });
    $(document).on('click', '#Shipment', function () {
        var TimerShip;
        var TimerShipNum = -1;
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Storage&Ship&VerifyPacketsAndItem&list=" + JSON.stringify(listShip),
            cache: false,
            success: function (data) {
                const resultVerify = JSON.parse(data);
                if (resultVerify['error'].length != 0) {
                    new modalPinesJM().create('Ship&ShowErrors&logs=' + data);
                    return;
                }
                const TempList = listShip;
                listShip = {};
                CoreFunc.sendverify();
                CoreFunc.update();
                $.ajax({
                    beforeSend: function () {
                        Swal.fire({
                            html: '<img src="resc/img/ship.gif" class="object-fit-cover rounded-2 w-100 mb-2"><span id="SeddingLabel">Enviando</span></div>',
                            width: '450px',
                            showCancelButton: false,
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false,
                            didOpen: (toast) => {
                                TimerShip = setInterval(function () {
                                    var text = "";
                                    if (TimerShipNum >= 3) {
                                        TimerShipNum = -1;
                                    }
                                    for (let i = 0; i <= TimerShipNum; i++) {
                                        text += "."
                                    }
                                    $("#SeddingLabel").text('Enviando' + text);
                                    TimerShipNum++;
                                }, 500);
                            }
                        });
                    },
                    type: "POST",
                    url: "api/code-edit.php",
                    data: "Shipping&listship=" + JSON.stringify(TempList),
                    cache: false,
                    success: function (data) {
                        row = 1;
                        $('.ShipmentList tbody').html('');
                        CoreFunc.newRow();

                        const result = JSON.parse(data);
                        clearInterval(TimerShip);
                        if (result['items'][0] != result['items'][1]) {
                            var txt = "";
                            $.each(result['msgError'], function (key, value) {
                                txt += `<li class="list-group-item list-group-item-danger"><i class="bi bi-exclamation-octagon-fill text-danger-emphasis"></i> ${value[0]} --> ${value[1]}</li>`
                            });
                            $("#logsEr").html(txt);
                            txt = "";
                            $.each(result['msgSuccess'], function (key, value) {
                                txt += `<li class="list-group-item list-group-item-success"><i class="bi bi-check-circle-fill text-success-emphasis"></i> ${value[0]} --> ${value[1]}</li>`
                            });
                            $("#logsSu").html(txt);
                            Swal.fire({
                                title: "Ups Algo Salio Mal",
                                html: `<span>Operaciones Exitosas ${result['items'][0]} de ${result['items'][1]}</span>
                                <h5>Logs Errores</h5>
                                <ul class="list-group w-100" id="logsEr">

                                </ul>
                                <h5>Logs Exitosos</h5>
                                <ul class="list-group w-100" id="logsSu">
                                
                                </ul>`,
                                icon: "warning"
                            });
                        } else {
                            Swal.fire({
                                title: "Traslado Exitoso",
                                html: `<span>Operaciones Exitosas ${result['items'][0]} de ${result['items'][1]}</span>`,
                                icon: "success"
                            });
                        }
                    }
                });
            }
        });
    });
    $(document).on('click', '#clearList', function () {
        listShip = {};
        row = 1;
        $(this).attr('disabled', true);
        $('.ShipmentList tbody').html('');
        CoreFunc.newRow();
        CoreFunc.sendverify();
        CoreFunc.update();
    });
});