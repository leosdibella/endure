import * as React from 'react';

import * as AppUtilities from '../utilities/app';
import * as ComboUtilities from '../utilities/combo';
import * as GameUtilities from '../utilities/game';
import * as GeneralUtilities from '../utilities/general';

import '../styles/combo.scss';

class Combo extends React.PureComponent<ComboUtilities.IProps, ComboUtilities.State> {
    private adjustOverlay(timeFraction: number): void {
        this.setState({
            overlayClass: ComboUtilities.getClassFromTimeFraction(timeFraction),
            overlayWidthPercentage: ((1 - timeFraction) * 100)
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
        return ComboUtilities.durations[this.props.difficulty] - (ComboUtilities.durationModifiers[this.props.difficulty] * this.props.stage);
    }

    public readonly state: ComboUtilities.State = new ComboUtilities.State(this.adjustOverlay.bind(this), this.getDuration(), this.onAnimationComplete.bind(this));

    public componentDidUpdate(previousProps: ComboUtilities.IProps): void {
        if (this.props.mode === GameUtilities.Mode.paused) {
            this.state.animator.togglePaused();
        } else if (this.props.mode === GameUtilities.Mode.inGame) {
            if (previousProps.mode === GameUtilities.Mode.paused) {
                this.state.animator.togglePaused();
            } else if (this.props.combo >= ComboUtilities.minimumViableCombo && this.props.combo !== previousProps.combo) {
                this.state.animator.animate(this.getDuration());
            }
        } else {
            this.state.animator.cancel();
        }
    }

    public render(): JSX.Element {
        const style: GeneralUtilities.ICssStyle = {
            width: this.state.overlayWidthPercentage.toFixed(2) + '%'
        };

        return <span className={'header-combo-container ' + AppUtilities.Theme[this.props.theme] + (this.props.combo < ComboUtilities.minimumViableCombo ? ' hide' : '')}>
                    <div className='header-combo combo-bar-base'>
                        Combo: x{this.props.combo}
                    </div>
                    <div className={'header-combo combo-bar-overlay ' + this.state.overlayClass}
                         style={style}>
                        Combo: x{this.props.combo}
                    </div>
               </span>;
    }
}

export {
    Combo
};