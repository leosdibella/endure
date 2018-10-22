import * as React from 'react';
import '../styles/app.scss';
import { Utilities } from '../utilities/utilities';
import { Backdrop } from './backdrop';
import { Game } from './game';

interface AppState {
    numberOfLines: number;
    view: Utilities.App.View;
};

export interface AppUpdates {
    view?: Utilities.App.View;
};

export class App extends React.Component<object, AppState> {
    readonly state: AppState;

    private static getPersistedAppState() : AppState {
        const state: AppState = {
            numberOfLines: 0,
            view: Utilities.App.View.light
        };

        if (Utilities.General.isLocalStorageSupported()) {
            const view: string = window.localStorage.getItem(Utilities.General.LocalStorageKey.view);

            if (Utilities.General.isWellDefinedValue(view) && view === Utilities.App.View.dark) {
                state.view = Utilities.App.View.dark;
            }
        }
    
        return state;
    };

    private static removeElementFocus() : void {
        const focalElement: HTMLElement = document.activeElement as HTMLElement;

        if (Utilities.General.isWellDefinedValue(focalElement)) {
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
        if (Utilities.General.isLocalStorageSupported()) {
            window.localStorage.setItem(Utilities.General.LocalStorageKey.view, state.view);
        }
    };

    private readonly handleAppUpdates = (appUpdates: AppUpdates) : void => {
        const nextState: AppState = {
            numberOfLines: this.state.numberOfLines,
            view: Utilities.General.or(appUpdates.view, this.state.view)
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
        return Math.floor((window.innerHeight - Utilities.Backdrop.topMarginHeight) / Utilities.Backdrop.lineHeight);
    };

    constructor(props: object) {
        super(props);

        this.state = App.getPersistedAppState();
        this.state.numberOfLines =  this.recalculateNumberOfLines();
    };

    shouldComponentUpdate(nextProps: object, nextState: AppState) : boolean {
        return nextState.numberOfLines !== this.state.numberOfLines || nextState.view !== this.state.view;
    };

    componentDidMount() : void {
        window.addEventListener(Utilities.General.DomEvent.resize, this.handleActionableDomEvent);
        window.addEventListener(Utilities.General.DomEvent.orientationChange, this.handleActionableDomEvent);
        window.addEventListener(Utilities.General.DomEvent.click, App.removeElementFocus);
    };

    componentWillUnmount() : void {
        window.removeEventListener(Utilities.General.DomEvent.resize, this.handleActionableDomEvent);
        window.removeEventListener(Utilities.General.DomEvent.orientationChange, this.handleActionableDomEvent);
        window.removeEventListener(Utilities.General.DomEvent.click, App.removeElementFocus);
    };

    render() : JSX.Element {
        return <div className={'app ' + this.state.view}>
            <Backdrop view={this.state.view}
                      numberOfLines={this.state.numberOfLines}>
            </Backdrop>
            <Game view={this.state.view}
                  onUpdate={this.handleAppUpdates}>
            </Game>
        </div>;
    };
};