class UtilsStats {
    getMonths(lg = "es", length = 12, type = "short") {
        return Array.from({ length: length }, (_, i) => {
            const month = new Date(0, i).toLocaleString(lg, { month: type });
            return month[0].toUpperCase() + month.slice(1);
        });
    }
    updateYearsDropdown(ctx, yearLocal) {
        var currentYear = new Date().getFullYear();
        var html = "";
        for (var i = 0; i <= 4; i++) {
            html += `<option value="${currentYear - i}">${currentYear - i}</option>`;
        }
        ctx.find('#yearStats').html(html);
        ctx.find(`#yearStats option[value='${yearLocal}']`).prop('selected', true);
    }
}

class GeneralStats {
    constructor() {
        this.charts = {};
    }

    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    inventoryGraphMassiveSales(ctx) {
        const yearLocal = ctx.find('#yearStats option:selected').val();
        this.destroyChart('invChartMS');

        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: `Statistics&Stat1&limit=15&year=${yearLocal}`,
            cache: false,
            success: (response) => {
                const res = JSON.parse(response); 
                const myLineChart = new Chart(ctx.find("#myLineChart")[0].getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: new UtilsStats().getMonths(),
                        datasets: res["content"]
                    },
                    options: {
                        devicePixelRatio: 1.2,
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Meses'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Ventas'
                                },
                                beginAtZero: true
                            }
                        },
                        elements: {
                            line: {
                                borderWidth: 1.2,
                            },
                            point: {
                                radius: 5,
                                hoverRadius: 10,
                                borderWidth: 1.2,
                            }
                        },
                        plugins: {
                            tooltip: {
                                enabled: true,
                                mode: 'nearest',
                                padding: 10,
                                intersect: true,
                                callbacks: {
                                    title: (tooltipItems) => `${meses[tooltipItems[0].label]}`,
                                    label: (tooltipItem) => {
                                        const datasetLabel = tooltipItem.dataset.label || '';
                                        const dataValue = tooltipItem.raw;
                                        return `(${datasetLabel}): ${dataValue}`;
                                    }
                                }
                            }
                        }
                    }
                });
                this.charts['invChartMS'] = myLineChart;
            }
        });
    }

    accountingGraphSalesPayment(ctx) {
        const yearLocal = ctx.find('#yearStats option:selected').val();
        this.destroyChart('accountChartSP');

        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: `Statistics&Stat2&year=${yearLocal}`,
            cache: false,
            success: (response) => {
                const res = JSON.parse(response);

                const myDoughnutChart = new Chart(ctx.find("#myDoughnutChart")[0].getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ["Vencidas", "Pagadas", "Credito"],
                        datasets: [{
                            label: 'Ventas',
                            data: res["content"],
                            backgroundColor: [
                                'rgba(211, 118, 118, 1)',
                                'rgba(142, 172, 205, 1)',
                                'rgba(114, 151, 98, 1)'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            tooltip: {
                                enabled: true,
                                mode: 'nearest',
                                padding: 10,
                                intersect: true,
                                callbacks: {
                                    label: (tooltipItem) => {
                                        const dataValue = tooltipItem.raw;
                                        return `Cant: ${dataValue}`;
                                    }
                                }
                            }
                        }
                    }
                });
                this.charts['accountChartSP'] = myDoughnutChart;
            }
        });
    }

    summarySystemInfo(ctx) {
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Statistics&Stat3",
            cache: false,
            success: function (response) {
                const res = JSON.parse(response);
                ctx.find("#apiStatus").attr("class", "mb-1 " + codeStatus[res["code"] + 1]);
                ctx.find("#apiStatus").text(res["status"]);
                ctx.find("#bdStatus").attr("class", codeStatus[res["services"]["bd"]["code"] + 1]);
                ctx.find("#bdStatus").text(res["services"]["bd"]["status"]);

                ctx.find("#apiCpu").text(Math.round(res["cpu_total_percentage"]) + "%");
                ctx.find("#apiRam").text(Math.round(res["ram_percentage"]) + "%");
                ctx.find("#apiDisk").text(Math.round(res["disk_percentage"]) + "%");
                ctx.find("#apiBandwidth").text(Math.round(res["bandwidth_usage"]) + "%");

                ctx.find("#apiLatency").text(res["latency"] + "ms");
                ctx.find("#apiRequests").text(res["request_today"]);


            },

        });
    }

    summaryCards(ctx) {
        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: "Statistics&Stat4",
            cache: false,
            success: function (response) {
                const res = JSON.parse(response);
                ctx.find("#cardClient").text(res["users"]);
                ctx.find("#cardServer").text(res["server"]);
                ctx.find("#cardSold").text(res["solds"]);
                ctx.find("#cardPedding").text(res["peddings"]);
                ctx.find("#cardItem").text(res["items"]);



            },

        });
    }

    inventoryItemCriticalMassiveSales(ctx) {
        var yearLocal = ctx.find('#yearStats option:selected').val();

        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: `Statistics&Stat5&limit=28&year=${yearLocal}`,
            cache: false,
            success: function (response) {
                var html = "";
                const res = JSON.parse(response);
                $.each(Object.keys(res["content"]), function (index, value) {
                    html += `<div class="col"><p class="h6 mb-0">${value}</p></div>`;
                });
                ctx.find("#listCritical").html(html);
            }
        });
    }
}

class InventoryStats {
    constructor() {
        this.charts = {};
    }

    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    inventoryGraphMassiveSales(ctx) {
        var yearLocal = $('#yearStats option:selected').val();
        this.destroyChart('invChartMS');

        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: `Statistics&Stat1&limit=20&year=${yearLocal}`,
            cache: false,
            success: (response) => {
                const res = JSON.parse(response);

                const myLineChart = new Chart(ctx.find("#myLineChart")[0].getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: new UtilsStats().getMonths(),
                        datasets: res["content"]
                    },
                    options: {
                        devicePixelRatio: 1,
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Meses'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Ventas'
                                },
                                beginAtZero: true
                            }
                        },
                        elements: {
                            line: {
                                borderWidth: 1.2,
                            },
                            point: {
                                radius: 5,
                                hoverRadius: 10,
                                borderWidth: 1.2,
                            }
                        },
                        plugins: {
                            tooltip: {
                                enabled: true,
                                mode: 'nearest',
                                padding: 10,
                                intersect: true,
                                callbacks: {
                                    title: (tooltipItems) => {
                                        return `${meses[tooltipItems[0].label]}`;
                                    },
                                    label: (tooltipItem) => {
                                        let datasetLabel = tooltipItem.dataset.label || '';
                                        let dataValue = tooltipItem.raw;
                                        return `(${datasetLabel}): ${dataValue}`;
                                    }
                                }
                            }
                        }
                    }
                });

                this.charts['invChartMS'] = myLineChart;
            }
        });
    }

    mostImportantClients(ctx) {
        var yearLocal = $('#yearStats option:selected').val();
        this.destroyChart('cliChartMAP'); // Destroy existing chart before creating a new one

        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: `Statistics&Stat6&limit=5&year=${yearLocal}`,
            cache: false,
            success: (response) => {
                const res = JSON.parse(response);

                const myLineChart = new Chart(ctx.find("#myLineChart")[0].getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: new UtilsStats().getMonths(),
                        datasets: res["content"]
                    },
                    options: {
                        devicePixelRatio: 2,
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Meses'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Compras'
                                },
                                beginAtZero: true
                            }
                        },
                        elements: {
                            line: {
                                borderWidth: 1.2,
                            },
                            point: {
                                radius: 5,
                                hoverRadius: 10,
                                borderWidth: 1.2,
                            }
                        },
                        plugins: {
                            tooltip: {
                                enabled: true,
                                mode: 'nearest',
                                padding: 10,
                                intersect: true,
                                callbacks: {
                                    title: (tooltipItems) => {
                                        return `${meses[tooltipItems[0].label]}`;
                                    },
                                    label: (tooltipItem) => {
                                        let datasetLabel = tooltipItem.dataset.label || '';
                                        let dataValue = tooltipItem.raw;
                                        return `(${datasetLabel}): ${dataValue}`;
                                    }
                                }
                            }
                        }
                    }
                });

                this.charts['cliChartMAP'] = myLineChart; // Store the chart instance
            }
        });
    }

    inventoryItemCriticalMassiveSales(ctx) {
        var yearLocal = $('#yearStats option:selected').val();

        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: `Statistics&Stat5&limit=40&year=${yearLocal}`,
            cache: false,
            success: (response) => {
                var html = "";
                const res = JSON.parse(response);
                $.each(Object.keys(res["content"]), function (index, value) {
                    html += `<div class="col"><p class="h6 mb-0">${value}</p></div>`;
                });
                ctx.find("#listCritical").html(html);
            }
        });
    }

    summaryCards(ctx) {
        var yearLocal = $('#yearStats option:selected').val();

        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: `Statistics&Stat7&year=${yearLocal}`,
            cache: false,
            success: (response) => {
                const res = JSON.parse(response)["content"];
                ctx.find("#cardStored").text(numberFormat(res["stored"]));
                ctx.find("#cardReserved").text(numberFormat(res["reserved"]));
                ctx.find("#cardOut").text(numberFormat(res["outputs"]));
                ctx.find("#cardDepo").text(res["statement_of_deposits"]["content"]);
            },
        });
    }

    warehouseStocks(ctx) {
        var yearLocal = $('#yearStats option:selected').val();
        var depo = [];

        for (let index = 1; index <= DepositosAvaiable; index++) {
            depo.push("Deposito" + index);
        }

        this.destroyChart('invChartWS'); // Destroy existing chart before creating a new one

        $.ajax({
            type: "POST",
            url: "api/code-obtain.php",
            data: `Statistics&Stat8`,
            cache: false,
            success: (response) => {
                const res = JSON.parse(response);
                const myBarChart = new Chart(ctx.find("#myBarChart")[0].getContext('2d'), {
                    type: 'bar', // Cambia de 'line' a 'bar'
                    data: {
                        labels: ["ahora"],
                        datasets: res["content"]
                    },
                    options: {
                        devicePixelRatio: 1,
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Depositos'
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Stocks'
                                },
                                beginAtZero: true
                            }
                        },
                        elements: {
                            bar: {
                                borderWidth: 1.2,
                            }
                        },
                        plugins: {
                            tooltip: {
                                enabled: true,
                                mode: 'nearest',
                                padding: 10,
                                intersect: true,
                                callbacks: {
                                    title: (tooltipItems) => {
                                        return `${tooltipItems[0].label}`;
                                    },
                                }
                            }
                        }
                    }
                });

                this.charts['invChartWS'] = myBarChart; // Store the chart instance
            },
        });
    }
}