<?php
include('connection.php');
include('code-module.php');


if (isset($_POST['Inventory'])) {
    $connObject = new Connection();
    $conn = $connObject->Connect();

    $code = $_POST['item'];
    $result = mysqli_query($conn, "SELECT id FROM items WHERE id='$code'");
    if (mysqli_num_rows($result) == 0) {
        $sql = "INSERT INTO `items` (`uuid`, `id`, `quantity`, `info`, `photos`, `advanced`, `prices`) VALUES ('" . UUIDv4() . "','$code','[]','" . json_encode(array("desc" => "", "brand" => "", "country" => "", "departament" => "")) . "','[]',AES_ENCRYPT('" . json_encode(array("hide" => false, "views" => [])) . "','" . CLAVE_AES . "'), AES_ENCRYPT('[]','" . CLAVE_AES . "'))";
        if (mysqli_query($conn, $sql)) {
            die(json_encode([true, 0, 'Producto Creado']));
        } else {
            die(json_encode([false, 0, mysqli_error($conn)]));
        }
    } else {
        die(json_encode([false, 1, 'Producto Ya Esta Existente']));
    }
}

if (isset($_POST['Accounting'])) {
    $connObject = new Connection();
    $conn = $connObject->Connect();

    $sql = '';
    $response = ["success" => true, "message" => ""];
    if (isset($_POST['Pedding'])) {
        $list = json_decode($_POST['list'], true);
        $uuidV4 = UUIDv4();
        
        $resultConsult = WithdrawList($conn, "Retained ($uuidV4)", $list['items']);
        if (!$resultConsult["success"]) {
            die(json_encode($resultConsult));
        }

        $clientList = json_encode($list['client']);
        unset($list['client']);
        $list = json_encode($list['items']);

        $currentDateTime = new DateTime('now');
        $currentDateTime = $currentDateTime->format('Y-m-d H:i:s');

        $status = json_encode(array(array("event" => 0, "date" => $currentDateTime, "coment" => "Compra creada y apartada. En espera de analisis")));
        $advanced = json_encode(array("name" => $_POST['name']));

        $sql = "INSERT INTO `retainedpurchases`(`id`, `info`, `buy`, `status`, `advanced`) VALUES ( '" . $uuidV4 . "', AES_ENCRYPT(?,'" . CLAVE_AES . "'),?,?,?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssss", $clientList, $list, $status, $advanced);

        if (!mysqli_stmt_execute($stmt)) {
            die(json_encode(array("success" => false, "message" => 'Error: ' . mysqli_stmt_error($stmt))));
        }

        $last_id = mysqli_stmt_insert_id($stmt);
        die(json_encode(["success" => true, "id" => $last_id]));
    }

    if (isset($_POST['chrystal'])) {
        if (isset($_POST['Budget'])) {
            $list_new = json_decode($_POST['list'], true);
            $list_old = json_decode($_POST['old'], true);
            $uuid = $_POST['id'];

            if (strcmp($_POST['list'], $_POST['old']) !== 0) {
                $connObject = new Connection();
                $conn = $connObject->Connect();
                $resultConsult = UpdateList($conn, "Retained ($uuid)", $list_old, $list_new['items']);

                if (!$resultConsult['success']) {
                    die(json_encode($resultConsult));
                }

                mysqli_query($conn, "UPDATE retainedpurchases SET buy='" . json_encode($list_new['items']) . "', status=JSON_ARRAY_APPEND(status, '$', JSON_OBJECT('event', 3, 'date', NOW(), 'coment', 'Compra Procesada, Paso Por Todos Los Analizis Con Exito. (25/25)')) WHERE id='$uuid'");
            
            } else {
                mysqli_query($conn, "UPDATE retainedpurchases SET status=JSON_ARRAY_APPEND(status, '$', JSON_OBJECT('event', 3, 'date', NOW(), 'coment', 'Compra Procesada, Paso Por Todos Los Analizis Con Exito. (25/25)')) WHERE id='$uuid'");
            }
            $instructions = json_encode(
                array(
                    "peddingId" => $_POST['id'],
                    "budgetId" => "",
                    "budgetUuid" => "",
                    "additionals" => json_decode($_POST['additionals'], true)
                )
            );
            $GLOBALS["sql"] = "INSERT INTO `chrystalwaitinglist` (`id`, `host`, `instructions`, `rule`, `created_at`, `finish_at`) VALUES (NULL, '', '$instructions', 'Budget', NOW(), NULL)";
        } elseif (isset($_POST['Note'])) {
            $uuid = $_POST['uuid'];
            mysqli_query($conn, "UPDATE sales SET event=JSON_ARRAY_APPEND(event, '$', JSON_OBJECT('event', 4, 'date', NOW(), 'coment', 'Presupuesto se Puso En Estado de Bloqueado, Por Que Esta En Espera De Ser Una Nota')) WHERE uuid='$uuid' AND type=0");
            $instructions = json_encode(array("peddingId" => $uuid, "noteId" => ""));
            $GLOBALS["sql"] = "INSERT INTO `chrystalwaitinglist` (`id`, `host`, `instructions`, `rule`, `created_at`, `finish_at`) VALUES (NULL, '', '$instructions', 'Note', NOW(), NULL)";
        } elseif (isset($_POST['Null'])) {
            $result = mysqli_query($conn, "SELECT buy FROM `sales` WHERE uuid='" . $_POST['id'] . "'");
            $row = mysqli_fetch_assoc($result);
 
            $resultConsult = RestoreList($conn, "Sale (" . $_POST['id'] . ")", json_decode($row['buy'], true));

            if (!$resultConsult['success']) {
                die(json_encode($resultConsult));
            }

            $instructions = json_encode(array("peddingId" => $_POST['id'], "returnId" => ""));
            mysqli_query($conn, "UPDATE sales SET event=JSON_ARRAY_APPEND(event, '$', JSON_OBJECT('event', 4, 'date', NOW(), 'coment', 'La Nota se Puso En Estado de Bloqueado, Por Que Esta En Espera De Ser Anulada')) WHERE uuid='" . $_POST['id'] . "'");
            $GLOBALS["sql"] = "INSERT INTO `chrystalwaitinglist` (`id`, `host`, `instructions`, `rule`, `created_at`, `finish_at`) VALUES (NULL, '', '$instructions', 'Cancel', NOW(), NULL)";
        }
    } elseif (isset($_POST['pinesjm'])) {
        if (isset($_POST['Make'])) {
            $list_new = json_decode($_POST['list'], true);
            $list_old = json_decode($_POST['old'], true);

            if (strcmp($_POST['list'], $_POST['old']) !== 0) {
                $connObject = new Connection();
                $conn = $connObject->Connect();
                $resultConsult = UpdateList($conn, "Retained (" . $_POST['uuid'] . ")", $list_old, $list_new['items']);

                if (!$resultConsult['success']) {
                    die(json_encode($resultConsult));
                }

                $currentDateTime = new DateTime('now');
                $currentDateTime = $currentDateTime->format('Y-m-d H:i:s');

                mysqli_query($conn, "UPDATE retainedpurchases SET buy='" . json_encode($list_new['items']) . "', status=JSON_ARRAY_APPEND(status, '$', JSON_OBJECT('event', 3, 'date', NOW(), 'coment', 'Compra Procesada, Paso Por Todos Los Analizis Con Exito. (25/25)')) WHERE id='" . $_POST['uuid'] . "'");
            } else {
                mysqli_query($conn, "UPDATE retainedpurchases SET status=JSON_ARRAY_APPEND(status, '$', JSON_OBJECT('event', 3, 'date', NOW(), 'coment', 'Compra Procesada, Paso Por Todos Los Analizis Con Exito. (25/25)')) WHERE id='". $_POST['uuid'] ."'");
            }

            $result = mysqli_query($conn, "SELECT buy, CAST(AES_DECRYPT(info, '" . CLAVE_AES . "') as CHAR) as info, JSON_UNQUOTE(JSON_EXTRACT(advanced,'$.name')) AS name FROM retainedpurchases WHERE id = '" . $_POST['uuid'] . "'");
            $row = mysqli_fetch_assoc($result);
            $addtionals =  json_decode($_POST['additionals'], true);
            $addtionals['name'] = $row['name'];
            $addtionals = array("additionals" => $addtionals);
            $currentDateTime = new DateTime('now');
            $currentDateTime = $currentDateTime->format('Y-m-d H:i:s');

            $event = json_encode([['event' => 0, "coment" => "Su Compra Ya Esta Lista Para Enviar O Recibir", "date" => $currentDateTime]]);

            $GLOBALS["sql"] = "INSERT INTO `sales`(`uuid`, `nr`, `type`, `info`, `buy`, `advanced`, `paids`, `event`) VALUES ( '" . UUIDv4() . "', " . $_POST['nr'] . ", " . $_POST['type'] . ", AES_ENCRYPT('" . $row["info"] . "', '" . CLAVE_AES . "'), '" . $row['buy'] . "', '" . json_encode($addtionals) . "', AES_ENCRYPT('[]','" . CLAVE_AES . "'), '" . $event . "')";
        }
    }

    $result = mysqli_query($conn, $GLOBALS["sql"]);
    if ($result) {
        $last_id = mysqli_insert_id($conn);
        die(json_encode(["success" => true, "id" => $last_id]));
    } else {
        die(json_encode(array("success" => false, "message" => 'Error: ' . mysqli_error($conn))));
    }
}

if (isset($_POST['User'])) {
    $typeAccount = isset($_POST['typeAccount']) ? $_POST['typeAccount'] : '';
    if (empty($typeAccount) and !array_key_exists($typeAccount, $categoryAccounts)) {
        die(json_encode(array(false, 'Tipo De Cuenta Invalido')));
    }
    $connObject = new Connection();
    $conn = $connObject->Connect();

    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $name = isset($_POST['name']) ? $_POST['name'] : '';
    $lastName = isset($_POST['lastName']) ? $_POST['lastName'] : '';
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $phoneOperator = isset($_POST['operator']) ? $_POST['operator'] : '';
    $phoneNumber = isset($_POST['number']) ? $_POST['number'] : '';
    $typeIdent = isset($_POST['typeIdent']) ? $_POST['typeIdent'] : '';
    $ident = isset($_POST['numberIdent']) ? $_POST['numberIdent'] : '';
    $price = isset($_POST['price']) ? $_POST['price'] : '';
    $credit = isset($_POST['credit']) ? $_POST['credit'] : '';
    $country = isset($_POST['country']) ? $_POST['country'] : '';
    $address = isset($_POST['address']) ? $_POST['address'] : '';
    $state = isset($_POST['state']) ? $_POST['state'] : '';
    $isUp = isset($_POST['isUp']) ? true : false;
    $ban_canLogin = isset($_POST['ban_canLogin']) ? true : false;
    $ban_canBuy = isset($_POST['ban_canBuy']) ? true : false;
    $ban_full = isset($_POST['ban_full']) ? true : false;

    $acctPersonal = array(
        "tlf" => array(
            "number" => $phoneNumber,
            "operator" => $phoneOperator
        ),
        "user" => array(
            $name
        ),
        "email" => $email,
        "photo" => "",
        "state" => $state,
        "isUp" => $isUp,
        "persId" => array(
            "type" => $typeIdent,
            "idenfication" => $ident
        )
    );
    $acctAdvanced = array(
        "price" => $price,
        "credit" => $credit,
        "hides" => array(
            "items" => array()
        ),
        "banned" => array(
            "ban" => $ban_full,
            "unBanDate" => "17/02/2024",
            "canBuy" => $ban_canBuy,
            "canLogin" => $ban_canLogin
        ),
        "codeVerification" => null
    );

    $sql = "SELECT id, username,
    JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.number')) AS tlfnumber,
    JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.operator')) AS tlfoperator,
    JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.email')) AS email,
    JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.type')) AS persIdtype,
    JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.idenfication')) AS persIdidenfication
    FROM `users` WHERE
        (username = ? OR ? = '') AND 
        JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.number') = ? AND 
        JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.operator') = ? AND 
        (JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.email') = ? OR ? = '') AND 
        JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.type') = ? AND 
        JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.idenfication') = ?
    LIMIT 1";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssssssss", $username, $username, $phoneNumber, $phoneOperator, $email, $email, $typeIdent, $ident);
    if (!mysqli_stmt_execute($stmt)) {
        die(json_encode(array(false, 'Error: ' . mysqli_stmt_error($stmt))));
    }

    $result = mysqli_stmt_get_result($stmt);
    if (mysqli_num_rows($result) > 0) {
        $error = array();
        $row = mysqli_fetch_assoc($result);

        if ($row['username'] == $username) {
            $error[] = 'Usuario';
        }
        if ($row['email'] == $email) {
            $error[] = 'Email';
        }
        if ($row['tlfnumber'] == $phoneNumber and $row['tlfoperator'] == $phoneOperator) {
            $error[] = 'Telefono';
        }
        if ($row['persIdtype'] == $typeIdent and $row['persIdidenfication'] == $ident) {
            $error[] = 'Identificación';
        }

        die(json_encode(array(false, 'Los Datos Ingresados Ya Estan Registrados <br> [' . implode(", ", $error) . ']', true)));
    }

    if ($typeAccount != 1) {
        $acctPersonal["user"][] = $lastName;
    }
    $password = password_hash($password, PASSWORD_BCRYPT);
    $_acctPersonal = json_encode($acctPersonal);
    $_acctAdvanced = json_encode($acctAdvanced);
    $_acctAddresses = json_encode(
        [
            [
                "phone" => [],
                "address" => $address,
                "reference" => "",
                "id" => []
            ]
        ]
    );
    $sql = "INSERT INTO `users` (id, acctType, password, username, acctPersonal, acctAdvanced, acctAddresses)
    VALUES (NULL, ?, ?, ?, AES_ENCRYPT(?,'" . CLAVE_AES . "'), ?, AES_ENCRYPT(?,'" . CLAVE_AES . "'))";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssssss", $typeAccount, $password, $username, $_acctPersonal, $_acctAdvanced, $_acctAddresses);
    if (!mysqli_stmt_execute($stmt)) {
        die(json_encode(array(false, 'Error: ' . mysqli_stmt_error($stmt))));
    }
    die(json_encode(array(true)));
}

if (isset($_POST['Departament'])) {
    $connObject = new Connection();
    $conn = $connObject->Connect();

    $hide = (isset($_POST['hide'])) ? true : false;
    $_acctAdvanced = json_encode(array(
        "hide" => $hide,
        "blackList" => json_decode($_POST['blacklist'], true),
        "discount" => json_decode($_POST['discount'], true)
    ));
    $name = $_POST['depa'];
    $desc = $_POST['desc'];



    $sql = "INSERT INTO `departments` (`uuid`, `name`, `description`, `advanced`)
    VALUES ('" . UUIDv4() . "', ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "sss", $name, $desc, $_acctAdvanced);
    if (!mysqli_stmt_execute($stmt)) {
        die(json_encode(array(false, 'Error: ' . mysqli_stmt_error($stmt))));
    }
    die(json_encode(array(true)));
}
