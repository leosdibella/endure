import * as React from 'react';

import * as AppUtilities from '../utilities/app';
import { Maybe } from '../utilities/maybe';
import * as Shared from '../utilities/shared';

import '../styles/app.scss';

import { Backdrop } from './backdrop';
import { Game } from './game';

class App extends React.PureComponent<object, AppUtilities.State> {
    private static readonly reorientationTimeoutWindow: number = 100;

    private readonly onUpdate: (updates: AppUtilities.IUpdate) => void = this.handleUpdate.bind(this);
    private readonly onOrientationChange: () => void = this.setOrientation.bind(this);

    private handleUpdate(updates: AppUtilities.IUpdate): void {
        const theme: Shared.Theme = new Maybe(updates.theme).getOrDefault(this.state.theme),
              nextState: AppUtilities.State = new AppUtilities.State(theme, this.state.orientation);

        this.setState(nextState);
        AppUtilities.State.persistState(nextState);
    }

    private setOrientation(): void {
        setTimeout(() => {
            this.setState({
                orientation: AppUtilities.State.getOrientation()
            });
        }, App.reorientationTimeoutWindow);
    }

    public readonly state: AppUtilities.State = AppUtilities.State.getPersistedState();

    public componentDidMount(): void {
        window.addEventListener(Shared.DomEvent.resize, this.onOrientationChange);
        window.addEventListener(Shared.DomEvent.orientationChange, this.onOrientationChange);
        window.addEventListener(Shared.DomEvent.click, AppUtilities.State.removeElementFocus);
    }

    public componentWillUnmount(): void {
        window.removeEventListener(Shared.DomEvent.resize, this.onOrientationChange);
        window.removeEventListener(Shared.DomEvent.orientationChange, this.onOrientationChange);
        window.removeEventListener(Shared.DomEvent.click, AppUtilities.State.removeElementFocus);
    }

    public render(): JSX.Element {
        return <div className={`app ${Shared.Theme[this.state.theme]}`}>
            <Backdrop theme={this.state.theme}
                      orientation={this.state.orientation}>
            </Backdrop>
            <Game theme={this.state.theme}
                  orientation={this.state.orientation}
                  onUpdate={this.onUpdate}>
            </Game>
        </div>;
    }
}

export {
    App
};