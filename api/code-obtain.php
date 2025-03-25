<?php
use GuzzleHttp\Client;

include('connection.php');
include('code-module.php');

if (isset($_POST['Storage'])) {
    if (isset($_POST['Items'])) {
        if (isset($_POST['List'])) {
            function filtersFunc($process, $itemT, $depList, $quantity)
            {
                switch ($process['operation']) {
                    case 1:
                        if ($process['filter']['btn'] == 1 and $itemT <= 0) {
                            return false;
                        } elseif ($process['filter']['btn'] == 2) {
                            $depZero = 0;
                            foreach ($process['filter']['2'] as $key) {
                                if (!array_key_exists($key, $quantity)) {
                                    $depZero += 1;
                                } elseif ($depList[$key] <= 0) {
                                    $depZero += 1;
                                }
                            }
                            if ($depZero != 0) {
                                return false;
                            }
                        }
                        return true;

                    case 2:
                        if ($process['filter']['btn'] == 1 and $itemT <= $process['filter']['1']) {
                            return false;
                        } elseif ($process['filter']['btn'] == 2 and $itemT > 1000) {
                            $packMin = 0;
                            if (!array_key_exists('1', $quantity)) {
                                return false;
                            }
                            foreach ($quantity['1']['Packets'] as $pck => $nm) {
                                if ($nm < $process['filter']['2']) {
                                    $packMin += 1;
                                }
                            }
                            if ($packMin != 0) {
                                return false;
                            }
                        }
                        return true;
                    case 3:

                        break;
                }
            }
            $connObject = new Connection();
            $conn = $connObject->Connect();

            $sql = "SELECT * FROM `items` ORDER BY `items`.`id` ASC";
            $result = mysqli_query($conn, $sql);

            $filters = [json_decode($_POST['Filter'], true), true];
            if (empty($filters[0]['filter'])) {
                $filters[1] == false;
            }
            if (mysqli_num_rows($result) > 0) {
                while ($row = mysqli_fetch_assoc($result)) {
                    $jsonQuantity = json_decode($row['quantity'], true);
                    $totalItem = 0;
                    $depositList = [];
                    foreach ($jsonQuantity as $depo => $list) {
                        $totalItem += $list['Pcs'];
                        $totalDeposit = $list['Pcs'];
                        foreach ($list['Packets'] as $pack => $nr) {
                            $totalItem += $pack * $nr;
                            $totalDeposit += $pack * $nr;
                        }
                        $depositList[$depo] = $totalDeposit;
                    }
                    //Filtros
                    if ($filters[1] == true) {
                        if (filtersFunc($filters[0], $totalItem, $depositList, $jsonQuantity)) {
                            continue;
                        }
                    }
                    echo '
                    <tr>
                        <th class="col-4" scope="row">' . $row['id'] . '</th>
                        <td class="col-4">' . number_format($totalItem) . '</td>
                        <td class="col-4">
                            <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                                <input type="radio" value="' . $row['id'] . '" class="btn-check" name="viewItem" id="' . $row['id'] . '" autocomplete="off">
                                <label class="btn btn-outline-dark shadow-none" for="' . $row['id'] . '"><i class="bi bi-eye"></i></label>
                                <button type="button" class="btn btn-outline-dark shadow-none"id="deleteItem" data-item="' . $row['id'] . '" ><i class="bi bi-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                    ';
                }
            } else {
                echo "0 results";
            }
            die();
        } elseif (isset($_POST['Item'])) {
            $res = array(true, '');
            $connObject = new Connection();
            $conn = $connObject->Connect();

            $sql = "SELECT `uuid`, `quantity`, `info`, `photos`, `id_provider`, `suggestions`,
            CAST(AES_DECRYPT(advanced,'" . CLAVE_AES . "') AS CHAR) AS advanced, 
            CAST(AES_DECRYPT(prices,'" . CLAVE_AES . "') AS CHAR) AS prices FROM `items` WHERE id='" . $_POST['id'] . "'
            ";
            $result = mysqli_query($conn, $sql);

            $depart = mysqli_query($conn, "SELECT `uuid`, `name` FROM `departments`");

            if (mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_assoc($result);
                $depo = mysqli_fetch_all($depart);
                mysqli_free_result($result);
                die(json_encode(array(true, $row, $depo)));
            } else {
                die(json_encode(array(false, 'NAN')));
            }
        } elseif (isset($_POST['GetItem'])) {
            $connObject = new Connection();
            $conn = $connObject->Connect();

            $sql = "SELECT quantity FROM `items` WHERE id='" . $_POST['id'] . "'";
            $result = mysqli_query($conn, $sql);

            if (mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_assoc($result);
                $jsonQuantity = json_decode($row['quantity'], true);
                die(json_encode(array(true, $jsonQuantity[$_POST['depo']]['Packets'])));
            } else {
                die(json_encode(array(false)));
            }
        } elseif (isset($_POST['VerifyItem'])) {
            $connObject = new Connection();
            $conn = $connObject->Connect();

            $sql = "SELECT JSON_UNQUOTE(JSON_EXTRACT(acctAdvanced,'$.price')) AS prices FROM users WHERE id='" . intval($_POST['userid']) . "'";
            $result = mysqli_query($conn, $sql);
            if (mysqli_num_rows($result) <= 0) {
                die(json_encode(array("NAN", 'Usuario No Existe')));
            }
            $row = mysqli_fetch_assoc($result);
            $price = intval($row['prices']);

            $sql = "
            SELECT 
                i.quantity, 
                JSON_UNQUOTE(
                    JSON_EXTRACT(
                        CAST(
                            AES_DECRYPT(i.prices,'" . CLAVE_AES . "')
                        AS CHAR
                        ),'$[" . $price . "]'
                    )
                ) AS price,
                i.suggestions,
                JSON_VALUE(d.advanced, '$.discount.\"" . $_POST['userid'] . "\"[0]') AS discount,
                JSON_VALUE(d.advanced, '$.discount.\"" . $_POST['userid'] . "\"[1]') AS discountP,
                JSON_VALUE(d.`advanced`, '$.hide') as hideD,
                JSON_SEARCH(JSON_VALUE(d.`advanced`, '$.blackList'), 'one', '" . $_POST['userid'] . "') as hidePD,
                JSON_VALUE(CAST(AES_DECRYPT(i.`advanced`, '" . CLAVE_AES . "') AS CHAR), '$.hide') as hide,
                JSON_SEARCH(JSON_VALUE(CAST(AES_DECRYPT(i.`advanced`, '" . CLAVE_AES . "') AS CHAR), '$.views'), 'one', '" . $_POST['userid'] . "') as hideI
            FROM 
                `items` i 
                JOIN departments d ON i.info->>'$.departament' = d.uuid
            WHERE 
                i.id='" . $_POST['id'] . "'";

            $result = mysqli_query($conn, $sql);

            if (mysqli_num_rows($result) > 0) {
                $total = 0;
                $deposit = 0;
                $depoAvailable = [];
                $row = mysqli_fetch_assoc($result);

                if ($row["hideD"] === "true" || $row["hidePD"] != null) {
                    die(json_encode(array(false, 'Departamento No Encontrado',)));
                }
                if ($row["hide"] === "true" || $row["hideI"] != null) {
                    die(json_encode(array(false, 'Producto No Encontrado')));
                }


                $jsonQuantity = json_decode($row['quantity'], true);

                if (empty($jsonQuantity)) {
                    die(json_encode(array(false, 'No Existen Depositos')));
                }

                foreach ($jsonQuantity as $keydepo => $depo) {
                    if (empty($depo['Packets']) or in_array($keydepo, json_decode($_POST['list']))) {
                        continue;
                    }
                    $temptotal = $total;
                    $deposit += 1;
                    $tempDepo = 0;
                    foreach ($depo['Packets'] as $packet => $num) {
                        $total += intval($packet) * intval($num);
                        $tempDepo += intval($packet) * intval($num);
                    }
                    if ($total > $temptotal) {
                        $depoAvailable[] = [$keydepo, $tempDepo];
                    }
                }
                if ($total == 0 or $deposit == 0) {
                    die(json_encode(array(false, 'Depositos Vacios')));
                }
                die(json_encode(array(true, $depoAvailable, $row['price'], $row['discount'], $row['discountP'], $row["suggestions"])));
            } else {
                die(json_encode(array(false, 'Producto No Existe')));
            }
        } elseif (isset($_POST["VerifyItemSuggest"])){
            $connObject = new Connection();
            $conn = $connObject->Connect();

            $sql = "SELECT `uuid` FROM `items` WHERE id='" . $_POST['id'] . "'
            ";
            $result = mysqli_query($conn, $sql);

            if (mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_assoc($result);
                mysqli_free_result($result);
                die(json_encode(array(true)));
            } else {
                die(json_encode(array(false)));
            }
        }
    }
    if (isset($_POST['Ship'])) {
        if (isset($_POST['VerifyItem'])) {
            $connObject = new Connection();
            $conn = $connObject->Connect();

            $sql = "SELECT quantity FROM `items` WHERE id='" . $_POST['id'] . "'";

            $result = mysqli_query($conn, $sql);

            if (mysqli_num_rows($result) > 0) {
                $total = 0;
                $deposit = 0;
                $depoAvailable = [];
                $row = mysqli_fetch_assoc($result);
                $jsonQuantity = json_decode($row['quantity'], true);

                if (empty($jsonQuantity)) {
                    die(json_encode(array(false, 'No Existen Depositos')));
                }

                foreach ($jsonQuantity as $keydepo => $depo) {
                    if (empty($depo['Packets']) or in_array($keydepo, json_decode($_POST['list']))) {
                        continue;
                    }
                    $temptotal = $total;
                    $deposit += 1;
                    foreach ($depo['Packets'] as $packet => $num) {
                        $total += intval($packet) * intval($num);
                    }
                    if ($total > $temptotal) {
                        $depoAvailable[] = $keydepo;
                    }
                }
                if ($total == 0 or $deposit == 0) {
                    die(json_encode(array(false, 'Depositos Vacios')));
                }
                die(json_encode(array(true, $depoAvailable)));
            } else {
                die(json_encode(array(false, 'Producto No Existe')));
            }
        }
        if (isset($_POST['VerifyPacketsAndItem'])) {
            $result = array("error" => array(), "success" => array());
            $connObject = new Connection();
            $conn = $connObject->Connect();
            $selectSQl = "";
            if (isset($_POST["client"])) {
                $client_id = $_POST["client"];

                $selectSQl = "
                    ,
                    JSON_VALUE(d.`advanced`, '$.hide') as hideD,
                    JSON_SEARCH(JSON_VALUE(d.`advanced`, '$.blackList'), 'one', '" . $client_id . "') as hidePD,
                    JSON_VALUE(CAST(AES_DECRYPT(i.`advanced`, '" . CLAVE_AES . "') AS CHAR), '$.hide') as hide,
                    JSON_SEARCH(JSON_VALUE(CAST(AES_DECRYPT(i.`advanced`, '" . CLAVE_AES . "') AS CHAR), '$.views'), 'one', '" . $client_id . "') as hideI
                ";
            }
            foreach (json_decode($_POST['list'], true) as $key => $value) {
                $sql = "SELECT 
                            i.quantity
                            $selectSQl
                        FROM 
                            `items` i
                            JOIN departments d ON i.info->>'$.departament' = d.uuid
                        WHERE 
                            id='" . $value['code'] . "'";
                $query = mysqli_query($conn, $sql);

                if (!mysqli_num_rows($query) > 0) {
                    $result["error"][$key] = array("Producto No Encontrado", 100);
                    continue;
                }
                $row = mysqli_fetch_assoc($query);
                $jsonQuantity = json_decode($row['quantity'], true);

                if (isset($_POST["client"])) {
                    if ($row["hideD"] === "true" || $row["hidePD"] != null) {
                        $result["error"][$key] = array("Departamento No Encontrado", 100);
                        continue;
                    }
                    if ($row["hide"] === "true" || $row["hideI"] != null) {
                        $result["error"][$key] = array("Producto No Encontrado", 100);
                        continue;
                    }
                }

                if (isset($_POST['mode']) && $_POST['mode'] == 1 && array_key_exists($key, json_decode($_POST['old'], true))) {
                    $listOLD = json_decode($_POST['old'], true)[$key]['packs'];
                    $jsonQuantity[$value['depo']]['Packets'] = MergedArray($jsonQuantity[$value['depo']]['Packets'], $listOLD);
                }

                if (!array_key_exists($value['depo'], $jsonQuantity)) {
                    $result["error"][$key] = array("Deposito No Encontrado", 100);
                    continue;
                }

                if (empty($jsonQuantity[$value['depo']]['Packets'])) {
                    $result["error"][$key] = array("Deposito Sin Paquetes", 150);
                    continue;
                }
                $totals = 0;
                foreach ($jsonQuantity[$value['depo']]['Packets'] as $pack => $num) {
                    $totals += $pack * $num;
                }
                if ($totals == 0) {
                    $result["error"][$key] = array("Deposito Sin Paquetes", 150);
                    continue;
                }
                foreach ($value['packs'] as $pack => $num) {
                    if (array_key_exists($pack, $jsonQuantity[$value['depo']]['Packets'])) {
                        if ($num > $jsonQuantity[$value['depo']]['Packets'][$pack] and $jsonQuantity[$value['depo']]['Packets'][$pack] != 0) {
                            $result["error"][$key] = array("Paquetes de " . $pack . " insuficientes", 200, $pack, "packets" => $jsonQuantity[$value['depo']]['Packets']);
                            continue;
                        } elseif ($jsonQuantity[$value['depo']]['Packets'][$pack] == 0) {
                            $result["error"][$key] = array("Paquetes de " . $pack . " Agotados", 130, $pack, "packets" => $jsonQuantity[$value['depo']]['Packets']);
                            continue;
                        }
                    } else {
                        $result["error"][$key] = array("Paquetes de " . $pack . " No Existe", 130, $pack, "packets" => $jsonQuantity[$value['depo']]['Packets']);
                        continue;
                    }
                }
                $result["success"][$key] = array("packets" => $jsonQuantity[$value['depo']]['Packets']);
            }
            die(json_encode($result));
        }
    }
}

if (isset($_POST['DataBase'])) {
    if (isset($_POST['Users'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $html = '';
        $sql = "SELECT id, username, acctType,
        JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.number')) AS tlfnumber,
        JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.operator')) AS tlfoperator,
        JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.user') AS nameAndLastName,
        JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.email')) AS Email,
        JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.type')) AS persIdtype,
        JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.idenfication')) AS persIdidenfication
        FROM `users`";
        $result = mysqli_query($conn, $sql);
        if (!mysqli_num_rows($result) > 0) {
            die('0 results');
        }
        while ($row = mysqli_fetch_assoc($result)) {
            $html .= '
            <tr>
                <th class="col-2 col-md-1" scope="row">' . $row['id'] . '</th>
                <td class="col-1 d-none d-sm-none d-md-table-cell">' . $categoryAccounts[$row['acctType']] . '</td>
                <td class="col-6 d-sm-table-cell d-md-none">' . $row['username'] . '</td>
                <td class="col-3 d-none d-sm-none d-md-table-cell text-truncate">' . implode(' ', json_decode($row['nameAndLastName'])) . '</td>
                <td class="col-2 d-none d-sm-none d-md-table-cell">(0' . $typeTlf[$row['tlfoperator']] . ') - ' . $row['tlfnumber'] . '</td>
                <td class="col-3 d-none d-sm-none d-xl-table-cell d-lg-none">' . $row['Email'] . '</td>
                <td class="col-2 d-none d-lg-table-cell d-md-none">' . $typeIdent[$row['persIdtype']] . '-' . $row['persIdidenfication'] . '</td>
                <td class="col-4 col-md-2">
                    <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0" modal-data-locate="DataBase&Users&Mode=View&id=' . $row['id'] . '" modal-size="2" id="modalBtn"><i class="bi bi-eye-fill"></i></button>
                    <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0" modal-data-locate="DataBase&Users&Mode=Edit&id=' . $row['id'] . '" modal-size="2" id="modalBtn"><i class="bi bi-pencil-fill"></i></button>
                    <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0" input-data="' . $row['id'] . '" id="delBtnUser"><i class="bi bi-trash3-fill"></i></button>
                </td>
            </tr>
            ';
        }
        die($html);
    }
    if (isset($_POST['Servers'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT id, server, serverIP, lastCheck, JSON_EXTRACT(info,'$.latency') as latency, JSON_EXTRACT(info,'$.WAYD') as WAYD FROM `servers`";
        $result = mysqli_query($conn, $sql);


        if (mysqli_num_rows($result) > 0) {
            while ($row = mysqli_fetch_assoc($result)) {
                $Avaible = new DateTime('now', new DateTimeZone('America/New_York'));
                $Avaible->modify('-10 seconds');
                $offServer = new DateTime('now', new DateTimeZone('America/New_York'));
                $mysqlDateTime = new DateTime($row['lastCheck']);
                $textAcopied = array("Esta En Uso", "Chrystal No Esta Abierto");
                $status = array('', str_replace('"', '', $row['WAYD']));
                if ($mysqlDateTime->format('H:i:s') > $Avaible->format('H:i:s') && !in_array($status[1], $textAcopied)) {
                    $status[0] = 'Disponible';
                } else {
                    $status[0] = 'Indisponible';
                }

                $mysqlDateTime->modify('+3 minutes');
                if ($offServer->format('H:i:s') > $mysqlDateTime->format('H:i:s')) {
                    $status[0] = 'Apagado';
                    $status[1] = 'Servidor Desconectado';
                }
                echo '
            <tr id="server_' . $row['id'] . '">
                <th class="col-4 d-none d-xl-table-cell" scope="col">' . $row['id'] . '</th>
                <td class="col-5 col-sm-4 col-md-3 col-lg-2" scope="col">' . $row['server'] . '</td>
                <td class="col-2 col-md-1 d-none d-md-none d-lg-table-cell" scope="col">' . $row['serverIP'] . '</td>
                <td class="col-3 col-md-2 col-lg-1" scope="col">' . $status[0] . '</td>
                <td class="col-2 col-md-2 col-lg-1 d-none d-md-table-cell" scope="col">' . (int)($row['latency'] * 1000) . ' ms</td>
                <td class="col-sm-5 col-md-4 col-lg-3 d-none d-sm-table-cell" scope="col">' . $status[1] . '</td>
            </tr>
            ';
            }
        } else {
            echo "0 results";
        }
    }
    if (isset($_POST['Departaments'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT `uuid`, `name`, `description`, `advanced` FROM `departments`";
        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) > 0) {
            while ($row = mysqli_fetch_assoc($result)) {
                $advanced = json_decode($row['advanced'], true);
                $sql = "SELECT id FROM `items` WHERE JSON_EXTRACT(info,'$.departament')='" . $row['uuid'] . "'";
                $departament = mysqli_query($conn, $sql);

                $hide = ($advanced['hide'] == true) ? "Si" : "No";


                echo '
                <tr> 
                    <th class="col-3" scope="col">' . $row['uuid'] . '</th>
                    <td class="col-2" scope="col">' . $row['name'] . '</td>
                    <td class="col-1" scope="col">' . mysqli_num_rows($departament) . '</td>
                    <td class="col-1" scope="col">' . count($advanced['blackList']) . '</td>
                    <td class="col-1" scope="col">' . $hide . '</td>
                    <td class="col-3" scope="col">' . $row['description'] . '</td>
                    <td class="col-1" scope="col">
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0" modal-data-locate="DataBase&Departaments&Mode=Edit&uuid=' . $row['uuid'] . '" modal-size="2" id="modalBtn"><i class="bi bi-pencil-fill"></i></button>
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0" input-data="' . $row['uuid'] . '" id="delBtnDepa"><i class="bi bi-trash3-fill"></i></button>
                    </td>
                </tr>
                ';
            }
        } else {
            echo "0 results";
        }
    }
}

if (isset($_POST['Accounting'])) {
    if (isset($_POST['SearchHost'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT host FROM `chrystalwaitinglist` WHERE id='" . $_POST['id'] . "'";
        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            die(json_encode(array(true, $row['host'])));
        } else {
            die(json_encode(array(false)));
        }
    }
    if (isset($_POST['Finish'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT instructions,rule FROM `chrystalwaitinglist` WHERE id='" . $_POST['id'] . "'";
        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            $instructions = json_decode($row['instructions'], true);
            $call = array(true, "", "");
            if ($row['rule'] == 'Budget') {
                $call[1] = $instructions['budgetId'];
                $call[2] = $instructions['budgetUuid'];
            } elseif ($row['rule'] == 'Note') {
                $call[1] = $instructions['noteId'];
            } elseif ($row['rule'] == 'Cancel') {
                $call[1] = $instructions['returnId'];
            }
            die(json_encode($call));
        } else {
            die(json_encode(array(false)));
        }
    }
    if (isset($_POST['Sales'])) {
        class FiltersClass
        {
            private $objFilter;
            private $sentenceSQlWhere = '';

            public function __construct($objFilter)
            {
                $this->objFilter = json_decode($objFilter, true);
            }

            public function buildSqlWhereClause()
            {
                // Filtro de cliente
                if (!empty($this->objFilter['client'])) {
                    $client = $this->escapeString($this->objFilter['client']);
                    $this->addSentence("JSON_EXTRACT(CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR), '$[0]') = '" . $client . "'");
                }

                // Filtro de tipo
                if (is_numeric($this->objFilter['type'])) {
                    $type = intval($this->objFilter['type']); // Asegúrate de que sea un entero
                    $this->addSentence("type = " . $type);
                }

                // Filtro de estado (solo si no hay cliente)
                if (is_numeric($this->objFilter['status'])) {
                    $status = $this->escapeString($this->objFilter['status']);
                    $this->addSentence("JSON_EXTRACT(`event`, CONCAT(\"$[\", JSON_LENGTH(`event`)-1, \"].event\")) = " . $status);
                }

                // Filtro de fechas
                if (!empty($this->objFilter['date']['start'])) {
                    $dateStart = $this->escapeString($this->objFilter['date']['start']);
                    $this->addSentence("DATE_FORMAT(JSON_EXTRACT(`event`, CONCAT(\"$[\", JSON_LENGTH(`event`)-1, \"].date\")), '%Y-%m-%d') >= '" . $dateStart . "'");
                }
                if (!empty($this->objFilter['date']['end'])) {
                    $dateEnd = $this->escapeString($this->objFilter['date']['end']);
                    $this->addSentence("DATE_FORMAT(JSON_EXTRACT(`event`, CONCAT(\"$[\", JSON_LENGTH(`event`)-1, \"].date\")), '%Y-%m-%d') <= '" . $dateEnd . "'");
                }

                // Filtro de 'due'
                if (strlen($this->objFilter['due']) != 0) {
                    $this->addSentence("type = 1");
                }

                // Filtro de estado cuando no hay otros filtros
                if (
                    empty($this->objFilter['date']['start']) && 
                    empty($this->objFilter['date']['end']) &&
                    !is_numeric($this->objFilter['type']) && 
                    !is_numeric($this->objFilter['status']) &&
                    !array_key_exists("isPaid", $this->objFilter) &&
                    empty($this->objFilter['due']) && 
                    empty($this->objFilter['client']) // Asegúrate de que esta condición esté separada
                ) {
                    $this->addSentence("NOT JSON_EXTRACT(`event`, CONCAT(\"$[\", JSON_LENGTH(`event`)-1, \"].event\")) IN (2,3,4)");
                }

                // Construir la cláusula WHERE final
                if (!empty($this->sentenceSQlWhere)) {
                    $this->sentenceSQlWhere = ' WHERE ' . $this->sentenceSQlWhere . ' ORDER BY type ASC, nr ASC;';
                }
            }

            private function escapeString($string)
            {
                return addslashes($string);
            }

            private function addSentence($sentence, $conditional = " AND ")
            {
                $sentence = trim($sentence);
                if (!empty($this->sentenceSQlWhere)) {
                    $this->sentenceSQlWhere .= " " . trim($conditional) . " " . $sentence;
                } else {
                    $this->sentenceSQlWhere = $sentence;
                }
            }

            public function buildFiltersInternals($buy, $paids, $date, $credit)
            {
                ['cost' => $Cost, 'total' => $Total] = calculatePrices($buy);


                $Paid = 0;
                foreach (json_decode($paids, true) as $key => $value) $Paid += floatval($value["ammount"]);

                $this->sentenceSQlWhere = [$Total, $Cost, $Paid];
                //Vencidas
                if (strlen($this->objFilter['due']) != 0) {
                    $result = isOverdue($date, $credit);
                    if (!$result['isOverdue'] and $result['remaining']['days'] > intval($this->objFilter['due'])) {
                        return true;
                    }
                }

                //Total
                if (!empty($this->objFilter['total']['input'])) {
                    switch ($this->objFilter['total']['method']) {
                        case 0:
                            if ($Total > $this->objFilter['total']['input']) {
                                return true;
                            }
                            break;
                        case 1:
                            if ($Total < $this->objFilter['total']['input']) {
                                return true;
                            }
                            break;
                    }
                }

                //Price
                if (!empty($this->objFilter['price']['input'])) {
                    switch ($this->objFilter['price']['method']) {
                        case 0:
                            if ($Total > $this->objFilter['price']['input']) {
                                return true;
                            }
                            break;
                        case 1:
                            if ($Total < $this->objFilter['price']['input']) {
                                return true;
                            }
                            break;
                    }
                }

                if (array_key_exists("isPaid", $this->objFilter) and $Paid < $Cost) {
                    return true;
                }
            }

            public function getFilters()
            {
                return $this->sentenceSQlWhere;
            }
        }

        $filter = new FiltersClass($_POST['filters']);
        $filter->buildSqlWhereClause();

        $connObject = new Connection();
        $conn = $connObject->Connect();

        echo $filter->getFilters();

        $sql = "SELECT uuid, type, nr, CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR) AS info, `buy`, 
        JSON_UNQUOTE(JSON_EXTRACT(`event`,CONCAT(\"$[\",JSON_LENGTH(`event`)-1,\"].event\"))) as status,
        CAST(AES_DECRYPT(paids,'" . CLAVE_AES . "') AS CHAR) as paids,
        JSON_VALUE(advanced,'$.additionals.credit') as credit,
        JSON_VALUE(advanced,'$.additionals.discount') as discount,
        JSON_UNQUOTE(JSON_EXTRACT(`event`,CONCAT(\"$[\",JSON_LENGTH(`event`)-1,\"].date\"))) as date FROM `sales`" . $filter->getFilters();


        $result = mysqli_query($conn, $sql);
        if (mysqli_num_rows($result) > 0) {
            function summary($status, $cost, $paids, $row)
            {
                if ($status != "Entregada") {
                    return "N/A";
                }
                if ($paids >= $cost) {
                    return "Pagado";
                }
                $summary = isOverdue($row['date'], $row['credit']);
                $summaryReamining = getRemainingTimeString($summary);
                $summary = ($summary['isOverdue']) ? "Vencida Hace " . $summaryReamining : 'Credito de ' . $summaryReamining;

                $summary .= '  /  Deuda: ' . number_format(($cost - $paids), 2, ',', '.') . "$";
                return $summary;
            }

            while ($row = mysqli_fetch_assoc($result)) {
                $info = json_decode($row['info'], true);

                if ($filter->buildFiltersInternals($row, $row["paids"], $row['date'], $row['credit'])) {
                    continue;
                }

                $Total = $filter->getFilters()[0];
                $Cost = $filter->getFilters()[1];
                $sum = $filter->getFilters()[2];

                $date = new DateTime($row['date']);



                echo '
                <tr> 
                    <th class="col-1" scope="col">' . $row['nr'] . '</th>
                    <td class="col-1" scope="col">' . $type[$row['type']] . '</td>
                    <td class="col-3" scope="col">' . $info[2] . '</td>
                    <td class="col-1" scope="col">' . $Total . '</td>
                    <td class="col-1" scope="col">' . number_format($Cost, 2, ',', '.') . '$</td>
                    <td class="col-1" scope="col">' . summary($sales[$row['status']], $Cost, $sum, $row) . '</td>
                    <td class="col-1" scope="col">' . $sales[$row['status']] . '</td>
                    <td class="col-2" scope="col">' . date_format($date, "d/m/Y") . ' ' . date_format($date, "g:i a")  . '</td>
                    <td class="col-1" scope="col">
                        <button type="button" class="btn btn-dark shadow-none" modal-data-locate="Sales&View&uuid=' . $row['uuid'] . '" modal-size="3" id="modalBtn"><i class="bi bi-gear-fill" ></i></button>
                    </td>
                </tr>
                ';
            }
        } else {
            echo "0 results";
        }
    }
    if (isset($_POST['Retained'])) {
        if (isset($_POST['List'])) {

            class FiltersClass
            {
                private $objFilter;
                private $sentenceSQlWhere = '';

                public function __construct($objFilter)
                {
                    $this->objFilter = json_decode($objFilter, true);
                }

                public function buildSqlWhereClause()
                {
                    $status = $this->objFilter['status'] ?? null;
                    $client = $this->objFilter['client'] ?? null;
                    $dateStart = $this->objFilter['date']['start'] ?? null;
                    $dateEnd = $this->objFilter['date']['end'] ?? null;

                    if (!empty($status) && $status != 0 && !empty($client) && $client != 0) {
                        $this->addSentence("JSON_EXTRACT(`status`, '$[last].event') = " . intval($status));
                        $this->addSentence("JSON_EXTRACT(CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR), '$[0]') = '" . $this->escapeString($client) . "'");
                    } else if (!empty($status) && $status != 0) {
                        $this->addSentence("JSON_EXTRACT(`status`, '$[last].event') = " . intval($status));
                    } else if (!empty($client) && $client != 0) {
                        $this->addSentence("JSON_EXTRACT(CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR), '$[0]') = '" . $this->escapeString($client) . "'");
                    } else {
                        if (empty($dateStart) && empty($dateEnd)) {
                            $this->addSentence("NOT JSON_EXTRACT(`status`, '$[last].event') IN (3,4)");
                        }
                    }

                    if (!empty($dateStart)) {
                        $this->addSentence("DATE_FORMAT(JSON_EXTRACT(`status`, '$[last].date'), '%Y-%m-%d') >= '" . $this->escapeString($dateStart) . "'");
                    }

                    if (!empty($dateEnd)) {
                        $this->addSentence("DATE_FORMAT(JSON_EXTRACT(`status`, '$[last].date'), '%Y-%m-%d') <= '" . $this->escapeString($dateEnd) . "'");
                    }

                    // Si hay condiciones, se construye la cláusula WHERE
                    if (!empty($this->sentenceSQlWhere)) {
                        $this->sentenceSQlWhere = ' WHERE ' . $this->sentenceSQlWhere;
                    }
                }
                private function escapeString($string)
                {
                    return addslashes($string);
                }

                private function addSentence($sentence, $conditional = " AND ")
                {
                    $sentence = trim($sentence);
                    if (!empty($this->sentenceSQlWhere)) {
                        $this->sentenceSQlWhere .= " " . trim($conditional) . " " . $sentence;
                    } else {
                        $this->sentenceSQlWhere = $sentence;
                    }
                }
                public function buildFiltersInternals($buy)
                {
                    $Total = 0;
                    $Cost = 0;
                    $Discount = 0;

                    foreach (json_decode($buy, true) as $x => $y) {
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

                    $this->sentenceSQlWhere = [$Total, $Cost, $Discount];

                    //Total
                    if (!empty($this->objFilter['total']['input'])) {
                        switch ($this->objFilter['total']['method']) {
                            case 0:
                                if ($Total > $this->objFilter['total']['input']) {
                                    return true;
                                }
                                break;
                            case 1:
                                if ($Total < $this->objFilter['total']['input']) {
                                    return true;
                                }
                                break;
                        }
                    }

                    //Price
                    $Price = (!empty($Discount)) ? $Discount : $Cost;

                    if (!empty($this->objFilter['price']['input'])) {
                        switch ($this->objFilter['price']['method']) {
                            case 0:
                                if ($Price > $this->objFilter['price']['input']) {
                                    return true;
                                }
                                break;
                            case 1:
                                if ($Price < $this->objFilter['price']['input']) {
                                    return true;
                                }
                                break;
                        }
                    }
                }

                public function getFilters()
                {
                    return $this->sentenceSQlWhere;
                }
            }

            $filter = new FiltersClass($_POST['filters']);
            $filter->buildSqlWhereClause();


            $connObject = new Connection();
            $conn = $connObject->Connect();

            $sql = "SELECT `id`, CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR) AS info, `buy`, JSON_UNQUOTE(JSON_EXTRACT(`status`,CONCAT(\"$[\",JSON_LENGTH(`status`)-1,\"].event\"))) as status, `advanced` FROM `retainedpurchases`" . $filter->getFilters();
            $result = mysqli_query($conn, $sql);

            if (mysqli_num_rows($result) > 0) {
                while ($row = mysqli_fetch_assoc($result)) {
                    $info = json_decode($row['info'], true);
                    $advanced = json_decode($row['advanced'], true);

                    if ($filter->buildFiltersInternals($row['buy'])) {
                        continue;
                    }

                    $Total = $filter->getFilters()[0];
                    $Cost = round($filter->getFilters()[1], 2);
                    $Discount = round($filter->getFilters()[2], 2);
                    $htmlCost = (!empty($Discount)) ? "<s>$Cost$</s><br>$Discount" : $Cost;



                    echo '
                    <tr id="buy_' . $row['id'] . '"> 
                        <th class="col-3 d-none d-sm-none d-md-table-cell" scope="col">' . $row['id'] . '</th>
                        <td class="col-6 col-md-3 text-truncate" scope="col">' . $info[2] . '</td>
                        <td class="col-1 d-none d-sm-none d-md-table-cell" scope="col">' . $advanced['name'] . '</td>
                        <td class="col-1 d-none d-sm-none d-md-table-cell" scope="col">' . $htmlCost . '$</td>
                        <td class="col-1 d-none d-sm-none d-md-table-cell" scope="col">' . $retained[$row['status']] . '</td>
                        <td class="col-3 col-md-1" scope="col">' . $Total . '</td>
                        <td class="col-3 col-md-1" scope="col">
                            <button type="button" class="btn btn-dark shadow-none" modal-data-locate="Reatined&Rule&uuid=' . $row['id'] . '" modal-size="2" id="modalBtn"><i class="bi bi-gear-fill" ></i></button>
                        </td>
                    </tr>
                    ';
                }
            } else {
                echo "0 results";
            }
        }
        if (isset($_POST['Buy'])) {
            $connObject = new Connection();
            $conn = $connObject->Connect();

            $sql = "SELECT id, CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR) AS info, `buy`, JSON_EXTRACT(`status`,CONCAT(\"$[\",JSON_LENGTH(`status`)-1,\"].event\")) as event, `advanced` FROM `retainedpurchases` WHERE id='" . $_POST['uuid'] . "'";
            $result = mysqli_query($conn, $sql);

            if (mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_assoc($result);
                die(json_encode(array(true, $row)));
            } else {
                die(json_encode(array(false, "!Ups. Compra No Existe")));
            }
        }
        if (isset($_POST['Check'])) {
            $connObject = new Connection();
            $conn = $connObject->Connect();

            $sql = "SELECT `id`, CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR) AS info, JSON_UNQUOTE(JSON_EXTRACT(`status`,CONCAT(\"$[\",JSON_LENGTH(`status`)-1,\"].event\"))) as status FROM `retainedpurchases` WHERE NOT JSON_EXTRACT(`status`,CONCAT(\"$[\",JSON_LENGTH(`status`)-1,\"].event\")) IN (3,4)";
            $result = mysqli_query($conn, $sql);

            $currentOrders = mysqli_fetch_assoc($result);

            if (!empty($currentOrders)) {
                die(json_encode(["success" => true, "find" => true]));
            } else {
                die(json_encode(["success" => true, "find" => false]));
            }
        }
    }
}


if (isset($_POST["Statistics"])) {
    // Los 15 mas Vendidos
    if (isset($_POST["Stat1"])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT buy, event FROM `sales`";
        $result = mysqli_query($conn, $sql);

        $output = [];
        $sales_totals = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $date = Null;
            $buyData = json_decode($row["buy"], true);
            $eventData = json_decode($row["event"], true);

            foreach ($eventData as $a) {
                if ($a["event"] == 0) {
                    $date = $a["date"];
                }
                if ($a["event"] == 3) {
                    $date = Null;
                    break;
                }
            }
            if ($date == Null) {
                continue;
            }

            $month = date("n", strtotime($date)) - 1;

            $year = date("Y", strtotime($date));


            if ($_POST["year"] != $year) {
                continue;
            }


            foreach ($buyData as $c) {
                if (!key_exists($c["code"], $output)) {
                    $output[$c["code"]] = array_fill(0, 12, 0);
                }
                foreach ($c["packs"] as $k => $v) {
                    $output[$c["code"]][$month] += ($k * $v);
                }
            }
        }

        foreach ($output as $i => $s) {
            $total_sales = array_sum($s);
            if ($total_sales > 0) {
                $sales_totals[$i] = $total_sales;
            }
        }

        arsort($sales_totals);
        $top_base = array_slice($sales_totals, 0, $_POST["limit"], true);

        $stats_output = [];
        foreach ($top_base as $i => $t) {
            $stats_output[] = [
                "label" => $i,
                "data" => $output[$i]
            ];
        }
        die(json_encode(["content" => $stats_output]));
    }
    if (isset($_POST["Stat2"])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT buy, CAST(AES_DECRYPT(paids,'" . CLAVE_AES . "') AS CHAR) as paids, event,
        JSON_VALUE(advanced,'$.additionals.credit') as credit, JSON_VALUE(advanced,'$.additionals.discount') as discount
        FROM `sales`";

        $result = mysqli_query($conn, $sql);

        if (!$result) {
            die(json_encode(["error" => mysqli_error($conn)])); // Handle query error
        }

        $output = [0, 0, 0];
        while ($row = mysqli_fetch_assoc($result)) {
            ['cost' => $Cost] = calculatePrices($row);
            $Paid = 0;
            $paids = json_decode($row["paids"], true);
            $eventData = json_decode($row["event"], true);

            $date = null;

            foreach ($eventData as $a) {
                if ($a["event"] == 0) {
                    $date = $a["date"];
                }
            }

            $year = date("Y", strtotime($date));


            if ($_POST["year"] != $year) {
                continue;
            }


            foreach ($paids as $key => $value) {
                $Paid += floatval($value["ammount"]);
            }

            if ($Paid >= $Cost) {
                $output[1] += 1;
                continue;
            }

            $overdueResult = isOverdue($date, $row["credit"]); // Use a different variable name
            if (!$overdueResult['isOverdue']) {
                $output[2] += 1;
                continue;
            } else {
                $output[0] += 1;
                continue;
            }
        }
        die(json_encode(["content" => $output]));
    }
    if (isset($_POST["Stat3"])) {
        $client = new Client();
        $response = $client->get($_ENV['API_SERVER'] . 'health/resource/1', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' .  $_ENV['API_KEY_ADMIN'],
                'X-Device-By' => "Web Admin"
            ]
        ]);
        $data = $response->getBody()->getContents();
        $data = json_decode($data, true);

        $start_time = microtime(true);
        $response = $client->get($_ENV['API_SERVER'] . 'health', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' .  $_ENV['API_KEY_ADMIN'],
                'X-Device-By' => "Web Admin"
            ]
        ]);
        $end_time = microtime(true);
        $data1 = $response->getBody()->getContents();
        $data1 = json_decode($data1, true);
        $responseTime = $end_time - $start_time;

        $data = array_merge($data, $data1);
        $data["latency"] = intval($responseTime * 1000);

        die(json_encode($data));
    }
    if (isset($_POST["Stat4"])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT id FROM `users`";
        $users = mysqli_query($conn, $sql);
        $users = mysqli_num_rows($users);

        $sql = "SELECT id, server, serverIP, lastCheck, JSON_EXTRACT(info,'$.latency') as latency, JSON_EXTRACT(info,'$.WAYD') as WAYD FROM `servers`";
        $server = mysqli_query($conn, $sql);

        $num = 0;
        while ($row = mysqli_fetch_assoc($server)) {
            $Avaible = new DateTime('now', new DateTimeZone('America/New_York'));
            $Avaible->modify('-10 seconds');
            $mysqlDateTime = new DateTime($row['lastCheck']);
            $textAcopied = array("Esta En Uso", "Chrystal No Esta Abierto");
            $status = array('', str_replace('"', '', $row['WAYD']));
            if ($mysqlDateTime->format('H:i:s') > $Avaible->format('H:i:s') && !in_array($status[1], $textAcopied)) {
                $num++;
            }
        }

        $sql = "SELECT uuid FROM `sales` WHERE type=1";
        $solds = mysqli_query($conn, $sql);
        $solds = mysqli_num_rows($solds);

        $sql = "SELECT id FROM `retainedpurchases` WHERE NOT JSON_EXTRACT(`status`,CONCAT(\"$[\",JSON_LENGTH(`status`)-1,\"].event\")) IN (3,4)";
        $pedding = mysqli_query($conn, $sql);
        $pedding = mysqli_num_rows($pedding);

        $sql = "SELECT id FROM `items`";
        $items = mysqli_query($conn, $sql);
        $items = mysqli_num_rows($items);



        die(json_encode([
            "users" => $users,
            "server" => $num,
            "solds" => $solds,
            "peddings" => $pedding,
            "items" => $items
        ]));
    }
    if (isset($_POST["Stat5"])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT buy, CAST(AES_DECRYPT(paids,'" . CLAVE_AES . "') AS CHAR) as paids, event FROM `sales`";
        $result = mysqli_query($conn, $sql);

        $output = [];
        $critical_stock_items = [];
        $threshold = 2000; // Definimos el umbral de stock crítico.


        while ($row = mysqli_fetch_assoc($result)) {
            $date = Null;
            $buyData = json_decode($row["buy"], true);
            $eventData = json_decode($row["event"], true);

            foreach ($eventData as $a) {
                if ($a["event"] == 0) {
                    $date = $a["date"];
                }
            }

            $year = date("Y", strtotime($date));


            if ($_POST["year"] != $year) {
                continue;
            }


            foreach ($buyData as $c) {
                if (!key_exists($c["code"], $output)) {
                    $output[$c["code"]]["sold"] = 0;
                }

                foreach ($c["packs"] as $k => $v) {
                    $output[$c["code"]]["sold"] += ($k * $v);
                }
            }
        }




        foreach ($output as $i => &$s) {
            $sqlItem = "SELECT quantity FROM `items` WHERE id='$i'";
            $resultItem = mysqli_query($conn, $sqlItem);

            if (!key_exists("stock", $s)) {
                $s["stock"] = 0;
            }

            if (mysqli_num_rows($resultItem) == 0) {
                continue;
            }
            $item = mysqli_fetch_assoc($resultItem);
            $quantity = json_decode($item["quantity"], true);

            foreach ($quantity as $c) {
                $s["stock"] += $c["Pcs"];
                foreach ($c["Packets"] as $k => $v) {
                    $s["stock"] += ($k * $v);
                }
            }
            if ($s["stock"] > 0 && $s["stock"] <= $threshold) {
                $critical_stock_items[$i] = [
                    'sold' => $s["sold"],
                    'stock' => $s["stock"]
                ];
            }
        }

        uasort($critical_stock_items, function ($a, $b) {
            return $b['sold'] - $a['sold'];
        });

        $top_base = array_slice($critical_stock_items, 0, $_POST["limit"], true);


        die(json_encode(["content" => $top_base]));
    }
    if (isset($_POST["Stat6"])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT buy, CAST(AES_DECRYPT(paids,'" . CLAVE_AES . "') AS CHAR) as paids,
        CAST(AES_DECRYPT(info,'" . CLAVE_AES . "') AS CHAR) AS info, event FROM `sales` WHERE
        JSON_EXTRACT(`event`,CONCAT(\"$[\",JSON_LENGTH(`event`)-1,\"].event\")) IN (2)";
        $result = mysqli_query($conn, $sql);

        $output = [];
        $sales_totals = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $date = Null;
            $buyData = json_decode($row["buy"], true);
            $eventData = json_decode($row["event"], true);
            $infoData = json_decode($row["info"], true);

            foreach ($eventData as $a) {
                if ($a["event"] == 0) {
                    $date = $a["date"];
                }
                if ($a["event"] == 3) {
                    $date = null;
                    break;
                }
            }

            if ($date === null) {
                continue;
            }
            $month = date("n", strtotime($date)) - 1;

            $year = date("Y", strtotime($date));


            if ($_POST["year"] != $year) {
                continue;
            }


            foreach ($buyData as $c) {
                if (!key_exists($infoData[0], $output)) {
                    $output[$infoData[0]] = [
                        "content" => array_fill(0, 12, 0),
                        "name" => $infoData[2]
                    ];
                }
                foreach ($c["packs"] as $k => $v) {
                    $output[$infoData[0]]["content"][$month] += ($k * $v);
                }
            }
        }

        foreach ($output as $i => $s) {
            $total_sales = array_sum($s["content"]);
            if ($total_sales > 0) {
                $sales_totals[$i] = $total_sales;
            }
        }

        arsort($sales_totals);
        $top_base = array_slice($sales_totals, 0, $_POST["limit"], true);

        $stats_output = [];
        foreach ($top_base as $i => $t) {
            $stats_output[] = [
                "label" => $output[$i]["name"],
                "data" => $output[$i]["content"]
            ];
        }
        die(json_encode(["content" => $stats_output]));
    }
    if (isset($_POST["Stat7"])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $sql = "SELECT buy, event FROM `sales` WHERE NOT JSON_EXTRACT(`event`,CONCAT(\"$[\",JSON_LENGTH(`event`)-1,\"].event\")) IN (3)";
        $result = mysqli_query($conn, $sql);

        $output = [
            "outputs" => 0,
            "stored" => 0,
            "reserved" => 0,
            "statement_of_deposits" => [
                "content" => "",
                "rgb" => ""
            ]
        ];

        while ($row = mysqli_fetch_assoc($result)) {
            $date = Null;
            $buyData = json_decode($row["buy"], true);
            $eventData = json_decode($row["event"], true);

            foreach ($eventData as $a) {
                if ($a["event"] == 0) {
                    $date = $a["date"];
                }
            }
            $year = date("Y", strtotime($date));


            if ($_POST["year"] != $year) {
                continue;
            }


            foreach ($buyData as $c) {
                foreach ($c["packs"] as $k => $v) {
                    $output["outputs"] += ($k * $v);
                }
            }
        }
        $deposits = array_fill(1, $depositsAvailable, 0);
        $sql = "SELECT quantity FROM `items`";
        $result = mysqli_query($conn, $sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $quantity = json_decode($row["quantity"], true);

            foreach ($quantity as  $i => $c) {
                $n = $c["Pcs"];
                $output["stored"] += $c["Pcs"];
                foreach ($c["Packets"] as $k => $v) {
                    $output["stored"] += ($k * $v);
                    $n += ($k * $v);
                }
                $deposits[$i] += $n;
            }
        }

        $dp = array_sum($deposits) / count($deposits);
        foreach ($statusDetop as $key => $value) {
            if ($dp <= $value["limit"]) {
                $output["statement_of_deposits"]["content"] = $key;
                $output["statement_of_deposits"]["rgb"] = $value["rgb"];
                break;
            }
        }



        $sql = "SELECT buy, status FROM `retainedpurchases` WHERE NOT JSON_EXTRACT(`status`,CONCAT(\"$[\",JSON_LENGTH(`status`)-1,\"].event\")) IN (3,4)";
        $result = mysqli_query($conn, $sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $date = Null;
            $buyData = json_decode($row["buy"], true);

            foreach ($eventData as $a) {
                if ($a["event"] != 3 and $a["event"] != 4) {
                    $date = $a["date"];
                }
            }
            $year = date("Y", strtotime($date));

            if ($_POST["year"] != $year) {
                continue;
            }

            foreach ($buyData as $c) {
                foreach ($c["packs"] as $k => $v) {
                    $output["reserved"] += ($k * $v);
                }
            }
        }

        die(json_encode(["content" => $output]));
    }
    if (isset($_POST["Stat8"])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $deposits = array_fill(1, $depositsAvailable, 0);
        $sql = "SELECT quantity FROM `items`";
        $result = mysqli_query($conn, $sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $quantity = json_decode($row["quantity"], true);

            foreach ($quantity as  $i => $c) {
                $n = $c["Pcs"];
                foreach ($c["Packets"] as $k => $v) {
                    $n += ($k * $v);
                }
                $deposits[$i] += $n;
            }
        }

        $stats_output = [];
        foreach ($deposits as $i => $t) {
            $stats_output[] = [
                "label" => "Deposito " . $i,
                "data" => [$t]
            ];
        }

        die(json_encode(["content" => $stats_output]));
    }
}
