import * as React from 'react';
import '../styles/app.scss';
import { AppBackdrop } from './appBackdrop';
import { Game } from './game';

interface State {
    numberOfLines: number;
    view: Utilities.App.View;
};

export class App extends React.PureComponent<object, State> {
    readonly state: State;

    private static getPersistedState() : State {
        const state: State = {
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

    private static persistState(state: State) : void {
        if (Utilities.General.isLocalStorageSupported()) {
            window.localStorage.setItem(Utilities.General.LocalStorageKey.view, state.view);
        }
    };

    private readonly handleUpdates = (updates: Utilities.App.Updates) : void => {
        const nextState: State = {
            numberOfLines: this.state.numberOfLines,
            view: Utilities.General.or(updates.view, this.state.view)
        };

        this.setState(nextState);
        App.persistState(nextState);
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
        return Math.floor((window.innerHeight - Utilities.AppBackdrop.topMarginHeight) / Utilities.AppBackdrop.lineHeight);
    };

    constructor(props: object) {
        super(props);

        this.state = App.getPersistedState();
        this.state.numberOfLines =  this.recalculateNumberOfLines();
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
            <AppBackdrop view={this.state.view}
                         numberOfLines={this.state.numberOfLines}>
            </AppBackdrop>
            <Game view={this.state.view}
                  onUpdate={this.handleUpdates}>
            </Game>
        </div>;
    };
};