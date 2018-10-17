import * as React from 'react';
import '../../components/menuBar/menuBar.scss';
import { ViewModes } from '../../utilities/viewModes';
import { Utilities } from '../../utilities/utilities';
import { GameUpdates } from '../../components/game/game.component';

enum ComboClass {
    Healthy = 'healthy-combo',
    Warning = 'warning-combo',
    Danger = 'danger-combo'
};

const COMBO_CLASS_MAP: { [key: string]: string; } = {
    0: ComboClass.Danger,
    1: ComboClass.Warning,
    2: ComboClass.Healthy,
    3: ComboClass.Healthy
};

class CountDown {
    private seconds: number;
    private milliseconds: number;
    private menuBar: MenuBar;
    private interval: NodeJS.Timeout;

    constructor(menuBar: MenuBar) {
        this.menuBar = menuBar;
    };

    private readonly decrement = () => {
        if (this.menuBar.props.allowInteraction) {
            if (this.seconds === 0 && this.milliseconds === 0) {
                this.menuBar.props.onChanges({
                    combo: 0
                });
            } else {
                if (this.milliseconds === 0) {
                    --this.seconds;
                    this.milliseconds = 999;
                } else {
                    --this.milliseconds;
                }

                this.menuBar.setState({
                    countDown: this
                });
            }
        }

        if (this.menuBar.props.combo === 0) {
            if (Utilities.isWellDefinedValue(this.interval)) {
                clearInterval(this.interval);
            }
        }
    };

    reinitialize() {
        this.seconds = 3;
        this.milliseconds = 0;

        if (!Utilities.isWellDefinedValue(this.interval)) {
            this.interval = setInterval(this.decrement, 1);
        }
    };

    getCountDownParts() : number[] {
        return [
            this.seconds,
            this.milliseconds
        ];
    };
};

interface State {
    readonly countDown: CountDown;
}; 

export interface MenuBarProps {
    allowInteraction: boolean;
    viewMode: ViewModes.Mode;
    combo: number;
    score: number;
    readonly onChanges: (gameUpdates: GameUpdates) => void;
};

export class MenuBar extends React.Component<MenuBarProps, State> {
    readonly state: State;
    
    constructor(props: MenuBarProps) {
        super(props);

        this.state = {
            countDown: new CountDown(this)
        };

        this.state.countDown.reinitialize();
    };

    private getComboLayout() : JSX.Element {
        if (this.props.combo > 0) {
            const countDownParts = this.state.countDown.getCountDownParts();

            return <span className='menu-bar-combo-container'>
                <span>
                    Combo: x
                </span>
                <span className='menu-bar-combo'>
                    {this.props.combo}
                </span>
                <span className={'menu-bar-count-down ' + COMBO_CLASS_MAP[countDownParts[0]]}>
                    <span>
                        [
                    </span>
                    <span>
                        {countDownParts[0]}
                    </span>
                    <span>
                        .
                    </span>
                    <span>
                        {countDownParts[1]}
                    </span>
                    <span>
                        ]
                    </span>
                </span>
            </span>;
        }

        return <div></div>;
    };

    componentDidUpdate(previousProps: MenuBarProps) {
        if (this.props.combo > previousProps.combo) {
            this.state.countDown.reinitialize();
        }
    };

    render() {
        return <div className={'menu-bar ' + this.props.viewMode.baseClass}>
            {this.getComboLayout()}
            <span className='menu-bar-score'>
                {'Score: ' + this.props.score}
            </span>
        </div>;
    };
};