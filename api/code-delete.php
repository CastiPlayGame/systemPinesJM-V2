<?php
include('connection.php');

if(isset($_POST['Inventory'])){
    $connObject = new Connection();
    $conn = $connObject->Connect();

    $sql = "SELECT id FROM `items` WHERE id='".$_POST['id']."'";
    $result = mysqli_query($conn, $sql);

    if (mysqli_num_rows($result) > 0) {
        $sql = "DELETE FROM `items` WHERE id='".$_POST['id']."'";
        if (mysqli_query($conn, $sql)) {
            die(json_encode([true, 'Item Eliminado']));
        } else {
            die(json_encode([false, mysqli_error($conn)]));
        }
    }else{
        die(json_encode([false, 'Item No Existe']));
    }
}

if(isset($_POST['User'])){
    $connObject = new Connection();
    $conn = $connObject->Connect();
    $userID = isset($_POST['UserId']) ? $_POST['UserId'] : '';
    
        
    // VERIFICAR USUARIO
    $stmt = mysqli_prepare($conn,"SELECT id FROM `users` WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "s", $userID);   
    if(!mysqli_stmt_execute($stmt)){
        die(json_encode(array(false,'Error: '.mysqli_stmt_error($stmt))));
    }
            
    $result = mysqli_stmt_get_result($stmt);
    if (mysqli_num_rows($result) != 1) {
        die(json_encode(array(false,'!Ups. Usuario No Existe',true)));
    }

    $stmt = mysqli_prepare($conn,"DELETE FROM `users` WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "s", $userID);   
    if(!mysqli_stmt_execute($stmt)){
        die(json_encode(array(false,'Error: '.mysqli_stmt_error($stmt))));
    }
    die(json_encode(array(true,'Usuario Eliminado')));

}


if(isset($_POST['Departament'])){
    $connObject = new Connection();
    $conn = $connObject->Connect();
    $DepartamentId = isset($_POST['DepartamentId']) ? $_POST['DepartamentId'] : '';
    
        
    // VERIFICAR USUARIO
    $stmt = mysqli_prepare($conn,"SELECT name FROM `departments` WHERE uuid = ?");
    mysqli_stmt_bind_param($stmt, "s", $DepartamentId);   
    if(!mysqli_stmt_execute($stmt)){
        die(json_encode(array(false,'Error: '.mysqli_stmt_error($stmt))));
    }
            
    $result = mysqli_stmt_get_result($stmt);
    if (mysqli_num_rows($result) != 1) {
        die(json_encode(array(false,'!Ups. Usuario No Existe',true)));
    }

    $stmt = mysqli_prepare($conn,"DELETE FROM `departments` WHERE uuid = ?");
    mysqli_stmt_bind_param($stmt, "s", $DepartamentId);   
    if(!mysqli_stmt_execute($stmt)){
        die(json_encode(array(false,'Error: '.mysqli_stmt_error($stmt))));
    }
    die(json_encode(array(true,'Departamento Eliminado')));

}

?>