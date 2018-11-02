import * as React from 'react';
import '../styles/combo.scss';

interface State {
    readonly timer: Utilities.General.Timer;
    milliseconds: number;
};

interface Props {
    combo: number;
    gradeIndex: Utilities.Game.GradeIndex;
    stage: number;
    difficulty: Utilities.Game.Difficulty;
    mode: Utilities.Game.Mode;
    readonly onUpdate: (updates: Utilities.Game.Updates) => void;
};

export class Combo extends React.PureComponent<Props, State> {
    private decrementInterval: number = 17;
    private milliseconds: number = 0;
    private interval: NodeJS.Timeout;

    constructor(props: Props) {
        super(props);
    };

    private readonly decrement = () => {
        if (this.topBar.props.mode === Utilities.Game.Mode.inGame) {
            this.milliseconds -= Utilities.Combo.decrementInterval;

            if (this.milliseconds <= 0) {
                this.milliseconds = 0;

                this.topBar.props.onChanges({
                    dropCombo: true
                });

                this.disable();
            } else {
                this.topBar.setState({
                    countDown: this
                });
            }
        }

        if (this.topBar.props.combo < CountDown.minimumViableCombo) {
            this.disable();
        }
    };

    reinitialize() {
        if (this.topBar.props.combo >= CountDown.minimumViableCombo) {
            this.milliseconds = 3000;

            if (!Utilities.General.isWellDefinedValue(this.interval)) {
                this.interval = setInterval(this.decrement, CountDown.decrementInterval);
            }
        }
    };

    disable() : void {
        this.milliseconds = 0;

        if (Utilities.General.isWellDefinedValue(this.interval)) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    };

    componentDidUpdate(previousProps: Props, previousState: State) : void {

    };

    render() : JSX.Element {
        const seconds: number = Math.floor(this.milliseconds / Utilities.Combo.millisecondsPerSecond),
              milliseconds = this.milliseconds - (seconds * Utilities.Combo.millisecondsPerSecond);

        return <span className={'top-bar-combo-container'}>
                    <span className='top-bar-combo'>
                        Combo: x
                    </span>
                    <span className='top-bar-combo'>
                        {this.props.combo}
                    </span>
                    <span className={'top-bar-count-down ' + Utilities.Combo.classMap[seconds]}>
                        <span>
                            [
                        </span>
                        <span>
                            {seconds}
                        </span>
                        <span>
                            .
                        </span>
                        <span>
                            {milliseconds}
                        </span>
                        <span>
                            ]
                        </span> 
                    </span>
              </span>;
    };
};