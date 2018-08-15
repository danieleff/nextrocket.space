import { FrontendLaunch, TimestampResolution } from "./types";

export function launchTimeToString(launch: FrontendLaunch) {
    
    var days = ['sun','mon','tue','wed','thu','fri','sat'];

    const d = new Date(launch.timestamp);

    if (launch.timestampResolution == TimestampResolution.SECOND)  {
        return days[d.getDay()] + " " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
            +  " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    } else if (launch.timestampResolution == TimestampResolution.DAY)  {
        return days[d.getDay()] +  " " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    } else {
        return "\xa0\xa0\xa0 " + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2);
    }
}

export function formatCountdown(launch: FrontendLaunch, now: Date) {
    if (!now) return;
    
    var seconds = (launch.timestamp - now.getTime()) / 1000;
    if (seconds < 0) {
        return "";
    }

    if (launch.timestampResolution == TimestampResolution.MONTH) {
        var t = new Date(launch.timestamp);
        
        var months = (t.getFullYear() - now.getFullYear()) * 12 + t.getMonth() - now.getMonth();

        if (months == 1) {
            return "next month ";
        } else if (months > 1 && months < 10){
            return "\xa0\xa0\xa0" + months + " months ";
        } else if (months >= 10){
            return "\xa0\xa0" + months + " months ";
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

    if (launch.timestampResolution != TimestampResolution.SECOND)  {
        days += 1;
    }

    if (!result) {
        result += days < 1000 ? "\xa0" : "";
    }

    result += days < 100 ? "\xa0" : "";


    if (days > 0 ) {
        result += (days < 10 ? "\xa0" + days : days) + " day" + (days != 1 ? 's' : '\xa0');
    } else {
        result += "\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
    }

    if (launch.timestampResolution == TimestampResolution.SECOND)  {
        result += " " + (hours < 10 ? "0" + hours : hours);
        result += ":" + (minutes < 10 ? "0" + minutes : minutes);
        result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
    } else {
        result += " ";
    }


    return result;
}
