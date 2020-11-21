import * as express from 'express';

import * as compression from 'compression';

import { getDBLaunches, getDbLaunchLibraryV2Agencies, getDbLaunchLibraryV2Launchers, getDbLaunchLibraryV2Launches, updateLaunch, updateLaunchV2 } from './database';

import { getCachedIndexHTML, getCachedUpcomingLaunches, startBackgroundAutoUpdates, createIndexHTMLAndCache, createUpcomingLaunchesAndCache } from './cache';
import { convertToFrontendData, convertV2ToFrontendData } from './html';

const app = express();
app.use(compression());

app.get('/', 
    async (req, res) => {
        try {
            const htmlPage = await getCachedIndexHTML();

            res.send(htmlPage);

        } catch(e) {
            console.log(e);
            res.send(e);
        }
    }
);
app.get('/api/launches_upcoming', 
    async (req, res) => {
        try {
            const frontendLaunches = await getCachedUpcomingLaunches();

            res.send(frontendLaunches);
        } catch(e) {
            res.send(e);
        }
    }
);
app.get('/api/launches_all', 
    async (req, res) => {
        try {
            const dbLaunches = await getDbLaunchLibraryV2Launches(false);
            const dbAgencies = await getDbLaunchLibraryV2Agencies();
            const dbLaunchers = await getDbLaunchLibraryV2Launchers();

            const frontendLaunches = await convertV2ToFrontendData(dbLaunches, dbAgencies, dbLaunchers);

            res.send(frontendLaunches);
        } catch(e) {
            console.error(e);
            res.sendStatus(500);
        }
    }
);
app.get('/api/update', 
    async (req, res) => {
        try {
            if (req.param("admin_pwd") != process.env.NEXTROCKET_ADMIN_PASSWORD) {
                res.sendStatus(401); // unauthorized
                return;
            }
            
            await updateLaunchV2(req.query);
            
            createIndexHTMLAndCache();
            createUpcomingLaunchesAndCache();

            res.send({success: true});
        } catch(e) {
            console.error(e);
            res.sendStatus(500);
        }
    }
);

app.use("/images", express.static('public/images', { maxAge:      24 * 60 * 60 * 1000 }));
app.use("/static", express.static('public/static',         { maxAge: 31 * 24 * 60 * 60 * 1000 }));


const port = 3000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

startBackgroundAutoUpdates();
