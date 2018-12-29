import * as React from 'react';
import { GradeState } from '../classes/gradeState';
import { ICssStyle } from '../interfaces/iCssStyle';
import { IGradeProps } from '../interfaces/iGradeProps';
import { GameMode, LetterGrade, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';

import '../styles/grade.scss';

export class Grade extends React.PureComponent<IGradeProps, GradeState> {
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
        return GradeState.durations[this.props.difficulty] - (GradeState.durationModifiers[this.props.difficulty] * this.props.stage);
    }

    public readonly state: GradeState = new  GradeState(); // GradeState(this.expandGradeFill.bind(this), this.getDuration(), this.onAnimationComplete.bind(this));

    /* public componentDidUpdate(previousProps: IGradeProps): void {
        // TODO: Fix THIS
        if (this.props.gameMode === GameMode.paused) {
            this.state.animator.togglePaused();
        } else if (this.props.gameMode === GameMode.inGame) {
            if (previousProps.gameMode === GameMode.paused) {
                this.state.animator.togglePaused();
            } else if (this.props.letterGrade !== previousProps.letterGrade && this.props.letterGrade !== LetterGrade.f) {
                this.state.animator.animate();
            }
        } else {
            this.state.animator.cancel();
        }
    } */

    public render(): JSX.Element {
        const style: ICssStyle = {
            height: this.state.fillRadiusPercentage,
            width: this.state.fillRadiusPercentage
        };

        return <div className={`grade-container ${Theme[this.props.theme]}`}>
                    <div className='grade-letter-grade'>
                        {GradeState.letterGrades[this.props.letterGrade]}
                    </div>
                    <div className='grade-fill'
                         style={style}>
                    </div>
               </div>;
    }
}