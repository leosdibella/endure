import * as React from 'react';
import '../styles/topBar.scss';
import { Utilities } from '../utilities/utilities';

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
    private topBar: TopBar;
    private interval: NodeJS.Timeout;

    constructor(topBar: TopBar) {
        this.topBar = topBar;
    };

    private readonly decrement = () => {
        if (this.topBar.props.mode === Utilities.Game.Mode.inGame) {
            this.milliseconds -= CountDown.decrementInterval;

            if (this.milliseconds <= 0) {
                this.milliseconds = 0;

                this.topBar.props.onChanges({
                    dropCombo: true
                });

                this.disable();
            } else {
                this.topBar.setState({
                    countDown: this
                });
            }
        }

        if (this.topBar.props.combo < CountDown.minimumViableCombo) {
            this.disable();
        }
    };

    reinitialize() {
        if (this.topBar.props.combo >= CountDown.minimumViableCombo) {
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

        if (milliseconds === 0 || !Utilities.Game.isInProgress(this.topBar.props.mode)) {
            this.disable();
            
            return <div>
                   </div>;
        }
        
        return <span className={'top-bar-combo-container'}>
            <span className='top-bar-combo'>
                Combo: x
            </span>
            <span className='top-bar-combo'>
                {this.topBar.props.combo}
            </span>
            <span className={'top-bar-count-down ' + comboClassMap[seconds]}>
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

export interface TopBarProps {
    mode: Utilities.Game.Mode;
    view: Utilities.App.View;
    combo: number;
    score: number;
    readonly onChanges: (updates: Utilities.Game.Updates) => void;
};

export class TopBar extends React.Component<TopBarProps, State> {
    readonly state: State;
    
    constructor(props: TopBarProps) {
        super(props);

        this.state = {
            grade: '', // TODO
            countDown: new CountDown(this)
        };
    };

    componentDidUpdate(previousProps: TopBarProps) : void {
        if (this.props.combo > previousProps.combo) {
            this.state.countDown.reinitialize();
        }
    };

    componentWillUnmount() : void {
        this.state.countDown.disable();
    };

    render() : JSX.Element {
        // TODO Add Grade, period and name
        return <div className={'top-bar ' + this.props.view + (!Utilities.Game.isInProgress(this.props.mode) ? ' hide': '')}>
            {this.state.countDown.getComboLayout()}
            <span className='top-bar-score'>
                {'Score: ' + this.props.score}
            </span>
        </div>;
    };
};