<?php

require_once("launchlibrary.php");

function is_match($launch, $rocketID) {
    global $available_selections;
    $sel = strtolower($available_selections[$rocketID][0]);

    if ($rocketID[0] == '0') {
        if (substr($rocketID, 1) == $launch["lsp"]["abbrev"]) {
            return $rocketID;
        }
    }

    if ($rocketID[0] == '1'
        && $launch["launch_vehicle"]
        && strpos(strtolower($launch["launch_vehicle"]), $sel) !== false
        ) {
        return $rocketID;
    }

    if ($rocketID[0] == '2'
        && $launch["payload_type"]
        && strpos(strtolower($launch["payload_type"]), $sel) !== false
        ) {
        return $rocketID;
    }

    if ($rocketID[0] == '3'
        && $launch["destination"]
        && strpos(strtolower($launch["destination"]), $sel) !== false
        ) {
        return $rocketID;
    }

    return false;
}

function getAgencies() {
    $ret = array();

    $response = launchlibrary_get_cached("agency.json", 60 * 60, "https://launchlibrary.net/1.3/agency?limit=1000");

    $agencies = $response["agencies"];
    $activeAgencies = array();
    
    $launches = get_launches();
    
    foreach($launches as $launch) {
        $lsp = $launch["lsp"];
        foreach($agencies as $agency) {
            if ($agency["islsp"] && $agency["abbrev"] == $lsp["abbrev"]) {
                $activeAgencies[$agency["abbrev"]] = $agency;
                break;
            }
        }
    }

    $agencyIcons = array(
        "SpX" => "logo_spacex.png",
        "RFSA" => "roscosmos.png",
        "CASC" => "china_academy.png",
        "ASA" => "arianespace.png",
        "ULA" => "ula.png",
        "MHI" => "mhi.png",
        "JAXA" => "jaxa.png",
        "ISRO" => "isro.png",
        "RL" => "rocketlab.png",
        "KhSC" => "ksrpsc.png",
        "OA" => "orbital_atk.png",
        "NASA" => "nasa.png",

        /*
        "0j" => ["Arianespace", "arianespace.png", "ASA"],
        "0i" => ["Astrium Satellites", "astrium.png", "EADS"],
        "0f" => ["Avio S.p.A", "avio.png", "Avio"],
        "0s" => ["Boeing", "boeing.png", "BA"],
        "0k" => ["China Academy of Space Technology", "china_academy.png", "CASC"],
        "0p" => ["European Space Agency", "esa.png", "ESA"],
        "0d" => ["General Dynamics", "gd.png", "GD"],
        "0q" => ["Japan Aerospace Exploration Agency", "jaxa.png", "JAXA"],
        "0g" => ["Khrunichev State Research and Production Space Center", "ksrpsc.png", "KSRPSC"],
        "0b" => ["Lockheed Martin", "lockheed.png", "LMT"],
        "0m" => ["Mitsubishi Heavy Industries", "mhi.png", "MHI"],
        "0n" => ["National Aeronautics and Space Administration", "nasa.png", "NASA"],
        "0a" => ["Indian Space Research Organization", "isro.png", "ISRO"],
        //"0e" => ["Orbital Sciences Corporation", "orbital.png", "OSC"],
        "0o" => ["Orbital ATK", "orbital_atk.png", "OA"],
        "0h" => ["Progress State Research and Production Rocket Space Center", "progress.png", "TsSKB-Progress"],
        "0r" => ["Rocket Lab", "rocketlab.png", "Rocket Lab"],
        "0t" => ["Russian Federal Space Agency (ROSCOSMOS)", "roscosmos.png", "FKA"],
        "0l" => ["SpaceX", "logo_spacex.png", "SpX"],
        "0c" => ["United Launch Alliance", "ula.png", "ULA"],
        */

    );

    foreach($activeAgencies as $agency) {
        $ret["0" . $agency["abbrev"]] = array($agency["name"], $agencyIcons[$agency["abbrev"]], $agency["abbrev"]);
    }

    asort($ret);
    
    return $ret;
}

$selection_agencies = getAgencies();

$selection_rockets = [
    //Rockets
    "1g"=>["Antares"],
    "1e"=>["Ariane"],
    "1f"=>["Atlas"],
    "1d"=>["Delta"],
    "1a"=>["Falcon 9"],
    "1b"=>["Falcon Heavy"],
    "1i"=>["GSLV"],
    "1c"=>["ITS"],
    "1h"=>["Long March"],
    "1m"=>["Proton"],
    "1k"=>["PSLV"],
    "1n"=>["Rokot"],
    "1l"=>["Soyuz"],
    "1j"=>["Vega"],
    "1n"=>["SLS"],
];

$selection_payloads = [
    //Payloads
    "2a"=>["Test flight", "test.png"],
    "2b"=>["Communications satellite", "satellite.png"],
    "2c"=>["Earth observing satellite", "earth_satellite.png"],
    "2d"=>["Weather satellite", "weather_satellite.png"],
    "2e"=>["Scientific probe", "probe.png"],
    "2f"=>["Manned spacecraft", "manned.png"],
    "2g"=>["Automated cargo spacecraft", "cargo.png"],
];

$selection_destinations = [
    //Destinations
    "3a"=>["LEO", "leo.png"],
    "3b"=>["MEO", "meo.png"],
    "3c"=>["GEO", "geo.png"],
    "3d"=>["ISS", "iss.png"],
    "3e"=>["Tiangong-2", "tiangong-2.png"],
    "3f"=>["Moon", "moon.png"],
    "3g"=>["Mars", "mars.png"],
    "3i"=>["Mercury", "mercury.png"],
    "3j"=>["Jupiter", "jupiter.png"],
    "3k"=>["Sun", "sun.png"],
    "3h"=>["Asteroid", "asteroid.png"],

];

$available_selections = array_merge($selection_agencies, $selection_rockets, $selection_payloads, $selection_destinations);


