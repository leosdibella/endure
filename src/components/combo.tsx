import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/combo.scss';

export class Combo extends React.PureComponent<Utilities.Combo.IProps, Utilities.Combo.State> {
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
            const updates: Utilities.Game.IUpdate = {
                dropCombo: true
            };

            this.props.onUpdate(updates);
        }
    };

    readonly state: Utilities.Combo.State = new Utilities.Combo.State(this.handleTimerUpdates);

    private initializeTimer() : void {
        const timerDependencies: Utilities.General.TimerDependencies = Combo.getTimerDependencies(this.props.stage, this.props.difficulty);
        this.state.timer.initialize(timerDependencies.decrementInterval, timerDependencies.totalDuration);
    };

    componentDidUpdate(previousProps: Utilities.Combo.IProps, previousState: Utilities.Combo.State) : void {
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
        const seconds: number = Math.floor(this.state.milliseconds / Utilities.General.Timer.millisecondsPerSecond),
              milliseconds = this.state.milliseconds - (seconds * Utilities.General.Timer.millisecondsPerSecond);

        return <span className={'top-bar-combo-container ' + Utilities.App.Theme[this.props.theme] + (this.state.milliseconds === 0 ? ' hide': '')}>
                    <span className='top-bar-combo'>
                        Combo: x
                    </span>
                    <span className='top-bar-combo'>
                        {this.props.combo}
                    </span>
                    <span className='top-bar-count-down '
                          style={Utilities.Combo.getClassFromMillisecondsRemaining(seconds, this.props.difficulty, this.props.stage, this.props.theme)}>
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