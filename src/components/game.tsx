import * as React from 'react';
import '../styles/game.scss';
// import { Grid } from './grid';
import { MenuBar } from './menuBar';
import { Utilities } from '../utilities/utilities';
import { AppUpdates } from './app';
import { Overlay } from './overlay';

class GameState {
    gameMode: Utilities.GameMode = Utilities.GameMode.newGame;
    difficultyMode: Utilities.DifficultyMode;
    combo: number = 0;
    score: number = 0;
    waiting: boolean = false;
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
};

export class Game extends React.Component<GameProps, GameState> {
    readonly state: GameState = new GameState();

    private readonly startNewGame = () : void => {
        if (this.state.gameMode === Utilities.GameMode.newGame) {
            this.setState({
                gameMode: Utilities.isWellDefinedValue(this.state.difficultyMode) ? Utilities.GameMode.inGame : Utilities.GameMode.selectDifficulty
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
                difficultyMode: undefined
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

        this.setState(gameUpdates as GameState);
    };

    private getOverlay() : JSX.Element {
        if (!Utilities.isGameInProgress(this.state.gameMode)) {
            return <Overlay viewMode={this.props.viewMode}
                             gameMode={this.state.gameMode}
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

    private readonly keypressEventActionMap: { [key: string]: () => void } = {
        p: this.togglePaused,
        v: this.toggleViewMode,
        q: this.quit,
        enter: this.startNewGame,
        c: this.cheat
    };

    private readonly onKeyPress = (keyboardEvent: KeyboardEvent) : void => {
        this.keypressEventActionMap[keyboardEvent.key.toLowerCase()]();
    };

    private getLayout() : JSX.Element[] {
        const layoutElements: JSX.Element[] = [];

        if (Utilities.isGameInProgress(this.state.gameMode)) {
            layoutElements.push(<MenuBar key={1}
                                         viewMode={this.props.viewMode}
                                         gameMode={this.state.gameMode}
                                         combo={this.state.combo}
                                         score={this.state.score}
                                         onChanges={this.handleGameUpdates}>
                                </MenuBar>);

            /*layoutElements.push(<Grid key={2}
                                      viewMode={this.state.viewMode}
                                      gameMode={this.state.gameMode}
                                      onChanges={this.handleGameUpdates}>
                                </Grid>);*/
        }

        return layoutElements;
    }

    shouldComponentUpdate(nextProps: GameProps, nextState: GameState) : boolean {
        return nextProps.viewMode !== this.props.viewMode
            || nextState.combo !== this.state.combo
            || nextState.gameMode !== this.state.gameMode
            || nextState.score !== this.state.score;
    };

    componentDidMount() {
        document.addEventListener(Utilities.DomEvent.keyPress, this.onKeyPress);
    };

    componentWillUnmount() {
        document.removeEventListener(Utilities.DomEvent.keyPress, this.onKeyPress);
    };

    render() {
        return <div className={'game ' + this.props.viewMode}>
            {this.getOverlay()}
            {this.getLayout()}
        </div>;
    };
};