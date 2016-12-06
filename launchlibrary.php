<?php

define("UPCOMING_SHORTTERM_CACHE_SECONDS", 60 * 10);

define("UPCOMING_LONGTERM_CACHE_SECONDS", 60 * 60);

define("PAST_SHORTTERM_CACHE_SECONDS", 60 * 60);

define("PAST_LONGTERM_CACHE_SECONDS", 60 * 60 * 24);

function launchlibrary_get_upcoming_launches() {
    $today_date = date("Y-m-d");
    $shortterm_end_date = date("Y-m-d", strtotime("+7 days"));
    $longterm_end_date = date("Y-m-d", strtotime("+20 years"));
    
    $shortterm_launches = launchlibrary_get("launchlibrary_upcoming_shortterm.json", 
        UPCOMING_SHORTTERM_CACHE_SECONDS, 
        "startdate=" . $today_date . "&enddate=" . $shortterm_end_date . "&limit=200&mode=verbose");
        
    $longterm_launches = launchlibrary_get("launchlibrary_upcoming_shortterm_longterm.json", 
        UPCOMING_SHORTTERM_CACHE_SECONDS, 
        "startdate=" . $shortterm_end_date . "&enddate=" . $longterm_end_date . "&limit=200&mode=verbose");
    
    return launchlibrary_merge_launches(array($shortterm_launches["launches"], $longterm_launches["launches"]));
}

function launchlibrary_get_past_launches() {
    $today_date = date("Y-m-d");
    $shortterm_start_date = date("Y-m-d", strtotime("-7 days"));
    $longterm_start_date = date("Y-m-d", strtotime("-100 years"));
    
    $shortterm_launches = launchlibrary_get("launchlibrary_past_shortterm.json", 
        PAST_SHORTTERM_CACHE_SECONDS, 
        "startdate=" . $shortterm_start_date . "&enddate=" . $today_date . "&limit=10000&mode=verbose");
        
    $longterm_launches = launchlibrary_get("launchlibrary_past_longterm.json", 
        PAST_LONGTERM_CACHE_SECONDS, 
        "startdate=" . $longterm_start_date . "&enddate=" . $shortterm_start_date . "&limit=10000&mode=verbose");
    
    return launchlibrary_merge_launches(array($shortterm_launches["launches"], $longterm_launches["launches"]));
}

function launchlibrary_merge_launches($launchlists) {
    $ret = array();
    foreach($launchlists as $launches) {
        foreach($launches as $launch) {
            $ret[$launch["id"]] = $launch;
        }
    }
    return $ret;
}

function launchlibrary_get($cache_filename, $cache_timeout_seconds, $query_string) {
    
    $cache_filename = "cache/".$cache_filename;
    
    if (file_exists($cache_filename) && filemtime($cache_filename) > time() - $cache_timeout_seconds) {
        return json_decode(file_get_contents($cache_filename), true);
    }

    $opts = array(
        'http'=>array(
            'method'=>"GET",
            'header'=>"User-Agent: nextrocket.space danieleff@gmail.com\r\n"
        )
    );

    $context = stream_context_create($opts);
    $json = file_get_contents("https://launchlibrary.net/1.2/launch?".$query_string, false, $context);

    file_put_contents($cache_filename, $json);

    return json_decode($json, true);
}
