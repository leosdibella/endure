import * as React from 'react';
import '../styles/menuBar.scss';
import { Utilities } from '../utilities/utilities';
import { GameUpdates } from './game';

enum ComboClass {
    Healthy = 'healthy-combo',
    Warning = 'warning-combo',
    Danger = 'danger-combo'
};

const comboClassMap: { [key: string]: ComboClass; } = {
    0: ComboClass.Danger,
    1: ComboClass.Warning,
    2: ComboClass.Healthy,
    3: ComboClass.Healthy
};

class CountDown {
    private static readonly millisecondsPerSecond: number = 1000;
    private static readonly decrementInterval: number = 17;
    private static readonly minimumViableCombo: number = 2;
    private milliseconds: number = 0;
    private menuBar: MenuBar;
    private interval: NodeJS.Timeout;

    constructor(menuBar: MenuBar) {
        this.menuBar = menuBar;
    };

    private readonly decrement = () => {
        if (this.menuBar.props.gameMode === Utilities.GameMode.inGame) {
            this.milliseconds -= CountDown.decrementInterval;

            if (this.milliseconds <= 0) {
                this.milliseconds = 0;

                this.menuBar.props.onChanges({
                    combo: 0
                });

                this.disable();
            } else {
                this.menuBar.setState({
                    countDown: this
                });
            }
        }

        if (this.menuBar.props.combo < CountDown.minimumViableCombo) {
            this.disable();
        }
    };

    reinitialize() {
        if (this.menuBar.props.combo >= CountDown.minimumViableCombo) {
            this.milliseconds = 3000;

            if (!Utilities.isWellDefinedValue(this.interval)) {
                this.interval = setInterval(this.decrement, CountDown.decrementInterval);
            }
        }
    };

    disable() : void {
        this.milliseconds = 0;

        if (Utilities.isWellDefinedValue(this.interval)) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    };

    getComboLayout() : JSX.Element {
        const seconds: number = Math.floor(this.milliseconds / CountDown.millisecondsPerSecond),
              milliseconds = this.milliseconds - (seconds * CountDown.millisecondsPerSecond);

        if (milliseconds === 0 || !Utilities.isGameInProgress(this.menuBar.props.gameMode)) {
            this.disable();
            return <div></div>;
        }
        
        return <span className={'menu-bar-combo-container'}>
            <span className='menu-bar-combo'>
                Combo: x
            </span>
            <span className='menu-bar-combo'>
                {this.menuBar.props.combo}
            </span>
            <span className={'menu-bar-count-down ' + comboClassMap[seconds]}>
                <span>
                    [
                </span>
                <span>
                    {seconds}
                </span>
                <span>
                    .
                </span>
                <span>
                    {milliseconds}
                </span>
                <span>
                    ]
                </span>
            </span>
        </span>;
    };
};

interface State {
    readonly countDown: CountDown;
    readonly grade: string;
}; 

export interface MenuBarProps {
    gameMode: Utilities.GameMode;
    viewMode: Utilities.ViewMode;
    combo: number;
    score: number;
    readonly onChanges: (gameUpdates: GameUpdates) => void;
};

export class MenuBar extends React.Component<MenuBarProps, State> {
    readonly state: State;
    
    constructor(props: MenuBarProps) {
        super(props);

        this.state = {
            grade: '', // TODO
            countDown: new CountDown(this)
        };
    };

    componentDidUpdate(previousProps: MenuBarProps) {
        if (this.props.combo > previousProps.combo) {
            this.state.countDown.reinitialize();
        }
    };

    componentWillUnmount() {
        this.state.countDown.disable();
    };

    render() {
        return <div className={'menu-bar ' + this.props.viewMode + (!Utilities.isGameInProgress(this.props.gameMode) ? ' hide': '')}>
            {this.state.countDown.getComboLayout()}
            <div className='menu-bar-grade'>

            </div>
            <span className='menu-bar-score'>
                {'Score: ' + this.props.score}
            </span>
        </div>;
    };
};