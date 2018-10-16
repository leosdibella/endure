import * as React from 'react';
import '../../components/game/game.scss';
import { Grid, GridProps} from '../../components/grid/grid.component';
import { ViewModes } from '../../utilities/viewModes';
import { MenuBar, MenuBarProps } from '../../components/menuBar/menuBar.component';

class State {
    allowInteraction: boolean = false;
    showLogo: boolean = true;
    viewMode: ViewModes.Mode = ViewModes.DARK_MODE;
    comboCount: number = 0;

    set setViewMode(viewMode: ViewModes.Mode) {
        this.viewMode = viewMode;
    }
}

const initialState: State = new State();

export class Game extends React.Component<object, State> {
    readonly state: State = initialState;

    readonly toggleInteraction = () : void => {
        this.setState({
            allowInteraction: !this.state.allowInteraction,
            showLogo: !this.state.showLogo
        });
    };

    getLogo() : JSX.Element {
        if (this.state.showLogo) {
            return <div className="logo-overlay" onClick={this.toggleInteraction}>
                <div className="logo-container">
                    <span className="logo-text">
                        e
                    </span>
                    <span className="logo-text">
                        n
                    </span>
                    <span className="logo-text">
                        d
                    </span>
                    <span className="logo-text"> 
                        u
                    </span>
                    <span className="logo-text">
                        r
                    </span>
                    <span className="logo-text">
                        e
                    </span>
                </div>
            </div>
        }

        return null;
    }

    constructor(props: object) {
        super(props);
    }

    render() {
        return <div className={'game ' + this.state.viewMode.baseClass}>
            {this.getLogo()}
            <MenuBar viewMode={this.state.viewMode} comboCount={this.state.comboCount}></MenuBar>
            <Grid viewMode={this.state.viewMode} allowInteraction={this.state.allowInteraction}></Grid>
        </div>;
    };
};