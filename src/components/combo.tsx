import * as React from 'react';
import { ComboState } from '../classes/comboState';
import { IComboProps } from '../interfaces/iComboProps';
import { ICssStyle } from '../interfaces/iCssStyle';
import { GameMode, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';

import '../styles/combo.scss';

export class Combo extends React.PureComponent<IComboProps, ComboState> {
    private adjustOverlay(timeFraction: number): void {
        this.setState({
            overlayClass: ComboState.getClassFromTimeFraction(timeFraction),
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

    public readonly state: ComboState = new  ComboState(); // ComboState(this.adjustOverlay.bind(this), this.getDuration(), this.onAnimationComplete.bind(this));

    /* public componentDidUpdate(previousProps: IComboProps): void {
        // TODO: Fix THIS
        if (this.props.gameMode === GameMode.paused) {
            this.state.animator.togglePaused();
        } else if (this.props.gameMode === GameMode.inGame) {
            if (previousProps.gameMode === GameMode.paused) {
                this.state.animator.togglePaused();
            } else if (this.props.combo >= ComboState.minimumViableCombo && this.props.combo !== previousProps.combo) {
                this.state.animator.animate();
            }
        } else {
            this.state.animator.cancel();
        }
    } */

    public render(): JSX.Element {
        const style: ICssStyle = {
            width: `${ this.state.overlayWidthPercentage.toFixed(Shared.percentageDecimalPlaceCutoff)}%`
        };

        return <span className={`header-combo-container ${Theme[this.props.theme]} ${this.props.combo < ComboState.minimumViableCombo ? ' hide' : ''}`}>
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