import * as React from 'react';
import { Animator } from '../classes/animator';
import { GradeState } from '../classes/gradeState';
import { ICssStyle } from '../interfaces/iCssStyle';
import { IGradeProps } from '../interfaces/iGradeProps';
import { AnimationTiming, Theme } from '../utilities/enum';
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

        this.generateNewAnimator();
    }

    private getDuration(): number {
        return GradeState.durations[this.props.difficulty] - (GradeState.durationModifiers[this.props.difficulty] * this.props.stage);
    }

    private generateNewAnimator(): void {
        this.setState({
            animator: new Animator(this.getDuration(), this.expandGradeFill.bind(this), this.onAnimationComplete.bind(this), AnimationTiming.linear)
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