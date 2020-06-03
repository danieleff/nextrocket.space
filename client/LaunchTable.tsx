import * as React from 'react';
import { AvailableFilters, FrontendLaunch, TimestampResolution } from './types';

import {launchTimeToString, formatCountdown} from './timeutils';
import Axios from 'axios';
import { LaunchRow, CountDown } from './LaunchRow';

const FILTERS_KEY = "selectedFilters";
const PREVIOUS_LAUNCHES = "previousLaunches";

type LaunchTableProps = {
    filters: AvailableFilters;
    launches: FrontendLaunch[];
}

type LaunchTableState = {
    loadingAllLaunches: boolean,
    launches: FrontendLaunch[],
    previousLaunches: {[key: number]: string},
    hoverLaunchId?: number,
    selectedFilters: {
        filtersOpen: boolean;
        lsps: string[],
        rockets: string[],
        payloads: string[],
        destinations: string[],
        uncheckedVisibility: "show" | "gray_out" | "hidden",
        filterJoin: "any" | "all",
        upcoming: boolean,
        fromDate: string,
        toDate: string,

        stickiedLaunchId?: number,
    };
}

export class LaunchTable extends React.Component<LaunchTableProps, LaunchTableState> {

    constructor(props: LaunchTableProps) {
        super(props);

        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);

        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        this.setYearMonths(this.props.launches);

        this.state = {
            loadingAllLaunches: false,
            launches: this.props.launches,
            previousLaunches: [],
            selectedFilters: {
                filtersOpen: true,
                lsps: [],
                rockets: [],
                payloads: [],
                destinations: [],
                uncheckedVisibility: "gray_out",
                filterJoin: "any",
                upcoming: true,
                fromDate: previousMonth.toISOString().substring(0,10),
                toDate: nextMonth.toISOString().substring(0,10)

            }
        }
    }

    async componentDidMount() {
        const selectedFiltersString = localStorage.getItem(FILTERS_KEY);

        if (selectedFiltersString) {

            const selectedFilters = JSON.parse(selectedFiltersString);

            const previousMonth = new Date();
            previousMonth.setMonth(previousMonth.getMonth() - 1);

            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            if (selectedFilters.upcoming || !selectedFilters.fromDate) {
                selectedFilters.fromDate = previousMonth.toISOString().substring(0,10);
            }
            
            if (selectedFilters.upcoming || !selectedFilters.toDate) {
                selectedFilters.toDate = nextMonth.toISOString().substring(0,10);
            }
            
            this.setState({
                selectedFilters 
            });
        }

        const launches = (await Axios.get<FrontendLaunch[]>("/api/launches_upcoming")).data;
        this.setYearMonths(launches);
        
        var previousLaunches = {};
        if (typeof localStorage !== 'undefined') {
            try {
                const previousLaunchesString = localStorage.getItem(PREVIOUS_LAUNCHES);
                
                const prev: {[launchId: number]: string} = {};
                for(const l of launches) {
                    prev[l.id] = launchTimeToString(l);
                }
                localStorage.setItem(PREVIOUS_LAUNCHES, JSON.stringify(prev));

                if (previousLaunchesString) {
                    previousLaunches = JSON.parse(previousLaunchesString);
                }
            } catch(e){console.error(e)}
        }

        this.setState({
            launches,
            previousLaunches
        });
    }

    async componentDidUpdate() {
        localStorage.setItem(FILTERS_KEY, JSON.stringify(this.state.selectedFilters));

        if (!this.state.selectedFilters.upcoming && !this.state.loadingAllLaunches) {
            this.reloadAllLaunches();
        }
    }
    
    private async reloadAllLaunches() {
        this.setState({loadingAllLaunches: true});

        const launches = (await Axios.get<FrontendLaunch[]>("/api/launches_all")).data;
        
        this.setYearMonths(launches);

        this.setState({launches});
    }

    private setYearMonths(launches: FrontendLaunch[]) {
        for(const launch of launches) {
            const timestamp = launch.timestamp;
            launch.yearMonth = new Date(timestamp).getFullYear() + "-" + new Date(timestamp).getMonth()
        }
    }

    private getLaunches() {
        if (this.state.selectedFilters.upcoming) {
            const fromMillis = new Date().getTime();
            
            return this.state.launches.filter(l => l.timestamp >= fromMillis);

        } else {
            const fromMillis = new Date(this.state.selectedFilters.fromDate).getTime();
            const toMillis = new Date(this.state.selectedFilters.toDate).getTime();

            return this.state.launches.filter(l => l.timestamp >= fromMillis && l.timestamp <= toMillis);

        }
    }

    render() {
        var filterCounts: {[filterKey: string]: number} = {};

        const filteredLaunches = this.getLaunches().filter(this.isLaunchSelected.bind(this));
        for(const launch of filteredLaunches) {
            if (this.isLaunchSelected(launch)) {
                filterCounts[launch.agencyFilterKey] = filterCounts[launch.agencyFilterKey] ? filterCounts[launch.agencyFilterKey] + 1 : 1;
                filterCounts[launch.rocketFilterKey] = filterCounts[launch.rocketFilterKey] ? filterCounts[launch.rocketFilterKey] + 1 : 1;
                filterCounts[launch.payloadFilterKey] = filterCounts[launch.payloadFilterKey] ? filterCounts[launch.payloadFilterKey] + 1 : 1;
                filterCounts[launch.destinationFilterKey] = filterCounts[launch.destinationFilterKey] ? filterCounts[launch.destinationFilterKey] + 1 : 1;
            }
        }

        var offset = new Date().getTimezoneOffset();
        var tz = "-";
        if (offset < 0) {
            offset = -offset;
            tz = "+";
        }
        tz += ("0" + (offset / 60)).slice(-2);
        tz += ("0" + (offset % 60)).slice(-2);

        var hoverLaunch = this.state.launches.find(l => l.id == this.state.hoverLaunchId);
        var stickiedLaunch = this.state.launches.find(l => l.id == this.state.selectedFilters.stickiedLaunchId);

        var launchInHeader = hoverLaunch || stickiedLaunch;

        return <div>
        <header className="header">
            <div className="header__title_wrapper">
                <div className="header__title">
                    <a href="http://nextrocket.space">
                        <span style={{color: "#b40000"}}>nextrocket</span>.space
                    </a>
                </div>
                <span className="header__subtitle">
                    List of upcoming rocket launches to space
                </span>
            </div>
            <div className="header__countdown">
                {
                    launchInHeader
                    ?
                    <span>
                        <CountDown launch={launchInHeader} />
                    </span>
                    :
                    null
                }
            </div>
            <div className="header__details">
                {
                    launchInHeader
                    ?
                    <span>
                        {launchInHeader.agencyName} - {launchInHeader.rocketName}<br/>
                        {launchInHeader.payloadName} - {launchInHeader.destinationName}
                    </span>
                    :
                    null
                }
            </div>
        </header>

        <table id="launch_table" className={"launch_table " + (this.state.selectedFilters.uncheckedVisibility == "gray_out" ? "gray_out_unselected" : "")}>
            <colgroup>
                <col style={{ width: "13em", fontSize: "small" }} />
                <col style={{ width: "14em", fontSize: "small"  }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "22px" }} />
                <col style={{ width: "22px" }} />
                {
                    typeof location !== 'undefined' && location.search.includes("admin_pwd")
                    ?
                    <col style={{ width: "8em" }} />
                    :
                    null
                }
            </colgroup>
            <thead>
                <tr id="filter-header" style={{cursor: "pointer"}} onClick={() => this.setState({selectedFilters: {...this.state.selectedFilters, filtersOpen: !this.state.selectedFilters.filtersOpen}})}>
                    <th>
                        <span style={{float:"left", padding:"0 0 2px 2px"}} className="filter_icon">
                            {
                                this.state.selectedFilters.filtersOpen ? "▼" : "▲"
                            }
                        </span>
                        Countdown
                    </th>
                    <th id="date_header">
                        {typeof window !== 'undefined' ? "Local time (" + tz + ")" : "Time"}
                    </th>
                    <th style={{overflow: "hidden", textOverflow: "ellipsis"}}>Launch&nbsp;Service&nbsp;Provider</th>
                    <th>Launch vehicle</th>
                    <th>Payload</th>
                    <th>Destination</th>
                    <th></th>
                    <th></th>
                </tr>

                <tr id="filter" 
                    className={this.isFiltering() ? "gray_out_selections" : undefined}
                        style={{display: this.state.selectedFilters.filtersOpen ? undefined : "none", padding: "0px", whiteSpace: "nowrap", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis"}}>
                    <th style={{textAlign: "left", padding: "0px", verticalAlign: "top"}} colSpan={2}>
                        <div id="filters_left" style={{margin: "0.5em"}} className="filter_row"> 
                            Filter by date:<br/> 
                            <label>
                                <input onChange={() => this.setState({selectedFilters: {...this.state.selectedFilters, upcoming:true}})} 
                                    checked={this.state.selectedFilters.upcoming} 
                                    value="yes" 
                                    type="radio"/>Upcoming
                            </label>
                            <br/> 
                            <label>
                                <input onChange={() => this.setState({selectedFilters: {...this.state.selectedFilters, upcoming:false}})} 
                                    checked={!this.state.selectedFilters.upcoming} 
                                    value="no" 
                                    type="radio"/>Date range:
                                <br />
                                <input onChange={(e) => this.setState({selectedFilters: {...this.state.selectedFilters, fromDate: e.target.value}})} 
                                    type="date"
                                    disabled={this.state.selectedFilters.upcoming}
                                    value={this.state.selectedFilters.fromDate} />
                                &nbsp;-&nbsp;
                                <input onChange={(e) => this.setState({selectedFilters: {...this.state.selectedFilters, toDate: e.target.value}})} 
                                    type="date" 
                                    disabled={this.state.selectedFilters.upcoming}
                                    value={this.state.selectedFilters.toDate} />
                            </label>
                            <br/> 
                            <br/>
                            Unselected launches:
                            <br/> 
                            <label>
                                <input type="radio"
                                    value="show"
                                    checked={this.state.selectedFilters.uncheckedVisibility == "show"}
                                    onChange={() => this.setState({selectedFilters: {...this.state.selectedFilters, uncheckedVisibility: "show"}})} />
                                show
                            </label>
                            <br/> 
                            <label>
                                <input type="radio"
                                    value="gray_out"
                                    checked={this.state.selectedFilters.uncheckedVisibility == "gray_out"}
                                    onChange={() => this.setState({selectedFilters: {...this.state.selectedFilters, uncheckedVisibility: "gray_out"}})} />
                                gray out
                            </label>
                            <br/> 
                            <label>
                                <input type="radio"
                                    value="hidden"
                                    checked={this.state.selectedFilters.uncheckedVisibility == "hidden"}
                                    onChange={() => this.setState({selectedFilters: {...this.state.selectedFilters, uncheckedVisibility: "hidden"}})} />
                                hide 
                            </label>
                            <br/>
                            <br/>
                            Filter combination:
                            <br/> 
                            <label>
                                <input type="radio"
                                    value="any"
                                    checked={this.state.selectedFilters.filterJoin == "any"}
                                    onChange={() => this.setState({selectedFilters: {...this.state.selectedFilters, filterJoin: "any"}})} />
                                Any
                            </label>
                            <br/> 
                            <label>
                                <input type="radio"
                                    value="all"
                                    checked={this.state.selectedFilters.filterJoin == "all"}
                                    onChange={() => this.setState({selectedFilters: {...this.state.selectedFilters, filterJoin: "all"}})} />
                                All
                            </label>
                            <br/>
                            </div>
                    </th>
                    <td style={{verticalAlign: "top"}}>
                        <div className="filter_row">
                            {this.getFilterRows(this.props.filters.lsps, this.state.selectedFilters.lsps, filterCounts)}
                        </div>
                    </td>
                    <td style={{verticalAlign: "top"}}>
                        <div className="filter_row">
                            {this.getFilterRows(this.props.filters.rockets, this.state.selectedFilters.rockets, filterCounts)}
                        </div>
                    </td>
                    <td style={{verticalAlign: "top"}}>
                        <div className="filter_row">
                            {this.getFilterRows(this.props.filters.payloads, this.state.selectedFilters.payloads, filterCounts)}
                        </div>
                    </td>
                    <td style={{verticalAlign: "top"}}>
                        <div className="filter_row">
                            {this.getFilterRows(this.props.filters.destinations, this.state.selectedFilters.destinations, filterCounts)}
                        </div>
                    </td>
                    <td></td>
                    <td></td>
                </tr>
            </thead>
            <tbody>
                {
                    this.getLaunchRows()
                }
            </tbody>
        </table>
        </div>;
    }

    private getFilterRows(filters: {[key: string]: {name: string, icon: string}}, selectedFilters: string[], filterCounts: {[filterKey: string]: number}) {
        
        return Object.keys(filters).map(filterKey => {
            const value = filters[filterKey];
            const checked = selectedFilters.includes(filterKey);

            var matchCount: string | number = filterCounts[filterKey];
            if (!matchCount) {
                matchCount = '\u00A0\u00A0';
            } else {
                if (matchCount < 10) matchCount = '\u00A0' + matchCount;
            }

            return <label className={"filter " + (checked ? "checked" : "")} key={filterKey} onClick={this.onFilterClicked.bind(this, selectedFilters, filterKey)}>
                <span className="selection_count">
                    {matchCount}
                </span>
                { 
                    value.icon
                    ?
                    <img className="icon" src={"images/" + value.icon}/>
                    :
                    null
                }
                <span title={value.name}>{value.name}</span>
            </label>
        })
    }

    private onFilterClicked(selectedFilters: string[], key: string) {
        if (selectedFilters.includes(key)) {
            selectedFilters.splice(selectedFilters.indexOf(key), 1);
        } else {
            selectedFilters.push(key);
        }

        this.setState({selectedFilters: this.state.selectedFilters});
    }

    private isFiltering() {
        return this.state.selectedFilters.lsps.length > 0
            || this.state.selectedFilters.rockets.length > 0
            || this.state.selectedFilters.destinations.length > 0
            || this.state.selectedFilters.payloads.length > 0
    }

    private matches(launch: FrontendLaunch, filterKey: string) {
        if (filterKey[0] == '0') {
            return filterKey == launch.agencyFilterKey;
        }
        if (filterKey[0] == '1') {
            return filterKey == launch.rocketFilterKey;
        }
        if (filterKey[0] == '2') {
            return filterKey == launch.payloadFilterKey;
        }
        if (filterKey[0] == '3') {
            return filterKey == launch.destinationFilterKey;
        }
    }

    private isLaunchSelected(launch: FrontendLaunch) {
        if (this.state.selectedFilters.lsps.length == 0
            && this.state.selectedFilters.rockets.length == 0
            && this.state.selectedFilters.payloads.length == 0
            && this.state.selectedFilters.destinations.length == 0
            ) {
            return true;
        }

        if (this.state.selectedFilters.filterJoin == "all") {

            const lsp = this.state.selectedFilters.lsps.length == 0
                || this.state.selectedFilters.lsps.some(filterKey => this.matches(launch, filterKey));

            const rocket = this.state.selectedFilters.rockets.length == 0
                || this.state.selectedFilters.rockets.some(filterKey => this.matches(launch, filterKey));

            const payload = this.state.selectedFilters.payloads.length == 0
                || this.state.selectedFilters.payloads.some(filterKey => this.matches(launch, filterKey));

            const destination = this.state.selectedFilters.destinations.length == 0
                || this.state.selectedFilters.destinations.some(filterKey => this.matches(launch, filterKey));

            return lsp && rocket && payload && destination;
        } else {
            const lsp = this.state.selectedFilters.lsps.some(filterKey => this.matches(launch, filterKey));

            const rocket = this.state.selectedFilters.rockets.some(filterKey => this.matches(launch, filterKey));

            const payload = this.state.selectedFilters.payloads.some(filterKey => this.matches(launch, filterKey));

            const destination = this.state.selectedFilters.destinations.some(filterKey => this.matches(launch, filterKey));

            return lsp || rocket || payload || destination;
        }
        
    }

    private getLaunchRows() {
        var filteredLaunches = this.getLaunches().sort((a, b) => {
            if (a.timestampResolution != b.timestampResolution && a.yearMonth == b.yearMonth) {
                return a.timestampResolution - b.timestampResolution;
            }
            if (a.timestamp - b.timestamp != 0) return a.timestamp - b.timestamp;
            return a.id - b.id;
        });

        if (this.state.selectedFilters.uncheckedVisibility == "hidden") {
            filteredLaunches = filteredLaunches.filter(this.isLaunchSelected.bind(this));
        }

        var counter = 0;
        var prevDate:Date;

        return filteredLaunches.map(launch => {
            counter++;

            const date = new Date(launch.timestamp);


            var className="launch ";

            if (counter % 2 == 0) className += " odd ";

            if (!this.isLaunchSelected(launch)) className += " unselected ";

            if (!prevDate || prevDate.getFullYear() != date.getFullYear()) {
                className += " launch_table__row--new_year ";
            } else if (prevDate && (prevDate.getMonth() != date.getMonth() || prevDate.getFullYear() != date.getFullYear())) {
                className += " launch_table__row--new_month ";
            }
            
            prevDate = date;

            return <LaunchRow 
                key={launch.id}
                launch={launch}
                className={className}
                previousLaunchTimeString={ Object.keys(this.state.previousLaunches).length > 0 ? this.state.previousLaunches[launch.id] : undefined }
                destinations={this.props.filters.destinations}
                payloads={this.props.filters.payloads}
                onReload={this.reloadAllLaunches.bind(this)}

                onMouseOver={this.onMouseOverLaunch.bind(this)}
                onMouseOut={this.onMouseOutLaunch.bind(this)}
                onSelect={this.onStickyLaunch.bind(this)}

                isStickied={launch.id == this.state.selectedFilters.stickiedLaunchId || launch.id == this.state.hoverLaunchId}

            />;
        });
    }

    private onMouseOverLaunch(launcId: number) {
        this.setState({hoverLaunchId: launcId});
    }

    private onMouseOutLaunch() {
        this.setState({hoverLaunchId: undefined});
    }

    private onStickyLaunch(launchId: number) {
        if (this.state.selectedFilters.stickiedLaunchId == launchId) {
            this.setState({
                selectedFilters: {...this.state.selectedFilters, stickiedLaunchId: undefined}
            });
        } else {
            this.setState({
                selectedFilters: {...this.state.selectedFilters, stickiedLaunchId: launchId}
            });
        }
    }

}
