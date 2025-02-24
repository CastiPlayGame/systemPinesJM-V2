 

const typeDatas = {
    type: {
        log: {
            inv: {
                buy: {
                    handle: function (log) {
                        const items = {}

                        log.old.forEach((val, i) => {
                            var changes = {};
                            const { changes: packetChanges, totalDifference } = typeDatas.func.comparePackets(val["packs"], log.new[i]["packs"]);
                            console.log(changes, val["packs"], log.new[i]["packs"])
                            const oldList = typeDatas.func.processPacketsLine(val["packs"], packetChanges);
                            const newList = typeDatas.func.processPacketsLine(log.new[i]["packs"], packetChanges);


                            items[i] =`
                                <tr>
                                <td class="col-stv-4">${val["code"]}</td>
                                <td class="col-stv-2">${val["depo"]}</td>
                                <td class="col-stv-12">
                                    <div class="d-flex flex-row flex-wrap">
                                    ${oldList}
                                    </div>
                                </td>
                                <td class="col-stv-12">
                                    <div class="d-flex flex-row flex-wrap">
                                    ${newList}
                                    </div>
                                </td>
                                <td class="col-stv-2">${totalDifference}</td>
                                <tr>
                            `;

                        });

                        $(document).find('.modal-content #bodyHistory').html(`
                            <div class="row mb-2">
                                <div class="col-4">
                                    <h6>Tipo: ${log["type"].substr(4)}</h6>
                                </div>
                                <div class="col-4">
                                    <h6>Dispositivo: ${log["dvc"]}</h6>
                                </div>
                                <div class="col-4">
                                    <h6>IP Publica: ${log["ip"]}</h6>
                                </div>
                                <div class="col-8">
                                    <h6>Documento: ${log["id"]}</h6>
                                </div>
                                <div class="col-2">
                                    <h6>Cantidad: ${log["total"]}</h6>
                                </div>
                                <div class="col-2">
                                    <h6>Cantidad: ${log["agent"]}</h6>
                                </div>
                                <div class="col-12">
                                    <h6>Contexto: ${log["message"]}</h6>
                                </div>
                            </div>
                            <div class="d-flex justify-content-center align-items-center">
                               <table class="InventoryList table table-striped table-bordered table-scroll small">
                                    <thead>
                                        <tr>
                                            <th class="col-stv-4 text-light" scope="col">Codigo</th>
                                            <th class="col-stv-2 text-light" scope="col">Depo</th>
                                            <th class="col-stv-12 text-light" scope="col">Antes</th>
                                            <th class="col-stv-12 text-light" scope="col">Despues</th>
                                            <th class="col-stv-2 text-light" scope="col">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody class="table-group-divider" style="max-height: 30rem;">
                                        ${Object.values(items).join('')}
                                    </tbody>
                                </table>
                            </div>
                            `);
                    },
                    update: function (log) {

                        const restore = {}
                        const withdraw = {}

                        const restorePlayload = log.restore.playload
                        const withdrawPlayload = log.withdraw.playload


                        restorePlayload.old.forEach((val, i) => {
                            var changes = {};
                            const { changes: packetChanges, totalDifference } = typeDatas.func.comparePackets(val["packs"], restorePlayload.new[i]["packs"]);
                            const oldList = typeDatas.func.processPacketsLine(val["packs"], packetChanges);
                            const newList = typeDatas.func.processPacketsLine(restorePlayload.new[i]["packs"], packetChanges);

                            restore[i] =`
                                <tr>
                                <td class="col-stv-4">${val["code"]}</td>
                                <td class="col-stv-2">${val["depo"]}</td>
                                <td class="col-stv-12">
                                    <div class="d-flex flex-row flex-wrap">
                                    ${oldList}
                                    </div>
                                </td>
                                <td class="col-stv-12">
                                    <div class="d-flex flex-row flex-wrap">
                                    ${newList}
                                    </div>
                                </td>
                                <td class="col-stv-2">${totalDifference}</td>
                                <tr>
                            `;
                        });
                        withdrawPlayload.old.forEach((val, i) => {
                            var changes = {};
                            const { changes: packetChanges, totalDifference } = typeDatas.func.comparePackets(val["packs"], withdrawPlayload.new[i]["packs"]);
                            const oldList = typeDatas.func.processPacketsLine(val["packs"], packetChanges);
                            const newList = typeDatas.func.processPacketsLine(withdrawPlayload.new[i]["packs"], packetChanges);

                            withdraw[i] =`
                                <tr>
                                <td class="col-stv-4">${val["code"]}</td>
                                <td class="col-stv-2">${val["depo"]}</td>
                                <td class="col-stv-12">
                                    <div class="d-flex flex-row flex-wrap">
                                    ${oldList}
                                    </div>
                                </td>
                                <td class="col-stv-12">
                                    <div class="d-flex flex-row flex-wrap">
                                    ${newList}
                                    </div>
                                </td>
                                <td class="col-stv-2">${totalDifference}</td>
                                <tr>
                            `;
                        });




                        $(document).find('.modal-content #bodyHistory').html(`
                             <div class="row mb-2">
                                <div class="col-4">
                                    <h6>Tipo: ${log["type"].substr(4)}</h6>
                                </div>
                                <div class="col-4">
                                    <h6>Dispositivo: ${log["dvc"]}</h6>
                                </div>
                                <div class="col-4">
                                    <h6>IP Publica: ${log["ip"]}</h6>
                                </div>
                                <div class="col-8">
                                    <h6>Documento: ${log["id"]}</h6>
                                </div>
                                <div class="col-4">
                                    <h6>Cantidad: ${log["agent"]}</h6>
                                </div>
                                <div class="col-12">
                                    <h6>Contexto: ${log["message"]}</h6>
                                </div>
                            </div>
                            <nav class="d-flex w-100 justify-content-center mb-3">
                                <div class="nav nav-pills" id="nav-tab" role="tablist">
                                    <button class="nav-link active" id="nav-restore-tab" data-bs-toggle="tab" data-bs-target="#nav-restore" type="button" role="tab" aria-controls="nav-restore" aria-selected="true">
                                        <i class="bi bi-box-arrow-in-right h4 m-0"></i>
                                        <span>Entrada<span>
                                    </button>
                                    <button class="nav-link" id="nav-withdraw-tab" data-bs-toggle="tab" data-bs-target="#nav-withdraw" type="button" role="tab" aria-controls="nav-withdraw" aria-selected="false">
                                        <i class="bi bi bi-box-arrow-in-left h4 m-0"></i>
                                        <span>Salida<span>
                                    </button
                                </div>
                            </nav>
                            <div class="tab-content" id="nav-tabContent">
                                <h6>Total de Entrada: ${restorePlayload.total}</h6>
                                <div class="tab-pane fade show active" id="nav-restore" role="tabpanel" aria-labelledby="nav-restore-tab" tabindex="0">
                                    <div class="d-flex justify-content-center align-items-center">
                                        <table class="InventoryList table table-striped table-bordered table-scroll small">
                                            <thead>
                                                <tr>
                                                    <th class="col-stv-4 text-light" scope="col">Codigo</th>
                                                    <th class="col-stv-2 text-light" scope="col">Depo</th>
                                                    <th class="col-stv-12 text-light" scope="col">Antes</th>
                                                    <th class="col-stv-12 text-light" scope="col">Despues</th>
                                                    <th class="col-stv-2 text-light" scope="col">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody class="table-group-divider" style="max-height: 30rem;">
                                                ${Object.values(restore).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="tab-pane fade" id="nav-withdraw" role="tabpanel" aria-labelledby="nav-withdraw-tab" tabindex="0">
                                    <h6>Total de Salida: ${withdrawPlayload.total}</h6>
                                    <div class="d-flex justify-content-center align-items-center">
                                        <table class="InventoryList table table-striped table-bordered table-scroll small">
                                            <thead>
                                                <tr>
                                                    <th class="col-stv-4 text-light" scope="col">Codigo</th>
                                                    <th class="col-stv-2 text-light" scope="col">Depo</th>
                                                    <th class="col-stv-12 text-light" scope="col">Antes</th>
                                                    <th class="col-stv-12 text-light" scope="col">Despues</th>
                                                    <th class="col-stv-2 text-light" scope="col">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody class="table-group-divider" style="max-height: 20rem;">
                                                ${Object.values(withdraw).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            `);
                    },
                },
                item: function (log) {
                    const changes = {};
                    const oldPackets = log.old.Packets;
                    const newPackets = log.new.Packets;

                    changes['Pcs'] = log.old.Pcs !== log.new.Pcs
                        ? { stts: 1, msg: `Cambiado de ${log.old.Pcs} a ${log.new.Pcs}` }
                        : { stts: null, msg: "" };

                    const { changes: packetChanges, totalDifference } = typeDatas.func.comparePackets(oldPackets, newPackets);
                    Object.assign(changes, packetChanges);

                    console.log(`Diferencia total: ${totalDifference}`);

                    const old_new = [
                        [
                            typeDatas.func.processPackets(log.old["Packets"], log.old.Pcs, changes)
                        ], [
                            typeDatas.func.processPackets(log.new["Packets"], log.new.Pcs, changes)
                        ]
                    ];

                    $(document).find('.modal-content #bodyHistory').html(`
                        <div class="row mb-2">
                            <div class="col-4">
                                <h6>Tipo: ${log["type"].substr(4)}</h6>
                            </div>
                            <div class="col-4">
                                <h6>Dispositivo: ${log["dvc"]}</h6>
                            </div>
                            <div class="col-4">
                                <h6>IP Publica: ${log["ip"]}</h6>
                            </div>
                            <div class="col-4">
                                <h6>Codigo: ${log["id"]}</h6>
                            </div>
                            <div class="col-4">
                                <h6>Deposito: ${log["depo"]}</h6>
                            </div>
                            <div class="col-4">
                                <h6>Cantidad: ${log["total"]}</h6>
                            </div>
                            <div class="col-4">
                                <h6>Sistema: ${log["agent"]}</h6>
                            </div>
                            <div class="col-12">
                                <h6>Contexto: ${log["message"]}</h6>
                            </div>
                        </div>
                        <div class="d-flex justify-content-center align-items-center">
                            <div class="row g-3 w-75 justify-content-evenly">
                                <div class="col-stv-12">
                                    <h5 class="text-center">Antes</h5>
                                    <div class="d-flex flex-wrap justify-content-center"> <!-- Añadido justify-content-center -->
                                        ${old_new[0]}
                                    </div>
                                </div>
                                <div class="col-stv-12">
                                    <h5 class="text-center">Después</h5>
                                    <div class="d-flex flex-wrap justify-content-center"> <!-- Añadido justify-content-center -->
                                        ${old_new[1]}
                                    </div>
                                </div>
                            </div>
                        </div>
                        `);
                }
            }
        }
    },
    func: {
        comparePackets: function (oldlist, newlist) {
            const changes = {};
            let totalDifference = 0;

            // Crear un conjunto de todas las claves
            const allKeys = new Set([...Object.keys(oldlist), ...Object.keys(newlist)]);

            // Iterar sobre todas las claves
            allKeys.forEach(key => {
                const oldCant = oldlist[key]; // Puede ser undefined
                const newCant = newlist[key]; // Puede ser undefined

                if (oldCant === undefined && newCant !== undefined) {
                    // Caso 3: Añadido
                    changes[key] = { stts: 0, msg: `Añadido: ${key} (${newCant})` };
                    totalDifference += newCant * key; // Sumar a la diferencia total
                } else if (oldCant !== undefined && newCant === undefined) {
                    // Caso 2: Eliminado
                    changes[key] = { stts: -1, msg: `Eliminado: ${key}` };
                } else if (oldCant !== newCant) {
                    // Caso 1: Modificado
                    changes[key] = { stts: 1, msg: `Cambiado de ${oldCant} a ${newCant} en ${key}` };
                    totalDifference += Math.abs(newCant - oldCant) * key; // Calcular diferencia
                } else {
                    // Caso 4: Sin modificación
                    changes[key] = { stts: null, msg: "" };
                }
            });
            return { changes, totalDifference };
        },
        getColor: function (complemet = '', stts) {
            if (stts === 1) return complemet + "primary";
            if (stts === 0) return complemet + "success";
            if (stts === -1) return complemet + "danger";
            return "";
        },
        processPackets: function (packets, pcs, changes) {
            const temp = [];
            const sortedEntries = Object.entries(packets).sort(([keyA], [keyB]) => keyB - keyA);
            sortedEntries.forEach(([key, value]) => {

                var color = typeDatas.func.getColor('bg-', changes[key]?.stts)
                if(color.length === 0){
                    color = "bg-secondary"
                }

                temp.push(`
                    <div class="card-quantity d-flex flex-row card rounded-6 shadow overflow-hidden border-0 m-1">
                        <div class="d-flex flex-column pack ${color} col-stv-16 rounded-6 justify-content-center align-items-center p-1">
                            <div>
                                <h2 class="text-light m-0">Pq</h2>
                                <h1 class="text-light ms-1 m-0">${key}</h1>     
                            </div>
                        </div>
                        <div class="quantity w-100 d-flex justify-content-center align-items-center p-1">
                            <p class="m-0 p-0">x ${value}</p>
                        </div>
                    </div>    
                `);
            });

            var color = typeDatas.func.getColor('bg-', changes.Pcs.stts)
            if(color.length === 0){
                color = "bg-secondary"
            }

            temp.push(`
                <div class="card-quantity d-flex flex-row card rounded-6 shadow overflow-hidden border-0 m-1">
                    <div class="d-flex flex-column pack ${color} col-stv-17 rounded-6 justify-content-center align-items-center p-1">
                        <div>
                            <h1 class="text-light m-0">PCS</h1>     
                        </div>
                    </div>
                    <div class="quantity w-100 d-flex justify-content-center align-items-center p-1">
                        <p class="m-0 p-0">x ${pcs}</p>
                    </div>
                </div>    
            `);
            


            return temp.join('');
        },
        processPacketsLine: function (Packets, changes) {
            const temp = [];
            const sortedEntries = Object.entries(Packets).sort(([keyA], [keyB]) => keyB - keyA);
            sortedEntries.forEach(([key, value]) => {
                var color = typeDatas.func.getColor('bg-', changes[key]?.stts)
                if(color.length === 0){
                    color = "bg-secondary"
                }
                


                temp.push(`
                    <div class="card-quantity d-flex flex-row card rounded-6 shadow overflow-hidden border-0 m-1">
                        <div class="d-flex flex-column pack ${color} col-stv-16 rounded-6 justify-content-center align-items-center p-1">
                            <div>
                                <h2 class="text-light m-0">Pq</h2>
                                <h1 class="text-light ms-1 m-0">${key}</h1>     
                            </div>
                        </div>
                        <div class="quantity w-100 d-flex justify-content-center align-items-center p-1">
                            <p class="m-0 p-0">x ${value}</p>
                        </div>
                    </div>    
                `);
            });

            return temp.join('');
        }
    },
    handleLog: function (log) {
        const logType = log.type;
        const logParts = logType.split('.');
        let currentLevel = this.type;

        for (let part of logParts) {
            if (currentLevel[part]) {
                currentLevel = currentLevel[part];
            } else {
                console.log("Tipo de log no reconocido:", logType);
                return;
            }
        }
        if (typeof currentLevel === 'function') {
            return currentLevel(log);
        } else if (typeof currentLevel === 'object' && currentLevel.handle) {
            return currentLevel.handle(log);
        } else {
            console.log("Tipo de log no reconocido:", logType);
        }
    }
};

class Logs {
    constructor() {
        this.filters = {};
        this.logs;
    }
    generateRows() {
        var data = "";
        Object.keys(this.logs.logs).forEach(key => {
            data += this.createRow(key);
        });

        return data;
    }

    createRow(key) {
        var rows = "";

        this.logs.logs[key].forEach((logRow, i) => {

            const size = (logRow["type"] != "log.inv.item") ? 3 : 2;

            rows += `
                <tr> 
                    <td class="col-stv-5" scope="col">${formatDate(logRow["ttmp"])}</td>
                    <td class="col-stv-4" scope="col">
                        <p class="w-100 text-wrap">
                            ${logRow["type"].substr(4)}
                        </p>
                    </td>
                    <td class="col-stv-4" scope="col">${logRow["dvc"]}</td>
                    <td class="col-stv-3" scope="col">${logRow["ip"]}</td>
                    <td class="col-stv-2" scope="col">${logRow["agent"]}</td>
                    <td class="col-stv-6" scope="col">${logRow["id"].substr(-22)}</td>
                    <td class="col-stv-6" scope="col">${logRow["message"]}</td>
                    <td class="col-stv-2" scope="col">
                        <button type="button" class="btn btn-outline-dark shadow-none"  modal-data-locate="History&View&date=${key}&id=${i}" modal-size="${size}" id="modalBtn">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        return rows;
    }
    getLogs() {
        const scrollOld = $('#History tbody').scrollTop();
        const root = this
        $.ajax({
            type: "GET",
            url: urlAPI + "logs/inv",
            data: "",
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            cache: false,
            success: function (data) {
                $('#History tbody').empty();
                root.logs = data
                const logs = root.generateRows();

                $(document).find("#History tbody").html(logs);
                //$('#History tbody').scrollTop(scrollOld);
            },
            error: function (xhr, status, error) {
                try {
                    const json = JSON.parse(xhr.responseText);

                    if (json.response) {
                        $(document).find("#History tbody").html(json.response);
                    } else {
                        $(document).find("#History tbody").html("Ocurrió un error inesperado.");
                    }
                } catch (e) {
                    $(document).find("#History tbody").html("Error: " + error);
                }
            }
        });
    }
}

const history = new Logs();

$(document).ready(function () {
    setInterval(history.getLogs(), updateShort * 1000);
});