import Axios from "axios";
import { updateLaunchLibraryv2DBAgencies, updateLaunchLibraryv2DBLaunches, updateLaunchLibraryv2DBLaunchers } from "./database";

const LAUNCH_ALL_URL = "https://ll.thespacedevs.com/2.0.0/launch/?format=json&limit=100";

const LAUNCH_UPCOMING_URL = "https://ll.thespacedevs.com/2.0.0/launch/upcoming/?format=json&limit=100";

const AGENCY_URL = "https://ll.thespacedevs.com/2.0.0/agencies/?format=json&mode=detailed&limit=100";

const LAUNCHER_URL = "https://ll.thespacedevs.com/2.0.0/config/launcher/?format=json&mode=detailed&limit=100";

const TIMEOUT_BETWEEN_CALLS_MS = 7 * 60 * 1000;

export type LaunchLibraryV2Launch = {
    id: string;
    launch_library_id: number;

    name: string;
    net: string;
    tbdtime: boolean;
    tbddate: boolean;
    //isostart: string,
    launch_service_provider?: {
        id: number;
        //abbrev: string;
        name: string;
        url: string | null;
        //infoURL: string | null;
        //wikiURL: string | null;
        country_code: string | null;
        //countryCode: string | null;
    };
    rocket: {
        id: number;
        configuration: {
            id: number;
            name: string;
        }
        
        //configuration: ...

        /*
        name: string;
        infoURLs: string[];
        wikiURL: string | null;
        familyname: string;
        configuration: string;
        agencies: {
            countryCode: string
        }[]*/
    };
    pad: {
        map_url: string;
    };
    /*
    location: {
        pads: {
            mapURL: string
        }[]
    }
    */
    mission: {
        name: string;
    }[];
    
    /*
    missions: {
        name: string;
    }[],
    */

    vidURLs: string[];
}

export type LaunchLibraryV2Agency = {
    id: number;
    abbrev: string;
    country_code: string;
    name: string;
    description: string;
    info_url: string;
    wiki_url: string;
    type: string;
}

export type LaunchLibraryV2Launcher = {
    abbrev: string;
    country_code: string;
    info_url: string;
    wiki_url: string;
}

type TheSpaceDevResponse<T> = {
    results: T[];
    count: number;
    next?: string;
    previous: string;
}

export async function getLauncLibraryv2Launches(upcoming: boolean): Promise<LaunchLibraryV2Launch[]> {
    let url = upcoming ? LAUNCH_UPCOMING_URL : LAUNCH_ALL_URL;

    return getLauncLibraryV2Rows<LaunchLibraryV2Launch>(url);
}

export async function getLauncLibraryv2Agencies(): Promise<LaunchLibraryV2Launch[]> {
    return getLauncLibraryV2Rows<any>(AGENCY_URL);
}

export async function getLauncLibraryv2Launchers(): Promise<LaunchLibraryV2Launch[]> {
    return getLauncLibraryV2Rows<any>(LAUNCHER_URL);
}

async function getLauncLibraryV2Rows<T>(url: string): Promise<T[]> {
    let rows: T[] = [];

    while(url) {
        console.log("loading", url);

        try {
            const response = await Axios.get<TheSpaceDevResponse<T>>(url, {
                headers: {
                    "user-agent": "nextrocket.space danieleff@gmail.com"
                }
            });

            await timeoutAsync(TIMEOUT_BETWEEN_CALLS_MS);

            rows = rows.concat(response.data.results);
            url = response.data.next;
        } catch(e) {
            console.log(e.response!.data);
            throw e;
        }
    }

    return rows;
}

export async function timeoutAsync(millis: number) {
    return new Promise(resolve => setTimeout(resolve, millis));
}


async function load() {
    const upcoming = await getLauncLibraryv2Launches(false);
    updateLaunchLibraryv2DBLaunches(upcoming, false);

    //console.log();

    //const agencies = await getLauncLibraryv2Agencies();
    //updateLaunchLibraryv2DBAgencies(agencies, false);

    //const launchers = await getLauncLibraryv2Launchers();
    //updateLaunchLibraryv2DBLaunchers(launchers, false);

    //console.log(upcoming);
    //console.log(upcoming.length);
}

load();
