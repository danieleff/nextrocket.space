<?php

require_once("local.php");

function get_launch($launch_id) {
    global $conn_string;
    $dbconn = pg_connect($conn_string) or die("Could not connect to database");
    
    return pg_fetch_assoc(pg_query_params('SELECT * FROM launch WHERE id=$1', array($launch_id)));
}

function update_launch() {
    global $conn_string;
    $dbconn = pg_connect($conn_string) or die("Could not connect to database");
    
    pg_query_params("UPDATE launch SET
        payload_type_icon = $1,
        destination_icon = $2,
        destination = $3
        WHERE id=$4"
        , array($_REQUEST["payload_type"], $_REQUEST["destination_type"], $_REQUEST["destination"], $_REQUEST["id"])
        );
}

function get_launches($available_selections = false) {
    global $conn_string;
    
    $dbconn = pg_connect($conn_string) or die("Could not connect to database");
    
    $launches = array();
    
    if ($_REQUEST["past_launches"]) {
        $rows = pg_fetch_all(pg_query('SELECT * FROM launch WHERE is_active AND ORDER BY id'));
    } else {
        $rows = pg_fetch_all(pg_query('SELECT * FROM launch WHERE is_active AND date(launchlibrary_time) >= date(now()) ORDER BY id'));
    }
    
    foreach($rows as $row) {
        $launch = json_decode($row["launchlibrary_json"], true);

        if (!$launch["lsp"]) continue;
        
        $launch["launchlibrary_id"] = $launch["id"];
        $launch["id"] = $row["id"];
        
        if (strpos($launch["net"], "00:00:00") == false) {
            $launch["tbddate"] = "0";
            $launch["tbdtime"] = "0";
        }
        
        if ($row["data_modified_time"]
            && strtotime($row["data_modified_time"]) > strtotime($row["launchlibrary_modified_time"])
            ) {
            
            if ($row["launch_time"]) {
                $launch["net"] = $row["launch_time"];
                $launch["tbddate"] = ($row["launch_date_exact"] == 't') ? "0" : "1";
                $launch["tbdtime"] = ($row["launch_time_exact"] == 't') ? "0" : "1";
            }
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
        $launch["agency"] = array_values(array_unique($launch["agency"]));
        
        $launch["time"] = strtotime($launch["net"]);
        
        $launch["destination"] = $row["destination"];
        $launch["destination_icon"] = $row["destination_icon"];
        $launch["payload_type"] = $row["payload_type"];
        $launch["payload_icon"] = $row["payload_type_icon"];
        
        if ($available_selections) {
            $matches = array();
            foreach($available_selections as $rocketID => $selection_name) {
                if (is_match($launch, $rocketID)) {
                    $matches[] = $rocketID;
                }
            }
            $launch["matches"] = $matches;
        }

        
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
    
    $dbconn = pg_connect($conn_string) or die("Could not connect to database");
    
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
                  launchlibrary_time = $2,
                  launchlibrary_json = $3
                  WHERE launchlibrary_id = $4", array($launchlibrary["name"], $launchlibrary["net"], $launchlibrary_json, $launchlibrary_id));
            }
            
        } else {
            pg_query_params($dbconn, "INSERT INTO launch (launchlibrary_id, launchlibrary_time, launchlibrary_name, launchlibrary_modified_time, launchlibrary_json) 
              VALUES ($1, $2, $3, now(), $4)", array($launchlibrary_id, $launchlibrary["net"], $launchlibrary["name"], $launchlibrary_json));
        }
    }
    
}

function set_launches_inactive($active_launchlibrary_ids) {
    global $conn_string;

    $where = join(", ", $active_launchlibrary_ids);
    
    $dbconn = pg_connect($conn_string) or die("Could not connect to database");

    pg_query($dbconn, "UPDATE launch SET is_active = false WHERE launchlibrary_id IS NOT NULL AND launchlibrary_id NOT IN ($where)");
    pg_query($dbconn, "UPDATE launch SET is_active = true WHERE launchlibrary_id IS NOT NULL AND launchlibrary_id IN ($where)");
}
