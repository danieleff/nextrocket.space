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

$url = "http://nextrocket.space/";

?>

<table id="launch_table" class="launch_table">
    <?php
        
        $filters = array("", "", "", "");

        foreach($available_selections as $rocketId => $selection) {
            $count = 0;
            
            for($i = 0; $i < count($launches); $i++) {
                $launch = $launches[$i];
                if (is_match($launch, $rocketId)) $count++;
            }
            
            $check = "";
            $check .= "<label class=\"filter\">";
            $check .= " <input style=\"display: none;\" id=\"" . $rocketId . "\" onchange=\"on_change()\" style=\"vertical-align: -1px;\" type=\"checkbox\" >";
            if (count($selection) > 1 && $selection[1]) {
                $check .= "<img class=\"icon\" src=\"" . $url . "images/" . $selection[1] . "\"> ";
            }

            $name = "(" . $count . ") " . $selection[0];
            $check .= "<span title=\"" . $name . "\">" . $name . "</span>";
            $check .= "</input>";
            $check .= "</label>";

            $filters[$rocketId[0]] .= $check;
        }
        echo "<colgroup>";
        echo "<col style=\"width:10em\">";
        echo "<col style=\"width:11em\">";
        echo "<col style=\"width:17%\">";
        echo "<col style=\"width:14%\">";
        echo "<col style=\"width:24%\">";
        echo "<col style=\"width:10%\">";
        echo "<col style=\"width:22px\">";
        echo "</colgroup>";

        echo "<tr style=\"cursor:pointer;\" onclick=\"createCookie('filter_hidden', $('.filter_row').is(':visible'));$('.filter_row').slideToggle(200);$('.filter_icon').toggle();\">";
        echo "<th>";
        echo "<span style=\"float:left; padding:0 0 2px 2px; display:none; \" class=\"filter_icon\">&#x25B2;</span>";
        echo "<span style=\"float:left; padding:0 0 2px 2px; text-align: left; \"class=\"filter_icon\">&#x25BC;</span>";
        echo " Countdown";
        echo "</th>";
        echo "<th id=\"date_header\">Date GMT</th>";
        echo "<th>Agency</th>";
        echo "<th>Launch vehicle</th>";
        echo "<th>Payload</th>";
        echo "<th>Destination</th>";
        echo "<th></th>";
        echo "</tr>";

        
        echo "<tr id=\"filter\">";
        
        echo "<th style=\"text-align: left; padding: 0px;vertical-align: top;\" colspan=\"2\">";
        echo "<div style=\"margin: 0.5em;\" class=\"filter_row\">";
        echo "Unselected launches:<br>";
        echo " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"show\">show</label><br>";
        echo " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"gray_out\" checked>gray out</label><br>";
        echo " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"hidden\">hide </label><br>";
        echo "</div>";
        echo "</th>";
        
        echo "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[0]."</div></td>";
        echo "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[1]."</div></td>";
        echo "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[2]."</div></td>";
        echo "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[3]."</div></td>";
        echo "<th style=\"padding: 0px; \"></th>";
        echo "</tr>";

        /*
        echo "<th colspan=\"7\">";
        echo "Unselected launches:";
        echo " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"show\">show</label>";
        echo " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"gray_out\" checked>gray out</label>";
        echo " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"hidden\">hide </label>";
        echo "</th>";
        echo "</tr>";
        */
        

        foreach($launches as $key => $launch) {
            $style_color = "";
            echo "<tr id=\"launch_" . $key . "\">";

            if ($launch["status"]==4) {
                echo "<td>Failed</td>";
            } else {
                echo "<td class=\"countdown\" data-tbdtime=\"" . $launch["tbdtime"] . "\" data-tbddate=\"" . $launch["tbddate"] . "\" data-time=\"" . $launch["time"] . "\"></td>";
            }

            echo "<td class=\"date\" data-tbdtime=\"" . $launch["tbdtime"] . "\" data-tbddate=\"" . $launch["tbddate"] . "\" data-time=\"" . $launch["time"] . "\"></td>";


            echo "<td class=\"agency\" style=\"text-align: center;\">";

            $agency_string = "";
            for($j = 0; $j < count($launch["agency"]); $j++) {
                $a = $launch["agency"][$j];

                foreach($agency as $agencyId => $agen) {
                    if ($a == $agencyId && count($agen) > 1) {
                        $a = "<img title=\"" . $agen[0] . "\" style=\"vertical-align:baseline; height:16px;\" src=\"" . $url . "images/" . $agen[1] . "\">";
                        break;
                    }
                }
                $agency_string .= $a . " ";

            }
            echo $agency_string;


            echo "</td>";


            echo "<td title=\"" . $launch["launch_vehicle"] . "\" class=\"rocket\">";
            echo $launch["launch_vehicle"];
            if ($launch["probability"] && $launch["probability"]!="-1") echo " (" . $launch["probability"] . "%)";
            echo "</td>";


            echo "<td title=\"" . $launch["payload_type"] . "\" class=\"payload\">";

            if ($launch["payload_icon"] && $launch["payload_icon"] != '.') {
                echo "<img style=\"vertical-align:top; height:1em;\" src=\"" . $url . $launch["payload_icon"] . "\"> ";
            }
            echo "<span title=\"" . $launch["payload"] . "\">" . $launch["payload"] . "</span>";
            echo "</td>";

            echo "<td title=\"" . $launch["destination"] . "\" class=\"destination\">";
            if ($launch["destination_icon"] && $launch["destination_icon"] != '.') {
                echo "<img style=\"vertical-align:top; height:1em;\" src=\"" . $url . $launch["destination_icon"] . "\"> ";
            }
            echo $launch["destination"];
            echo "</td>";



            echo "<td>";
            if ($launch["vidURLs"] && count($launch["vidURLs"]) > 0) {
                echo "<a href=\"" . $launch["vidURLs"][0] . "\"><img style=\"vertical-align: middle; height: 1em;\" src=\"images/video.png\"></a>";
            }
            echo "</td>";
            echo "</tr>";

        }
    ?>
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
