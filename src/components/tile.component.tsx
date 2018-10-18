import * as React from 'react';
import '../styles/tile.scss';
import { Colors } from '../utilities/colors';
import { Utilities } from '../utilities/utilities';

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
    row: number;
    column: number;

    constructor(id: string, colors: Colors.Color[], tileStyle: TileStyle, row: number, column: number) {
        this.id = id;
        this.colors = colors;
        this.tileStyle = tileStyle;
        this.row = row;
        this.column = column;
    }
};

export class Tile extends React.Component<TileProps, object> {
    constructor(props: TileProps) {
        super(props);
    }

    getClassName() {
        if (Utilities.isWellDefinedValue(this.props.colors)) {
            return 'tile-' + this.props.colors.map(color => color.toString())
                                              .reduce((previous, next) => previous + '-' + next);
        }

        return 'dead-tile';
    };

    render() {
        return <div className={this.getClassName()} style={this.props.tileStyle}>
        </div>
    };
};