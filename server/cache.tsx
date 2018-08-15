import * as NodeCache from "node-cache";
import { createIndexHTML, convertToFrontendData } from "./html";
import { getDBLaunches, updateDBLaunches } from "./database";
import { FrontendLaunch } from "../client/types";
import { getLauncLibraryLaunches } from "./launchlibrary";

/**
 * Cache the html page for faster access
 */
const CACHE_INDEX_HTML_KEY = "index.html";

/**
 * Cache the launches list for faster access
 */
const CACHE_UPCOMING_LAUNCHES_KEY = "launches";

/**
 * Default cache seconds
 */
const CACHE_TTL_SECONDS = 60;

/**
 * Automatically update the cache in the background
 */
const CACHE_AUTOUPDATE_SECONDS = Math.max(CACHE_TTL_SECONDS - 60, 60);

/**
 * Update frequency of upcoming launches in our database from launchlibrary
 */
const LAUNCHLIBRARY_UPDATE_UPCOMING_SECONDS = 60 * 5;

/**
 * Update frequency of all launches in our database from launchlibrary
 */
const LAUNCHLIBRARY_UPDATE_ALL_SECONDS = 60 * 60 * 12;

const cache = new NodeCache({
    stdTTL: CACHE_TTL_SECONDS,
});


export async function getCachedIndexHTML() {
    var html = await cache.get<string>(CACHE_INDEX_HTML_KEY);
    if (!html) {
        html = await createIndexHTMLAndCache();
    }
    return html;
}

export async function getCachedUpcomingLaunches() {
    var launches = await cache.get<FrontendLaunch[]>(CACHE_UPCOMING_LAUNCHES_KEY);
    if (!launches) {
        launches = await createUpcomingLaunchesAndCache();
    }
    return launches;
}


export async function createIndexHTMLAndCache() {
    const html = await createIndexHTML();
    cache.set<string>(CACHE_INDEX_HTML_KEY, html);
    return html;
}

export async function createUpcomingLaunchesAndCache() {
    const launches = await convertToFrontendData(await getDBLaunches(true));
    cache.set<FrontendLaunch[]>(CACHE_UPCOMING_LAUNCHES_KEY, launches);
    return launches;
}


export async function startBackgroundAutoUpdates() {
    setInterval(updateCaches, CACHE_AUTOUPDATE_SECONDS * 1000);

    setInterval(updateUpcomingLaunches, LAUNCHLIBRARY_UPDATE_UPCOMING_SECONDS * 1000);
    setInterval(updateAllLaunches, LAUNCHLIBRARY_UPDATE_ALL_SECONDS * 1000);
}

function updateCaches() {
    createIndexHTMLAndCache();
    createUpcomingLaunchesAndCache();
}

async function updateUpcomingLaunches() {

    console.time("updateUpcomingLaunches download");
    const launchLibraryResponse = await getLauncLibraryLaunches(true);
    console.timeEnd("updateUpcomingLaunches download");

    console.time("updateUpcomingLaunches update");
    await updateDBLaunches(launchLibraryResponse.launches);
    console.timeEnd("updateUpcomingLaunches update");

    updateCaches();

}

async function updateAllLaunches() {

    console.time("updateAllLaunches download");
    const launchLibraryResponse = await getLauncLibraryLaunches(false);
    console.timeEnd("updateAllLaunches download");

    console.time("updateAllLaunches update");
    await updateDBLaunches(launchLibraryResponse.launches);
    console.timeEnd("updateAllLaunches update");

    updateCaches();
}
