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

function is_selected(launch) {
    for (var rocketID in available_selections) {
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
        var all = available_selections;//$.extend({}, rockets, missions, events);

        var none_found = true;

        if (checkboxes_exist || true) {
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
            rocketIDSelected = is_selected(launch);
            if (rocketIDSelected) {
                none_found = false;
            }
        }

        var prev_y;
        var prev_m;

        for(var i = 0; i < launches.length; i++) {
            var launch = launches[i];

            var style_color = "";

            var unchecked_visibility = $('input[name=unchecked_visibility]:checked').val()
            if (!unchecked_visibility) {
                unchecked_visibility = readCookie("unchecked_visibility");
            }
            if (!unchecked_visibility) {
                unchecked_visibility = "gray_out";
            }

            var e = $("#launch_" + i);
            var show = true;
            
            if (!none_found && !is_selected(launch)) {
                if (unchecked_visibility == "hidden") {
                    show = false;
                    if (e.is(":visible")) e.hide();
                } else if (unchecked_visibility == "gray_out") {
                    style_color = "color: darkgray; ";
                    e.css("color", "darkgray");
                    if (!e.is(":visible")) e.show();
                } else {
                    e.css("color", "");
                    if (!e.is(":visible")) e.show();
                }
            } else {
                e.css("color", "");
                if (!e.is(":visible")) e.show();
            }

            var time = new Date(launch["time"] * 1000);
            if (show && prev_y != time.getYear()) {
                e.css('border-top', '2px solid brown');
                prev_y = time.getYear();
                prev_m = time.getMonth();
            } else if(show && prev_m != time.getMonth() ) {
                e.css('border-top', '1px solid black');
                prev_y = time.getYear();
                prev_m = time.getMonth();
            } else {
                e.css('border-top', '');
            }

        }

        update_dates();

        $("label").removeClass("checked");
        $("label:has(input:checked)").addClass("checked");
        
        jQuery('tr:visible:odd').addClass("odd");
        jQuery('tr:visible:even').removeClass("odd");

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
        var newHTML = seconds_to_dhms(item.getAttribute("data-time"), item.getAttribute("data-tbdtime"), item.getAttribute("data-tbddate"));
        if (item.innerHTML != newHTML) {
            item.innerHTML = newHTML;
        }
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
    for(var sel in selected) {
        $("#" + selected[sel]).prop("checked", true);
    }
    
    var sel = readCookie('unchecked_visibility');
    /*if (sel != null) {
        $("input[name=unchecked_visibility][value=" + sel + "]").prop('checked', true);
    }*/
    
    var sel = readCookie("filter_hidden");
    if (sel == 'true') {
        $('.filter_row').toggle();$('.filter_icon').toggle();
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
