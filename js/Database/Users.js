function updateTable() {
    const scrollOld = $('table tbody').scrollTop();
    $.ajax({
        beforeSend: function() {
            $(document).find("table tbody").html(new sweet_loader().loader("Cargando"));
        },
        type: "POST",
        url: "api/code-obtain.php",
        data: "DataBase&Users",
        cache: false,
        success: function (data) {
            $(document).find("table tbody").html(data);
            $(document).find("#qinput").trigger('keyup');
            $('tbody').scrollTop(scrollOld);

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
    
    $(document).on('change', '#radiosBtnTypeAccount input[type=radio][name="typeAccount"]', function () {
        if (this.value == 0) {
            $('#divLastName,#divUser,#divPassword,#divPhone,#divCredit,#divIdent,#divPrice,#nav-advanced-tab').show();
            $('#divName').attr('class', 'col-6');
        } else if (this.value == 1) {
            $('#divLastName').hide();
            $('#divUser,#divPassword,#divPhone,#divCredit,#divIdent,#divPrice,#nav-advanced-tab').show();
            $('#divName').attr('class', 'col-12');
        }
    });

    $(document).on("submit", '#newUser', function (event) {
        event.preventDefault();
        var isEmpty = false;
        const userInput = [
            [
                $('input[name="name"]').val(), $('input[name="lastName"]').val(), $('input[name="number"]').val(),
                $('input[name="numberIdent"]').val(), $('input[name="credit"]').val()
            ],
            [
                $('input[name="name"]').val(), $('input[name="number"]').val(), $('input[name="numberIdent"]').val(),
                $('input[name="credit"]').val()
            ]
        ];

        $.each(userInput[Number($('input[type=radio][name="typeAccount"]:checked').val())], function (key, value) {
            if (!value) {
                new messageTemp('Pines Jm', 'Rellene Todas Las Casillas', 'info');
                isEmpty = true;
                return false;
            }
        });
        if (isEmpty == true) { return; }

        var form = $(this).serialize() + "&User&" + $(this).attr('data-params-post');
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
            url: "api/code-new.php",
            data: form,
            cache: false,
            success: function (data) {
                var json = JSON.parse(data);
                if (json[0] == true) {
                    Swal.fire({
                        title: "Operacion Exitosa",
                        text: "Usuario Creado",
                        icon: "success"
                    });
                    new modalPinesJM().close();
                    updateTable();
                } else {
                    updateTable();
                    new modalPinesJM().close();
                    Swal.fire({
                        title: "Operacion Errada",
                        html: json[1],
                        icon: "error"
                    });
                }
            }
        });
    });

    $(document).on("submit", '#editUser', function (event) {
        event.preventDefault();
        var isEmpty = false;
        const userInput = [
            [
                $('input[name="name"]').val(), $('input[name="lastName"]').val(), $('input[name="number"]').val(),
                $('input[name="numberIdent"]').val(), $('input[name="credit"]').val()
            ],
            [
                $('input[name="name"]').val(), $('input[name="number"]').val(),
                $('input[name="numberIdent"]').val(), $('input[name="credit"]').val()
            ]
        ];

        $.each(userInput[Number($('input[type=radio][name="typeAccount"]:checked').val())], function (key, value) {
            if (!value) {
                new messageTemp('Pines Jm', 'Rellene Todas Las Casillas', 'info');
                isEmpty = true;
                return false;
            }
        });
        if (isEmpty == true) { return; }

        var form = $(this).serialize() + "&User&" + $(this).attr('data-params-post');
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
            url: "api/code-edit.php",
            data: form,
            cache: false,
            success: function (data) {
                var json = JSON.parse(data);
                if (json[0] == true) {
                    Swal.fire({
                        title: "Operacion Exitosa",
                        text: "Usuario Editado",
                        icon: "success"
                    });
                    new modalPinesJM().close();
                    updateTable();
                } else {
                    updateTable();
                    new modalPinesJM().close();
                    Swal.fire({
                        title: "Operacion Errada",
                        html: json[1],
                        icon: "error"
                    });
                }
            }
        });
    });

    $(document).on("click", '#delBtnUser', function (event) {
        event.preventDefault();
        var trdiv = $(this).parent().parent();
        var btn = $(this);
        Swal.fire({
            title: "Quieres Eliminar Este Usuario",
            text: "Usuario: "+trdiv.find('td').eq(2).text(),
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "SI",
            denyButtonText: "No"
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
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
                    data: `User&UserId=${btn.attr('input-data')}`,
                    cache: false,
                    success: function (data) {
                        var json = JSON.parse(data);
                        if (json[0] == true) {
                            Swal.fire({
                                title: "Operacion Exitosa",
                                text: "Usuario Eliminado",
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
});