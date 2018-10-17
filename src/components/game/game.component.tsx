import * as React from 'react';
import '../../components/game/game.scss';
import { Grid } from '../../components/grid/grid.component';
import { ViewModes } from '../../utilities/viewModes';
import { MenuBar } from '../../components/menuBar/menuBar.component';

enum GameMode {
    NewGame = 0,
    InGame,
    GameOver,
    Pause
};

class State {
    allowInteraction: boolean = false;
    gameMode: GameMode = GameMode.GameOver;
    viewMode: ViewModes.Mode = ViewModes.DARK_MODE;
    combo: number = 0;
    score: number = 0;

    set setViewMode(viewMode: ViewModes.Mode) {
        this.viewMode = viewMode;
    }
}

const initialState: State = new State();

export interface GameUpdates {
    score: number;
    combo: number;
};

export class Game extends React.Component<object, State> {
    private static readonly endure: string[] = 'endure'.split('');
    private static readonly gameOver: string[] = 'GameOver'.split('');

    readonly state: State = initialState;

    readonly startNewGame = () : void => {
        this.setState({
            allowInteraction: true,
            gameMode: GameMode.InGame
        });
    };

    readonly showNewGameScreen = () : void => {
        this.setState({
            allowInteraction: false,
            gameMode: GameMode.NewGame
        })
    };

    private injectOverlayIntoOverlayContainer(overlay: JSX.Element[], onClick?: () => void) : JSX.Element {
        return <div className='game-overlay-container' onClick={onClick}>
            <div className='game-overlay'>
                {overlay}
            </div>
        </div>;
    };

    getOverlay() : JSX.Element {
        switch (this.state.gameMode) {
            case GameMode.InGame: {
                return null;
            }
            case GameMode.NewGame: {
                const overlay: JSX.Element[] = Game.endure.map((letter, index) => <span key={index} className='new-game-text'>{letter}</span>);

                return this.injectOverlayIntoOverlayContainer(overlay, this.startNewGame);
            }
            case GameMode.GameOver: {
                const overlay: JSX.Element[] = Game.gameOver.map((letter, index) => <span key={index} className='game-over-text'>{letter}</span>)
                                                            .concat(<div key={Game.gameOver.length} className="game-over-options-container">
                                                                        <button onClick={this.startNewGame}>
                                                                            New Game
                                                                        </button>
                                                                        <button onClick={this.showNewGameScreen}>
                                                                            Quit
                                                                        </button>
                                                            </div>);

                return this.injectOverlayIntoOverlayContainer(overlay);
            }

        }
    };

    constructor(props: object) {
        super(props);
    };

    readonly handleUpdates = (gameUpdates: GameUpdates) : void => {
        this.setState({
            score: gameUpdates.score,
            combo: gameUpdates.combo
        });
    };

    render() {
        return <div className={'game ' + this.state.viewMode.baseClass}>
            {this.getOverlay()}
            <MenuBar viewMode={this.state.viewMode} combo={this.state.combo} score={this.state.score}></MenuBar>
            <Grid viewMode={this.state.viewMode} allowInteraction={this.state.allowInteraction} onChanges={this.handleUpdates}></Grid>
        </div>;
    };
};