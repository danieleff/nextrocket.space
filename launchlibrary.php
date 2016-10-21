<?php

define("UPCOMING_CACHE_SECONDS", 60 * 10);
define("PAST_CACHE_SECONDS", 60 * 60);

function launchlibrary_get_upcoming_launches() {
    return launchlibrary_get("launchlibrary_upcoming.json", UPCOMING_CACHE_SECONDS, "next=200&mode=verbose");
}

function launchlibrary_get_past_launches() {
    return launchlibrary_get("launchlibrary_past.json", PAST_CACHE_SECONDS, "startdate=1960-01-01&enddate=".date("Y-m-d")."&limit=2000&mode=verbose");
}


function launchlibrary_get($cache_filename, $cache_timeout_seconds, $query_string) {
    
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
