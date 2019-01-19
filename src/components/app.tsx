import * as React from 'react';
import { AppState } from '../classes/appState';
import { IAppUpdate } from '../interfaces/iAppUpdate';
import { DomEvent, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';
import { Backdrop } from './backdrop';
import { Game } from './game';

import '../styles/app.scss';

export class App extends React.PureComponent<object, AppState> {
    private static readonly reorientationTimeoutWindow: number = 100;

    private readonly onUpdate: (updates: IAppUpdate) => void = this.handleUpdate.bind(this);
    private readonly onOrientationChange: () => void = this.setOrientation.bind(this);

    private handleUpdate(updates: IAppUpdate): void {
        const theme: Theme = Shared.castSafeOr(updates.theme, this.state.theme),
              nextState: AppState = new AppState(theme, this.state.orientation);

        this.setState(nextState);
        AppState.persistState(nextState);
    }

    private setOrientation(): void {
        setTimeout(() => {
            this.setState({
                orientation: AppState.getOrientation()
            });
        }, App.reorientationTimeoutWindow);
    }

    public readonly state: AppState = AppState.getPersistedState();

    public componentDidMount(): void {
        window.addEventListener(DomEvent.resize, this.onOrientationChange);
        window.addEventListener(DomEvent.orientationChange, this.onOrientationChange);
        window.addEventListener(DomEvent.click, AppState.removeElementFocus);
    }

    public componentWillUnmount(): void {
        window.removeEventListener(DomEvent.resize, this.onOrientationChange);
        window.removeEventListener(DomEvent.orientationChange, this.onOrientationChange);
        window.removeEventListener(DomEvent.click, AppState.removeElementFocus);
    }

    public render(): JSX.Element {
        return <div className={`app ${Theme[this.state.theme]}`}>
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