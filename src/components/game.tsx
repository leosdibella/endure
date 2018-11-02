import * as React from 'react';
import '../styles/game.scss';
import { Grid } from './grid';
import { TopBar } from './topBar';
import { GameOverlay } from './gameOverlay';
import { BottomBar } from './bottomBar';

class State {
    mode: Utilities.Game.Mode = Utilities.Game.Mode.newGame;
    combo: number = 0;
    score: number = 0;
    stage: number = 0;
    gradeIndex: Utilities.Game.GradeIndex = 0;
    difficulty: Utilities.Game.Difficulty = Utilities.Game.Difficulty.medium;
    highScores: Utilities.Game.HighScore[] = [];
    playerName: string = Utilities.Game.defaultPlayerName;
};

interface Props {
    view: Utilities.App.View;
    readonly onUpdate: (updates: Utilities.App.Updates) => void;
};

export class Game extends React.Component<Props, State> {
    private static readonly numberOfHighScoresToPersist: number = 10;
    readonly state: State;

    private static getPersistedState() : State {
        const state: State = new State();

        if (Utilities.General.isLocalStorageSupported()) {
            const difficulty: string = window.localStorage.getItem(Utilities.General.LocalStorageKey.difficulty),
                  highScores: string = window.localStorage.getItem(Utilities.General.LocalStorageKey.highScores),
                  playerName: string = window.localStorage.getItem(Utilities.General.LocalStorageKey.playerName);

            if (Utilities.General.isWellDefinedValue(difficulty)) {
                const parsedFifficultyMode: Utilities.Game.Difficulty = parseInt(difficulty);

                if (parsedFifficultyMode >= Utilities.Game.Difficulty.low || parsedFifficultyMode <= Utilities.Game.Difficulty.expert) {
                    state.difficulty = parsedFifficultyMode;
                }
            };

            if (Utilities.General.isWellDefinedValue(highScores)) {
                const parsedHighScores = JSON.parse(highScores);

                if (Array.isArray(parsedHighScores)) {
                    state.highScores = parsedHighScores;
                }
            }

            if (Utilities.Game.isValidPlayerName(playerName)) {
                state.playerName = playerName;
            }
        }

        return state;
    };

    private static persistState(state: State) : void {
        if (Utilities.General.isLocalStorageSupported()) {
            window.localStorage.setItem(Utilities.General.LocalStorageKey.difficulty, state.difficulty.toString());
            window.localStorage.setItem(Utilities.General.LocalStorageKey.highScores, JSON.stringify(state.highScores));

            if (Utilities.Game.isValidPlayerName(state.playerName)) {
                window.localStorage.setItem(Utilities.General.LocalStorageKey.playerName, state.playerName);
            }
        }
    }

    private readonly startNewGame = () : void => {
        if (this.state.mode === Utilities.Game.Mode.newGame) {
            this.setState({
                mode: Utilities.Game.Mode.inGame
            });
        }
    };

    private readonly quit = () : void => {
        if (this.state.mode === Utilities.Game.Mode.inGame) {
            this.setState({
                mode: Utilities.Game.Mode.quitConfirmation
            });
        } else if (this.state.mode !== Utilities.Game.Mode.specifyName) {
            this.setState({
                mode: Utilities.Game.Mode.newGame,
                combo: 0,
                score: 0,
                stage: 0,
                gradeIndex: 0
            });
        }
    };

    private readonly togglePaused = () : void => {
        if (Utilities.Game.isInProgress(this.state.mode)) {
            this.setState({
                mode: this.state.mode === Utilities.Game.Mode.paused ? Utilities.Game.Mode.inGame : Utilities.Game.Mode.paused
            });
        }
    };

    private readonly toggleView = () : void => {
        if (this.state.mode !== Utilities.Game.Mode.specifyName) {
            this.props.onUpdate({
                view: this.props.view === Utilities.App.View.dark ? Utilities.App.View.light : Utilities.App.View.dark
            });
        }
    };
    
    private readonly cheat = () : void => {
        if (Utilities.Game.isInProgress(this.state.mode)) {
            this.setState({
                combo: this.state.combo + 1
            });
        }
    };

    private readonly keyDownEventActionMap: { [key: string]: () => void } = {
        p: this.togglePaused,
        v: this.toggleView,
        q: this.quit,
        c: this.cheat
    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        const keyDownHandler = this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()];

        if (Utilities.General.isWellDefinedValue(keyDownHandler)) {
            keyDownHandler();
        }
    };
    
    private transformState(updates: Utilities.Game.Updates) : State {
        let stage: number = this.state.score,
            score: number = this.state.score,
            combo: number = this.state.combo,
            gradeIndex: number = this.state.gradeIndex,
            highScores: Utilities.Game.HighScore[] = this.state.highScores;

        if (updates.dropCombo) {
            combo = 0;
        }

        if (Utilities.General.isWellDefinedValue(updates.gradeIndex)) {
            gradeIndex = updates.gradeIndex;
        }

        if (gradeIndex === Utilities.Game.GradeIndex.f) {
            return undefined;
        }

        if (Utilities.General.isWellDefinedValue(updates.difficulty)) {
            updates.mode = Utilities.Game.Mode.newGame;
        }

        if (Utilities.General.isWellDefinedValue(updates.view)) {
            updates.mode = Utilities.Game.Mode.newGame;

            this.props.onUpdate({
                view: updates.view
            });
        }

        if (Utilities.General.isWellDefinedValue(updates.points)) {
            score += (updates.points * combo);
            ++combo;
            // stage = TODO
        }

        if (updates.mode === Utilities.Game.Mode.gameOver) {
            const highScore: Utilities.Game.HighScore = {
                value: score,
                name: this.state.playerName,
                date: Utilities.General.getDateStamp(new Date())
            };

            highScores = highScores.concat(highScore)
                                   .sort((a, b) => b.value - a.value)
                                   .slice(0, Game.numberOfHighScoresToPersist);

            score = 0;
            combo = 0;
            stage = 0;
        }

        return {
            stage: stage,
            highScores: highScores,
            playerName: Utilities.Game.isValidPlayerName(updates.playerName) ? updates.playerName : Utilities.Game.defaultPlayerName,
            score: score,
            combo: combo,
            gradeIndex: gradeIndex,
            mode: Utilities.General.or(updates.mode, this.state.mode),
            difficulty: Utilities.General.or(updates.difficulty, this.state.difficulty)
        };
    };

    private readonly handleUpdates = (updates: Utilities.Game.Updates) : void => {
        const nextState: State = this.transformState(updates);

        if (!Utilities.General.isWellDefinedValue(nextState)) {
            this.setState({
                mode: Utilities.Game.Mode.gameOver //TODO
            });
        } else {
            this.setState(nextState);
            Game.persistState(nextState);
        }
    };

    private getGameOverlay() : JSX.Element {
        if (this.state.mode !== Utilities.Game.Mode.inGame) {
            return <GameOverlay view={this.props.view}
                                mode={this.state.mode}
                                playerName={this.state.playerName}
                                difficulty={this.state.difficulty}
                                highScores={this.state.highScores}
                                onQuit={this.quit}
                                onTogglePaused={this.togglePaused}
                                onToggleView={this.toggleView}
                                onStartNewGame={this.startNewGame}
                                onUpdate={this.handleUpdates}>
                   </GameOverlay>;
        }

        return undefined;
    };

    constructor(props: Props) {
        super(props);
        this.state = Game.getPersistedState();
    };

    shouldComponentUpdate(nextProps: Props, nextState: State) : boolean {
        return nextProps.view !== this.props.view
            || nextState.difficulty !== this.state.difficulty
            || nextState.combo !== this.state.combo
            || nextState.mode !== this.state.mode
            || nextState.score !== this.state.score
            || nextState.stage !== this.state.stage
            || nextState.playerName !== this.state.playerName;
    };

    componentDidMount() : void {
        document.addEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    componentWillUnmount() : void {
        document.removeEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    render() : JSX.Element {
        return <div className={'game ' + this.props.view}>
            {this.getGameOverlay()}
            <TopBar view={this.props.view}
                     mode={this.state.mode}
                     combo={this.state.combo}
                     difficulty={this.state.difficulty}
                     gradeIndex={this.state.gradeIndex}
                     score={this.state.score}
                     playerName={this.state.playerName}
                     stage={this.state.stage}
                     onUpdate={this.handleUpdates}>
            </TopBar>
            <Grid view={this.props.view}
                  mode={this.state.mode}
                  onUpdate={this.handleUpdates}>
            </Grid>
            <BottomBar>
            </BottomBar>
        </div>;
    };
};