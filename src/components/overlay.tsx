import * as React from 'react';
import '../styles/overlay.scss';
import { Utilities } from '../utilities/utilities';
import { GameUpdates} from '../components/game';

interface OverlayState {
    playerName: string;
    selectedOptionIndex: number;
};

export interface OverlayProps {
    difficulty: Utilities.Game.Difficulty;
    view: Utilities.App.View;
    mode: Utilities.Game.Mode;
    highScores: Utilities.Game.HighScore[];
    playerName: string;
    readonly onTogglePaused: () => void;
    readonly onQuit: () => void;
    readonly onStartNewGame: () => void;
    readonly onToggleView: () => void;
    readonly onUpdate: (gameUpdates: GameUpdates) => void;
};

export class Overlay extends React.Component<OverlayProps, OverlayState> {
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

        for (let i = 0; i < Utilities.Overlay.menus.length; ++i) {
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

        for (let i = Utilities.Overlay.menus[Utilities.Game.Mode.selectDifficulty].options.length - 1; i >= 0; --i) {
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

    private getOverlayTitle() : JSX.Element {
        if (this.props.mode !== Utilities.Game.Mode.inGame) {
            const overlayTile: JSX.Element = <div className={'overlay-tile ' + this.props.view}>
                                             </div>

            return <div key={1}
                        className={'overlay-' + Utilities.Overlay.menus[this.props.mode].className + '-text'}>
                        {overlayTile}
                        {Utilities.Overlay.menus[this.props.mode].title}
                        {overlayTile}
                   </div>;
        }

        return undefined;
    };

    private getOverlayExtras() : JSX.Element {
        if (this.props.mode === Utilities.Game.Mode.highScores) {
            const localHighScores: JSX.Element[] = this.props.highScores.map((s, i) => <div key={i}
                                                                                            className='overlay-high-score'>
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
                        className='overlay-high-scores-listings'>
                <div className={'overlay-high-scores-local overlay-high-scores-listing ' + this.props.view}>
                    <div className='overlay-high-scores-listing-title'>
                        You
                    </div>
                    {localHighScores}
                    <div className={'overlay-no-high-scores' + (localHighScores.length > 0 ? ' hide' : '')}>
                        Nothing yet ...
                    </div>
                </div>
                <div className={'overlay-high-scores-listing-separator ' + this.props.view}>
                </div>
                <div className={'overlay-high-scores-global overlay-high-scores-listing ' + this.props.view}>
                    <div className='overlay-high-scores-listing-title'>
                        The Entire Class
                    </div>
                    {globalHighScores}
                    <div className={'overlay-no-high-scores' + (globalHighScores.length > 0 ? ' hide' : '')}>
                        Nothing yet ...
                    </div>
                </div>
            </div>
        }

        if (this.props.mode === Utilities.Game.Mode.specifyName) {
            return <div key={2}
                        className='overlay-player-name-input-container'>
                        <input value={this.state.playerName}
                               className={this.props.view}
                               onChange={this.handleNameChanges}/>
                   </div>
        }

        return undefined;
    };

    private getOverlayButtonPanel() : JSX.Element {
        const options: string[] = Utilities.Overlay.menus[this.props.mode].options;

        if (Utilities.General.isWellDefinedValue(options)) {
            const buttons: JSX.Element[] = [];

            for (let i = 0; i < options.length; ++i) {
                buttons.push(<button key={i}
                                     className={'overlay-button' + (this.state.selectedOptionIndex === i ? ' overlay-selected-option': '')}
                                     onClick={this.actions[this.props.mode][i]}>
                                 {options[i]}
                             </button>);
            }

            return <div key={3}
                        className='overlay-button-panel'>
                       {buttons}
                   </div>;
        }

        return undefined;
    };

    private getOverlayBody() : JSX.Element[] {
        const overleyBody: JSX.Element[] = [
            this.getOverlayTitle(),
            this.getOverlayExtras(),
            this.getOverlayButtonPanel()
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

        return Utilities.Overlay.menus[this.props.mode].defaultOptionsIndex;
    };

    private updateOverlayState(optionIndex: number) : void {
        this.setState({
            selectedOptionIndex: optionIndex
        });
    };

    private incrementOrDecrementOptionsIndex(direction: number) : void {
        const options: string[] = Utilities.Overlay.menus[this.props.mode].options;

        if (Utilities.General.isWellDefinedValue(options)) {
            let optionIndex = this.state.selectedOptionIndex + direction;
            optionIndex = optionIndex >= 0 ? (optionIndex % options.length) : (options.length - 1);

            this.updateOverlayState(optionIndex);
        }
    };

    constructor(props: OverlayProps) {
        super(props);

        this.initializeActions();

        this.state = {
            playerName: this.props.playerName,
            selectedOptionIndex: this.getDefaultOptionIndex()
        };
    };

    shouldComponentUpdate(nextProps: OverlayProps, nextState: OverlayState) : boolean {
        return nextProps.mode !== this.props.mode
            || nextProps.view !== this.props.view
            || nextState.selectedOptionIndex !== this.state.selectedOptionIndex
            || nextState.playerName !== this.state.playerName;
    };
    
    componentDidUpdate(previousProps: OverlayProps, previousState: OverlayState) : void {
        if (previousProps.mode !== this.props.mode) {
            this.updateOverlayState(this.getDefaultOptionIndex());
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
        return <div className={'overlay-container ' + this.props.view}>
                   <div className='overlay'>
                        {this.getOverlayBody()}
                   </div>
               </div>;
    };
};