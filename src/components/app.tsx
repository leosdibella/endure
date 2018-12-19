import * as React from 'react';

import * as AppUtilities from '../utilities/app';
import * as GeneralUtilities from '../utilities/general';
import { Maybe } from '../utilities/maybe';

import '../styles/app.scss';

import { Backdrop } from './backdrop';
import { Game } from './game';

class App extends React.PureComponent<object, AppUtilities.State> {
    private readonly onUpdate: (updates: AppUtilities.IUpdate) => void = this.handleUpdate.bind(this);
    private readonly onOrientationChange: () => void = this.setOrientation.bind(this);

    private handleUpdate(updates: AppUtilities.IUpdate): void {
        const theme: AppUtilities.Theme = new Maybe(updates.theme).getOrDefault(this.state.theme),
              nextState: AppUtilities.State = new AppUtilities.State(theme, this.state.orientation);

        this.setState(nextState);
        AppUtilities.State.persistState(nextState);
    }

    private setOrientation(): void {
        setTimeout(() => {
            this.setState({
                orientation: AppUtilities.State.getOrientation()
            });
        }, 100);
    }

    public readonly state: AppUtilities.State = AppUtilities.State.getPersistedState();

    public componentDidMount(): void {
        window.addEventListener(GeneralUtilities.DomEvent.resize, this.onOrientationChange);
        window.addEventListener(GeneralUtilities.DomEvent.orientationChange, this.onOrientationChange);
        window.addEventListener(GeneralUtilities.DomEvent.click, AppUtilities.State.removeElementFocus);
    }

    public componentWillUnmount(): void {
        window.removeEventListener(GeneralUtilities.DomEvent.resize, this.onOrientationChange);
        window.removeEventListener(GeneralUtilities.DomEvent.orientationChange, this.onOrientationChange);
        window.removeEventListener(GeneralUtilities.DomEvent.click, AppUtilities.State.removeElementFocus);
    }

    public render(): JSX.Element {
        return <div className={`app ${AppUtilities.Theme[this.state.theme]}`}>
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