import * as Pikaday from "pikaday";

import * as LocalSettings from  "./localsettings";
import * as adminModule from "./admin"

import axios from "axios";

export var admin = adminModule;


export type Launch = {
    time: number; 
    tbdtime: "0" | "1";
    tbddate: "0" | "1";
    status: string;
    matches: string[];
    trElement: HTMLElement;
    countdownElement: HTMLElement;
    dateElement: HTMLElement;
};

type LaunchList = {
    [key: number]: Launch
};

type SelectionList = {
    [key: string]: string[];
};


export type Settings = {
    filterOpen: boolean;
    selected: string[];
    upcoming: boolean;
    fromDate: string;
    toDate: string;
    unselected: "show" | "gray_out" | "hidden";
    filterCombination: "any" | "all";
}

var launches: LaunchList;
var available_selections: SelectionList;
var url: string;

var sortedLaunchIds: number[];

export var debug = true;


var settings: Settings;
//var selectedFilters: string[] = [];

var past_launches_loaded = false;

var initialized = false;

var pikadayFrom: Pikaday;
var pikadayTo: Pikaday;

var launchesFromPreviousVisit: {[key: number]: Launch};

export function init(_launches: {[key: number]: Launch}, _available_selections: {[key: string]: string[]}, _url: string, _debug: boolean) {
    debug = _debug;

    if(debug) console.time("init");

    launches = _launches;
    available_selections = _available_selections;
    url = _url;

    settings = LocalSettings.loadSettings();

    launchesFromPreviousVisit = LocalSettings.loadLaunchesFromPreviousVisit();

    LocalSettings.saveLaunchesFromPreviousVisit(launches);

    settingsToUI();

    

    initLaunchElements();
    
    updateLaunchDates();
    
    update_countdown_timeout();

    const fromOptions = {
        field: document.getElementById('filter-launch-from'),
        defaultDate: new Date(settings.fromDate),
        setDefaultDate: true,
        toString: (date: Date, format: string) => date.toLocaleDateString()
    };
    pikadayFrom = new Pikaday(fromOptions);

    const toOptions = {
        field: document.getElementById('filter-launch-to'),
        defaultDate: new Date(settings.toDate),
        setDefaultDate: true,
        toString: (date: Date, format: string) => date.toLocaleDateString()
    };
    pikadayTo = new Pikaday(toOptions);
    
    initialized = true;

    updateLaunches();
    
    if(debug) console.timeEnd("init");
}

function settingsToUI() {
    for(var index in settings.selected) {
        var x = document.getElementById(settings.selected[index]);
        if (x) {
            (<HTMLInputElement>x).checked = true;
        }
    }

    for(var filterKey in available_selections) {        
        var checkElement = <HTMLInputElement>document.getElementById(filterKey);
        if (settings.selected.indexOf(filterKey) !== -1) {
            checkElement.checked = true;
            document.getElementById("label_" + filterKey).classList.add("checked");
        } else {
            document.getElementById("label_" + filterKey).classList.remove("checked");
        }
    }
    
    if (settings.unselected == "show") {
        (<HTMLInputElement>document.getElementById("filter-unchecked-show")).checked = true;
    } else if (settings.unselected == "hidden") {
        (<HTMLInputElement>document.getElementById("filter-unchecked-hidden")).checked = true;
    } else {
        (<HTMLInputElement>document.getElementById("filter-unchecked-gray_out")).checked = true;
    }
    
    if (settings.filterCombination == "all") {
        (<HTMLInputElement>document.getElementById("filter-all")).checked = true;
    } else {
        (<HTMLInputElement>document.getElementById("filter-any")).checked = true;
    }

    var headerElement = <HTMLElement>document.getElementById("filter");
    var openIcon = <HTMLElement>document.getElementById("filter-icon-open");
    var closedIcon = <HTMLElement>document.getElementById("filter-icon-closed");

    if (settings.filterOpen) {
        headerElement.style.display = '';
        openIcon.style.display = '';
        closedIcon.style.display = 'none';
    } else {
        headerElement.style.display = 'none';
        openIcon.style.display = 'none';
        closedIcon.style.display = '';
    }
}

function settingsFromUI() {
    for(var filterKey in available_selections) {        
        var checkElement = <HTMLInputElement>document.getElementById(filterKey);
        if (checkElement && checkElement.checked) {
            settings.selected.push(filterKey);
            document.getElementById("label_" + filterKey).classList.add("checked");
        } else {
            document.getElementById("label_" + filterKey).classList.remove("checked");
        }
    }

    settings.unselected = "gray_out"
    if ((<HTMLInputElement>document.getElementById("filter-unchecked-show")).checked) {
        settings.unselected = "show";
    }
    if ((<HTMLInputElement>document.getElementById("filter-unchecked-hidden")).checked) {
        settings.unselected = "hidden";
    }
    
    settings.filterCombination = "any";
    if ((<HTMLInputElement>document.getElementById("filter-all")).checked) {
        settings.filterCombination = "all";
    }


    var headerElement = <HTMLElement>document.getElementById("filter");
    if (headerElement.style.display == 'none') {
        settings.filterOpen = false;
    } else {
        settings.filterOpen = true;
    }
}

function initLaunchElements() {
    sortedLaunchIds = [];
    
    var launchElements = document.getElementsByClassName("launch");
    for(var index = 0; index < launchElements.length; index++) {
        var element = <HTMLElement>launchElements[index];

        var launchId = parseInt(launchElements[index].id);
        launches[launchId].trElement = element;
        launches[launchId].countdownElement = <HTMLElement>element.getElementsByClassName("countdown")[0];
        launches[launchId].dateElement = <HTMLElement>element.getElementsByClassName("date")[0];

        sortedLaunchIds.push(launchId);
    }
}

function formatCountdown(time: number, tbdtime: "0" | "1", tbddate:  "0" | "1", launch_status: string) {
    var now = new Date();

    var seconds = time - now.getTime() / 1000;
    if (seconds < 0) {
        return "";
    }

    if (tbddate == "1") {
        var t = new Date(time * 1000);
        
        var months = (t.getFullYear() - now.getFullYear()) * 12 + t.getMonth() - now.getMonth();

        if (months == 1) {
            return "next month ";
        } else if (months > 1 && months < 10){
            return "&nbsp;&nbsp;&nbsp;" + months + " months ";
        } else if (months >= 10){
            return "&nbsp;&nbsp;" + months + " months ";
        } else if (months == 0) {
            return "this month ";
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
        result += " ";
    }


    return result;
}

export function onToggleFilters() {
    var headerElement = <HTMLElement>document.getElementById("filter");

    if (headerElement.style.display == 'none') {
        headerElement.style.display = '';
    } else {
        headerElement.style.display = 'none';
    }

    onFiltersChanged();
}

export async function onFiltersChanged() {
    if (!initialized) return;
    
    settings.selected = [];

    settingsFromUI();

    settingsToUI();
    
    if (!past_launches_loaded && (<HTMLInputElement>document.getElementById("filter-date-custom")).checked) {
        var launchElements = document.getElementsByClassName("launch");
        while(launchElements.length > 0){
            launchElements[0].parentNode.removeChild(launchElements[0]);
        }

        // "<tr><td colspan='6' style='text-align: center;'><img src='images/ajax_loading.gif'><br>Loading</td></tr>";
        
        var launchResponse = await axios.get(url + "index.php?get_json=true&past_launches=true", {responseType: "json"});
        var htmlResponse = await axios.get(url + "index.php?get_table_content=true&past_launches=true");
        
        launches = launchResponse.data["launches"];

        document.getElementById("launch_table").insertAdjacentHTML("beforeend", htmlResponse.data);

        initLaunchElements();
        updateLaunchDates();
        
        past_launches_loaded = true;
    }

    LocalSettings.saveSettings(settings);
    updateLaunches();
}

function isSelected(launch: Launch, filter_combination_all: boolean) {
    
    var found = [false, false, false, false];
    var needed = [false, false, false, false];
    
    for (var index = 0; index < settings.selected.length; index++) {
        var filterKey = settings.selected[index];
        
        var filterCategory = parseInt(filterKey.charAt(0));
        
        if (launch["matches"].indexOf(filterKey) !== -1) {
            if (!filter_combination_all) {
                return true;
            }
            
            found[filterCategory] = true;
        }
        
        needed[filterCategory] = true;
    }
    
    if (filter_combination_all) {
        return (!needed[0] || found[0]) && (!needed[1] || found[1]) && (!needed[2] || found[2]) && (!needed[3] || found[3]);
    } else {
        return found[0] || found[1] || found[2] || found[3];  
    }
}


function updateLaunches() {
    if (!initialized) return;

    if (debug) console.time("updateLaunchRows");

    var all = available_selections;

    var noLaunchSelected = true;
    
    var filter_combination_all = (<HTMLInputElement>document.getElementById("filter-all")).checked;

    var selectionCounts: {[key: string]: number} = {};
    
    for(var filterKey in all) {
        selectionCounts[filterKey] = 0;
    }

    if (settings.selected.length > 0) {
        for(var id of sortedLaunchIds) {
            if (isSelected(launches[id], filter_combination_all)) {
                noLaunchSelected = false;
            }
        }
    }
    
    if (noLaunchSelected && settings.selected.length) {
        noLaunchSelected = false;
    }

    var prev_y;
    var prev_m;

    var date_from = new Date();
    date_from.setHours(0, 0, 0, 0);
    var date_to = new Date(2099, 1, 1);
    
    if ((<HTMLInputElement>document.getElementById("filter-date-custom")).checked) {
        date_from = pikadayFrom.getDate();
        date_to = pikadayTo.getDate();
    }
    
    var timestamp_from = date_from.getTime() / 1000;
    var timestamp_to = date_to.getTime() / 1000;

    var unchecked_visibility = "gray_out"
    if ((<HTMLInputElement>document.getElementById("filter-unchecked-show")).checked) {
        unchecked_visibility = "show";
    }
    if ((<HTMLInputElement>document.getElementById("filter-unchecked-hidden")).checked) {
        unchecked_visibility = "hidden";
    }

    var counter = 0;

    for(var id of sortedLaunchIds) {
        var launch = launches[id];
        
        var e = launch.trElement;

        var show = true;
        
        if ((launch["time"] < timestamp_from) || (launch["time"] > timestamp_to)) {
            show = false;
        } else if (!noLaunchSelected && !isSelected(launch, filter_combination_all)) {
            e.classList.add("unselected");
            if (unchecked_visibility == "hidden") {
                show = false;
            }
        } else {
            for(var filterKey of launch.matches) {
                selectionCounts[filterKey]++;
            }
            e.classList.remove("unselected");
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
    
    if (unchecked_visibility == "gray_out") {
        document.getElementById("launch_table").classList.add("gray_out_unselected");
    } else {
        document.getElementById("launch_table").classList.remove("gray_out_unselected");
    }

    if (noLaunchSelected) {
        document.getElementById("filter").classList.remove("gray_out_selections");
    } else {
        document.getElementById("filter").classList.add("gray_out_selections");
    }
    
    for(var filterKey in all) {
        var count = selectionCounts[filterKey];
        var count_string = count.toString();

        if (count < 10) count_string = "&nbsp;" + count_string;
        if (selectionCounts[filterKey] == 0) count_string = "&nbsp;&nbsp;";

        document.getElementById("count_" + filterKey).innerHTML = count_string;
    }

    if (debug) console.timeEnd("updateLaunchRows");
}

function update_countdown_timeout() {
    updateLaunchCountdowns();

    window.setTimeout(function() {
        update_countdown_timeout();
    },1000);
}

function updateLaunchCountdowns() {
    for(var id in launches) {
        const launch = launches[id];
        const element = launch.countdownElement;

        var newHTML = formatCountdown(launch.time, launch.tbdtime, launch.tbddate, launch.status);
        if (newHTML && element.innerHTML != newHTML) {
            element.innerHTML = newHTML;
        }
    }
}

function updateLaunchDates() {

    var days = ['sun','mon','tue','wed','thu','fri','sat'];

    //var dateElements = document.getElementsByClassName('date');
    for(var id in launches) {
        const launch = launches[id];
        const element = launch.dateElement;

        const d = new Date(launch.time * 1000);

        var launchChangeIndicator = '<i class="fa fa-fw" style="color: red;"></i>';

        const launchFromPastVisit = launchesFromPreviousVisit[id];
        if (launchesFromPreviousVisit && Object.keys(launchesFromPreviousVisit).length > 0) {
            if (!launchFromPastVisit) {
                launchChangeIndicator = '<i class="fa fa-fw fa-plus-circle" title="Launch added since previous visit" style="color: red;"></i>';
            } else if (launchFromPastVisit.time != launch.time) {
                launchChangeIndicator = '<i class="fa fa-fw fa-info-circle" title="Launch date changed since previous visit" style="color: red;"></i>';
            }
        }

        if (launch.tbdtime == "0")  {
            element.innerHTML = launchChangeIndicator + days[d.getDay()] + " " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
                +  " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        } else if (launch.tbddate == "0")  {
            element.innerHTML = launchChangeIndicator + days[d.getDay()] +  " " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
        } else {
            element.innerHTML = launchChangeIndicator + "&nbsp;&nbsp;&nbsp; " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2);
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


/*
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
*/
