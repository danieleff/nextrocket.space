import * as React from 'react';
import Axios from 'axios';

type WikipediaPanelProps = {
    url?: string;
}

type WikipediaPanelState = {
    wikipediaResult?: WikipediaRestResult;
}

export class WikipediaPanel extends React.Component<WikipediaPanelProps, WikipediaPanelState> {

    constructor(props: WikipediaPanelProps) {
        super(props);

        this.state = {

        };
    }

    async componentDidMount() {
        if (this.props.url && !this.state.wikipediaResult) {
            const wikipediaResult = await loadWikipedia(this.props.url);
            this.setState({wikipediaResult});
        }
    }

    render() {
        return <div className="wikipedia_wrapper">
                
            {
                this.state.wikipediaResult
                ?
                <div className="wikipedia_summary">
                    <div className="wikipedia_summary__text" dangerouslySetInnerHTML={{__html: this.state.wikipediaResult.extract_html}}/>
                    {
                        this.state.wikipediaResult.thumbnail
                        ?
                        <div className="wikipedia_summary__thumbnail_wrapper">
                            <img 
                            className="wikipedia_summary__thumbnail" 
                                src={this.state.wikipediaResult.thumbnail.source || ""} />
                        </div>
                        :
                        null
                    }
                </div>
                :
                null
            }
        </div>
    }

}

type WikipediaRestResult = {
    thumbnail?: {
        source?: string,
        width?: number,
        height?: number
    },
    extract_html?: string
};

async function loadWikipedia(articleUrl: string): Promise<WikipediaRestResult> {
    if (!articleUrl) {
        return undefined;
    }
    
    if (wikiCache[articleUrl]) return wikiCache[articleUrl];
    
    var articleTitle = articleUrl;
    articleTitle = articleTitle.replace("http://en.wikipedia.org/wiki/", "");
    articleTitle = articleTitle.replace("https://en.wikipedia.org/wiki/", "");
    
    const restURL = "https://en.wikipedia.org/api/rest_v1/page/summary/" + articleTitle;
    const response = await Axios.get<WikipediaRestResult>(restURL);
    
    wikiCache[articleUrl] = response.data;

    return response.data;
}

const wikiCache: any = {};
