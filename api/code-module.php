<?php

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;



function WithdrawList($conn, $uuid, array $list, $transaction = true)
{
    $resultConsult = [
        "success" => true,
        "message" => "",
        "playload" => [
            "old" => [],
            "new" => [],
            "total" => 0
        ]
    ];

    if ($transaction) {
        mysqli_begin_transaction($conn);
    }

    try {
        foreach ($list as $i => $item) {
            $stmt = mysqli_prepare($conn, "SELECT id, quantity FROM items WHERE id=?");
            mysqli_stmt_bind_param($stmt, "s", $item['code']);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);

            $row = mysqli_fetch_assoc($result);
            $quantity = json_decode($row['quantity'], true);

            $resultConsult["playload"]["old"][] = [
                "code" => $item['code'],
                "depo" => $item['depo'],
                "packs" => $quantity[$item['depo']]['Packets']
            ];

            foreach ($item['packs'] as $pack => $packnum) {
                if ($quantity[$item['depo']]['Packets'][$pack] > 0) {
                    $quantity[$item['depo']]['Packets'][$pack] = $quantity[$item['depo']]['Packets'][$pack] - $packnum;
                    $resultConsult["playload"]["total"] += ($pack * $packnum);
                } else {
                    $resultConsult["message"] = "Error no disponibilidad: " . $item['code'] . "<br>";
                }
            }

            $resultConsult["playload"]["new"][] = [
                "code" => $item['code'],
                "depo" => $item['depo'],
                "packs" => $quantity[$item['depo']]['Packets']
            ];

            $stmt = mysqli_prepare($conn, "UPDATE items SET quantity=? WHERE id=?");
            $quantity_json = json_encode($quantity);
            mysqli_stmt_bind_param($stmt, "ss", $quantity_json, $item['code']);
            mysqli_stmt_execute($stmt);
        }

        if ($transaction && $resultConsult["success"]) {
            mysqli_commit($conn);
            log_request([
                "type" => "log.inv.buy",
                "id" => $uuid,
                "message" => "Salida De Inventario",
                ...$resultConsult["playload"]
            ]);
        }
    } catch (Exception $e) {
        if ($transaction) {
            mysqli_rollback($conn);
        }
        $resultConsult["success"] = false;
        $resultConsult["message"]  = $e->getMessage();
    }

    return $resultConsult;
}

function RestoreList($conn, $uuid, array $buy, $transaction = true)
{
    $resultConsult = [
        "success" => true,
        "message" => "",
        "playload" => [
            "old" => [],
            "new" => [],
            "total" => 0
        ]
    ];

    if ($transaction) {
        mysqli_begin_transaction($conn);
    }


    try {
        foreach ($buy as $x => $item) {
            $stmt = mysqli_prepare($conn, "SELECT quantity FROM items WHERE id=?");
            mysqli_stmt_bind_param($stmt, "s", $item['code']);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);

            $rowitem = mysqli_fetch_assoc($result);
            $quantity = json_decode($rowitem['quantity'], true);

            $resultConsult["playload"]["old"][] = [
                "code" => $item['code'],
                "depo" => $item['depo'],
                "packs" => $quantity[$item['depo']]['Packets']
            ];

            foreach ($item['packs'] as $pack => $packnum) {
                $quantity[$item['depo']]['Packets'][$pack] = $quantity[$item['depo']]['Packets'][$pack] + $packnum;
                $resultConsult["playload"]["total"] += ($pack * $packnum);
            }

            $resultConsult["playload"]["new"][] = [
                "code" => $item['code'],
                "depo" => $item['depo'],
                "packs" => $quantity[$item['depo']]['Packets']
            ];

            $stmt = mysqli_prepare($conn, "UPDATE items SET quantity=? WHERE id=?");
            $quantity_json = json_encode($quantity);
            mysqli_stmt_bind_param($stmt, "ss", $quantity_json, $item['code']);
            mysqli_stmt_execute($stmt);
        }

        if ($transaction && $resultConsult["success"]) {
            mysqli_commit($conn);
            log_request([
                "type" => "log.inv.buy",
                "id" => $uuid,
                "message" => "Entrada De Inventario",
                ...$resultConsult["playload"]
            ]);
        }
    } catch (Exception $e) {
        if ($transaction) {
            mysqli_rollback($conn);
        }
        $resultConsult["success"] = false;
        $resultConsult["message"] = $e->getMessage();
    }



    return $resultConsult;
}

function UpdateList($conn, $uuid, array $old, array $new)
{
    $result = array("success" => true, "message" => "");
    if ($old === $new) {
        $result["message"] = "No hubo Cambios Porque La Lista No se Modifico";
        return $result;
    }

    mysqli_begin_transaction($conn);
    try {
        $result['restore'] = RestoreList($conn, $uuid, $old, false);
        $result['withdraw'] = WithdrawList($conn, $uuid, $new, false);



        if ($result['restore']["success"] && $result['withdraw']["success"]) {
            log_request([
                "type" => "log.inv.buy.update",
                "id" => $uuid,
                "message" => "Entrada y Salida De Inventario",
                "restore" => $result["restore"],
                "withdraw" => $result['withdraw']
            ]);
        }


        mysqli_commit($conn);
    } catch (Exception $e) {
        mysqli_rollback($conn);
        $result['success'] = false;
        $result['message'] = "Error en la operación: " . $e->getMessage(); // Mensaje genérico
    }

    return $result;
}


function ShippingList($conn, array $listShip)
{
    $result = [
        "success" => true,
        "msgError" => [],
        "msgSuccess" => [],
        "playload" => [
            "depoOld" => [
                [],
                []
            ],
            "depoNew" => [
                [],
                []
            ],
            "total" => 0
        ]
    ];

    mysqli_begin_transaction($conn);

    try {
        foreach ($listShip as $key => $arr) {
            $stmt = mysqli_prepare($conn, "SELECT quantity FROM items WHERE id=?");
            mysqli_stmt_bind_param($stmt, "s", $arr['code']);
            mysqli_stmt_execute($stmt);
            $resultQuery = mysqli_stmt_get_result($stmt);

            if (mysqli_num_rows($resultQuery) == 0) {
                $result["msgError"][] = array($arr['code'], "Codigo No Existe");
                continue;
            }

            $row = mysqli_fetch_assoc($resultQuery);
            $quantity = json_decode($row['quantity'], true);
            if (!array_key_exists($arr['depoTo'], $quantity)) {
                $quantity[$arr['depoTo']] = array("Packets" => array(), "Pcs" => 0);
            }




            $result["playload"]["depoOld"][0] = [
                "code" => $arr['code'],
                "depo" => $arr['depo'],
                "packs" => $quantity[$arr['depo']]['Packets']
            ];
            $result["playload"]["depoOld"][1] = [
                "code" => $arr['code'],
                "depo" => $arr['depoTo'],
                "packs" => $quantity[$arr['depoTo']]['Packets']
            ];


            foreach ($arr['packs'] as $pack => $packnum) {
                if (!array_key_exists($pack, $quantity[$arr['depoTo']]['Packets'])) {
                    $quantity[$arr['depoTo']]['Packets'][$pack] = 0;
                }

                $quantity[$arr['depoTo']]['Packets'][$pack] += $packnum;
                $quantity[$arr['depo']]['Packets'][$pack] -= $packnum;

                $result["playload"]["total"] += ($pack * $packnum);
            }


            $result["playload"]["depoNew"][0] = [
                "code" => $arr['code'],
                "depo" => $arr['depo'],
                "packs" => $quantity[$arr['depo']]['Packets']
            ];
            $result["playload"]["depoNew"][1] = [
                "code" => $arr['code'],
                "depo" => $arr['depoTo'],
                "packs" => $quantity[$arr['depoTo']]['Packets']
            ];



            $stmt = mysqli_prepare($conn, "UPDATE items SET quantity=? WHERE id=?");
            $quantity_json = json_encode($quantity);
            mysqli_stmt_bind_param($stmt, "ss", $quantity_json, $arr['code']);
            if (!mysqli_stmt_execute($stmt)) {
                $result["msgError"][] = array($arr['code'], "Error updating quantity");
            }

            $result["msgSuccess"][] = array($arr['code'], "Realizado Exitosamente");
        }

        mysqli_commit($conn);
    } catch (Exception $e) {
        mysqli_rollback($conn);

        $result["success"] = false;
        $result["msgError"][] = array("Error", $e->getMessage());
    }

    if ($result["success"]) {
        log_request([
            "type" => "log.inv.ship",
            "message" => "Envio De Inventario",
            "restore" => $result["playload"]["depoNew"],
            "withdraw" => $result["playload"]["depoOld"],
            "total" => $result["playload"]["total"]
        ]);
    }

    return json_encode($result);
}

function MergedArray($a, $b)
{
    $merged = array();

    // loop through each key in the first array
    foreach ($b as $k => $v) {
        // if the key exists in the second array, add the values
        if (array_key_exists($k, $b)) {
            $merged[$k] = $v + $a[$k];
        } else {
            $merged[$k] = $v;
        }
    }
    // loop through each key in the second array
    foreach ($a as $k => $v) {
        // if the key does not exist in the first array, add it to the result array
        if (!array_key_exists($k, $merged)) {
            $merged[$k] = $v;
        }
    }
    return $merged;
}

function UUIDv4()
{
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        // 32 bits for "time_low"
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),

        // 16 bits for "time_mid"
        mt_rand(0, 0xffff),

        // 16 bits for "time_hi_and_version",
        // four most significant bits holds version number 4
        mt_rand(0, 0x0fff) | 0x4000,

        // 16 bits, 8 bits for "clk_seq_hi_res",
        // 8 bits for "clk_seq_low",
        // two most significant bits holds zero and one for variant DCE1.1
        mt_rand(0, 0x3fff) | 0x8000,

        // 48 bits for "node"
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff)
    );
}

function isOverdue($date, $credit)
{
    $futureDate = strtotime($date . ' + ' . $credit . ' days');
    $now = strtotime('now');
    $diff = $futureDate - $now;

    $isOverdue = ($futureDate <= $now);

    $totalSeconds = abs($diff);
    $months = floor($totalSeconds / (30 * 24 * 3600));
    $days = floor(($totalSeconds % (30 * 24 * 3600)) / (24 * 3600));
    $hours = floor(($totalSeconds % (24 * 3600)) / 3600);
    $minutes = floor(($totalSeconds % 3600) / 60);
    $seconds = $totalSeconds % 60;

    $result = array(
        'isOverdue' => $isOverdue,
        'remaining' => array(
            'seconds' => $seconds,
            'minutes' => $minutes,
            'hours' => $hours,
            'days' => $days,
            'months' => $months
        )
    );

    return $result;
}

function getRemainingTimeString($jsonData)
{
    $months = abs($jsonData['remaining']['months']);
    $days = abs($jsonData['remaining']['days']);
    $hours = abs($jsonData['remaining']['hours']);
    $minutes = abs($jsonData['remaining']['minutes']);
    $seconds = abs($jsonData['remaining']['seconds']);

    $remainingTime = '';

    if ($months > 0) {
        $remainingTime .= $months . ' Mes' . ($months > 1 ? 'es' : '');
    } elseif ($days > 0) {
        $remainingTime .= $days . ' Día' . ($days > 1 ? 's' : '');
    } elseif ($hours > 0) {
        $remainingTime .= $hours . ' Hora' . ($hours > 1 ? 's' : '');
    } elseif ($minutes > 0) {
        $remainingTime .= $minutes . ' Minuto' . ($minutes > 1 ? 's' : '');
    } elseif ($seconds > 0 || ($months == 0 && $days == 0 && $hours == 0 && $minutes == 0 && $seconds == 0)) {
        $remainingTime = 'Justo Ahora';
    }

    return $remainingTime;
}

function limit_chars($text, $limit)
{
    if (strlen($text) > $limit) {
        $text_subtr = substr($text, 0, $limit);
        $text_subtr .= '...';
    } else {
        $text_subtr = $text;
    }
    return $text_subtr;
}


function calculatePrices($row)
{
    $total = 0;
    $cost = 0;
    $tempCost = 0;
    $discountRow = json_decode($row['discount']);
    $buys = [];
    $discount = "";
    foreach (json_decode($row['buy'], true) as $x => $y) {
        $price = $y['price'];

        if (!empty($discountRow[0])) {
            $price -= $discountRow[1] ? $price * ($discountRow[0] / 100) : $discountRow[0];
        }
        if (!empty($y["discount"][0])) {
            $discount = $y["discount"][0] ? number_format($y["discount"][0], 0, ',', '.') . "%" : "$";
            $price -= $y["discount"][1] ? $price * ($y["discount"][0] / 100) : $y["discount"][0];
        }

        $itemTotal = 0;
        $itemCost = 0;
        $tempItemCost = 0;
        $packss = [];
        foreach ($y['packs'] as $quantity => $packs) {
            $itemTotal += $quantity * $packs;
            $itemCost += $quantity * $packs * $price;
            $tempCost += $quantity * $packs * $y['price'];
            $tempItemCost += $quantity * $packs * $y['price'];
            $packss[] = 'Pack [' . $quantity . ']: ' . $packs;
        }

        $buys[] = [
            'code' => $y['code'],
            'depo' => $y['depo'],
            'unitBase' => $y['price'],
            'unitDisc' => $price,
            'disc' => $discount,
            'total' => $itemTotal,
            'cost' => $itemCost,
            'costBase' => $tempItemCost,
            'costDisc' => $tempItemCost - $itemCost,
            'packs' => $packss
        ];


        $total += $itemTotal;
        $cost += $itemCost;
    }
    $indifferent = (!empty($discountRow[0]) && $discountRow[1]) ? ($tempCost * ($discountRow[0] / 100)) : ((!empty($discountRow[0])) ? $discountRow[0] : 0);
    $sign = (!empty($discountRow[0]) && $discountRow[1]) ? ("%") : ((!empty($discountRow[0])) ? "$" : "$");

    $result = [
        'total' => $total,
        'cost' => $cost,
        'disc' => $tempCost,
        'discpercent' => $discountRow[0],
        'discindifferent' => [$indifferent, $sign],
        'buys' => $buys
    ];

    return $result;
}

function log_request($data)
{
    $client = new Client();
    $url = $_ENV['API_SERVER'] . 'logs/inv';

    $data["ip"] = $_SERVER['REMOTE_ADDR'];
    $data["agent"] = $_SERVER['HTTP_USER_AGENT'];


    try {
        $response = $client->post($url, [
            'json' => $data,
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' .  $_ENV['API_KEY_ADMIN'],
                'X-Device-By' => "Web Admin"
            ]
        ]);

        // Obtiene el cuerpo de la respuesta
        $responseData = $response->getBody()->getContents();
        $responseData = json_decode($responseData, true);

        // Puedes hacer algo con la respuesta si es necesario
        return $responseData;
    } catch (RequestException $e) {
        // Manejo de errores
        echo 'Error: ' . $e->getMessage();
        if ($e->hasResponse()) {
            echo ' Respuesta de la API: ' . $e->getResponse()->getBody();
        }
    }
}
