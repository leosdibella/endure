import * as React from 'react';
import '../styles/overlay.scss';
import { Utilities } from '../utilities/utilities';
import { OverlaySettings } from '../utilities/overlaySettings';
import { GameUpdates} from '../components/game';

interface OverlayState {
    selectedOptionIndex: number;
};

export interface OverlayProps {
    difficultyMode: Utilities.DifficultyMode;
    viewMode: Utilities.ViewMode;
    gameMode: Utilities.GameMode;
    readonly onTogglePaused: () => void;
    readonly onQuit: () => void;
    readonly onStartNewGame: () => void;
    readonly onToggleViewMode: () => void;
    readonly onUpdate: (gameUpdates: GameUpdates) => void;
};

export class Overlay extends React.Component<OverlayProps, OverlayState> {
    private updateGameMode(gameMode: Utilities.GameMode) : () => void {
        return () => {this.props.onUpdate({
                gameMode: gameMode
            });
        }
    };

    private initializegameModeOptions() : void {
        let options: OverlaySettings.Option[] =OverlaySettings.gameMode[Utilities.GameMode.newGame].options;
        
        options[0].action = this.props.onStartNewGame;
        options[1].action = this.updateGameMode(Utilities.GameMode.selectDifficulty);
        options[2].action = this.updateGameMode(Utilities.GameMode.viewHighScores);

        options = OverlaySettings.gameMode[Utilities.GameMode.selectDifficulty].options;

        for (let i = 0; i < options.length; ++i) {
            options[i].action = () => {
                this.props.onUpdate({
                    gameMode: Utilities.GameMode.newGame,
                    difficultyMode: i as Utilities.DifficultyMode
                });
            };
        }

        options = OverlaySettings.gameMode[Utilities.GameMode.gameOver].options;
        options[0].action = this.props.onStartNewGame;
        options[1].action = this.props.onQuit;

        options = OverlaySettings.gameMode[Utilities.GameMode.paused].options;
        options[0].action = this.props.onTogglePaused;
        options[1].action = this.props.onQuit;

        options = OverlaySettings.gameMode[Utilities.GameMode.quitConfirmation].options;
        options[0].action = this.props.onQuit;

        options[1].action = () => {
            this.props.onUpdate({
                gameMode: Utilities.GameMode.inGame
            });
        };

        options = OverlaySettings.gameMode[Utilities.GameMode.viewHighScores].options;
        options[0].action = this.props.onQuit;
    };
    
    constructor(props: OverlayProps) {
        super(props);

        this.initializegameModeOptions();

        this.state = {
            selectedOptionIndex: undefined
        };
    };

    private getOverlayTitle() : JSX.Element {
        if (this.props.gameMode !== Utilities.GameMode.inGame) {
            return <div key={1}
                        className={'overlay-' + OverlaySettings.gameMode[this.props.gameMode].className + '-text'}>
                        {OverlaySettings.gameMode[this.props.gameMode].title}
                   </div>;
        }

        return undefined;
    };

    private getOverlayExtras() : JSX.Element {
        if (this.props.gameMode === Utilities.GameMode.paused) {
            const extras: JSX.Element[] = [];

            for (let i = 0; i < OverlaySettings.viewMode.length; ++i) {
                extras.push( <label key={i}>
                                 <input type='radio'
                                        name='viewMode'
                                        value={OverlaySettings.viewMode[i].className}
                                        onChange={this.props.onToggleViewMode}
                                        checked={this.props.viewMode === OverlaySettings.viewMode[i].className}/>
                                 {OverlaySettings.viewMode[i].title}
                             </label>);
            }


            return <div key={2}
                        className='overlay-radio-panel'>
                        {extras}
                   </div>;
        }

        return undefined;
    };

    private getOverlayButtonPanel() : JSX.Element {
        const options: OverlaySettings.Option[] = OverlaySettings.gameMode[this.props.gameMode].options;

        if (Utilities.isWellDefinedValue(options)) {
            const buttons: JSX.Element[] = [];

            for (let i = 0; i < options.length; ++i) {
                buttons.push(<button key={i}
                                     className={'overlay-button' + (this.state.selectedOptionIndex === i ? ' overlay-selected-option': '')}
                                     onClick={options[i].action}>
                                 {options[i].name}
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

    shouldComponentUpdate(nextProps: OverlayProps, nextState: OverlayState) : boolean {
        return nextProps.gameMode !== this.props.gameMode || nextProps.viewMode !== this.props.viewMode || nextState.selectedOptionIndex !== this.state.selectedOptionIndex;
    };

    private static getOptionButton(selectedOptionIndex: number) : HTMLElement {
        return document.querySelector('.overlay-button-panel').children[selectedOptionIndex] as HTMLElement;
    };

    private getSelectedApplicationIndex() : number {
        const selectedOptionIndex: number = this.props.gameMode === Utilities.GameMode.selectDifficulty ? this.props.difficultyMode : OverlaySettings.gameMode[this.props.gameMode].defaultOptionsIndex;

        if (Utilities.isWellDefinedValue(selectedOptionIndex)) {
            const button: HTMLElement = Overlay.getOptionButton(selectedOptionIndex);

            if (Utilities.isGameInProgress(selectedOptionIndex)) {
                button.focus();
            }
        }

        return selectedOptionIndex;
    };

    componentDidUpdate(previousProps: OverlayProps, previousState: OverlayState) {
        if (previousProps.gameMode !== this.props.gameMode) {
            this.setState({
                selectedOptionIndex: this.getSelectedApplicationIndex()
            });
        }
    };

    private incrementOrDecrementOptionsIndex(direction: number) : void {
        const options: OverlaySettings.Option[] = OverlaySettings.gameMode[this.props.gameMode].options;

        if (Utilities.isWellDefinedValue(options)) {
            let selectedOptionIndex = this.state.selectedOptionIndex + direction;

            this.setState({
                selectedOptionIndex: selectedOptionIndex >= 0 ? (selectedOptionIndex % options.length) : options.length - 1
            });
        }
    };

    private readonly keyDownEventActionMap: { [key: string]: () => void } = {
        arrowup: () => {
            this.incrementOrDecrementOptionsIndex(-1);
        },
        arrowdown: () => {
            this.incrementOrDecrementOptionsIndex(1);
        },
        enter: () => {
            if (Utilities.isWellDefinedValue(this.state.selectedOptionIndex)) {
                const button: HTMLElement = Overlay.getOptionButton(this.state.selectedOptionIndex);
                button.click();
            }
        }
    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        const keyDownHandler = this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()];

        if (Utilities.isWellDefinedValue(keyDownHandler)) {
            keyDownHandler();
        }
    };

    componentDidMount() {
        document.addEventListener(Utilities.DomEvent.keyDown, this.onKeyDown);
        this.getSelectedApplicationIndex();
    };

    componentWillUnmount() {
        document.removeEventListener(Utilities.DomEvent.keyDown, this.onKeyDown);
    };

    render() {
        return <div className={'overlay-container ' + this.props.viewMode}>
                   <div className='overlay'>
                        {this.getOverlayBody()}
                   </div>
               </div>;
    };
};