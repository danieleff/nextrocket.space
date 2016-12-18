url = "http://nextrocket.space/";

var is_embedded = false;

var past_launches_loaded = false;

var select_counts = [];

function seconds_to_dhms(time, tbdtime, tbddate, launch_status) {
    //return new Date(time * 1000);

    var seconds = time - new Date().getTime() / 1000;
    if (seconds < 0) {
        return "";
    }

    if (tbddate == "1") {
        var t = new Date(time * 1000);
        var firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        //var monthSeconds = time - firstDay.getTime() / 1000;

        var months = (t.getFullYear() - new Date().getFullYear()) * 12 + t.getMonth() - new Date().getMonth();

        if (months == 1) {
            return "next month " + launch_status;
        } else if (months > 1 && months < 10){
            return "&nbsp;&nbsp;&nbsp;" + months + " months " + launch_status;
        } else if (months >= 10){
            return "&nbsp;&nbsp;" + months + " months " + launch_status;
        } else if (months == 0) {
            return "this month " + launch_status;
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
    } else {
        result += " " + launch_status;
    }


    return result;
}

function on_change() {
    if (!past_launches_loaded && $("input[name='launch_date_filter']:checked").val() == 'date_range') {
        $("#filter").nextAll('tr').remove();
        $("#filter").after("<tr><td colspan='6' style='text-align: center;'><img src='images/ajax_loading.gif'><br>Loading</td></tr>");
        
        $.getJSON(url + "index.php?get_json=true&past_launches=true", function(data) {
            launches = data['launches'];
            $.get(url + "index.php?get_table_content=true&past_launches=true", function(data) {
                $("#filter").nextAll('tr').remove();
                $("#filter").after(data);
                
                past_launches_loaded = true;
                save_settings_gray_out_rows();
            });
        });
    } else {
        save_settings_gray_out_rows();
    }
}
    
    
function save_settings_gray_out_rows() {
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

    gray_out_rows();
}


function increate_selection_counts(launch) {
     for (var index = 0; index < launch["matches"].length; index++) {
        var rocketID = launch["matches"][index];
        select_counts[rocketID]++;
    }
}

function is_selected(launch, filter_combination_all) {
    
    var found = [false, false, false, false];
    var needed = [false, false, false, false];
    
    for (var index = 0; index < selected.length; index++) {
        var rocketID = selected[index];
        
        var category = parseInt(rocketID.charAt(0));
        
        if ($.inArray(rocketID, launch["matches"]) != -1) {
            if (!filter_combination_all) {
                return true;
            }
            
            found[category] = true;
        }
        
        needed[category] = true;
    }
    
    if (filter_combination_all) {
        return (!needed[0] || found[0]) && (!needed[1] || found[1]) && (!needed[2] || found[2]) && (!needed[3] || found[3]);
    } else {
        return found[0] || found[1] || found[2] || found[3];  
    }
}


function gray_out_rows() {
    var all = available_selections;

    var none_found = true;
    
    var filter_combination_all = $("input[name='filters_join']:checked").val() == 'all';

    selected = [];
    
    for(rocketID in all) {
        select_counts[rocketID] = 0;
        
        var e = document.getElementById(rocketID);
        if (e && e.checked) {
            selected.push(rocketID);
        }
    }

    if (selected.length > 0) {
        for(var i = 0; i < launches.length; i++) {
            var launch = launches[i];
            if (is_selected(launch, filter_combination_all)) {
                none_found = false;
            }
        }
    }
    
    if (none_found && selected.length) {
        none_found = false;
    }

    var prev_y;
    var prev_m;

    var date_from = new Date();
    date_from.setHours(0, 0, 0, 0);
    var date_to = new Date(2099, 1, 1);
    
    if ($("input[name='launch_date_filter']:checked").val() == 'date_range') {
        date_from = $("input[name='launch_from'").datepicker('getDate');
        date_to = $("input[name='launch_to'").datepicker('getDate');
    }
    
    var timestamp_from = date_from.getTime() / 1000;
    var timestamp_to = date_to.getTime() / 1000;

    var unchecked_visibility = $('input[name=unchecked_visibility]:checked').val()
    if (!unchecked_visibility) {
        unchecked_visibility = readCookie("unchecked_visibility");
    }
    if (!unchecked_visibility) {
        unchecked_visibility = "gray_out";
    }

    for(var i = 0; i < launches.length; i++) {
        var launch = launches[i];

        var e = $("#launch_" + i);
        var e_images = $("#launch_" + i+" img");
        
        if ((launch["time"] < timestamp_from) | (launch["time"] > timestamp_to)) {
            e.hide();
            continue;
        } else if (!none_found && !is_selected(launch, filter_combination_all)) {
            if (unchecked_visibility == "hidden") {
                e.hide();
                continue;
            } else if (unchecked_visibility == "gray_out") {
                e.css("color", "darkgray");
                e_images.css("opacity", "0.5");
                e.show();
            } else {
                e.css("color", "");
                e_images.css("opacity", "");
                e.show();
            }
        } else {
            increate_selection_counts(launch);
            e.css("color", "");
            e_images.css("opacity", "");
            e.show();
        }

        var time = new Date(launch["time"] * 1000);
        
        if (prev_y != time.getYear()) {
            e.css('border-top', '2px solid brown');
            prev_y = time.getYear();
            prev_m = time.getMonth();
        } else if(prev_m != time.getMonth()) {
            e.css('border-top', '1px solid black');
            prev_y = time.getYear();
            prev_m = time.getMonth();
        } else {
            e.css('border-top', '');
        }

    }
    
    for(rocketID in all) {
        count_string = select_counts[rocketID];
        if (count_string < 10) count_string = "&nbsp;" + count_string;
        if (select_counts[rocketID] == 0) count_string = "&nbsp;&nbsp;";
        $("#count_" + rocketID).html(count_string);
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
        var newHTML = seconds_to_dhms(item.getAttribute("data-time"), item.getAttribute("data-tbdtime"), item.getAttribute("data-tbddate"), item.getAttribute("data-status"));
        if (newHTML && item.innerHTML != newHTML) {
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

    gray_out_rows();
    update_countdown_timeout();
}

function init_embedded() {
    is_embedded = true;

    $.get(url + "index.php?get_table=true", function(data) {
        $("#launch_table").html(data);
        
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
                for(var sel in selected) {
                    $("#" + selected[sel]).prop("checked", true);
                }
                
                gray_out_rows();
                update_countdown_timeout();
            });
        });
    });

}
