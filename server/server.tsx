import * as express from 'express';

import * as compression from 'compression';

import { getDbLaunchLibraryV2Agencies, getDbLaunchLibraryV2Launchers, getDbLaunchLibraryV2Launches, updateLaunchV2 } from './database';

import { getCachedIndexHTML, getCachedUpcomingLaunches, startBackgroundAutoUpdates, createIndexHTMLAndCache, createUpcomingLaunchesAndCache } from './cache';
import { convertV2ToFrontendData } from './html';

// Node 15+ exits on an unhandled promise rejection; Node 12 (which this app
// ran on for years) only logged it. Keep the server up and log instead.
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
});

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
            if (req.query.admin_pwd != process.env.NEXTROCKET_ADMIN_PASSWORD) {
                res.sendStatus(401); // unauthorized
                return;
            }
            
            await updateLaunchV2(req.query as any);
            
            await createIndexHTMLAndCache();
            await createUpcomingLaunchesAndCache();

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
