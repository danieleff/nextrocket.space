import {debug, Settings, Launch} from "./app";

export const a = 6;

export function saveSettings(filter: Settings) {
    if (debug) console.log("saveSettings", filter);

    localStorage.setItem("filter", JSON.stringify(filter));
}

export function loadSettings(): Settings {
    var item = localStorage.getItem("filter");
    console.log("loadSettings", item);

    if (item) {
        try {
            return JSON.parse(item);
        } catch(e) {
            console.log(e);
        }
    }
    
    var toDate = new Date();
    var fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);


    return {
        filterOpen: true,
        upcoming: true,
        filterCombination: "any",
        fromDate: fromDate.toLocaleString(),
        toDate: toDate.toLocaleString(),
        selected: [],
        unselected: "gray_out"
    }
}


export function loadLaunchesFromPreviousVisit() {
    var item = localStorage.getItem("last_launches");
    
    if (item) {
        try {
            return JSON.parse(item);
        } catch(e) {
            console.log(e);
        }
    }
    
    return {};
}

export function saveLaunchesFromPreviousVisit(launches: {[key: number]: Launch}) {
    localStorage.setItem("last_launches", JSON.stringify(launches));
}
