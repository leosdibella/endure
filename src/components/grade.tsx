import * as React from 'react';
import { Animator } from '../classes/animator';
import { GradeState } from '../classes/gradeState';
import { IGradeProps } from '../interfaces/iGradeProps';
import { GameMode, LetterGrade } from '../utilities/enum';
import * as Shared from '../utilities/shared';

import '../styles/grade.scss';

export class Grade extends React.PureComponent<IGradeProps, GradeState> {
    private onDrawAnimationFrame: (timeFraction: number) => void = this.drawAnimationFrame.bind(this);
    private onAnimationComplete: () => void = this.completeAnimation.bind(this);

    private drawAnimationFrame(timeFraction: number): void {
        this.setState({
            fillRadiusPercentage: `${((1 - timeFraction) * Shared.totalPercentage).toFixed(Shared.percentageDecimalPlaceCutoff)}%`
        });
    }

    private completeAnimation(): void {
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
            animator: new Animator(this.getDuration(), this.onDrawAnimationFrame, this.onAnimationComplete)
        }, (this.state.animator as Animator).start);
    }

    private stopAnimator(): void {
        if (Shared.isDefined(this.state.animator)) {
            (this.state.animator as Animator).stop();
        }
    }

    public readonly state: GradeState = new  GradeState();

    public componentDidUpdate(previousProps: IGradeProps): void {
        if (Shared.isDefined(this.state.animator)) {
            const animator: Animator = (this.state.animator as Animator);

            if (this.props.gameMode !== previousProps.gameMode) {
                this.props.gameMode === GameMode.paused ? animator.pause() : animator.start();
            } else if (this.props.letterGrade > previousProps.letterGrade && this.props.letterGrade < LetterGrade.f) {
                this.stopAnimator();
                this.generateNewAnimator();
            }
        }
    }

    public componentDidMount(): void {
        this.generateNewAnimator();
    }

    public componentWillUnmount(): void {
        this.stopAnimator();
    }

    public render(): JSX.Element {
        const style: React.CSSProperties = {
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