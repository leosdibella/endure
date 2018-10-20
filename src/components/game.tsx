import * as React from 'react';
import '../styles/game.scss';
// import { Grid } from './grid';
import { MenuBar } from './menuBar';
import { Utilities } from '../utilities/utilities';
import { AppUpdates } from './app';
import { Overlay } from './overlay';

class GameState {
    gameMode: Utilities.GameMode = Utilities.GameMode.newGame;
    combo: number = 0;
    score: number = 0;
    period: number = 0;
    difficultyMode: Utilities.DifficultyMode = Utilities.DifficultyMode.medium;
    highScores: Utilities.HighScore[] = [];
    waiting: boolean = false;
    playerName: string = 'Anonymous';
};

export interface GameProps {
    viewMode: Utilities.ViewMode;
    readonly onUpdate: (appUpdates: AppUpdates) => void;
};

export interface GameUpdates {
    score?: number;
    combo?: number;
    gameMode?: Utilities.GameMode;
    difficultyMode?: Utilities.DifficultyMode;
    viewMode?: Utilities.ViewMode;
    highScore?: Utilities.HighScore;
    playerName?: string;
};

export class Game extends React.Component<GameProps, GameState> {
    private static readonly numberOfHighScoresToPersist: number = 10;
    readonly state: GameState;

    private static isValidPlayerName(playerName: string) {
        return Utilities.isWellDefinedValue(playerName) && playerName.trim() !== '';
    };

    private static getPersistedGameState() : GameState {
        const state: GameState = new GameState();

        if (Utilities.isLocalStorageSupported()) {
            const difficultyMode: string = window.localStorage.getItem(Utilities.LocalStorageKeys.difficultyMode),
                  highScores: string = window.localStorage.getItem(Utilities.LocalStorageKeys.highScores),
                  playerName: string = window.localStorage.getItem(Utilities.LocalStorageKeys.playerName);

            if (Utilities.isWellDefinedValue(difficultyMode)) {
                const parsedFifficultyMode: Utilities.DifficultyMode = parseInt(difficultyMode);

                if (parsedFifficultyMode >= Utilities.DifficultyMode.low || parsedFifficultyMode <= Utilities.DifficultyMode.expert) {
                    state.difficultyMode = parsedFifficultyMode;
                }
            };

            if (Utilities.isWellDefinedValue(highScores)) {
                const parsedHighScores = JSON.parse(highScores);

                if (Array.isArray(parsedHighScores)) {
                    state.highScores = parsedHighScores;
                }
            }

            if (Game.isValidPlayerName(playerName)) {
                state.playerName = playerName;
            }
        }

        return state;
    };

    private persistGameState(state: GameState) : void {
        if (Utilities.isLocalStorageSupported()) {
            window.localStorage.setItem(Utilities.LocalStorageKeys.difficultyMode, state.difficultyMode.toString());
            window.localStorage.setItem(Utilities.LocalStorageKeys.highScores, JSON.stringify(state.highScores));

            if (Game.isValidPlayerName(state.playerName)) {
                window.localStorage.setItem(Utilities.LocalStorageKeys.playerName, state.playerName);
            }
        }
    }

    private readonly startNewGame = () : void => {
        if (this.state.gameMode === Utilities.GameMode.newGame) {
            this.setState({
                gameMode: Utilities.GameMode.inGame
            });
        }
    };

    private readonly quit = () : void => {
        if (this.state.gameMode === Utilities.GameMode.inGame) {
            this.setState({
                gameMode: Utilities.GameMode.quitConfirmation
            });
        } else {
            this.setState({
                gameMode: Utilities.GameMode.newGame,
                combo: 0,
                score: 0
            });
        }
    };

    private readonly togglePaused = () : void => {
        if (Utilities.isGameInProgress(this.state.gameMode)) {
            this.setState({
                gameMode: this.state.gameMode === Utilities.GameMode.paused ? Utilities.GameMode.inGame : Utilities.GameMode.paused
            });
        }
    };

    private readonly toggleViewMode = () : void => {
        this.props.onUpdate({
            viewMode: this.props.viewMode === Utilities.ViewMode.dark ? Utilities.ViewMode.light : Utilities.ViewMode.dark
        });
    };
    
    private readonly cheat = () : void => {
        if (Utilities.isGameInProgress(this.state.gameMode)) {
            this.setState({
                combo: this.state.combo + 1
            });
        }
    };

    private readonly handleGameUpdates = (gameUpdates: GameUpdates) : void => {
        if (Utilities.isWellDefinedValue(gameUpdates.difficultyMode)) {
            gameUpdates.gameMode = Utilities.GameMode.newGame;
        }

        if (Utilities.isWellDefinedValue(gameUpdates.viewMode)) {
            gameUpdates.gameMode = Utilities.GameMode.newGame;

            this.props.onUpdate({
                viewMode: gameUpdates.viewMode
            });
        }

        const nextState: GameState = {
            period: this.state.period,
            waiting: this.state.waiting,
            highScores: [{
                name: 'banano',
                value: 100000000,
                date: '10/19/2018'
            }, {
                name: 'manzana',
                value: 999999,
                date: '10/18/2018'
            }], /// TODO
            playerName: Game.isValidPlayerName(gameUpdates.playerName) ? gameUpdates.playerName : this.state.playerName,
            score: Utilities.or(gameUpdates.score, this.state.score),
            combo: Utilities.or(gameUpdates.combo, this.state.combo),
            gameMode: Utilities.or(gameUpdates.gameMode, this.state.gameMode),
            difficultyMode: Utilities.or(gameUpdates.difficultyMode, this.state.difficultyMode)
        };

        if (Utilities.isWellDefinedValue(gameUpdates.highScore)) {
            nextState.highScores = this.state.highScores.concat(gameUpdates.highScore)
                                                        .sort((a, b) => b.value - a.value)
                                                        .slice(0, Game.numberOfHighScoresToPersist);;
        }

        this.setState(nextState);
        this.persistGameState(nextState);
    };

    private getOverlay() : JSX.Element {
        if (this.state.gameMode !== Utilities.GameMode.inGame) {
            return <Overlay viewMode={this.props.viewMode}
                            gameMode={this.state.gameMode}
                            playerName={this.state.playerName}
                            difficultyMode={this.state.difficultyMode}
                            highScores={this.state.highScores}
                            onQuit={this.quit}
                            onTogglePaused={this.togglePaused}
                            onToggleViewMode={this.toggleViewMode}
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

    private readonly keyDownEventActionMap: { [key: string]: () => void } = {
        p: this.togglePaused,
        v: this.toggleViewMode,
        q: this.quit,
        c: this.cheat
    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        const keyDownHandler = this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()];

        if (Utilities.isWellDefinedValue(keyDownHandler)) {
            keyDownHandler();
        }
    };

    shouldComponentUpdate(nextProps: GameProps, nextState: GameState) : boolean {
        return nextProps.viewMode !== this.props.viewMode
            || nextState.difficultyMode !== this.state.difficultyMode
            || nextState.combo !== this.state.combo
            || nextState.gameMode !== this.state.gameMode
            || nextState.score !== this.state.score
            || nextState.period !== this.state.period
            || nextState.playerName !== this.state.playerName;
    };

    componentDidMount() {
        document.addEventListener(Utilities.DomEvent.keyDown, this.onKeyDown);
    };

    componentWillUnmount() {
        document.removeEventListener(Utilities.DomEvent.keyDown, this.onKeyDown);
    };

    render() {
        /* layoutElements.push(<Grid key={2}
                                      viewMode={this.state.viewMode}
                                      gameMode={this.state.gameMode}
                                      onChanges={this.handleGameUpdates}>
                                </Grid>);*/

        return <div className={'game ' + this.props.viewMode}>
            {this.getOverlay()}
            <MenuBar viewMode={this.props.viewMode}
                     gameMode={this.state.gameMode}
                     combo={this.state.combo}
                     score={this.state.score}
                     onChanges={this.handleGameUpdates}>
            </MenuBar>
        </div>;
    };
};