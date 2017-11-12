import * as Settings from  "./usersettings";
import * as $ from "jquery";
import "jqueryui";
import * as adminModule from "./admin"

export var admin = adminModule;

// From index.php
type Launch = {
    time: number; 
    tbdtime: "0" | "1";
    tbddate: "0" | "1";
    status: string;
    matches: string[];
};

var launches: {
    [key: number]: Launch
};
var available_selections: {[key: string]: string[]};
var url: string;

var sortedLaunchIds: number[];

var debug = true;


var selected: string[] = [];

var is_embedded = false;

var embedded_max_visible = 5;

var past_launches_loaded = false;

var select_counts: {[key: string]: number} = {};

export function init(_launches: {[key: number]: Launch}, _available_selections: {[key: string]: string[]}, _url: string) {
    launches = _launches;
    available_selections = _available_selections;
    url = _url;

    selected = Settings.loadSettings();

    initLaunchIds();
    
    update_dates();
    
    gray_out_rows();
    
    update_countdown_timeout();


    $(".datepicker").datepicker();
    var toDate = new Date();
    var fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    $(".datepicker[name='launch_from']").datepicker('setDate', fromDate);
    $(".datepicker[name='launch_to']").datepicker('setDate', toDate);
}

function seconds_to_dhms(time: number, tbdtime: "0" | "1", tbddate:  "0" | "1", launch_status: string) {
    var now = new Date();

    var seconds = time - now.getTime() / 1000;
    if (seconds < 0) {
        return "";
    }

    if (tbddate == "1") {
        var t = new Date(time * 1000);
        
        var months = (t.getFullYear() - now.getFullYear()) * 12 + t.getMonth() - now.getMonth();

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

    var days = Math.floor(seconds / (60*60*24));
    var hours = Math.floor(seconds / (60*60) ) % 24;
    var minutes = Math.floor(seconds / 60 ) % 60;
    var seconds = Math.floor(seconds % 60);

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

export function onToggleFilters() {
    $('.filter_row').toggle();
    $('.filter_icon').toggle();
    onFiltersChanged();
}

export function onFiltersChanged() {
    if (!past_launches_loaded && $("input[name='launch_date_filter']:checked").val() == 'date_range') {
        $("#filter").nextAll('tr').remove();
        $("#filter").after("<tr><td colspan='6' style='text-align: center;'><img src='images/ajax_loading.gif'><br>Loading</td></tr>");
        
        $.getJSON(url + "index.php?get_json=true&past_launches=true", function(data) {
            launches = data['launches'];
            $.get(url + "index.php?get_table_content=true&past_launches=true", function(data) {
                $("#filter").nextAll('tr').remove();
                $("#filter").after(data);

                initLaunchIds();
                update_dates();
                
                past_launches_loaded = true;
                Settings.saveSettings(available_selections);
                gray_out_rows();
            });
        });
    } else {
        Settings.saveSettings(available_selections);
        gray_out_rows();
    }
}


function increate_selection_counts(launch: Launch) {
     for (var index = 0; index < launch["matches"].length; index++) {
        var rocketID = launch["matches"][index];
        select_counts[rocketID]++;
    }
}

function is_selected(launch: Launch, filter_combination_all: boolean) {
    
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
    if (debug) console.time("gray_out_rows");

    var all = available_selections;

    var noLaunchSelected = true;
    
    var filter_combination_all = $("input[name='filters_join']:checked").val() == 'all';

    selected = [];
    
    for(var rocketID in all) {
        select_counts[rocketID] = 0;
        
        var checkElement = <HTMLInputElement>document.getElementById(rocketID);
        if (checkElement && checkElement.checked) {
            selected.push(rocketID);
        }
    }

    if (selected.length > 0) {
        for(var id of sortedLaunchIds) {
            if (is_selected(launches[id], filter_combination_all)) {
                noLaunchSelected = false;
            }
        }
    }
    
    if (noLaunchSelected && selected.length) {
        noLaunchSelected = false;
    }

    var prev_y;
    var prev_m;

    var date_from = new Date();
    date_from.setHours(0, 0, 0, 0);
    var date_to = new Date(2099, 1, 1);
    
    if ($("input[name='launch_date_filter']:checked").val() == 'date_range') {
        date_from = $("input[name='launch_from']").datepicker('getDate');
        date_to = $("input[name='launch_to']").datepicker('getDate');
    }
    
    var timestamp_from = date_from.getTime() / 1000;
    var timestamp_to = date_to.getTime() / 1000;

    var unchecked_visibility = $('input[name=unchecked_visibility]:checked').val()
    if (!unchecked_visibility) {
        unchecked_visibility = "gray_out";
    }

    var visible_count = 0;
    var counter = 0;

    for(var id of sortedLaunchIds) {
        var launch = launches[id];
        
        var e = document.getElementById(id.toString());

        var show = true;
        
        if ((launch["time"] < timestamp_from) || (launch["time"] > timestamp_to)) {
            show = false;
        } else if (!noLaunchSelected && !is_selected(launch, filter_combination_all)) {
            e.classList.add("unselected");
            if (unchecked_visibility == "hidden") {
                show = false;
            }
        } else {
            increate_selection_counts(launch);
            e.classList.remove("unselected");
            
            visible_count++;
        }
        
        if (is_embedded && visible_count > embedded_max_visible) {
            e.classList.add("unselected");
        }

        if (show) {
            e.style.display = "";

            if (counter % 2 == 0) {
                e.classList.remove("odd");
            } else {
                e.classList.add("odd");
            }
            counter++;

            var time = new Date(launch["time"] * 1000);
            if (prev_y != time.getFullYear()) {
                e.style.borderTop = '2px solid brown';
                prev_y = time.getFullYear();
                prev_m = time.getMonth();
            } else if(prev_m != time.getMonth()) {
                e.style.borderTop = '1px solid black';
                prev_y = time.getFullYear();
                prev_m = time.getMonth();
            } else {
                e.style.borderTop = '';
            }
        } else {
            e.style.display = "none";
        }

    }
    
    $("#launch_table").removeClass("hide_unselected");
    $("#launch_table").removeClass("gray_out_unselected");

    if (noLaunchSelected) {
        $("#filter").removeClass("gray_out_selections");
        
        $("#launch_table").addClass("gray_out_unselected");
    } else {
        $("#filter").addClass("gray_out_selections");
        
        if (unchecked_visibility == "hidden") {
            $("#launch_table").addClass("hide_unselected");
        } else if (unchecked_visibility == "gray_out") {
            $("#launch_table").addClass("gray_out_unselected");
        }
    }
    
    for(var rocketID in all) {
        var count = select_counts[rocketID];
        var count_string = count.toString();

        if (count < 10) count_string = "&nbsp;" + count_string;
        if (select_counts[rocketID] == 0) count_string = "&nbsp;&nbsp;";

        $("#count_" + rocketID).html(count_string);
    }

    $("label").removeClass("checked");
    $("label:has(input:checked)").addClass("checked");

    if (debug) console.timeEnd("gray_out_rows");
}

function update_countdown_timeout() {
    update_countdowns();

    window.setTimeout(function() {
        update_countdown_timeout();
    },1000);
}

function update_countdowns() {

    var countdownElements = document.getElementsByClassName('countdown');
    for (var i = 0; i < countdownElements.length; ++i) {
        var element = countdownElements[i];
        
        const id = parseInt(element.getAttribute("data-id"));
        const launch = launches[id];
        
        var newHTML = seconds_to_dhms(launch.time, launch.tbdtime, launch.tbddate, launch.status);
        if (newHTML && element.innerHTML != newHTML) {
            element.innerHTML = newHTML;
        }
    }

}

function update_dates() {

    var days = ['sun','mon','tue','wed','thu','fri','sat'];

    var dateElements = document.getElementsByClassName('date');
    for (var i = 0; i < dateElements.length; ++i) {
        const element = dateElements[i];

        const id = parseInt(element.getAttribute("data-id"));
        const launch = launches[id];

        var d = new Date(launch.time * 1000);

        if (launch.tbdtime == "0")  {
            element.innerHTML = days[d.getDay()] + " " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
                +  " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        } else if (launch.tbddate == "0")  {
            element.innerHTML = days[d.getDay()] +  " " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
        } else {
            element.innerHTML = "&nbsp;&nbsp;&nbsp; " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2);
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


function initLaunchIds() {
    sortedLaunchIds = [];
    
    var launchElements = document.getElementsByClassName("launch");
    for(var index = 0; index < launchElements.length; index++) {
        sortedLaunchIds.push(parseInt(launchElements[index].id));
    }
}

function init_embedded() {
    is_embedded = true;
    
    $.get(url + "index.php?get_table=true", function(data) {
        $("#launch_table").html(data);
        
        $("#filters_left").hide();
            
        $("input[name=unchecked_visibility][value=gray_out]").prop('checked', true);
        $("input[name=filters_join][value=any]").prop('checked', true);
        
        $("#embedded_message").html("Your desktop countdown can track only the upcoming " + embedded_max_visible + " launches!");
        
        $.getJSON(url + "index.php?get_json=true", function(data) {
            launches = data["launches"];
            available_selections = data["available_selections"];
            selected = data["selected"];

            $.get("/get_selected", function(serialized) {

                gray_out_rows();
                update_countdown_timeout();
            });
        });
    });

}
