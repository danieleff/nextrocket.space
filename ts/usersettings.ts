import * as $ from "jquery";

const is_embedded = false;

export const a = 6;

export function saveSettings(available_selections: {[key: string]: string[]}) {
    var serialized = serializeSelection(available_selections);

    if (is_embedded) {
        $.getJSON("?r=" + serialized);
    } else {
        createCookie(cookie_key_serialized, serialized, 10000);
        createCookie('filter_visible', "" + $('.filter_row').is(':visible'), 10000);
    }
}

export function loadSettings() {
    
    var sel = readCookie("filter_visible");
    if (sel == 'false') {
        $('.filter_row').toggle();
        $('.filter_icon').toggle();
    }

    var cookie = readCookie(cookie_key_serialized);
    if (cookie) {
        return unserializeSelection(cookie);
    }

}

var delimiter = "|";

var cookie_key_serialized = "serialized";

function createCookie(name: string, value: string, days: number) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name: string) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}


function serializeSelection(all: {[key: string]: string[]}) {
    var serialized = "1";
    serialized += delimiter;
    
    var first = true;

    for(var rocketID in all) {
        if (document.getElementById(rocketID) && (<HTMLInputElement>document.getElementById(rocketID)).checked) {
            if (!first) serialized += ",";
            serialized += rocketID;
            first = false;
        }
    }
    
    serialized += delimiter;
    serialized += $('input[name=unchecked_visibility]:checked').val();
    
    serialized += delimiter;
    serialized += $('input[name=filters_join]:checked').val();
    
    return serialized;
}

function unserializeSelectionV1(data: string) {
    var parts = data.split(delimiter);
    
    var selected = parts[1].split(",");
    
    for(var index in selected) {
        if (selected[index]) {
            $("#" + selected[index]).prop("checked", true);
        }
    }
    
    $("input[name=unchecked_visibility][value=" + parts[2] + "]").prop('checked', true);
    
    $("input[name=filters_join][value=" + parts[3] + "]").prop('checked', true);

    return selected;
}

function unserializeSelection(data: string) {
    if (data[0] == '1') {
        return unserializeSelectionV1(data);
    }
}
