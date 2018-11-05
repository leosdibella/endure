import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/app.scss';

import { AppBackdrop } from './appBackdrop';
import { Game } from './game';

interface State {
    theme: Utilities.App.Theme;
    orientation: Utilities.App.Orientation;
};

export class App extends React.PureComponent<object, State> {
    readonly state: State;

    private static getPersistedState() : State {
        const state: State = {
            theme: Utilities.App.Theme.light,
            orientation: Utilities.App.getOrientation()
        };

        if (Utilities.General.isLocalStorageSupported()) {
            const theme: string = window.localStorage.getItem(Utilities.General.LocalStorageKey.theme);

            if (Utilities.General.isWellDefinedValue(theme) && theme === Utilities.App.Theme.dark) {
                state.theme = Utilities.App.Theme.dark;
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
            window.localStorage.setItem(Utilities.General.LocalStorageKey.theme, state.theme);
        }
    };

    private readonly handleUpdates = (updates: Utilities.App.Updates) : void => {
        const nextState: State = {
            theme: Utilities.General.or(updates.theme, this.state.theme),
            orientation: this.state.orientation
        };

        this.setState(nextState);
        App.persistState(nextState);
    };

    private readonly setOrientation = (event: UIEvent) : void => {
        setTimeout(() => {
            this.setState({
                orientation: Utilities.App.getOrientation()
            });
        }, 100);
    };

    constructor(props: object) {
        super(props);

        this.state = App.getPersistedState();
    };

    componentDidMount() : void {
        window.addEventListener(Utilities.General.DomEvent.resize, this.setOrientation);
        window.addEventListener(Utilities.General.DomEvent.orientationChange, this.setOrientation);
        window.addEventListener(Utilities.General.DomEvent.click, App.removeElementFocus);
    };

    componentWillUnmount() : void {
        window.removeEventListener(Utilities.General.DomEvent.resize, this.setOrientation);
        window.removeEventListener(Utilities.General.DomEvent.orientationChange, this.setOrientation);
        window.removeEventListener(Utilities.General.DomEvent.click, App.removeElementFocus);
    };

    render() : JSX.Element {
        return <div className={'app ' + this.state.theme}>
            <AppBackdrop theme={this.state.theme}
                         orientation={this.state.orientation}>
            </AppBackdrop>
            <Game theme={this.state.theme}
                  orientation={this.state.orientation}
                  onUpdate={this.handleUpdates}>
            </Game>
        </div>;
    };
};