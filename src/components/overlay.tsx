import * as React from 'react';
import '../styles/backdrop.scss';
import { Utilities } from '../utilities/utilities';
import { GameUpdates} from '../components/game';

const gameModeTitles: string[] = [
    'endure',
    'Select Difficulty',
    undefined,
    'Game Over',
    'Paused',
    'Really Quit?'
];

const gameModeClassNames: string[] = [
    'new-game',
    'select-difficulty',
    undefined,
    'game-over',
    'paused',
    'quit-confirmation'
];

const difficultyOptions: string[] = [
    'Take it easy bud!',
    'Take off the training wheels',
    'Test me sensei',
    'Just wreck my shit please'
];

const defaultOverlayOptionIndices: number[] = [
    undefined,
    1,
    undefined,
    0,
    0,
    1
];

const viewModeTitles: string[] = [
    'Light Mode',
    'Dark Mode'
];

const viewModeValues: Utilities.ViewMode[] = [
    Utilities.ViewMode.light,
    Utilities.ViewMode.dark
];

interface OverlayOption {
    name: string;
    action: () => void;
};

interface OverlayState {
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
    readonly gameModeOverlayOptions: OverlayOption[][] = [];

    private initializeGameModeOverlayOptions() : void {
        this.gameModeOverlayOptions.push(undefined);

        const overlayOptions: OverlayOption[] = [];

        for (let i = 0; i < difficultyOptions.length; ++i) {
            overlayOptions.push({
                name: difficultyOptions[i],
                action: () => {
                    this.props.onUpdate({
                        difficultyMode: i as Utilities.DifficultyMode
                    });
                }
            });
        }

        this.gameModeOverlayOptions.push(overlayOptions);
        this.gameModeOverlayOptions.push(undefined);

        this.gameModeOverlayOptions.push([{
            name: 'New Game',
            action: this.props.onStartNewGame
        }, {
            name: 'Quit',
            action: this.props.onQuit
        }]);

        this.gameModeOverlayOptions.push([{
            name: 'Resume',
            action: this.props.onTogglePaused
        }, {
            name: 'Quit',
            action: this.props.onQuit
        }]);

        this.gameModeOverlayOptions.push([{
            name: 'Yes',
            action: this.props.onQuit
        }, {
            name: 'No',
            action: () => {
                this.props.onUpdate({
                    gameMode: this.state.previousGameMode
                });
            }
        }]);
    };
    
    constructor(props: OverlayProps) {
        super(props);

        this.initializeGameModeOverlayOptions();

        this.state = {
            previousGameMode: undefined
        };
    };

    private getOverlayTitle() : JSX.Element {
        if (this.props.gameMode !== Utilities.GameMode.inGame) {
            const title: JSX.Element[] = gameModeTitles[this.props.gameMode].split('').map((letter, index) => <span key={index}>
                                                                                                                   {letter}
                                                                                                              </span>);
            return <div key={1}
                        className={gameModeClassNames[this.props.gameMode] + '-text'}>
                       {title}
                   </div>;
        }

        return undefined;
    };

    private getOverlayExtras() : JSX.Element {
        if (this.props.gameMode === Utilities.GameMode.paused) {
            const extras: JSX.Element[] = [];

            for (let i = 0; i < viewModeTitles.length; ++i) {
                extras.push( <label key={i}>
                                 <input type='radio'
                                        name='viewMode'
                                        value={viewModeValues[i]}
                                        onChange={this.props.onToggleViewMode}
                                        checked={this.props.viewMode === viewModeValues[i]}/>
                                 {viewModeTitles[i]}
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
        const overlayOptions: OverlayOption[] = this.gameModeOverlayOptions[this.props.gameMode];

        if (Utilities.isWellDefinedValue(overlayOptions)) {
            const buttons: JSX.Element[] = [];

            for (let i = 0; i < overlayOptions.length; ++i) {
                buttons.push(<button key={i}
                                     onClick={overlayOptions[i].action}>
                                 {overlayOptions[i].name}
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
        return nextProps.gameMode !== this.props.gameMode || nextProps.viewMode !== this.props.viewMode;
    };

    componentDidUpdate(previousProps: OverlayProps, previousState: OverlayState) {
        if (previousProps.gameMode !== this.props.gameMode) {
            const focusIndex: number = defaultOverlayOptionIndices[this.props.gameMode];

            if (Utilities.isWellDefinedValue(focusIndex)) {
                const button: HTMLElement = document.querySelector('overlay-button-panel').children[focusIndex] as HTMLElement;

                if (Utilities.isGameInProgress(focusIndex)) {
                    button.focus();
                }
            }
        }

        this.setState({
            previousGameMode: previousProps.gameMode
        });
    };

    render() {
        return <div className='overlay-container'>
                   <div className='overlay'>
                        {this.getOverlayBody()}
                   </div>
               </div>;
    };
};