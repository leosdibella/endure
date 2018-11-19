import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/app.scss';

import { AppBackdrop } from './appBackdrop';
import { Game } from './game';


export class App extends React.PureComponent<object, Utilities.App.State> {
    readonly state: Utilities.App.State = Utilities.App.getPersistedState();

    private readonly handleUpdate = (updates: Utilities.App.IUpdate) : void => {
        const nextState: Utilities.App.State = new Utilities.App.State(Utilities.General.castSafeOr(updates.theme, this.state.theme), this.state.orientation);
        this.setState(nextState);
        Utilities.App.persistState(nextState);
    };

    private readonly setOrientation = (event: UIEvent) : void => {
        setTimeout(() => {
            this.setState({
                orientation: Utilities.App.getOrientation()
            });
        }, 100);
    };

    componentDidMount() : void {
        window.addEventListener(Utilities.General.DomEvent.resize, this.setOrientation);
        window.addEventListener(Utilities.General.DomEvent.orientationChange, this.setOrientation);
        window.addEventListener(Utilities.General.DomEvent.click, Utilities.App.removeElementFocus);
    };

    componentWillUnmount() : void {
        window.removeEventListener(Utilities.General.DomEvent.resize, this.setOrientation);
        window.removeEventListener(Utilities.General.DomEvent.orientationChange, this.setOrientation);
        window.removeEventListener(Utilities.General.DomEvent.click, Utilities.App.removeElementFocus);
    };

    render() : JSX.Element {
        return <div className={'app ' + this.state.theme}>
            <AppBackdrop theme={this.state.theme}
                         orientation={this.state.orientation}>
            </AppBackdrop>
            <Game theme={this.state.theme}
                  orientation={this.state.orientation}
                  onUpdate={this.handleUpdate}>
            </Game>
        </div>;
    };
};