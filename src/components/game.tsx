import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/game.scss';

import { GameOverlay } from './gameOverlay';
import { Grid } from './grid';
import { TopBar } from './topBar';

export class Game extends React.PureComponent<Utilities.Game.IProps, Utilities.Game.State> {
    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (update: Utilities.Game.IUpdate) => void = this.handleUpdate.bind(this);
    private readonly onThemeChange: () => void = this.toggleTheme.bind(this);
    private readonly onQuit: () => void = this.quit.bind(this);

    private readonly keyDownEventActionMap: Utilities.General.IDictionary<() => void> = {
        p: this.togglePaused.bind(this),
        q: this.onQuit,
        v: this.onThemeChange
    };

    private toggleTheme(): void {
        if (this.state.mode !== Utilities.Game.Mode.specifyName) {
            this.props.onUpdate({
                theme: this.props.theme === Utilities.App.Theme.dark ? Utilities.App.Theme.light : Utilities.App.Theme.dark
            });
        }
    }

    private quit(): void {
        this.handleUpdate({
            mode: Utilities.Game.Mode.newGame
        });
    }

    private togglePaused(): void {
        if (Utilities.Game.isInProgress(this.state.mode)) {
            this.setState({
                mode: this.state.mode === Utilities.Game.Mode.paused ? Utilities.Game.Mode.inGame : Utilities.Game.Mode.paused
            });
        }
    }

    private handleUpdate(update: Utilities.Game.IUpdate): void {
        new Utilities.Maybe(update.theme).justDo(() => {
            this.onThemeChange();
            this.onQuit();
        }).otherwiseDo(() => {
            const nextState: Utilities.Game.State = Utilities.Game.getNextStateFromUpdate(update, this.state);

            this.setState(nextState);
            Utilities.Game.persistState(nextState);
        });
    }

    private handleKeyDown(keyboardEvent: KeyboardEvent): void {
        new Utilities.Maybe(this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()]).justDo(kdh => kdh());
    }

    private getGameOverlay(): JSX.Element | boolean {
        if (this.state.mode !== Utilities.Game.Mode.inGame) {
            return <GameOverlay theme={this.props.theme}
                                mode={this.state.mode}
                                playerName={this.state.playerName}
                                difficulty={this.state.difficulty}
                                highScores={this.state.highScores}
                                onUpdate={this.onUpdate}>
                   </GameOverlay>;
        }

        return false;
    }

    readonly state: Utilities.Game.State = Utilities.Game.getPersistedState();

    componentDidMount(): void {
        document.addEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    }

    componentWillUnmount(): void {
        document.removeEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    }

    render(): JSX.Element {
        return <div className={'game ' + Utilities.App.Theme[this.props.theme]}>
            {this.getGameOverlay()}
            <TopBar theme={this.props.theme}
                    mode={this.state.mode}
                    combo={this.state.combo}
                    difficulty={this.state.difficulty}
                    letterGrade={this.state.letterGrade}
                    score={this.state.score}
                    playerName={this.state.playerName}
                    stage={this.state.stage}
                    onUpdate={this.onUpdate}>
            </TopBar>
            <Grid theme={this.props.theme}
                  mode={this.state.mode}
                  orientation={this.props.orientation}
                  onUpdate={this.onUpdate}>
            </Grid>
        </div>;
    }
}