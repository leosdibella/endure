import * as React from 'react';

import * as AppUtilities from '../utilities/app';
import * as GameUtilities from '../utilities/game';
import * as GeneralUtilities from '../utilities/general';
import { Maybe } from '../utilities/maybe';

import '../styles/game.scss';

import { Grid } from './grid';
import { Header } from './header';
import { Overlay } from './overlay';

class Game extends React.PureComponent<GameUtilities.IProps, GameUtilities.State> {
    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (update: GameUtilities.IUpdate) => void = this.handleUpdate.bind(this);
    private readonly onThemeChange: () => void = this.toggleTheme.bind(this);
    private readonly onQuit: () => void = this.quit.bind(this);

    private readonly keyDownEventActionMap: GeneralUtilities.IDictionary<() => void> = {
        p: this.togglePaused.bind(this),
        q: this.onQuit,
        v: this.onThemeChange
    };

    private toggleTheme(): void {
        if (this.state.mode !== GameUtilities.Mode.specifyName) {
            this.props.onUpdate({
                theme: this.props.theme === AppUtilities.Theme.dark ? AppUtilities.Theme.light : AppUtilities.Theme.dark
            });
        }
    }

    private quit(): void {
        this.handleUpdate({
            mode: GameUtilities.Mode.newGame
        });
    }

    private togglePaused(): void {
        if (GameUtilities.State.isInProgress(this.state.mode)) {
            this.setState({
                mode: this.state.mode === GameUtilities.Mode.paused ? GameUtilities.Mode.inGame : GameUtilities.Mode.paused
            });
        }
    }

    private handleUpdate(update: GameUtilities.IUpdate): void {
        new Maybe(update.theme).justDo(() => {
            this.onThemeChange();
            this.onQuit();
        }).otherwiseDo(() => {
            const nextState: GameUtilities.State = GameUtilities.State.getNextStateFromUpdate(update, this.state);

            this.setState(nextState);
            GameUtilities.State.persistState(nextState);
        });
    }

    private handleKeyDown(keyboardEvent: KeyboardEvent): void {
        new Maybe(this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()]).justDo(kdh => kdh());
    }

    private getOverlay(): JSX.Element | boolean {
        if (this.state.mode !== GameUtilities.Mode.inGame) {
            return <Overlay theme={this.props.theme}
                            mode={this.state.mode}
                            playerName={this.state.playerName}
                            difficulty={this.state.difficulty}
                            highScores={this.state.highScores}
                            onUpdate={this.onUpdate}>
                   </Overlay>;
        }

        return false;
    }

    public readonly state: GameUtilities.State = GameUtilities.State.getPersistedState();

    public componentDidMount(): void {
        document.addEventListener(GeneralUtilities.DomEvent.keyDown, this.onKeyDown);
    }

    public componentWillUnmount(): void {
        document.removeEventListener(GeneralUtilities.DomEvent.keyDown, this.onKeyDown);
    }

    public render(): JSX.Element {
        return <div className={`game ${AppUtilities.Theme[this.props.theme]}`}>
            {this.getOverlay()}
            <Header theme={this.props.theme}
                    mode={this.state.mode}
                    combo={this.state.combo}
                    difficulty={this.state.difficulty}
                    letterGrade={this.state.letterGrade}
                    score={this.state.score}
                    playerName={this.state.playerName}
                    stage={this.state.stage}
                    onUpdate={this.onUpdate}>
            </Header>
            <Grid theme={this.props.theme}
                  mode={this.state.mode}
                  orientation={this.props.orientation}
                  onUpdate={this.onUpdate}>
            </Grid>
        </div>;
    }
}

export {
    Game
};