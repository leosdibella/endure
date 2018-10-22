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

// TODO, make own component
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
        if (this.menuBar.props.mode === Utilities.Game.Mode.inGame) {
            this.milliseconds -= CountDown.decrementInterval;

            if (this.milliseconds <= 0) {
                this.milliseconds = 0;

                this.menuBar.props.onChanges({
                    dropCombo: true
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

            if (!Utilities.General.isWellDefinedValue(this.interval)) {
                this.interval = setInterval(this.decrement, CountDown.decrementInterval);
            }
        }
    };

    disable() : void {
        this.milliseconds = 0;

        if (Utilities.General.isWellDefinedValue(this.interval)) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    };

    getComboLayout() : JSX.Element {
        const seconds: number = Math.floor(this.milliseconds / CountDown.millisecondsPerSecond),
              milliseconds = this.milliseconds - (seconds * CountDown.millisecondsPerSecond);

        if (milliseconds === 0 || !Utilities.Game.isInProgress(this.menuBar.props.mode)) {
            this.disable();
            
            return <div>
                   </div>;
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
    mode: Utilities.Game.Mode;
    view: Utilities.App.View;
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

    componentDidUpdate(previousProps: MenuBarProps) : void {
        if (this.props.combo > previousProps.combo) {
            this.state.countDown.reinitialize();
        }
    };

    componentWillUnmount() : void {
        this.state.countDown.disable();
    };

    render() : JSX.Element {
        // TODO Add Grade, period and name
        return <div className={'menu-bar ' + this.props.view + (!Utilities.Game.isInProgress(this.props.mode) ? ' hide': '')}>
            {this.state.countDown.getComboLayout()}
            <span className='menu-bar-score'>
                {'Score: ' + this.props.score}
            </span>
        </div>;
    };
};