import * as React from 'react';

import * as GameUtilities from '../utilities/game';
import * as GradeUtilities from '../utilities/grade';
import * as Shared from '../utilities/shared';

import '../styles/grade.scss';

class Grade extends React.PureComponent<GradeUtilities.IProps, GradeUtilities.State> {
    private expandGradeFill(timeFraction: number): void {
        this.setState({
            fillRadiusPercentage: `${((1 - timeFraction) * Shared.totalPercentage).toFixed(Shared.percentageDecimalPlaceCutoff)}%`
        });
    }

    private onAnimationComplete(): void {
        this.props.onUpdate({
            letterGrade: this.props.letterGrade + 1
        });
    }

    private getDuration(): number {
        return GradeUtilities.State.durations[this.props.difficulty] - (GradeUtilities.State.durationModifiers[this.props.difficulty] * this.props.stage);
    }

    public readonly state: GradeUtilities.State = new GradeUtilities.State(this.expandGradeFill.bind(this), this.getDuration(), this.onAnimationComplete.bind(this));

    public componentDidUpdate(previousProps: GradeUtilities.IProps): void {
        if (this.props.mode === GameUtilities.Mode.paused) {
            this.state.animator.togglePaused();
        } else if (this.props.mode === GameUtilities.Mode.inGame) {
            if (previousProps.mode === GameUtilities.Mode.paused) {
                this.state.animator.togglePaused();
            } else if (this.props.letterGrade !== previousProps.letterGrade && this.props.letterGrade !== Shared.LetterGrade.f) {
                this.state.animator.animate(this.getDuration());
            }
        } else {
            this.state.animator.cancel();
        }
    }

    public render(): JSX.Element {
        const style: Shared.ICssStyle = {
            height: this.state.fillRadiusPercentage,
            width: this.state.fillRadiusPercentage
        };

        return <div className={`grade-container ${Shared.Theme[this.props.theme]}`}>
                    <div className='grade-letter-grade'>
                        {GradeUtilities.State.letterGrades[this.props.letterGrade]}
                    </div>
                    <div className='grade-fill'
                         style={style}>
                    </div>
               </div>;
    }
}

export {
    Grade
};