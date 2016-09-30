<?php

require_once("functions.php");

$launches = get_launches();

if (isset($_REQUEST["get_json"])) {
     header('Access-Control-Allow-Origin: *');
     $ret = array("launches" => array_values($launches),
        "available_selections" => $available_selections,
        "agency" => $agency,
        "selected" => array_values($selected));
     echo json_encode($ret);
     exit;
}

include_once("header.php");

?>

<table id="launch_table" class="launch_table">
</table>

<!--
<hr>
<table class="launch_table">
    <tr><th colspan="2">Space agencies</td></tr>
    <tr><td><img class="icon" src="images/esa.png"></td><td>European Space Agency - intergovernmental organisation with 22 member states</td></tr>
    <tr><td><img class="icon" src="images/roscosmos.png"></td><td>Roscosmos State Corporation for Space Activities - space science program of Russia</td></tr>
    <tr><td><img class="icon" src="images/logo_spacex_x.png"></td><td>SpaceX - Space Exploration Technologies Corporation</td></tr>
    <tr><td><img class="icon" src="images/ula.png"></td><td>United Launch Alliance - joint venture of Lockheed Martin Space Systems and Boeing Defense, Space & Security</td></tr>

    <tr><th colspan="2">Payload types</td></tr>
    <tr><td><img class="icon" src="images/satellite.png"></td><td>Communications satellite - television, telephone, radio, internet, and military applications</td></tr>
    <tr><td><img class="icon" src="images/probe.png"></td><td>Scientific satellite / space probe - experiments, space exploration</td></tr>
    <tr><td><img class="icon" src="images/manned.png"></td><td>Manned spacecraft</td></tr>
    <tr><td><img class="icon" src="images/cargo.png"></td><td>Automated cargo spacecraft - transporting food, propellant and other supplies</td></tr>

    <tr><th colspan="2">Destinations</td></tr>
    <tr><td><img class="icon" src="images/leo.png"></td><td>LEO - Low Earth Orbit (180-2000km)</td></tr>
    <tr><td><img class="icon" src="images/geo.png"></td><td>GEO - Geosynchronous Orbit (35786km)</td></tr>
    <tr><td><img class="icon" src="images/iss.png"></td><td>ISS - International Space Station</td></tr>
    <tr><td><img class="icon" src="images/mars.png"></td><td>Mars - the final destination</td></tr>
    <tr><td><img class="icon" src="images/mining.png"></td><td>Asteroid mining</td></tr>

</table>
-->

<script type='text/javascript'>
    var launches = <?=json_encode(array_values($launches));?>;
    var available_selections = <?=json_encode($available_selections);?>;
    var agency = <?=json_encode($agency);?>;
    var selected = <?=json_encode(array_values($selected));?>;

    init();
</script>
</body>
</html>
