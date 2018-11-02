import * as React from 'react';
import '../styles/grade.scss';

interface State {
    readonly timer: Utilities.General.Timer;
    milliseconds: number;
};

interface Props {
    gradeIndex: Utilities.Game.GradeIndex;
    stage: number;
    difficulty: Utilities.Game.Difficulty;
    mode: Utilities.Game.Mode;
    readonly onUpdate: (updates: Utilities.Game.Updates) => void;
};

export class Grade extends React.Component<Props, State> {
    private static readonly timerModifier: number = 12;

    private static getTimerDependencies(stage: number, difficulty: Utilities.Game.Difficulty) : Utilities.General.TimerDependencies {
        let decrementInterval: number = Utilities.Grade.decrementIntervalBases[difficulty] - stage;

        return {
            decrementInterval: decrementInterval,
            totalDuration: decrementInterval * Grade.timerModifier
        };
    };

    readonly state: State;

    private readonly handleTimerUpdates = (milliseconds: number) : void => {
        this.setState({
            milliseconds: milliseconds
        });

        if (milliseconds === 0) {
            const updates: Utilities.Game.Updates = {
                gradeIndex: this.props.gradeIndex + 1
            };

            if (this.props.gradeIndex === Utilities.Game.GradeIndex.dMinus) {
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
            milliseconds: undefined
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

    shouldComponentUpdate(nextProps: Props, nextState: State) : boolean {
        return this.state.milliseconds !== nextState.milliseconds
            || this.props.gradeIndex !== nextProps.gradeIndex
            || this.props.difficulty !== nextProps.difficulty
            || this.props.stage !== nextProps.stage
            || this.props.mode !== nextProps.mode;
    };

    render() : JSX.Element {
        return <div className='grade-container'>
                    <div>
                        {Utilities.Game.grades[this.props.gradeIndex]}
                    </div>
               </div>;
    };
};