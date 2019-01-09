import * as React from 'react';
import { Animator } from '../classes/animator';
import { ComboState } from '../classes/comboState';
import { IComboProps } from '../interfaces/iComboProps';
import { GameMode } from '../utilities/enum';
import * as Shared from '../utilities/shared';

import '../styles/combo.scss';

export class Combo extends React.PureComponent<IComboProps, ComboState> {
    private static readonly cssClassThresholdModifier: number = 3;
    private static readonly minimumViableCombo: number = 2;

    private onStartAnimator: () => void = this.startAnimator.bind(this);
    private onDrawAnimationFrame: (timeFraction: number) => void = this.drawAnimationFrame.bind(this);
    private onAnimationComplete: () => void = this.completeAnimation.bind(this);

    private drawAnimationFrame(timeFraction: number): void {
        this.setState({
            overlayClass: `combo-${Math.ceil(timeFraction * Combo.cssClassThresholdModifier)}`,
            overlayWidthPercentage: ((1 - timeFraction) * Shared.totalPercentage)
        });
    }

    private completeAnimation(): void {
        this.setState({
            animator: undefined,
            overlayClass: '',
            overlayWidthPercentage: 0
        }, () => this.props.onUpdate({
            dropCombo: true
        }));
    }

    private getDuration(): number {
        return ComboState.durations[this.props.difficulty] - (ComboState.durationModifiers[this.props.difficulty] * this.props.stage);
    }

    private generateNewAnimator(): void {
        this.setState({
            animator: new Animator(this.getDuration(), this.onDrawAnimationFrame, this.onAnimationComplete)
        }, this.onStartAnimator);
    }

    private startAnimator(): void {
        if (Shared.isDefined(this.state.animator)) {
            (this.state.animator as Animator).start();
        }
    }

    private stopAnimator(): void {
        if (Shared.isDefined(this.state.animator)) {
            (this.state.animator as Animator).stop();
        }
    }

    public readonly state: ComboState = new  ComboState();

    public componentDidUpdate(previousProps: IComboProps): void {
        if (Shared.isDefined(this.state.animator) && this.props.gameMode !== previousProps.gameMode) {
            const animator: Animator = (this.state.animator as Animator);

            this.props.gameMode === GameMode.paused ? animator.pause() : animator.start();
        } else if (this.props.combo >= Combo.minimumViableCombo && this.props.combo !== previousProps.combo) {
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
        const style: React.CSSProperties = {
            width: `${ this.state.overlayWidthPercentage.toFixed(Shared.percentageDecimalPlaceCutoff)}%`
        };

        return <span className={`header-combo-container ${this.props.combo < Combo.minimumViableCombo ? ' hide' : ''}`}>
                    <div className='header-combo combo-bar-base'>
                        Combo: x{this.props.combo}
                    </div>
                    <div className={`header-combo combo-bar-overlay ${this.state.overlayClass}`}
                         style={style}>
                        Combo: x{this.props.combo}
                    </div>
               </span>;
    }
}