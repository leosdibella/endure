import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/gameOverlay.scss';

interface State {
    playerName: string;
    selectedOptionIndex: number;
};

interface Props {
    difficulty: Utilities.Game.Difficulty;
    view: Utilities.App.View;
    mode: Utilities.Game.Mode;
    highScores: Utilities.Game.HighScore[];
    playerName: string;
    readonly onTogglePaused: () => void;
    readonly onQuit: () => void;
    readonly onStartNewGame: () => void;
    readonly onToggleView: () => void;
    readonly onUpdate: (updates: Utilities.Game.Updates) => void;
};

export class GameOverlay extends React.PureComponent<Props, State> {
    private readonly actions: (() => void)[][] = [];

    private readonly keyDownEventActionMap: { [key: string]: () => void } = {
        arrowup: () => {
            this.incrementOrDecrementOptionsIndex(-1);
        },
        arrowdown: () => {
            this.incrementOrDecrementOptionsIndex(1);
        },
        enter: () => {
            this.actions[this.props.mode][this.state.selectedOptionIndex]();
        }
    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        const keyDownHandler = this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()];

        if (Utilities.General.isWellDefinedValue(keyDownHandler)) {
            keyDownHandler();
        }
    };

    private updateGame(mode: Utilities.Game.Mode, difficulty?: Utilities.Game.Difficulty, view?: Utilities.App.View, playerName?: string) : () => void {
        return () => {
            this.props.onUpdate({
                mode: mode,
                difficulty: difficulty,
                view: view,
                playerName: playerName
            });
        };
    };

    private readonly saveNameChanges = () : void => {
        this.updateGame(Utilities.Game.Mode.newGame, undefined, undefined, this.state.playerName)();
    };

    private readonly handleNameChanges = (event: React.ChangeEvent<HTMLInputElement>) : void => {
        this.setState({
            playerName: event.target.value
        });
    };

    private initializeActions() : void {
        let actions: (() => void)[];

        for (let i = 0; i < Utilities.GameOverlay.menus.length; ++i) {
            this.actions[i] = [];
        }

        actions = this.actions[Utilities.Game.Mode.newGame];
        actions[0] = this.props.onStartNewGame;
        actions[1] = this.updateGame(Utilities.Game.Mode.specifyName);
        actions[2] = this.updateGame(Utilities.Game.Mode.selectDifficulty);
        actions[3] = this.updateGame(Utilities.Game.Mode.highScores);
        actions[4] = this.updateGame(Utilities.Game.Mode.setView);

        actions = this.actions[Utilities.Game.Mode.specifyName];
        actions[0] = this.saveNameChanges;
        actions[1] = this.updateGame(Utilities.Game.Mode.newGame);

        actions = this.actions[Utilities.Game.Mode.selectDifficulty];

        for (let i = Utilities.GameOverlay.menus[Utilities.Game.Mode.selectDifficulty].options.length - 1; i >= 0; --i) {
            actions[i] = this.updateGame(Utilities.Game.Mode.newGame, i);
        }

        actions = this.actions[Utilities.Game.Mode.gameOver];
        actions[0] = this.props.onStartNewGame;
        actions[1] = this.props.onQuit;

        actions = this.actions[Utilities.Game.Mode.paused];
        actions[0] = this.props.onTogglePaused;
        actions[1] = this.props.onQuit;

        actions = this.actions[Utilities.Game.Mode.quitConfirmation];
        actions[0] = this.props.onQuit;
        actions[1] = this.updateGame(Utilities.Game.Mode.inGame);

        actions = this.actions[Utilities.Game.Mode.highScores];
        actions[0] = this.updateGame(Utilities.Game.Mode.newGame);

        actions = this.actions[Utilities.Game.Mode.setView];
        actions[0] = this.updateGame(Utilities.Game.Mode.newGame, undefined, Utilities.App.View.light);
        actions[1] = this.updateGame(Utilities.Game.Mode.newGame, undefined, Utilities.App.View.dark);
    };

    private getGameOverlayTitle() : JSX.Element {
        if (this.props.mode !== Utilities.Game.Mode.inGame) {
            const overlayTile: JSX.Element = <div className={'game-overlay-tile ' + this.props.view}>
                                             </div>

            return <div key={1}
                        className={'game-overlay-' + Utilities.GameOverlay.menus[this.props.mode].className + '-text'}>
                        {overlayTile}
                        {Utilities.GameOverlay.menus[this.props.mode].title}
                        {overlayTile}
                   </div>;
        }

        return undefined;
    };

    private getGameOverlayExtras() : JSX.Element {
        if (this.props.mode === Utilities.Game.Mode.highScores) {
            const localHighScores: JSX.Element[] = this.props.highScores.map((s, i) => <div key={i}
                                                                                            className='game-overlay-high-score'>
                                                                                            <div>
                                                                                                <span>
                                                                                                    {s.date}
                                                                                                </span>
                                                                                                <span>
                                                                                                    {s.name}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>
                                                                                                </span>
                                                                                                <span>
                                                                                                    {s.value}
                                                                                                </span>
                                                                                            </div>
                                                                                       </div>),
                  globalHighScores: JSX.Element[] = [];

            return <div key={2}
                        className='game-overlay-high-scores-listings'>
                <div className={'game-overlay-high-scores-local game-overlay-high-scores-listing ' + this.props.view}>
                    <div className='game-overlay-high-scores-listing-title'>
                        You
                    </div>
                    {localHighScores}
                    <div className={'game-overlay-no-high-scores' + (localHighScores.length > 0 ? ' hide' : '')}>
                        Nothing yet ...
                    </div>
                </div>
                <div className={'game-overlay-high-scores-listing-separator ' + this.props.view}>
                </div>
                <div className={'game-overlay-high-scores-global game-overlay-high-scores-listing ' + this.props.view}>
                    <div className='game-overlay-high-scores-listing-title'>
                        The Entire Class
                    </div>
                    {globalHighScores}
                    <div className={'game-overlay-no-high-scores' + (globalHighScores.length > 0 ? ' hide' : '')}>
                        Nothing yet ...
                    </div>
                </div>
            </div>
        }

        if (this.props.mode === Utilities.Game.Mode.specifyName) {
            return <div key={2}
                        className='game-overlay-player-name-input-container'>
                        <input value={this.state.playerName}
                               className={this.props.view}
                               onChange={this.handleNameChanges}/>
                   </div>
        }

        return undefined;
    };

    private getGameOverlayButtonPanel() : JSX.Element {
        const options: string[] = Utilities.GameOverlay.menus[this.props.mode].options;

        if (Utilities.General.isWellDefinedValue(options)) {
            const buttons: JSX.Element[] = [];

            for (let i = 0; i < options.length; ++i) {
                buttons.push(<button key={i}
                                     className={'game-overlay-button' + (this.state.selectedOptionIndex === i ? ' game-overlay-selected-option': '')}
                                     onClick={this.actions[this.props.mode][i]}>
                                 {options[i]}
                             </button>);
            }

            return <div key={3}
                        className='game-overlay-button-panel'>
                       {buttons}
                   </div>;
        }

        return undefined;
    };

    private getGameOverlayBody() : JSX.Element[] {
        const overleyBody: JSX.Element[] = [
            this.getGameOverlayTitle(),
            this.getGameOverlayExtras(),
            this.getGameOverlayButtonPanel()
        ];

        return overleyBody.filter(jsx => Utilities.General.isWellDefinedValue(jsx));
    };

    private getDefaultOptionIndex() : number {
        if (this.props.mode === Utilities.Game.Mode.selectDifficulty) {
            return this.props.difficulty;
        }

        if (this.props.mode === Utilities.Game.Mode.setView) {
            return this.props.view === Utilities.App.View.light ? 0 : 1
        }

        return Utilities.GameOverlay.menus[this.props.mode].defaultOptionsIndex;
    };

    private updateState(optionIndex: number) : void {
        this.setState({
            selectedOptionIndex: optionIndex
        });
    };

    private incrementOrDecrementOptionsIndex(direction: number) : void {
        const options: string[] = Utilities.GameOverlay.menus[this.props.mode].options;

        if (Utilities.General.isWellDefinedValue(options)) {
            let optionIndex = this.state.selectedOptionIndex + direction;
            optionIndex = optionIndex >= 0 ? (optionIndex % options.length) : (options.length - 1);

            this.updateState(optionIndex);
        }
    };

    constructor(props: Props) {
        super(props);

        this.initializeActions();

        this.state = {
            playerName: this.props.playerName,
            selectedOptionIndex: this.getDefaultOptionIndex()
        };
    };
    
    componentDidUpdate(previousProps: Props, previousState: State) : void {
        if (previousProps.mode !== this.props.mode) {
            this.updateState(this.getDefaultOptionIndex());
        }

        if (this.props.mode !== Utilities.Game.Mode.specifyName) {
            this.setState({
                playerName: this.props.playerName
            });
        }
    };

    componentDidMount() : void {
        document.addEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    componentWillUnmount() : void {
        document.removeEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    render() : JSX.Element {
        return <div className={'game-overlay-container ' + this.props.view}>
                   <div className='game-overlay'>
                        {this.getGameOverlayBody()}
                   </div>
               </div>;
    };
};