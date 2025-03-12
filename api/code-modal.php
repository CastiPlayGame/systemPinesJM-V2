<?php
include('connection.php');
include('code-module.php');

if (isset($_POST['Inventory'])) {
    if (isset($_POST['Item'])) {
        switch ($_POST['Mode']) {
            case 'EditPacket':
                $connObject = new Connection();
                $conn = $connObject->Connect();
                $sql = "SELECT JSON_VALUE(quantity, '$.\"" . $_POST['depo'] . "\".Packets.\"" . $_POST['pack'] . "\"') as Pack FROM `items` WHERE id='" . $_POST['id'] . "'";

                $result = mysqli_query($conn, $sql);

                if (mysqli_num_rows($result) > 0) {
                    $row = mysqli_fetch_assoc($result);

                    echo '
                    <div class="modal-header">
                        <h5 class="modal-title">Paquete de (' . $_POST['pack'] . ')</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6>Hay (' . $row['Pack'] . ') Paquetes</h6>
                        <div class="mb-3">
                            <label for="quantity" class="form-label">Cantidad</label>
                            <input type="text" class="form-control shadow-none" id="quantity" oninput="numberInput(this)" autocomplete="off">
                        </div>
                    </div>
                    <div class="modal-footer operations" data-packet-num="' . $_POST['pack'] . '" data-type="pack">
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="add">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="sub">
                            <i class="bi bi-dash-lg"></i>
                        </button>
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="set">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                    </div>';
                } else {
                    die('close');
                }
                break;
            case 'EditPcs':
                $connObject = new Connection();
                $conn = $connObject->Connect();

                $sql = "SELECT JSON_VALUE(quantity, '$.\"" . $_POST['depo'] . "\".Pcs') as Pcs FROM `items` WHERE id='" . $_POST['id'] . "'";
                $result = mysqli_query($conn, $sql);

                if (mysqli_num_rows($result) > 0) {
                    $row = mysqli_fetch_assoc($result);
                    echo '
                    <div class="modal-header">
                        <h5 class="modal-title">Piezas Sueltas</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6>Hay ' . $row['Pcs'] . ' Piezas Sueltas</h6>
                        <div class="mb-3">
                            <label for="quantity" class="form-label">Cantidad</label>
                            <input type="text" class="form-control shadow-none" id="quantity" oninput="numberInput(this)" autocomplete="off">
                        </div>
                    </div>
                    <div class="modal-footer operations" data-type="pcs">
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="add">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="sub">
                            <i class="bi bi-dash-lg"></i>
                        </button>
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="set">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                    </div>';
                } else {
                    die('close');
                }
                break;
            case 'EditSamples':
                $connObject = new Connection();
                $conn = $connObject->Connect();

                $sql = "SELECT JSON_VALUE(quantity, '$.\"" . $_POST['depo'] . "\".Samples') as Samples FROM `items` WHERE id='" . $_POST['id'] . "'";
                $result = mysqli_query($conn, $sql);

                if (mysqli_num_rows($result) > 0) {
                    $row = mysqli_fetch_assoc($result);
                    echo '
                    <div class="modal-header">
                        <h5 class="modal-title">Piezas Sueltas</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6>Hay ' . ($row['Samples'] ?? 0) . ' Muestras</h6>
                        <div class="mb-3">
                            <label for="quantity" class="form-label">Cantidad</label>
                            <input type="text" class="form-control shadow-none" id="quantity" oninput="numberInput(this)" autocomplete="off">
                        </div>
                    </div>
                    <div class="modal-footer operations" data-type="samples">
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="add">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="sub">
                            <i class="bi bi-dash-lg"></i>
                        </button>
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="set">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                    </div>';
                } else {
                    die('close');
                }
                break;
            case 'NewPacket':
                echo '
                <div class="modal-header">
                    <h5 class="modal-title">Crear Paquete</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="packet" class="form-label">Cantidad</label>
                        <input type="text" class="form-control shadow-none" id="packet" oninput="numberInput(this)" autocomplete="off">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="createPacket">
                        Crear Paquete
                    </button>
                </div>';
                break;
            case 'New':
                echo '
                <div class="modal-header">
                    <h5 class="modal-title">Crear Producto</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="itemCode" class="form-label">Nombre Del Producto</label>
                        <input type="text" class="form-control shadow-none" id="itemCode" oninput="this.value = this.value.toUpperCase();" autocomplete="off">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="createItem">
                        Crear
                    </button>
                </div>';
                break;
        }
    }
    if (isset($_POST['Filter'])) {
        echo '
        <script>
            $(document).ready(function () {
                LoadFilters();
            });
        </script>

        <div class="modal-header">
            <h5 class="modal-title">Filtros</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="mb-3">
                <h6 class="form-label">Operaciones</h6>
                <select class="form-select" id="FilterOption">
                    <option selected hidden>Cambie Aqui!</option>
                    <option value="1">Sin Stock</option>
                    <option value="2">Poco Stock</option>
                    <option value="3">Items Mas Vendidos</option>
                </select>
            </div>
            <div class="pageFilter" id="filterPage1" hidden>
                <div class="d-flex justify-content-center w-100 mb-3">
                    <input type="radio" class="btn-check" name="page1Options" value="1" id="page1Option1" autocomplete="off" checked>
                    <label class="btn btn-outline-primary shadow-none me-2" for="page1Option1">Total</label>
                    
                    <input type="radio" class="btn-check" name="page1Options" value="2" id="page1Option2" autocomplete="off">
                    <label class="btn btn-outline-primary shadow-none" for="page1Option2">Definir</label>
                </div>
                <div id="Define" class="row row-cols-2 ms-4" hidden>
                    ';
        for ($i = 1; $i <= 4; $i++) {
            echo '
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="defineDepo" value="' . $i . '" id="Deposit' . $i . '">
                            <label class="form-check-label" for="Deposit' . $i . '">
                                Depo ' . $i . '
                            </label>
                        </div>';
        }
        echo '
                </div>
            </div>
            <div class="pageFilter" id="filterPage2" hidden> 
                <div class="d-flex justify-content-center w-100 mb-3">
                    <input type="radio" class="btn-check" name="page2Options" value="1" id="page2Option1" autocomplete="off" checked>
                    <label class="btn btn-outline-primary shadow-none me-2" for="page2Option1">Total</label>
                    
                    <input type="radio" class="btn-check" name="page2Options" value="2" id="page2Option2" autocomplete="off">
                    <label class="btn btn-outline-primary shadow-none" for="page2Option2">Paquetes</label>
                </div>
                <div id="Total">
                    <div class="mb-3">
                        <h6 class="form-label">Minimo de Cantidad Total</h6>
                        <div class="input-group mb-3">
                            <span class="input-group-text">Menor Que</span>
                            <input type="text" class="form-control shadow-none" value="500" oninput="numberInput(this)" autocomplete="off">
                        </div>
                    </div>
                </div>
                <div id="Packets" hidden>
                    <div class="mb-3">
                        <h6 class="form-label">Minimo de Paquetes Requerido</h6>
                        <input type="text" class="form-control" value="5" shadow-none oninput="numberInput(this)" autocomplete="off">
                    </div>
                </div>
            </div>
            <div class="pageFilter" id="filterPage3" hidden>
                <div class="input-group mb-3">
                    <input type="text" class="form-control shadow-none" value="15" oninput="numberInput(this)" autocomplete="off">
                    <span class="input-group-text">Dias</span>
                </div>
            </div>

        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal" id="resetFilters">
                Limpiar
            </button>
            <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="saveFilters">
                Filtrar
            </button>
        </div>';
    }
    if (isset($_POST['Excludes'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT id,
        JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.user') AS nameAndLastName,
        JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.type')) AS persIdtype,
        JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.idenfication')) AS persIdidenfication
        FROM `users`";

        $result = mysqli_query($conn, $sql);
        if (mysqli_num_rows($result) > 0) {
            echo '
            <script>
                $(document).ready(function () {
                    if($(".excludes input").val()){
                        $.each(JSON.parse($(".excludes input").val()), function( index, value ) {
                            $("#clientBlackList[value=\'"+value+"\']").prop("checked", true).trigger("change");
                        }); 
                    }
                });
            </script>
            <div class="modal-header bg-dark text-white py-3">
                <div class="d-flex align-items-center">
                    <i class="bi bi-list-check me-3 fs-4"></i>
                    <h5 class="modal-title fw-bold">Crear Lista de Exclusión de Clientes</h5>
                </div>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="modal-title fs-4 text-secondary" id="clientTitle">
                        <span class="badge bg-dark me-2">0</span>Clientes Excluidos
                    </h1>
                    
                    <div class="input-group" style="max-width: 300px;">
                        <span class="input-group-text bg-light border-dark">
                            <i class="bi bi-search"></i>
                        </span>
                        <input id="qinputClient" aria-describedby="button-addon2" aria-label="Buscar" placeholder="Buscar" class="form-control shadow-none" type="text">
                    </div>
                </div>

                <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                    <table class="ClientList table table-hover">
                        <thead class="table-dark sticky-top">
                            <tr>
                                <th class="col-3">Identificación</th>
                                <th class="col-8">Nombre Completo</th>
                                <th class="col-1"></th>
                            </tr>
                        </thead>
                        <tbody class="table-group-divider overflow-hidden">';
            
            $counter = 0;
            while ($row = mysqli_fetch_assoc($result)) {
                $fullName = implode(' ', json_decode($row['nameAndLastName']));
                $clientId = $row['id'];
                $identifier = $typeIdent[$row['persIdtype']] . '-' . $row['persIdidenfication'];
                
                echo '
                            <tr id="client_' . $clientId . '" class="align-middle">
                                <td class="col-3 text-muted">' . $identifier . '</td>
                                <td class="col-8">
                                    <div class="d-flex align-items-center">
                                        <span class="text-truncate" style="max-width: 95%;">' . $fullName . '</span>
                                    </div>
                                </td>
                                <td class="col-1 text-center">
                                    <div class="form-check d-flex justify-content-center">
                                        <input class="form-check-input" 
                                            value="' . $clientId . '" 
                                            type="checkbox" 
                                            id="clientBlackList">
                                    </div>
                                </td>
                            </tr>';
                $counter++;
            }

            echo '    
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer bg-light">
                <div class="d-flex justify-content-between w-100 align-items-center">
                    <span class="text-muted">Total de clientes: ' . $counter . '</span>
                    <button type="button" class="btn btn-dark px-4" data-bs-dismiss="modal" id="saveBlackList">
                        <i class="bi bi-check-circle me-2"></i>Confirmar Selección
                    </button>
                </div>
            </div>';
        }
    }

}

if (isset($_POST['History'])) {
    if (isset($_POST['View'])) {
        echo '
        <script>
            $(document).ready(function () {
                typeDatas.handleLog(history.logs.logs["' . $_POST["date"] . '"]["' . $_POST["id"] . '"]);
                $(document).find(".modal-content #headerHistory .modal-title").text(`Historial de ${formatDate(history.logs.logs["' . $_POST["date"] . '"]["' . $_POST["id"] . '"]["ttmp"])}`);

            });
        </script>

        <div class="modal-header" id="headerHistory">
            <h4 class="modal-title">Historial de</h4>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" id="bodyHistory">

        </div>
        <div class="modal-footer" hidden>
            <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="revertChange">
                Reveritr
            </button>
        </div>';
    }
}

if (isset($_POST['Ship'])) {
    if (isset($_POST['Packs'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT quantity FROM `items` WHERE id='" . $_POST['id'] . "'";
        $result = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($result);
        $jsonQuantity = json_decode($row['quantity'], true);
        krsort($jsonQuantity[$_POST['depo']]['Packets']);

        echo '

        <script>
            $(document).ready(function () {
                if(Object.keys(listShip["' . $_POST['row'] . '"]["packs"]).length != 0){
                    $.each( listShip["' . $_POST['row'] . '"]["packs"], function( key, value ) {
                        $(".PacketList tbody tr#Pack"+key+" #amountPackets").val(value);
                    });
                }
            });
        </script>

        <div class="modal-header">
            <h5 class="modal-title">Agregar Paquetes</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <table class="PacketList table table-striped table-bordered">
                <thead>
                    <tr>
                        <th class="col-5 text-white" scope="col">Paquete</th>
                        <th class="col-3 text-white" scope="col">Existencia</th>
                        <th class="col-4 text-white" scope="col">Cantidad</th>
                    </tr>
                </thead>
                <tbody class="table-group-divider overflow-hidden">
                ';
        foreach ($jsonQuantity[$_POST['depo']]['Packets'] as $key => $value) {
            echo '
                        <tr id="Pack' . $key . '">
                            <th class="col-5" scope="col">Paq. de ' . $key . ' Piezas</th>
                            <td class="col-3" scope="col">' . $value . ' Paq.</td>
                            <td class="col-4" scope="col">
                                <div class="input-group" id="operationsPackets">
                                    <button class="btn btn-outline-secondary shadow-none" type="button" data-operation="0">-</button>
                                    <input type="text" id="amountPackets" class="form-control shadow-none" maxinp="' . $value . '" autocomplete="off">
                                    <button class="btn btn-outline-secondary shadow-none" type="button" data-operation="1">+</button>
                                </div>
                            </td>
                        </tr>
                    ';
        }
        echo '
                </tbody>
            </table>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="savePackets" data-row="' . $_POST['row'] . '">
                Agregar
            </button>
        </div>';
    }
}

if (isset($_POST['DataBase'])) {
    if (isset($_POST['Users'])) {
        switch ($_POST['Mode']) {
            case 'New':
                echo '
                    <script>
                        // Puedes añadir aquí cualquier código JavaScript adicional
                    </script>
                    <form id="newUser" autocomplete="off" data-params-post="">
                        <div class="modal-header">
                            <div class="row row-cols-md-1 row-cols-lg-auto w-100">
                                <h1 class="col-12 col-md-3 modal-title fs-4 align-text" id="title" style="color:var(--secondary_text_color)">Nuevo</h1>
                                <nav class="d-flex col-12 col-md-9 justify-content-center justify-content-md-start">
                                    <div class="nav nav-pills" id="nav-tab" role="tablist">
                                        <button class="nav-link active" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="true">
                                            <i class="bi bi-file-earmark-person h4 m-0"></i>
                                        </button>
                                        <button class="nav-link" id="nav-ban-tab" data-bs-toggle="tab" data-bs-target="#nav-ban" type="button" role="tab" aria-controls="nav-ban" aria-selected="false">
                                            <i class="bi bi-exclamation-octagon h4 m-0"></i>
                                        </button>
                                        <button class="nav-link" id="nav-advanced-tab" data-bs-toggle="tab" data-bs-target="#nav-advanced" type="button" role="tab" aria-controls="nav-advanced" aria-selected="false" hidden>
                                            <i class="bi bi-map h4 m-0"></i>
                                        </button>
                                    </div>
                                </nav>
                            </div>
                            <button type="button" class="btn-close me-1" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="tab-content" id="nav-tabContent">
                                <!-- Pestaña de Datos Generales -->
                                <div class="tab-pane fade show active" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">
                                    <div class="d-flex justify-content-center w-100" id="radiosBtnTypeAccount">
                                        <div class="form-check m-2">
                                            <input class="form-check-input shadow-none" type="radio" name="typeAccount" value="0" id="typeAccount_Client" checked>
                                            <label class="form-check-label" for="typeAccount_Client">Cliente</label>
                                        </div>
                                        <div class="form-check m-2">
                                            <input class="form-check-input shadow-none" type="radio" name="typeAccount" value="1" id="typeAccount_Company">
                                            <label class="form-check-label" for="typeAccount_Company">Empresa</label>
                                        </div>
                                        <div class="form-check m-2">
                                            <input class="form-check-input" type="checkbox" id="isUp" name="isUp">
                                            <label class="form-check-label" for="isUp">Mayor?</label>
                                        </div>
                                    </div>
                                    <div class="gy-3 row row-cols-sm-1 row-cols-lg-auto w-100 mt-2">
                                        <div class="col-12 col-sm-6" id="divUser">
                                            <label class="form-label">Usuario</label>
                                            <input type="text" class="form-control shadow-none" name="username" minlength="6" maxlength="32">
                                        </div>
                                        <div class="col-12 col-sm-6" id="divPassword">
                                            <label class="form-label">Contraseña</label>
                                            <input type="text" class="form-control shadow-none" name="password" minlength="6" maxlength="24">
                                        </div>
                                        <div class="col-6" id="divName">
                                            <label class="form-label">Nombre</label>
                                            <input type="text" class="form-control shadow-none" name="name" minlength="2" maxlength="64">
                                        </div>
                                        <div class="col-6" id="divLastName">
                                            <label class="form-label">Apellido</label>
                                            <input type="text" class="form-control shadow-none" name="lastName" minlength="2" maxlength="64">
                                        </div>
                                        <div class="col-sm-12 col-md-6 col-lg-7">
                                            <label class="form-label">Email (Opcional)</label>
                                            <input type="email" class="form-control shadow-none" name="email" minlength="4">
                                        </div>
                                        <div class="col-12 col-sm-6 col-lg-5" id="divPhone">
                                            <label class="form-label">Tlf.</label>
                                            <div class="input-group">
                                                <select class="form-select shadow-none" style="max-width: fit-content;" name="operator">
                                                    ';
                                                    foreach ($typeTlf as $x => $y) {
                                                        echo '<option value="' . $x . '">0' . $y . '</option>';
                                                    }
                echo '                          </select>
                                                <input type="text" class="form-control shadow-none" name="number" minlength="7" maxlength="7" oninput="numberInput(this)">
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-12 col-lg-4" id="divIdent">
                                            <label class="form-label">Identificación</label>
                                            <div class="input-group">
                                                <select class="form-select shadow-none" style="max-width: fit-content;" name="typeIdent">
                                                    ';
                                                    foreach ($typeIdent as $x => $y) {
                                                        echo '<option value="' . $x . '">' . $y . '</option>';
                                                    }
                echo '                          </select>
                                                <input type="text" class="form-control shadow-none" name="numberIdent" minlength="5" maxlength="30" oninput="numberInput(this)">
                                            </div>
                                        </div>
                                        <div class="col-4 col-md-4 col-lg-3" id="divPrice">
                                            <label class="form-label">Precio</label>
                                            <select class="form-select shadow-none" name="price">
                                                ';
                                                for ($i = 0; $i < $price; $i++) {
                                                    echo '<option value="' . $i . '">Precio ' . ($i + 1) . '</option>';
                                                }
                echo '                      </select>
                                        </div>
                                        <div class="col-5 col-md-5 col-lg-3" id="divState">
                                            <label class="form-label">Estado que opera</label>
                                            <select class="form-select shadow-none" name="state">
                                                ';
                                                foreach ($states as $x => $y) {
                                                    echo '<option value="' . $x . '">' . $y . '</option>';
                                                }
                echo '                      </select>
                                        </div>
                                        <div class="col-3 col-md-3 col-lg-2" id="divCredit">
                                            <label class="form-label">Crédito</label>
                                            <input type="number" value="0" class="form-control shadow-none" name="credit">
                                        </div>
                                        <div class="col-12" id="divAdress">
                                            <label class="form-label">Dirección</label>
                                            <textarea class="form-control" rows="2" name="address"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <!-- Pestaña de Baneos -->
                                <div class="tab-pane fade" id="nav-ban" role="tabpanel" aria-labelledby="nav-ban-tab" tabindex="0">
                                    <div class="container mt-3">
                                        <h5 class="mb-3">Opciones de Baneo</h5>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="ban_canLogin" id="ban_canLogin">
                                            <label class="form-check-label" for="ban_canLogin">No puede iniciar sesión (canLogin)</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="ban_canBuy" id="ban_canBuy">
                                            <label class="form-check-label" for="ban_canBuy">No puede comprar (canBuy)</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="ban_full" id="ban_full">
                                            <label class="form-check-label" for="ban_full">Totalmente baneado (ban)</label>
                                        </div>
                                    </div>
                                </div>
                                <!-- Pestaña Avanzada (opcional) -->
                                <div class="tab-pane fade" id="nav-advanced" role="tabpanel" aria-labelledby="nav-advanced-tab" tabindex="1">
                                    <!-- Contenido avanzado opcional -->
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <div class="d-flex align-items-center">
                                <button type="submit" class="btn btn-dark btn-account-primary shadow-none border-0 w-100" data-mdb-ripple-init>Crear</button>
                            </div>
                        </div>
                    </form>
                ';
                break;

            case 'Edit':

                $connObject = new Connection();
                $conn = $connObject->Connect();

                $html = '';
                $sql = "SELECT id, username, acctType, COALESCE(password,''),
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.number')) AS tlfnumber,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.operator')) AS tlfoperator,
                JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.user') AS nameAndLastName,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.email')) AS Email,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.state')) AS State,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.isUp')) AS isUp,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.type')) AS persIdtype,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.idenfication')) AS persIdidenfication,
                JSON_UNQUOTE(JSON_EXTRACT(acctAdvanced,'$.price')) AS Prices,
                
                JSON_UNQUOTE(JSON_EXTRACT(acctAdvanced,'$.banned.canLogin')) AS canLogin,
                JSON_UNQUOTE(JSON_EXTRACT(acctAdvanced,'$.banned.ban')) AS ban,
                JSON_UNQUOTE(JSON_EXTRACT(acctAdvanced,'$.banned.canBuy')) AS canBuy,

                JSON_UNQUOTE(JSON_EXTRACT(acctAdvanced,'$.credit')) AS Credits,
                COALESCE(JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctAddresses,'" . CLAVE_AES . "') AS CHAR),'$[0].address')), '') AS address

                FROM `users` WHERE id='" . $_POST['id'] . "'";
                $result = mysqli_query($conn, $sql);
                if (!mysqli_num_rows($result) > 0) {
                    die();
                }
                $row = mysqli_fetch_assoc($result);

                $lastname = isset(json_decode($row['nameAndLastName'])[1]) ? json_decode($row['nameAndLastName'])[1] : '';

                echo '
                    <script>
                        $(document).ready(function () {
                            $("#divCountry").hide();
                            $(document).find("#editUser input[type=radio][name=\'typeAccount\']").eq(' . $row['acctType'] . ').prop("checked", true).trigger("change");
                            $(document).find("#editUser select[name=\'operator\'] option").eq(' . ($row['tlfoperator']) . ').attr("selected", true);
                            ';
                            if ( isset($row['isUp']) && $row['isUp'] == "true"){
                                echo '$(document).find("#editUser input[name=\'isUp\']").attr("checked", true);';
                            }
                            if ( isset($row['ban']) && $row['ban'] == "true"){
                                echo '$(document).find("#editUser input[name=\'ban_full\']").attr("checked", true);';
                            }
                            if ( isset($row['canLogin']) && $row['canLogin'] == "true"){
                                echo '$(document).find("#editUser input[name=\'ban_canLogin\']").attr("checked", true);';
                            }
                            if ( isset($row['canBuy']) && $row['canBuy'] == "true"){
                                echo '$(document).find("#editUser input[name=\'ban_canBuy\']").attr("checked", true);';
                            }
                            echo '
                            $(document).find("#editUser select[name=\'typeIdent\'] option").eq(' . ($row['persIdtype']) . ').attr("selected", true);
                            $(document).find("#editUser select[name=\'price\'] option").eq(' . ($row['Prices']) . ').attr("selected", true);
                            $(document).find("#editUser select[name=\'state\'] option").eq(' . ($row['State']) . ').attr("selected", true);
                        });
                    </script>
                    
                    <form id="editUser" autocomplete="off" data-params-post="id=' . $row['id'] . '">
                    <div class="modal-header">
                        <div class="row row-cols-md-1 row-cols-lg-auto w-100">        
                            <h1 class="col-12 col-md-3 modal-title fs-4 align-text" id="title" style="color:var(--secondary_text_color)">Editar</h1>   
                            <nav class="d-flex col-12 col-md-9 justify-content-center justify-content-md-start">
                                <div class="nav nav-pills" id="nav-tab" role="tablist">
                                    <button class="nav-link active" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="true">
                                        <i class="bi bi-file-earmark-person h4 m-0"></i>
                                    </button>
                                    <button class="nav-link" id="nav-ban-tab" data-bs-toggle="tab" data-bs-target="#nav-ban" type="button" role="tab" aria-controls="nav-ban" aria-selected="false">
                                        <i class="bi bi-exclamation-octagon h4 m-0"></i>
                                    </button>
                                    <button class="nav-link" id="nav-advanced-tab" data-bs-toggle="tab" data-bs-target="#nav-advanced" type="button" role="tab" aria-controls="nav-advanced" aria-selected="false" hidden>
                                        <i class="bi bi bi-map h4 m-0"></i>
                                    </button>
                                </div>
                            </nav>
                        </div>
                        <button type="button" class="btn-close me-1" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="tab-content" id="nav-tabContent">
                            <div class="tab-pane fade show active" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">        
                                <div class="d-flex justify-content-center w-100" id="radiosBtnTypeAccount">
                                    <div class="form-check m-2">
                                        <input class="form-check-input shadow-none" type="radio" name="typeAccount" value="0" id="typeAccount_Client" checked>
                                        <label class="form-check-label" for="typeAccount_Client">Cliente</label>
                                    </div>
                                    <div class="form-check m-2">
                                        <input class="form-check-input shadow-none" type="radio" name="typeAccount" value="1" id="typeAccount_Company">
                                        <label class="form-check-label" for="typeAccount_Company">Empresa</label>
                                    </div>
                                    <div class="form-check m-2">
                                        <input class="form-check-input" type="checkbox" id="isUp" name="isUp">
                                        <label class="form-check-label" for="isUp">
                                            Mayor?
                                        </label>
                                    </div>
                                </div>
                                <div class="gy-3 row row-cols-sm-1 row-cols-lg-auto w-100 mt-2">          
                                    <div class="col-12 col-sm-6" id="divUser">
                                        <label for="" class="form-label">Usuario</label>
                                        <input type="text" class="form-control shadow-none" name="username" minlength="6" maxlength="32" value="' . $row['username'] . '">
                                    </div>
                                    <div class="col-12 col-sm-6" id="divPassword">
                                        <label for="" class="form-label">Contraseña</label>
                                        <input type="text" class="form-control shadow-none" name="password" placeholder="' . ($row['password'] ?? '***********') . '"  minlength="6" maxlength="24" value="">
                                    </div>   
                                    <div class="col-6" id="divName">
                                        <label for="" class="form-label">Nombre</label>
                                        <input type="text" class="form-control shadow-none" name="name" minlength="2" maxlength="64" value="' . json_decode($row['nameAndLastName'])[0] . '">
                                    </div>
                                    <div class="col-6" id="divLastName">
                                        <label for="" class="form-label">Apellido</label>
                                        <input type="text" class="form-control shadow-none" name="lastName" minlength="2" maxlength="64" value="' . $lastname . '">
                                    </div>
                                    <div class="col-sm-12 col-md-6 col-lg-7">
                                        <label for="" class="form-label">Email (Opcional)</label>
                                        <input type="email" class="form-control shadow-none" name="email" minlength="4" value="' . $row['Email'] . '">
                                    </div>
                                    <div class="col-12 col-sm-6 col-lg-5" id="divPhone">
                                        <label for="" class="form-label">Tlf.</label>
                                        <div class="input-group">
                                            <select class="form-select shadow-none" style="max-width: fit-content;" name="operator">
                                                ';
                                                foreach ($typeTlf as $x => $y) {
                                                    echo '<option value="' . $x . '">0' . $y . '</option>';
                                                }
                                                echo '
                                            </select>
                                            <input type="text" class="form-control shadow-none" name="number" minlength="7" maxlength="8" oninput="numberInput(this)" value="' . $row['tlfnumber'] . '">
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-12 col-lg-4" id="divIdent">
                                        <label for="" class="form-label">Identificación</label>
                                        <div class="input-group" >
                                            <select class="form-select shadow-none" style="max-width: fit-content;" name="typeIdent">
                                                ';
                                                foreach ($typeIdent as $x => $y) {
                                                    echo '<option value="' . $x . '">' . $y . '</option>';
                                                }
                                                echo '
                                            </select>
                                            <input type="text" class="form-control shadow-none" name="numberIdent" minlength="5" maxlength="30" oninput="numberInput(this)" value="' . $row['persIdidenfication'] . '">
                                        </div>
                                    </div>
                                    <div class="col-4 col-md-4 col-lg-3" id="divPrice">
                                        <label for="" class="form-label">Precio</label>
                                        <select class="form-select shadow-none" name="price">
                                            ';
                                            for ($i = 0; $i < $price; $i++) {
                                                echo '<option value="' . $i . '">Precio ' . ($i + 1) . '</option>';
                                            }

                                            echo '
                                        </select>
                                    </div>
                                    <div class="col-5 col-md-5 col-lg-3" id="divState">
                                        <label for="divState" class="form-label">Estado que opera</label>
                                        <select class="form-select shadow-none" name="state">
                                            ';
                                            foreach ($states as $x => $y) {
                                                echo '<option value="' . $x . '">' . $y . '</option>';
                                            }
                                            echo '
                                        </select>
                                    </div>
                                    <div class="col-3 col-md-3 col-lg-2" id="divCredit">
                                        <label for="" class="form-label">Credito</label>
                                        <input type="number" value="' . $row['Credits'] . '" class="form-control shadow-none" name="credit" >
                                    </div>
                                    <div class="col-12" id="divAdress">
                                        <label for="" class="form-label">Direccion</label>
                                        <textarea class="form-control" id="exampleFormControlTextarea1" rows="2" name="address">' . $row['address'] . '</textarea>
                                    </div>
                                </div> 
                            </div>
                            <!-- Pestaña de Baneos -->
                            <div class="tab-pane fade" id="nav-ban" role="tabpanel" aria-labelledby="nav-ban-tab" tabindex="0">
                                <div class="container mt-3">
                                    <h5 class="mb-3">Opciones de Baneo</h5>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="ban_canLogin" id="ban_canLogin">
                                        <label class="form-check-label" for="ban_canLogin">No puede iniciar sesión (canLogin)</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="ban_canBuy" id="ban_canBuy">
                                        <label class="form-check-label" for="ban_canBuy">No puede comprar (canBuy)</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="ban_full" id="ban_full">
                                        <label class="form-check-label" for="ban_full">Totalmente baneado (ban)</label>
                                    </div>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="nav-advanced" role="tabpanel" aria-labelledby="nav-advanced-tab" tabindex="1">
                                
                            </div>
                        </div>   

                    </div>
                    <div class="modal-footer">
                        <div class="d-flex align-items-center">
                            <button type="submit" class="btn btn-dark btn-account-primary shadow-none border-0 w-100"
                                data-mdb-ripple-init>Editar</button>
                        </div>
                    </div>
                    </form>
                    ';
                break;

            case 'ShowClients':
                $connObject = new Connection();
                $conn = $connObject->Connect();

                $sql = "SELECT id,
                JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.user') AS nameAndLastName,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.type')) AS persIdtype,
                JSON_UNQUOTE(JSON_EXTRACT(acctAdvanced,'$.banned.canLogin')) AS canLogin,
                JSON_UNQUOTE(JSON_EXTRACT(acctAdvanced,'$.banned.ban')) AS ban,
                JSON_UNQUOTE(JSON_EXTRACT(acctAdvanced,'$.banned.canBuy')) AS canBuy,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.idenfication')) AS persIdidenfication
                FROM `users`";

                $result = mysqli_query($conn, $sql);
                if (mysqli_num_rows($result) > 0) {
                    echo '
                    <script>
                    </script>
                    
                    <div class="modal-header">
                        <h5 class="modal-title">Buscar Cliente</h5>
                    </div>
                    <div class="modal-body">
                        <div class="input-group mb-3">
                            <input type="text" class="form-control shadow-none" placeholder="Buscar" aria-label="Buscar" autofocus oninput="this.value = this.value.toUpperCase();" aria-describedby="button-addon2" id="qinputClient">
                            <button class="btn btn-outline-dark" type="button" id="qsearch">Buscar</button>
                        </div>
                        <table class="ClientList table table-striped table-bordered table-scroll">
                            <thead>
                                <tr>
                                    <th class="col-3 text-light" scope="col">Cliente</th>
                                    <th class="col-8 text-light" scope="col">Nombre</th>
                                    <th class="col-1 text-light" scope="col"></th>
                                </tr>
                            </thead>
                            <div>
                            <tbody class="table-group-divider" style="max-height: 26rem;">';
                            while ($row = mysqli_fetch_assoc($result)) {
                                $isDisabled = ($row["canBuy"] == "true" || $row["ban"] == "true");
                                echo '
                                    <tr id="client_' . $row['id'] . '"' . ($isDisabled ? ' class="disabled-row" style="background-color: #f2f2f2; color: #999;"' : '') . '>
                                        <th class="col-3" scope="row">' . $typeIdent[$row['persIdtype']] . '-' . $row['persIdidenfication'] . '</th>
                                        <td class="col-8">
                                            <span class="d-inline-block text-truncate" style="max-width: 70%;">
                                                ' . implode(' ', json_decode($row['nameAndLastName'])) . '
                                            </span>
                                            '. ( $isDisabled ? "<span class=\"d-inline-block text-truncate\" style=\"max-width: 30%;\">    (Baneado)</span>" : "") .'

                                        </td>
                                        <td class="col-1">
                                            <input class="form-check-input" value="' . $row['id'] . '" data-type-ident="' . $row['persIdtype'] . '" data-ident="' . $row['persIdidenfication'] . '" data-name="' . implode(' ', json_decode($row['nameAndLastName'])) . '" type="radio" name="clientlist"' . ($isDisabled ? ' disabled' : '') . '>
                                        </td>
                                    </tr>
                                    ';
                            }
                    echo '    
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-dark disabled" data-bs-dismiss="modal" id="setClient">
                            Agregar
                        </button>
                    </div>';
                } else {
                    echo "
                    <script>
                        $(document).ready(function () {
                            new modalPinesJM().close()
                        });
                    </script>";
                }
                break;
        }
    } elseif (isset($_POST['Departaments'])) {
        switch ($_POST['Mode']) {
            case 'New':
                $connObject = new Connection();
                $conn = $connObject->Connect();

                $sql = "SELECT id,
                JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.user') AS nameAndLastName,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.type')) AS persIdtype,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.idenfication')) AS persIdidenfication
                FROM `users`";

                $result = mysqli_query($conn, $sql);

                $rows = array();
                while ($row = mysqli_fetch_assoc($result)) {
                    $rows[] = $row;
                }

                echo '
                <script>
                    $(document).ready(function () {
                        $(document).find("input#discount").maskMoney();
                    });
                </script>

                <form id="newDepa" autocomplete="off">
                    <div class="modal-header">
                        <div class="row row-cols-md-1 row-cols-lg-auto w-100">        
                            <h1 class="col-12 col-md-3 modal-title fs-4 align-text" id="title" style="color:var(--secondary_text_color)">Nuevo</h1>   
                            <nav class="d-flex col-12 col-md-9 justify-content-center justify-content-md-start">
                                <div class="nav nav-pills" id="nav-tab" role="tablist">
                                    <button class="nav-link active" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="true">
                                        <i class="bi bi-house-door-fill h4 m-0"></i>
                                    </button>
                                    <button class="nav-link" id="nav-blacklist-tab" data-bs-toggle="tab" data-bs-target="#nav-blacklist" type="button" role="tab" aria-controls="nav-advanced" aria-selected="false">
                                        <i class="bi bi-person-x h4 m-0"></i>
                                    </button>
                                    <button class="nav-link" id="nav-discount-tab" data-bs-toggle="tab" data-bs-target="#nav-discount" type="button" role="tab" aria-controls="nav-advanced" aria-selected="false">
                                        <i class="bi bi-percent h4 m-0"></i>
                                    </button>
                                </div>
                            </nav>
                        </div>
                        <button type="button" class="btn-close me-1" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="tab-content" id="nav-tabContent">
                            <div class="tab-pane fade show active" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">
                                
                                <div class="gy-3 row row-cols-sm-1 row-cols-lg-auto w-100 mt-2">          
                                    <div class="col-12">
                                        <label for="" class="form-label">Nombre del Departamento</label>
                                        <input type="text" class="form-control shadow-none" name="depa">
                                    </div>
                                    <div class="col-12">
                                        <label for="" class="form-label">Descripcion del Departamento</label>
                                        <textarea class="form-control shadow-none" rows="3" name="desc"></textarea>
                                    </div>   
                                    <div class="col-2">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" value="" name="hide" id="hide">
                                            <label class="form-check-label" for="hide">
                                                Ocultar
                                            </label>
                                        </div>
                                    </div>
                                </div> 
                            </div>
                            <div class="tab-pane fade" id="nav-blacklist" role="tabpanel" aria-labelledby="nav-blacklist-tab" tabindex="1">';
                if (mysqli_num_rows($result) > 0) {
                    echo '    
                                <h1 class="modal-title fs-4 align-text" id="clientTitle" style="color:var(--secondary_text_color)">Clientes Excluidos [0]</h1>   
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control shadow-none" placeholder="Buscar" aria-label="Buscar" autofocus oninput="this.value = this.value.toUpperCase();" aria-describedby="button-addon2" id="qinputBlck">
                                    <button class="btn btn-outline-dark" type="button" id="qsearch">Buscar</button>
                                </div>
                                <table class="ClientList table table-striped table-bordered table-scroll">
                                    <thead>
                                        <tr>
                                            <th class="col-3 text-light" scope="col">Cliente</th>
                                            <th class="col-8 text-light" scope="col">Nombre</th>
                                            <th class="col-1 text-light" scope="col"></th>
                                        </tr>
                                    </thead>
                                    <div>
                                    <tbody class="table-group-divider" style="max-height: 26rem;">';
                    foreach ($rows as $row) {
                        echo '
                                    <tr id="client_' . $row['id'] . '">
                                        <th class="col-3" scope="row">' . $typeIdent[$row['persIdtype']] . '-' . $row['persIdidenfication'] . '</th>
                                        <td class="col-8">
                                            <span class="d-inline-block text-truncate" style="max-width: 95%;">
                                                ' . implode(' ', json_decode($row['nameAndLastName'])) . '
                                            </span>
                                        </td>
                                        <td class="col-1">
                                            <input class="form-check-input" value="' . $row['id'] . '" type="checkbox" id="clientBlackList">
                                        </td>
                                    </tr>
                                    ';
                    }

                    echo '    
                                    </tbody>
                                </table>';
                }
                echo '
                            </div>
                            <div class="tab-pane fade" id="nav-discount" role="tabpanel" aria-labelledby="nav-discount-tab" tabindex="2">';
                if (mysqli_num_rows($result) > 0) {
                    echo '    
                                <h1 class="modal-title fs-4 align-text" id="clientTitle" style="color:var(--secondary_text_color)">Clientes con Descuentos [0]</h1>   
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control shadow-none" placeholder="Buscar" aria-label="Buscar" autofocus oninput="this.value = this.value.toUpperCase();" aria-describedby="button-addon2" id="qinputDisct">
                                    <button class="btn btn-outline-dark" type="button" id="qsearch">Buscar</button>
                                </div>
                                <table class="ClientList table table-striped table-bordered table-scroll">
                                    <thead>
                                        <tr>
                                            <th class="col-3 text-light" scope="col">Cliente</th>
                                            <th class="col-6 text-light" scope="col">Nombre</th>
                                            <th class="col-3 text-light" scope="col"></th>
                                        </tr>
                                    </thead>
                                    <div>
                                    <tbody class="table-group-divider" style="max-height: 26rem;">';
                    foreach ($rows as $row) {
                        echo '
                                    <tr id="client_' . $row['id'] . '">
                                        <th class="col-3" scope="row">' . $typeIdent[$row['persIdtype']] . '-' . $row['persIdidenfication'] . '</th>
                                        <td class="col-6">
                                            <span class="d-inline-block text-truncate" style="max-width: 95%;">
                                                ' . implode(' ', json_decode($row['nameAndLastName'])) . '
                                            </span>
                                        </td>
                                        <td class="col-3 discountContainer">
                                            <div class="input-group">
                                                <input type="text" class="form-control" placeholder="Ninguno" oninput="numberInput(this)" id="discount" autocomplete="off" data-precision="2">
                                                <span class="input-group-text" id="basic-addon1">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" value="' . $row['id'] . '" id="percent' . $row['id'] . '">
                                                        <label class="form-check-label" for="percent' . $row['id'] . '">
                                                            %
                                                        </label>
                                                    </div>
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                    ';
                    }

                    echo '    
                                    </tbody>
                                </table>';
                }
                echo '
                            </div>
                        </div>   

                    </div>
                    <div class="modal-footer">
                        <div class="d-flex align-items-center">
                            <button type="submit" class="btn btn-dark btn-account-primary shadow-none border-0 w-100"
                                >Crear</button>
                        </div>
                    </div>
                </form>';
                break;
            case 'Edit':
                $connObject = new Connection();
                $conn = $connObject->Connect();

                $sql = "SELECT id,
                JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.user') AS nameAndLastName,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.type')) AS persIdtype,
                JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.idenfication')) AS persIdidenfication
                FROM `users`";
                $result = mysqli_query($conn, $sql);
                $rows = array();
                while ($row = mysqli_fetch_assoc($result)) {
                    $rows[] = $row;
                }

                $sql = "SELECT `name`, `description`, `advanced` FROM `departments` WHERE uuid='" . $_POST['uuid'] . "'";
                $depa = mysqli_query($conn, $sql);
                if (mysqli_num_rows($depa) <= 0) {
                    die("
                    <script>
                        $(document).ready(function () {
                            new modalPinesJM().close()
                        });
                    </script>");
                }
                $deparow = mysqli_fetch_assoc($depa);
                $advanced = json_decode($deparow['advanced'], true);
                $hide = ($advanced['hide'] == true) ? "true" : "false";





                echo '
                <script>
                    $(document).ready(function () {
                        $(document).find("input#discount").maskMoney();
                        $("#hide").prop("checked",' . $hide . ');
                        blcklist = ' . json_encode($advanced['blackList']) . ';
                        discount = ' . json_encode($advanced['discount']) . ';
                        $.each(' . json_encode($advanced['blackList']) . ', function( index, value ) {
                            $("#nav-blacklist #clientBlackList[value=\'"+value+"\']").prop("checked", true);
                        });
                        $.each(' . json_encode($advanced['discount']) . ', function( index, value ) {
                            $("#nav-discount tbody tr#client_" + index + " input#discount").val(value[0]);
                            $("#nav-discount tbody tr#client_" + index + " input[type=\'checkbox\']").prop("checked", value[1]);
                        });
                    });
                </script>
                <form id="editDepa" autocomplete="off" data-params-post="uuid=' . $_POST['uuid'] . '">
                    <div class="modal-header">
                        <div class="row row-cols-md-1 row-cols-lg-auto w-100">        
                            <h1 class="col-12 col-md-7 modal-title fs-4 align-text" id="title" style="color:var(--secondary_text_color)">Editar [' . $deparow['name'] . ']</h1>   
                            <nav class="d-flex col-12 col-md-5 justify-content-center justify-content-md-start">
                                <div class="nav nav-pills" id="nav-tab" role="tablist">
                                    <button class="nav-link active" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="true">
                                        <i class="bi bi-house-door-fill h4 m-0"></i>
                                    </button>
                                    <button class="nav-link" id="nav-blacklist-tab" data-bs-toggle="tab" data-bs-target="#nav-blacklist" type="button" role="tab" aria-controls="nav-advanced" aria-selected="false">
                                        <i class="bi bi-person-x h4 m-0"></i>
                                    </button>
                                    <button class="nav-link" id="nav-discount-tab" data-bs-toggle="tab" data-bs-target="#nav-discount" type="button" role="tab" aria-controls="nav-advanced" aria-selected="false">
                                        <i class="bi bi-percent h4 m-0"></i>
                                    </button>
                                </div>
                            </nav>
                        </div>
                        <button type="button" class="btn-close me-1" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="tab-content" id="nav-tabContent">
                            <div class="tab-pane fade show active" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">
                                
                                <div class="gy-3 row row-cols-sm-1 row-cols-lg-auto w-100 mt-2">          
                                    <div class="col-12">
                                        <label for="" class="form-label">Nombre del Departamento</label>
                                        <input type="text" class="form-control shadow-none" name="depa" value="' . $deparow['name'] . '">
                                    </div>
                                    <div class="col-12">
                                        <label for="" class="form-label">Descripcion del Departamento</label>
                                        <textarea class="form-control shadow-none" rows="3" name="desc">' . $deparow['description'] . '</textarea>
                                    </div>   
                                    <div class="col-2">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="hide" id="hide">
                                            <label class="form-check-label" for="hide">
                                                Ocultar
                                            </label>
                                        </div>
                                    </div>
                                </div> 
                            </div>
                            <div class="tab-pane fade" id="nav-blacklist" role="tabpanel" aria-labelledby="nav-blacklist-tab" tabindex="1">';
                if (mysqli_num_rows($result) > 0) {
                    echo '    
                                <h1 class="modal-title fs-4 align-text" id="clientTitle" style="color:var(--secondary_text_color)">Clientes Excluidos [' . count($advanced['blackList']) . ']</h1>   
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control shadow-none" placeholder="Buscar" aria-label="Buscar" autofocus oninput="this.value = this.value.toUpperCase();" aria-describedby="button-addon2" id="qinputClient">
                                    <button class="btn btn-outline-dark" type="button" id="qsearch">Buscar</button>
                                </div>
                                <table class="ClientList table table-striped table-bordered table-scroll">
                                    <thead>
                                        <tr>
                                            <th class="col-3 text-light" scope="col">Cliente</th>
                                            <th class="col-8 text-light" scope="col">Nombre</th>
                                            <th class="col-1 text-light" scope="col"></th>
                                        </tr>
                                    </thead>
                                    <div>
                                    <tbody class="table-group-divider" style="max-height: 26rem;">';
                    foreach ($rows as $row) {
                        echo '
                                    <tr id="client_' . $row['id'] . '">
                                        <th class="col-3" scope="row">' . $typeIdent[$row['persIdtype']] . '-' . $row['persIdidenfication'] . '</th>
                                        <td class="col-8">
                                            <span class="d-inline-block text-truncate" style="max-width: 95%;">
                                                ' . implode(' ', json_decode($row['nameAndLastName'])) . '
                                            </span>
                                        </td>
                                        <td class="col-1">
                                            <input class="form-check-input" value="' . $row['id'] . '" type="checkbox" id="clientBlackList">
                                        </td>
                                    </tr>
                                    ';
                    }

                    echo '    
                                    </tbody>
                                </table>';
                }
                echo '
                            </div>
                            <div class="tab-pane fade" id="nav-discount" role="tabpanel" aria-labelledby="nav-discount-tab" tabindex="2">';
                if (mysqli_num_rows($result) > 0) {
                    echo '    
                                <h1 class="modal-title fs-4 align-text" id="clientTitle" style="color:var(--secondary_text_color)">Clientes con Descuentos [' . count($advanced['discount']) . ']</h1>   
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control shadow-none" placeholder="Buscar" aria-label="Buscar" autofocus oninput="this.value = this.value.toUpperCase();" aria-describedby="button-addon2" id="qinputDisct">
                                    <button class="btn btn-outline-dark" type="button" id="qsearch">Buscar</button>
                                </div>
                                <table class="ClientList table table-striped table-bordered table-scroll">
                                    <thead>
                                        <tr>
                                            <th class="col-3 text-light" scope="col">Cliente</th>
                                            <th class="col-6 text-light" scope="col">Nombre</th>
                                            <th class="col-3 text-light" scope="col"></th>
                                        </tr>
                                    </thead>
                                    <div>
                                    <tbody class="table-group-divider" style="max-height: 26rem;">';
                    foreach ($rows as $row) {
                        echo '
                                    <tr id="client_' . $row['id'] . '">
                                        <th class="col-3" scope="row">' . $typeIdent[$row['persIdtype']] . '-' . $row['persIdidenfication'] . '</th>
                                        <td class="col-6">
                                            <span class="d-inline-block text-truncate" style="max-width: 95%;">
                                                ' . implode(' ', json_decode($row['nameAndLastName'])) . '
                                            </span>
                                        </td>
                                        <td class="col-3 discountContainer">
                                            <div class="input-group">
                                                <input type="text" class="form-control" placeholder="Ninguno" oninput="numberInput(this)" id="discount" autocomplete="off" data-precision="2">
                                                <span class="input-group-text" id="basic-addon1">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" value="' . $row['id'] . '" id="percent' . $row['id'] . '">
                                                        <label class="form-check-label" for="percent' . $row['id'] . '">
                                                            %
                                                        </label>
                                                    </div>
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                    ';
                    }

                    echo '    
                                    </tbody>
                                </table>';
                }
                echo '
                            </div>
                        </div>   

                    </div>
                    <div class="modal-footer">
                        <div class="d-flex align-items-center">
                            <button type="submit" class="btn btn-dark btn-account-primary shadow-none border-0 w-100" 
                            >Guardar Cambios</button>
                        </div>
                    </div>
                </form>';
                break;
        }
    }
}

if (isset($_POST['ShowErrors'])) {
    echo '<script>
        $(document).ready(function () {
            var errors = {
                100: ["list-group-item-danger","exclamation-octagon-fill text-danger-emphasis"],
                130: ["list-group-item-danger","exclamation-octagon-fill text-danger-emphasis"],
                150: ["list-group-item-warning","exclamation-triangle-fill text-warning-emphasis"],
                200: ["list-group-item-info","exclamation-circle-fill text-info-emphasis"]
            };
            
        ';
    if (isset($_POST['Ship'])) {
        echo '
            var txt = "";
            $.each(' . $_POST['logs'] . ', function( key, value ) {
                txt += `<li class="list-group-item ${errors[value[1]][0]}"><i class="bi bi-${errors[value[1]][1]}"></i>${listShip[key]["code"]} --> ${value[0]}</li>`
            });
            $("#logsErr").html(txt);
            $.each(' . $_POST['logs'] . ', function (key, value) {
                switch (value[1]) {
                    case 100:
                        delete listShip[key];
                        $(document).find(".ShipmentList tbody #"+key).remove();
                        break;
    
                    case 130:
                        delete listShip[key]["packs"][value[2]];
                        $(document).find(".ShipmentList tbody #"+key+" #total p").text(JSON.stringify(listShip[key]["packs"]));
                        break;
    
                    case 150:
                        delete listShip[key];
                        $(document).find(".ShipmentList tbody #"+key).remove();
                        break;
    
                    case 200:
                        listShip[key]["packs"][value[2]] = value["packets"][value[2]];
                        $(document).find(".ShipmentList tbody #"+key+" #total p").text(JSON.stringify(listShip[key]["packs"]));
                        break;
                }
            });
            new Core().sendverify();
            new Core().update();
            });
            </script>';
    } elseif (isset($_POST['Cart'])) {
        echo '
        var txt = "";
        $.each(' . $_POST['logs'] . ', function( key, value ) {
            txt += `<li class="list-group-item ${errors[value[1]][0]}"><i class="bi bi-${errors[value[1]][1]}"></i>${Session.val.items[key]["code"]} --> ${value[0]}</li>`
        });
        $("#logsErr").html(txt);
        $.each(' . $_POST['logs'] . ', function (key, value) {
            switch (value[1]) {
                case 100:
                    delete Session.val.items[key];
                    $(document).find(".CartList tbody #"+key).remove();
                    break;

                case 130:
                    delete Session.val.items[key]["packs"][value[2]];
                    new Core().loadPackets({"key":key,"packs":value["packets"]});
                    break;
                case 150:
                    delete Session.val.items[key];
                    $(document).find(".CartList tbody #"+key).remove();
                    break;

                case 200:
                    Session.val.items[key]["packs"][value[2]] = value["packets"][value[2]];
                    new Core().loadPackets({"key":key,"packs":value["packets"]});
                    break;
            }

        });
        Session.Save();
        new Core().updateRowAndFooter();
        });
        </script>';
    }

    echo '<div class="modal-header">
            <h5 class="modal-title">Log Errors</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <ul class="list-group w-100" id="logsErr">
            </ul>
            <br>
            <p class="m-0 p-0">Los Erores Se Solucionan Automaticamente</p>
        </div>';
}

if (isset($_POST['FinishBuy'])) {
    $mode = ["", "", "checked"];
    if ($_POST['mode'] == 1) {
        $mode[0] = '
        <input type="radio" class="btn-check" value="pedding" name="motorBase" id="option4" autocomplete="off" checked>
        <label class="btn btn-outline-dark shadow-none" for="option4">
            <i class="bi bi-clipboard-check me-2"></i>Pendientes
        </label>';
        $mode[1] = '
        <div class="tab-motor pedding mt-4">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title mb-3" style="color:var(--primary_color)">
                        <i class="bi bi-clock-history me-2"></i>Gestión de Pendientes
                    </h5>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <h6 class="form-label">Estado</h6>
                            <select class="form-select" aria-label="Seleccionar Estado" id="status">';
                            
                            foreach ($retained as $key => $value) {
                                if ($key == 3) {
                                    break;
                                }
                                $mode[1] .= "<option value='$key'>$value</option>";
                            }
                            
                            $mode[1] .= '
                            </select>
                        </div>
                        <div class="col-md-8">
                            <h6 class="form-label">Descripción Detallada</h6>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-chat-text"></i></span>
                                <textarea class="form-control" rows="2" id="coment" placeholder="Ingrese comentarios adicionales"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="alert alert-info mt-3 mb-0" role="alert">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-exclamation-triangle me-2 fs-4"></i>
                            <div>
                                <h6 class="mb-1">Importante</h6>
                                <p class="mb-0">Este estado se guardará con los detalles proporcionados. Asegúrese de seleccionar el estado correcto.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>';
        $mode[2] = "";
    }
    echo '
    <script>
    $(document).ready(function () {
        $(document).find(".pinesjm").hide();
        $(document).find(".chrystal").hide();
        $("#nameClient").text(`${Session.val.client[2]}`)
        var total = 0;
        $.each(Session.val.items, function (a, b) {
            $.each(b["packs"], function (p, n) {
                total += p * n;
            });
        });
        $("#totalQuantity").text(`${total}`)

    });
    </script>

    <div class="modal-header text-white" style="background-color: var(--primary_color);">
        <h4 class="modal-title fw-bold mb-0">
            <i class="bi bi-cart-check me-2"></i>Finalización de Compra
        </h4>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>

    <div id="main" class="modal-body p-4">
        <div class="row g-4">
            <div class="col-md-6">
                <div class="card shadow-sm border-0 bg-light">
                    <div class="card-body">
                        <h6 class="card-subtitle text-muted mb-3">Información del Cliente</h6>
                        <div class="mb-2">
                            <span class="fw-bold d-block">Nombre:</span>
                            <small id="nameClient" class="d-block">NAN</small>
                        </div>
                        <div class="mb-2">
                            <span class="fw-bold">Total de Productos:</span>
                            <small id="totalQuantity" class="text-success d-block">NAN</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card shadow-sm border-0 bg-light">
                    <div class="card-body">
                        <h6 class="card-subtitle text-muted mb-3">Selección de Plataforma</h6>
                        <div class="btn-group w-100" role="group" aria-label="Plataforma de Venta">
                            ' . $mode[0] . '
                            
                            <input type="radio" class="btn-check" value="chrystal" name="motorBase" id="option5" autocomplete="off" ' . $mode[2] . '>
                            <label class="btn btn-outline-dark shadow-none" for="option5">
                                <i class="bi bi-gem me-2"></i>Chrystal
                            </label>

                            <input type="radio" class="btn-check" value="pinesjm" name="motorBase" id="option6" autocomplete="off">
                            <label class="btn btn-outline-dark shadow-none" for="option6">
                                <i class="bi bi-tree me-2"></i>PinesJM
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        ' . $mode[1] . '

        <div class="tab-motor pinesjm mt-4">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title mb-3" style="color:var(--primary_color)">
                        <i class="bi bi-tree me-2"></i>Detalles PinesJM
                    </h5>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <h6 class="form-label">Tipo de Documento (*)</h6>
                            <select class="form-select" aria-label="Tipo de Documento" id="typedocument">
                                <option value="0">Presupuesto</option>
                                <option value="1">Nota de Entrega</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <h6 class="form-label">Nr. de Documento (*)</h6>
                            <input type="text" class="form-control" id="nrdocument" oninput="numberInput(this)" autocomplete="off">
                        </div>
                        <div class="col-md-4">
                            <h6 class="form-label">Crédito</h6>
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Auto" oninput="numberInput(this)" id="JMcredit" autocomplete="off">
                                <input type="date" class="form-control" id="dateCredit" autocomplete="off" style="opacity: 0;position: absolute;pointer-events: none;">
                                <label for="dateCredit" class="input-group-text">
                                    <i class="bi bi-calendar-date"></i>
                                </label>
                                <span class="input-group-text">Días</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6 class="form-label">Descuento</h6>
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Ninguno" oninput="numberInput(this)" id="JMdiscount" autocomplete="off">
                                <div class="input-group-text">
                                    <div class="form-check mb-0">
                                        <input class="form-check-input" type="checkbox" id="JMdiscountPercent">
                                        <label class="form-check-label" for="JMdiscountPercent">%</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6 class="form-label">Comentarios</h6>
                            <input type="text" class="form-control" placeholder="Vacío" id="JMcoment" autocomplete="off">
                        </div>
                    </div>
                    <div class="alert alert-info mt-3 mb-0" role="alert">
                        <i class="bi bi-exclamation-circle me-2"></i>
                        Esto no realizará ninguna acción en Chrystal. Los campos marcados con (*) son obligatorios.
                    </div>
                </div>
            </div>
        </div>

        <div class="tab-motor chrystal mt-4">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title mb-3" style="color:var(--primary_color)">
                        <i class="bi bi-gem me-2"></i>Detalles Chrystal
                    </h5>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <h6 class="form-label">Crédito (*)</h6>
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Auto" oninput="numberInput(this)" id="Crycredit" autocomplete="off">
                                <input type="date" class="form-control" id="dateCredit" autocomplete="off" style="opacity: 0;position: absolute;pointer-events: none;">
                                <label for="dateCredit" class="input-group-text">
                                    <i class="bi bi-calendar-date"></i>
                                </label>
                                <span class="input-group-text">Días</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6 class="form-label">Descuento</h6>
                            <div class="input-group">
                                <input type="text" class="form-control" placeholder="Ninguno" oninput="numberInput(this)" id="Crydiscount" autocomplete="off">
                                <div class="input-group-text">
                                    <div class="form-check mb-0">
                                        <input class="form-check-input" type="checkbox" id="CrydiscountPercent">
                                        <label class="form-check-label" for="CrydiscountPercent">%</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <h6 class="form-label">Comentarios</h6>
                            <input type="text" class="form-control" placeholder="Vacío" id="Crycoment" autocomplete="off">
                        </div>
                    </div>
                    <div class="alert alert-info mt-3 mb-0" role="alert">
                        <i class="bi bi-exclamation-circle me-2"></i>
                        Esta compra se realizará primero en Presupuesto y luego se puede pasar a Nota. Los campos marcados con (*) son obligatorios.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="verifyList" class="modal-body p-4" hidden>
        <div class="row g-4 mb-4">
                <div class="col-12 grid-container" style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 1rem;">
                    
                    <div style="grid-column: 1; grid-row: 1;">
                        <div class="text-center mb-4">
                            <h3 class="fw-bold" style="color:var(--primary_color)">Paso de Verificación</h3>
                            <h5 class="text-secondary" id="codePassed">Productos Revisados</h5>
                            <hr class="mx-auto" style="width: 50%;">
                        </div>
                    </div>

                    <div style="grid-column: 2; grid-row: 1 / span 2; display: flex; justify-content: center; align-items: center;">
                        <img src="./resc/img/No-Image-Placeholder.png" 
                            class="rounded shadow-sm img-thumbnail" 
                            alt="Imagen del producto" 
                            style="width: 230px; height: 230px; object-fit: contain;">
                    </div>

                    <div style="grid-column: 1; grid-row: 2;">
                        <div class="input-group input-group-lg">
                            <span class="input-group-text bg-light">
                                <i class="bi bi-upc-scan"></i>
                            </span>
                            <input type="text" 
                                class="form-control form-control-lg shadow-sm" 
                                id="codeV" 
                                placeholder="Ingresa Código" 
                                oninput="this.value = this.value.toUpperCase()">
                        </div>
                    </div>
                </div>
            </div>

        <div class="row g-4">
            <div class="col-md-5">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title mb-3" style="color:var(--primary_color)">
                            <i class="bi bi-info-circle me-2"></i>
                            Información del Producto
                        </h5>
                        <div class="mb-3">
                            <h6 class="fw-bold" id="quantityTotalV">
                                <i class="bi bi-123 me-2"></i>
                                Cantidad Requerida:
                            </h6>
                            <h6 class="fw-bold" id="depositV">
                                <i class="bi bi-building me-2"></i>
                                Depósito:
                            </h6>
                        </div>
                        <h6 class="text-muted text-center mb-3">
                            <i class="bi bi-box me-2"></i>Paquetes
                        </h6>
                        <div class="row" id="quantityV">
                            <!-- Contenido dinámico -->
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-7">
                <div class="card shadow-sm">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th class="px-3">
                                            <i class="bi bi-hash me-2"></i>Código
                                        </th>
                                        <th class="px-3">
                                            <i class="bi bi-flag me-2"></i>Estado
                                        </th>
                                        <th class="px-3">
                                            <i class="bi bi-gear me-2"></i>Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="table-group-divider" 
                                    style="max-height: 25vh; overflow-y: auto;">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    </div>
     <div class="modal-footer bg-light">
        <button type="button" class="btn btn-outline-secondary" id="backToMain" hidden>
            <i class="bi bi-arrow-left me-2"></i>Atrás
        </button>
        <button type="button" class="btn btn-outline-dark" id="skipVerify" hidden>
            <i class="bi bi-skip-forward me-2"></i>Omitir
        </button>
        <button type="button" class="btn btn-dark" id="finishBuy" step="0">
            <i class="bi bi-check-circle me-2"></i><span>Guardar</span>
        </button>
    </div>';
}

if (isset($_POST['Sales'])) {
    if (isset($_POST['View'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT nr, type, 
        JSON_VALUE(CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR), '$[2]') as client, buy, 
        JSON_UNQUOTE(JSON_EXTRACT(`event`,CONCAT(\"$[\",JSON_LENGTH(`event`)-1,\"].event\"))) as status,
        JSON_UNQUOTE(JSON_EXTRACT(`event`,CONCAT(\"$[\",JSON_LENGTH(`event`)-1,\"].date\"))) as date,
        JSON_UNQUOTE(JSON_EXTRACT(`event`,CONCAT(\"$[\",JSON_LENGTH(`event`)-1,\"].coment\"))) as coments,
        JSON_UNQUOTE(JSON_EXTRACT(`event`,'$[0].date')) as created,
        CAST(AES_DECRYPT(paids,'" . CLAVE_AES . "') AS CHAR) as paids,
        JSON_VALUE(advanced,'$.additionals.coment') as coment, 
        JSON_VALUE(advanced,'$.additionals.name') as name,
        JSON_VALUE(advanced,'$.additionals.credit') as credit, 
        JSON_VALUE(advanced,'$.additionals.discount') as discount FROM `sales` WHERE uuid='" . $_POST['uuid'] . "'";
        $result = mysqli_query($conn, $sql);



        if (mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);



            $buttons = '';

            if ($row['status'] != 3 && $row['status'] != 4) {
                if ($row['type'] == 1) {
                    $buttons .= '
                        <button type="button" class="btn btn-dark shadow-none" data-bs-dismiss="modal" aria-label="Close" id="cancelBuy"><i class="bi bi-trash"></i> Anular</button>
                        <button type="button" class="btn btn-dark shadow-none" id="addPay" doc-uuid="' . $_POST['uuid'] . '" style="display: none;"><i class="bi bi-plus-square text-light"></i> Pago</button>';
                    if ($row['status'] == 0 || $row['status'] == 1) {
                        $buttons .= '
                            <button type="button" class="btn btn-dark shadow-none" id="saveStatus" doc-uuid="' . $_POST['uuid'] . '"><i class="bi bi-floppy-fill"></i> Guardar</button>
                        ';
                    } else if ($row['status'] == 2) {
                        $buttons .= '
                            <button type="button" class="btn btn-dark shadow-none" id="reportBuy"><i class="bi bi-file-earmark"></i> Reporte</button>
                        ';
                    }
                } else {
                    $buttons .= '
                        <button type="button" class="btn btn-dark shadow-none" data-bs-dismiss="modal" aria-label="Close" id="cancelBuy"><i class="bi bi-trash"></i> Anular</button>
                        <button type="button" class="btn btn-dark shadow-none" id="goToNote"><i class="bi bi-truck"></i> Pasar A Nota</button>
                    ';
                }
            }
            $typeDoc = ($row['type'] == 1) ? '' : 'hidden';
            $date = new DateTime($row['date']);
            $created = new DateTime($row['created']);
            $discountRow = json_decode($row['discount']);
            $discount = (empty($discountRow[0])) ? "No Tiene" : (($discountRow[1] == true) ? $discountRow[0] . "%" : $discountRow[0] . "$");

            ['cost' => $Cost, 'total' => $Total, 'buys' => $buyContent] = calculatePrices($row);

            $sum = 0;
            foreach (json_decode($row["paids"], true) as $key => $value) $sum += floatval($value["ammount"]);

            $creditStatus = function($row, $sum, $Cost) {
                if ($row["status"] != 2) {
                    return '
                    <span class="badge bg-secondary d-flex align-items-center fs-6">
                        <i class="bi bi-dash-circle pe-2"></i>
                        No Entregada
                    </span>';
                }
            
                if ($sum >= $Cost) {
                    return '
                    <span class="badge bg-success d-flex align-items-center fs-6">
                        <i class="bi bi-check-circle-fill pe-2"></i>
                        Pagado
                    </span>';
                }
            
                $overDueData = isOverdue($row['date'], $row['credit']);
                
                if ($overDueData['isOverdue']) {
                    $color = 'danger';
                    $icon = 'bi-exclamation-triangle-fill';
                    $text = "Vencida: " . getRemainingTimeString($overDueData);
                } else {
                    $color = 'primary';
                    $icon = 'bi-clock-fill';
                    $text = "Credito: " . getRemainingTimeString($overDueData);
                }
            
                return '
                <span class="badge bg-' . $color . ' d-flex align-items-center fs-6">
                    <i class="bi ' . $icon . ' pe-2"></i>
                    ' . $text . '
                </span>';
            };
            
            

            echo '
            <script>
                $(document).ready(function () {
                    ';
            if (isset($_POST['newPay'])) {
                echo '
                            $(`button#nav-accounting-tab`).click();
                        ';
            }
            echo '
                    $(`input#ammountPay`).maskMoney();
                });
            </script>
            <div class="modal-header text-white p-3" style="background-color:var(--primary_color)">
                <h4 class="modal-title fw-bold mb-0">
                    <i class="bi bi-clipboard-check me-2"></i>Detalles de Documento: ' . $row['client'] . '
                </h4>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <nav class="mt-4">
                    <div class="nav nav-pills" id="nav-tab" role="tablist">
                        <button class="nav-link active" id="nav-info-tab" data-bs-toggle="tab" data-bs-target="#nav-info" type="button" role="tab" aria-controls="nav-info" aria-selected="true">
                            <i class="bi bi-info-circle me-2"></i><span>Información</span>
                        </button>
                        <button class="nav-link" id="nav-accounting-tab" data-bs-toggle="tab" data-bs-target="#nav-accounting" type="button" role="tab" aria-controls="nav-accounting" aria-selected="false" ' . $typeDoc . '>
                            <i class="bi bi-cash-stack me-2"></i><span>Contabilidad</span>
                        </button>
                        <button class="nav-link" id="nav-content-tab" data-bs-toggle="tab" data-bs-target="#nav-content" type="button" role="tab" aria-controls="nav-content" aria-selected="false">
                            <i class="bi bi-box-seam me-2"></i><span>Contenido</span>
                        </button>
                    </div>
                </nav>

                <div class="tab-content mt-4" id="nav-tabContent">
                    <div class="tab-pane fade show active" id="nav-info" role="tabpanel" aria-labelledby="nav-info-tab">
                        <div class="row">
                            <div class="col-md-5">
                                <h5 class="mb-3" style="color:var(--primary_color)">
                                    <i class="bi bi-info-circle me-2"></i>Detalles Avanzados
                                </h5>
                                <div class="card shadow-sm border-0 bg-light">
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <span class="fw-bold d-block">Tipo de Documento:</span>
                                            <small class="d-block">' . $type[$row['type']] . '</small>
                                        </div>
                                        <div class="mb-2">
                                            <span class="fw-bold d-block">Número de Documento:</span>
                                            <small class="d-block">' . $row['nr'] . '</small>
                                        </div>
                                        <div class="mb-2">
                                            <span class="fw-bold d-block">UUID:</span>
                                            <small class="d-block">' . $_POST['uuid'] . '</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <h5 class="mb-3" style="color:var(--primary_color)">
                                    <i class="bi bi-info-circle me-2"></i>Detalles Simples
                                </h5>
                                <div class="card shadow-sm border-0 bg-light">
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <span class="fw-bold">Creación:</span>
                                            <small class="d-block">' . date_format($created, "d/m/Y") . ' ' . date_format($created, "g:i a") . '</small>
                                        </div>
                                        <div class="mb-2">
                                            <span class="fw-bold">Descuento:</span>
                                            <small class="d-block">' . $discount . '</small>
                                        </div>
                                        <div class="mb-2">
                                            <span class="fw-bold">Comentario:</span>
                                            <small class="d-block">' . $row['coment'] . '</small>
                                        </div>
                                        <div class="mb-2">
                                            <span class="fw-bold">Etiqueta:</span>
                                            <small class="d-block">' . $row['name'] . '</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
               
                            <div class="col-md-4">
                                <h5 class="mb-3" style="color:var(--primary_color)">
                                    <i class="bi bi-clock-history me-2"></i>Estado
                                </h5>
                                <div class="card shadow-sm border-0 bg-light">
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <span class="fw-bold">Estado Actual:</span>
                                            <small class="d-block">' . $sales[$row['status']] . '</small>
                                        </div>
                                        <div class="mb-2">
                                            <span class="fw-bold">Comentario de Estado:</span>
                                            <small class="d-block">' . $row['coments'] . '</small>
                                        </div>
                                        <div class="mb-2">
                                            <span class="fw-bold">Fecha de Estado:</span>
                                            <small class="d-block">' . date_format($date, "d/m/Y") . ' ' . date_format($date, "g:i a") . '</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        ' . ($row['type'] == 1 && ($sales[$row['status']] == "En Almacen" || $sales[$row['status']] == "En Transito") ? '
                        <div class="mt-4">
                            <h5 class="mb-3" style="color:var(--primary_color)">
                                <i class="bi bi-gear me-2"></i>Cambiar Estado
                            </h5>
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <select class="form-select" id="statusSaleChange">
                                        <option value="null" selected hidden>Selecciona Estados</option>
                                        ' . implode('', array_map(function($i) use ($sales) {
                                            return '<option value="' . $i . '">' . $sales[$i] . '</option>';
                                        }, range(1, 2))) . '
                                    </select>
                                </div>
                                <div class="col-md-8">
                                    <textarea class="form-control" id="coment" rows="2" placeholder="Descripción"></textarea>
                                </div>
                            </div>
                        </div>
                        ' : '') . '
                    </div>
                    
                <div class="tab-pane fade" id="nav-accounting" role="tabpanel" aria-labelledby="nav-accounting-tab">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-12">
                                <div class="card border-0 shadow-sm mb-3">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <h4 class="card-title mb-0">Gestión de Pagos</h4>
                                            <div class="nav nav-pills" id="nav-tab" role="tablist">




                                                <button class="nav-link active me-2" id="nav-paylist-tab" data-bs-toggle="tab" data-bs-target="#nav-paylist" type="button" role="tab" aria-controls="nav-info" aria-selected="true">
                                                    <i class="bi bi-receipt"></i>
                                                </button>
                                                ';
                                                if ($sum < $Cost) {
                                                    echo '
                                                    <button class="nav-link" id="nav-pay-tab" data-bs-toggle="tab" data-bs-target="#nav-pay" type="button" role="tab" aria-controls="nav-info" aria-selected="false">
                                                        <i class="bi bi-cash-stack"></i>
                                                    </button>';
                                                }
                                                echo '
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="tab-content">
                            <div class="tab-pane fade show active" id="nav-paylist">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="card border-0 shadow-sm mb-3">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <h5 class="card-title mb-2">Resumen Financiero</h5>
                                                        <p class="text-muted mb-1">Detalles de la transacción</p>
                                                    </div>
                                                    <div class="text-end">
                                                        ' . $creditStatus($row, $sum, $Cost) . '
                                                    </div>
                                                </div>
                                                <hr class="my-3">
                                                <div class="row">
                                                    <div class="col-6">
                                                        <small class="text-muted">Costo Total</small>
                                                        <h4 class="text-success">' . number_format($Cost, 2, ',', '.') . '$</h4>
                                                    </div>
                                                    <div class="col-6 text-end">
                                                        <small class="text-muted">Abonado</small>
                                                        <h4 class="text-primary">' . number_format($sum, 2, ',', '.') . '$</h4>
                                                    </div>
                                                </div>
                                                <div class="progress mt-3" style="height: 10px;">
                                                    <div class="progress-bar bg-primary" role="progressbar" 
                                                        style="width: ' . ($sum / $Cost * 100) . '%"
                                                        aria-valuenow="' . ($sum / $Cost * 100) . '" 
                                                        aria-valuemin="0" 
                                                        aria-valuemax="100">
                                                    </div>
                                                </div>
                                                <div class="d-flex justify-content-between mt-2">
                                                    <small class="text-muted">Pendiente</small>
                                                    <small class="text-danger">' . number_format($Cost - $sum, 2, ',', '.') . '$</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <div class="card border-0 shadow-sm mb-3">
                                            <div class="card-body">
                                                <h5 class="card-title mb-3">Historial de Pagos</h5>
                                                <div class="table-responsive">
                                                    <table class="table table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th class="text-white">Monto</th>
                                                                <th class="text-white">Método</th>
                                                                <th class="text-white">Fecha</th>
                                                                <th class="text-white">Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody style="max-height: 35vh; overflow-y: auto;">';
                                                        foreach (json_decode($row['paids'], true) as $key => $value) {
                                                            $date = new DateTime($value['created_at']);
                                                            echo '
                                                            <tr>
                                                                <td>' . $value['ammount'] . ' ' . $pay_acurrency[$value['currency']]['sign'] . '</td>
                                                                <td>' . $pay_method[$value['method']] . '</td>
                                                                <td>' . date_format($date, "d/m/Y") . '</td>
                                                                <td>
                                                                    ' . (!empty($value['photo']) ? 
                                                                    '<button class="btn btn-sm btn-outline-primary" data-img-locate="' . $value['photo'] . '" id="viewPay">
                                                                        <i class="bi bi-eye"></i>
                                                                    </button>' : '') . '
                                                                </td>
                                                            </tr>';
                                                        }
                                                        echo '
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="nav-pay">
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="card border-0 shadow-sm">
                                                <div class="card-body">
                                                    <div class="row align-items-center mb-4">
                                                        <div class="col">
                                                            <h4 class="card-title mb-0">Nuevo Pago</h4>
                                                            <small class="text-muted">Completa los detalles del pago</small>
                                                        </div>
                                                        <div class="col-auto">
                                                            <span class="badge fs-6" style="background-color:var(--primary_color)">Pendiente: ' . number_format($Cost - $sum, 2, ',', '.') . '$</span>
                                                        </div>
                                                    </div>

                                                    <div class="row g-2">
                                                        <div class="col-md-4">
                                                            <div class="form-floating">
                                                                <input type="text" class="form-control" id="ammountPay" 
                                                                    placeholder="Monto a pagar" 
                                                                    max="' . ($Cost - $sum) . '"
                                                                    data-precision="2">
                                                                <label for="ammountPay">Monto a Pagar</label>
                                                            </div>
                                                        </div>

                                                        <div class="col-md-4">
                                                            <div class="form-floating">
                                                                <select class="form-select" id="methodPay">
                                                                    <option selected hidden value="">Selecciona método</option>';
                                                                    foreach ($pay_method as $i => $method) {
                                                                        echo '<option value="' . $i . '">' . $method . '</option>';
                                                                    }
                                                                    echo '
                                                                </select>
                                                                <label for="methodPay">Método de Pago</label>
                                                            </div>
                                                        </div>

                                                        <div class="col-md-4">
                                                            <div class="form-floating">
                                                                <input type="text" class="form-control" id="refferencePay" placeholder="Referencia">
                                                                <label for="refferencePay">Referencia</label>
                                                            </div>
                                                        </div>

                                                        <div class="col-12">
                                                            <div class="card border-dashed">
                                                                <div class="card-body">
                                                                    <div class="d-flex align-items-center justify-content-between">
                                                                        <div class="d-flex align-items-center">
                                                                            <div class="bg-primary-soft rounded-circle p-3 me-3">
                                                                                <i class="bi bi-cloud-upload fs-4 text-primary"></i>
                                                                            </div>
                                                                            <div>
                                                                                <h6 class="mb-1 fw-bold">Comprobante de Pago</h6>
                                                                                <small class="text-muted">Formatos aceptados: JPG, PNG</small>
                                                                            </div>
                                                                        </div>
                                                                        <div class="d-flex align-items-center">
                                                                            <input type="file" class="form-control d-none" id="refferencePicPay" accept=".jpg, .jpeg, .png">
                                                                            <div class="btn-group" role="group">
                                                                                <button class="btn btn-outline-primary shadow-none" onclick="$(`#refferencePicPay`).click()">
                                                                                    <i class="bi bi-cloud-arrow-up-fill me-2"></i>Subir
                                                                                </button>
                                                                                <button class="btn btn-outline-secondary shadow-none" id="viewPicPay" title="Vista previa">
                                                                                    <i class="bi bi-eye-fill"></i>
                                                                                </button>
                                                                                <button class="btn btn-outline-danger shadow-none" onclick="$(`#refferencePicPay`).val(``)">
                                                                                    <i class="bi bi-trash-fill"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="col-12">
                                                            <div class="form-floating">
                                                                <textarea class="form-control" placeholder="Descripción" id="descriptionPay" row="2"></textarea>
                                                                <label for="descriptionPay">Descripción</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="nav-content" role="tabpanel" aria-labelledby="nav-content-tab">
                        ';
                        $depoExist = [];
                        foreach (json_decode($row['buy'], true) as $x => $y) {
                            if (!array_key_exists($y['depo'], $depoExist)) {
                                $depoExist[$y['depo']] = 0;
                            }
                            foreach ($y['packs'] as $p => $n) {
                                $depoExist[$y['depo']] += ($p * $n);
                            }
                        }
                        echo '
                        <div class="card shadow-sm border-0 bg-light mb-3">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h5 class="card-title">Resumen de Contenido</h5>
                                        <div class="mb-2">
                                            <span class="fw-bold">Cantidad Total:</span>
                                            <small class="d-block">' . $Total . '</small>
                                        </div>
                                        <div class="mb-2">
                                            <span class="fw-bold">Precio Total:</span>
                                            <small class="d-block">' . number_format($Cost, 2, ',', '.') . '$</small>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <h5 class="card-title">Depósitos</h5>
                                        <div class="d-flex flex-wrap gap-2">
                                            ';
                                            foreach ($depoExist as $key => $value) {
                                                echo '<span class="badge bg-secondary">Depósito ' . $key . ': ' . $value . '</span>';
                                            }
                                            echo '
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-striped table-bordered">
                                <thead>
                                    <tr>
                                        <th class="text-white">Item</th>
                                        <th class="text-white">Depósito</th>
                                        <th class="text-white">Cantidades</th>
                                        <th class="text-white">Unitario</th>
                                        <th class="text-white">Costo</th>
                                        <th class="text-white">Total</th>
                                    </tr>
                                </thead>
                                <tbody style="max-height: 40vh; overflow-y: auto;">';
                                    foreach ($buyContent as $y) {
                                        echo '
                                        <tr>
                                            <td>' . $y['code'] . '</td>
                                            <td>Depósito ' . $y['depo'] . '</td>
                                            <td>' . implode(" , ", $y['packs']) . '</td>
                                            <td>' . number_format($y['unitDisc'], 3, ',', '.') . '$</td>
                                            <td>' . number_format($y['cost'], 2, ',', '.') . '$</td>
                                            <td>' . $y['total'] . '</td>
                                        </tr>
                                        ';
                                    }
                                    echo '
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer bg-light p-3" buy-id="' . $_POST['uuid'] . '" buy-type="'. $type[$row['type']] .'" buy-nr="'. $row['nr'] .'">
                ' . $buttons . '
            </div>
            ';
        } else {
            echo 'close';
        }
    } elseif (isset($_POST['Note'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT uuid, nr, type, JSON_VALUE(CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR), '$[2]') as client, buy FROM `sales` WHERE uuid='" . $_POST['uuid'] . "'";
        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            $Total = 0;
            $Cost = 0;

            foreach (json_decode($row['buy'], true) as $x => $y) {
                foreach ($y['packs'] as $quantity => $packs) {
                    $Total += ($quantity * $packs);
                    $Cost += ($quantity * $packs) * $y['price'];
                }
            }
            echo '
            <script>
            $(document).ready(function () {
                $(document).find(".pinesjm").hide();
            });
            </script>
            <div class="modal-header">
                <h5 class="modal-title">Pasar Presupuesto A Nota</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <h5>' . $type[$row['type']] . ' Nr: ' . $row['nr'] . '</h5>
                <h5 class="text-truncate mb-2" style="max-width: 95%;">Cliente: ' . $row['client'] . '</h5>
                <h5>Total: ' . $Total . '</h5>
                <h5>Costo: ' . $Cost . '$</h5>


                <div class="d-flex justify-content-evenly">
                    <input type="radio" class="btn-check" value="chrystal" name="motorBase" id="option5" autocomplete="off" checked>
                    <label class="btn btn-outline-dark shadow-none" for="option5">Chrystal</label>
                    
                    <input type="radio" class="btn-check" value="pinesjm" name="motorBase" id="option6" autocomplete="off">
                    <label class="btn btn-outline-dark shadow-none" for="option6">PinesJM</label>
                </div>
                
                
                <div class="tab-motor pinesjm mt-2">
                    <div class="">
                        <h6 class="form-label">Nr. de Nota</h6>
                        <input type="text" class="form-control" id="nrdocument" oninput="numberInput(this)" autocomplete="off">
                    </div>
                    <div class="alert alert-info m-0" role="alert">
                        <h5 class="mb-1">OJO:</h5>Esto No Realizara Ninguna Accion En Chrystal,Es Obligatorio El Nr De Nota
                    </div>
                </div>
                <div class="tab-motor chrystal mt-2">
                    <div class="alert alert-info m-0" role="alert">
                        <h5 class="mb-1">OJO:</h5>Este Presupuesto Se Va A Realizar En Chrystal Como Nota 
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="passToNote" buy-id="' . $row['uuid'] . '" nr-id="' . $row['nr'] . '">
                    Continuar
                </button>
            </div>';
        } else {
            echo 'close';
        }
    } elseif (isset($_POST['Filter'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT id,
        JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.user') AS nameAndLastName
        FROM `users`";

        $result = mysqli_query($conn, $sql);

        echo '
        <script>
            $(document).ready(function () {
                $(`input#filter-price`).maskMoney();
                loadFilters();
            });
        </script>
        <div class="modal-header">
            <h5 class="modal-title">Filtros</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="row g-4 mb-2">
                <div class="col-12 col-md-4">
                    <h6 class="form-label">Tipo De Compra</h6>
                    <select class="form-select shadow-none" id="filter-type">
                        <option value="" selected>Todos</option>
                        ';
        for ($i = 0; $i <= 1; $i++) {
            echo '<option value="' . $i . '">' . $type[$i] . '</option>';
        }
        echo '
                    </select>            
                </div>
                <div class="col-12 col-md-8">
                    <h6 class="form-label">Clientes</h6>
                    <select class="form-select shadow-none" id="filter-client">
                        <option value="" selected>Todos</option>
                        ';
        while ($row = mysqli_fetch_assoc($result)) {
            echo '<option value="' . $row['id'] . '">' . implode(' ', json_decode($row['nameAndLastName'])) . '</option>';
        }
        echo '
                    </select>            
                </div>
                <div class="col-12 col-md-6">
                    <h6 class="form-label">Estado</h6>
                    <select class="form-select shadow-none" id="filter-status">
                        <option value="" selected>Todos</option>
                        ';
        foreach ($sales as $key => $value) {
            echo '<option value="' . $key . '">' . $value . '</option>';
        }
        echo '
                    </select>            
                </div>
                <div class="col-6">
                    <h6 class="form-label">Total</h6>
                    <div class="input-group">
                        <span class="input-group-text">
                            <div class="form-check">
                                <input class="form-check-input" value="0" type="radio" name="filter-total-lessThan-greaterThan" id="total-lessThan">
                                <label class="form-check-label" for="total-lessThan">
                                < </label>
                            </div>
                        </span>
                        <span class="input-group-text">
                            <div class="form-check">
                                <input class="form-check-input" value="1" type="radio" name="filter-total-lessThan-greaterThan" id="total-greaterThan">
                                <label class="form-check-label" for="total-greaterThan">
                                > </label>
                            </div>
                        </span>
                        <input type="text" class="form-control shadow-none" id="filter-total">
                    </div>
                </div>         
                <div class="col-6">
                    <h6 class="form-label">Fecha</h6>
                    <div class="input-group mb-3">
                        <input type="date" class="form-control" id="filter-date-start" name="filter-dates">
                        <span class="input-group-text">A</span>
                        <input type="date" class="form-control" id="filter-date-end" name="filter-dates">
                    </div>
                </div>
            </div>
            <h5 class="accountancy">Contabilidad</h5>
            <div class="accountancy row g-4">
                <div class="col-12">
                    <input class="form-check-input" type="checkbox" id="isPaid">
                    <label class="form-check-label" for="isPaid">
                    Pagado
                    </label>
                </div>
                <div class="col-6">
                    <h6 class="form-label">Precio</h6>
                    <div class="input-group">
                        <span class="input-group-text">
                            <div class="form-check">
                                <input class="form-check-input" value="0" type="radio" name="filter-price-lessThan-greaterThan" id="price-lessThan">
                                <label class="form-check-label" for="price-lessThan">
                                < </label>
                            </div>
                        </span>
                        <span class="input-group-text">
                            <div class="form-check">
                                <input class="form-check-input" value="1" type="radio" name="filter-price-lessThan-greaterThan" id="price-greaterThan">
                                <label class="form-check-label" for="price-greaterThan">
                                > </label>
                            </div>
                        </span>
                        <input type="text" class="form-control shadow-none" data-precision="2" id="filter-price">
                        <span class="input-group-text">$</span>
                    </div>
                </div>
                <div class="col-6" id="no-paid">
                    <h6 class="form-label">Por Vencer</h6>
                    <div class="input-group">
                        <input type="text" class="form-control shadow-none" aria-label="Text input with checkbox">
                        <span class="input-group-text">dias</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal" id="resetFilters">
                Limpiar
            </button>
            <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="saveFilters">
                Filtrar
            </button>
        </div>';
    }
}

if (isset($_POST['Reatined'])) {
    if (isset($_POST['Rule'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT id, CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR) AS info, `buy`, `status`, JSON_UNQUOTE(JSON_EXTRACT(CAST(advanced AS CHAR),'$.name')) AS name FROM `retainedpurchases` WHERE id='" . $_POST['uuid'] . "'";
        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            $info = json_decode($row['info'], true);
            $status = json_decode($row['status'], true);
            $status = end($status);

            $Total = 0;
            $Cost = 0;
            $Discount = 0;

            foreach (json_decode($row['buy'], true) as $x => $y) {
                $price = $y['price'];
                $tempTotal = 0;
                foreach ($y['packs'] as $quantity => $packs) {
                    $tempTotal += ($quantity * $packs);
                }

                $Total += $tempTotal;

                if (!empty($y["discount"][0])) {
                    if ($y["discount"][1]) {
                        $price -=  $y['price'] * ($y["discount"][0] / 100);
                    } else {
                        $price -= $y["discount"][0];
                    }
                    $Discount += $tempTotal * $price;
                }
                $Cost += $tempTotal * $y['price'];
            }

            $Cost = round($Cost, 2);
            $Discount = round($Discount, 2);
            $htmlCost = (!empty($Discount)) ? "<s>$Cost$</s> -> $Discount" : $Cost;

            echo '
            <div class="modal-header text-white p-3" style="background-color:var(--primary_color)">
                <h4 class="modal-title fw-bold mb-0">
                    <i class="bi bi-clipboard-check me-2"></i>Toma de Decisiones
                </h4>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="card shadow-sm border-0 bg-light">
                            <div class="card-body">
                                <h6 class="card-subtitle text-muted mb-2">Detalles de Compra</h6>
                                <div class="mb-2">
                                    <span class="fw-bold d-block">UUID:</span>
                                    <small class="d-block">' . $_POST['uuid'] . '</small>
                                </div>
                                <div class="mb-2">
                                    <span class="fw-bold d-block">Etiqueta:</span>
                                    <small class="d-block">' . $row['name'] . '</small>
                                </div>
                                <div class="mb-2">
                                    <span class="fw-bold">Total:</span>
                                    <small class="text-success d-block">' . $Total . ' / ' . $htmlCost . '$</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card shadow-sm border-0 bg-light">
                            <div class="card-body">
                                <h6 class="card-subtitle text-muted mb-2">Información del Cliente</h6>
                                <div class="mb-2">
                                    <span class="fw-bold">Nombre:</span>
                                    <small class="d-block">' . $info[2] . '</small>
                                </div>
                                <div class="mb-2">
                                    <span class="fw-bold">Identificación:</span>
                                    <small class="d-block">' . $typeIdent[$info[1][0]] . '-' . $info[1][1] . '</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
                <div class="mt-4">
                    <h5 class="mb-3" style="color:var(--primary_color)">
                        <i class="bi bi-info-circle me-2"></i>Estado Actual
                    </h5>
                    <div class="alert alert-secondary" role="alert">
                        <div class="d-flex justify-content-between">
                            <strong>' . $retained[$status['event']] . '</strong>
                            <small class="text-muted">' . $status['date'] . '</small>
                        </div>
                        <p class="mb-0 text-muted">' . $status['coment'] . '</p>
                    </div>
                </div>
            
                ' . ($status['event'] < 3 ? '
                <div class="mt-4">
                    <h5 class="mb-3" style="color:var(--primary_color)">
                        <i class="bi bi-gear me-2"></i>Cambiar Estado
                    </h5>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <select class="form-select" id="statusChange">
                                <option selected hidden>Selecciona un Estado</option>
                                <option value="edit">Editar</option>
                                ' . implode('', array_filter(array_map(function($key, $value) {
                                    return $key != 3 ? "<option value='$key'>$value</option>" : '';
                                }, array_keys($retained), $retained))) . '
                            </select>
                        </div>
                        <div class="col-md-8">
                            <textarea class="form-control" id="coment" rows="2" placeholder="Descripción (Opcional)" hidden></textarea>
                        </div>
                    </div>
                    <div class="alert alert-info mt-3" role="alert" id="alert" hidden>
                        Información adicional
                    </div>
                </div>
                ' : '') . '
            </div>
            <div class="modal-footer bg-light p-3">
                <div class="d-flex justify-content-between w-100">
                    <div class="btn-group me-2" role="group">
                        <button type="button" class="btn btn-outline-dark shadow-none" data="' . $row['id'] . '" id="retainedReport">
                            <i class="bi bi-file-earmark me-2"></i>Reporte
                        </button>
                        <button type="button" class="btn btn-outline-dark shadow-none" data="' . $row['id'] . '" id="retainedReportInventory">
                            <i class="bi bi-file-earmark me-2"></i>Informe
                        </button>
                    </div>
                    <button type="button" class="btn btn-primary me-2" data-bs-dismiss="modal" id="retainedEdit" data="' . $row['id'] . '" hidden>
                        Editar
                    </button>
                    <button type="button" class="btn btn-success" data-bs-dismiss="modal" data="' . $row['id'] . '" id="retainedChangeStatus" hidden>
                        Guardar Cambios
                    </button>
                </div>
            </div>';
        } else {
            echo 'close';
        }
    } elseif (isset($_POST['Mix'])) {
        echo '
        <div class="modal-header">
            <h5 class="modal-title">Mezclar Pedidos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="finishBuy">
                Finalizar
            </button>
        </div>';
    } elseif (isset($_POST['Filter'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT id,
        JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.user') AS nameAndLastName
        FROM `users`";

        $result = mysqli_query($conn, $sql);

        echo '
        <script>
            $(document).ready(function () {
                $(`input#filter-price`).maskMoney();
                loadFilter();
            });
        </script>
        <div class="modal-header">
            <h5 class="modal-title">Filtros</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="row g-3 mb-2">
                <div class="col-12 col-md-8">
                    <h6 class="form-label">Clientes</h6>
                    <select class="form-select shadow-none" id="filter-client">
                        <option value="" selected>Todos</option>
                        ';
        while ($row = mysqli_fetch_assoc($result)) {
            echo '<option value="' . $row['id'] . '">' . implode(' ', json_decode($row['nameAndLastName'])) . '</option>';
        }
        echo '
                    </select>            
                </div>
                <div class="col-12 col-md-4">
                    <h6 class="form-label">Estado</h6>
                    <select class="form-select shadow-none" id="filter-status">
                        <option value="" selected>Todos</option>
                        ';
        foreach ($retained as $key => $value) {
            echo '<option value="' . $key . '">' . $value . '</option>';
        }
        echo '
                    </select>            
                </div>
                <div class="col-6">
                    <h6 class="form-label">Total</h6>
                    <div class="input-group">
                        <span class="input-group-text">
                            <div class="form-check">
                                <input class="form-check-input" value="0" type="radio" name="filter-total-lessThan-greaterThan" id="total-lessThan">
                                <label class="form-check-label" for="total-lessThan">
                                < </label>
                            </div>
                        </span>
                        <span class="input-group-text">
                            <div class="form-check">
                                <input class="form-check-input" value="1" type="radio" name="filter-total-lessThan-greaterThan" id="total-greaterThan">
                                <label class="form-check-label" for="total-greaterThan">
                                > </label>
                            </div>
                        </span>
                        <input type="text" class="form-control shadow-none" id="filter-total">
                    </div>
                </div>         
                <div class="col-6">
                    <h6 class="form-label">Fecha</h6>
                    <div class="input-group">
                        <input type="date" class="form-control" id="filter-date-start" name="filter-dates">
                        <span class="input-group-text">A</span>
                        <input type="date" class="form-control" id="filter-date-end" name="filter-dates">
                    </div>
                </div>
                <div class="col-4">
                    <h6 class="form-label">Precio</h6>
                    <div class="input-group">
                        <span class="input-group-text">
                            <div class="form-check">
                                <input class="form-check-input" value="0" type="radio" name="filter-price-lessThan-greaterThan" id="price-lessThan">
                                <label class="form-check-label" for="price-lessThan">
                                < </label>
                            </div>
                        </span>
                        <span class="input-group-text">
                            <div class="form-check">
                                <input class="form-check-input" value="1" type="radio" name="filter-price-lessThan-greaterThan" id="price-greaterThan">
                                <label class="form-check-label" for="price-greaterThan">
                                > </label>
                            </div>
                        </span>
                        <input type="text" class="form-control shadow-none" data-precision="2" id="filter-price">
                        <span class="input-group-text">$</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal" id="resetFilters">
                Limpiar
            </button>
            <button type="button" class="btn btn-dark" data-bs-dismiss="modal" id="saveFilters">
                Filtrar
            </button>
        </div>';
    } elseif (isset($_POST['ReportInv'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT id, CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR) AS info, `buy` FROM `retainedpurchases` WHERE id='" . $_POST['uuid'] . "'";
        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            $info = json_decode($row['info'], true);




            echo '
            <script>
                $(document).ready(function () {
                    dictAIClass = new DictAI(\'' . $row['buy'] . '\');
                    dictAI = false;
                    $(document).find("#readyItems").text(`Listos ${dictAIClass.check.length}`)
                    $(document).find("#missingItems").text(`Faltan ${dictAIClass.items.length - dictAIClass.check.length}`)
                });
            </script>
            <div class="modal-header">
                <h5 class="modal-title">Listado: ' . $row["id"] . '</h5>
                <button id="closeView" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body d-flex">
                <div class="d-flex flex-column align-items-start w-25 p-2 pe-4 border-end position-relative">
                    <div class="w-100 d-flex flex-column align-items-center">
                        <div id="animationContainer">
                            <div id="mainCircle"></div>
                            <button 
                                id="btnDictAI"
                                class="btn text-light position-absolute top-50 start-50 translate-middle rounded-circle
                                shadow-none"
                                style="width: auto; height: 40px; z-index: 1; background-color: transparent;">
                                Iniciar
                            </button>
                        </div>
                        
                        <h4 id="statusAI" class="text-secondary mt-2">...</h4>
                    </div>

                    <div class="mt-auto w-100">
                        <div class="d-flex justify-content-between">
                            <span id="readyItems" class="text-start text-muted">-----</span>
                            <span id="missingItems"class="text-end text-muted">-----</span>
                        </div>
                    </div>
                </div>
                <div class="w-75 ms-3">
                    <h5 class="d-inline-block text-truncate" style="max-width: 95%;">Cliente: ' . $info[2] . '</h5>
                    <table class="table table-striped table-bordered table-hover mt-2">
                        <thead>
                            <tr>
                                <th class="col-2 text-light" scope="col">Item</th>
                                <th class="col-2 text-light" scope="col">Deposito</th>
                                <th class="col-6 text-light" scope="col">Cantidades</th>
                                <th class="col-2 text-light" scope="col">Total</th>
                            </tr>
                        </thead>
                        <tbody class="table-group-divider" style="max-height: 36rem;">
                    ';
                    $buyArray = json_decode($row['buy'], true);

                    usort($buyArray, function($a, $b) {
                        return $a['code'] <=> $b['code'];
                    });

                    foreach ($buyArray as $x => $y) {
                        $tempTotal = 0;
                        $packsArr = [];
                        foreach ($y['packs'] as $quantity => $packs) {
                            $tempTotal += ($quantity * $packs);
                            $packsArr[] = "<h6 class=\"d-inline\" pq=\"$quantity\" npq=\"$packs\">Pq[" . $quantity . "]: " . $packs . "</h6>";
                        }
            
                        // Increment product counts based on availability (this is just an example)
                        $ready = rand(0, 1) == 1; // Random example for ready products
                        $readyCount = $ready ? 1 : 0;
                        $notReadyCount = $ready ? 0 : 1;
            
                        echo '
                        <tr id="cont'.$y['code'].'">
                            <th class="col-2" scope="col">' . $y['code'] . '</th>
                            <td class="col-2" scope="col">Deposito ' . $y['depo'] . '</td>
                            <td class="col-6" scope="col">' . implode(", ", $packsArr) . '</td>
                            <td class="col-2" scope="col">' . $tempTotal . '</td>
                        </tr>
                        ';
                    }
            
                    echo '
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-dark shadow-none" data="' . $row["id"] . '" id="reportList"><i class="bi bi-printer"></i> Reporte</button>
            </div>
            ';
                        
        } else {
            echo 'close';
        }
    }
}


if (isset($_POST['Statistics'])) {
    if (isset($_POST['Report'])) {
        $currentYear = date("Y");
        $yearFiveYearsAgo = $currentYear - 5;

        echo '
                <div class="modal-header">
                    <h5 class="modal-title">Reportes</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="report" class="form-label">Reportes</label>
                        <select class="form-select" id="report">
                            <option value="null" hidden selected>Selecciona algun Reporte</option>
                            <option value="1">Productos Mas Vendidos</option>
                            <option value="2">Clientes con más Compras</option>
                            <option value="3">Paquetes Más Vendidos</option>
                            <option value="4">Inventario</option>
                            <option value="5">Movimiento de Producto</option>

                        </select>
                    </div>
                    <div class="mb-3" id="div_report_year" hidden>
                        <label for="report_year" class="form-label">Año</label>
                        <select class="form-select" id="report_year">
                            <option value="null" hidden selected>Selecciona un Año</option>';

        for ($year = $currentYear; $year >= $yearFiveYearsAgo; $year--) {
            echo '<option value="' . $year . '">' . $year . '</option>';
        }

        echo '          </select>
                    </div>
                    <div class="mb-3" id="div_report_search" hidden>
                        <label for="report_search" class="form-label">Buscar...</label>
                        <input type="email" class="form-control" id="report_search" oninput="this.value = this.value.toUpperCase();">
                    </div>
                    <div class="mb-3" id="div_report_month" hidden>
                        <label for="report_month" class="form-label">Mes</label>
                        <select class="form-select" id="report_month">
                            <option value="null" hidden selected>Selecciona un Mes</option>';

        $months = [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre'
        ];
        foreach ($months as $index => $month) {
            echo '<option value="' . ($index + 1) . '">' . $month . '</option>';
        }

        echo '          </select>
                    </div>
                </div>
                <div class="modal-footer operations">
                    <button type="button" class="btn btn-dark" id="report_btn">
                        Reporte
                    </button>
                </div>';
    }
}
