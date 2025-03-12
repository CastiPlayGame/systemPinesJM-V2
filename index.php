<?php

// Check if API key is valid
if (isset($_GET['api_key'])) {
    include('api/connection.php');
    $apiKeyFromRequest = $_GET['api_key'];
    $apiKeyFromEnv = $_ENV['API_KEY_USER'] ?? null;

    if ($apiKeyFromEnv && $apiKeyFromRequest === $apiKeyFromEnv) {
        // API key is valid, set session
        session_start();
        $_SESSION['api_authenticated'] = true;

        // Redirect to clean URL without the api_key parameter
        $redirectUrl = strtok($_SERVER['REQUEST_URI'], '?');
        if (!empty($_GET)) {
            $params = $_GET;
            unset($params['api_key']); // Remove api_key from parameters
            if (!empty($params)) {
                $redirectUrl .= '?' . http_build_query($params);
            }
        }
        header('Location: ' . $redirectUrl);
        exit;
    } else {
        // API key is invalid, return 403 Forbidden
        header('HTTP/1.1 403 Forbidden');
        echo 'Access Denied: Invalid API Key';
        exit;
    }
} else {
    // Check if already authenticated in session
    session_start();
    if (!isset($_SESSION['api_authenticated']) || $_SESSION['api_authenticated'] !== true) {
        // No API key provided and not authenticated, return 403 Forbidden
        header('HTTP/1.1 403 Forbidden');
        echo 'Access Denied: API Key Required';
        exit;
    }
}
?>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
        crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-maskmoney/3.0.2/jquery.maskMoney.min.js"
        integrity="sha512-Rdk63VC+1UYzGSgd3u2iadi0joUrcwX0IWp2rTh6KXFoAmgOjRS99Vynz1lJPT8dLjvo6JZOqpAHJyfCEZ5KoA=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="js/module.js"></script>
    <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

    <?php
    $get = array_keys($_GET);
    if (isset($_GET["Storage"])) {
        echo '<script src="js/Storage/' . $get[1] . '.js"></script>';
    } elseif (isset($_GET["DataBase"])) {
        echo '<script src="js/DataBase/' . $get[1] . '.js"></script>';
    } elseif (isset($_GET["Accounting"])) {
        echo '<script src="js/Accounting/' . $get[1] . '.js"></script>';
    } elseif (isset($_GET["Statistics"])) {
        echo '<script src="js/Statistics/Stats.js"></script>';
        echo '<script src="js/report.js"></script>';
        echo '<script src="js/Statistics/' . $get[1] . '.js"></script>';
    }


    ?>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="css/newBootstrap.css">
    <link rel="stylesheet" href="css/colors.css">
    <link rel="stylesheet" href="css/sidebar.css">
    <link rel="stylesheet" href="css/general.css">
</head>

<body>
    <div class="wrapper">
        <aside id="sidebar">
            <div class="d-flex">
                <button class="toggle-btn" type="button">
                    <i class="bi bi-grid"></i>
                </button>
            </div>
            <ul class="sidebar-nav pb-2">
                <!-- Ventas -->
                <li class="sidebar-item">
                    <a name="Accounting" href="#" class="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse"
                        data-bs-target="#solds" aria-expanded="false" aria-controls="solds">
                        <i class="bi bi-currency-dollar"></i>
                    </a>
                    <ul class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
                        <li class="sidebar-item">
                            <a name="Point" href="?Accounting&Point" class="sidebar-link">
                                <i class="bi bi-bag"></i>
                                Ventas
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a name="Retained" href="?Accounting&Retained" class="sidebar-link">
                                <i class="bi bi-hourglass"></i>
                                Pendientes
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a name="Sales" href="?Accounting&Sales" class="sidebar-link">
                                <i class="bi bi-card-text"></i>
                                Ventas
                            </a>
                        </li>
                    </ul>
                </li>

                <!-- Estadisticas -->
                <li class="sidebar-item">
                    <a name="Statistics" class="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse"
                        data-bs-target="#stats" aria-expanded="false" aria-controls="stats">
                        <i class="bi bi-graph-up"></i>
                    </a>
                    <ul id="stats" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
                        <li class="sidebar-item">
                            <a name="General" href="?Statistics&General" class="sidebar-link">
                                <i class="bi bi-clipboard-pulse"></i>
                                General
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a name="Warehouse" href="?Statistics&Warehouse" class="sidebar-link">
                                <i class="bi bi-box-seam"></i>
                                Inventario
                            </a>
                        </li>
                        <!--
                        <li class="sidebar-item">
                            <a name="Finance" href="?Statistics&Finance" class="sidebar-link">
                                <i class="bi bi-bank"></i>
                                Finanza
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a name="Infrastructure" href="?Statistics&Infrastructure" class="sidebar-link">
                                <i class="bi bi-building"></i>
                                Infrestructura
                            </a>
                        </li>
                        -->
                    </ul>
                </li>
                

                <!-- Base De Datos -->
                <li class="sidebar-item">
                    <a name="DataBase" class="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse"
                        data-bs-target="#config" aria-expanded="false" aria-controls="config">
                        <i class="bi bi-database"></i>
                    </a>
                    <ul id="config" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
                        <li class="sidebar-item">
                            <a name="Users" href="?DataBase&Users" class="sidebar-link">
                                <i class="bi bi-person"></i>
                                Clientes
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a name="Departaments" href="?DataBase&Departaments" class="sidebar-link">
                                <i class="bi bi-grid-1x2"></i>
                                Departamentos
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a name="Servers" href="?DataBase&Servers" class="sidebar-link">
                                <i class="bi bi-pc"></i>
                                Servidores
                            </a>
                        </li>
                    </ul>
                </li>

                <!-- Opciones -->
                <li class="sidebar-item">
                    <a name="Storage" class="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse"
                        data-bs-target="#storage" aria-expanded="false" aria-controls="storage">
                        <i class="bi bi-archive"></i>
                    </a>
                    <ul id="storage" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
                        <li class="sidebar-item">
                            <a name="Inventory" href="?Storage&Inventory" class="sidebar-link">
                                <i class="bi bi-box-seam"></i>
                                Items
                            </a>
                        </li>
                        <!--
                        <li class="sidebar-item">
                            <a name="Shipment" href="?Storage&Shipment" class="sidebar-link">
                                <i class="bi bi-truck"></i>
                                Traslado
                            </a>
                        </li>
                        
                        <li class="sidebar-item">
                            <a name="Charge" href="?Storage&Charge" class="sidebar-link">
                                <i class="bi bi-box-arrow-in-up-right"></i>
                                Carga
                            </a>
                        </li>
                        <li class="sidebar-item">
                            <a name="Discharge" href="?Storage&Discharge" class="sidebar-link">
                                <i class="bi bi-box-arrow-in-down-left"></i>
                                Descarga
                            </a>
                        </li>
                        -->
                        <li class="sidebar-item">
                            <a name="History" href="?Storage&History" class="sidebar-link">
                                <i class="bi bi-card-text"></i>
                                Historial
                            </a>
                        </li>
                    </ul>
                </li>


            </ul>
        </aside>
        <div class="main p-3">
            <?php include('api/pages.php') ?>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal" id="modal" tabindex="-1" aria-labelledby="title" data-bs-backdrop="static"
        data-bs-keyboard="false" data-bs-focus="false" aria-hidden="true">
        <div id="modalSize" class="modal-dialog modal-lg">
            <div class="modal-content">
            </div>
        </div>
    </div>

    <!--Mensages Emergentes-->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:-1">
        <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="" style="font-size: 1.5rem;"></i>
                <strong class="ms-2 me-auto"></strong>
                <small></small>
                <button type="button" class="btn-close btn-close-white shadow-none" data-bs-dismiss="toast"
                    aria-label="Close"></button>
            </div>
            <div class="toast-body">
            </div>
        </div>
    </div>

    <script>
        $(document).ready(function() {
            $('.sidebar-nav a').removeClass("active")
            $.each(<?php echo json_encode($_GET) ?>, function(index, value) {
                if ($(`a.sidebar-link[name="${index}"]`).length) {
                    $(`a.sidebar-link[name="${index}"]`).addClass("active");
                }
            });
        });
    </script>
</body>

</html>