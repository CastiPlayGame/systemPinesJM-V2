<?php
include('connection.php');
include('code-module.php');

use FFMpeg\FFMpeg;
use FFMpeg\Format\Audio\Wav;

if (isset($_POST['Quantity'])) {
    $connObject = new Connection();
    $conn = $connObject->Connect();

    $code = $_POST['item'];
    $depo = intval($_POST['deposit']);
    if (isset($_POST['num'])) {
        $num = intval($_POST['num']);
    }
    $opT = [true, ''];

    $result = mysqli_query($conn, "SELECT quantity FROM items WHERE id='$code'");
    if (!$result) {
        die(json_encode([false, mysqli_error($conn)]));
    }
    $row = mysqli_fetch_assoc($result);
    $quantity = json_decode($row['quantity'], true);
    if (!array_key_exists($depo, $quantity)) {
        $quantity[$depo] = array("Packets" => array(), "Pcs" => 0);
    }
    $old = $quantity;

    $data = [
        "type" => "log.inv.item",
        "id" => $code,
        "message" => "",
        "old" => "",
        "new" => "",
        "depo" => $depo,
        "total" => ""
    ];

    if (isset($_POST['Pcs'])) {
        if (isset($_POST['add'])) {
            $quantity[$depo]['Pcs'] = intval($quantity[$depo]['Pcs']) + $num;
            $opT[1] = "Se Añadieron Piezas";

            $data["message"] = "Se Añadieron Piezas";
            $data["total"] = $num;
        }
        if (isset($_POST['sub'])) {
            $quantity[$depo]['Pcs'] = intval($quantity[$depo]['Pcs']) - $num;
            $opT[1] = "Se Eliminaron Piezas";

            $data["message"] = "Se Eliminaron Piezas";
            $data["total"] = $num;
        }
        if (isset($_POST['set'])) {
            $quantity[$depo]['Pcs'] = $num;
            $opT[1] = "Se Establecio un valor de Piezas";

            $data["message"] = "Se Cambio las Piezas";
            $data["total"] = $num;
        }
    } elseif (isset($_POST['Packet'])) {
        $pack = intval($_POST['pack']);

        if (isset($_POST['new'])) {
            if (!array_key_exists($pack, $quantity[$depo]['Packets'])) {
                $opT[1] = "Se Creo un Paquete";
                $quantity[$depo]['Packets'][$pack] = 0;

                $data["message"] = "Se Creo un Paquete Nuevo";
                $data["total"] = 0;
            } else {
                $opT[1] = "Ya existe Este Paquete";
                $opT[0] = false;
            }
        } elseif (isset($_POST['add'])) {
            if (array_key_exists($pack, $quantity[$depo]['Packets'])) {
                $opT[1] = "Se Añadieron los Paquetes";
                $quantity[$depo]['Packets'][$pack] = intval($quantity[$depo]['Packets'][$pack]) + $num;


                $data["message"] = "Se Agregaron Paquetes";
                $data["total"] = ($pack * $num);
            } else {
                $opT[1] = "Este Paquete No Existe?";
                $opT[0] = false;
            }
        } elseif (isset($_POST['sub'])) {
            if (array_key_exists($pack, $quantity[$depo]['Packets'])) {
                $opT[1] = "Se Eliminaron Paquetes";
                $t = 0;
                if (($quantity[$depo]['Packets'][$pack] - $num) < 0) {
                    $quantity[$depo]['Packets'][$pack] = 0;
                } else {
                    $quantity[$depo]['Packets'][$pack] = intval($quantity[$depo]['Packets'][$pack]) - $num;
                    $t = $pack * $num;
                }

                $data["message"] = "Se Restaron Paquetes";
                $data["total"] = $t;
            } else {
                $opT[1] = "Este Paquete No Existe?";
                $opT[0] = false;
            }
        } elseif (isset($_POST['set'])) {
            if (array_key_exists($pack, $quantity[$depo]['Packets'])) {
                $opT[1] = "Se Establecio un valor de Paquetes";
                $quantity[$depo]['Packets'][$pack] = $num;

                $data["message"] = "Se Cambiaron los Paquetes";
                $data["total"] = ($pack * $num);
            } else {
                $opT[1] = "Este Paquete No Existe?";
                $opT[0] = false;
            }
        } elseif (isset($_POST['del'])) {
            if (array_key_exists($pack, $quantity[$depo]['Packets'])) {
                $opT[1] = "Se Borro un Paquete";

                $data["message"] = "Se Elimino un Paquete";
                $data["total"] = $pack * $quantity[$depo]['Packets'][$pack];

                unset($quantity[$depo]['Packets'][$pack]);
            } else {
                $opT[1] = "Este Paquete No Existe?";
                $opT[0] = false;
            }
        }
    } elseif (isset($_POST['Shipping'])) {
        $depoTo = $_POST['depositSender'];
        $ListSend = json_decode($_POST['ListShip'], true);

        $quantity[$depo]['Pcs'] = $quantity[$depo]['Pcs'] + $ListSend['Pcs'];
        $quantity[$depoTo]['Pcs'] = $quantity[$depoTo]['Pcs'] - $ListSend['Pcs'];

        foreach ($ListSend['Packet'] as $key => $value) {
            $quantity[$depo]['Packets'][$key] = $quantity[$depo]['Packets'][$key] + $value;
            $quantity[$depoTo]['Packets'][$key] = $quantity[$depoTo]['Packets'][$key] - $value;
        }
        $opT = "Traslado de Depositos Exitoso";
    } elseif (isset($_POST['Samples'])) {
        if (!array_key_exists('Samples', $quantity[$depo])) {
            $quantity[$depo]['Samples'] = 0;
        }
        if (isset($_POST['add'])) {
            $quantity[$depo]['Samples'] = intval($quantity[$depo]['Samples']) + $num;
            $opT[1] = "Se Añadieron Muestras";

            $data["message"] = "Se Añadieron Muestras";
            $data["total"] = $num;
        }
        if (isset($_POST['sub'])) {
            $quantity[$depo]['Samples'] = intval($quantity[$depo]['Samples']) - $num;
            $opT[1] = "Se Eliminaron Muestras";

            $data["message"] = "Se Eliminaron Muestras";
            $data["total"] = $num;
        }
        if (isset($_POST['set'])) {
            $quantity[$depo]['Samples'] = $num;
            $opT[1] = "Se Establecio un valor de Muestras";

            $data["message"] = "Se Cambio las Muestras";
            $data["total"] = $num;
        }
    }
    if ($opT[0] != false) {
        krsort($quantity[$depo]['Packets']);
        if (!mysqli_query($conn, "UPDATE items SET quantity='" . json_encode($quantity) . "' WHERE id='$code'")) {
            die(json_encode([false, mysqli_error($conn)]));
        }
        $data["old"] = $old[$depo];
        $data["new"] = $quantity[$depo];

        log_request($data);
    }


    die(json_encode($opT));
}

if (isset($_POST['Item'])) {
    if (isset($_POST['Info'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $hide = (isset($_POST['itemhide'])) ? true : false;
        $uuid = $_POST['uuid'];
        $providerCode = $_POST["providerCode"];


        $info = json_encode(array(
            "departament" => $_POST['depa'],
            "desc" => ucwords($_POST['desc']),
            "brand" => ucwords($_POST['brand']),
            "model" => ucwords($_POST['model']),
            "country" => ""
        ));
        $prices = array();
        $_itemAdvanced = json_encode(array(
            "hide" => $hide,
            "views" => json_decode($_POST['blacklist'], true),
            "provider" => $_POST["providerName"],
            "provider_price" => floatval($_POST["providerPrice"])
        ));

        for ($i = 1; $i <= $price; $i++) {
            if (isset($_POST['price' . $i])) {
                $prices[$i - 1] = $_POST['price' . $i];
            }
        }
        $_itemPrices = json_encode($prices);

        $stmt = mysqli_prepare($conn, "SELECT id FROM `items` WHERE uuid = ?");
        mysqli_stmt_bind_param($stmt, "s", $uuid);
        if (!mysqli_stmt_execute($stmt)) {
            die(json_encode(array(false, 'Error: ' . mysqli_stmt_error($stmt))));
        }

        $result = mysqli_stmt_get_result($stmt);
        if (mysqli_num_rows($result) != 1) {
            die(json_encode(array(false, '!Ups. Item No Existe')));
        }


        $sql = "UPDATE `items` SET `info`=?,`advanced`=AES_ENCRYPT(?,'" . CLAVE_AES . "'),`prices`=AES_ENCRYPT(?,'" . CLAVE_AES . "'),`id_provider`=?  WHERE uuid=?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssss", $info, $_itemAdvanced, $_itemPrices, $providerCode, $uuid);
        if (!mysqli_stmt_execute($stmt)) {
            die(json_encode(array(false, 'Error: ' . mysqli_stmt_error($stmt))));
        }
        die(json_encode(array(true)));
    }
    if (isset($_POST['UploadPic'])) {
        $uuid = $_POST['uuid'];
        if (!isset($_FILES['file'])) {
            die(json_encode(['error' => 'No se proporcionó ningún archivo.']));
        }

        $file = $_FILES['file'];
        $file_name = $file['name'];
        $file_size = $file['size'];
        $file_tmp = $file['tmp_name'];
        $file_type = $file['type'];

        // Check file size
        $limit_bytes = 10 * 1024 * 1024;
        if ($file_size > $limit_bytes) {
            die(json_encode(['error' => 'El archivo es demasiado grande. El tamaño máximo permitido es ' . $limit_bytes . ' bytes.']));
        }

        // Check file type
        $allowed_types = ['image/jpeg', 'image/png'];
        if (!in_array($file_type, $allowed_types)) {
            die(json_encode(['error' => 'El tipo de archivo no es válido.' . $file_name . ' Los tipos de archivo permitidos son: ' . implode(', ', $allowed_types) . '']));
        }

        // Move the file to a permanent location
        $target_dir = '../resc/pic/' . $uuid . '/';
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        $newName = 'PIC-' . UUIDv4() . '.webp';
        $target_file = $target_dir . $newName;


        switch ($file_type) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($file_tmp);
                imagewebp($image, $target_file, 85);
                break;
            case 'image/png':
                $image = imagecreatefrompng($file_tmp);
                imagepalettetotruecolor($image);
                imagewebp($image, $target_file, 85);
                break;
        }

        $file_size = filesize($target_file);
        $file_type = mime_content_type($target_file);

        if (!file_exists($target_file)) {
            die(json_encode(['error' => 'No se pudo convertir y mover el archivo a la ubicación permanente.']));
        }

        //Upload IN MYSQL 
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $stmt = mysqli_prepare($conn, "SELECT id, photos FROM `items` WHERE uuid = ?");
        mysqli_stmt_bind_param($stmt, "s", $uuid);
        if (!mysqli_stmt_execute($stmt)) {
            die(json_encode(['error' => 'Error: ' . mysqli_stmt_error($stmt)]));
        }
        $result = mysqli_stmt_get_result($stmt);
        if (mysqli_num_rows($result) != 1) {
            die(json_encode(['error' => '!Ups. Item No Existe']));
        }
        $row = mysqli_fetch_assoc($result);
        $photos = array();
        if ($row['photos'] != 'null' or count(json_decode($row['photos'], true)) != 0) {
            $photos = json_decode($row['photos'], true);
        }
        $currentDateTime = new DateTime();
        $formattedDateTime = $currentDateTime->format("Y/m/d H:i:s");
        $photos[] = array('name' => $newName, "size" => $file_size, "type" => $file_type, "date" => $formattedDateTime);

        $_photos = json_encode($photos);

        $sql = "UPDATE `items` SET `photos`=? WHERE uuid=?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ss", $_photos, $uuid);
        if (!mysqli_stmt_execute($stmt)) {
            die(json_encode(['error' => 'Error: ' . mysqli_stmt_error($stmt)]));
        }
        die(json_encode(['success' => true, 'file' => $newName]));
    }

    if (isset($_POST['DelPic'])) {
        $uuid = $_POST['uuid'];
        $pic = $_POST['picture'];

        $connObject = new Connection();
        $conn = $connObject->Connect();

        $stmt = mysqli_prepare($conn, "SELECT id, photos FROM `items` WHERE uuid = ?");
        mysqli_stmt_bind_param($stmt, "s", $uuid);
        if (!mysqli_stmt_execute($stmt)) {
            die(json_encode(['error' => 'Error: ' . mysqli_stmt_error($stmt)]));
        }
        $result = mysqli_stmt_get_result($stmt);
        if (mysqli_num_rows($result) != 1) {
            die(json_encode(['error' => '!Ups. Item No Existe']));
        }
        $row = mysqli_fetch_assoc($result);

        $currentDateTime = new DateTime();
        $formattedDateTime = $currentDateTime->format("Y/m/d H:i:s");

        $photos = json_decode($row['photos'], true);
        unlink('../resc/pic/' . $uuid . '/' . $photos[$pic]['name']);
        unset($photos[$pic]);

        $_photos = json_encode($photos);
        $sql = "UPDATE `items` SET `photos`=? WHERE uuid=?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ss", $_photos, $uuid);
        if (!mysqli_stmt_execute($stmt)) {
            die(json_encode(['error' => 'Error: ' . mysqli_stmt_error($stmt)]));
        }
        die(json_encode(['success' => true]));
    }

    if (isset($_POST['UpdateSort'])) {
        $uuid = $_POST['uuid'];
        $sorted = json_decode($_POST['sorted'], true);

        $connObject = new Connection();
        $conn = $connObject->Connect();

        $stmt = mysqli_prepare($conn, "SELECT id, photos FROM `items` WHERE uuid = ?");
        mysqli_stmt_bind_param($stmt, "s", $uuid);
        if (!mysqli_stmt_execute($stmt)) {
            die(json_encode(['error' => 'Error: ' . mysqli_stmt_error($stmt)]));
        }
        $result = mysqli_stmt_get_result($stmt);
        if (mysqli_num_rows($result) != 1) {
            die(json_encode(['error' => '!Ups. Item No Existe']));
        }
        $row = mysqli_fetch_assoc($result);

        $currentDateTime = new DateTime();
        $formattedDateTime = $currentDateTime->format("Y/m/d H:i:s");

        $photos_old = json_decode($row['photos'], true);
        $photos_new = array();
        foreach ($sorted as $val) {
            $photos_old[$val]['date'] = $formattedDateTime;
            $photos_new[] = $photos_old[$val];
        }

        $_photos = json_encode($photos_new);
        $sql = "UPDATE `items` SET `photos`=? WHERE uuid=?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ss", $_photos, $uuid);
        if (!mysqli_stmt_execute($stmt)) {
            die(json_encode(['error' => 'Error: ' . mysqli_stmt_error($stmt)]));
        }
        die(json_encode(['success' => true]));
    }
}

if (isset($_POST['Shipping'])) {
    $connObject = new Connection();
    $conn = $connObject->Connect();
    sleep(4);
    $listShip = json_decode($_POST['listship'], true);
    $result = ShippingList($conn, $listShip);

    die(json_encode($result));
}

if (isset($_POST['Movements'])) {
    if (isset($_POST['Null'])) {
        $resultConsult = ["success" => false, "message" => ""]; // Default response

        try {
            $connObject = new Connection();
            $conn = $connObject->Connect();

            $sql = "SELECT buy, type, nr FROM sales WHERE uuid='" . $_POST['uuid'] . "'";
            $result = mysqli_query($conn, $sql);

            if (mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_assoc($result);
                $buy = json_decode($row['buy'], true);

                $log = RestoreList($conn, $_POST['uuid'], $buy);

                if (!$log["success"]) {
                    die(json_encode($log));
                }

                $updateSql = "UPDATE sales SET event=JSON_ARRAY_APPEND(event, '$', JSON_OBJECT('event', 3, 'date', NOW(), 'coment', 'Su " . $type[$row['type']] . " nr: " . $row['nr'] . " Ha Sido Restaurado Existosamente')) WHERE uuid='" . $_POST['uuid'] . "'";
                $resultConsult["success"] = true;
                $resultConsult["message"] = "Su " . $type[$row['type']] . " nr: " . $row['nr'] . " Ha Sido Restaurado Existosamente";

                mysqli_query($conn, $updateSql);
            } else {
                $resultConsult["success"] = false;
                $resultConsult["message"] = "!Ups. La Compra No Existe";
            }
        } catch (Exception $e) {
            $resultConsult["success"] = false;
            $resultConsult["message"] = "Error: " . $e->getMessage();
        }

        die(json_encode($resultConsult));
    }
    if (isset($_POST['ToNote'])) {
        $resultConsult = ["success" => false, "message" => ""];

        try {
            $connObject = new Connection();
            $conn = $connObject->Connect();
            $sql = "SELECT type FROM sales WHERE uuid='" . $_POST['uuid'] . "' AND type=0";
            $result = mysqli_query($conn, $sql);

            if (mysqli_num_rows($result) > 0) {
                $updateSql = "UPDATE sales SET type=1, nr=" . $_POST['nr'] . ", event=JSON_ARRAY_APPEND(event, '$', JSON_OBJECT('event', 0, 'date', NOW(), 'coment', 'Su Nota Ha Sido Creada y Realizada Con Exito...')) WHERE uuid='" . $_POST['uuid'] . "'";
                mysqli_query($conn, $updateSql);

                $resultConsult["success"] = true;
                $resultConsult["message"] = "Su Nota Ha Sido Creada y Realizada Con Exito...";
            } else {
                $resultConsult["success"] = false;
                $resultConsult["message"] = "!Ups. La Compra No Existe";
            }
        } catch (Exception $e) {
            $resultConsult["success"] = false;
            $resultConsult["message"] = "Error: " . $e->getMessage();
        }
        die(json_encode($resultConsult));
    }
}

if (isset($_POST['User'])) {
    $typeAccount = isset($_POST['typeAccount']) ? $_POST['typeAccount'] : '';
    if (empty($typeAccount) and !array_key_exists($typeAccount, $categoryAccounts)) {
        die(json_encode(array(false, 'Tipo De Cuenta Invalido')));
    }
    $connObject = new Connection();
    $conn = $connObject->Connect();

    $userID = isset($_POST['id']) ? $_POST['id'] : '';

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

    // VERIFICAR USUARIO
    $stmt = mysqli_prepare($conn, "SELECT id FROM `users` WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "s", $userID);
    if (!mysqli_stmt_execute($stmt)) {
        die(json_encode(array(false, 'Error: ' . mysqli_stmt_error($stmt))));
    }

    $result = mysqli_stmt_get_result($stmt);
    if (mysqli_num_rows($result) != 1) {
        die(json_encode(array(false, '!Ups. Usuario No Existe', true)));
    }

    $sql = "SELECT id, username,
    JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.number')) AS tlfnumber,
    JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.operator')) AS tlfoperator,
    JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.email')) AS email,
    JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.type')) AS persIdtype,
    JSON_UNQUOTE(JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.idenfication')) AS persIdidenfication
    FROM `users` WHERE
    NOT id = ? AND (username = ? OR 
    JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.number') = ? AND 
    JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.tlf.operator') = ? OR 
    JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.email') = ? OR 
    JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.type') = ? AND 
    JSON_EXTRACT(CAST(AES_DECRYPT(acctPersonal,'" . CLAVE_AES . "') AS CHAR),'$.persId.idenfication') = ?)
    LIMIT 5";

    // VERIFICAR SI LOS DATOS INGRESADOS EXISTEN
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "sssssss", $userID, $username, $phoneNumber, $phoneOperator, $email, $typeIdent, $ident);
    if (!mysqli_stmt_execute($stmt)) {
        die(json_encode(array(false, 'Error: ' . mysqli_stmt_error($stmt), true)));
    }

    $result = mysqli_stmt_get_result($stmt);
    if (mysqli_num_rows($result) > 0) {
        $error = array();
        $row = mysqli_fetch_assoc($result);

        if (!empty($username) && $row['username'] == $username) {
            $error[] = 'Usuario';
        }
        if (!empty($email) && $row['email'] == $email) {
            $error[] = 'Email';
        }
        if ($row['tlfnumber'] == $phoneNumber && $row['tlfoperator'] == $phoneOperator) {
            $error[] = 'Telefono';
        }
        if ($row['persIdtype'] == $typeIdent && $row['persIdidenfication'] == $ident) {
            $error[] = 'Identificación';
        }

        if (!empty($error)) {
            die(json_encode(array(false, 'Los Datos Ingresados Ya Estan Registrados <br> [' . implode(", ", $error) . ']')));
        }
    }

    if ($typeAccount != 1) {
        $acctPersonal["user"][] = $lastName;
    }

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

    if (!empty($password)) {
        $password = password_hash($password, PASSWORD_BCRYPT);
        $sql = "UPDATE `users` SET acctType=?, password=?, username=?, acctPersonal=AES_ENCRYPT(?,'" . CLAVE_AES . "'), acctAdvanced=?, acctAddresses=AES_ENCRYPT(?,'" . CLAVE_AES . "') WHERE id=?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssssss", $typeAccount, $password, $username, $_acctPersonal, $_acctAdvanced, $_acctAddresses, $userID);
    } else {
        $sql = "UPDATE `users` SET acctType=?, username=?, acctPersonal=AES_ENCRYPT(?,'" . CLAVE_AES . "'), acctAdvanced=?, acctAddresses=AES_ENCRYPT(?,'" . CLAVE_AES . "') WHERE id=?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssssss", $typeAccount, $username, $_acctPersonal, $_acctAdvanced, $_acctAddresses, $userID);
    }

    if (!mysqli_stmt_execute($stmt)) {
        die(json_encode(array(false, 'Error: ' . mysqli_stmt_error($stmt), true)));
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
    $uuid = $_POST['uuid'];

    $stmt = mysqli_prepare($conn, "SELECT name FROM `departments` WHERE uuid = ?");
    mysqli_stmt_bind_param($stmt, "s", $uuid);
    if (!mysqli_stmt_execute($stmt)) {
        die(json_encode(array(false, 'Error: ' . mysqli_stmt_error($stmt))));
    }

    $result = mysqli_stmt_get_result($stmt);
    if (mysqli_num_rows($result) != 1) {
        die(json_encode(array(false, '!Ups. Departamento No Existe')));
    }


    $sql = "UPDATE `departments` SET `name`=?,`description`=?,`advanced`=? WHERE uuid=?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssss", $name, $desc, $_acctAdvanced, $uuid);
    if (!mysqli_stmt_execute($stmt)) {
        die(json_encode(array(false, 'Error: ' . mysqli_stmt_error($stmt))));
    }
    die(json_encode(array(true)));
}

if (isset($_POST['Point'])) {
    if (isset($_POST['retainedSave'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();

        $list_new = json_decode($_POST['list'], true);
        $list_old = json_decode($_POST['old'], true);
        $uuid = $_POST['uuid'];

        $result = UpdateList($conn, "Retained ($uuid)", $list_old, $list_new['items']);


        $currentDateTime = new DateTime('now');
        $currentDateTime = $currentDateTime->format('Y-m-d H:i:s');

        mysqli_query($conn, "UPDATE retainedpurchases SET buy='" . json_encode($list_new['items']) . "', status=JSON_ARRAY_APPEND(status, '$', JSON_OBJECT('event', '" . $_POST['status'] . "', 'date', '" . $currentDateTime . "', 'coment', '" . $_POST['coment'] . "')) WHERE id='$uuid'");

        die(json_encode($result));
    }
    if (isset($_POST['retainedChange'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();
        $uuid = $_POST['uuid'];

        $currentDateTime = new DateTime('now');
        $currentDateTime = $currentDateTime->format('Y-m-d H:i:s');
        $call = ["success" => true, "message" => ""];
        if (isset($_POST['Null'])) {
            $sql = "SELECT `buy` FROM `retainedpurchases` WHERE id='$uuid'";
            $result = mysqli_query($conn, $sql);

            if (mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_assoc($result);
                $restore = RestoreList($conn, $uuid, json_decode($row['buy'], true));
                if (!$restore["success"]) {
                    die(json_encode($restore));
                }
            } else {
                $call["success"] = false;
                $call["message"] = "Ups. Pedido No Encontrado";
                die(json_encode($call));
            }
        }
        $result = mysqli_query($conn, "UPDATE retainedpurchases SET status=JSON_ARRAY_APPEND(status, '$', JSON_OBJECT('event', " . $_POST['status'] . ", 'date', NOW(), 'coment', '" . $_POST['coment'] . "')) WHERE id='$uuid'");

        if ($result) {
            die(json_encode($call));
        }
        die(json_encode(array("success" => false, "message" => mysqli_error($conn))));
    }
    if (isset($_POST['saleChange'])) {
        $connObject = new Connection();
        $conn = $connObject->Connect();
        $uuid = $_POST['uuid'];

        $result = mysqli_query($conn, "UPDATE sales SET event=JSON_ARRAY_APPEND(event, '$', JSON_OBJECT('event', " . $_POST['event'] . ", 'date', NOW(), 'coment', '" . $_POST['coment'] . "')) WHERE uuid='$uuid'");

        if ($result) {
            die(json_encode(array(true)));
        }
        die(json_encode(array(false, mysqli_error($conn))));
    }
    if (isset($_POST['saleNewPay'])) {
        $uuid = $_POST['uuid'];
        $newName = '';
        if (isset($_FILES['pic'])) {
            $file = $_FILES['pic'];
            $file_name = $file['name'];
            $file_size = $file['size'];
            $file_tmp = $file['tmp_name'];
            $file_type = $file['type'];

            // Check file size
            $limit_bytes = 10 * 1024 * 1024;
            if ($file_size > $limit_bytes) {
                die(json_encode(['error' => 'El archivo es demasiado grande. El tamaño máximo permitido es ' . $limit_bytes . ' bytes.']));
            }

            // Check file type
            $allowed_types = ['image/jpeg', 'image/png'];
            if (!in_array($file_type, $allowed_types)) {
                die(json_encode(['error' => 'El tipo de archivo no es válido.' . $file_name . ' Los tipos de archivo permitidos son: ' . implode(', ', $allowed_types) . '']));
            }

            // Move the file to a permanent location
            $target_dir = '../resc/screenshot/';
            $newName = 'PAY_PIC-' . UUIDv4() . '.' . pathinfo($file_name, PATHINFO_EXTENSION);
            $target_file = $target_dir . $newName;

            if (!move_uploaded_file($file_tmp, $target_file)) {
                die(json_encode(['error' => 'No se pudo mover el archivo a la ubicación permanente.']));
            }
        }

        $connObject = new Connection();
        $conn = $connObject->Connect();

        $result = mysqli_query($conn, "UPDATE sales SET paids=
        AES_ENCRYPT(
            JSON_ARRAY_APPEND(
                CAST(
                    AES_DECRYPT(paids,'" . CLAVE_AES . "') AS CHAR), '$', 
                    
                JSON_OBJECT(
                    'by', '1', 
                    'ammount', '" . $_POST['ammount'] . "', 
                    'method', '" . $_POST['method'] . "', 
                    'currency', '0', 
                    'refference', '" . $_POST['refference'] . "', 
                    'photo', '" . $newName . "', 
                    'created_at', NOW(), 
                    'description', '" . $_POST['coment'] . "'
                    )
                ),'" . CLAVE_AES . "') WHERE uuid='" . $uuid . "'");

        if ($result) {
            die(json_encode(['success' => true]));
        }
        die(json_encode(['error' => mysqli_error($conn)]));
    }
}

if(isset($_POST['FFmpeg'])){

    // Verificar los valores de inicio y fin

    if (isset($_FILES['audio']) && $_FILES['audio']['error'] === UPLOAD_ERR_OK) {
        $inputFile = $_FILES['audio']['tmp_name'];
        $outputFile = tempnam(sys_get_temp_dir(), 'recorte') . '.wav';

        // Verificar que el archivo de entrada existe y es legible
        if (!file_exists($inputFile)) {
            error_log("El archivo de entrada no existe: $inputFile");
            echo json_encode(['success' => false, 'error' => 'Archivo de entrada no encontrado']);
            exit;
        }

        // Verificar el tamaño del archivo de entrada
        $inputSize = filesize($inputFile);
        error_log("Tamaño del archivo de entrada: $inputSize bytes");

        try {
            $ffmpeg = FFMpeg::create([
                'ffmpeg.binaries'  => 'C:/Program Files/FFmpeg/bin/ffmpeg.exe',
                'ffprobe.binaries' => 'C:/Program Files/FFmpeg/bin/ffprobe.exe'
            ]);
            
            $audio = $ffmpeg->open($inputFile);

            // Recortar desde $start hasta $end
            $audio->filters();
            $format = new Wav();
            $audio->save($format, $outputFile);

            // Verificar que el archivo de salida existe y es legible
            if (!file_exists($outputFile)) {
                error_log("El archivo de salida no se creó: $outputFile");
                echo json_encode(['success' => false, 'error' => 'Error al crear archivo de salida']);
                exit;
            }

            // Verificar el tamaño del archivo de salida
            $outputSize = filesize($outputFile);
            error_log("Tamaño del archivo de salida: $outputSize bytes");

            // Leer el contenido del archivo
            $audioContent = file_get_contents($outputFile);
            if ($audioContent === false) {
                error_log("No se pudo leer el archivo de salida");
                echo json_encode(['success' => false, 'error' => 'Error al leer archivo de salida']);
                exit;
            }

            // Convertir a base64
            $audioBase64 = base64_encode($audioContent);
            
            // Verificar que la conversión a base64 no está vacía
            if (empty($audioBase64)) {
                error_log("La conversión a base64 resultó en una cadena vacía");
                echo json_encode(['success' => false, 'error' => 'Error en la conversión a base64']);
                exit;
            }

            // Verificar el tamaño de la cadena base64
            error_log("Tamaño de la cadena base64: " . strlen($audioBase64) . " caracteres");

            $audioUrl = 'data:audio/wav;base64,' . $audioBase64; // Cambiado a wav en lugar de ogg

            // Limpiar el archivo temporal
            if (file_exists($outputFile)) {
                unlink($outputFile);
            }

            echo json_encode([
                'success' => true,
                'audioBase64' => $audioBase64,
                'audioUrl' => $audioUrl,
                'fileSize' => $outputSize,
                'inputSize' => $inputSize
            ]);

        } catch (Exception $e) {
            error_log("Error en el procesamiento: " . $e->getMessage());
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    } else {
        $uploadError = isset($_FILES['audio']) ? $_FILES['audio']['error'] : 'No file uploaded';
        error_log("Error en la subida del archivo: $uploadError");
        echo json_encode(['success' => false, 'error' => 'Error en la subida del archivo: ' . $uploadError]);
    }
}