import * as React from 'react';
import { Animator } from '../classes/animator';
import { GradeState } from '../classes/gradeState';
import { ICssStyle } from '../interfaces/iCssStyle';
import { IGradeProps } from '../interfaces/iGradeProps';
import { LetterGrade } from '../utilities/enum';
import * as Shared from '../utilities/shared';

import '../styles/grade.scss';

export class Grade extends React.PureComponent<IGradeProps, GradeState> {
    private expandGradeFill(timeFraction: number): void {
        this.setState({
            fillRadiusPercentage: `${((1 - timeFraction) * Shared.totalPercentage).toFixed(Shared.percentageDecimalPlaceCutoff)}%`
        });
    }

    private onAnimationComplete(): void {
        this.setState({
            animator: undefined
        }, () => this.props.onUpdate({
            letterGrade: Math.min(this.props.letterGrade + 1, LetterGrade.f)
        }));
    }

    private getDuration(): number {
        return GradeState.durations[this.props.difficulty] - (GradeState.durationModifiers[this.props.difficulty] * this.props.stage);
    }

    private generateNewAnimator(): void {
        this.setState({
            animator: new Animator(this.getDuration(), this.expandGradeFill.bind(this), this.onAnimationComplete.bind(this))
        });
    }

    private destroyAnimator(): void {
        if (Shared.isDefined(this.state.animator)) {
            (this.state.animator as Animator).cancel();
        }
    }

    public readonly state: GradeState = new  GradeState();

    public componentDidUpdate(previousProps: IGradeProps): void {
        if (Shared.isDefined(this.state.animator) && this.props.gameMode !== previousProps.gameMode) {
            (this.state.animator as Animator).togglePaused();
        }

        if (!Shared.isDefined(this.state.animator) && this.props.letterGrade !== LetterGrade.f) {
            this.generateNewAnimator();
        }
    }

    public componentDidMount(): void {
        this.generateNewAnimator();
    }

    public componentWillUnmount(): void {
        this.destroyAnimator();
    }

    public render(): JSX.Element {
        const style: ICssStyle = {
            height: this.state.fillRadiusPercentage,
            width: this.state.fillRadiusPercentage
        };

        return <div className='grade-container'>
                    <div className='grade-letter-grade'>
                        {GradeState.letterGrades[this.props.letterGrade]}
                    </div>
                    <div className='grade-fill'
                        style={style}>
                    </div>
               </div>;
    }
}