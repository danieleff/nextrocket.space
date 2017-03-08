<?php

require_once("local.php");

function get_launches_new() {
    global $available_selections, $conn_string;
    
    $dbconn = pg_connect($conn_string);
    if (!$dbconn) {
        die("Could not connect to database");
    }
    
    $launches = array();
    
    $rows = pg_fetch_all(pg_query('SELECT * FROM launch'));
    foreach($rows as $row) {
        $launch = json_decode($row["launchlibrary_json"], true);
        
        if (strpos($launch["net"], "00:00:00") == false) {
            $launch["tbddate"] = "0";
            $launch["tbdtime"] = "0";
        }
        
        $launch["month"] = date("Y-m", strtotime($launch["net"]) + 60 * 60 * 12);
        
        $rocket_mission = split(" \| ", $launch["name"]);

        $launch["launch_vehicle"] = $rocket_mission[0];
        $launch["payload"] = $rocket_mission[1];

        $launch["agency"] = array();

        if (isset($launch["rocket"]["agencies"])) {
                for($i = 0; $i < count($launch["rocket"]["agencies"]); $i++) {
                $launch["agency"][] = $launch["rocket"]["agencies"][$i]["abbrev"];
            }
        }
        
        $launch["time"] = strtotime($launch["net"]);
        
        $matches = array();
            
        foreach($available_selections as $rocketID => $selection_name) {
            if (is_match($launches[$key], $rocketID)) {
                $matches[] = $rocketID;
            }
        }
        $launch["matches"] = $matches;
        
        $launches[] = $launch;
    }
    
    uasort($launches, 
        function($a, $b) {
            if ($a["tbddate"] != $b["tbddate"] && $a["month"] == $b["month"]) {
                return $a["tbddate"] - $b["tbddate"];
            }
            return strtotime($a["net"]) - strtotime($b["net"]);
        }
    );
    
    
    $launches = array_values($launches);
    
    return $launches;
}


function update_launches($launchlibrary_data) {
    global $conn_string;
    
    $dbconn = pg_connect($conn_string);
    if (!$dbconn) {
        die("Could not connect to database");
    }
    
    $db_launches = array();
    
    $rows = pg_fetch_all(pg_query('SELECT * FROM launch'));
    foreach($rows as $row) {
        $db_launches[$row["launchlibrary_id"]] = $row;
    }
    
    foreach($launchlibrary_data["launches"] as $launchlibrary) {
        $launchlibrary_id = $launchlibrary["id"];
        
        $launchlibrary_json = json_encode($launchlibrary);
            
        if (isset($db_launches[$launchlibrary_id])) {
            
            if ($db_launches[$launchlibrary_id]["launchlibrary_json"] != $launchlibrary_json) {
                pg_query_params($dbconn, "UPDATE launch SET 
                  launchlibrary_modified_time = now(),  
                  launchlibrary_name = $1,  
                  launchlibrary_json = $2
                  WHERE id= $3", array($launchlibrary["name"], $launchlibrary_json, $launchlibrary_id));
            }
            
        } else {
            pg_query_params($dbconn, "INSERT INTO launch (launchlibrary_id, launchlibrary_name, launchlibrary_modified_time, launchlibrary_json) 
              VALUES ($1, $2, now(), $3)", array($launchlibrary_id, $launchlibrary["name"], $launchlibrary_json));
        }
    }
    
}

