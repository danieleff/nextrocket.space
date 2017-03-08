<?php

require_once("database.php");

$action = $_REQUEST["action"];

if ($action == 'get') {
    echo json_encode(get_launch($_REQUEST["launch_id"]));
} else if ($action == 'update') {
    update_launch($_REQUEST);
    
    echo json_encode(array('result' => 'ok'));
}

