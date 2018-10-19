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
    grade: number = 0;
    waiting: boolean = false;
};

export interface GameProps {
    viewMode: Utilities.ViewMode;
    difficultyMode: Utilities.DifficultyMode;
    readonly onUpdate: (appUpdates: AppUpdates) => void;
};

export interface GameUpdates {
    score?: number;
    combo?: number;
    gameMode?: Utilities.GameMode;
    difficultyMode?: Utilities.DifficultyMode;
};

export class Game extends React.Component<GameProps, GameState> {
    readonly state: GameState = new GameState();

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
                score: 0,
                grade: 0
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
            gameUpdates.gameMode = Utilities.GameMode.inGame;
        }

        if (Utilities.isWellDefinedValue(gameUpdates.difficultyMode)) {
            this.props.onUpdate({
                difficultyMode: gameUpdates.difficultyMode
            });
        }

        const partialState = {
            score: Utilities.or(gameUpdates.score, this.state.score),
            combo: Utilities.or(gameUpdates.combo, this.state.combo),
            gameMode: Utilities.or(gameUpdates.gameMode, this.state.gameMode)
        };
    
        this.setState(partialState);
    };

    private getOverlay() : JSX.Element {
        if (this.state.gameMode !== Utilities.GameMode.inGame) {
            return <Overlay viewMode={this.props.viewMode}
                            gameMode={this.state.gameMode}
                            difficultyMode={this.props.difficultyMode}
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
            || nextProps.difficultyMode !== this.props.difficultyMode
            || nextState.combo !== this.state.combo
            || nextState.gameMode !== this.state.gameMode
            || nextState.score !== this.state.score;
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