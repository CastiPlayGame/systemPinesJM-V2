function updateTable() {
    const scrollOld = $('.ServerList tbody').scrollTop();
    $.ajax({
        type: "POST",
        url: "api/code-obtain.php",
        data: "DataBase&Servers",
        cache: false,
        success: function (data) {
            $(document).find(".ServerList tbody").html(data);
            $(document).find("#qinput").trigger('keyup');
            $('.ServerList tbody').scrollTop(scrollOld);
        }
    });
}