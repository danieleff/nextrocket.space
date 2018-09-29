import * as React from 'react';
import { FrontendLaunch, TimestampResolution } from './types';
import { formatCountdown, launchTimeToString } from './timeutils';
import * as queryString from 'query-string';
import Axios from 'axios';
import { WikipediaPanel } from './WikipediaPanel';

type LaunchRowProps = {
    launch: FrontendLaunch;
    previousLaunchTimeString?: string;
    className: string;

    destinations: {[key: string]: {name: string, icon: string}};
    payloads: {[key: string]: {name: string, icon: string}};

    onReload: () => void,
    onMouseOver: (launchId: number) => void,
    onMouseOut: () => void,
    onSelect: (launchId: number) => void,

    isStickied: boolean
}

type LaunchRowState = {
    editing: boolean;

    destination: string;
    payloadIcon: string;
    destinationIcon: string;
    
    showLspWipedia: boolean;
    showRocketWipedia: boolean;
}

export class LaunchRow extends React.Component<LaunchRowProps, LaunchRowState> {

    constructor(props: LaunchRowProps) {
        super(props);

        this.state = {
            editing: false,
            destination: this.props.launch.destinationName || "",
            payloadIcon: this.props.launch.payloadFilterKey || "",
            destinationIcon: this.props.launch.destinationFilterKey || "",
            showLspWipedia: false,
            showRocketWipedia: false
        }
    }

    async onSave() {
        const params = queryString.parse(location.search);

        var url = "/api/update?" + queryString.stringify({
            admin_pwd: params.admin_pwd,
            id: this.props.launch.id,
            payload_type_icon: this.state.payloadIcon || null,
            destination: this.state.destination || null,
            destination_icon: this.state.destinationIcon || null,
        });

        await Axios.get(url);

        this.props.onReload();
    }

    render() {
        const launch = this.props.launch;

        const launchTimeString = launchTimeToString(launch);
        
        var previousIcon = <i className="fa fa-fw"></i>;

        const previousLaunchString = this.props.previousLaunchTimeString;

        if (typeof previousLaunchString !== 'undefined') {
            if (!previousLaunchString) {
                previousIcon = <i className="fa fa-fw fa-plus-circle" title="Launch added since previous visit" style={{color: "MediumBlue"}}></i>
            } else if (launchTimeString != previousLaunchString) {
                previousIcon = <i className="fa fa-fw fa-arrow-circle-down" title={"Launch date changed from '" + previousLaunchString.trim() + "' since previous visit"} style={{color: "red"}}></i>
            }
        }

        var rocketImage = null;

        if (launch.rocketName == "Ariane 5 ECA") rocketImage = "Ariane_5_ECA (2).png";
        if (launch.rocketName == "Atlas V 551") rocketImage = "Atlas_V_551 (2).png";
        if (launch.rocketName == "GSLV Mk III") rocketImage = "GSLV_Mk_III (2).png";
        if (launch.rocketName == "H-IIA 202") rocketImage = "H-IIA_202 (2).png";
        if (launch.rocketName == "Long March 3B") rocketImage = "Long_March_3B (2).png";
        if (launch.rocketName == "Soyuz FG Crew") rocketImage = "Soyuz_FG_Crew (2).png";

        return <tr className={this.props.className} key={launch.id}>
        <td className="countdown">
            <i className="fa fa-thumbtack" style={{color: this.props.isStickied ? "black" : "lightgray", cursor: "pointer"}}
                onMouseOver={() => this.props.onMouseOver(launch.id)} 
                onMouseOut={() => this.props.onMouseOut()} 
                onClick={() => this.props.onSelect(launch.id)}
                title="Stick to top of the page"
            />
            &nbsp;
            <CountDown launch={launch} />
        </td>

        <td className="date">
            { previousIcon }
            { launchTimeString }
        </td>

        <td className="agency" onMouseLeave={() => this.setState({showLspWipedia: false})} style={{position: "relative"}}>
            <div className="overflow_nowrap">
                <a target="_blank" rel="noopener noreferrer" href={launch.agencyInfoUrl}>
                    <i className={"fa fa-fw " + (launch.agencyInfoUrl ? "fa-external-link-alt" : "")} aria-hidden="true"></i>
                </a>

                <a  target="_blank" 
                    rel="noopener noreferrer" 
                    href={launch.agencyWikiUrl} 
                    onMouseOver={() => this.setState({showLspWipedia: true})}
                    >
                    <i className={"fab fa-fw " + (launch.agencyWikiUrl ? "fa-wikipedia-w" : "")} aria-hidden="true"></i>
                </a>

                {
                    launch.agencyIcon
                    ?
                    <img className="icon" title={launch.agencyName} src={"images/" + launch.agencyIcon}/> 
                    : 
                    null
                }
                <small>{launch.agencyName}</small>
            </div>
            
            {
                launch.agencyWikiUrl && this.state.showLspWipedia
                ?
                <WikipediaPanel
                    url={launch.agencyWikiUrl}
                />
                :
                null
            }
        </td>

        <td className="rocket" onMouseLeave={() => this.setState({showRocketWipedia: false})} style={{position: "relative"}}>
            <div className="overflow_nowrap">
                <a target="_blank" rel="noopener noreferrer" href={launch.rocketInfoUrl}>
                    <i className={"fa fa-fw " + (launch.rocketInfoUrl ? "fa-external-link-alt" : "")} aria-hidden="true"></i>
                </a> 
                
                <a  target="_blank" 
                    rel="noopener noreferrer" 
                    href={launch.rocketWikiUrl} 
                    onMouseOver={() => this.setState({showRocketWipedia: true})}
                    >
                    <i className={"fab fa-fw " + (launch.rocketWikiUrl ? "fa-wikipedia-w" : "")} aria-hidden="true"></i>
                </a>

                <div className="flag">
                    { launch.rocketFlagIcon ? <img className="flag" src={"images/" + launch.rocketFlagIcon}/> : null }
                </div>
                
                <span title={launch.rocketName}>{launch.rocketName}</span>

                {
                    rocketImage
                    ? 
                    <img style={{height: "1em", marginLeft: "1em"}} src={`/images/rockets/${rocketImage}`} />
                    : 
                    null
                }
                
            </div>
            
            {
                launch.rocketWikiUrl && this.state.showRocketWipedia
                ?
                <WikipediaPanel
                    url={launch.rocketWikiUrl}
                />
                :
                null
            }
        </td>

        <td className="payload">
            {
                this.state.editing
                ?
                <select value={this.state.payloadIcon} onChange={(e) => this.setState({payloadIcon: e.target.value})} >
                    <option value="">[ Unknown ]</option>
                    {
                        Object.entries(this.props.payloads).map(e => {
                            return <option key={e[0]} value={e[0]}>{e[1].name}</option>;
                        })
                    }
                </select>
                :
                launch.payloadIcon ? <img className="flag" src={"images/" + launch.payloadIcon}/> : null
            }
            <span title={launch.payloadName}>{launch.payloadName}</span>
        </td>

        <td className="destination" title={launch.destinationName} >
            {
                this.state.editing
                ?
                <span>
                    <select value={this.state.destinationIcon} onChange={(e) => this.setState({destinationIcon: e.target.value})} >
                        <option value="">[ Unknown ]</option>
                        {
                            Object.entries(this.props.destinations).map(e => {
                                return <option key={e[0]} value={e[0]}>{e[1].name}</option>;
                            })
                        }
                    </select>
                    <br />
                    <input type="text" value={this.state.destination} onChange={(e) => this.setState({destination: e.target.value})} />
                </span>
                :
                <span>
                {launch.destinationIcon ? <img className="flag" src={"images/" + launch.destinationIcon}/> : null}
                {launch.destinationName}
                </span>
            }
        </td>

        <td className="map">
            {
                launch.mapURL
                ?
                <a target="_blank" href={launch.mapURL}>
                    <img src="images/map_pin.png"/>
                </a>
                :
                null
            }
        </td>
        
        <td className="video">
            {
                launch.videoURL
                ?
                <a target="_blank" href={launch.videoURL}>
                    <img src="images/video.png"/>
                </a>
                :
                null
            }
        </td>
        {
            typeof location !== 'undefined' && location.search.includes("admin_pwd")
            ?
            <td>
            <button onClick={() => {
                if (this.state.editing) this.onSave()
                this.setState({editing: !this.state.editing})}
                }>
                {this.state.editing ? "Save" : "Modify"}
                </button>
                {
                    this.state.editing
                    ?
                    <button onClick={() => this.setState({editing: false})}> X </button> 
                    :
                    null
                }

            </td>
            :
            null
        }
    </tr>
    }
}

export class CountDown extends React.Component<{launch: FrontendLaunch}, {now?: Date}> {

    private interval: any;

    constructor(props: any) {
        super(props);
        this.state = {
           
        };
    }

    componentDidMount() {
        this.setState({now: new Date()})
        
        if (this.props.launch.timestampResolution == TimestampResolution.SECOND) {
            this.interval = setInterval(() => this.setState({now: new Date()}), 100);
        }
    }
    componentDidUpdate() {
        if (!this.interval && this.props.launch.timestampResolution == TimestampResolution.SECOND) {
            this.interval = setInterval(() => this.setState({now: new Date()}), 100);
        }
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    render() {
        return formatCountdown(this.props.launch, this.state && this.state.now) || null;
    }

}
