import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/grade.scss';

export class Grade extends React.PureComponent<Utilities.Grade.IProps, Utilities.Grade.State> {
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
        return Utilities.Grade.durations[this.props.difficulty] - (Utilities.Grade.durationModifiers[this.props.difficulty] * this.props.stage);
    }

    readonly state: Utilities.Grade.State = new Utilities.Grade.State(this.expandGradeFill.bind(this), this.getDuration(), this.onAnimationComplete.bind(this));

    componentDidUpdate(previousProps: Utilities.Grade.IProps, previousState: Utilities.Grade.State): void {
        if (this.props.mode === Utilities.Game.Mode.paused) {
            this.state.animator.togglePaused();
        } else if (this.props.mode === Utilities.Game.Mode.inGame) {
            if (previousProps.mode === Utilities.Game.Mode.paused) {
                this.state.animator.togglePaused();
            } else if (this.props.letterGrade !== previousProps.letterGrade && this.props.letterGrade !== Utilities.App.LetterGrade.f) {
                this.state.animator.animate(this.getDuration());
            }
        } else {
            this.state.animator.cancel();
        }
    }

    render(): JSX.Element {
        const style: Utilities.General.ICssStyle = {
            height: this.state.fillRadiusPercentage,
            width: this.state.fillRadiusPercentage
        };

        return <div className={'grade-container ' + Utilities.App.Theme[this.props.theme]}>
                    <div className='grade-letter-grade'>
                        {Utilities.Grade.letterGrades[this.props.letterGrade]}
                    </div>
                    <div className='grade-fill'
                         style={style}>
                    </div>
               </div>;
    }
}