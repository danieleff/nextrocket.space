import * as express from 'express';

import * as compression from 'compression';

import { getDBLaunches, DBLaunchParsed } from './database';

import { LaunchTable } from '../ts/LaunchTable';
/*
import { FrontendLaunch, TimestampResolution } from '../client/types';
*/
import { getCachedIndexHTML, getCachedUpcomingLaunches, startBackgroundAutoUpdates } from './cache';
import { convertToFrontendData } from './html';

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


app.use("/css", express.static('public/css',       { maxAge:                60 * 1000 }));
app.use("/images", express.static('public/images', { maxAge:      24 * 60 * 60 * 1000 }));
app.use("/js", express.static('public/js',         { maxAge: 31 * 24 * 60 * 60 * 1000 }));


const port = 3001;

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

startBackgroundAutoUpdates();
