import * as React from 'react';
import '../styles/app.scss';
import { Utilities } from '../utilities/utilities';
import { Backdrop } from './backdrop';
import { Game } from './game';

interface AppState {
    numberOfLines: number;
    viewMode: Utilities.ViewMode;
};

export interface AppUpdates {
    viewMode?: Utilities.ViewMode;
};

export class App extends React.Component<object, AppState> {
    private static readonly localStorageViewModeKey: string = 'ENDURE_VIEW_MODE';
    readonly state: AppState;

    public static isLocalStorageSupported() : boolean {
        return typeof(Storage) !== 'undefined' && Utilities.isWellDefinedValue(window.localStorage);
    };

    private static getPersistedViewMode() : Utilities.ViewMode {
        if (App.isLocalStorageSupported()) {
            const viewMode: string = window.localStorage.getItem(App.localStorageViewModeKey);

            if (Utilities.isWellDefinedValue(viewMode)) {
                if (viewMode === Utilities.ViewMode.dark) {
                    return Utilities.ViewMode.dark;
                }
            }
        }
    
        return Utilities.ViewMode.dark;
    };

    private recalculateLayoutSizes() : AppState {
        return {
            numberOfLines: Math.floor((window.innerHeight - Utilities.Constants.topBarHeight) / Utilities.Constants.lineHeight),
            viewMode: Utilities.isWellDefinedValue(this.state) ? this.state.viewMode : Utilities.ViewMode.light
        };
    };

    private persistViewMode() : void {
        if (App.isLocalStorageSupported()) {
            window.localStorage.setItem(App.localStorageViewModeKey, this.state.viewMode);
        }
    };

    private readonly handleAppUpdates = (appUpdates: AppUpdates) : void => {
        if (appUpdates.viewMode !== this.state.viewMode) {
            this.persistViewMode();
            this.setState({});
        }
    };

    private readonly setLayoutSizes = (event: UIEvent) : void => {
        this.setState(this.recalculateLayoutSizes());
    };

    private readonly handleActionableDomEvent = (event: UIEvent) : void => {
        setTimeout(this.setLayoutSizes, 100);
    };

    constructor(props: object) {
        super(props);

        const layoutSizes = this.recalculateLayoutSizes();

        this.state = {
            numberOfLines: layoutSizes.numberOfLines,
            viewMode: App.getPersistedViewMode()
        };
    };

    shouldComponentUpdate(nextProps: object, nextState: AppState) : boolean {
        return nextState.numberOfLines !== this.state.numberOfLines || nextState.viewMode !== this.state.viewMode;
    };

    componentDidMount() {
        window.addEventListener(Utilities.DomEvent.resize, this.handleActionableDomEvent);
        window.addEventListener(Utilities.DomEvent.orientationChange, this.handleActionableDomEvent);
    };

    componentWillUnmount() {
        window.removeEventListener(Utilities.DomEvent.resize, this.handleActionableDomEvent);
        window.removeEventListener(Utilities.DomEvent.orientationChange, this.handleActionableDomEvent);
    };

    render() {
        return <div className={'app ' + this.state.viewMode}>
            <Backdrop viewMode={this.state.viewMode}
                      numberOfLines={this.state.numberOfLines}>
            </Backdrop>
            <Game viewMode={this.state.viewMode}
                  onUpdate={this.handleAppUpdates}>
            </Game>
        </div>;
    };
};