import * as React from 'react';
import { Animator } from '../classes/animator';
import { GradeState } from '../classes/gradeState';
import { IGradeProps } from '../interfaces/iGradeProps';
import { GameMode, LetterGrade } from '../utilities/enum';
import * as Shared from '../utilities/shared';

import '../styles/grade.scss';

export class Grade extends React.PureComponent<IGradeProps, GradeState> {
    private onStartAnimator: () => void = this.startAnimator.bind(this);
    private onDrawAnimationFrame: (timeFraction: number) => void = this.drawAnimationFrame.bind(this);
    private onAnimationComplete: () => void = this.completeAnimation.bind(this);

    private drawAnimationFrame(timeFraction: number): void {
        this.setState({
            fillRadiusPercentage: ((1 - timeFraction) * Shared.totalPercentage)
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
        }, this.onStartAnimator);
    }

    private stopAnimator(): void {
        if (Shared.isDefined(this.state.animator)) {
            (this.state.animator as Animator).stop();
        }
    }

    private startAnimator(): void {
        if (Shared.isDefined(this.state.animator)) {
            (this.state.animator as Animator).start();
        }
    }

    public readonly state: GradeState = new  GradeState();

    public componentDidUpdate(previousProps: IGradeProps): void {
        if (Shared.isDefined(this.state.animator) && this.props.gameMode !== previousProps.gameMode) {
            const animator: Animator = (this.state.animator as Animator);

            this.props.gameMode === GameMode.paused ? animator.pause() : animator.start();
        }

        if (this.props.letterGrade !== previousProps.letterGrade && this.props.letterGrade < LetterGrade.f) {
            this.stopAnimator();
            this.generateNewAnimator();
        }
    }

    public componentDidMount(): void {
        this.generateNewAnimator();
    }

    public componentWillUnmount(): void {
        this.stopAnimator();
    }

    public render(): JSX.Element {
        const fillRadiusPercentage: string = `${this.state.fillRadiusPercentage.toFixed(Shared.percentageDecimalPlaceCutoff)}%`,
              style: React.CSSProperties = {
                  height: fillRadiusPercentage,
                  width: fillRadiusPercentage
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