import * as React from 'react';
import '../../components/tile/tile.scss';
import { Colors } from '../../utilities/colors';

class State {
    readonly className: string;

    constructor (colors: Colors.Color[]) {
        this.className = 'tile-' + colors.map(color => color.name).reduce((previous, next) => previous + '-' + next);
    }
}

export class TileStyle {
    top: string;
    left: string;
    height: string;
    width: string;

    constructor(top: number, left: number, height: number, width: number) {
        this.top = top + 'px';
        this.left = left + 'px';
        this.height = height + 'px';
        this.width = width + 'px';
    }
}

export class TileProps {
    id: string;
    colors: Colors.Color[];
    tileStyle: TileStyle;

    constructor(id: string, colors: Colors.Color[], tileStyle: TileStyle) {
        this.id = id;
        this.colors = colors;
        this.tileStyle = tileStyle;
    }
};

export class Tile extends React.Component<TileProps, State> {
    readonly state: State;

    constructor(props: TileProps) {
        super(props);
        this.state = new State(this.props.colors);
    }

    render() {
        return <div className={this.state.className} style={this.props.tileStyle}>
        </div>
    };
};