import * as express from 'express';

import * as compression from 'compression';

import { getDBLaunches, updateLaunch } from './database';

import { getCachedIndexHTML, getCachedUpcomingLaunches, startBackgroundAutoUpdates, createIndexHTMLAndCache, createUpcomingLaunchesAndCache } from './cache';
import { convertToFrontendData } from './html';
import { config } from './config';

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
            const dbLaunches = await getDBLaunches(false);

            const frontendLaunches = await convertToFrontendData(dbLaunches);

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
            if (req.param("admin_pwd") != config.password) {
                res.sendStatus(401); // unauthorized
                return;
            }
            
            await updateLaunch(req.query);
            
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


const port = 3001;

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

startBackgroundAutoUpdates();
