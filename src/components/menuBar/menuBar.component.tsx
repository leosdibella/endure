import * as React from 'react';
import '../../components/menuBar/menuBar.scss';
import { ViewModes } from '../../utilities/viewModes';
import { Utilities } from '../../utilities/utilities';

class Time {
    private timeout: NodeJS.Timeout; 
    private paused: boolean = true;
    private hours: number = 0;
    private minutes: number = 0;
    private seconds: number = 0;
    private menuBar: MenuBar;

    private static setValues(time: Time) : void {
        ++time.seconds;

        if (time.seconds > 59) {
            ++time.minutes;
            time.seconds = 0;
        }

        if (time.minutes > 59) {
            ++time.hours;
            time.minutes = 0;
        }

        time.startTimer();
    };

    private readonly incrementTime = () : void => Time.setValues(this);

    private startTimer() : void {
        this.timeout = setTimeout(this.incrementTime, 1000);
    };

    togglePaused(paused: boolean = false) : void {
        this.paused = Utilities.isWellDefinedValue(paused) ? paused : !this.paused;

        if (!this.paused && !Utilities.isWellDefinedValue(this.timeout)) {
            this.startTimer();
        } else {
            this.timeout = null;
        }
    };

    reset() : void {
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.paused = false;
    };

    getFormattedTime() : string {
        return this.hours + 'h ' + this.minutes + 'm ' + this.seconds + 's';
    };

    constructor(menuBar: MenuBar) {
        this.menuBar = menuBar;
    };
};

class CountDown {
    private seconds: number;
    private milliseconds: number;
    private menuBar: MenuBar;

    constructor(menuBar: MenuBar) {
        this.menuBar = menuBar;
    };

    getCountDownParts() : number[] {
        return [
            this.seconds, this.milliseconds
        ];
    };
};

class State {
    readonly time: Time;
    readonly countDown: CountDown;

    constructor(menuBar: MenuBar) {
        this.time = new Time(menuBar);
        this.countDown = new CountDown(menuBar);
    }
};

export class MenuBarProps {
    viewMode: ViewModes.Mode;
    combo: number;
    score: number;

    constructor(combo: number, viewMode: ViewModes.Mode, score: number) {
        this.combo = combo;
        this.viewMode = viewMode;
        this.score = score;
    };
};

export class MenuBar extends React.Component<MenuBarProps, State> {
    readonly state: State;
    
    constructor(props: MenuBarProps) {
        super(props);
        this.state = new State(this);
    };

    setState() {
        super.setState({

        });
    };

    render() {
        return <div className={'menu-bar ' + this.props.viewMode.baseClass}>
            <span>
                <span>
                    Combo: x
                </span>
                <span className='menu-bar-combo-counter'>
                    {this.props.combo}
                </span>
            </span>
            <span>
                {'Score: ' + this.props.score}
            </span>
            <span>
                {this.state.time.getFormattedTime()}
            </span>
        </div>;
    };
};