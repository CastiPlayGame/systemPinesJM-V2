class ReportsExcel {
    static reports = {
        1: {
            change: function() {
                $(document).find("#div_report_search").prop("hidden", true);
                $(document).find("#div_report_month").prop("hidden", true);
                $(document).find("#div_report_year").prop("hidden", false);
            },
            verify: function({ year }){
                return year == 'null';
            },
            handler: async ({ year }) => {
                var url = "document/view/xlsx/sts";
                var body = {
                    "type": "STS_001",
                    "filter": {
                        "year": year
                    }
                };
                var name = "reporte_de_productos_mas_movidos";

                await ReportsExcel.sendRequest({name, url, body});
            }
        },
        2: {
            change: function() {
                $(document).find("#div_report_search").prop("hidden", true);
                $(document).find("#div_report_month").prop("hidden", true);
                $(document).find("#div_report_year").prop("hidden", false);

            },
            verify: function({ year }){
                return year == 'null';
            },
            handler: async ({ year }) => {
                var url = "document/view/xlsx/sts";
                var body = {
                    "type": "STS_002",
                    "filter": {
                        "year": year
                    }
                };
                var name = "reporte_de_clientes_mas_importantes";

                await ReportsExcel.sendRequest({name, url, body});
            }
        },
        3: {
            change: function() {
                $(document).find("#div_report_search").prop("hidden", true);
                $(document).find("#div_report_month").prop("hidden", false);
                $(document).find("#div_report_year").prop("hidden", true);
            },
            verify: function({ month }){
                return month == 'null';
            },
            handler: async ({ month }) => {
                var url = "document/view/xlsx/sts";
                var body = {
                    "type": "STS_003",
                    "filter": {
                        "month": month
                    }
                };
                var name = "reporte_de_paquetes_mas_movidos";

                await ReportsExcel.sendRequest({name, url, body});
            }
        },
        4: {
            change: function() {
                $(document).find("#div_report_search").prop("hidden", true);
                $(document).find("#div_report_month").prop("hidden", true);
                $(document).find("#div_report_year").prop("hidden", true);
            },
            verify: function({}){
                return false;
            },
            handler: async ({}) => {
                var url = "document/view/xlsx/inv";
                var body = {
                    "type": "INV_001",
                    "filter": {
                        "departaments": [] // Asegúrate de que esto sea lo que necesitas
                    }
                };
                var name = "reporte_de_inventario";
        
                console.log("Body para el reporte 4:", body); // Verifica el contenido del body
        
                await ReportsExcel.sendRequest({name, url, body});
            }
        },
        5: {
            change: function() {
                $(document).find("#div_report_search").prop("hidden", false);
                $(document).find("#div_report_month").prop("hidden", true);
                $(document).find("#div_report_year").prop("hidden", false);

            },
            verify: function({ search, year }){
                return (search.length === 0 && search != "") && (year == 'null');
            },
            handler: async ({ search, year }) => {
                var url = "document/view/xlsx/fnz";
                var body = {
                    "type": "FNZ_001",
                    "filter": {
                        "code": search,
                        "startDate": `${year}-01-01`,
                        "endDate": `${year}-12-31`,
                    }
                };
                var name = "reporte_de_producto_especifico";
            
                await ReportsExcel.sendRequest({name, url, body});
            }
        },
        6: {
            change: function() {
                $(document).find("#div_report_search").prop("hidden", true);
                $(document).find("#div_report_month").prop("hidden", true);
                $(document).find("#div_report_year").prop("hidden", false);

            },
            verify: function({ year }){
                return (year == 'null');
            },
            handler: async ({ year }) => {
                var url = "document/view/xlsx/fnz";
                var body = {
                    "type": "FNZ_002",
                    "filter": {
                        "startDate": `${year}-01-01`,
                        "endDate": `${year}-12-31`,
                    }
                };
                var name = "reporte_de_notas";
            
                await ReportsExcel.sendRequest({name, url, body});
            }
        },
    }

    static async sendRequest({ name, url, body }) {
        console.log(body);
    
        // Determina si el cuerpo debe ser JSON o x-www-form-urlencoded
        const isJson = typeof body === 'object' && !Array.isArray(body);
        const data = isJson ? JSON.stringify(body) : body; // Convierte a JSON si es un objeto
    
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
            url: urlAPI + url,
            data: data,
            cache: false,
            xhrFields: {
                responseType: 'blob'
            },
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': isJson ? 'application/json' : 'application/x-www-form-urlencoded' // Establece el tipo de contenido
            },
            success: function (data, textStatus, jqXHR) {
                const blob = new Blob([data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
    
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                function generateUniqueExcelName() {
                    const randomId = Math.floor(Math.random() * 1000000);
                    const currentDate = new Date().toISOString().split('T')[0];
                    return `${randomId}_${currentDate}`;
                }
                link.download = generateUniqueExcelName() + `-${name}.xlsx`;
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
    }
}

$(document).ready(function() {
    $(document).on('change', '#report', function() {
        var op = $(this).find('option:selected').val();
        console.log(op)
        ReportsExcel.reports[op].change();
    });
    $(document).on('click', '#report_btn', function() {
        var op = $(document).find('#report option:selected').val();
        var month = $(document).find('#report_month option:selected').val();
        var year = $(document).find('#report_year option:selected').val();
        var search = $(document).find('#report_search').val();

        if(ReportsExcel.reports[op].verify({ month, year, search })){
            new messageTemp('Pines Jm', 'Escoje una opcion', 'info');
            return;
        }
        ReportsExcel.reports[op].handler({ month, year, search });
    });
});