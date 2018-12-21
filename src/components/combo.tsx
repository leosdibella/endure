import * as React from 'react';

import * as ComboUtilities from '../utilities/combo';
import * as GameUtilities from '../utilities/game';
import * as Shared from '../utilities/Shared';

import '../styles/combo.scss';

class Combo extends React.PureComponent<ComboUtilities.IProps, ComboUtilities.State> {
    private adjustOverlay(timeFraction: number): void {
        this.setState({
            overlayClass: ComboUtilities.State.getClassFromTimeFraction(timeFraction),
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
        return ComboUtilities.State.durations[this.props.difficulty] - (ComboUtilities.State.durationModifiers[this.props.difficulty] * this.props.stage);
    }

    public readonly state: ComboUtilities.State = new ComboUtilities.State(this.adjustOverlay.bind(this), this.getDuration(), this.onAnimationComplete.bind(this));

    public componentDidUpdate(previousProps: ComboUtilities.IProps): void {
        // TODO: Fix THIS
        if (this.props.mode === GameUtilities.Mode.paused) {
            this.state.animator.togglePaused();
        } else if (this.props.mode === GameUtilities.Mode.inGame) {
            if (previousProps.mode === GameUtilities.Mode.paused) {
                this.state.animator.togglePaused();
            } else if (this.props.combo >= ComboUtilities.State.minimumViableCombo && this.props.combo !== previousProps.combo) {
                this.state.animator.animate(this.getDuration());
            }
        } else {
            this.state.animator.cancel();
        }
    }

    public render(): JSX.Element {
        const style: Shared.ICssStyle = {
            width: `${ this.state.overlayWidthPercentage.toFixed(Shared.percentageDecimalPlaceCutoff)}%`
        };

        return <span className={`header-combo-container ${Shared.Theme[this.props.theme]} ${this.props.combo < ComboUtilities.State.minimumViableCombo ? ' hide' : ''}`}>
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

export {
    Combo
};