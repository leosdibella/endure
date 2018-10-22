import * as React from 'react';
import '../styles/tile.scss';
import { Utilities } from '../utilities/utilities';

interface Props {
    colors: Utilities.Grid.Color[];
    row: number;
    column: number;
    onUpdate: (row: number, column: number) => void;
};

export class Tile extends React.Component<Props, object> {
    constructor(props: Props) {
        super(props);
    };

    private getClassName() : string {
        if (Utilities.General.isWellDefinedValue(this.props.colors)) {
            return 'tile-' + this.props.colors.map(color => color.toString())
                                              .reduce((previous, next) => previous + '-' + next);
        }

        return 'tile-annihilated';
    };

    private getStyle() : Utilities.General.CssStyle {
        return {
            top: (this.props.row * Utilities.Grid.numberOfTilesHigh) +'px',
            left: (this.props.column * Utilities.Grid.numberOfTilesWide) + 'px'
        };
    };

    private readonly onClick = (event: React.MouseEvent<HTMLDivElement>) : void => {
        this.props.onUpdate(this.props.row, this.props.column);
    };

    shouldComponentUpdate(nextProps: Props, nextState: object) : boolean {
        return this.props.colors !== nextProps.colors
            || this.props.row !== nextProps.row
            || this.props.column !== nextProps.column;
    };

    render() : JSX.Element {
        return <div className={this.getClassName()}
                    style={this.getStyle()}
                    onClick={this.onClick}>
               </div>;
    };
};