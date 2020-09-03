import { LatLng, Map } from 'leaflet';

interface IState {
    mapInstance?: Map | null;
    url?: string;
    query?: string;
    autosuggest?: [Location];
    latLng?: LatLng | null,
    location?: [Location] | null;
    showAutosuggest?: boolean;
}

interface IAction {
    type: string;
    payload?: {
        mapInstance?: Map | null;
        url?: string;
        query?: string;
        autosuggest?: [Location] | null;
        latLng?: LatLng | OnBeforeUnloadEventHandlerNonNull;
        location?: [Location] | null;
        showAutosuggest?: boolean;
    };
}

export interface Location {
    id?: string;
    weergavenaam?: string;
};

export const initialState: IState = {
    mapInstance: null,
    url: '',
    query: '',
    autosuggest: null,
    latLng: null,
    location: null,
    showAutosuggest: false,
};

export const reducer = (state: IState, action: IAction): IState => {
    console.log('----', action);

    switch (action.type) {
        case 'setAutosuggest':
            return {
                ...state,
                autosuggest: action.payload.autosuggest,
                showAutosuggest: true
            };

        case 'setLocation':
            return {
                ...state,
                location: action.payload.location,
            };

        case 'setLatLng':
            return {
                ...state,
                latLng: action.payload.latLng,
            };

        case 'setShowAutosuggest':
            return {
                ...state,
                showAutosuggest: action.payload.showAutosuggest,
            };

        case 'setMapInstance':
            return {
                ...state,
                mapInstance: action.payload.mapInstance,
            };

        case 'onChangeLocation':
            return {
                ...state,
                query: action.payload.query,
                url: action.payload.url,
            };


        default:
            return state;
    }
};
