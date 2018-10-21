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
    readonly state: AppState;

    private static getPersistedAppState() : AppState {
        const state: AppState = {
            numberOfLines: 0,
            viewMode: Utilities.ViewMode.light
        };

        if (Utilities.isLocalStorageSupported()) {
            const viewMode: string = window.localStorage.getItem(Utilities.LocalStorageKeys.viewMode);

            if (Utilities.isWellDefinedValue(viewMode) && viewMode === Utilities.ViewMode.dark) {
                state.viewMode = Utilities.ViewMode.dark;
            }
        }
    
        return state;
    };

    private static removeElementFocus() : void {
        const focalElement: HTMLElement = document.activeElement as HTMLElement;

        if (Utilities.isWellDefinedValue(focalElement)) {
            if (focalElement instanceof HTMLInputElement) {
                const input: HTMLInputElement = focalElement as HTMLInputElement;

                if (input.type === 'text') {
                    return;
                }
            }

            focalElement.blur();
        }
    };

    private static persistAppState(state: AppState) : void {
        if (Utilities.isLocalStorageSupported()) {
            window.localStorage.setItem(Utilities.LocalStorageKeys.viewMode, state.viewMode);
        }
    };

    private readonly handleAppUpdates = (appUpdates: AppUpdates) : void => {
        const nextState: AppState = {
            numberOfLines: this.state.numberOfLines,
            viewMode: Utilities.or(appUpdates.viewMode, this.state.viewMode)
        };

        this.setState(nextState);
        App.persistAppState(nextState);
    };

    private readonly setNumberOfLines = (event: UIEvent) : void => {
        this.setState({
            numberOfLines: this.recalculateNumberOfLines()
        });
    };

    private readonly handleActionableDomEvent = (event: UIEvent) : void => {
        setTimeout(this.setNumberOfLines, 100);
    };

    private recalculateNumberOfLines() : number {
        return Math.floor((window.innerHeight - Utilities.Constants.topBarHeight) / Utilities.Constants.lineHeight);
    };

    constructor(props: object) {
        super(props);

        this.state = App.getPersistedAppState();
        this.state.numberOfLines =  this.recalculateNumberOfLines();
    };

    shouldComponentUpdate(nextProps: object, nextState: AppState) : boolean {
        return nextState.numberOfLines !== this.state.numberOfLines || nextState.viewMode !== this.state.viewMode;
    };

    componentDidMount() : void {
        window.addEventListener(Utilities.DomEvent.resize, this.handleActionableDomEvent);
        window.addEventListener(Utilities.DomEvent.orientationChange, this.handleActionableDomEvent);
        window.addEventListener(Utilities.DomEvent.click, App.removeElementFocus);
    };

    componentWillUnmount() : void {
        window.removeEventListener(Utilities.DomEvent.resize, this.handleActionableDomEvent);
        window.removeEventListener(Utilities.DomEvent.orientationChange, this.handleActionableDomEvent);
        window.removeEventListener(Utilities.DomEvent.click, App.removeElementFocus);
    };

    render() : JSX.Element {
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