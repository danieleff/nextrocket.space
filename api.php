<?php

require_once("functions.php");

function api_v1() {
    $launches = get_launches();
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
}

function api_v2_print_launch($launch) {
    echo $launch["status"];
    if ($launch["tbddate"] == "1") {
        echo "M";
    } else if ($launch["tbdtime"] == "1") {
        echo "D";
    } else {
        echo "T";
    }
    echo str_pad(strtotime($launch["net"]), 10) . "\n";
    
    
    $agency_string = implode($launch["agency"], ", ");
    echo strtoupper(str_pad(substr($agency_string, 0, 20), 20, " ")). "\n";
    
    echo strtoupper(str_pad(substr(str_replace("IV", "4", $launch["launch_vehicle"]), 0, 20), 20, " ")). "\n";
    echo strtoupper(str_pad(substr($launch["payload"], 0, 20), 20, " ")). "\n";
    echo strtoupper(str_pad(substr($launch["destination"], 0, 10), 10, " ")). "\n";

}

function api_v2() {
    header("Content-type: text/plain");
    
    $launches = get_launches();
    $selected_rockets = split(",", $_REQUEST["q"]);

    echo str_pad(time(), 10, ' ')."\n";
    echo str_pad(count($selected_rockets), 3, ' ')."\n";
    
    $all = $available_selections;

    foreach($selected_rockets as $select_id) {
        
        $found = false;
        
        foreach($launches as $launch) {
            if (is_match($launch, $select_id)) {
                api_v2_print_launch($launch);
                $found = true;

                break;
            }
        }

        if (!$found) {
            echo "0X";
            echo str_repeat(" ", 10)."\n";
            echo str_repeat(" ", 20)."\n";
            echo str_repeat(" ", 20)."\n";
            echo str_repeat(" ", 20)."\n";
            echo str_repeat(" ", 10)."\n";
        }
    }
}

if ($_REQUEST["v"] == 1) {
    api_v1();
} else if ($_REQUEST["v"] == 2) {
    api_v2();
} else {
    echo "Unknown API " . $_REQUEST["v"];
}
