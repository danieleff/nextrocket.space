import { readFileSync } from 'fs';
import { getAvailableFilters } from './launchlibrary';

import * as React from 'react';
import { renderToString } from "react-dom/server";

import { FrontendLaunch, TimestampResolution } from '../client/types';
import { LaunchTable } from '../client/LaunchTable';
import { getDBLaunches, DBLaunchParsed, DBLaunchLibraryV2Launch, DBLaunchLibraryV2Agency, DBLaunchLibraryV2Launcher, getDbLaunchLibraryV2Launches, getDbLaunchLibraryV2Agencies, getDbLaunchLibraryV2Launchers } from './database';
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


export async function convertToFrontendData(launches: DBLaunchParsed[]) {
    const filters = await getAvailableFilters();

    return launches.map((dbLaunch): FrontendLaunch => {
        const launchlibrary = dbLaunch.launchlibrary;

        if (!launchlibrary || !launchlibrary.rocket) {
            return null;
        }

        let timestamp = Date.parse(launchlibrary.net);
        var timestampResolution = TimestampResolution.SECOND;

        if (launchlibrary.tbdtime == 1) {
            timestampResolution = TimestampResolution.DAY;
        }
        if (launchlibrary.tbddate == 1) {
            timestampResolution = TimestampResolution.MONTH;
        }

        if (launchlibrary.isostart && launchlibrary.isostart.endsWith("T000000Z")) {
            timestampResolution = TimestampResolution.MONTH;
        }

        if (launchlibrary.net && !launchlibrary.net.endsWith("00:00Z")) {
            timestampResolution = TimestampResolution.SECOND;
        }

        try {

            if (dbLaunch.data_modified_time && 
                dbLaunch.launchlibrary_modified_time &&
                Date.parse(dbLaunch.data_modified_time) > Date.parse(dbLaunch.launchlibrary_modified_time)) {
                    
                if (dbLaunch.launch_time) timestamp = Date.parse(dbLaunch.launch_time);
                if (dbLaunch.launch_date_exact) timestampResolution = TimestampResolution.DAY;
                if (dbLaunch.launch_time_exact) timestampResolution = TimestampResolution.SECOND;
            }
        } catch(e) {}

        var rocketFilterKey = "";
        for(const key of Object.keys(filters.rockets)) {
            if (launchlibrary.rocket.name.toLowerCase().includes(filters.rockets[key].name.toLowerCase())) {
                rocketFilterKey = key;
                break;
            }
        }

        var mapURL = undefined;
        if (launchlibrary.location && launchlibrary.location.pads && launchlibrary.location.pads.length > 0) {
            mapURL = launchlibrary.location.pads[0].mapURL;
        }
        
        var rocketFlagIcon = launchlibrary.rocket.agencies && launchlibrary.rocket.agencies.length >= 1 ? "flag_" + launchlibrary.rocket.agencies[0].countryCode + ".png" : undefined;
        if (!rocketFlagIcon) {
            rocketFlagIcon = launchlibrary.lsp ? "flag_" + launchlibrary.lsp.countryCode + ".png" : undefined
        }

        return {
            id: dbLaunch.id,
            timestamp: timestamp,
            yearMonth: new Date(timestamp).getFullYear() + "-" + new Date(timestamp).getMonth(),
            timestampResolution: timestampResolution,

            agencyName: launchlibrary.lsp ? launchlibrary.lsp.name : "",
            agencyAbbrev: launchlibrary.lsp ? launchlibrary.lsp.abbrev : "",
            agencyInfoUrl: launchlibrary.lsp ? launchlibrary.lsp.infoURL : undefined,
            agencyWikiUrl: launchlibrary.lsp ? launchlibrary.lsp.wikiURL : undefined,
            agencyIcon: launchlibrary.lsp ? agencyAbbrevToIcon[launchlibrary.lsp.abbrev] : undefined,
            agencyFilterKey: launchlibrary.lsp ? "0" + launchlibrary.lsp.abbrev : "",

            rocketName: launchlibrary.rocket && launchlibrary.rocket.name || "",
            rocketInfoUrl: launchlibrary.rocket.infoURLs && launchlibrary.rocket.infoURLs.length > 0 ? launchlibrary.rocket.infoURLs[0] : undefined,
            rocketWikiUrl: launchlibrary.rocket.wikiURL || undefined,
            rocketFlagIcon: rocketFlagIcon,
            rocketFilterKey: rocketFilterKey,

            payloadName: launchlibrary.name.split("|")[1],
            payloadIcon: (dbLaunch.payload_type_icon && filters.payloads[dbLaunch.payload_type_icon]) ? filters.payloads[dbLaunch.payload_type_icon].icon : undefined,
            payloadFilterKey: dbLaunch.payload_type_icon,

            destinationName: dbLaunch.destination || "",
            destinationIcon: (dbLaunch.destination_icon && filters.destinations[dbLaunch.destination_icon]) ? filters.destinations[dbLaunch.destination_icon].icon : undefined,
            destinationFilterKey: dbLaunch.destination_icon,

            videoURL: (launchlibrary.vidURLs && launchlibrary.vidURLs.length >= 1) ? launchlibrary.vidURLs[0] : undefined,
            mapURL:  mapURL,
        }
    }).filter(x => x);
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
