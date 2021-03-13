import Axios from "axios";

import { AvailableFilters } from "../client/types";

export type LaunchLibraryLaunch = {
    id: number;
    name: string;
    net: string;
    tbdtime: 0 | 1;
    tbddate: 0 | 1;
    isostart: string,
    lsp?: {
        abbrev: string;
        name: string;
        infoURL: string | null;
        wikiURL: string | null;
        countryCode: string | null;
    };
    rocket: {
        name: string;
        infoURLs: string[];
        wikiURL: string | null;
        familyname: string;
        configuration: string;
        agencies: {
            countryCode: string
        }[]
    };
    location: {
        pads: {
            mapURL: string
        }[]
    }
    missions: {
        name: string;
    }[],
    vidURLs: string[];
}

type LauncLibraryResponse = {
    launches: LaunchLibraryLaunch[];
    total: number;
    offset: number;
    count: number;
}

export async function getLauncLibraryLaunches(upcoming: boolean): Promise<LauncLibraryResponse> {

    var url = "";
    if (upcoming) {

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        var url = `https://launchlibrary.net/1.4/launch?startdate=${new Date().toISOString().substring(0,10)}&enddate=${endDate.toISOString().substring(0,10)}&limit=100000&mode=verbose`;
        
    } else {
        var url = `https://launchlibrary.net/1.4/launch?startdate=1900-01-01&enddate=2100-09-20&limit=100000&mode=verbose`;
    }
    
    const response = await Axios.get<LauncLibraryResponse>(url, {
        headers: {
            "user-agent": "nextrocket.space danieleff@gmail.com"
        }
    });
    const data = response.data;

    return data;
}

export async function getAvailableFilters(): Promise<AvailableFilters> {
    return { lsps: {
        "0ASA": {name: "Arianespace",icon: "arianespace.png"},
        "0CASIC": {name: "China Aerospace Science and Industry Corporation",icon: ""},
        "0CASC": {name: "China Aerospace Science and Technology Corporation",icon: "china_academy.png"},
        "0GK": {name: "GK Launch Services JV",icon: ""},
        "0ISRO": {name: "Indian Space Research Organization",icon: "isro.png"},
        "0ILS": {name: "International Launch Services",icon: "arianespace.png"},
        "0JAXA": {name: "Japan Aerospace Exploration Agency",icon: "jaxa.png"},
        "0KhSC": {name: "Khrunichev State Research and Production Space Center",icon: "ksrpsc.png"},
        "0LL": {name: "Land Launch",icon: ""},
        "0MHI": {name: "Mitsubishi Heavy Industries",icon: "mhi.png"},
        "0NASA": {name: "National Aeronautics and Space Administration",icon: "nasa.png"},
        "0NGIS": {name: "Northrop Grumman Innovation Systems",icon: ""},
        "0RL": {name: "Rocket Lab Ltd",icon: "rocketlab.png"},
        "0RFSA": {name: "Russian Federal Space Agency (ROSCOSMOS)",icon: "roscosmos.png"},
        "0VKS": {name: "Russian Space Forces",icon: "arianespace.png"},
        "0SpX": {name: "SpaceX",icon: "logo_spacex.png"},
        "0ULA": {name: "United Launch Alliance",icon: "ula.png"},
        "0VEC": {name: "Vector",icon: ""},
        "0VO": {name: "Virgin Orbit",icon: ""},
    },
    rockets: {
        "1g": {name: "Antares", icon: ""},
        "1e": {name: "Ariane", icon: ""},
        "1f": {name: "Atlas", icon: ""},
        "1d": {name: "Delta", icon: ""},
        "1a": {name: "Falcon 9", icon: ""},
        "1b": {name: "Falcon Heavy", icon: ""},
        "1i": {name: "GSLV", icon: ""},
        "1h": {name: "Long March", icon: ""},
        "1m": {name: "Proton", icon: ""},
        "1k": {name: "PSLV", icon: ""},
        "1n": {name: "Rokot", icon: ""},
        "1l": {name: "Soyuz", icon: ""},
        "1j": {name: "Vega", icon: ""},
        "1o": {name: "SLS", icon: ""},
    },
    payloads: {
        "2a": {name: "Test flight", icon: "test.png"},
        "2b": {name: "Communications satellite", icon: "satellite.png"},
        "2c": {name: "Earth observing satellite", icon: "earth_satellite.png"},
        "2d": {name: "Weather satellite", icon: "weather_satellite.png"},
        "2e": {name: "Scientific probe", icon: "probe.png"},
        "2f": {name: "Crewed spacecraft", icon: "manned.png"},
        "2g": {name: "Automated cargo spacecraft", icon: "cargo.png"},
        "2h": {name: "Cubesat rideshare", icon: "cubesat.png"},
        "2i": {name: "Navigation satellite", icon: "navigation.png"},
        "2j": {name: "Classified / military", icon: "classified.png"},
    },
    destinations: {
        "3a": {name: "LEO", icon: "leo.png"},
        "3b": {name: "MEO", icon: "meo.png"},
        "3c": {name: "GEO", icon: "geo.png"},
        "3d": {name: "ISS", icon: "iss.png"},
        "3e": {name: "Tianhe", icon: "tiangong-2.png"},
        "3f": {name: "Moon", icon: "moon.png"},
        "3g": {name: "Mars", icon: "mars.png"},
        "3i": {name: "Mercury", icon: "mercury.png"},
        "3j": {name: "Jupiter", icon: "jupiter.png"},
        "3k": {name: "Sun", icon: "sun.png"},
        "3h": {name: "Asteroid", icon: "asteroid.png"},
    }
    };
}
