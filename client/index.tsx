
import { LaunchTable }  from './LaunchTable';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { AvailableFilters, FrontendLaunch } from './types';

import './index.css';

declare global {
    interface Window {
        filters: AvailableFilters;
        fewUpcoming: FrontendLaunch[];
    }
}


export async function start() {
    
    ReactDOM.render(<LaunchTable filters={window.filters} launches={window.fewUpcoming}/>, document.getElementById("app"));

}

start();
