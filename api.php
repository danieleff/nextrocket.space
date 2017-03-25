<?php

require_once("functions.php");

$parts = split("\|", $_REQUEST["q"]);
$selected_rockets = false;

if ($parts[0] == '1') {
    if ($parts[1]) {
        $selected_rockets = split(",", $parts[1]);
    }
} else {
    echo "Unknown selections: " . $_REQUEST["q"];
    exit;
}

function api_v1() {
    global $selected_rockets;
    $launches = get_launches();
    $time = time();
    

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
    global $selected_rockets;
    header("Content-type: text/plain");
    
    $launches = get_launches();

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


function api_v3_print_launch($launch) {
    $ret = "";
    $ret .= str_pad($launch["id"], 6) . "\n";
    $ret .= $launch["status"];
    if ($launch["tbddate"] == "1") {
        $ret .= "M";
    } else if ($launch["tbdtime"] == "1") {
        $ret .= "D";
    } else {
        $ret .= "T";
    }
    $ret .= str_pad(strtotime($launch["net"]), 10) . "\n";
    
    
    $agency_string = implode($launch["agency"], ", ");
    $ret .= strtoupper(str_pad(substr($agency_string, 0, 10), 10, " ")). "\n";
    
    $ret .= strtoupper(str_pad(substr(str_replace("IV", "4", $launch["launch_vehicle"]), 0, 20), 20, " ")). "\n";
    //$ret .= strtoupper(str_pad(substr($launch["payload"], 0, 20), 20, " ")). "\n";
    //$ret .= strtoupper(str_pad(substr($launch["destination"], 0, 10), 10, " ")). "\n";
    return $ret;
}

function api_v3() {
    global $selected_rockets;
    header("Content-type: text/plain");
    
    $launches = get_launches();

    echo str_pad(time(), 10, ' ')."\n";
    
    $count = 0;
    $data = "";
    
    foreach($launches as $launch) {
        $match = false;
        if ($selected_rockets) {
            foreach($selected_rockets as $select_id) {
                if (is_match($launch, $select_id)) {
                    $match = true;
                    break;
                }
            }
        } else {
            $match = true;
        }
        
        if ($match) {
            $data .= api_v3_print_launch($launch);
            
            $count++;
            if ($count >= 5) break;
        }
            
    }
    
    echo str_pad($count, 3, ' ')."\n";
    
    echo $data;
    
}

if ($_REQUEST["v"] == 1) {
    api_v1();
} else if ($_REQUEST["v"] == 2) {
    api_v2();
} else if ($_REQUEST["v"] == 3) {
    api_v3();
} else {
    echo "Unknown API " . $_REQUEST["v"];
}
