var blcklist = [];
var discount = {};

function updateTable() {
    const scrollOld = $('.Departaments tbody').scrollTop();
    $.ajax({
        type: "POST",
        url: "api/code-obtain.php",
        data: "DataBase&Departaments",
        cache: false,
        success: function (data) {
            $(document).find(".Departaments tbody").html(data);
            $(document).find("#qinput").trigger('keyup');
            $('.Departaments tbody').scrollTop(scrollOld);
        }
    });
}
function getAllDisc() {
    discount = {};
    $('input#discount').each(function() {
        if ($(this).val() !== "") {
            var chck = $(this).parent().find('input[type="checkbox"]');
            discount[chck.val()] = [$(this).val(), chck.is(':checked')];
        }
    });
}

function getAllBlck() {
    blcklist = [...$("input#clientBlackList:checked")].map(el => el.value);
}

$(document).ready(function () {

    $(document).on("keyup", "#qinput", function () {
        var value = $(this).val().toLowerCase();
        $(document).find("table.Departaments tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
    $(document).on("keyup", "#qinputDisct", function () {
        var value = $(this).val().toLowerCase();
        $(document).find("#nav-discount table.ClientList tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $(document).on("keyup", "#qinputBlck", function () {
        var value = $(this).val().toLowerCase();
        $(document).find("#nav-blacklist table.ClientList tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $(document).on("submit", '#newDepa', function (event) {
        event.preventDefault();
        var id = $("input[name='depa']").val()
        if (!id) {
            new messageTemp('Pines Jm', 'Rellene Todas Las Casillas', 'info');
            return;
        }

        var form = $(this).serialize() + "&blacklist=" + JSON.stringify(blcklist) + "&discount=" + JSON.stringify(discount) + "&Departament";
        Swal.fire({
            title: "¿Quieres Crear El Deposito?",
            text: id,
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
                            text: "Departamento Creado",
                            icon: "success"
                        });
                        discount = {};
                        blcklist = [];

                    }
                });
            }
        });
    });

    $(document).on("submit", '#editDepa', function (event) {
        event.preventDefault();
        var id = $("input[name='depa']").val()
        var blcklist = $("input#clientBlackList:checked").map(function () {
            return $(this).val();
        }).get();

        if (!id) {
            new messageTemp('Pines Jm', 'Rellene Todas Las Casillas', 'info');
            return;
        }

        var form = $(this).serialize()+ "&blacklist=" + JSON.stringify(blcklist) + "&discount=" + JSON.stringify(discount) + "&Departament&" + $(this).attr('data-params-post');
        Swal.fire({
            title: "¿Quieres Editar El Deposito?",
            text: id,
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
                            text: "Departamento Editado",
                            icon: "success"
                        });
                        discount = {};
                        blcklist = [];
                    }
                });
            }
        });
    });

    $(document).on("change", '#clientBlackList', function (event) {
        getAllBlck();
        $("#nav-blacklist #clientTitle").text("Clientes Excluidos [" + blcklist.length + "]")
    });


    $(document).on("change", 'input#discount, .discountContainer input[type="checkbox"]', function (event) {
        getAllDisc();
        $("#nav-discount #clientTitle").text("Clientes con Descuentos [" + Object.keys(discount).length + "]")
    });



    $(document).on("click", '#delBtnDepa', function (event) {
        event.preventDefault();
        var trdiv = $(this).parent().parent();
        var btn = $(this);
        Swal.fire({
            title: "Quieres Eliminar Este Departamento",
            text: trdiv.find('td').eq(0).text(),
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
                    data: `Departament&DepartamentId=${btn.attr('input-data')}`,
                    cache: false,
                    success: function (data) {
                        var json = JSON.parse(data);
                        if (json[0] == true) {
                            Swal.fire({
                                title: "Operacion Exitosa",
                                text: "Departamento Eliminado",
                                icon: "success"
                            });
                            discount = {};
                            blcklist = [];
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



});