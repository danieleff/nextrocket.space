<?php

require_once("functions.php");

$launches = get_launches();

$url = "http://".$_SERVER["HTTP_HOST"].substr($_SERVER["REQUEST_URI"], 0, strrpos($_SERVER["REQUEST_URI"], "/") + 1);

$is_admin = $_REQUEST["admin_pwd"] == $admin_pwd;

function get_launches_by_id($launches) {
    $ret = array();
    foreach($launches as $launch) {
        $ret[$launch["id"]] = array(
            "time" => $launch["time"],
            "tbdtime" => $launch["tbdtime"],
            "tbddate" => $launch["tbddate"],
            "status" => $launch["status"],
            "matches" => $launch["matches"],
        );
    }
    return $ret;
}

function get_table_header() {
    global $available_selections, $url, $is_admin;
    
    $filters = array("", "", "", "");

    foreach($available_selections as $rocketId => $selection) {
        $check = "";
        $check .= "<label id=\"label_" . $rocketId . "\" class=\"filter\">";
        $check .= "<span class='selection_count' id='count_" . $rocketId . "'></span> ";
        $check .= " <input style=\"display: none;\" id=\"" . $rocketId . "\" onchange=\"app.onFiltersChanged()\" style=\"vertical-align: -1px;\" type=\"checkbox\" >";
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
    if ($is_admin) $ret .= "<col style=\"width:60px\">";
    $ret .= "</colgroup>";

    $ret .= "<tr id=\"filter-header\" style=\"cursor:pointer;\" onclick=\"app.onToggleFilters(this);\">";
    $ret .= "<th>";
    $ret .= "<span id=\"filter-icon-closed\" style=\"float:left; padding:0 0 2px 2px; display:none; \" class=\"filter_icon\">&#x25B2;</span>";
    $ret .= "<span id=\"filter-icon-open\" style=\"float:left; padding:0 0 2px 2px; text-align: left; \"class=\"filter_icon\">&#x25BC;</span>";
    $ret .= " Countdown";
    $ret .= "</th>";
    $ret .= "<th id=\"date_header\">Date GMT</th>";
    $ret .= "<th>Agency</th>";
    $ret .= "<th>Launch vehicle</th>";
    $ret .= "<th>Payload</th>";
    $ret .= "<th>Destination</th>";
    $ret .= "<th></th>";
    $ret .= "<th></th>";
    if ($is_admin) $ret .= "<th>Admin</th>";
    $ret .= "</tr>";

    
    $ret .= "<tr id=\"filter\">";
    
    $ret .= "<th style=\"text-align: left; padding: 0px;vertical-align: top;\" colspan=\"2\">";
    $ret .= "<div id=\"filters_left\" style=\"margin: 0.5em;\" class=\"filter_row\">";
    
    $ret .= " Filter by date:<br>";
    $ret .= " <label><input id=\"filter-date-upcoming\" onchange=\"app.onFiltersChanged()\" type=\"radio\" name=\"launch_date_filter\" value=\"upcoming\" checked>Upcoming</label><br>";
    $ret .= " <label><input id=\"filter-date-custom\" onchange=\"app.onFiltersChanged()\" type=\"radio\" name=\"launch_date_filter\" value=\"date_range\">";
    $ret .= " <input id=\"filter-launch-from\" onchange=\"app.onFiltersChanged()\" type=\"text\" class=\"datepicker\" name=\"launch_from\"> - <input onchange=\"app.onFiltersChanged()\" type=\"text\" class=\"datepicker\" name=\"launch_to\" id=\"filter-launch-to\">";
    $ret .= " </label><br>";
    
    $ret .= " <br>";
    $ret .= "Unselected launches:<br>";
    $ret .= " <label><input id=\"filter-unchecked-show\" onchange=\"app.onFiltersChanged()\" type=\"radio\" name=\"unchecked_visibility\" value=\"show\">show</label><br>";
    $ret .= " <label><input id=\"filter-unchecked-gray_out\" onchange=\"app.onFiltersChanged()\" type=\"radio\" name=\"unchecked_visibility\" value=\"gray_out\" checked>gray out</label><br>";
    $ret .= " <label><input id=\"filter-unchecked-hidden\" onchange=\"app.onFiltersChanged()\" type=\"radio\" name=\"unchecked_visibility\" value=\"hidden\">hide </label><br>";
    
    $ret .= "<br>";
    $ret .= "Filter combination:<br>";
    $ret .= " <label><input id=\"filter-any\" onchange=\"app.onFiltersChanged()\" type=\"radio\" name=\"filters_join\" value=\"any\" checked>Any</label><br>";
    $ret .= " <label><input id=\"filter-all\" onchange=\"app.onFiltersChanged()\" type=\"radio\" name=\"filters_join\" value=\"all\">All</label><br>";
    
    $ret .= "</div>";
    $ret .= "<div style=\"margin: 1em;\" id=\"embedded_message\"></div>";
    $ret .= "</th>";
    
    $ret .= "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[0]."</div></td>";
    $ret .= "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[1]."</div></td>";
    $ret .= "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[2]."</div></td>";
    $ret .= "<td valign=\"top\" style=\"padding: 0px; white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\"><div class=\"filter_row\">".$filters[3]."</div></td>";
    $ret .= "<td style=\"padding: 0px; \"></td>";
    $ret .= "<td style=\"padding: 0px; \"></td>";
    if ($is_admin) $ret .= "<td style=\"padding: 0px; \"></td>";
    $ret .= "</tr>";
    
    return $ret;
}

function get_table_content() {
    global $launches, $agency, $url;
    global $selection_destinations, $selection_payloads, $is_admin;
    
    foreach($launches as $key => $launch) {
        $style_color = "";
        $ret .= "<tr class=\"launch\" id=\"" . $launch["id"] . "\">";

        $launch_status = "Unknown";
        switch ($launch["status"]) {
            case 1: 
                $launch_status = ""; // GO
                break;
            case 2: 
                $launch_status = ""; //  NO-GO
                break;
            case 3: 
                $launch_status = "<span style='color:green;'>Success</span>";
                break;
            case 4: 
                $launch_status = "<span style='color:red;'>Failed</span>";
                break;
        }
        $launch_status .= " " . $launch["holdreason"];
        $launch_status .= " " . $launch["failreason"];
        $launch_status = trim($launch_status);
        
        $ret .= "<td class=\"countdown\">".$launch_status."</td>";
        
        $ret .= "<td class=\"date\"></td>";


        $ret .= "<td class=\"agency\">";

        $agency_string = "";
        for($j = 0; $j < count($launch["agency"]); $j++) {
            if ($agency_string) {
                $agency_string .= '<span style="border-left:1px solid gray; margin: 0 3px;"></span>';
            }
            $a = $launch["agency"][$j];

            foreach($agency as $agencyId => $agen) {
                if ($a == $agencyId && count($agen) > 1) {
                    $a = "<img title=\"" . $agen[0] . "\" src=\"" . $url . "images/" . $agen[1] . "\">";
                    break;
                }
            }
            $agency_string .= $a . " ";

        }
        $ret .= $agency_string;


        $ret .= "</td>";


        $ret .= "<td title=\"" . $launch["launch_vehicle"] . "\" class=\"rocket\">";
        
        $country_codes = array();
        if ($launch["rocket"]["agencies"]) {
            foreach($launch["rocket"]["agencies"] as $rocketAgency) {
                foreach(explode(",", $rocketAgency["countryCode"]) as $countryCode) {
                    if (file_exists("images/flag_" . $countryCode . ".png")) {
                        $country_codes[] = "<img class=\"flag\" src='" . $url . "images/flag_" . $countryCode . ".png'>";
                    } else {
                        $country_codes[] = $countryCode;
                    }
                }
            }
        }
        $country_codes = array_unique($country_codes);
        
        if (count($country_codes) > 1) {
            //TODO multiple country codes
            $ret .= "<div class=\"multiple_flags_hover\">";
            $ret .= "[" . count($country_codes) . "]";
            $ret .= "</div>";
            
            $ret .= "<div class=\"multiple_flags\">";
            $ret .= join(array_unique($country_codes), ", ");
            $ret .= "</div>";
        } else {
            $ret .= "<div class=\"flag\" >";
            $ret .= join(array_unique($country_codes), " ");
            $ret .= "</div>";
        }
        
        $ret .= $launch["launch_vehicle"];
        if ($launch["probability"] && $launch["probability"]!="-1" && $launch["time"] > time()) {
            $ret .= " (" . $launch["probability"] . "%)";
        }
        $ret .= "</td>";


        $ret .= "<td class=\"payload\" title=\"" . $launch["payload_type"] . "\">";

        if ($launch["payload_icon"] && $launch["payload_icon"] != '.') {
            $ret .= "<img src=\"" . $url . "images/" . $selection_payloads[$launch["payload_icon"]][1] . "\"> ";
        }
        $ret .= "<span title=\"" . $launch["payload"] . "\">" . $launch["payload"] . "</span>";
        $ret .= "</td>";

        $ret .= "<td title=\"" . $launch["destination"] . "\" class=\"destination\">";
        if ($launch["destination_icon"] && $launch["destination_icon"] != '.') {
            $ret .= "<img src=\"" . $url . "images/" . $selection_destinations[$launch["destination_icon"]][1] . "\"> ";
        }
        $ret .= $launch["destination"];
        $ret .= "</td>";

        
        $ret .= "<td title=\"" . $launch["location"]["pads"][0]["name"] . "\" class=\"map\">";
        if ($launch["location"]["pads"] 
            && count($launch["location"]["pads"]) == 1
            && $launch["location"]["pads"][0]["mapURL"]
            ) {
            $ret .= "<a target=\"_blank\" href=\"" . htmlentities($launch["location"]["pads"][0]["mapURL"]) . "\"><img src=\"" . $url . "images/map_pin.png\"></a>";
        }
        $ret .= "</td>";
        

        $ret .= "<td class=\"video\" >";
        if ($launch["vidURLs"] && count($launch["vidURLs"]) > 0) {
            $ret .= "<a target=\"_blank\" href=\"" . $launch["vidURLs"][0] . "\"><img src=\"" . $url . "images/video.png\"></a>";
        }
        $ret .= "</td>";
        
        if ($is_admin) {
            $ret .= "<td style=\"cursor: pointer\" onclick=\"app.admin.open_admin_popup(" . $launch["id"] . ");\">";
            $ret .= "Admin";
            $ret .= "</td>";
        }
        
        $ret .= "</tr>";
        $ret .= "\n";
    }
    return $ret;
}

function get_table() {
    return get_table_header() . get_table_content();
}

if (isset($_REQUEST["get_json"])) {
     header('Access-Control-Allow-Origin: *');
     $ret = array("launches" => get_launches_by_id($launches),
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

<div style="display: none; " id="dialog" title="Modify Data">
    <table style="width:100%;">
        <tr>
            <td style="vertical-align: top; width:50%;">
                LaunchLibray data
                <hr>
                TODO
            </td>
            
            <td style="vertical-align: top; width:50%;">
                Nextrocket data
                <hr>
                <table style="width:100%;">
                    <tr>
                        <td>Payload type:</td>
                        <td>
                            <select style="width:100%;" name="admin_payload_type">
                                <option value=""></option>
                                <?php
                                    foreach($selection_payloads as $id => $name) {
                                        echo '<option value="' . $id . '">' . $name[0] . '</option>';
                                    }
                                ?>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Destination type:</td>
                        <td>
                            <select style="width:100%;" name="admin_destination_type">
                                <option value=""></option>
                                <?php
                                    foreach($selection_destinations as $id => $name) {
                                        echo '<option value="' . $id . '">' . $name[0] . '</option>';
                                    }
                                ?>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Destination:</td>
                        <td><input style="width:100%;" name="admin_destination"></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    
    <center>
        <button onclick="app.admin.save_launch()">Save</button>
    </center>
    
</div>

<table id="launch_table" class="launch_table">
    <?php
        echo get_table();
    ?>
</table>

<!--<script src="lib/system.js"></script>-->
<script src="js/bundle.min.js"></script>

<script type='text/javascript'>


    var launches = <?=json_encode(get_launches_by_id($launches));?>;
    var available_selections = <?=json_encode($available_selections);?>;
    
    var url = '<?=$url?>';

    app.init(launches, available_selections, url, url.indexOf("localhost") !== -1);

</script>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-84608228-1', 'auto');
  ga('send', 'pageview');

</script>


</body>
</html>
