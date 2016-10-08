<?php

require_once("functions.php");

$launches = get_launches();

$counter = 0;

$time = time();

$selected_rockets = split(",", $_REQUEST["q"]);

$len = 8;

if ($_REQUEST["f"]=="t") {
    echo count($selected_rockets)."\n";
} else {
    echo pack("C", count($selected_rockets));
}

$all = $available_selections;

foreach($selected_rockets as $select_id) {
    
    foreach($launches as $launch) {
        if (is_match($launch, $select_id)) {
            $t = strtotime($launch["net"]) - $time;
            $name = strtoupper(str_pad(substr(str_replace("IV", "4", $launch["name"]), 0, $len), $len, " "));

            if ($_REQUEST["f"]=="t") {
                echo $t."\n";
                echo $name."\n";
            } else {
                echo pack("V", $t);
                echo $name;
                echo "\0";
            }
            $found = true;

            break;
        }

    }

    if (!$found) {
        if ($_REQUEST["f"]=="t") {
            echo "0\nNOT FOUND\n";
        } else {
            echo pack("V", 0);
            echo strtoupper(str_pad(substr("NOT FOUND", 0, $len), $len, " "));
            echo "\0";
        }
    }

}
