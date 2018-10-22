import * as React from 'react';
import '../styles/game.scss';
import { Grid } from './grid';
import { MenuBar } from './menuBar';
import { Utilities } from '../utilities/utilities';
import { AppUpdates } from './app';
import { Overlay } from './overlay';

class GameState {
    mode: Utilities.Game.Mode = Utilities.Game.Mode.newGame;
    combo: number = 0;
    score: number = 0;
    period: number = 0;
    difficulty: Utilities.Game.Difficulty = Utilities.Game.Difficulty.medium;
    highScores: Utilities.Game.HighScore[] = [];
    playerName: string = Utilities.Game.defaultPlayerName;
};

export interface GameProps {
    view: Utilities.App.View;
    readonly onUpdate: (appUpdates: AppUpdates) => void;
};

export interface GameUpdates {
    points?: number;
    mode?: Utilities.Game.Mode;
    difficulty?: Utilities.Game.Difficulty;
    view?: Utilities.App.View;
    playerName?: string;
    dropCombo?: boolean;
};

export class Game extends React.Component<GameProps, GameState> {
    private static readonly numberOfHighScoresToPersist: number = 10;
    readonly state: GameState;

    private static getPersistedGameState() : GameState {
        const state: GameState = new GameState();

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

    private static persistGameState(state: GameState) : void {
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
                period: 0
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
    
    private transformGameState(gameUpdates: GameUpdates) : GameState {
        let period: number = this.state.score,
            score: number = this.state.score,
            combo: number = this.state.combo,
            highScores: Utilities.Game.HighScore[] = this.state.highScores;

        if (gameUpdates.dropCombo) {
            combo = 0;
        }

        if (Utilities.General.isWellDefinedValue(gameUpdates.difficulty)) {
            gameUpdates.mode = Utilities.Game.Mode.newGame;
        }

        if (Utilities.General.isWellDefinedValue(gameUpdates.view)) {
            gameUpdates.mode = Utilities.Game.Mode.newGame;

            this.props.onUpdate({
                view: gameUpdates.view
            });
        }

        if (Utilities.General.isWellDefinedValue(gameUpdates.points)) {
            score += (gameUpdates.points * combo);
            ++combo;
            // period = TODO
        }

        if (gameUpdates.mode === Utilities.Game.Mode.gameOver) {
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
            period = 0;
        }

        return {
            period: period,
            highScores: highScores,
            playerName: Utilities.Game.isValidPlayerName(gameUpdates.playerName) ? gameUpdates.playerName : Utilities.Game.defaultPlayerName,
            score: score,
            combo: combo,
            mode: Utilities.General.or(gameUpdates.mode, this.state.mode),
            difficulty: Utilities.General.or(gameUpdates.difficulty, this.state.difficulty)
        };
    };

    private readonly handleGameUpdates = (gameUpdates: GameUpdates) : void => {
        const nextState: GameState = this.transformGameState(gameUpdates);
        this.setState(nextState);
        Game.persistGameState(nextState);
    };

    private getOverlay() : JSX.Element {
        if (this.state.mode !== Utilities.Game.Mode.inGame) {
            return <Overlay view={this.props.view}
                            mode={this.state.mode}
                            playerName={this.state.playerName}
                            difficulty={this.state.difficulty}
                            highScores={this.state.highScores}
                            onQuit={this.quit}
                            onTogglePaused={this.togglePaused}
                            onToggleView={this.toggleView}
                            onStartNewGame={this.startNewGame}
                            onUpdate={this.handleGameUpdates}>
                   </Overlay>;
        }

        return undefined;
    };

    constructor(props: GameProps) {
        super(props);
        this.state = Game.getPersistedGameState();
    };

    shouldComponentUpdate(nextProps: GameProps, nextState: GameState) : boolean {
        return nextProps.view !== this.props.view
            || nextState.difficulty !== this.state.difficulty
            || nextState.combo !== this.state.combo
            || nextState.mode !== this.state.mode
            || nextState.score !== this.state.score
            || nextState.period !== this.state.period
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
            {this.getOverlay()}
            <MenuBar view={this.props.view}
                     mode={this.state.mode}
                     combo={this.state.combo}
                     score={this.state.score}
                     onChanges={this.handleGameUpdates}>
            </MenuBar>
            <Grid view={this.props.view}
                  mode={this.state.mode}
                  onUpdate={this.handleGameUpdates}>
            </Grid>
        </div>;
    };
};