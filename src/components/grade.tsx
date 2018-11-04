import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/grade.scss';

interface State {
    readonly timer: Utilities.General.Timer;
    milliseconds: number;
};

interface Props {
    gradeIndex: number;
    stage: number;
    difficulty: Utilities.Game.Difficulty;
    mode: Utilities.Game.Mode;
    readonly onUpdate: (updates: Utilities.Game.Updates) => void;
};

export class Grade extends React.PureComponent<Props, State> {
    readonly state: State;

    private static getTimerDependencies(stage: number, difficulty: Utilities.Game.Difficulty) : Utilities.General.TimerDependencies {
        let decrementInterval: number = Utilities.Grade.decrementIntervalBases[difficulty] + (stage * Utilities.Grade.stageDurationModifier);

        return {
            decrementInterval: decrementInterval,
            totalDuration: decrementInterval * Utilities.Grade.timerModifier
        };
    };

    private readonly handleTimerUpdates = (milliseconds: number) : void => {
        this.setState({
            milliseconds: milliseconds
        });

        if (milliseconds === 0) {
            const updates: Utilities.Game.Updates = {
                gradeIndex: this.props.gradeIndex + 1
            };

            if (updates.gradeIndex === Utilities.Grade.values.length - 1) {
                updates.mode = Utilities.Game.Mode.gameOver;
            }

            this.props.onUpdate(updates);
        }
    };

    private initializeTimer() : void {
        const timerDependencies: Utilities.General.TimerDependencies = Grade.getTimerDependencies(this.props.stage, this.props.difficulty);
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
                        {Utilities.Grade.values[this.props.gradeIndex]}
                    </div>
               </div>;
    };
};