import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/grade.scss';

export class Grade extends React.PureComponent<Utilities.Grade.IProps, Utilities.Grade.State> {
    private readonly handleTimerUpdates = (milliseconds: number) : void => {
        this.setState({
            milliseconds: milliseconds
        });

        if (milliseconds === 0) {
            const updates: Utilities.Game.IUpdate = {
                letterGrade: this.props.letterGrade + 1
            };

            if (updates.letterGrade === Utilities.Grade.LetterGrade.f) {
                updates.mode = Utilities.Game.Mode.gameOver;
            }

            this.props.onUpdate(updates);
        }
    };

    readonly state: Utilities.Grade.State = new Utilities.Grade.State(this.handleTimerUpdates);

    private static getTimerDependencies(stage: number, difficulty: Utilities.Game.Difficulty) : Utilities.General.TimerDependencies {
        let decrementInterval: number = Utilities.Grade.decrementIntervalBases[difficulty] + (stage * Utilities.Grade.stageDurationModifier);

        return {
            decrementInterval: decrementInterval,
            totalDuration: decrementInterval * Utilities.Grade.timerModifier
        };
    };

    private initializeTimer() : void {
        const timerDependencies: Utilities.General.TimerDependencies = Grade.getTimerDependencies(this.props.stage, this.props.difficulty);
        this.state.timer.initialize(timerDependencies.decrementInterval, timerDependencies.totalDuration);
    };

    componentDidUpdate(previousProps: Utilities.Grade.IProps, previousState: Utilities.Grade.State) : void {
        if (this.props.mode === Utilities.Game.Mode.paused) {
            this.state.timer.togglePaused(true);
        } else if (this.props.mode === Utilities.Game.Mode.inGame) {
            if (this.state.milliseconds === 0 || previousProps.stage !== this.props.stage) {
                this.initializeTimer();
            } else {
                this.state.timer.togglePaused(false);
            }
        } else {
            this.state.timer.disable();
        }
    };

    render() : JSX.Element {
        return <div className='grade-container'>
                    <div>
                        {Utilities.Grade.letterGrades[this.props.letterGrade]}
                    </div>
               </div>;
    };
};