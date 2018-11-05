import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/game.scss';

import { Grid } from './grid';
import { TopBar } from './topBar';
import { GameOverlay } from './gameOverlay';

class State {
    mode: Utilities.Game.Mode = Utilities.Game.Mode.newGame;
    combo: number = 0;
    score: number = 0;
    stage: number = 0;
    gradeIndex: number = 0;
    difficulty: Utilities.Game.Difficulty = Utilities.Game.Difficulty.medium;
    highScores: Utilities.Game.HighScore[] = [];
    playerName: string = Utilities.Game.defaultPlayerName;
};

interface Props {
    theme: Utilities.App.Theme;
    orientation: Utilities.App.Orientation;
    readonly onUpdate: (updates: Utilities.App.Updates) => void;
};

export class Game extends React.PureComponent<Props, State> {
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
        if (this.state.mode === Utilities.Game.Mode.newGame || this.state.mode === Utilities.Game.Mode.gameOver) {
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

    private readonly toggleTheme = () : void => {
        if (this.state.mode !== Utilities.Game.Mode.specifyName) {
            this.props.onUpdate({
                theme: this.props.theme === Utilities.App.Theme.dark ? Utilities.App.Theme.light : Utilities.App.Theme.dark
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

    private readonly keyDownEventActionMap: Utilities.General.Dictionary<() => void> = {
        p: this.togglePaused,
        v: this.toggleTheme,
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

        if (Utilities.General.isWellDefinedValue(updates.difficulty)) {
            updates.mode = Utilities.Game.Mode.newGame;
        }

        if (Utilities.General.isWellDefinedValue(updates.theme)) {
            updates.mode = Utilities.Game.Mode.newGame;

            this.props.onUpdate({
                theme: updates.theme
            });
        }

        if (Utilities.General.isWellDefinedValue(updates.points)) {
            score += (updates.points * combo);
            ++combo;
            // stage = TODO
        }

        if (updates.mode === Utilities.Game.Mode.gameOver || gradeIndex === Utilities.Grade.grades.length - 1) {
            const highScore: Utilities.Game.HighScore = {
                value: score,
                name: this.state.playerName,
                date: Utilities.General.getDateStamp(new Date())
            };

            highScores = highScores.concat(highScore)
                                   .sort((a, b) => b.value - a.value)
                                   .slice(0, Utilities.Game.numberOfHighScoresToPersist);

            score = 0;
            combo = 0;
            stage = 0;
            gradeIndex = 0;
            updates.mode = Utilities.Game.Mode.gameOver;
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
        this.setState(nextState);
        Game.persistState(nextState);
    };

    private getGameOverlay() : JSX.Element {
        if (this.state.mode !== Utilities.Game.Mode.inGame) {
            return <GameOverlay theme={this.props.theme}
                                mode={this.state.mode}
                                playerName={this.state.playerName}
                                difficulty={this.state.difficulty}
                                highScores={this.state.highScores}
                                onQuit={this.quit}
                                onTogglePaused={this.togglePaused}
                                onToggleTheme={this.toggleTheme}
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

    componentDidMount() : void {
        document.addEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    componentWillUnmount() : void {
        document.removeEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    render() : JSX.Element {
        return <div className={'game ' + this.props.theme}>
            {this.getGameOverlay()}
            <TopBar theme={this.props.theme}
                     mode={this.state.mode}
                     combo={this.state.combo}
                     difficulty={this.state.difficulty}
                     gradeIndex={this.state.gradeIndex}
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