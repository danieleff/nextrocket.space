<?php

require_once("functions.php");

$launches = get_launches();

$url = "http://".$_SERVER["HTTP_HOST"].substr($_SERVER["REQUEST_URI"], 0, strrpos($_SERVER["REQUEST_URI"], "/") + 1);

function get_table_header() {
    global $available_selections, $url;
    
    $filters = array("", "", "", "");

    foreach($available_selections as $rocketId => $selection) {
        $check = "";
        $check .= "<label class=\"filter\">";
        $check .= "<span class='selection_count' id='count_" . $rocketId . "'></span> ";
        $check .= " <input style=\"display: none;\" id=\"" . $rocketId . "\" onchange=\"on_change()\" style=\"vertical-align: -1px;\" type=\"checkbox\" >";
        if (count($selection) > 1 && $selection[1]) {
            $check .= "<img class=\"icon\" src=\"" . $url . "images/" . $selection[1] . "\"> ";
        }

        $name = $selection[0];
        $check .= "<span title=\"" . $name . "\">" . $name . "</span>";
        $check .= "</input>";
        $check .= "</label>";

        $filters[$rocketId[0]] .= $check;
    }
    $ret .= "<colgroup>";
    $ret .= "<col style=\"width:10em\">";
    $ret .= "<col style=\"width:11em\">";
    $ret .= "<col style=\"width:20%\">";
    $ret .= "<col style=\"width:25%\">";
    $ret .= "<col style=\"width:30%\">";
    $ret .= "<col style=\"width:15%\">";
    $ret .= "<col style=\"width:22px\">";
    $ret .= "<col style=\"width:22px\">";
    $ret .= "</colgroup>";

    $ret .= "<tr style=\"cursor:pointer;\" onclick=\"createCookie('filter_hidden', $('.filter_row').is(':visible'));$('.filter_row').slideToggle(200);$('.filter_icon').toggle();\">";
    $ret .= "<th>";
    $ret .= "<span style=\"float:left; padding:0 0 2px 2px; display:none; \" class=\"filter_icon\">&#x25B2;</span>";
    $ret .= "<span style=\"float:left; padding:0 0 2px 2px; text-align: left; \"class=\"filter_icon\">&#x25BC;</span>";
    $ret .= " Countdown";
    $ret .= "</th>";
    $ret .= "<th id=\"date_header\">Date GMT</th>";
    $ret .= "<th>Agency</th>";
    $ret .= "<th>Launch vehicle</th>";
    $ret .= "<th>Payload</th>";
    $ret .= "<th>Destination</th>";
    $ret .= "<th></th>";
    $ret .= "<th></th>";
    $ret .= "</tr>";

    
    $ret .= "<tr id=\"filter\">";
    
    $ret .= "<th style=\"text-align: left; padding: 0px;vertical-align: top;\" colspan=\"2\">";
    $ret .= "<div style=\"margin: 0.5em;\" class=\"filter_row\">";
    
    $ret .= " Filter by date:<br>";
    $ret .= " <label><input onchange=\"on_change()\" type=\"radio\" name=\"launch_date_filter\" value=\"upcoming\" checked>Upcoming</label><br>";
    $ret .= " <label><input onchange=\"on_change()\" type=\"radio\" name=\"launch_date_filter\" value=\"date_range\">";
    $ret .= " <input onchange=\"on_change()\" type=\"text\" class=\"datepicker\" name=\"launch_from\"> - <input onchange=\"on_change()\" type=\"text\" class=\"datepicker\" name=\"launch_to\">";
    $ret .= " </label><br>";
    
    $ret .= " <br>";
    $ret .= "Unselected launches:<br>";
    $ret .= " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"show\">show</label><br>";
    $ret .= " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"gray_out\" checked>gray out</label><br>";
    $ret .= " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"hidden\">hide </label><br>";
    
    $ret .= "<br>";
    $ret .= "Filter combination:<br>";
    $ret .= " <label><input onchange=\"on_change()\" type=\"radio\" name=\"filters_join\" value=\"any\" checked>Any</label><br>";
    $ret .= " <label><input onchange=\"on_change()\" type=\"radio\" name=\"filters_join\" value=\"all\">All</label><br>";
    
    $ret .= "</div>";
    $ret .= "</th>";
    
    $ret .= "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[0]."</div></td>";
    $ret .= "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[1]."</div></td>";
    $ret .= "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[2]."</div></td>";
    $ret .= "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[3]."</div></td>";
    $ret .= "<td style=\"padding: 0px; \"></td>";
    $ret .= "<td style=\"padding: 0px; \"></td>";
    $ret .= "</tr>";
    
    return $ret;
}

function get_table_content() {
    global $launches, $agency, $url;
    
    foreach($launches as $key => $launch) {
        $style_color = "";
        $ret .= "<tr id=\"launch_" . $key . "\">";

        $launch_status = "Unknown";
        switch ($launch["status"]) {
            case 1: 
                $launch_status = ""; // GO
                break;
            case 2: 
                $launch_status = ""; //  NO-GO
                break;
            case 3: 
                $launch_status = "Success";
                break;
            case 4: 
                $launch_status = "<span style='color:red;'>Failed</span>";
                break;
        }
        $launch_status .= " " . $launch["holdreason"];
        $launch_status .= " " . $launch["failreason"];
        $launch_status = trim($launch_status);
        
        $ret .= "<td class=\"countdown\" data-status=\"" . $launch_status . "\" data-tbdtime=\"" . $launch["tbdtime"] . "\" data-tbddate=\"" . $launch["tbddate"] . "\" data-time=\"" . $launch["time"] . "\">".$launch_status."</td>";
        
        $ret .= "<td class=\"date\" data-tbdtime=\"" . $launch["tbdtime"] . "\" data-tbddate=\"" . $launch["tbddate"] . "\" data-time=\"" . $launch["time"] . "\"></td>";


        $ret .= "<td class=\"agency\" style=\"text-align: center;\">";

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
        $ret .= $agency_string;


        $ret .= "</td>";


        $ret .= "<td title=\"" . $launch["launch_vehicle"] . "\" class=\"rocket\">";
        
        $country_codes = array();
        foreach($launch["rocket"]["agencies"] as $rocketAgency) {
            foreach(explode(",", $rocketAgency["countryCode"]) as $countryCode) {
                if (file_exists("images/flag_" . $countryCode . ".png")) {
                    $country_codes[] = "<img class=\"flag\" src='images/flag_" . $countryCode . ".png'>";
                } else {
                    $country_codes[] = $countryCode;
                }
            }
        }
        $country_codes = array_unique($country_codes);
        
        if (count($country_codes) > 1) {
            //TODO multiple country codes
            $ret .= "<div class=\"multiple_flags_hover\" style=\"text-align: center; display: inline-block; width: 24px;\">";
            $ret .= "[" . count($country_codes) . "]";
            $ret .= "</div>";
            
            $ret .= "<div class=\"multiple_flags\">";
            $ret .= join(array_unique($country_codes), ", ");
            $ret .= "</div>";
        } else {
            $ret .= "<div style=\"display: inline-block; width: 24px;\">";
            $ret .= join(array_unique($country_codes), " ");
            $ret .= "</div>";
        }
        
        $ret .= $launch["launch_vehicle"];
        if ($launch["probability"] && $launch["probability"]!="-1") $ret .= " (" . $launch["probability"] . "%)";
        $ret .= "</td>";


        $ret .= "<td title=\"" . $launch["payload_type"] . "\" class=\"payload\">";

        if ($launch["payload_icon"] && $launch["payload_icon"] != '.') {
            $ret .= "<img style=\"vertical-align:top; height:1em;\" src=\"" . $url . $launch["payload_icon"] . "\"> ";
        }
        $ret .= "<span title=\"" . $launch["payload"] . "\">" . $launch["payload"] . "</span>";
        $ret .= "</td>";

        $ret .= "<td title=\"" . $launch["destination"] . "\" class=\"destination\">";
        if ($launch["destination_icon"] && $launch["destination_icon"] != '.') {
            $ret .= "<img style=\"vertical-align:top; height:1em;\" src=\"" . $url . $launch["destination_icon"] . "\"> ";
        }
        $ret .= $launch["destination"];
        $ret .= "</td>";

        
        $ret .= "<td style=\"text-align: center; \" title=\"" . $launch["location"]["pads"][0]["name"] . "\" class=\"destination\">";
        if ($launch["location"]["pads"] 
            && count($launch["location"]["pads"]) == 1
            && $launch["location"]["pads"][0]["mapURL"]
            ) {
            $ret .= "<a target=\"_blank\" href=" . $launch["location"]["pads"][0]["mapURL"] . "><img style=\"vertical-align: middle; height: 1em;\" src=\"images/map_pin.png\"></a>";
        }
        $ret .= "</td>";
        

        $ret .= "<td style=\"text-align: center; \" >";
        if ($launch["vidURLs"] && count($launch["vidURLs"]) > 0) {
            $ret .= "<a target=\"_blank\" href=\"" . $launch["vidURLs"][0] . "\"><img style=\"vertical-align: middle; height: 1em;\" src=\"images/video.png\"></a>";
        }
        $ret .= "</td>";
        $ret .= "</tr>";
    }
    return $ret;
}

function get_table() {
    return get_table_header() . get_table_content();
}

if (isset($_REQUEST["get_json"])) {
     header('Access-Control-Allow-Origin: *');
     $ret = array("launches" => array_values($launches),
        "available_selections" => $available_selections,
        "agency" => $agency,
        "selected" => array_values($selected));
     echo json_encode($ret);
     exit;
}

if (isset($_REQUEST["get_table"])) {
    header('Access-Control-Allow-Origin: *');
    echo get_table();
    exit;
}

if (isset($_REQUEST["get_table_content"])) {
    header('Access-Control-Allow-Origin: *');
    echo get_table_content();
    exit;
}

if ($_REQUEST["old_header"]) {
    include_once("header_old.php");
} else {
    include_once("header.php");
}


?>

<table id="launch_table" class="launch_table">
    <?php
        echo get_table();
    ?>
</table>

<script type='text/javascript'>
    var launches = <?=json_encode(array_values($launches));?>;
    var available_selections = <?=json_encode($available_selections);?>;
    var agency = <?=json_encode($agency);?>;
    var selected = <?=json_encode(array_values($selected));?>;
    
    var url = '<?=$url?>';
    
    $(".datepicker").datepicker();
    var toDate = new Date();
    var fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    $(".datepicker[name='launch_from']").datepicker('setDate', fromDate);
    $(".datepicker[name='launch_to']").datepicker('setDate', toDate);
    
    

    init();
</script>
</body>
</html>
