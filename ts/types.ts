export enum TimestampResolution {
    SECOND,
    DAY,
    MONTH
}

export type FrontendLaunch = {
    id: number;
    
    timestamp: number;
    yearMonth: string;
    timestampResolution: TimestampResolution;

    agencyName: string;
    agencyAbbrev: string;
    agencyInfoUrl?: string;
    agencyWikiUrl?: string;
    agencyIcon?: string;
    agencyFilterKey: string;

    rocketName: string;
    rocketInfoUrl?: string;
    rocketWikiUrl?: string;
    rocketFlagIcon?: string;
    rocketFilterKey: string;

    payloadName?: string;
    payloadIcon?: string;
    payloadFilterKey: string;

    destinationName?: string;
    destinationIcon?: string;
    destinationFilterKey: string;
    
    mapURL?: string;
    videoURL?: string;
}

export type AvailableFilters = {
    lsps: {[key: string]: {name: string, icon: string}},
    rockets: {[key: string]: {name: string, icon: string}},
    payloads: {[key: string]: {name: string, icon: string}},
    destinations: {[key: string]: {name: string, icon: string}}
}

export type UserFilters = {

}
