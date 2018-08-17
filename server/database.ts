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
import { config } from './config';
import { LaunchLibraryLaunch } from './launchlibrary';

const pool = new Pool(config.pg);

type DBLaunch = {
    id: number;
    launchlibrary_modified_time: string;
    launchlibrary_id: number;
    launchlibrary_time: string;
    launchlibrary_json: string;

    data_modified_time: string;
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

export async function updateDBLaunches(launches: LaunchLibraryLaunch[]) {
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
