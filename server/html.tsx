import { readFileSync } from 'fs';
import { getAvailableFilters } from './filters';

import * as React from 'react';
import { renderToString } from "react-dom/server";

import { FrontendLaunch, TimestampResolution } from '../client/types';
import { LaunchTable } from '../client/LaunchTable';
import { DBLaunchLibraryV2Launch, DBLaunchLibraryV2Agency, DBLaunchLibraryV2Launcher, getDbLaunchLibraryV2Launches, getDbLaunchLibraryV2Agencies, getDbLaunchLibraryV2Launchers } from './database';
import { LaunchLibraryV2Launch } from './thespacedevs';


export async function createIndexHTML() {
    const htmlTemplate = readFileSync("public/index.html");

    const upcomingLaunches = await convertV2ToFrontendData(
            await getDbLaunchLibraryV2Launches(true),
            await getDbLaunchLibraryV2Agencies(),
            await getDbLaunchLibraryV2Launchers(),
        );

    const fewUpcomingLaunches = upcomingLaunches.slice(0, 30);
    
    const availableFilters = await getAvailableFilters();

    const appHtml = renderToString(<LaunchTable filters={availableFilters} launches={fewUpcomingLaunches} />);

    var htmlPage = htmlTemplate.toString();
    htmlPage = htmlPage.replace("{{app}}", appHtml);
    htmlPage = htmlPage.replace("{{fewUpcoming}}", JSON.stringify(fewUpcomingLaunches));
    htmlPage = htmlPage.replace("{{filters}}", JSON.stringify(availableFilters));

    return htmlPage;
}


export async function convertV2ToFrontendData(launches: DBLaunchLibraryV2Launch[], agencies: DBLaunchLibraryV2Agency[], launchers: DBLaunchLibraryV2Launcher[]): Promise<FrontendLaunch[]> {
    const filters = await getAvailableFilters();

    return launches.map(dbLaunch => {
        const json: LaunchLibraryV2Launch = dbLaunch.launch_library_json;

        const timestamp = Date.parse(json.net);

        var timestampResolution = TimestampResolution.SECOND;
        if (json.tbdtime) {
            timestampResolution = TimestampResolution.DAY;
        }
        if (json.tbddate) {
            timestampResolution = TimestampResolution.MONTH;
        }   
        if (json.net && json.net.endsWith("-01T00:00:00Z")) {
            timestampResolution = TimestampResolution.MONTH;
        }

        const agency = agencies.find(a => json.launch_service_provider && a.launch_library_id === json.launch_service_provider.id);

        const launcher = launchers.find(a => a.launch_library_id === json.rocket.configuration.id);


        let rocketFilterKey = "";
        for(const key of Object.keys(filters.rockets)) {
            if (json.rocket.configuration.name.toLowerCase().includes(filters.rockets[key].name.toLowerCase())) {
                rocketFilterKey = key;
                break;
            }
        }

        let rocketFlagIcon = agency ? "flag_" + agency.launch_library_json.country_code + ".png" : undefined;
        if (!rocketFlagIcon) {
            rocketFlagIcon = launcher ? "flag_" + launcher.launch_library_json.country_code + ".png" : undefined;
        }

        return {
            id: dbLaunch.id,
            timestamp: timestamp,
            yearMonth: new Date(timestamp).getFullYear() + "-" + new Date(timestamp).getMonth(),
            timestampResolution: timestampResolution,

            agencyName: json.launch_service_provider ? json.launch_service_provider.name : "",
            agencyAbbrev: agency ? agency.launch_library_json!.abbrev : "",
            agencyInfoUrl: agency ? agency.launch_library_json!.info_url : undefined,
            agencyWikiUrl: agency ? agency.launch_library_json!.wiki_url : undefined,
            agencyIcon: agency ? agencyAbbrevToIcon[agency.launch_library_json!.abbrev] : undefined,
            agencyFilterKey: agency  ? "0" + agency.launch_library_json!.abbrev : "",

            rocketName: json.rocket.configuration.name,
            rocketInfoUrl: launcher ? launcher.launch_library_json.info_url : undefined,
            rocketWikiUrl: launcher ? launcher.launch_library_json.wiki_url : undefined,
            rocketFlagIcon: rocketFlagIcon,
            rocketFilterKey: rocketFilterKey,

            payloadName: json.name.split("|")[1],
            payloadIcon: (dbLaunch.payload_type_icon && filters.payloads[dbLaunch.payload_type_icon]) ? filters.payloads[dbLaunch.payload_type_icon].icon : undefined,
            payloadFilterKey: dbLaunch.payload_type_icon,

            destinationName: dbLaunch.destination || "",
            destinationIcon: (dbLaunch.destination_icon && filters.destinations[dbLaunch.destination_icon]) ? filters.destinations[dbLaunch.destination_icon].icon : undefined,
            destinationFilterKey: dbLaunch.destination_icon,

            videoURL: (json.vidURLs && json.vidURLs.length >= 1) ? json.vidURLs[0].url : undefined,
            mapURL: json.pad!.map_url,

            
        }
    });

}


const agencyAbbrevToIcon: {[key: string]: string} = {
    "SpX": "logo_spacex.png",
    "RFSA": "roscosmos.png",
    "CASC": "china_academy.png",
    "ASA": "arianespace.png",
    "ULA": "ula.png",
    "MHI": "mhi.png",
    "JAXA": "jaxa.png",
    "ISRO": "isro.png",
    "RL": "rocketlab.png",
    "KhSC": "ksrpsc.png",
    "OA": "orbital_atk.png",
    "NASA": "nasa.png",
}
