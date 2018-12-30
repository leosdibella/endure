import * as React from 'react';
import { Animator } from '../classes/animator';
import { ComboState } from '../classes/comboState';
import { IComboProps } from '../interfaces/iComboProps';
import { ICssStyle } from '../interfaces/iCssStyle';
import { AnimationTiming, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';

import '../styles/combo.scss';

export class Combo extends React.PureComponent<IComboProps, ComboState> {
    private static readonly cssClassThresholdModifier: number = 3;
    private static readonly minimumViableCombo: number = 2;

    private adjustOverlay(timeFraction: number): void {
        this.setState({
            overlayClass: `combo-${Math.ceil(timeFraction * Combo.cssClassThresholdModifier)}`,
            overlayWidthPercentage: ((1 - timeFraction) * Shared.totalPercentage)
        });
    }

    private onAnimationComplete(): void {
        this.setState({
            overlayClass: '',
            overlayWidthPercentage: 0
        });

        this.props.onUpdate({
            dropCombo: true
        });
    }

    private getDuration(): number {
        return ComboState.durations[this.props.difficulty] - (ComboState.durationModifiers[this.props.difficulty] * this.props.stage);
    }

    private generateNewAnimator(): void {
        this.setState({
            animator: new Animator(this.getDuration(), this.adjustOverlay.bind(this), this.onAnimationComplete.bind(this), AnimationTiming.linear)
        });
    }

    private destroyAnimator(): void {
        if (Shared.isDefined(this.state.animator)) {
            (this.state.animator as Animator).cancel();
        }
    }

    public readonly state: ComboState = new  ComboState();

    public componentDidUpdate(previousProps: IComboProps): void {
        if (Shared.isDefined(this.state.animator) && this.props.gameMode !== previousProps.gameMode) {
            (this.state.animator as Animator).togglePaused();
        }

        if (this.props.combo >= Combo.minimumViableCombo && this.props.combo !== previousProps.combo) {
            this.destroyAnimator();
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
            width: `${ this.state.overlayWidthPercentage.toFixed(Shared.percentageDecimalPlaceCutoff)}%`
        };

        return <span className={`header-combo-container ${Theme[this.props.theme]} ${this.props.combo < Combo.minimumViableCombo ? ' hide' : ''}`}>
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