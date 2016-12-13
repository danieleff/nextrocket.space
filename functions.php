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

function get_launches() {
    global $available_selections;
    
    if ($_REQUEST["past_launches"]) {
        
        $past_launches = launchlibrary_get_past_launches();
        
        $upcoming_launches = launchlibrary_get_upcoming_launches();
        
        $launches = launchlibrary_merge_launches(array($past_launches, $upcoming_launches));
    } else {
        $launches = launchlibrary_get_upcoming_launches();
    }
    

/*
    $launches[] = ["name"=>"Elon Musk | Making Humans A Multiplanetary Spieces",
        "net"=>"2016-09-27 14:30",
        "destination"=>"iac2016.org",
        "destination_icon"=>".",
        "payload_icon"=>".",
        "vidURLs"=>array("https://www.youtube.com/watch?v=A1YxNYiyALg"),
        "tbdtime"=>"0", "tbddate"=>"0"];
*/
/*
    $launches[] = ["name"=>"NASA FISO Telecon | NASA Collaboration with SpaceX‘s Red Dragon Mission",
        "net"=>"2016-09-21 16:00",
        "destination"=>"Teleconference",
        "destination_icon"=>".",
        "payload_icon"=>".",
        "vidURLs"=>array("http://spirit.as.utexas.edu/%7Efiso/telecon.htm"),
        "tbdtime"=>"0", "tbddate"=>"0"];
/*
    $launches[] = ["name"=>"MCT | First man on Mars", "net"=>"2025-01-01",
                "payload_icon"=>"images/manned.png",
                "destination"=>"Mars", "destination_icon"=>"images/mars.png",
        "type"=>"Mars/Manned",
                "tbdtime"=>"1", "tbddate"=>"1"
        ];
*/
    uasort($launches, function($a, $b) {return strtotime($a["net"]) - strtotime($b["net"]);});
    
    $launches = array_values($launches);

    $payloads=[

        "echostar"   =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "AFSPC"      =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "Intelsat"   =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "Blagovest"  =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "AMOS"       =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "WGS"        =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "SES"        =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "SBIRS GEO"  =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "Sky Muster" =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "Koreasat"   =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "GovSat"     =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "AEHF"       =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "GSAT"       =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "JCSAT"      =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "Asiasat"    =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "Star One D1"=>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "ViaSat-"    =>["Communications satellite", "satellite.png", "GEO", "geo.png"],
        "Arabsat-6A" =>["Communications satellite", "satellite.png", "GEO", "geo.png"],

        "Gonets"     =>["Communications satellite", "satellite.png", "LEO", "leo.png"],
        "Iridium"    =>["Communications satellite", "satellite.png", "LEO", "leo.png"],
        "Formosat"   =>["Communications satellite", "satellite.png", "LEO", "leo.png"],
        "STP-2"      =>["Communications satellite", "satellite.png", "LEO", "leo.png"],
        "ICON"       =>["Communications satellite", "satellite.png", "LEO", "leo.png"],
        "SAOCOM"     =>["Communications satellite", "satellite.png", "LEO", "leo.png"],
        "Tansat"     =>["Communications satellite", "satellite.png", "LEO", "leo.png"],
        "ADM-Aeolus" =>["Communications satellite", "satellite.png", "LEO", "leo.png"],

        "Shijian-17" =>["Communications satellite", "satellite.png",  "", ""],
        "Galileo FOC"=>["Communications satellite", "satellite.png", "MEO", ""],
        "GLONASS"    =>["Communications satellite", "satellite.png", "MEO", ""],
        "Eu:CROPIS"  =>["Communications satellite", "probe.png", "LEO", "leo.png"],

        "SkySat"     =>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"],
        "WorldView"  =>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"], //LEO?
        "Resourcesat"=>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"],
        "Göktürk-1"  =>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"],
        "ICESat"     =>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"],
        "Kanopus-V-IK"=>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"],
        "CBERS-4A"   =>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"],
        "KhalifaSat" =>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"],
        "GISAT-1"    =>["Earth observing satellite", "earth_satellite.png", "GEO", "geo.png"],
        "CERES"      =>["Earth observing satellite", "earth_satellite.png", "", ""],

        "Meteor-M"   =>["Weather satellite", "weather_satellite.png",  "Polar", ""],
        "Sentinel"   =>["Weather satellite", "weather_satellite.png", "LEO", "leo.png"],
        "Fengyun"    =>["Weather satellite", "weather_satellite.png", "LEO", "leo.png"],
        "SCATSat"    =>["Weather satellite", "weather_satellite.png", "LEO", "leo.png"],
        "INSAT"      =>["Weather satellite", "weather_satellite.png", "GEO", "geo.png"],
        "GOES"       =>["Weather satellite", "weather_satellite.png", "GEO", "geo.png"],
        "Himawari"   =>["Weather satellite", "weather_satellite.png", "GEO", "geo.png"],
        "cygnss"     =>["Weather satellite", "weather_satellite.png", "LEO", "leo.png"],
        "COVWR (ORS-6)"=>["Weather satellite", "weather_satellite.png", "LEO", "leo.png"],
        "JPSS "      =>["Weather satellite", "weather_satellite.png",  "Polar", ""],

        "OSIRIS"     =>["Scientific probe", "probe.png", "Asteroid(2018)", "asteroid.png"],
        "Spektr-RG"  =>["Scientific probe", "probe.png", "LEO", "leo.png"],
        "NISAR"      =>["Scientific probe", "probe.png", "LEO", "leo.png"],
        "TESS"       =>["Scientific probe", "probe.png", "HEO", ""],
        "HXMT"       =>["Scientific probe", "probe.png", "", ""],

        "PROBA-3"    =>["Scientific probe", "probe.png", "Highly-elliptical Earth Orbit", ""],

        "CRS-"       =>["Automated cargo spacecraft", "cargo.png"    , "ISS", "iss.png"],
        "Progress"   =>["Automated cargo spacecraft", "cargo.png"    , "ISS", "iss.png"],
        "Kounotori"  =>["Automated cargo spacecraft", "cargo.png"    , "ISS", "iss.png"],
        "cygnus"     =>["Automated cargo spacecraft", "cargo.png"    , "ISS", "iss.png"],
        "Soyuz MS"   =>["Manned spacecraft", "manned.png"   , "ISS", "iss.png"],

        "Tiangong-2" =>["Automated cargo spacecraft", "cargo.png"    , "Tiangong-2", "tiangong-2.png"],
        "Tianzhou"   =>["Automated cargo spacecraft", "cargo.png"    , "Tiangong-2", "tiangong-2.png"],
        "Shenzhou"   =>["Manned spacecraft", "manned.png"   , "Tiangong-2", "tiangong-2.png"],

        "China's Mars OLR"=>["Scientific probe", "probe.png"    , "Mars", "mars.png"],
        "Mars 2020"  =>["Scientific probe", "probe.png"    , "Mars", "mars.png"],
        "Emirates Mars Mission" =>["Scientific probe", "probe.png"    , "Mars", "mars.png"],
        "RED Dragon" =>["Lander", "cargo.png"    , "Mars", "mars.png"],
        "BepiColombo"=>["Scientific probe", "probe.png"    , "Mercury", "mercury.png"],
        "James Webb Space Telescope" =>["Scientific probe", "probe.png"    , "Sun–Earth L2", "sun.png"],
        "Aditya-L1" =>["Scientific probe", "probe.png"    , "Sun–Earth L1", "sun.png"],

        "Mars" =>["", ""    , "Mars", "mars.png"],
        "Exploration Mission 1" =>["Scientific probe", "probe.png"    , "Moon", "moon.png"],
        "Chandrayaan-2" =>["Scientific probe", "probe.png"    , "Moon", "moon.png"],

        "SpX-Demo"   =>["Test flight", "test.png"    , "Test", ""],
        "Test Flight"=>["Test flight", "test.png"    , "Test", ""],
        "Demo Flight"=>["Test flight", "test.png"    , "Test", ""],
        "Flight-"   =>["Test flight", "test.png"    , "Test", ""],

        "Solar Orbiter"=>["Scientific probe", "probe.png"    , "Sun", "sun.png"],
        "Solar Probe Plus"=>["Scientific probe", "probe.png"    , "Sun", "sun.png"],
        "JUICE"       =>["Scientific probe", "probe.png", "Jupiter", "jupiter.png"],
        "Europa Clipper"=>["Scientific probe", "probe.png", "Jupiter/Europa", "jupiter.png"],


        "Exploration of energization" =>["Scientific probe", "probe.png", "LEO", "leo.png"],
        "Gaojing 1" =>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"],
        "ORS-5" =>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"],
        "KazSTSAT" =>["Earth observing satellite", "earth_satellite.png", "LEO", "leo.png"],
        "Chang'e 5" =>["Scientific probe", "probe.png", "Moon", "moon.png"],
        
    ];


    $agencies = [
        "falcon" => ["SpaceX", "logo_spacex_x.png"],
        "mct" => ["SpaceX", "logo_spacex_x.png"],

        "atlas" => ["United Launch Alliance", "ula.png"],
        "delta" => ["United Launch Alliance", "ula.png"],

        "proton" => ["Roscosmos", "roscosmos.png"],
        "soyuz" => ["Roscosmos", "roscosmos.png"],

        "ariane" => ["European Space Agency", "esa.png"],
        "vega" => ["European Space Agency", "esa.png"],

        "long march" => ["China National Space Administration", "china.png"],

        "antares" => ["Orbital Sciences Corporation", "orbital.png"],

        "gslv" => ["Indian Space Research Organisation", "isro.png"],
        "pslv" => ["Indian Space Research Organisation", "isro.png"],

        "h-ii" => ["Japan Aerospace Exploration Agency", "jaxa.png"],

        "sls" => ["NASA", "nasa.png"],
    ];

    foreach($launches as $key => $launch) {
        
        
        $launches[$key]["time"] = strtotime($launch["net"]);

        if ($launch["name"]) {
            $rocket_mission = split(" \| ", $launch["name"]);

            $launches[$key]["launch_vehicle"] = $rocket_mission[0];
            $launches[$key]["payload"] = $rocket_mission[1];

            if (!$launches[$key]["type"]) {
                $launches[$key]["type"] = "";
            }


            if (!$launches[$key]["destination"]) {
                $launches[$key]["destination"] = "";
            }

            $launches[$key]["agency"] = array();

            if (isset($launch["rocket"]["agencies"])) {
                    for($i = 0; $i < count($launch["rocket"]["agencies"]); $i++) {
                    $launches[$key]["agency"][] = $launch["rocket"]["agencies"][$i]["abbrev"];
                }
            }


            foreach($payloads as $search => $data) {
                if (stripos($launch["name"], $search) !== false) {
                    if ($data[0] && !$launches[$key]["payload_type"]) $launches[$key]["payload_type"] = $data[0];
                    if ($data[1] && !$launches[$key]["payload_icon"]) $launches[$key]["payload_icon"] = "images/".$data[1];
                    if ($data[2] && !$launches[$key]["destination"]) $launches[$key]["destination"] = $data[2];
                    if ($data[3] && !$launches[$key]["destination_icon"]) $launches[$key]["destination_icon"] = "images/".$data[3];
                }
            }

            if (isset($launch["missions"]) && isset($launch["missions"][0])) {
                $type = $launch["missions"][0]["typeName"];

                if ($type == "Communications" && !$launches[$key]["payload_type"]) {
                    $launches[$key]["payload_type"] = "Communications satellite";
                    $launches[$key]["payload_icon"] = "images/satellite.png";
                }

                if ($type == "Earth Science" && $launches[$key]["payload_type"]=="Communications satellite") {
                    $launches[$key]["payload_type"] = "Scientific probe";
                    $launches[$key]["payload_icon"] = "images/probe.png";
                }

                if ($type == "Planetary Science" && $launches[$key]["payload_type"]=="Communications satellite") {
                    $launches[$key]["payload_type"] = "Scientific probe";
                    $launches[$key]["payload_icon"] = "images/probe.png";
                }

                if ($type == "Robotic Exploration" && $launches[$key]["payload_type"]=="Communications satellite") {
                    $launches[$key]["payload_type"] = "Scientific probe";
                    $launches[$key]["payload_icon"] = "images/probe.png";
                }

                if ($type == "Resupply" && !$launches[$key]["payload_type"]) {
                    $launches[$key]["payload_type"] = "Automated cargo spacecraft";
                    $launches[$key]["payload_icon"] = "images/cargo.png";
                }
            }
        }
        
        $matches = array();
        
        foreach($available_selections as $rocketID => $selection_name) {
            if (is_match($launches[$key], $rocketID)) {
                $matches[] = $rocketID;
            }
        }
        $launches[$key]["matches"] = $matches;
        
    }
    return $launches;
}

$selected = [];

$agency = [
    "ISRO" => ["Indian Space Research Organization", "isro.png"],
    "LMT"  => ["Lockheed Martin", "lockheed.png"],
    "ULA"  => ["United Launch Alliance", "ula.png"],
    "GD"   => ["General Dynamics", "gd.png"],
    "OSC"  => ["Orbital Sciences Corporation", "orbital.png"],
    "Avio" => ["Avio S.p.A", "avio.png"],
    "KSRPSC" => ["Khrunichev State Research and Production Space Center", "ksrpsc.png"],
    "TsSKB-Progress" => ["Progress State Research and Production Rocket Space Center", "progress.png"],
    "EADS" => ["Astrium Satellites", "astrium.png"],
    "ASA"  => ["Arianespace", "arianespace.png"],
    "CASC" => ["China Academy of Space Technology", "china_academy.png"],
    "SpX"  => ["SpaceX", "logo_spacex.png"],
    "NASA"  => ["NASA", "nasa.png"],
    "MHI"  => ["Mitsubishi Heavy Industries", "mhi.png"],
];


$available_selections = [

    //Agencies
    "0j" => ["Arianespace", "arianespace.png", "ASA"],
    "0i" => ["Astrium Satellites", "astrium.png", "EADS"],
    "0f" => ["Avio S.p.A", "avio.png", "Avio"],
    "0k" => ["China Academy of Space Technology", "china_academy.png", "CASC"],
    "0d" => ["General Dynamics", "gd.png", "GD"],
    "0g" => ["Khrunichev State Research and Production Space Center", "ksrpsc.png", "KSRPSC"],
    "0b" => ["Lockheed Martin", "lockheed.png", "LMT"],
    "0m" => ["Mitsubishi Heavy Industries", "mhi.png", "MHI"],
    "0n" => ["National Aeronautics and Space Administration", "nasa.png", "NASA"],
    "0a" => ["Indian Space Research Organization", "isro.png", "ISRO"],
    "0e" => ["Orbital Sciences Corporation", "orbital.png", "OSC"],
    "0h" => ["Progress State Research and Production Rocket Space Center", "progress.png", "TsSKB-Progress"],
    "0l" => ["SpaceX", "logo_spacex.png", "SpX"],
    "0c" => ["United Launch Alliance", "ula.png", "ULA"],

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

    //Payloads
    "2a"=>["Test flight", "test.png"],
    "2b"=>["Communications satellite", "satellite.png"],
    "2c"=>["Earth observing satellite", "earth_satellite.png"],
    "2d"=>["Weather satellite", "weather_satellite.png"],
    "2e"=>["Scientific probe", "probe.png"],
    "2f"=>["Manned spacecraft", "manned.png"],
    "2g"=>["Automated cargo spacecraft", "cargo.png"],


    //Destinations
    "3a"=>["LEO", "leo.png"],
    "3b"=>["MEO"],
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



