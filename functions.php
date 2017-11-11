<?php

require_once("launchlibrary.php");

function is_match($launch, $rocketID) {
    global $available_selections;
    $sel = strtolower($available_selections[$rocketID][0]);

    if ($rocketID[0] == '0') {
        for($i = 0; $i < count($launch["agency"]); $i++) {
            if ($available_selections[$rocketID][2] == $launch["agency"][$i]) {
                return $rocketID;
            }
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

$selected = [];

$agency = [
    "ISRO" => ["Indian Space Research Organization", "isro.png"],
    "LMT"  => ["Lockheed Martin", "lockheed.png"],
    "ULA"  => ["United Launch Alliance", "ula.png"],
    "GD"   => ["General Dynamics", "gd.png"],
    "OSC"  => ["Orbital Sciences Corporation", "orbital.png"],
    "OA"   => ["Orbital ATK", "orbital_atk.png"],
    "Avio" => ["Avio S.p.A", "avio.png"],
    "KSRPSC" => ["Khrunichev State Research and Production Space Center", "ksrpsc.png"],
    "TsSKB-Progress" => ["Progress State Research and Production Rocket Space Center", "progress.png"],
    "EADS" => ["Astrium Satellites", "astrium.png"],
    "ASA"  => ["Arianespace", "arianespace.png"],
    "ESA"  => ["European Space Agency", "esa.png"],
    "JAXA"  => ["Japan Aerospace Exploration Agency", "jaxa.png"],
    "Rocket Lab"  => ["Rocket lab", "rocketlab.png"],
    "CASC" => ["China Academy of Space Technology", "china_academy.png"],
    "SpX"  => ["SpaceX", "logo_spacex.png"],
    "NASA"  => ["NASA", "nasa.png"],
    "FKA"  => ["Russian Federal Space Agency (ROSCOSMOS)", "roscosmos.png"],
    "MHI"  => ["Mitsubishi Heavy Industries", "mhi.png"],
    "BA"  => ["Boeing", "boeing.png"],
];


$selection_agencies = [

    //Agencies
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
];

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


