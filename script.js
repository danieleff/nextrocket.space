var url = "http://nextrocket.space/";

function seconds_to_dhms(time, tbdtime, tbddate) {
    //return new Date(time * 1000);

    var seconds = time - new Date().getTime() / 1000;

    if (tbddate == "1") {
        var t = new Date(time * 1000);
        var firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        //var monthSeconds = time - firstDay.getTime() / 1000;

        var months = (t.getFullYear() - new Date().getFullYear()) * 12 + t.getMonth() - new Date().getMonth();

        if (months == 1) {
            return "&nbsp;&nbsp;&nbsp;" + months + " month";
        } else if (months > 1 && months < 10){
            return "&nbsp;&nbsp;&nbsp;" + months + " months";
        } else if (months >= 10){
            return "&nbsp;&nbsp;" + months + " months";
        } else if (months == 0) {
            return "this month";
        }

    }

    var result = "";
    if (seconds < 0) {
        seconds = -seconds;
        result += "-";
    }

    var days = parseInt( seconds / (60*60*24) );
    var hours = parseInt( seconds / (60*60) ) % 24;
    var minutes = parseInt( seconds / 60 ) % 60;
    var seconds = parseInt(seconds % 60);

    if (tbdtime == "1")  {
        days += 1;
    }

    if (!result) {
        result += days < 1000 ? "&nbsp;" : "";
    }

    result += days < 100 ? "&nbsp;" : "";


    if (days > 0 ) {
        result += (days < 10 ? "&nbsp;" + days : days) + " day" + (days != 1 ? 's' : '&nbsp;');
    } else {
        result += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    }

    if (tbdtime == "0")  {
        result += " " + (hours < 10 ? "0" + hours : hours);
        result += ":" + (minutes < 10 ? "0" + minutes : minutes);
        result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
    }


    return result;
}

function on_change() {
    var selected_rockets = "";
    var first = true;
    var all = available_selections;

    for(rocketID in all) {
        if (document.getElementById(rocketID) && document.getElementById(rocketID).checked) {
            if (!first) selected_rockets += ",";
            selected_rockets += rocketID;
            first = false;
        }
    }

    if (is_embedded) {
        $.getJSON("?r=" + selected_rockets);
    } else {
        createCookie("selected", selected_rockets, 10000);
        createCookie("unchecked_visibility", $('input[name=unchecked_visibility]:checked').val(), 10000);
    }

    recreate_table(true);
}

function is_selected(launch, only_1) {
    for (var rocketID in available_selections) {
        if (only_1 && only_1[rocketID]) {
            continue;
        }
        if (selected.indexOf(rocketID) == -1) {
            continue;
        }

        var match = is_match(launch, rocketID);

        if (match) {
            return match;
        }
    }
    return false;
}

function is_match(launch, rocketID) {
    if (!launch["name"]) {
        return false;
    }

    var sel = available_selections[rocketID][0].toLowerCase();

    if (rocketID.charAt(0) == '0') {
        for(var i = 0; i < launch["agency"].length; i++) {
            if (available_selections[rocketID][2] == launch["agency"][i]) {
                return rocketID
            }
        }
    }

    if (rocketID.charAt(0) == '1'
        && launch["launch_vehicle"]
        && launch["launch_vehicle"].toLowerCase().indexOf(sel) != -1
        ) {
        return rocketID
    }

    if (rocketID.charAt(0) == '2'
        && launch["payload_type"]
        && launch["payload_type"].toLowerCase().indexOf(sel) != -1
        ) {
        return rocketID
    }

    if (rocketID.charAt(0) == '3'
        && launch["destination"]
        && launch["destination"].toLowerCase().indexOf(sel) != -1
        ) {
        return rocketID
    }

    return false;
}

function recreate_table(checkboxes_exist) {
        var launches2 = launches.slice();
        var only_1 = {};
        var index = 0;
        var all = available_selections;//$.extend({}, rockets, missions, events);

        var none_found = true;

        if (checkboxes_exist) {
            selected = [];

            for(rocketID in all) {
                var e = document.getElementById(rocketID);
                if (e && e.checked) {
                    selected.push(rocketID);
                }
            }
        }


        for(var i = 0; i < launches.length; i++) {
            var launch = launches[i];
            rocketIDSelected = is_selected(launch, only_1);
            if (rocketIDSelected) {
                only_1[rocketIDSelected] = true;
                //launches2.splice(index, 0, launch);
                none_found = false;
                index ++;
            }
        }

        launches2.splice(0, 0, {}); //index

        var html = "";

        html += "<colgroup>";
        //html += "<col style=\"width:5%\">";
        html += "<col style=\"width:10em\">";
        html += "<col style=\"width:11em\">";
        html += "<col style=\"width:17%\">";
        html += "<col style=\"width:14%\">";
        html += "<col style=\"width:24%\">";
        html += "<col style=\"width:*\">";
        html += "<col style=\"width:22px\">";
        html += "</colgroup>";

        //html += "<tr><th colspan=\"7\"><span class=\"title\">Filters</span></th></tr>";

        //html += "<tr><td colspan=\"7\" style=\"line-height: 2em; font-family: sans-serif; font-size:small; padding:7px; text-align:left;vertical-align:top;\">";

        var first = true;
        var filters = ["", "", "", ""];

        for(rocketID in available_selections) {
            if (rocketID[0]=='*') {
                //if (!first) html += "<br>";
                //html += available_selections[rocketID] + ":";
                continue;
            }

            var count = 0;
            for(var i = 0; i < launches2.length; i++) {
                var launch = launches2[i];
                if (is_match(launch, rocketID)) count++;
            }

            var check = "";
            check += "<label class=\"filter\">";
            check += " <input style=\"display: none;\" id=\"" + rocketID + "\" onchange=\"on_change()\" style=\"vertical-align: -1px;\" type=\"checkbox\" " + (selected.indexOf(rocketID)!=-1?"checked":"") + ">";
            if (available_selections[rocketID].length > 1 && available_selections[rocketID][1]) {
                check += "<img class=\"icon\" src=\"" + url + "images/" + available_selections[rocketID][1] + "\"> ";
            }

            var name = "(" + count + ") " + available_selections[rocketID][0];
            check += "<span title=\"" + name + "\">" + name + "</span>";
            check += "</input>";
            check += "</label>";

            filters[rocketID[0]] += check;

            first = false;
        }

        //html += "</td></tr>";

        html += "<tr>";
        html += "<th></th>";
        html += "<th></th>";
        html += "<td valign=\"top\" style=\"white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\">Agencies:<br>"+filters[0]+"</td>";
        html += "<td valign=\"top\" style=\"white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\">Rockets:<br>"+filters[1]+"</td>";
        html += "<td valign=\"top\" style=\"white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\">Payload:<br>"+filters[2]+"</td>";
        html += "<td valign=\"top\" style=\"white-space: nowrap; text-align: left;overflow: hidden; text-overflow: ellipsis;\">Destination:<br>"+filters[3]+"</td>";
        html += "<th></th>";
        html += "</tr>";

        var header = "";
        header += "<tr>";
        //header += "<th></th>";
        header += "<th>Countdown</th>";
        header += "<th id=\"date_header\">Date GMT</th>";
        header += "<th></th>";
        header += "<th>Launch vehicle</th>";
        header += "<th>Payload</th>";
        header += "<th>Destination</th>";
        header += "<th></th>";
        header += "</tr>";

        //html += "<tr><th colspan=\"7\"><span class=\"title\">Next launches</span></th></tr>";
        //html += header;

        var prev_y;
        var prev_m;

        for(var i = 0; i < launches2.length; i++) {
            var launch = launches2[i];

            var style_color = "";

            var unchecked_visibility = $('input[name=unchecked_visibility]:checked').val()
            if (!unchecked_visibility) {
                unchecked_visibility = readCookie("unchecked_visibility");
            }
            if (!unchecked_visibility) {
                unchecked_visibility = "gray_out";
            }

            if (!none_found && !is_selected(launch)) {
                if (launch["name"] && unchecked_visibility == "hidden") {
                    continue;
                }
                if (launch["name"] && unchecked_visibility == "gray_out") {
                    style_color = "color: darkgray; ";
                }
            }

            var time = new Date(launch["time"] * 1000);
            if (prev_y != time.getYear()) {
                  style_color += "border-top: 2px solid brown;";
            } else if(prev_m!=time.getMonth() ) {
                  style_color += "border-top: 1px solid black;";
            }
            prev_y = time.getYear();
            prev_m = time.getMonth();

            if (launch["name"]) {
                html += "<tr style=\"" + style_color + "\">";

                /*
                html += "<td class=\"agency\" style=\"text-align: center;\">";

                if (launch["location"]) {
                    html += launch["location"]["countryCode"]+" ";
                }

                html += "</td>";
                */

                if (launch["status"]==4) {
                    html += "<td>Failed</td>";
                } else {
                    html += "<td class=\"countdown\" data-tbdtime=\"" + launch["tbdtime"] + "\" data-tbddate=\"" + launch["tbddate"] + "\" data-time=\"" + launch["time"] + "\"></td>";
                }

                html += "<td class=\"date\" data-tbdtime=\"" + launch["tbdtime"] + "\" data-tbddate=\"" + launch["tbddate"] + "\" data-time=\"" + launch["time"] + "\"></td>";


                html += "<td class=\"agency\" style=\"text-align: center;\">";

                var agency_string = "";
                for(var j = 0; j < launch["agency"].length; j++) {
                    var a = launch["agency"][j];

                    for(agencyId in agency) {
                        if (a == agencyId && agency[a].length > 1) {
                            a = "<img title=\"" + agency[a][0] + "\" style=\"vertical-align:baseline; height:16px;\" src=\"" + url + "images/" + agency[a][1] + "\">";
                            break;
                        }
                    }
                    agency_string += a + " ";

                }
                html += agency_string;


                html += "</td>";


                html += "<td title=\""+launch["launch_vehicle"]+"\" class=\"rocket\">";
                html += launch["launch_vehicle"];
                if (launch["probability"] && launch["probability"]!="-1") html += " (" + launch["probability"] + "%)";
                html += "</td>";


                html += "<td title=\""+launch["payload_type"]+"\" class=\"payload\">";

                /*if (launch["missions"] && launch["missions"][0]) {
                    html += launch["missions"][0]["typeName"];
                    html += " ";
                }*/

                if (launch["payload_icon"] && launch["payload_icon"]!='.') {
                    html += "<img style=\"vertical-align:top; height:1em;\" src=\"" + url + launch["payload_icon"] + "\"> ";
                }
                html += "<span title=\""+launch["payload"]+"\">" + launch["payload"] + "</span>";
                html += "</td>";

                html += "<td title=\""+launch["destination"]+"\" class=\"destination\">";
                if (launch["destination_icon"] && launch["destination_icon"]!='.') {
                    html += "<img style=\"vertical-align:top; height:1em;\" src=\"" + url + launch["destination_icon"] + "\"> ";
                }
                html += launch["destination"];
                html += "</td>";



                html += "<td>";
                if (launch["vidURLs"] && launch["vidURLs"].length > 0) {
                    html += "<a href=\"" + launch["vidURLs"][0] + "\"><img style=\"vertical-align: middle; height: 1em;\" src=\"images/video.png\"></a>";
                }
                html += "</td>";
                html += "</tr>";

            } else {

                html += "<th colspan=\"7\">";
                //html += "<span class=\"title\">All launches</span><br>"
                html += "Unselected launches:";
                html += " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"show\" " + ((unchecked_visibility=="show")?"checked":"")+ ">show</label>";
                html += " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"gray_out\" " + ((unchecked_visibility=="gray_out")?"checked":"")+ ">gray out</label>";
                html += " <label><input onchange=\"on_change()\" type=\"radio\" name=\"unchecked_visibility\" value=\"hidden\" " + ((unchecked_visibility=="hidden")?"checked":"")+ ">hide </label>";
                html += "</th>";
                html += "</tr>";

                html += header;
            }

        }

        document.getElementById("launch_table").innerHTML = html;

        update_dates();
        update_countdowns();

        $("label:has(input:checked)").addClass("checked");
    }

function update_countdown_timeout() {
    update_countdowns();

    window.setTimeout(function() {
        update_countdown_timeout();
    },1000);
}

function update_countdowns() {

    var cusid_ele = document.getElementsByClassName('countdown');
    for (var i = 0; i < cusid_ele.length; ++i) {
        var item = cusid_ele[i];
        item.innerHTML = seconds_to_dhms(item.getAttribute("data-time"), item.getAttribute("data-tbdtime"), item.getAttribute("data-tbddate"));
    }

}

function update_dates() {

    var days = ['sun','mon','tue','wed','thu','fri','sat'];

    var cusid_ele = document.getElementsByClassName('date');
    for (var i = 0; i < cusid_ele.length; ++i) {
        var item = cusid_ele[i];

        var d = new Date(item.getAttribute("data-time") * 1000);

        if (item.getAttribute("data-tbdtime") == "0")  {
            item.innerHTML = days[d.getDay()] + " " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
                +  " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        } else if (item.getAttribute("data-tbddate") == "0")  {
            item.innerHTML = days[d.getDay()] +  " " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
        } else {
            item.innerHTML = "&nbsp;&nbsp;&nbsp; " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2);
        }
    }

    var header = document.getElementById('date_header');
    var offset = new Date().getTimezoneOffset();
    var tz = "-";
    if (offset < 0) {
        offset = -offset;
        tz = "+";
    }
    tz += ("0" + (offset / 60)).slice(-2);
    tz += ("0" + (offset % 60)).slice(-2);

    header.innerHTML = "Local time (" + tz + ")";

}

function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

var is_embedded = false;

function init() {
    var cookie = readCookie("selected");
    if (cookie) {
        selected = cookie.split(",");
    }

    recreate_table(false);
    update_countdown_timeout();
}

function init_embedded() {
    is_embedded = true;

    $.getJSON(url + "index.php?get_json=true", function(data) {
        launches = data["launches"];
        available_selections = data["available_selections"];
        events = data["events"]; //TODO delete
        rockets = data["rockets"]; //TODO delete
        missions = data["missions"]; //TODO delete
        selected = data["selected"];
        agency = data["agency"];

        $.get("/get_selected", function(selected_rockets_str) {
            selected = selected_rockets_str.split(",");
            recreate_table(false);
            update_countdown_timeout();
        });
    });

}
