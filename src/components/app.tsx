import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/app.scss';

import { AppBackdrop } from './appBackdrop';
import { Game } from './game';

export class App extends React.PureComponent<object, Utilities.App.State> {
    private readonly onUpdate: () => void = this.handleUpdate.bind(this);
    private readonly onOrientationChange: () => void = this.setOrientation.bind(this);

    private handleUpdate(updates: Utilities.App.IUpdate): void {
        const theme: Utilities.App.Theme = new Utilities.Maybe(updates.theme).getOrDefault(this.state.theme),
              nextState: Utilities.App.State = new Utilities.App.State(theme, this.state.orientation);

        this.setState(nextState);
        Utilities.App.persistState(nextState);
    }

    private setOrientation(event: UIEvent): void {
        setTimeout(() => {
            this.setState({
                orientation: Utilities.App.getOrientation()
            });
        }, 100);
    }

    readonly state: Utilities.App.State = Utilities.App.getPersistedState();

    componentDidMount(): void {
        window.addEventListener(Utilities.General.DomEvent.resize, this.onOrientationChange);
        window.addEventListener(Utilities.General.DomEvent.orientationChange, this.onOrientationChange);
        window.addEventListener(Utilities.General.DomEvent.click, Utilities.App.removeElementFocus);
    }

    componentWillUnmount(): void {
        window.removeEventListener(Utilities.General.DomEvent.resize, this.onOrientationChange);
        window.removeEventListener(Utilities.General.DomEvent.orientationChange, this.onOrientationChange);
        window.removeEventListener(Utilities.General.DomEvent.click, Utilities.App.removeElementFocus);
    }

    render(): JSX.Element {
        return <div className={'app ' + this.state.theme}>
            <AppBackdrop theme={this.state.theme}
                         orientation={this.state.orientation}>
            </AppBackdrop>
            <Game theme={this.state.theme}
                  orientation={this.state.orientation}
                  onUpdate={this.onUpdate}>
            </Game>
        </div>;
    }
}