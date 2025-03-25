<?php
if (isset($_GET["Storage"])) {
    if (isset($_GET['Inventory'])) {
        echo '
        <script>
            $(document).ready(function () {
                $("#ItemCont").hide();
                $("#PreviewCont").show();
                updateTable();
                setInterval(updateTable, updateTime*1000);
                $(`#prices input`).maskMoney();
                $(`#priceProvider input`).maskMoney();
            });
        </script>
        <div class="row gx-3 mb-4">
            <div class="col-6">
                <h4 class="m-0">Iventario</h4>
            </div>
            <div class="col-2 d-flex justify-content-end">
                <button type="button" class="btn btn-outline-dark me-3" modal-data-locate="Inventory&Item&Mode=New" modal-size="2" id="modalBtn">Nuevo</button>
                <button type="button" class="btn btn-outline-dark me-3" modal-data-locate="Inventory&Filter" id="modalBtn">Filtro</button>
                <button type="button" class="btn btn-outline-dark me-3" id="reportBtn">Reporte</button>
            </div>
            <div class="col-4">
                <div class="input-group">
                    <input type="text" class="form-control shadow-none" placeholder="Buscar" aria-label="Buscar" oninput="this.value = this.value.toUpperCase();" aria-describedby="button-addon2" id="qinput">
                    <button class="btn btn-outline-dark" type="button" id="qsearch">Buscar</button>
                </div>
            </div>
        </div>
        <div class="row gx-4">
            <div class="col-4">
                <table class="InventoryList table table-striped table-bordered table-scroll">
                    <thead>
                        <tr>
                            <th class="col-4" scope="col">Id</th>
                            <th class="col-4" scope="col">Total</th>
                            <th class="col-4" scope="col"></th>
                        </tr>
                    </thead>
                    <tbody class="table-group-divider" style="max-height: 39rem;">
                        
                    </tbody>
                </table>
            </div>
        
            <div class="col-8" id="ItemCont">
                <nav class="d-flex w-100 justify-content-center mb-3">
                    <div class="nav nav-pills" id="nav-tab" role="tablist">
                        <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">
                            <i class="bi bi-house h4 m-0"></i>
                        </button>
                        <button class="nav-link" id="nav-image-tab" data-bs-toggle="tab" data-bs-target="#nav-image" type="button" role="tab" aria-controls="nav-image" aria-selected="false">
                            <i class="bi bi bi-images h4 m-0"></i>
                        </button>
                        <button class="nav-link" id="nav-storage-tab" data-bs-toggle="tab" data-bs-target="#nav-storage" type="button" role="tab" aria-controls="nav-storage" aria-selected="false">
                            <i class="bi bi bi-box-seam h4 m-0"></i>
                        </button>
                    </div>
                </nav>
                <div class="tab-content" id="nav-tabContent">
                    <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab" tabindex="0">
                        <form id="saveInfo" autocomplete="off" post-data="">
                            <h1 class="modal-title w-100 fs-4 align-text" id="title" style="color:var(--secondary_text_color)">General</h1>   
                            <div class="gy-3 row row-cols-auto w-100 mt-1 mb-3">          
                                <div class="col-4">
                                    <label for="" class="form-label">Codigo</label>
                                    <input type="text" class="form-control shadow-none" name="code" disabled>
                                </div>
                                <div class="col-8">
                                    <label for="" class="form-label">Descripcion</label>
                                    <input type="text" class="form-control shadow-none" name="desc">
                                </div>
                                <div class="col-3">
                                    <label for="" class="form-label">Marca</label>
                                    <input type="text" class="form-control shadow-none" name="brand">
                                </div>
                                <div class="col-3">
                                    <label for="" class="form-label">Modelo</label>
                                    <input type="text" class="form-control shadow-none" name="model">
                                </div>
                                <div class="col-6">
                                    <label for="" class="form-label">Departamentos</label>
                                    <select class="form-select shadow-none" name="depa">
                                        <option selected>Open this select menu</option>
                                        <option value="1">One</option>
                                        <option value="2">Two</option>
                                        <option value="3">Three</option>
                                    </select>
                                </div> 
                                <div class="col-3 excludes">
                                    <input type="hidden" name="blacklist">
                                    <button type="button" class="btn btn-outline-dark me-3" modal-data-locate="Inventory&Excludes&id=" modal-size="2" id="modalBtn">Lista Negra</button>
                                </div>  
                                <div class="col-1 form-check">
                                    <input class="form-check-input" type="checkbox" name="itemhide">
                                    <label class="form-check-label" for="hide">
                                        Ocultar
                                    </label>
                                </div>
                            </div>    

                            <h1 class="modal-title w-100 fs-4 align-text" id="providerTitle" style="color:var(--secondary_text_color)">Proveedor</h1>   
                            <div class="gy-3 row row-cols-auto w-100 mt-1 mb-3">
                                <div class="col-3">
                                    <label for="" class="form-label">Codigo Proveedor</label>
                                    <input type="text" class="form-control shadow-none" name="providerCode" oninput="this.value = this.value.toUpperCase();">
                                </div>
                                <div class="col-6">
                                    <label for="" class="form-label">Nombre Proveedor</label>
                                    <input type="text" class="form-control shadow-none" name="providerName">
                                </div>
                                <div class="col-3" id="priceProvider">
                                    <label for="" class="form-label">Precio Proveedor</label>
                                    <div class="input-group">
                                        <span class="input-group-text">$</span>
                                        <input type="text" class="form-control" placeholder="0.00000" name="providerPrice" data-precision="5">
                                    </div>
                                </div>
                            </div>

                            <h1 class="modal-title w-100 fs-4 align-text" id="pricesTitle" style="color:var(--secondary_text_color)">Precios</h1>   
                            <div id="prices" class="gy-1 row row-cols-auto w-100 mt-12">
                                ';
                                for ($i = 1; $i <= $price; $i++) {
                                    echo '<div class="col-6 col-md-3 col-lg-2">
                                        <label for="" class="form-label">Precio <?php echo $i; ?></label>
                                        <div class="input-group">
                                            <span class="input-group-text">$</span>
                                            <input class="form-control" type="text" placeholder="0.000" name="price'. $i .'" data-precision="3">
                                        </div>
                                    </div>';
                                }
                                echo'
                            </div>
                            
                            <button type="submit" class="btn btn-dark btn-account-primary shadow-none border-0 mt-4">Guardar</button>
                        </form>
                    </div>
                    <div class="tab-pane fade" id="nav-image" role="tabpanel" aria-labelledby="nav-image-tab" tabindex="1">
                        <form id="saveChangesPic" autocomplete="off" post-data=""><gs-1></gs-1>
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="btn btn-dark shadow-none" for="uploadPic">
                                    Subir Foto  
                                    <i class="bi bi-upload"></i>
                                </label>
                                <div id="uploadStatus" class="spinner-border text-primary" role="status" hidden>
                                </div>
                                <i id="readyStatus" class="bi bi-cloud-check h2"></i>
                            </div>
                            <input type="file" id="uploadPic" accept=".png,.jpg,.jpeg" hidden>
                            <div class="mt-3" style="height: 71vh;overflow-y: scroll;overflow-x: hidden;">
                                <ul id="sortable" class="list-unstyled row g-2 pictures">
                                </ul>
                            </div>
                        </form>
                    </div>
                    <div class="tab-pane fade" id="nav-storage" role="tabpanel" aria-labelledby="nav-storage-tab" tabindex="2">
                        <div class="deposits d-flex justify-content-center w-100">
                            <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                                ';
        for ($i = 1; $i <=  $depositsAvailable; $i++) {
            echo '
                                        <input type="radio" class="btn-check" value="' . $i . '" name="depositnr" id="btnradio' . $i . '" autocomplete="off">
                                        <label class="btn btn-outline-dark d-grid shadow-none" for="btnradio' . $i . '"><i class="bi bi-archive h4 m-0"></i> ' . $i . '</label>
                                    ';
        }
        echo '
                            </div>
                        </div>

                        <div class="row gx-3 mb-3">
                            <div class="col-9" id="titleDeposits">
                                <h5 class="m-0">Cantidad Total: 44984</h5>
                                <h6 class="m-0">Cantidad Deposito (1): 1520</h6>
                            </div>
                            <div class="col-3 d-flex justify-content-end">
                                <button type="button" class="btn btn-dark shadow-none" modal-data-locate="Inventory&Item&Mode=NewPacket" id="modalBtn"><i class="bi bi-plus-lg"></i></button>
                            </div>
                        </div>
                        <table class="ItemList table table-striped table-bordered table-scroll">
                            <thead>
                                <tr>
                                    <th class="col-4" scope="col">Tipo</th>
                                    <th class="col-3" scope="col">Cantidad</th>
                                    <th class="col-3" scope="col">Total</th>
                                    <th class="col-2" scope="col">Action</th>
                                </tr>
                            </thead>
                            <tbody class="table-group-divider" style="max-height: 28rem;">
                                
                            </tbody>
                        </table>     
                    </div>
                    
                </div>
            </div>
            <div class="col-8 d-flex align-items-center" id="PreviewCont">
                <img class="object-fit-contain w-100 h-80" src="resc/img/wait1.svg" >
            </div>
        </div>

        
        
        ';
    } elseif (isset($_GET['Shipment'])) {
        echo '
        <script>
            $(document).ready(function () {
                setInterval(function(){
                    new Core().verify();
                }, updateTime*1000);
                new Core().sendverify();
            });
        </script>


        <div class="pb-2 m-0 w-100">
            <div class="row row-cols-sm-2 row-cols-md-auto">        
                <div class="col col-12 col-md-6 col-lg-8">
                    <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Traslado</h1>      
                </div>
                <div class="col col-12 col-md-6 col-lg-4 d-flex align-items-center">
                    <div class="input-group rounded">
                        <input type="text" class="form-control rounded shadow-none" oninput="this.value = this.value.toUpperCase();" id="qinput" placeholder="Buscar" aria-label="Buscar" aria-describedby="search-addon" />
                        <span class="input-group-text border-0" id="search-addon">
                            <button type="button" class="btn shadow-none border-0 w-100">
                                <i class="bi bi-search" style="color:var(--secondary_text_color)"></i>
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <table class="ShipmentList table table-striped table-bordered table-scroll small">
                <thead>
                    <tr>
                        <th class="col-1" scope="col"></th>
                        <th class="col-2" scope="col">Id</th>
                        <th class="col-2" scope="col">Origen</th>
                        <th class="col-1" scope="col">Cantidad</th>
                        <th class="col-2" scope="col">Destino</th>
                        <th class="col-4" scope="col">Total</th>
                    </tr>
                </thead>
                <tbody class="table-group-divider" style="max-height: 36rem;">
                    
                </tbody>
            </table>
        </div>
        <div class="row d-flex align-items-center position-absolute bottom-0 start-50 translate-middle-x w-30 mb-3 rounded-2" style="height: 5rem; background: var(--primary_color)"> 
            <div class="col-7">
                <div class="d-flex flex-column">
                    <h6 class="text-light" id="lblItemsTotal">Total Items: 5410</h6>
                    <h6 class="text-light" id="lblQuantitySend">Cantidad a Enviar: 5410</h6>
                </div>
            </div>
            <div class="col-5 d-flex justify-content-end">
                <button type="button" class="btn btn-light me-2" id="clearList">
                    <i class="bi bi-file-earmark-excel h4"></i>
                </button>
                <button type="button" class="btn btn-light" id="Shipment">
                    <i class="bi bi-send-check h4"></i>
                </button>
            </div>
        </div>';
    } elseif (isset($_GET['Charge'])) {
    } elseif (isset($_GET['Discharge'])) {
    } elseif (isset($_GET['History'])) {
        echo '
        <div class="d-flex flex-column w-100 h-100">
            <div class="pb-3 m-0 w-100">
                <div class="row row-cols-sm-2 row-cols-md-auto">        
                    <div class="col col-12 col-md-10 col-lg-8">
                        <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Historial</h1>      
                    </div>
                    <div class="col col-4 col-md-2 col-lg-1 d-flex align-items-center">
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100">Filtros</button>
                    </div>
                    <div class="col col-8 col-md-10 col-lg-3 d-flex align-items-center">
                        <div class="input-group rounded">
                            <input type="text" class="form-control rounded shadow-none" id="qinput" placeholder="Buscar" aria-label="Buscar" aria-describedby="search-addon" />
                            <span class="input-group-text border-0" id="search-addon">
                                <button type="button" class="btn shadow-none border-0 w-100">
                                    <i class="bi bi-search" style="color:var(--secondary_text_color)"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-responsive rounded-top overflow-hidden flex-grow-1 w-100">
                <table id="History" class="table table-striped table-scroll small">
                    <thead>
                        <tr> 
                            <th class="col-stv-5" scope="col">Fecha y Hora</th>
                            <th class="col-stv-4" scope="col">Tipo</th>
                            <th class="col-stv-4" scope="col">Dispositivo</th>
                            <th class="col-stv-3" scope="col">IP</th>
                            <th class="col-stv-2" scope="col">Agente</th>
                            <th class="col-stv-6" scope="col">Referencia</th>
                            <th class="col-stv-6" scope="col">Contexto</th>
                            <th class="col-stv-2" scope="col"></th>
                        </tr>
                    </thead>
                    <tbody class="table-group-divider" style="max-height: 80vh;">
                    </tbody>
                </table>
            </div>
        </div>
        ';
    }
}

if (isset($_GET["DataBase"])) {
    if (isset($_GET["Users"])) {
        echo '        
        <script>
            $(document).ready(function () {
                updateTable();
            });
        </script>
        <div class="d-flex flex-column w-100 h-100">
            <div class="pb-3 m-0 w-100">
                <div class="row row-cols-sm-2 row-cols-md-auto">        
                    <div class="col col-8 col-md-10 col-lg-7">
                        <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Usuarios</h1>      
                    </div>
                    <div class="col col-4 col-md-2 col-lg-1 d-flex align-items-center">
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100"
                        modal-data-locate="DataBase&Users&Mode=New" modal-size="2" id="modalBtn">Crear</button>
                    </div>
                    <div class="col col-4 col-md-2 col-lg-1 d-flex align-items-center">
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100">Filtros</button>
                    </div>
                    <div class="col col-8 col-md-10 col-lg-3 d-flex align-items-center">
                        <div class="input-group rounded">
                            <input type="text" class="form-control rounded shadow-none" id="qinput" placeholder="Buscar" aria-label="Buscar" aria-describedby="search-addon" />
                            <span class="input-group-text border-0" id="search-addon">
                                <button type="button" class="btn shadow-none border-0 w-100">
                                    <i class="bi bi-search" style="color:var(--secondary_text_color)"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-responsive rounded-top overflow-hidden flex-grow-1 w-100">
                <table class="table table-striped table-scroll">
                    <thead>
                        <tr> 
                            <th class="col-2 col-md-1" scope="col">ID</th>
                            <th class="col-1 d-none d-sm-none d-md-table-cell" scope="col">Tipo</th>
                            <th class="col-6 d-sm-table-cell d-md-none" scope="col">Usuario</th>
                            <th class="col-3 d-none d-sm-none d-md-table-cell" scope="col">Nombre Y Apellido</th>
                            <th class="col-2 d-none d-sm-none d-md-table-cell" scope="col">Telefono</th>
                            <th class="col-3 d-none d-sm-none d-xl-table-cell d-lg-none" scope="col">Email</th>
                            <th class="col-2 d-none d-lg-table-cell d-md-none" scope="col">Credencial</th>
                            <th class="col-4 col-md-2" scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody class="table-group-divider" style="max-height: 80vh;">
                    </tbody>
                </table>
            </div>
        </div>
        ';
    } elseif (isset($_GET["Servers"])) {
        echo '
        <script>
            $(document).ready(function () {
                $(document).find(".ServerList tbody").html(new sweet_loader().loader("Cargando"));
                updateTable();
                setInterval(updateTable, updateTime*1000);
            });
        </script>
        <div class="pb-3 m-0 w-100">
            <div class="row row-cols-sm-2 row-cols-md-auto">        
                <div class="col col-12 col-sm-6 col-md-7 col-lg-8">
                    <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Servidores</h1>      
                </div>
                <div class="col col-12 col-sm-6 col-md-5 col-lg-4 d-flex align-items-center">
                    <div class="input-group rounded">
                        <input type="search" id="qsearch" class="form-control rounded shadow-none" placeholder="Search" aria-label="Search" aria-describedby="search-addon" />
                        <span class="input-group-text border-0" id="search-addon">
                            <button type="button" class="btn shadow-none border-0 w-100">
                                <i class="bi bi-search" style="color:var(--secondary_text_color)"></i>
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="table-responsive rounded-top overflow-hidden flex-grow-1 w-100">
            <table class="ServerList table table-striped table-scroll small">
                <thead>
                    <tr> 
                        <th class="col-4 d-none d-xl-table-cell" scope="col">ID</th>
                        <th class="col-5 col-sm-4 col-md-3 col-lg-2" scope="col">Nombre</th>
                        <th class="col-2 col-md-1 d-none d-md-none d-lg-table-cell" scope="col">IP</th>
                        <th class="col-3 col-md-2 col-lg-1" scope="col">Estado</th>
                        <th class="col-2 col-md-2 col-lg-1 d-none d-md-table-cell " scope="col">Latencia</th>
                        <th class="col-sm-5 col-md-4 col-lg-3 d-none d-sm-table-cell" scope="col">Operacion</th>
                    </tr>
                </thead>
                <tbody class="h-65 h-lg-70 h-xl-75">

                </tbody>
            </table>
        </div>
        ';
    } elseif (isset($_GET["Departaments"])) {
        echo '
        <script>
            updateTable();
            setInterval(updateTable, updateTime*1000);
        </script>
        <div class="d-flex flex-column w-100 h-100">
            <div class="pb-2 m-0 w-100">
                <div class="row row-cols-sm-2 row-cols-md-auto">        
                    <div class="col col-8 col-md-10 col-lg-8">
                        <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Departamentos</h1>      
                    </div>
                    <div class="col col-4 col-md-2 col-lg-1 d-flex align-items-center">
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100"
                        modal-data-locate="DataBase&Departaments&Mode=New" modal-size="2" id="modalBtn">Crear</button>
                    </div>
                    <div class="col col-12 col-lg-3 d-flex align-items-center">
                        <div class="input-group rounded">
                            <input type="text" class="form-control rounded shadow-none" id="qinput" placeholder="Buscar" aria-label="Buscar" aria-describedby="search-addon" />
                            <span class="input-group-text border-0" id="search-addon">
                                <button type="button" class="btn shadow-none border-0 w-100">
                                    <i class="bi bi-search" style="color:var(--secondary_text_color)"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-responsive rounded-top overflow-hidden flex-grow-1 w-100 small">
                <table class="Departaments table table-striped table-scroll">
                    <thead>
                        <tr> 
                            <td class="col-3" scope="col">UUID</td>
                            <th class="col-2" scope="col">Nombre</th>
                            <th class="col-1" scope="col">Items</th>
                            <th class="col-1" scope="col">Excluidos</th>
                            <th class="col-1" scope="col">Oculto</th>
                            <th class="col-3" scope="col">Descripcion</th>
                            <th class="col-1" scope="col"></th>
                        </tr>
                    </thead>
                    <tbody style="height: 85vh;">
                    </tbody>
                </table>
            </div>
        </div>
        ';
    }
}

if (isset($_GET["Accounting"])) {
    if (isset($_GET["Point"])) {
        echo '
        <script>
            $(document).ready(function () {
                
                
            });
        </script>

        <div class="d-flex flex-column w-100 h-100">
            <div class="pb-2 m-0 w-100">
                <div class="row row-cols-sm-2 row-cols-md-auto">        
                    <div class="col col-12 col-md-8">
                        <h2 class="display-6 titleCategory ps-1 titlePoint" style="color:var(--secondary_text_color)">Ventas</h2>      
                    </div>
                    <div class="col col-12 col-md-4 col-lg-4 d-flex align-items-center">
                        <div class="input-group rounded">
                            <input type="text" class="form-control rounded shadow-none" id="qinput" placeholder="Buscar" aria-label="Buscar" aria-describedby="search-addon" />
                            <span class="input-group-text border-0" id="search-addon">
                                <button type="button" class="btn shadow-none border-0 w-100">
                                    <i class="bi bi-search" style="color:var(--secondary_text_color)"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-responsive rounded-top overflow-hidden flex-grow-1 w-100">
                <table class="CartList table table-striped table-scroll small">
                    <thead>
                        <tr>
                            <th class="col-stv-2" scope="col"></th>
                            <th class="col-stv-3" scope="col">Id</th>
                            <th class="col-stv-4" scope="col">Deposito</th>
                            <th class="col-stv-14" scope="col">Cantidad</th>
                            <th class="col-stv-3" scope="col">Precio</th>
                            <th class="col-stv-4" scope="col">Descuento</th>
                            <th class="col-stv-2" scope="col">Costo</th>
                            <th class="col-stv-2" scope="col">Total</th>

                        </tr>
                    </thead>
                    <tbody class="" style="height: 70vh;">
                    </tbody>
                </table>
            </div>
            <div class="d-flex justify-content-center">
                <div class="row d-flex align-items-center w-55 rounded-2" style="height: 5.5rem; background: var(--primary_color)"> 
                    <div class="col-9">
                        <div class="d-flex flex-column">
                            <h6 class="d-inline-block text-truncate text-light" style="max-width: 95%;" id="lblClientName"></h6>
                            <h6 class="text-light m-0" id="lblBuyTotal">Total: 0</h6>
                            <h6 class="text-light m-0" id="lblBuyCost">Costo: 0.00$</h6>
                        </div>
                    </div>

                    <div class="col-3 d-flex justify-content-end">
                        <button type="button" class="btn btn-light me-2" id="clearList">
                            <i class="bi bi-file-earmark-excel h4"></i>
                        </button>
                        <button type="button" class="btn btn-light buyBtn" id="completBuy" disabled>
                            <i class="bi bi-send-slash h4"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        ';
    } elseif (isset($_GET["Sales"])) {
        echo '
        <script>
            updateTable();
            setInterval(updateTable, updateTime*1000);
        </script>
        <div class="d-flex flex-column w-100 h-100">
            <div class="pb-2 m-0 w-100">
                <div class="row row-cols-sm-2 row-cols-md-auto">        
                    <div class="col col-8 col-md-10 col-lg-7">
                        <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Ventas</h1>      
                    </div>
                    <div class="col col-4 col-md-2 col-lg-1 d-flex align-items-center">
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100" modal-data-locate="Sales&Filter" modal-size="2" id="modalBtn">Filtros</button>
                    </div>
                    <div class="col col-4 col-md-2 col-lg-1 d-flex align-items-center">
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100">Reporte</button>
                    </div>
                    <div class="col col-8 col-md-10 col-lg-3 d-flex align-items-center">
                        <div class="input-group rounded">
                            <input type="text" class="form-control rounded shadow-none" id="qinput" placeholder="Buscar" aria-label="Buscar" aria-describedby="search-addon" />
                            <span class="input-group-text border-0" id="search-addon">
                                <button type="button" class="btn shadow-none border-0 w-100">
                                    <i class="bi bi-search" style="color:var(--secondary_text_color)"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-responsive rounded-top overflow-hidden flex-grow-1 w-100 small">
                <table class="Sales table table-striped table-scroll">
                    <thead>
                        <tr> 
                            <th class="col-1" scope="col">Nr</th>
                            <th class="col-1" scope="col">Tipo</th>
                            <th class="col-3" scope="col">Cliente</th>
                            <th class="col-1" scope="col">Total</th>
                            <th class="col-1" scope="col">Costo</th>
                            <th class="col-1" scope="col">Resumen</th>
                            <th class="col-1" scope="col">Estado</th>
                            <th class="col-2" scope="col">Fecha</th>
                            <th class="col-1" scope="col"></th>
                        </tr>
                    </thead>
                    <tbody style="height: 85vh;">
                    </tbody>
                </table>
            </div>
        </div>
        ';
    } elseif (isset($_GET["Retained"])) {
        echo '        
        <script>
            updateTable();
            setInterval(updateTable, updateTime*1000);
        </script>
        <div class="d-flex flex-column w-100 h-100">
            <div class="pb-2 m-0 w-100">
                <div class="row row-cols-sm-2 row-cols-md-auto">        
                    <div class="col col-8 col-md-10 col-lg-7">
                        <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Pendientes</h1>      
                    </div>
                    <div class="col col-4 col-md-2 col-lg-1 d-flex align-items-center">
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100"
                        modal-data-locate="Reatined&Mix" modal-size="3" id="modalBtn" disabled>Mezclar</button>
                    </div>
                    <div class="col col-4 col-md-2 col-lg-1 d-flex align-items-center">
                        <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100" modal-data-locate="Reatined&Filter" modal-size="2" id="modalBtn">Filtros</button>
                    </div>
                    <div class="col col-8 col-md-10 col-lg-3 d-flex align-items-center">
                        <div class="input-group rounded">
                            <input type="text" class="form-control rounded shadow-none" id="qinput" placeholder="Buscar" aria-label="Buscar" aria-describedby="search-addon" />
                            <span class="input-group-text border-0" id="search-addon">
                                <button type="button" class="btn shadow-none border-0 w-100">
                                    <i class="bi bi-search" style="color:var(--secondary_text_color)"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div id="ListRetained" class="table-responsive rounded-top overflow-hidden flex-grow-1 w-100 small">
                <table class="table table-striped table-scroll">
                    <thead>
                        <tr> 
                            <th class="col-3 d-none d-sm-none d-md-table-cell" scope="col">UUID</th>
                            <th class="col-6 col-md-3" scope="col">Cliente</th>
                            <th class="col-1 d-none d-sm-none d-md-table-cell" scope="col">Nombre</th>
                            <th class="col-1 d-none d-sm-none d-md-table-cell" scope="col">Costo</th>
                            <th class="col-1 d-none d-sm-none d-md-table-cell" scope="col">Estado</th>
                            <th class="col-3 col-md-1" scope="col">Total</th>
                            <th class="col-3 col-md-1" scope="col"></th>
                        </tr>
                    </thead>
                    <tbody style="height: 85vh;">
                    </tbody>
                </table>
            </div>
        </div>
        ';
    }
}

if (isset($_GET["Statistics"])) {
    if (isset($_GET["General"])) {
        echo '
            <div class="d-flex flex-column w-100 h-100">
                <div class="pb-2 m-0 w-100">
                    <div class="row row-cols-sm-2 row-cols-md-auto">        
                        <div class="col flex-grow-1">
                            <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Estadisticas</h1>      
                        </div>
                        <div class="col d-flex align-items-center">
                            <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100"
                            modal-data-locate="Statistics&Report" id="modalBtn">Reportes</button>
                        </div>
                    </div>

                </div>
                
                <div class="row row-cols-5 gx-4 ms-1 me-1" id="cardsStats">
                    <div class="col">
                        <div class="row p-2 shadow rounded-5 border me-3">
                            <div class="col-6 m-0 d-flex flex-column justify-content-center align-items-start">
                                <p class="fs-6 fw-bolder m-0 p-0 text-secondary lh-sm">CLIENTES</p>
                                <p id="cardClient" class="fs-5 fw-bolder m-0 p-0 "></p>
                            </div>
                            <div class="col-6 m-0 d-flex justify-content-center align-items-center">
                                <i class="display-2 bi bi-people-fill" style="color: #00bfffff"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="row p-2 shadow rounded-5 border me-3">
                            <div class="col-6 d-flex flex-column justify-content-center align-items-start">
                                <p class="fs-6 fw-bolder m-0 p-0 text-secondary lh-sm">SERVIDORES<br>ONLINE</p>
                                <p id="cardServer" class="fs-5 fw-bolder m-0 p-0"></p>
                            </div>
                            <div class="col-6 d-flex justify-content-center align-items-center">
                                <i class="display-2 bi bi-pc-horizontal" style="color: #20b2aaff"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="row p-2 shadow rounded-5 border me-3">
                            <div class="col-6 d-flex flex-column justify-content-center align-items-start">
                                <p class="fs-6 fw-bolder m-0 p-0 text-secondary lh-sm">VENTAS</p>
                                <p id="cardSold" class="fs-5 fw-bolder m-0 p-0"></p>
                            </div>
                            <div class="col-6 d-flex justify-content-center align-items-center">
                                <i class="display-2 bi bi-currency-dollar" style="color: #3cb371ff"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="row p-2 shadow rounded-5 border me-3">
                            <div class="col-6 d-flex flex-column justify-content-center align-items-start">
                                <p class="fs-6 fw-bolder m-0 p-0 text-secondary lh-sm">PEDIDOS</p>
                                <p id="cardPedding" class="fs-5 fw-bolder m-0 p-0"></p>
                            </div>
                            <div class="col-6 d-flex justify-content-center align-items-center">
                                <i class="display-2 bi bi-box" style="color: #a0522dff"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="row p-2 shadow rounded-5 border">
                            <div class="col-6 d-flex flex-column justify-content-center align-items-start">
                                <p class="fs-6 fw-bolder m-0 p-0 text-secondary lh-sm">PRODUCTOS</p>
                                <p id="cardItem" class="fs-5 fw-bolder m-0 p-0"></p>
                            </div>
                            <div class="col-6 d-flex justify-content-center align-items-center">
                                <i class="display-2 bi bi-cloud-fog2" style="color: #ae2e2eff"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row h-100 gx-3 mt-3">
                    <div class="col-stv-19 d-flex flex-column">
                        <div id="invStats" class="card shadow p-3 flex-fill">
                            <div class="row mb-1 ms-2 me-2">
                                <div class="col-10">
                                    <p class="h5">15 Productos Mas Vendidos</p>
                                </div>
                                <div class="col-2">
                                    <select id="yearStats" class="form-select form-select-sm" aria-label="Default select example">
                                    </select>
                                </div>
                            </div>

                            <div class="h-100 w-100">
                                <canvas class="w-100" id="myLineChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-stv-13">
                        <div class="row h-100 gx-3">
                            <div class="col-6">
                                <div id="accountingStats" class="card shadow p-3 h-100">
                                    <div class="row mb-1">
                                        <div class="col-6">
                                            <p class="h5">Resumen</p>
                                        </div>
                                        <div class="col-6">
                                            <select id="yearStats" class="form-select form-select-sm" aria-label="Default select example">
                                            </select>
                                        </div>
                                    </div>
                                    <div class="h-100 w-100">
                                        <canvas class="w-100" id="myDoughnutChart"></canvas>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div id="apiStats" class="card shadow p-3 h-100">
                                    <p class="h5">API STATUS</p>
                                    <div class="d-flex justify-content-between">
                                        <p class="mb-1">Service Status:</p>
                                        <p id="apiStatus" class=""></p> 
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <p>DB Status:</p>
                                        <p id="bdStatus" class=""></p>
                                    </div>

                                    <div class="d-flex justify-content-between">
                                        <p class="mb-1">CPU Usage:</p>
                                        <p id="apiCpu" class="mb-1"></p>
                                    </div>

                                    <div class="d-flex justify-content-between">
                                        <p class="mb-1">RAM Usage:</p>
                                        <p id="apiRam" class="mb-1"></p>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <p class="mb-1">Disk Usage:</p>
                                        <p id="apiDisk" class="mb-1"></p>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <p class="mb-1">Bandwidth Usage:</p>
                                        <p id="apiBandwidth" class="mb-1"></p>
                                    </div>

                                    <div class="d-flex justify-content-between">
                                        <p class="mb-1">Latency:</p>
                                        <p id="apiLatency" class="mb-1"></p>
                                    </div>

                                    <div class="d-flex justify-content-between">
                                        <p class="mb-1">Requests Today:</p>
                                        <p id="apiRequests" class="mb-1"></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 mt-3">
                                <div id="lowStockStats" class="card shadow p-3 h-100">
                                    <div class="row mb-1">
                                        <div class="col-6">
                                            <p class="h5">Productos Criticos</p>
                                        </div>
                                        <div class="col-6">
                                            <select id="yearStats" class="form-select form-select-sm" aria-label="Default select example">
                                            </select>
                                        </div>
                                    </div>
                                    <div id="listCritical" class="row row-cols-4 g-1">
                                        

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ';
    } elseif (isset($_GET["Warehouse"])) {
        echo '
        <div class="d-flex flex-column w-100 h-100">
            <div class="m-0 w-100">
                <div id="menuInventory" class="row row-cols-sm-2 row-cols-md-auto">        
                    <div class="col col-12 col-lg-9">
                        <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Estadisticas De Inventario</h1>      
                    </div>
                    <div class="col col-12 col-md-3">
                        <select id="yearStats" class="form-select" aria-label="Default select example">
                        </select>
                    </div>
                </div>
            </div>
            <div class="stv-scroll me-n1" style="height: 90vh;">
                <div class="row gx-3 p-4" >
                    <div class="col-stv-19">
                        <div class="row h-100 flex-column">
                            <div class="col">
                                <div id="invStats" class="card shadow p-3 h-100">

                                    <div class="row mb-1 ms-2 me-2">
                                        <div class="col">
                                            <p class="h5">20 Productos Mas Vendidos</p>
                                        </div>
                                        <div class="col-3">
                                            <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100" date-type="inv" id="report">Reporte</button>
                                        </div>
                                    </div>
                                    <div class="w-100" style="height: 450px;"> <!-- Ajusta la altura según sea necesario -->
                                        <canvas id="myLineChart"></canvas>
                                    </div>
                                </div>
                            </div>
                            <div class="col mt-3">
                                <div id="cliStats" class="card shadow p-3 h-100">
                                    <div class="row mb-1 ms-2 me-2">
                                        <div class="col">
                                            <p class="h5">5 Compradores Mas Importantes</p>
                                        </div>
                                        <div class="col-3">
                                            <button type="button" class="btn btn-dark btn-account-primary shadow-none border-0 w-100" date-type="client" id="report">Reporte</button>
                                        </div>
                                    </div>
                                    <div class="w-100" style="height: 350px;"> <!-- Ajusta la altura según sea necesario -->
                                        <canvas id="myLineChart"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-stv-13">
                        <div class="row h-100 flex-column">
                            <div class="col mb-3">
                                <div id="cardsStats" class="card border-0 p-3 h-100">
                                    <div class="row">

                                        <div class="col-6 pt-0">
                                            <div class="row p-2 shadow rounded-5 border me-1">
                                                <div class="col-6 m-0 d-flex flex-column justify-content-center align-items-start">
                                                    <p class="fs-6 fw-bolder m-0 p-0 text-secondary lh-sm">ALMACENADO</p>
                                                    <p id="cardStored" class="fs-5 fw-bolder m-0 p-0 ">0</p>
                                                </div>
                                                <div class="col-6 m-0 d-flex justify-content-center align-items-center">
                                                    <i class="display-2 bi bi-box-seam" style="color: #725541ff"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="row p-2 shadow rounded-5 border">
                                                <div class="col-6 m-0 d-flex flex-column justify-content-center align-items-start">
                                                    <p class="fs-6 fw-bolder m-0 p-0 text-secondary lh-sm">RESERVADO</p>
                                                    <p id="cardReserved" class="fs-5 fw-bolder m-0 p-0 ">0</p>
                                                </div>
                                                <div class="col-6 m-0 d-flex justify-content-center align-items-center">
                                                    <i class="display-2 bi bi-hourglass-split" style="color: #3cb371ff"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="row p-2 shadow rounded-5 border me-1 mt-3">
                                                <div class="col-6 m-0 d-flex flex-column justify-content-center align-items-start">
                                                    <p class="fs-6 fw-bolder m-0 p-0 text-secondary lh-sm">SALIDA</p>
                                                    <p id="cardOut" class="fs-5 fw-bolder m-0 p-0 ">0</p>
                                                </div>
                                                <div class="col-6 m-0 d-flex justify-content-center align-items-center">
                                                    <i class="display-2 bi bi-truck" style="color: #dc143cff"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="row p-2 shadow rounded-5 border mt-3">
                                                <div class="col-6 m-0 d-flex flex-column justify-content-center align-items-start">
                                                    <p class="fs-6 fw-bolder m-0 p-0 text-secondary lh-sm">ESTADO DE<br>DEPOSITOS</p>
                                                    <p id="cardDepo" class="fs-5 fw-bolder m-0 p-0 ">Good</p>
                                                </div>
                                                <div class="col-6 m-0 d-flex justify-content-center align-items-center">
                                                    <i class="display-2 bi bi-grid-1x2-fill" style="color: #00bfffff"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col mb-3">
                                <div id="criticalStats" class="card shadow p-3 h-100">
                                    <p class="h5">Productos Criticos con Poco stock</p>
                                    <div id="listCritical" class="row row-cols-4 g-1">
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <div id="whseStats" class="card shadow p-3 h-100">
                                    <p class="h5">Depositos Stock</p>
                                    <div class="w-100" style="height: 350px;"> <!-- Ajusta la altura según sea necesario -->
                                        <canvas id="myBarChart"></canvas>
                                    </div>
                                </div>
                            </div>                         
                        </div>
                    </div>
                </div>
            </div>


        </div>';
    } elseif (isset($_GET["Finance"])) {
        echo '
        <div class="d-flex flex-column w-100 h-100">
            <div class="pb-2 m-0 w-100">
                <div class="row row-cols-sm-2 row-cols-md-auto">        
                    <div class="col col-8 col-md-10 col-lg-7">
                        <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Estadisticas De Finanza</h1>      
                    </div>
                </div>
            </div>
        </div>';
    } elseif (isset($_GET["Infrastructure"])) {
        echo '
        <div class="d-flex flex-column w-100 h-100">
            <div class="pb-2 m-0 w-100">
                <div class="row row-cols-sm-2 row-cols-md-auto">        
                    <div class="col col-8 col-md-10 col-lg-7">
                        <h1 class="display-6 titleCategory ps-1" style="color:var(--secondary_text_color)">Estadisticas De Infrestructura</h1>      
                    </div>
                </div>
            </div>

        </div>';
    }
}
