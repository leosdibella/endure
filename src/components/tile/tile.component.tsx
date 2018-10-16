import * as React from 'react';
import '../../components/tile/tile.scss';
import { Colors } from '../../utilities/colors';

export class TileProps {
    className?: string;
    colors?: Colors.Color[];
    row?: number;
    column?: number;
};

export class Tile extends React.Component<TileProps, object> {
    constructor(props: TileProps) {
        super(props);
    }

    render() {
        const className = 'tile-' + this.props.colors.map(color => color.name).reduce((previous, next) => previous + '-' + next);

        return <div className={className}></div>
    };
};