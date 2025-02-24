var year = new Date().getFullYear();
const inv = new InventoryStats();

$(document).ready(function () {
    new UtilsStats().updateYearsDropdown($(document).find("#menuInventory"), year);

    $(document).on('click', "#report", function () {
        var type = $(this).attr("date-type");
        var yearSelect = $('#yearStats option:selected').val(); 
        var url;
        var name;
        var body;
        switch (type) {
            case "inv":
                url = "document/view/xlsx/sts"
                body = {
                    "type": "STS_001",
                    "filter": {
                        "year": yearSelect
                    }
                }
                name = "reporte_de_productos_mas_movidos"
                break;
            case "client":
                url = "document/view/xlsx/sts"
                body = {
                    "type": "STS_002",
                    "filter": {
                        "year": yearSelect
                    }
                }
                name = "reporte_de_cliente_mas_importantes"
                break;
        }

        $.ajax({
            beforeSend: function () {
                Swal.fire({
                    html: new sweet_loader().loader("Procesando"),
                    showDenyButton: false,
                    showCancelButton: false,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
            },
            type: "POST",
            url: urlAPI+url,
            data: body,
            cache: false,
            xhrFields: {
                responseType: 'blob' // set the responseType to blob
            },
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            success: function (data, textStatus, jqXHR) {
                const blob = new Blob([data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // set the MIME type to match the file type
                });

                // create a download link and click it to initiate the download
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                function generateUniqueExcelName() {
                    const year = yearSelect
                    const randomId = Math.floor(Math.random() * 1000000);

                    return `${randomId}_${year}`;
                }
                link.download = generateUniqueExcelName() + `-${name}.xlsx`; // replace with your desired file name
                link.click();
                Swal.fire({
                    title: "Operacion Exitosa",
                    icon: "success"
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
    });



    $(document).on('change', '#yearStats', function () { 
        inv.inventoryGraphMassiveSales($(document).find('#invStats'));
        inv.mostImportantClients($(document).find('#cliStats'));
        inv.inventoryItemCriticalMassiveSales($(document).find('#criticalStats'));
        inv.summaryCards($(document).find('#cardsStats'));
        inv.warehouseStocks($(document).find('#whseStats'));
    });

    inv.inventoryGraphMassiveSales($(document).find('#invStats'));
    inv.mostImportantClients($(document).find('#cliStats'));
    inv.inventoryItemCriticalMassiveSales($(document).find('#criticalStats'));
    inv.summaryCards($(document).find('#cardsStats'));
    inv.warehouseStocks($(document).find('#whseStats'));
});