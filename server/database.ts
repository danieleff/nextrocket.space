/**
 * Database table: 
   CREATE TABLE launch (
	id serial NOT NULL,
	launchlibrary_modified_time timestamptz NULL,
	launchlibrary_id int4 NULL,
	launchlibrary_name text NULL,
	launchlibrary_time timestamptz NULL,
	launchlibrary_json text NULL,
	data_modified_time timestamptz NULL,
	launch_time timestamptz NULL,
	launch_date_exact bool NULL,
	launch_time_exact bool NULL,
	agency text NULL,
	launch_vehicle text NULL,
	payload_type text NULL,
	payload_type_icon text NULL,
	destination text NULL,
	destination_icon text NULL,
	is_active bool NOT NULL DEFAULT true,
	PRIMARY KEY (id)
)
 */

import {Pool} from 'pg';
import { LaunchLibraryLaunch } from './launchlibrary';
import { LaunchLibraryV2Agency, LaunchLibraryV2Launch, LaunchLibraryV2Launcher } from './thespacedevs';

export type DBLaunchLibraryV2Launch = {
    id: number;
    launch_library_uuid: string;
    launch_library_update_time: string;
    launch_library_json: LaunchLibraryV2Launch;
    
    payload_type: string | null;
    payload_type_icon: string | null;
    destination: string | null;
    destination_icon: string | null;
}

export type DBLaunchLibraryV2Agency = {
    id: number;
    launch_library_id: number;
    launch_library_update_time: string;
    launch_library_json: LaunchLibraryV2Agency;
    infoUrl: string;
    wikiUrl: string;
}
export type DBLaunchLibraryV2Launcher = {
    id: number;
    launch_library_id: number;
    launch_library_update_time: string;
    launch_library_json: LaunchLibraryV2Launcher;
    infoUrl: string;
    wikiUrl: string;
}

export async function getDbLaunchLibraryV2Launches(upcoming: boolean) {
    const conn = await pool.connect();
    try {
        const response = await conn.query(`SELECT * 
          FROM launch_library_v2_launch 
          WHERE is_active 
          ${upcoming ? " AND (launch_library_json->>'net')::date >= date(now()) " : " "}
          /*ORDER BY launchlibrary_time*/`);

        const rows = response.rows as DBLaunchLibraryV2Launch[];
        return rows;
    } finally {
        conn.release();
    }
}

export async function getDbLaunchLibraryV2Agencies() {
    const conn = await pool.connect();
    try {
        const response = await conn.query(`SELECT * FROM launch_library_v2_agency`);

        const rows = response.rows as DBLaunchLibraryV2Agency[];
        return rows;
    } finally {
        conn.release();
    }
}

export async function getDbLaunchLibraryV2Launchers() {
    const conn = await pool.connect();
    try {
        const response = await conn.query(`SELECT * FROM launch_library_v2_launcher`);

        const rows = response.rows as DBLaunchLibraryV2Launcher[];
        return rows;
    } finally {
        conn.release();
    }
}

export async function updateLaunchLibraryv2DBLaunches(launches: LaunchLibraryV2Launch[], setInactiveNotFound: boolean) {
    const conn = await pool.connect();
    try {
        
        const res = await conn.query("SELECT * FROM launch_library_v2_launch");
        
        const launchLibraryIdInDb: any = {};
        for(const row of res.rows) {
            if (row.launch_library_uuid) {
                launchLibraryIdInDb[row.launch_library_uuid] = row;
            }
        }
        
        await conn.query("begin");
        
        for(const launch of launches) {
            const launchJSON = JSON.stringify(launch);

            if (launchLibraryIdInDb[launch.id]) {
                
                if (launchJSON != launchLibraryIdInDb[launch.id].launchlibrary_json) {
                    await conn.query(`UPDATE launch_library_v2_launch SET
                        launch_library_update_time = now(),  
                        launch_library_json = $1,
                        is_active = true
                        WHERE launch_library_uuid = $2`, [launchJSON, launch.id]);
                }

            } else {

                await conn.query(`INSERT INTO launch_library_v2_launch (launch_library_uuid, launch_library_update_time, launch_library_json)
                    VALUES ($1, now(), $2)`, [launch.id, launchJSON]);

            }
        }

        const launchlibraryIds = launches.map(l => "'" + l.id + "'").join(",");

        if (setInactiveNotFound && launches) {
            await conn.query(`UPDATE launch_library_v2_launch SET is_active=false 
              WHERE launch_library_uuid IS NOT NULL 
              AND launch_library_uuid NOT IN (${launchlibraryIds})`);
        }

        await conn.query("commit");

    } catch(e) {
        console.error(e);
    } finally {
        conn.release();
    }
}


export async function updateLaunchLibraryv2DBAgencies(agencies: any[], setInactiveNotFound: boolean) {
    const conn = await pool.connect();
    try {
        
        const res = await conn.query("SELECT * FROM launch_library_v2_agency");
        
        const launchLibraryIdInDb: any = {};
        for(const row of res.rows) {
            if (row.id) {
                launchLibraryIdInDb[row.id] = row;
            }
        }
        
        await conn.query("begin");
        
        for(const agency of agencies) {
            const launchJSON = JSON.stringify(agency);

            if (launchLibraryIdInDb[agency.id]) {
                
                if (launchJSON != launchLibraryIdInDb[agency.id].launchlibrary_json) {
                    await conn.query(`UPDATE launch_library_v2_agency SET
                        launch_library_update_time = now(),  
                        launch_library_json = $1,
                        is_active = true
                        WHERE launch_library_id = $2`, [launchJSON, agency.id]);
                }

            } else {

                await conn.query(`INSERT INTO launch_library_v2_agency (launch_library_id, launch_library_update_time, launch_library_json)
                    VALUES ($1, now(), $2)`, [agency.id, launchJSON]);

            }
        }

        await conn.query("commit");

    } catch(e) {
        console.error(e);
    } finally {
        conn.release();
    }
}



export async function updateLaunchLibraryv2DBLaunchers(launchers: any[], setInactiveNotFound: boolean) {
    const conn = await pool.connect();
    try {
        
        const res = await conn.query("SELECT * FROM launch_library_v2_launcher");
        
        const launchLibraryIdInDb: any = {};
        for(const row of res.rows) {
            if (row.id) {
                launchLibraryIdInDb[row.id] = row;
            }
        }
        
        await conn.query("begin");
        
        for(const launcher of launchers) {
            const launchJSON = JSON.stringify(launcher);

            if (launchLibraryIdInDb[launcher.id]) {
                
                if (launchJSON != launchLibraryIdInDb[launcher.id].launchlibrary_json) {
                    await conn.query(`UPDATE launch_library_v2_launcher SET
                        launch_library_update_time = now(),  
                        launch_library_json = $1,
                        is_active = true
                        WHERE launch_library_id = $2`, [launchJSON, launcher.id]);
                }

            } else {

                await conn.query(`INSERT INTO launch_library_v2_launcher (launch_library_id, launch_library_update_time, launch_library_json)
                    VALUES ($1, now(), $2)`, [launcher.id, launchJSON]);

            }
        }

        await conn.query("commit");

    } catch(e) {
        console.error(e);
    } finally {
        conn.release();
    }
}


export async function updateLaunchV2(launch: {id: number, payload_type_icon: string | null, destination: string | null, destination_icon: string | null}) {
    const conn = await pool.connect();
    try {
        
        await conn.query("begin");

        await conn.query(`UPDATE launch_library_v2_launch SET
            payload_type_icon = $1,  
            destination = $2,  
            destination_icon = $3
            WHERE id = $4`, [launch.payload_type_icon, launch.destination, launch.destination_icon, launch.id]);

        await conn.query("commit");

    } catch(e) {
        console.error(e);
    } finally {
        conn.release();
    }
}


/////////////////////////////////
// OLD table


const pool = new Pool({
    host: process.env.NEXTROCKET_DB_HOST,
    port: process.env.NEXTROCKET_DB_PORT ? Number(process.env.NEXTROCKET_DB_PORT) : undefined,
    database: process.env.NEXTROCKET_DB_DATABASE,
    user: process.env.NEXTROCKET_DB_USER,
    password: process.env.NEXTROCKET_DB_PASSWORD,
});

type DBLaunch = {
    id: number;
    launchlibrary_modified_time: string;
    launchlibrary_id: number;
    launchlibrary_time: string;
    launchlibrary_json: string;

    data_modified_time: string;
    
    launch_time: string;
    launch_time_exact: boolean;
    launch_date_exact: boolean;

    payload_type: string | null;
    payload_type_icon: string | null;
    destination: string | null;
    destination_icon: string | null;
    is_active: boolean;
}

export type DBLaunchParsed = DBLaunch & { launchlibrary: LaunchLibraryLaunch };

export async function getDBLaunches(upcoming: boolean) {
    const conn = await pool.connect();
    try {
        const response = await conn.query(`SELECT * 
          FROM launch 
          WHERE is_active 
          ${upcoming ? " AND date(launchlibrary_time) >= date(now()) " : " "}
          ORDER BY launchlibrary_time`);

        const rows = response.rows as DBLaunch[];

        return rows.map(row => 
            {
                return {
                    ...row, 
                    launchlibrary: JSON.parse(row.launchlibrary_json) as LaunchLibraryLaunch
                }
            }
        );
    } finally {
        conn.release();
    }
}

export async function updateDBLaunches(launches: LaunchLibraryLaunch[], setInactiveNotFound: boolean) {
    const conn = await pool.connect();
    try {
        
        const res = await conn.query("SELECT id, launchlibrary_id, launchlibrary_json FROM launch");

        const launchLibraryIdInDb: any = {};
        for(const row of res.rows) {
            if (row.launchlibrary_id) {
                launchLibraryIdInDb[row.launchlibrary_id] = row;
            }
        }
        
        await conn.query("begin");
        
        for(const launch of launches) {
            const launchJSON = JSON.stringify(launch);

            if (launchLibraryIdInDb[launch.id]) {
                
                if (launchJSON != launchLibraryIdInDb[launch.id].launchlibrary_json) {
                    await conn.query(`UPDATE launch SET
                        launchlibrary_modified_time = now(),  
                        launchlibrary_name = $1,  
                        launchlibrary_time = $2,
                        launchlibrary_json = $3,
                        is_active = true
                        WHERE launchlibrary_id = $4`, [launch.name, launch.net, launchJSON, launch.id]);
                }

            } else {

                await conn.query(`INSERT INTO launch (launchlibrary_id, launchlibrary_time, launchlibrary_name, launchlibrary_modified_time, launchlibrary_json)
                    VALUES ($1, $2, $3, now(), $4)`, [launch.id, launch.net, launch.name, launchJSON]);

            }
        }

        const launchlibraryIds = launches.map(l => l.id);

        if (setInactiveNotFound) {
            await conn.query(`UPDATE launch SET is_active=false WHERE launchlibrary_id IS NOT NULL AND launchlibrary_id NOT IN (${launchlibraryIds})`);
        }

        await conn.query("commit");

    } catch(e) {
        console.error(e);
    } finally {
        conn.release();
    }
}



export async function updateLaunch(launch: {id: number, payload_type_icon: string | null, destination: string | null, destination_icon: string | null}) {
    const conn = await pool.connect();
    try {
        
        await conn.query("begin");

        await conn.query(`UPDATE launch SET
            payload_type_icon = $1,  
            destination = $2,  
            destination_icon = $3
            WHERE id = $4`, [launch.payload_type_icon, launch.destination, launch.destination_icon, launch.id]);

        await conn.query("commit");

    } catch(e) {
        console.error(e);
    } finally {
        conn.release();
    }
}
