import * as React from 'react';

import * as AppUtilities from '../utilities/app';
import * as GameUtilities from '../utilities/game';
import * as GeneralUtilities from '../utilities/general';
import * as GradeUtilities from '../utilities/grade';

import '../styles/grade.scss';

class Grade extends React.PureComponent<GradeUtilities.IProps, GradeUtilities.State> {
    private expandGradeFill(timeFraction: number): void {
        this.setState({
            fillRadiusPercentage: ((1 - timeFraction) * 100).toFixed(2) + '%'
        });
    }

    private onAnimationComplete(): void {
        this.props.onUpdate({
            letterGrade: this.props.letterGrade + 1
        });
    }

    private getDuration(): number {
        return GradeUtilities.durations[this.props.difficulty] - (GradeUtilities.durationModifiers[this.props.difficulty] * this.props.stage);
    }

    public readonly state: GradeUtilities.State = new GradeUtilities.State(this.expandGradeFill.bind(this), this.getDuration(), this.onAnimationComplete.bind(this));

    public componentDidUpdate(previousProps: GradeUtilities.IProps): void {
        if (this.props.mode === GameUtilities.Mode.paused) {
            this.state.animator.togglePaused();
        } else if (this.props.mode === GameUtilities.Mode.inGame) {
            if (previousProps.mode === GameUtilities.Mode.paused) {
                this.state.animator.togglePaused();
            } else if (this.props.letterGrade !== previousProps.letterGrade && this.props.letterGrade !== AppUtilities.LetterGrade.f) {
                this.state.animator.animate(this.getDuration());
            }
        } else {
            this.state.animator.cancel();
        }
    }

    public render(): JSX.Element {
        const style: GeneralUtilities.ICssStyle = {
            height: this.state.fillRadiusPercentage,
            width: this.state.fillRadiusPercentage
        };

        return <div className={'grade-container ' + AppUtilities.Theme[this.props.theme]}>
                    <div className='grade-letter-grade'>
                        {GradeUtilities.letterGrades[this.props.letterGrade]}
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