import { readFileSync } from 'fs';
import { getAvailableFilters } from './launchlibrary';

import * as React from 'react';
import { renderToString } from "react-dom/server";

import { FrontendLaunch, TimestampResolution } from '../client/types';
import { LaunchTable } from '../client/LaunchTable';
import { getDBLaunches, DBLaunchParsed } from './database';


export async function createIndexHTML() {
    const htmlTemplate = readFileSync("public/index.html");

    const upcomingLaunches = await convertToFrontendData(await getDBLaunches(true));

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

        const timestamp = Date.parse(launchlibrary.net);
        var timestampResolution = TimestampResolution.SECOND;

        if (launchlibrary.tbdtime == 1) {
            timestampResolution = TimestampResolution.DAY;
        }
        if (launchlibrary.tbddate == 1) {
            timestampResolution = TimestampResolution.MONTH;
        }

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
