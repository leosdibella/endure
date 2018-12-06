import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/game.scss';

import { Grid } from './grid';
import { TopBar } from './topBar';
import { GameOverlay } from './gameOverlay';

export class Game extends React.PureComponent<Utilities.Game.IProps, Utilities.Game.State> {
    readonly state: Utilities.Game.State = Utilities.Game.getPersistedState();

    private readonly toggleTheme = () : void => {
        if (this.state.mode !== Utilities.Game.Mode.specifyName) {
            this.props.onUpdate({
                theme: this.props.theme === Utilities.App.Theme.dark ? Utilities.App.Theme.light : Utilities.App.Theme.dark
            });
        }
    };

    private readonly handleUpdates = (update: Utilities.Game.IUpdate) : void => {
        Utilities.Maybe.maybe(update.theme).justDo(this.toggleTheme).otherwiseDo(Utilities.Maybe.just(true), t => {
            const nextState: Utilities.Game.State = Utilities.Game.getNextStateFromUpdate(update, this.state);

            this.setState(nextState);
            Utilities.Game.persistState(nextState);
        });
    };

    private readonly quit = () : void => {
        this.handleUpdates({
            mode: Utilities.Game.Mode.newGame
        });
    };

    private readonly togglePaused = () : void => {
        if (Utilities.Game.isInProgress(this.state.mode)) {
            this.setState({
                mode: this.state.mode === Utilities.Game.Mode.paused ? Utilities.Game.Mode.inGame : Utilities.Game.Mode.paused
            });
        }
    };

    private readonly keyDownEventActionMap: Utilities.General.IDictionary<() => void> = {
        p: this.togglePaused,
        v: this.toggleTheme,
        q: this.quit
    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        Utilities.Maybe.maybe(this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()]).justDo(kdh => kdh());
    };

    private getGameOverlay() : JSX.Element | boolean {
        if (this.state.mode !== Utilities.Game.Mode.inGame) {
            return <GameOverlay theme={this.props.theme}
                                mode={this.state.mode}
                                playerName={this.state.playerName}
                                difficulty={this.state.difficulty}
                                highScores={this.state.highScores}
                                onUpdate={this.handleUpdates}>
                   </GameOverlay>;
        }

        return false;
    };

    componentDidMount() : void {
        document.addEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    componentWillUnmount() : void {
        document.removeEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    render() : JSX.Element {
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
                    onUpdate={this.handleUpdates}>
            </TopBar>
            <Grid theme={this.props.theme}
                  mode={this.state.mode}
                  orientation={this.props.orientation}
                  onUpdate={this.handleUpdates}>
            </Grid>
        </div>;
    };
};