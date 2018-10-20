import * as React from 'react';
import '../styles/overlay.scss';
import { Utilities } from '../utilities/utilities';
import { GameUpdates} from '../components/game';

interface Setting {
    title: string;
    className: string;
    defaultOptionsIndex?: number;
    options: string[]
};

interface OverlayState {
    playerName: string;
    selectedOptionIndex: number;
};

export interface OverlayProps {
    difficultyMode: Utilities.DifficultyMode;
    viewMode: Utilities.ViewMode;
    gameMode: Utilities.GameMode;
    highScores: Utilities.HighScore[];
    playerName: string;
    readonly onTogglePaused: () => void;
    readonly onQuit: () => void;
    readonly onStartNewGame: () => void;
    readonly onToggleViewMode: () => void;
    readonly onUpdate: (gameUpdates: GameUpdates) => void;
};

export class Overlay extends React.Component<OverlayProps, OverlayState> {
    private static readonly settings: Setting[] = [{
        title: 'Endure',
        className: 'new-game',
        defaultOptionsIndex: 0,
        options: ['New Game', 'Set Player Name', 'Set Difficulty', 'View High Scores', 'Set View Mode']
    }, {
        title: 'Who Are You?',
        className: 'player-name',
        defaultOptionsIndex: 1,
        options: ['Remember it!', 'Forget it.']
    }, {
        title: 'Grade Level',
        className: 'select-difficulty',
        options: ['(Pre-K): I made poop.',  '(K - 5): No I don\'t wanna!', '(6 - 8): Remove the training wheels!', '(9 - 12): Test me sensei!', '(12+): I know kung fu.']
    },
    undefined,
    {
        title: 'Game Over',
        className: 'game-over',
        defaultOptionsIndex: 0,
        options: ['Put me in coach!', 'I Quit.']
    }, {
        title: 'Timeout',
        className: 'paused',
        defaultOptionsIndex: 0,
        options: ['Put me in coach!', 'I Quit.']
    }, {
        title: 'Quit?',
        className: 'quit-confirmation',
        defaultOptionsIndex: 1,
        options: ['Yep', 'Nope']
    }, {
        title: 'Class Ranking',
        className: 'high-scores',
        defaultOptionsIndex: 0,
        options: ['Leave']
    }, {
        title: 'Lights On?',
        className: 'view-mode',
        options: ['Yep', 'Nope']
    }];

    private readonly actions: (() => void)[][] = [];

    private readonly keyDownEventActionMap: { [key: string]: () => void } = {
        arrowup: () => {
            this.incrementOrDecrementOptionsIndex(-1);
        },
        arrowdown: () => {
            this.incrementOrDecrementOptionsIndex(1);
        },
        enter: () => {
            this.actions[this.props.gameMode][this.state.selectedOptionIndex]();
        }
    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        const keyDownHandler = this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()];

        if (Utilities.isWellDefinedValue(keyDownHandler)) {
            keyDownHandler();
        }
    };

    private updateGame(gameMode: Utilities.GameMode, difficultyMode?: Utilities.DifficultyMode, viewMode?: Utilities.ViewMode, playerName?: string) : () => void {
        return () => {
            this.props.onUpdate({
                gameMode: gameMode,
                difficultyMode: difficultyMode,
                viewMode: viewMode,
                playerName: playerName
            });
        };
    };

    private readonly saveNameChanges = () : void => {
        this.updateGame(Utilities.GameMode.newGame, undefined, undefined, this.state.playerName)();
    };

    private initializeActions() : void {
        let actions: (() => void)[];

        for (let i = 0; i < Overlay.settings.length; ++i) {
            this.actions[i] = [];
        }

        actions = this.actions[Utilities.GameMode.newGame];
        actions[0] = this.props.onStartNewGame;
        actions[1] = this.updateGame(Utilities.GameMode.specifyName);
        actions[2] = this.updateGame(Utilities.GameMode.selectDifficulty);
        actions[3] = this.updateGame(Utilities.GameMode.highScores);
        actions[4] = this.updateGame(Utilities.GameMode.setViewMode);

        actions = this.actions[Utilities.GameMode.specifyName];
        actions[0] = this.saveNameChanges;
        actions[1] = this.updateGame(Utilities.GameMode.newGame);

        actions = this.actions[Utilities.GameMode.selectDifficulty];

        for (let i = Overlay.settings[Utilities.GameMode.selectDifficulty].options.length - 1; i >= 0; --i) {
            actions[i] = this.updateGame(Utilities.GameMode.newGame, i);
        }

        actions = this.actions[Utilities.GameMode.gameOver];
        actions[0] = this.props.onStartNewGame;
        actions[1] = this.props.onQuit;

        actions = this.actions[Utilities.GameMode.paused];
        actions[0] = this.props.onTogglePaused;
        actions[1] = this.props.onQuit;

        actions = this.actions[Utilities.GameMode.quitConfirmation];
        actions[0] = this.props.onQuit;
        actions[1] = this.updateGame(Utilities.GameMode.inGame);

        actions = this.actions[Utilities.GameMode.highScores];
        actions[0] = this.updateGame(Utilities.GameMode.newGame);

        actions = this.actions[Utilities.GameMode.setViewMode];
        actions[0] = this.updateGame(Utilities.GameMode.newGame, undefined, Utilities.ViewMode.light);
        actions[1] = this.updateGame(Utilities.GameMode.newGame, undefined, Utilities.ViewMode.dark);
    };

    private getOverlayTitle() : JSX.Element {
        if (this.props.gameMode !== Utilities.GameMode.inGame) {
            const overlayTile: JSX.Element = <div className={'overlay-tile ' + this.props.viewMode}>
                                             </div>

            return <div key={1}
                        className={'overlay-' + Overlay.settings[this.props.gameMode].className + '-text'}>
                        {overlayTile}
                        {Overlay.settings[this.props.gameMode].title}
                        {overlayTile}
                   </div>;
        }

        return undefined;
    };

    private getOverlayExtras() : JSX.Element {
        if (this.props.gameMode === Utilities.GameMode.highScores) {
            const localHighScores: JSX.Element[] = this.props.highScores.map((s, i) => <div key={i}
                                                                                            className='overlay-high-score'>
                                                                                            <span>
                                                                                                {s.date} - {s.name}
                                                                                            </span>
                                                                                            <span>
                                                                                                {s.value}
                                                                                            </span>
                                                                                       </div>),
                  globalHighScores: JSX.Element[] = [];

            return <div key={2}
                        className='overlay-high-scores-listings'>
                <div className='overlay-high-scores-local overlay-high-scores-listing'>
                    <div>
                        Your High Scores:
                    </div>
                    {localHighScores}
                </div>
                <div className='overlay-high-scores-global overlay-high-scores-listing'>
                    {globalHighScores}
                </div>
            </div>
        }

        if (this.props.gameMode === Utilities.GameMode.newGame) {
            return <div key={2}
                        className='test'>
            </div>
        }

        return undefined;
    };

    private getOverlayButtonPanel() : JSX.Element {
        const options: string[] = Overlay.settings[this.props.gameMode].options;

        if (Utilities.isWellDefinedValue(options)) {
            const buttons: JSX.Element[] = [];

            for (let i = 0; i < options.length; ++i) {
                buttons.push(<button key={i}
                                     className={'overlay-button' + (this.state.selectedOptionIndex === i ? ' overlay-selected-option': '')}
                                     onClick={this.actions[this.props.gameMode][i]}>
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

        return overleyBody.filter(jsx => Utilities.isWellDefinedValue(jsx));
    };

    private getDefaultOptionIndex() : number {
        if (this.props.gameMode === Utilities.GameMode.selectDifficulty) {
            return this.props.difficultyMode;
        }

        if (this.props.gameMode === Utilities.GameMode.setViewMode) {
            return this.props.viewMode === Utilities.ViewMode.light ? 0 : 1
        }

        return Overlay.settings[this.props.gameMode].defaultOptionsIndex;
    };

    private updateOverlayState(optionIndex: number) {
        this.setState({
            selectedOptionIndex: optionIndex
        });
    };

    private incrementOrDecrementOptionsIndex(direction: number) : void {
        const options: string[] = Overlay.settings[this.props.gameMode].options;

        if (Utilities.isWellDefinedValue(options)) {
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
        return nextProps.gameMode !== this.props.gameMode
            || nextProps.viewMode !== this.props.viewMode
            || nextState.selectedOptionIndex !== this.state.selectedOptionIndex;
    };
    
    componentDidUpdate(previousProps: OverlayProps, previousState: OverlayState) {
        if (previousProps.gameMode !== this.props.gameMode) {
            this.updateOverlayState(this.getDefaultOptionIndex());
        }
    };

    componentDidMount() : void {
        document.addEventListener(Utilities.DomEvent.keyDown, this.onKeyDown);
    };

    componentWillUnmount() : void {
        document.removeEventListener(Utilities.DomEvent.keyDown, this.onKeyDown);
    };

    render() : JSX.Element {
        return <div className={'overlay-container ' + this.props.viewMode}>
                   <div className='overlay'>
                        {this.getOverlayBody()}
                   </div>
               </div>;
    };
};