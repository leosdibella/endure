import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/combo.scss';

interface State {
    readonly timer: Utilities.General.Timer;
    milliseconds: number;
};

interface Props {
    combo: number;
    gradeIndex: number;
    stage: number;
    difficulty: Utilities.Game.Difficulty;
    mode: Utilities.Game.Mode;
    readonly onUpdate: (updates: Utilities.Game.Updates) => void;
};

export class Combo extends React.PureComponent<Props, State> {
    readonly state: State;

    private static getTimerDependencies(stage: number, difficulty: Utilities.Game.Difficulty) : Utilities.General.TimerDependencies {
        return {
            decrementInterval: Utilities.Combo.decrementInterval,
            totalDuration: Utilities.Combo.totalDurationBases[difficulty] + (stage * Utilities.Combo.stageDurationModifier)
        };
    };

    private readonly handleTimerUpdates = (milliseconds: number) : void => {
        this.setState({
            milliseconds: milliseconds
        });

        if (milliseconds === 0) {
            const updates: Utilities.Game.Updates = {
                dropCombo: true
            };

            this.props.onUpdate(updates);
        }
    };

    private initializeTimer() : void {
        const timerDependencies: Utilities.General.TimerDependencies = Combo.getTimerDependencies(this.props.stage, this.props.difficulty);
        this.state.timer.initialize(timerDependencies.decrementInterval, timerDependencies.totalDuration);
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            timer: new Utilities.General.Timer(this.handleTimerUpdates),
            milliseconds: 0
        };
    };

    componentDidUpdate(previousProps: Props, previousState: State) : void {
        if (this.props.mode === Utilities.Game.Mode.paused) {
            this.state.timer.togglePaused(true);
        } else if (this.props.mode === Utilities.Game.Mode.inGame) {
            if (this.props.combo < Utilities.Combo.minimumViableCombo) {
                this.state.timer.disable();
            } else {
                if (this.state.milliseconds === 0 || this.props.combo > previousProps.combo) {
                    this.initializeTimer();
                } else {
                    this.state.timer.togglePaused(false);
                }
            }
        } else {
            this.state.timer.disable();
        }
    };
    
    render() : JSX.Element {
        const seconds: number = Math.floor(this.state.milliseconds / Utilities.General.millisecondsPerSecond),
              milliseconds = this.state.milliseconds - (seconds * Utilities.General.millisecondsPerSecond);

        return <span className={'top-bar-combo-container' + (this.state.milliseconds === 0 ? ' hide': '')}>
                    <span className='top-bar-combo'>
                        Combo: x
                    </span>
                    <span className='top-bar-combo'>
                        {this.props.combo}
                    </span>
                    <span className={'top-bar-count-down ' + Utilities.Combo.getClassFromMillisecondsRemaining(seconds, this.props.difficulty, this.props.stage)}>
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