import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/combo.scss';

export class Combo extends React.PureComponent<Utilities.Combo.IProps, Utilities.Combo.State> {
    private adjustOverlay(timeFraction: number) : void {
        this.setState({
            overlayWidthPercentage: ((1 - timeFraction) * 100).toFixed(2) + '%',
            overlayClass: Utilities.Combo.getClassFromTimeFraction(timeFraction)
        });
    };

    private onAnimationComplete() : void {
        this.setState({
            overlayWidthPercentage: undefined,
            overlayClass: ''
        });

        this.props.onUpdate({
            dropCombo: true
        });
    };

    private getDuration() : number {
        return Utilities.Combo.durations[this.props.difficulty] - (Utilities.Combo.durationModifiers[this.props.difficulty] * this.props.stage);
    };

    readonly state: Utilities.Combo.State = new Utilities.Combo.State(this.adjustOverlay, this.getDuration(), this.onAnimationComplete);

    componentDidUpdate(previousProps: Utilities.Combo.IProps, previousState: Utilities.Combo.State) : void {
        if (this.props.mode === Utilities.Game.Mode.paused) {
            this.state.animator.togglePaused();
        } else if (this.props.mode === Utilities.Game.Mode.inGame) {
            if (previousProps.mode === Utilities.Game.Mode.paused) {
                this.state.animator.togglePaused();
            } else if (this.props.combo >= Utilities.Combo.minimumViableCombo && this.props.combo !== previousProps.combo) {
                this.state.animator.animate(this.getDuration());
            }
        } else {
            this.state.animator.cancel();
        }
    };
    
    render() : JSX.Element {
        const style: Utilities.General.ICssStyle = {
            width: this.state.overlayWidthPercentage
        };

        return <span className={'top-bar-combo-container ' + Utilities.App.Theme[this.props.theme] + (!Utilities.General.isWellDefinedValue(this.state.overlayWidthPercentage) ? ' hide': '')}>
                    <div className='top-bar-combo combo-bar-base'>
                        Combo: x{this.props.combo}
                    </div>
                    <div className={'top-bar-combo combo-bar-overlay ' + this.state.overlayClass}
                         style={style}>
                        Combo: x{this.props.combo}
                    </div>
              </span>;
    };
};