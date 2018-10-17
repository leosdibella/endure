import * as React from 'react';
import '../../components/game/game.scss';
import { Grid } from '../../components/grid/grid.component';
import { ViewModes } from '../../utilities/viewModes';
import { MenuBar } from '../../components/menuBar/menuBar.component';
import { Utilities } from '../../utilities/utilities';

export enum GameMode {
    NewGame = 0,
    InGame,
    GameOver,
    Paused
};

class State {
    gameMode: GameMode = GameMode.NewGame;
    viewMode: ViewModes.Mode = ViewModes.DARK_MODE;
    combo: number = 0;
    score: number = 0;
};

export interface GameUpdates {
    score?: number;
    combo: number;
};

export class Game extends React.Component<object, State> {
    private static readonly endure: string[] = 'endure'.split('');
    private static readonly gameOver: string[] = 'GameOver'.split('');
    private static readonly paused: string[] = 'Paused'.split('');

    readonly state: State = new State();

    static isInProgress(gameMode: GameMode): boolean {
        return gameMode === GameMode.InGame || gameMode === GameMode.Paused;
    };

    private readonly startNewGame = () : void => {
        if (!Game.isInProgress(this.state.gameMode)) {
            this.setState({
                gameMode: GameMode.InGame
            });
        }
    };

    private readonly showNewGameScreen = () : void => {
        this.setState({
            gameMode: GameMode.NewGame,
            combo: 0,
            score: 0
        });
    };

    private readonly togglePaused = () : void => {
        if (Game.isInProgress(this.state.gameMode)) {
            this.setState({
                gameMode: this.state.gameMode === GameMode.Paused ? GameMode.InGame : GameMode.Paused
            });
        }
    };

    private readonly toggleViewMode = () : void => {
        this.setState({
            viewMode: this.state.viewMode === ViewModes.DARK_MODE ? ViewModes.LIOHT_MODE : ViewModes.DARK_MODE
        });
    };

    private injectOverlayIntoOverlayContainer(overlay: JSX.Element[], onClick?: () => void) : JSX.Element {
        return <div className='game-overlay-container'
                    onClick={onClick}>
            <div className='game-overlay'>
                {overlay}
            </div>
        </div>;
    };

    private getOverlay() : JSX.Element {
        switch (this.state.gameMode) {
            case GameMode.InGame: {
                return null;
            }
            case GameMode.NewGame: {
                const overlay: JSX.Element[] = Game.endure.map((letter, index) => <span key={index}
                                                                                        className='new-game-text'>
                                                                                        {letter}
                                                                                    </span>);

                return this.injectOverlayIntoOverlayContainer(overlay, this.startNewGame);
            }
            case GameMode.GameOver: {
                const overlay: JSX.Element[] = Game.gameOver.map((letter, index) => <span key={index}
                                                                                        className='game-over-text'>
                                                                                        {letter}
                                                                                    </span>)
                                                            .concat(<div key={Game.gameOver.length}
                                                                         className='game-button-panel'>
                                                                        <button onClick={this.startNewGame}>
                                                                            New Game
                                                                        </button>
                                                                        <button onClick={this.showNewGameScreen}>
                                                                            Quit
                                                                        </button>
                                                                    </div>);

                return this.injectOverlayIntoOverlayContainer(overlay);
            }
            case GameMode.Paused: {
                const overlay: JSX.Element[] = Game.paused.map((letter, index) => <span key={index}
                                                                                        className='paused-text'>
                                                                                        {letter}
                                                                                    </span>)
                                                          .concat(<div key={Game.paused.length}
                                                                       className='view-mode-radio-container'>
                                                            <label>
                                                                <input type='radio'
                                                                       name='viewMode'
                                                                       value='dark'
                                                                       onChange={this.toggleViewMode}
                                                                       checked={this.state.viewMode === ViewModes.LIOHT_MODE}/> Light Mode
                                                            </label>
                                                            <label>
                                                                <input type='radio'
                                                                       name='viewMode'
                                                                       value='light'
                                                                       onChange={this.toggleViewMode}
                                                                       checked={this.state.viewMode === ViewModes.DARK_MODE}/> Dark Mode
                                                            </label>
                                                          </div>)
                                                          .concat(<div key={Game.paused.length + 1}
                                                                       className='game-button-panel'>
                                                                <button onClick={this.togglePaused}>
                                                                    Resume
                                                                </button>
                                                                <button onClick={this.showNewGameScreen}>
                                                                    Quit
                                                                </button>
                                                          </div>)

                return this.injectOverlayIntoOverlayContainer(overlay);
            }
        }
    };

    constructor(props: object) {
        super(props);
    };

    private readonly handleUpdates = (gameUpdates: GameUpdates) : void => {
        this.setState({
            score: Utilities.isWellDefinedValue(gameUpdates.score) ? gameUpdates.score : this.state.score,
            combo: gameUpdates.combo
        });
    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        switch (keyboardEvent.key.toUpperCase()) {
            case 'P': {
                this.togglePaused();
                break;
            }
            case 'V': {
                this.toggleViewMode();
                break;
            }
            case 'C': {
                this.setState({
                    combo: this.state.combo + 1
                });

                break;
            }
            case 'Q': {
                this.showNewGameScreen();
                break;
            }
            case 'ENTER': {
                this.startNewGame();
                break;
            }
            default: {
                break;
            }
        }
    };

    private getLayout() : JSX.Element[] {
        const layoutElements: JSX.Element[] = [];

        if (Game.isInProgress(this.state.gameMode)) {
            layoutElements.push(<MenuBar key={1}
                                         viewMode={this.state.viewMode}
                                         gameMode={this.state.gameMode}
                                         combo={this.state.combo}
                                         score={this.state.score}
                                         onChanges={this.handleUpdates}>
                                </MenuBar>);

            layoutElements.push(<Grid key={2}
                                      viewMode={this.state.viewMode}
                                      gameMode={this.state.gameMode}
                                      onChanges={this.handleUpdates}>
                                </Grid>);
        }

        return layoutElements;
    }

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
    };

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
    };

    render() {
        return <div className={'game ' + this.state.viewMode.baseClass}>
            {this.getOverlay()}
            {this.getLayout()}
        </div>;
    };
};