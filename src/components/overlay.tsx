import * as React from 'react';
import '../styles/backdrop.scss';
import { Utilities } from '../utilities/utilities';
import { OverlaySettings } from '../utilities/overlaySettings';
import { GameUpdates} from '../components/game';

interface OverlayState {
    selectedOptionIndex: number,
    previousGameMode: Utilities.GameMode;
};

export interface OverlayProps {
    viewMode: Utilities.ViewMode;
    gameMode: Utilities.GameMode;
    readonly onTogglePaused: () => void;
    readonly onQuit: () => void;
    readonly onStartNewGame: () => void;
    readonly onToggleViewMode: () => void;
    readonly onUpdate: (gameUpdates: GameUpdates) => void;
};

export class Overlay extends React.Component<OverlayProps, OverlayState> {
    private initializegameModeOptions() : void {
        let options: OverlaySettings.Option[] = OverlaySettings.gameMode[1].options;

        for (let i = 0; i < options.length; ++i) {
            options[i].action = () => {
                this.props.onUpdate({
                    difficultyMode: i as Utilities.DifficultyMode
                });
            };
        }

        options = OverlaySettings.gameMode[3].options;
        options[0].action = this.props.onStartNewGame;
        options[1].action = this.props.onQuit;

        options = OverlaySettings.gameMode[4].options;
        options[0].action = this.props.onTogglePaused;
        options[1].action = this.props.onQuit;

        options = OverlaySettings.gameMode[5].options;
        options[0].action = this.props.onQuit;

        options[1].action = () => {
            this.props.onUpdate({
                gameMode: this.state.previousGameMode
            });
        };
    };
    
    constructor(props: OverlayProps) {
        super(props);

        this.initializegameModeOptions();

        this.state = {
            previousGameMode: undefined,
            selectedOptionIndex: undefined
        };
    };

    private getOverlayTitle() : JSX.Element {
        if (this.props.gameMode !== Utilities.GameMode.inGame) {
            const title: JSX.Element[] = OverlaySettings.gameMode[this.props.gameMode].title.split('').map((letter, index) => <span key={index}>
                                                                                                                                    {letter}
                                                                                                                              </span>);
            return <div key={1}
                        className={OverlaySettings.gameMode[this.props.gameMode].className + '-text'}>
                       {title}
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
                        className='overlay-radio-container'>
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

    componentDidUpdate(previousProps: OverlayProps, previousState: OverlayState) {
        if (previousProps.gameMode !== this.props.gameMode) {
            const selectedOptionIndex: number = OverlaySettings.gameMode[this.props.gameMode].defaultOptionsIndex;

            if (Utilities.isWellDefinedValue(selectedOptionIndex)) {
                const button: HTMLElement = Overlay.getOptionButton(selectedOptionIndex);

                if (Utilities.isGameInProgress(selectedOptionIndex)) {
                    button.focus();
                }
            }

            this.setState({
                selectedOptionIndex: selectedOptionIndex,
                previousGameMode: previousProps.gameMode
            });
        }
    };

    private incrementOrDecrementOptionsIndex(direction: number) : void {
        const options: OverlaySettings.Option[] = OverlaySettings.gameMode[this.props.gameMode].options;

        if (Utilities.isWellDefinedValue(options)) {
            this.setState({
                selectedOptionIndex: this.state.selectedOptionIndex - 1 & options.length
            });
        }
    };

    private readonly keypressEventActionMap: { [key: string]: () => void } = {
        up: () => {
            this.incrementOrDecrementOptionsIndex(-1);
        },
        down: () => {
            this.incrementOrDecrementOptionsIndex(1);
        },
        enter: () => {
            if (Utilities.isWellDefinedValue(this.state.selectedOptionIndex)) {
                const button: HTMLElement = Overlay.getOptionButton(this.state.selectedOptionIndex);
                button.click();
            }
        }
    };

    private readonly onKeyPress = (keyboardEvent: KeyboardEvent) : void => {
        this.keypressEventActionMap[keyboardEvent.key.toLowerCase()]();
    };

    componentDidMount() {
        document.addEventListener(Utilities.DomEvent.keyPress, this.onKeyPress);
    };

    componentWillUnmount() {
        document.removeEventListener(Utilities.DomEvent.keyPress, this.onKeyPress);
    };

    render() {
        return <div className='overlay-container'>
                   <div className='overlay'>
                        {this.getOverlayBody()}
                   </div>
               </div>;
    };
};